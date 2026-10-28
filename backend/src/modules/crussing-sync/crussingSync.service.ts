import { randomUUID } from 'crypto';
import { RowDataPacket } from 'mysql2';
import { pool } from '../../config/database';
import { env } from '../../config/env.config';
import { AnalyticsService } from '../analytics/analytics.service';
import type { RawProductionRecord } from '../analytics/analytics.service';
import { RunnerMaterialService } from '../runner-material/runnerMaterial.service';
import type { ParsedCsvRowDto } from '../runner-material/runnerMaterial.service';
import { CrussingApiError, fetchBudomari } from './crussing.client';
import {
 mapToRawProductionRecord,
 mapToRunnerRow,
 parseLocationMap,
 resolveExternalLocation,
} from './crussing.mapper';
import { resolveSebango } from '../../utils/sebango.util';

export type SyncStatus = 'success' | 'partial' | 'failed';

export interface UnmatchedSebangoItem {
  code: string;
  raw: string;
  count: number;
  total_pcs: number;
  part_no?: string;
  material_name?: string;
  reason: string;
}

interface SyncScope {
 location: 'Cibitung' | 'Karawang';
 external_location: string;
 date_from: string;
 date_to: string;
}

const running = new Set<string>();

// ponytail: lock in-memory cukup untuk 1 container. Kalau backend di-scale >1 replika,
// ganti dengan GET_LOCK() MySQL agar sync tidak dobel antar instance.
function pad2(value: number): string {
 return String(value).padStart(2, '0');
}

function buildRange(year: number, month?: number) {
 const y = Number(year);
 if (!Number.isInteger(y) || y < 2000 || y > 2100) {
 throw new CrussingApiError('Tahun tidak valid.', 400);
 }

 if (month === undefined || month === null || (month as any) === '') {
 return { date_from: `${y}-01-01`, date_to: `${y}-12-31` };
 }

 const m = Number(month);
 if (!Number.isInteger(m) || m < 1 || m > 12) {
 throw new CrussingApiError('Bulan tidak valid.', 400);
 }

 const lastDay = new Date(y, m, 0).getDate();
 return {
 date_from: `${y}-${pad2(m)}-01`,
 date_to: `${y}-${pad2(m)}-${pad2(lastDay)}`,
 };
}

function resolveScope(location: string, year: number, month?: number): SyncScope {
 if (location !== 'Cibitung' && location !== 'Karawang') {
 throw new CrussingApiError('Lokasi harus Cibitung atau Karawang.', 400);
 }

 const externalLocation = resolveExternalLocation(
 parseLocationMap(env.CRUSSING_LOCATION_MAP),
 location
 );
 if (!externalLocation) {
 throw new CrussingApiError(
 `Lokasi "${location}" belum dipetakan ke Crusing API. Isi CRUSSING_LOCATION_MAP.`,
 400
 );
 }

 return { location, external_location: externalLocation, ...buildRange(year, month) };
}

async function deleteApiAnalytics(scope: SyncScope, db: any): Promise<void> {
 await db.query(
 `DELETE pai FROM production_analytics_items pai
 JOIN production_analytics_batches pab ON pab.id = pai.batch_id
 WHERE pab.source = 'crussing_api'
 AND pab.external_location = ?
 AND pai.production_date BETWEEN ? AND ?`,
 [scope.external_location, scope.date_from, scope.date_to]
 );

 // Bersihkan batch API lama yang itemnya sudah tidak tersisa.
 await db.query(
 `DELETE pab FROM production_analytics_batches pab
 WHERE pab.source = 'crussing_api'
 AND pab.external_location = ?
 AND NOT EXISTS (
 SELECT 1 FROM production_analytics_items pai WHERE pai.batch_id = pab.id
 )`,
 [scope.external_location]
 );
}

async function replaceAnalytics(scope: SyncScope, records: RawProductionRecord[], userId?: string | null) {
 const connection = await pool.getConnection();
 try {
 await connection.beginTransaction();
 await deleteApiAnalytics(scope, connection);

 let result: any = null;
 if (records.length > 0) {
 result = await AnalyticsService.importProductionReport(
 {
 filename: `CRUSSING_API:${scope.external_location}:${scope.date_from}:${scope.date_to}`,
 batch_name: `Crusing API ${scope.location} ${scope.date_from} s/d ${scope.date_to}`,
 records,
 source: 'crussing_api',
 source_ref: `${scope.external_location}:${scope.date_from}:${scope.date_to}`,
 external_location: scope.external_location,
 allow_empty: true,
 },
 userId,
 connection
 );
 }

 await connection.commit();
 return result;
 } catch (error) {
 await connection.rollback();
 throw error;
 } finally {
 connection.release();
 }
}

