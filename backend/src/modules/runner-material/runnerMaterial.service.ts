import { randomUUID } from 'crypto';
import XLSX from 'xlsx';
import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';

export interface ParsedCsvRowDto {
  date: string;
  sebango_code: string;
  shift: string;
  act_total_pcs: number;
}

export interface MaterialRunnerSaveItemDto {
  material_id?: string | null;
  material_name: string;
  shift?: 'Pagi' | 'Malam';
  total_pcs: number;
  total_runner_weight_kg: number;
  transaction_date?: string;
}

function normalizeShift(s?: string): 'Pagi' | 'Malam' {
  if (!s) return 'Pagi';
  const clean = s.trim().toUpperCase();
  if (clean === 'N' || clean === 'MALAM' || clean === 'NIGHT') return 'Malam';
  return 'Pagi';
}

/**
 * Standardizes various date formats (DD-MM-YYYY, YYYY-MM-DD, Excel serial date) to YYYY-MM-DD.
 */
function formatStandardDate(val: any): string {
  if (!val) return '';
  if (typeof val === 'number') {
    // Excel serial date code
    const utcDays = Math.floor(val - 25569);
    const date = new Date(utcDays * 86400 * 1000);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(val).trim();
  // Check DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  // Check YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return s;
}

/**
 * Loads master_materials lookup from the system database.
 * If user or part specifies a material name that differs from master_materials,
 * the canonical name in master_materials is always used.
 */
async function getMasterMaterialsLookup() {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, material_name, recycle_type FROM master_materials'
  );

  const byId = new Map<string, { id: string; material_name: string }>();
  const byNormalized = new Map<string, { id: string; material_name: string }>();

  for (const r of rows) {
    const entry = { id: r.id, material_name: r.material_name };
    byId.set(r.id, entry);

    // Normalize: lowercase, trim, strip spaces, dashes, underscores, slashes
    const normKey = r.material_name.trim().toLowerCase().replace(/[\s\-_/]/g, '');
    byNormalized.set(normKey, entry);
  }

  const resolve = (materialId?: string | null, rawName?: string | null): { id: string | null; name: string } => {
    // 1. Check by ID first
    if (materialId && byId.has(materialId)) {
      const found = byId.get(materialId)!;
      return { id: found.id, name: found.material_name };
    }

    // 2. Check by rawName against master_materials
    if (rawName && rawName.trim()) {
      const trimmed = rawName.trim();
      const normKey = trimmed.toLowerCase().replace(/[\s\-_/]/g, '');
      if (byNormalized.has(normKey)) {
        const found = byNormalized.get(normKey)!;
        return { id: found.id, name: found.material_name };
      }

      // Check substring match if length >= 3: e.g. "PP B200" matches "PP-B200"
      for (const [key, entry] of byNormalized.entries()) {
        if (normKey.length >= 3 && (key === normKey || key.includes(normKey) || normKey.includes(key))) {
          return { id: entry.id, name: entry.material_name };
        }
      }

      return { id: null, name: trimmed };
    }

    return { id: null, name: 'Unassigned Material' };
  };

  return { byId, byNormalized, resolve };
}

