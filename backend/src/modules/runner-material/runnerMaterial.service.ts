import { randomUUID } from 'crypto';
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
}

function normalizeShift(s?: string): 'Pagi' | 'Malam' {
  if (!s) return 'Pagi';
  const clean = s.trim().toUpperCase();
  if (clean === 'N' || clean === 'MALAM' || clean === 'NIGHT') return 'Malam';
  return 'Pagi';
}

export class RunnerMaterialService {
  /**
   * Process raw CSV parsed rows, aggregate shift D & N per (sebango, shift),
   * match against master parts, calculate runner weight, and group by (material, shift).
   */
  static async previewImport(parsedRows: ParsedCsvRowDto[]) {
    if (!parsedRows || parsedRows.length === 0) {
      throw new Error('Data CSV kosong atau tidak valid.');
    }

    // 1. Determine dominant production date from CSV rows
    const firstValidDate = parsedRows.find((r) => r.date && r.date.trim() !== '')?.date || new Date().toISOString().substring(0, 10);

    // 2. Aggregate ACT TOTAL per (sebango_code, shift)
    const sebangoShiftMap = new Map<string, { sebango_code: string; shift: 'Pagi' | 'Malam'; total_pcs: number; dates: Set<string> }>();

    for (const row of parsedRows) {
      const cleanSebango = (row.sebango_code || '').trim();
      const pcs = Number(row.act_total_pcs) || 0;
      if (!cleanSebango || pcs <= 0) continue;

      const normShift = normalizeShift(row.shift);
      const key = `${cleanSebango}__${normShift}`;

      const existing = sebangoShiftMap.get(key) || {
        sebango_code: cleanSebango,
        shift: normShift,
        total_pcs: 0,
        dates: new Set(),
      };
      existing.total_pcs += pcs;
      if (row.date) existing.dates.add(row.date.trim());
      sebangoShiftMap.set(key, existing);
    }

    if (sebangoShiftMap.size === 0) {
      throw new Error('Tidak ada data sebango valid dengan ACT TOTAL > 0 dalam file CSV.');
    }

    // 3. Fetch active master parts for matching
    const [partRows] = await pool.query<RowDataPacket[]>(
      `SELECT mp.id AS master_part_id, mp.sebango_code, mp.part_number, mp.part_name,
              mp.material_id, mp.material, mp.berat_runner_gr, mm.material_name AS master_material_name
       FROM master_parts mp
       LEFT JOIN master_materials mm ON mp.material_id = mm.id
       WHERE mp.is_active = TRUE`
    );

    // Index master parts by sebango_code
    const masterPartMap = new Map<string, RowDataPacket>();
    for (const part of partRows) {
      masterPartMap.set(part.sebango_code.trim(), part);
    }

    interface MaterialGroup {
      material_id: string | null;
      material_name: string;
      shift: 'Pagi' | 'Malam';
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
      }>;
    }

    const materialMap = new Map<string, MaterialGroup>();
    const unmatchedSebangosMap = new Map<string, { sebango_code: string; act_pcs: number; shift: string; reason: string }>();

    for (const [key, aggregated] of sebangoShiftMap.entries()) {
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

      // Material Name precedence: master_materials name -> master_parts material snapshot -> 'Unassigned Material'
      const materialName = matchedPart.master_material_name || matchedPart.material || 'Unassigned Material';
      const materialId = matchedPart.material_id || null;
      const beratRunnerGr = Number(matchedPart.berat_runner_gr) || 0;
      const runnerWeightKg = Number(((aggregated.total_pcs * beratRunnerGr) / 1000).toFixed(3));

      const groupKey = `${materialName}__${aggregated.shift}`;

      const existingMat: MaterialGroup = materialMap.get(groupKey) || {
        material_id: materialId,
        material_name: materialName,
        shift: aggregated.shift,
        total_pcs: 0,
        total_runner_weight_kg: 0,
        sebango_count: 0,
        sebango_details: [],
      };

      existingMat.total_pcs += aggregated.total_pcs;
      existingMat.total_runner_weight_kg = Number((existingMat.total_runner_weight_kg + runnerWeightKg).toFixed(3));
      existingMat.sebango_count += 1;
      existingMat.sebango_details.push({
        sebango_code: aggregated.sebango_code,
        part_number: matchedPart.part_number,
        part_name: matchedPart.part_name,
        act_pcs: aggregated.total_pcs,
        berat_runner_gr: beratRunnerGr,
        runner_weight_kg: runnerWeightKg,
        shift: aggregated.shift,
      });

      materialMap.set(groupKey, existingMat);
    }

    const matchedMaterials = Array.from(materialMap.values());
    const unmatchedSebangos = Array.from(unmatchedSebangosMap.values());
    const grandTotalRunnerKg = Number(matchedMaterials.reduce((acc, curr) => acc + curr.total_runner_weight_kg, 0).toFixed(3));

    return {
      transaction_date: firstValidDate,
      batch_ref: `batch_runner_${Date.now()}`,
      matched_materials: matchedMaterials,
      unmatched_sebangos: unmatchedSebangos,
      summary: {
        total_csv_rows: parsedRows.length,
        unique_sebangos: sebangoShiftMap.size,
        matched_sebangos: sebangoShiftMap.size - unmatchedSebangos.length,
        unmatched_sebangos: unmatchedSebangos.length,
        total_materials: matchedMaterials.length,
        total_runner_weight_kg: grandTotalRunnerKg,
      },
    };
  }

  /**
   * Save confirmed runner material aggregated records into runner_material_transactions.
   */
  static async saveRecords(
    materialItems: MaterialRunnerSaveItemDto[],
    transactionDate: string,
    batchRef?: string
  ) {
    if (!materialItems || materialItems.length === 0) {
      throw new Error('Tidak ada data material runner yang akan disimpan.');
    }

    const importBatch = batchRef || `batch_runner_${Date.now()}`;
    let successCount = 0;

    for (const item of materialItems) {
      const id = randomUUID();
      const matId = item.material_id || null;
      const matName = item.material_name.trim();
      const normShift = normalizeShift(item.shift);
      const pcs = Number(item.total_pcs) || 0;
      const weightKg = Number(item.total_runner_weight_kg) || 0;

      await pool.query(
        `INSERT INTO runner_material_transactions
         (id, material_id, material_name_snapshot, total_pcs, total_runner_weight_kg, transaction_date, shift, import_batch_ref)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, matId, matName, pcs, weightKg, transactionDate, normShift, importBatch]
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
      updates.push('material_name_snapshot = ?');
      params.push(payload.material_name_snapshot.trim());
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
      grandTotalKg: Number(grandTotalKg.toFixed(3)),
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
        total_runner_weight_kg: Number((trendMap.get(monthNum) || 0).toFixed(3)),
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
      const pagiKg = Number(data.pagi_kg.toFixed(3));
      const malamKg = Number(data.malam_kg.toFixed(3));
      const totalKg = Number((pagiKg + malamKg).toFixed(3));

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
      totalWeightKg: Number(totalWeightKg.toFixed(3)),
      totalTransactions: transactions.length,
      dailyTrend,
      monthlyTrend,
      transactions,
    };
  }
}