async function replaceRunner(scope: SyncScope, rows: ParsedCsvRowDto[]) {
 const batchRef = `CRUSSING-API:${scope.external_location}:${scope.date_from}:${scope.date_to}`;
 const options = {
 location: scope.location,
 replaceScope: { date_from: scope.date_from, date_to: scope.date_to },
 };

 if (rows.length === 0) {
 const saved = await RunnerMaterialService.saveRecords([], scope.date_from, batchRef, options);
 return { rows: saved.savedCount, totalKg: 0, unmatched: [] as string[] };
 }

 const preview = await RunnerMaterialService.previewImport(rows);
 const items = preview.matched_materials.map((material) => ({
 material_id: material.material_id || null,
 material_name: material.material_name,
 shift: material.shift || 'Pagi',
 total_pcs: material.total_pcs,
 total_runner_weight_kg: material.total_runner_weight_kg,
 transaction_date: material.transaction_date || preview.transaction_date,
 }));

 const saved = await RunnerMaterialService.saveRecords(items, scope.date_from, batchRef, options);

 return {
 rows: saved.savedCount,
 totalKg: preview.summary.total_runner_weight_kg,
 unmatched: preview.unmatched_sebangos.map((row) => row.sebango_code),
 };
}

async function upsertSuccessState(
 scope: SyncScope,
 data: {
 status: SyncStatus;
 records_received: number;
 analytics_rows: number;
 runner_rows: number;
 unmatched_sebangos: number;
 unmatched_details?: UnmatchedSebangoItem[];
 },
 userId?: string | null
): Promise<void> {
 const detailsJson = data.unmatched_details ? JSON.stringify(data.unmatched_details) : null;
 await pool.query(
 `INSERT INTO crussing_sync_state
 (id, location, external_location, date_from, date_to, last_status, last_success_at, last_attempt_at, records_received, analytics_rows, runner_rows, unmatched_sebangos, unmatched_details, last_error, updated_by)
 VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, NULL, ?)
 ON DUPLICATE KEY UPDATE
 last_status = VALUES(last_status),
 last_success_at = NOW(),
 last_attempt_at = NOW(),
 records_received = VALUES(records_received),
 analytics_rows = VALUES(analytics_rows),
 runner_rows = VALUES(runner_rows),
 unmatched_sebangos = VALUES(unmatched_sebangos),
 unmatched_details = VALUES(unmatched_details),
 last_error = NULL,
 updated_by = VALUES(updated_by)`,
 [
 randomUUID(),
 scope.location,
 scope.external_location,
 scope.date_from,
 scope.date_to,
 data.status,
 data.records_received,
 data.analytics_rows,
 data.runner_rows,
 data.unmatched_sebangos,
 detailsJson,
 userId || null,
 ]
 );
}

async function upsertFailedState(scope: SyncScope, message: string, userId?: string | null): Promise<void> {
 await pool.query(
 `INSERT INTO crussing_sync_state
 (id, location, external_location, date_from, date_to, last_status, last_attempt_at, last_error, updated_by)
 VALUES (?, ?, ?, ?, ?, 'failed', NOW(), ?, ?)
 ON DUPLICATE KEY UPDATE
 last_status = 'failed',
 last_attempt_at = NOW(),
 last_error = VALUES(last_error),
 updated_by = VALUES(updated_by)`,
 [
 randomUUID(),
 scope.location,
 scope.external_location,
 scope.date_from,
 scope.date_to,
 message,
 userId || null,
 ]
 );
}