export class RunnerMaterialService {
  /**
   * Parses file buffer (XLSX, XLS, or CSV) into standardized ParsedCsvRowDto array.
   */
  static parseFileBuffer(fileBuffer: Buffer, originalFilename?: string): ParsedCsvRowDto[] {
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    } catch (err: any) {
      throw new Error(
        `Sistem tidak dapat membaca file ${originalFilename || ''}. Harap pastikan file tidak corrupt dan berformat .xlsx, .xls, atau .csv.`
      );
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('File tidak memiliki lembar kerja (worksheet).');
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (!rawRows || rawRows.length === 0) {
      throw new Error('File kosong atau tidak memiliki baris data.');
    }

    // Inspect first row keys to find column names
    const sampleRow = rawRows[0];
    const keys = Object.keys(sampleRow);

    const findKey = (possibleNames: string[]): string | undefined => {
      const lowerNames = possibleNames.map((n) => n.toLowerCase());
      return keys.find((k) => lowerNames.includes(k.replace(/[\r\n]+/g, ' ').trim().toLowerCase()));
    };

    const dateKey = findKey(['PRODUCTION DATE', 'DATE', 'TANGGAL', 'TGL PRODUKSI', 'PROD DATE']);
    const sebangoKey = findKey(['SEBANGO', 'KODE SEBANGO', 'SEBANGO CODE', 'SEBANGO_CODE']);
    const shiftKey = findKey(['SHIFT']);
    const actTotalKey = findKey(['ACTUAL TOTAL (PCS)', 'ACT TOTAL', 'ACTUAL TOTAL', 'ACT_TOTAL', 'TOTAL']);

    if (!sebangoKey || !actTotalKey) {
      throw new Error(
        'Format file tidak valid. Pastikan header memuat kolom "SEBANGO" dan "ACTUAL TOTAL (PCS)" atau "ACT TOTAL".'
      );
    }

    const result: ParsedCsvRowDto[] = [];

    for (const r of rawRows) {
      const rawSebango = String(r[sebangoKey] || '').trim();
      const rawActTotal = parseInt(String(r[actTotalKey] || '0').replace(/,/g, ''), 10);
      if (!rawSebango || isNaN(rawActTotal) || rawActTotal <= 0) {
        continue;
      }

      const rawDate = dateKey ? r[dateKey] : '';
      const stdDate = formatStandardDate(rawDate);
      const rawShift = shiftKey ? String(r[shiftKey] || '').trim() : '';

      result.push({
        date: stdDate,
        sebango_code: rawSebango,
        shift: rawShift,
        act_total_pcs: rawActTotal,
      });
    }

    return result;
  }

  /**
   * Process raw CSV/Excel parsed rows, aggregate shift D & N per (sebango, shift),
   * match against master parts, calculate runner weight, and group by (material, shift).
   * Supports optional selectedDate filter for monthly files spanning multiple dates.
   */
  static async previewImport(parsedRows: ParsedCsvRowDto[], selectedDate?: string) {
    if (!parsedRows || parsedRows.length === 0) {
      throw new Error('Data file kosong atau tidak valid.');
    }

    // 1. Analyze all available unique dates in the dataset
    const dateCountMap = new Map<string, number>();
    for (const r of parsedRows) {
      const d = r.date ? r.date.trim() : '';
      if (d) {
        dateCountMap.set(d, (dateCountMap.get(d) || 0) + 1);
      }
    }

    const availableDates = Array.from(dateCountMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date)); // Newest date first

    // Determine target date & filter rows accordingly
    let targetDate = '';
    let rowsToProcess = parsedRows;

    const isDateValid = selectedDate && (selectedDate === 'all' || availableDates.some((d) => d.date === selectedDate));

    if (selectedDate && selectedDate !== 'all' && isDateValid) {
      targetDate = selectedDate;
      rowsToProcess = parsedRows.filter((r) => r.date === selectedDate);
    } else if (selectedDate === 'all') {
      targetDate = availableDates.length > 0 ? availableDates[0].date : new Date().toISOString().substring(0, 10);
      rowsToProcess = parsedRows;
    } else {
      // Default: if multi-date file, select all dates by default
      if (availableDates.length > 1) {
        targetDate = availableDates[0].date;
        rowsToProcess = parsedRows;
        selectedDate = 'all';
      } else if (availableDates.length === 1) {
        targetDate = availableDates[0].date;
        rowsToProcess = parsedRows;
        selectedDate = availableDates[0].date;
      } else {
        targetDate = new Date().toISOString().substring(0, 10);
        rowsToProcess = parsedRows;
      }
    }

    // 2. Aggregate ACT TOTAL per (date, sebango_code, shift)
    const sebangoShiftMap = new Map<string, { date: string; sebango_code: string; shift: 'Pagi' | 'Malam'; total_pcs: number }>();
    const uniqueSebangosSet = new Set<string>();

