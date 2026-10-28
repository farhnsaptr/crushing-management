import type { RawProductionRecord } from '../analytics/analytics.service';
import type { ParsedCsvRowDto } from '../runner-material/runnerMaterial.service';
import type { CrussingBudomariRecord } from './crussing.client';

/** Parse 'Cibitung=SC1,Karawang=SC2' menjadi Map lokasi internal -> kode API. */
export function parseLocationMap(raw: string): Map<string, string> {
 const map = new Map<string, string>();
 for (const pair of String(raw || '').split(',')) {
 const [key, value] = pair.split('=').map((part) => part.trim());
 if (key && value) map.set(key, value);
 }
 return map;
}

export function resolveExternalLocation(map: Map<string, string>, location: string): string | null {
 return map.get(location) || null;
}

/** Total 5 komponen persentase Budomari dari satu record API. */
export function pctTotal(record: CrussingBudomariRecord): number {
 return (
 (Number(record.ok_use_pct) || 0) +
 (Number(record.ng_loss_pct) || 0) +
 (Number(record.runner_pct) || 0) +
 (Number(record.dango_pct) || 0) +
 (Number(record.dango_part_pct) || 0)
 );
}

export function mapToRawProductionRecord(record: CrussingBudomariRecord): RawProductionRecord {
 const hasPct = pctTotal(record) > 0;
 const pct = (value: number | null | undefined) => (hasPct ? Number(value) || 0 : null);

 return {
 date: String(record.date || '').slice(0, 10),
 factory: record.factory || undefined,
 tonase: record.tonnage || undefined,
 sebango: String(record.sebango || '').trim(),
 shift: record.shift || 'D',
 mesin: record.machine_no || undefined,
 act_total: Number(record.act_total_pcs) || 0,
 act_ok: Number(record.act_ok_pcs) || 0,
 ng_total: Number(record.ng_total_pcs) || 0,
 // Kompatibilitas chart lama: budomari_pct diisi nilai OK use.
 budomari_pct: hasPct ? Number(record.ok_use_pct) || 0 : null,
 ok_use_pct: pct(record.ok_use_pct),
 ng_loss_pct: pct(record.ng_loss_pct),
 runner_pct: pct(record.runner_pct),
 dango_pct: pct(record.dango_pct),
 dango_part_pct: pct(record.dango_part_pct),
 };
}

export function mapToRunnerRow(record: CrussingBudomariRecord): ParsedCsvRowDto | null {
 const date = String(record.date || '').slice(0, 10);
 const sebango = String(record.sebango || '').trim();
 const actTotal = Number(record.act_total_pcs) || 0;

 if (!date || !sebango || actTotal <= 0) return null;

 return {
 date,
 sebango_code: sebango,
 shift: record.shift || 'D',
 act_total_pcs: actTotal,
 };
}