export async function syncCrussing(
 location: string,
 year: number,
 month?: number,
 userId?: string | null
) {
 const scope = resolveScope(location, year, month);
 const lockKey = `${scope.location}|${scope.date_from}|${scope.date_to}`;

 if (running.has(lockKey)) {
 throw new CrussingApiError('Sinkronisasi periode ini sedang berjalan.', 409);
 }

 running.add(lockKey);
 const startedAt = Date.now();

 try {
 const records = await fetchBudomari(scope.external_location, scope.date_from, scope.date_to);

 // Mapping dilakukan sekali agar analytics & runner memakai sumber yang sama.
 const analyticsRecords = records.map(mapToRawProductionRecord);
 const runnerRows = records.map(mapToRunnerRow).filter((row): row is NonNullable<typeof row> => !!row);

 const analyticsResult = await replaceAnalytics(scope, analyticsRecords, userId);
 const runnerResult = await replaceRunner(scope, runnerRows);

 const masterMap = await loadMasterMap();
 const unmatchedDetails = resolveUnmatchedFromRecords(records, masterMap);
 const unmatched = new Set<string>(unmatchedDetails.map((u) => u.code));

 const status: SyncStatus = unmatched.size > 0 ? 'partial' : 'success';

 await upsertSuccessState(
 scope,
 {
 status,
 records_received: records.length,
 analytics_rows: Number(analyticsResult?.matched_rows) || 0,
 runner_rows: runnerResult.rows,
 unmatched_sebangos: unmatched.size,
 unmatched_details: unmatchedDetails,
 },
 userId
 );

 const warnings: string[] = [];
 if (records.length === 0) {
 warnings.push('API mengembalikan 0 record untuk periode ini.');
 }
 if (unmatched.size > 0) {
 warnings.push(`${unmatched.size} SEBANGO tidak cocok dengan Master Parts dan di-skip.`);
 }

 return {
 location: scope.location,
 external_location: scope.external_location,
 date_from: scope.date_from,
 date_to: scope.date_to,
 synced_at: new Date().toISOString(),
 duration_ms: Date.now() - startedAt,
 last_status: status,
 records_received: records.length,
 analytics: {
 rows: Number(analyticsResult?.matched_rows) || 0,
 allowance_kg: Number(analyticsResult?.total_allowance_kg) || 0,
 unmatched_rows: Number(analyticsResult?.unmatched_rows) || 0,
 },
 runner: {
 rows: runnerResult.rows,
 total_kg: runnerResult.totalKg,
 },
 unmatched_sebangos: Array.from(unmatched),
 warnings,
 };
 } catch (error) {
 const message = (error as Error).message || 'Gagal sinkronisasi Crusing API.';
 try {
 await upsertFailedState(scope, message, userId);
 } catch (stateError) {
 console.error('[CrussingSync] Gagal menyimpan status gagal:', stateError);
 }
 throw error;
 } finally {
 running.delete(lockKey);
 }
}

export async function getCrussingStatus(
 location: string,
 year: number,
 month?: number
) {
 const range = buildRange(year, month);
 const externalLocation = resolveExternalLocation(
 parseLocationMap(env.CRUSSING_LOCATION_MAP),
 location
 );

 const base = {
 location,
 external_location: externalLocation,
 date_from: range.date_from,
 date_to: range.date_to,
 mapped: !!externalLocation,
 };

 if (!externalLocation) {
 return {
 ...base,
 last_status: null,
 last_success_at: null,
 last_attempt_at: null,
 records_received: 0,
 analytics_rows: 0,
 runner_rows: 0,
 unmatched_sebangos: 0,
 last_error: null,
 manual_overlap: { analytics_rows: 0, runner_rows: 0 },
 };
 }

 const [rows] = await pool.query<RowDataPacket[]>(
 `SELECT * FROM crussing_sync_state
 WHERE location = ? AND date_from = ? AND date_to = ?
 LIMIT 1`,
 [location, range.date_from, range.date_to]
 );

 const [analyticsOverlap] = await pool.query<RowDataPacket[]>(
 `SELECT COUNT(*) AS total
 FROM production_analytics_items pai
 JOIN production_analytics_batches pab ON pab.id = pai.batch_id
 JOIN master_parts mp ON pai.master_part_id = mp.id
 JOIN machines mc ON mp.machine_id = mc.id
 JOIN factories fc ON mc.factory_id = fc.id
 WHERE pab.source = 'manual_upload'
 AND pai.production_date BETWEEN ? AND ?
 AND fc.location = ?`,
 [range.date_from, range.date_to, location]
 );

 const [runnerOverlap] = await pool.query<RowDataPacket[]>(
 `SELECT COUNT(*) AS total
 FROM runner_material_transactions
 WHERE location IS NULL
 AND transaction_date BETWEEN ? AND ?`,
 [range.date_from, range.date_to]
 );

 const state = rows[0] || {};

 return {
 ...base,
 last_status: state.last_status || null,
 last_success_at: state.last_success_at || null,
 last_attempt_at: state.last_attempt_at || null,
 records_received: Number(state.records_received) || 0,
 analytics_rows: Number(state.analytics_rows) || 0,
 runner_rows: Number(state.runner_rows) || 0,
 unmatched_sebangos: Number(state.unmatched_sebangos) || 0,
 last_error: state.last_error || null,
 manual_overlap: {
 analytics_rows: Number(analyticsOverlap[0]?.total) || 0,
 runner_rows: Number(runnerOverlap[0]?.total) || 0,
 },
 };
}