    for (const row of rowsToProcess) {
      const cleanSebango = (row.sebango_code || '').trim();
      const pcs = Number(row.act_total_pcs) || 0;
      if (!cleanSebango || pcs <= 0) continue;

      uniqueSebangosSet.add(cleanSebango);

      const normShift = normalizeShift(row.shift);
      const rowDate = (row.date && row.date.trim()) || targetDate || new Date().toISOString().substring(0, 10);
      const key = `${rowDate}__${cleanSebango}__${normShift}`;

      const existing = sebangoShiftMap.get(key) || {
        date: rowDate,
        sebango_code: cleanSebango,
        shift: normShift,
        total_pcs: 0,
      };
      existing.total_pcs += pcs;
      sebangoShiftMap.set(key, existing);
    }

    if (sebangoShiftMap.size === 0) {
      throw new Error('Tidak ada data sebango valid dengan ACT TOTAL > 0 untuk tanggal yang dipilih.');
    }

    // 3. Fetch active master parts for matching
    const [partRows] = await pool.query<RowDataPacket[]>(
      `SELECT mp.id AS master_part_id, mp.sebango_code, mp.part_number, mp.part_name,
              mp.material_id, mp.material, mp.berat_runner_gr, mm.material_name AS master_material_name
       FROM master_parts mp
       LEFT JOIN master_materials mm ON mp.material_id = mm.id
       WHERE mp.is_active = TRUE`
    );

    const matLookup = await getMasterMaterialsLookup();

    // Index master parts by sebango_code
    const masterPartMap = new Map<string, RowDataPacket>();
    for (const part of partRows) {
      masterPartMap.set(part.sebango_code.trim(), part);
    }

    interface MaterialGroup {
      material_id: string | null;
      material_name: string;
      shift: 'Pagi' | 'Malam';
      transaction_date: string;
      total_pcs: number;
      total_runner_weight_kg: number;
      sebango_count: number;
      sebango_details: Array<{
        sebango_code: string;
        part_number: string;
        part_name: string;
        act_pcs: number;
        berat_runner_gr: number;
        runner_weight_kg: number;
        shift: 'Pagi' | 'Malam';
        date?: string;
      }>;
    }

    const materialMap = new Map<string, MaterialGroup>();
    const unmatchedSebangosMap = new Map<string, { sebango_code: string; act_pcs: number; shift: string; reason: string }>();

    for (const [, aggregated] of sebangoShiftMap.entries()) {
      const matchedPart = masterPartMap.get(aggregated.sebango_code);

      if (!matchedPart) {
        const existingUnmatched = unmatchedSebangosMap.get(aggregated.sebango_code) || {
          sebango_code: aggregated.sebango_code,
          act_pcs: 0,
          shift: aggregated.shift,
          reason: 'Kode Sebango tidak ditemukan dalam Master Parts sistem',
        };
        existingUnmatched.act_pcs += aggregated.total_pcs;
        unmatchedSebangosMap.set(aggregated.sebango_code, existingUnmatched);
        continue;
      }

      // Resolve official material name: prioritize master_materials table in system database
      const resolvedMat = matLookup.resolve(
        matchedPart.material_id,
        matchedPart.master_material_name || matchedPart.material
      );
      const materialName = resolvedMat.name;
      const materialId = resolvedMat.id;
      const beratRunnerGr = Number(matchedPart.berat_runner_gr) || 0;
      const runnerWeightKg = Number(((aggregated.total_pcs * beratRunnerGr) / 1000).toFixed(2));

      // Group per (date, material, shift) to guarantee each production date retains its true transaction date
      const groupKey = `${aggregated.date}__${materialName}__${aggregated.shift}`;

      const existingMat: MaterialGroup = materialMap.get(groupKey) || {
        material_id: materialId,
        material_name: materialName,
        shift: aggregated.shift,
        transaction_date: aggregated.date,
        total_pcs: 0,
        total_runner_weight_kg: 0,
        sebango_count: 0,
        sebango_details: [],
      };

      existingMat.total_pcs += aggregated.total_pcs;
      existingMat.total_runner_weight_kg = Number((existingMat.total_runner_weight_kg + runnerWeightKg).toFixed(2));
      existingMat.sebango_count += 1;
      existingMat.sebango_details.push({
        sebango_code: aggregated.sebango_code,
        part_number: matchedPart.part_number,
        part_name: matchedPart.part_name,
        act_pcs: aggregated.total_pcs,
        berat_runner_gr: beratRunnerGr,
        runner_weight_kg: runnerWeightKg,
        shift: aggregated.shift,
        date: aggregated.date,
      });

      materialMap.set(groupKey, existingMat);
    }