async function loadMasterMap(): Promise<Map<string, any[]>> {
 const [parts]: any = await pool.query('SELECT sebango_code FROM master_parts');
 const masterMap = new Map<string, any[]>();
 for (const p of parts) {
  if (!masterMap.has(p.sebango_code)) masterMap.set(p.sebango_code, []);
  masterMap.get(p.sebango_code)!.push(p);
 }
 return masterMap;
}

function resolveUnmatchedFromRecords(
 records: any[],
 masterMap: Map<string, any[]>
): UnmatchedSebangoItem[] {
 const unmatchedMap = new Map<string, UnmatchedSebangoItem>();

 for (const r of records) {
  const rawSebango = r.sebango || r.SEBANGO;
  if (!rawSebango) continue;
  const res = resolveSebango(rawSebango, masterMap);

  for (const m of res.missing) {
   if (!unmatchedMap.has(m)) {
    unmatchedMap.set(m, {
     code: m,
     raw: rawSebango,
     count: 0,
     total_pcs: 0,
     part_no: (r.part_no || r.PART_NO || '-').trim(),
     material_name: (r.material_name || r.MATERIAL_NAME || '-').trim(),
     reason: 'Tidak terdaftar di Master Parts',
    });
   }
   const item = unmatchedMap.get(m)!;
   item.count++;
   item.total_pcs += Number(r.act_total_pcs || r.ACT_TOTAL_PCS) || 0;
  }

  for (const a of res.ambiguous) {
   if (!unmatchedMap.has(a)) {
    unmatchedMap.set(a, {
     code: a,
     raw: rawSebango,
     count: 0,
     total_pcs: 0,
     part_no: (r.part_no || r.PART_NO || '-').trim(),
     material_name: (r.material_name || r.MATERIAL_NAME || '-').trim(),
     reason: 'Duplikat di Master Parts',
    });
   }
   const item = unmatchedMap.get(a)!;
   item.count++;
   item.total_pcs += Number(r.act_total_pcs || r.ACT_TOTAL_PCS) || 0;
  }
 }

 return Array.from(unmatchedMap.values()).sort((a, b) => b.count - a.count);
}

export async function getUnmatchedSebangos(
 location: string,
 year: number,
 month?: number
) {
 const scope = resolveScope(location, year, month);

 const [rows] = await pool.query<RowDataPacket[]>(
  `SELECT unmatched_details, unmatched_sebangos
   FROM crussing_sync_state
   WHERE location = ? AND date_from = ? AND date_to = ?
   LIMIT 1`,
  [scope.location, scope.date_from, scope.date_to]
 );

 const state = rows[0];
 let items: UnmatchedSebangoItem[] = [];

 if (state?.unmatched_details) {
  try {
   items = typeof state.unmatched_details === 'string'
    ? JSON.parse(state.unmatched_details)
    : state.unmatched_details;
  } catch {
   items = [];
  }
 } else if (state && state.unmatched_sebangos > 0) {
  // Lazy resolve & cache for legacy synced records
  const masterMap = await loadMasterMap();
  const records = await fetchBudomari(scope.external_location, scope.date_from, scope.date_to);
  items = resolveUnmatchedFromRecords(records, masterMap);

  await pool.query(
   `UPDATE crussing_sync_state
    SET unmatched_details = ?, unmatched_sebangos = ?
    WHERE location = ? AND date_from = ? AND date_to = ?`,
   [JSON.stringify(items), items.length, scope.location, scope.date_from, scope.date_to]
  );
 }

 const totalRows = items.reduce((sum, item) => sum + (item.count || 0), 0);
 const totalPcs = items.reduce((sum, item) => sum + (item.total_pcs || 0), 0);

 return {
  location: scope.location,
  external_location: scope.external_location,
  date_from: scope.date_from,
  date_to: scope.date_to,
  total_unmatched_codes: items.length,
  total_unmatched_rows: totalRows,
  total_unmatched_pcs: totalPcs,
  items,
 };
}