    const matchedMaterials = Array.from(materialMap.values());
    // Sort descending by transaction_date (newest date first), then material name, then shift
    matchedMaterials.sort((a, b) => {
      const dateCmp = b.transaction_date.localeCompare(a.transaction_date);
      if (dateCmp !== 0) return dateCmp;
      const matCmp = a.material_name.localeCompare(b.material_name);
      if (matCmp !== 0) return matCmp;
      return a.shift.localeCompare(b.shift);
    });

    const unmatchedSebangos = Array.from(unmatchedSebangosMap.values());
    const grandTotalRunnerKg = Number(matchedMaterials.reduce((acc, curr) => acc + curr.total_runner_weight_kg, 0).toFixed(2));

    return {
      transaction_date: targetDate,
      batch_ref: `batch_runner_${Date.now()}`,
      selected_date: selectedDate || (availableDates.length > 1 ? 'all' : targetDate),
      available_dates: availableDates,
      matched_materials: matchedMaterials,
      unmatched_sebangos: unmatchedSebangos,
      summary: {
        total_rows: rowsToProcess.length,
        total_file_rows: parsedRows.length,
        unique_sebangos: uniqueSebangosSet.size,
        matched_sebangos: Math.max(0, uniqueSebangosSet.size - unmatchedSebangos.length),
        unmatched_sebangos: unmatchedSebangos.length,
        total_materials: matchedMaterials.length,
        total_runner_weight_kg: grandTotalRunnerKg,
      },
    };
  }

  /**
   * Save confirmed runner material aggregated records into runner_material_transactions.
   * Supports individual item-level transaction_date or default transactionDate.
   * Enforces master_materials names from database if any differences exist.
   */
  static async saveRecords(
    materialItems: MaterialRunnerSaveItemDto[],
    transactionDate: string,
    batchRef?: string
  ) {
    if (!materialItems || materialItems.length === 0) {
      throw new Error('Tidak ada data material runner yang akan disimpan.');
    }

    const matLookup = await getMasterMaterialsLookup();
    const importBatch = batchRef || `batch_runner_${Date.now()}`;
    const defaultDate = transactionDate && transactionDate !== 'all'
      ? transactionDate
      : new Date().toISOString().substring(0, 10);
    let successCount = 0;

    for (const item of materialItems) {
      const id = randomUUID();
      // Ensure the official material name from database master_materials is used
      const resolvedMat = matLookup.resolve(item.material_id, item.material_name);
      const matId = resolvedMat.id;
      const matName = resolvedMat.name;
      const normShift = normalizeShift(item.shift);
      const pcs = Number(item.total_pcs) || 0;
      const weightKg = Number(item.total_runner_weight_kg) || 0;
      const itemDate = (item.transaction_date && item.transaction_date !== 'all')
        ? item.transaction_date
        : defaultDate;

      await pool.query(
        `INSERT INTO runner_material_transactions
         (id, material_id, material_name_snapshot, total_pcs, total_runner_weight_kg, transaction_date, shift, import_batch_ref)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, matId, matName, pcs, weightKg, itemDate, normShift, importBatch]
      );
      successCount++;
    }

    return {
      batchRef: importBatch,
      savedCount: successCount,
      transactionDate,
    };
  }

  /**
   * List paginated runner material transactions.
   */
  static async listRecords(page: number = 1, limit: number = 20, startDate?: string, endDate?: string) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (startDate && endDate) {
      whereClause += ' AND transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM runner_material_transactions ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT rmt.*
       FROM runner_material_transactions rmt
       ${whereClause}
       ORDER BY rmt.transaction_date DESC, rmt.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      records: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Update an individual runner material transaction record by ID.
   * Resolves material name against master_materials database.
   */
  static async updateRecord(
    id: string,
    payload: {
      material_name_snapshot?: string;
      shift?: 'Pagi' | 'Malam';
      total_pcs?: number;
      total_runner_weight_kg?: number;
      transaction_date?: string;
    }
  ) {
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM runner_material_transactions WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      throw new Error('Record runner material tidak ditemukan.');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (payload.material_name_snapshot !== undefined) {
      const matLookup = await getMasterMaterialsLookup();
      const resolvedMat = matLookup.resolve(undefined, payload.material_name_snapshot);
      updates.push('material_name_snapshot = ?');
      params.push(resolvedMat.name);
      if (resolvedMat.id) {
        updates.push('material_id = ?');
        params.push(resolvedMat.id);
      }
    }
    if (payload.shift !== undefined) {
      updates.push('shift = ?');
      params.push(normalizeShift(payload.shift));
    }
    if (payload.total_pcs !== undefined) {
      updates.push('total_pcs = ?');
      params.push(Number(payload.total_pcs) || 0);
    }
    if (payload.total_runner_weight_kg !== undefined) {
      updates.push('total_runner_weight_kg = ?');
      params.push(Number(payload.total_runner_weight_kg) || 0);
    }
    if (payload.transaction_date !== undefined) {
      updates.push('transaction_date = ?');
      params.push(payload.transaction_date);
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(
        `UPDATE runner_material_transactions SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    return { id, ...payload };
  }

  /**
   * Delete an individual runner material transaction record by ID.
   */
  static async deleteRecord(id: string) {
    const [result] = await pool.query<any>(
      'DELETE FROM runner_material_transactions WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Record runner material tidak ditemukan.');
    }

    return { id, deleted: true };
  }

  /**
   * Rollback / delete all runner material transactions associated with a specific batch reference.
   */
  static async rollbackBatch(batchRef: string) {
    if (!batchRef || !batchRef.trim()) {
      throw new Error('Referensi batch (batchRef) wajib disertakan untuk rollback.');
    }

    const [result] = await pool.query<any>(
      'DELETE FROM runner_material_transactions WHERE import_batch_ref = ?',
      [batchRef.trim()]
    );

    return {
      batchRef: batchRef.trim(),
      deletedCount: result.affectedRows,
    };
  }

  /**
   * Get list of unique batches with summary metadata for rollback UI.
   */
  static async listBatches() {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        import_batch_ref,
        COUNT(*) AS total_records,
        SUM(total_runner_weight_kg) AS total_weight_kg,
        SUM(total_pcs) AS total_pcs,
        MIN(transaction_date) AS min_date,
        MAX(transaction_date) AS max_date,
        MAX(created_at) AS created_at
       FROM runner_material_transactions
       WHERE import_batch_ref IS NOT NULL AND import_batch_ref != ''
       GROUP BY import_batch_ref
       ORDER BY created_at DESC
       LIMIT 100`
    );

    return rows.map((r) => ({
      batch_ref: r.import_batch_ref,
      total_records: Number(r.total_records) || 0,
      total_weight_kg: Number(Number(r.total_weight_kg || 0).toFixed(2)),
      total_pcs: Number(r.total_pcs) || 0,
      min_date: r.min_date,
      max_date: r.max_date,
      created_at: r.created_at,
    }));
  }

  /**
   * Delete all runner material transaction records (Super-Admin only).
   */
  static async deleteAllRecords() {
    const [result] = await pool.query<any>('DELETE FROM runner_material_transactions');
    return { deletedCount: result.affectedRows };
  }

  /**
   * Get sorted summary list of runner materials for analytics view.
   */
  static async getMaterialAnalyticsSummary(year: number, month?: number) {
    let whereClause = 'WHERE YEAR(transaction_date) = ?';
    const params: any[] = [year];

    if (month && month >= 1 && month <= 12) {
      whereClause += ' AND MONTH(transaction_date) = ?';
      params.push(month);
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        material_name_snapshot AS material_name,
        material_id,
        SUM(total_runner_weight_kg) AS total_runner_weight_kg,
        COUNT(*) AS total_transactions,
        MAX(transaction_date) AS last_transaction_date
       FROM runner_material_transactions
       ${whereClause}
       GROUP BY material_name_snapshot, material_id
       ORDER BY total_runner_weight_kg DESC`,
      params
    );

    const grandTotalKg = rows.reduce((sum, r) => sum + Number(r.total_runner_weight_kg || 0), 0);

    const materials = rows.map((r, index) => {
      const weightKg = Number(r.total_runner_weight_kg || 0);
      const percentage = grandTotalKg > 0 ? (weightKg / grandTotalKg) * 100 : 0;

      return {
        rank: index + 1,
        material_name: r.material_name,
        material_id: r.material_id || null,
        total_runner_weight_kg: weightKg,
        total_transactions: Number(r.total_transactions || 0),
        last_transaction_date: r.last_transaction_date,
        percentage: Number(percentage.toFixed(1)),
      };
    });

    return {
      year,
      month: month || null,
      grandTotalKg: Number(grandTotalKg.toFixed(2)),
      totalMaterialsCount: materials.length,
      materials,
    };
  }

  /**
   * Get daily trend chart (with shift Pagi & Malam breakdown) & transaction history for a specific material.
   */
  static async getMaterialAnalyticsDetail(materialName: string, year: number, month?: number) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const qMonth = month && month >= 1 && month <= 12 ? month : new Date().getMonth() + 1;

    // 1. Monthly trend breakdown
    const [trendRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        MONTH(transaction_date) AS month_num,
        SUM(total_runner_weight_kg) AS total_runner_weight_kg
       FROM runner_material_transactions
       WHERE material_name_snapshot = ? AND YEAR(transaction_date) = ?
       GROUP BY MONTH(transaction_date)
       ORDER BY month_num ASC`,
      [materialName, year]
    );

    const trendMap = new Map<number, number>();
    trendRows.forEach((r) => {
      trendMap.set(Number(r.month_num), Number(r.total_runner_weight_kg || 0));
    });

    const monthlyTrend = monthNames.map((name, idx) => {
      const monthNum = idx + 1;
      return {
        month: name,
        monthNum,
        total_runner_weight_kg: Number((trendMap.get(monthNum) || 0).toFixed(2)),
      };
    });

    // 2. Daily breakdown for selected month (with Shift Pagi & Shift Malam)
    const [dailyRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DAY(transaction_date) AS day_num,
        shift,
        SUM(total_runner_weight_kg) AS total_kg
       FROM runner_material_transactions
       WHERE material_name_snapshot = ? AND YEAR(transaction_date) = ? AND MONTH(transaction_date) = ?
       GROUP BY DAY(transaction_date), shift
       ORDER BY day_num ASC`,
      [materialName, year, qMonth]
    );

    const daysInMonth = new Date(year, qMonth, 0).getDate();
    const dailyMap = new Map<number, { pagi_kg: number; malam_kg: number }>();

    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap.set(d, { pagi_kg: 0, malam_kg: 0 });
    }

    for (const r of dailyRows) {
      const dayNum = Number(r.day_num);
      const entry = dailyMap.get(dayNum) || { pagi_kg: 0, malam_kg: 0 };
      const weight = Number(r.total_kg) || 0;

      if (r.shift === 'Malam') {
        entry.malam_kg += weight;
      } else {
        entry.pagi_kg += weight;
      }
      dailyMap.set(dayNum, entry);
    }

    const dailyTrend = Array.from(dailyMap.entries()).map(([dayNum, data]) => {
      const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
      const pagiKg = Number(data.pagi_kg.toFixed(2));
      const malamKg = Number(data.malam_kg.toFixed(2));
      const totalKg = Number((pagiKg + malamKg).toFixed(2));

      return {
        day: dayStr,
        day_num: dayNum,
        pagi_kg: pagiKg,
        malam_kg: malamKg,
        total_kg: totalKg,
      };
    });

    // 3. Transaction history list for this material & month
    const [transactions] = await pool.query<RowDataPacket[]>(
      `SELECT *
       FROM runner_material_transactions
       WHERE material_name_snapshot = ? AND YEAR(transaction_date) = ? AND MONTH(transaction_date) = ?
       ORDER BY transaction_date DESC, created_at DESC`,
      [materialName, year, qMonth]
    );

    const totalWeightKg = transactions.reduce((sum, r) => sum + Number(r.total_runner_weight_kg || 0), 0);

    return {
      materialName,
      year,
      month: qMonth,
      totalWeightKg: Number(totalWeightKg.toFixed(2)),
      totalTransactions: transactions.length,
      dailyTrend,
      monthlyTrend,
      transactions,
    };
  }
}
