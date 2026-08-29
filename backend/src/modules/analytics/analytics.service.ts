import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';

export interface RawProductionRecord {
  date: string; // YYYY-MM-DD
  factory?: string;
  tonase?: string;
  sebango: string;
  shift?: string;
  operator?: string;
  mesin?: string;
  act_total?: number | string;
  act_ok?: number | string;
  ng_total?: number | string;
}

export interface ImportProductionReportPayload {
  filename: string;
  batch_name?: string;
  records: RawProductionRecord[];
}

export class AnalyticsService {
  /**
   * Preview and analyze production report CSV records before committing.
   */
  static async previewProductionReport(payload: { records: RawProductionRecord[] }) {
    const { records } = payload;
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('Data laporan produksi kosong atau tidak valid.');
    }

    // 1. Clean and normalize records
    const cleanedRecords = records
      .map((r) => {
        const rawDate = String(r.date || '').trim();
        const rawSebango = String(r.sebango || '').trim();
        const rawShift = String(r.shift || 'D').toUpperCase().trim();
        const normalizedShift: 'Pagi' | 'Malam' =
          rawShift === 'N' || rawShift === 'MALAM' ? 'Malam' : 'Pagi';

        return {
          date: rawDate,
          factory: String(r.factory || '').trim(),
          tonase: String(r.tonase || '').trim(),
          sebango: rawSebango,
          shift: normalizedShift,
          operator: String(r.operator || '').trim(),
          mesin: String(r.mesin || '').trim(),
          act_total: Math.max(0, parseInt(String(r.act_total || 0), 10) || 0),
          act_ok: Math.max(0, parseInt(String(r.act_ok || 0), 10) || 0),
          ng_total: Math.max(0, parseInt(String(r.ng_total || 0), 10) || 0),
        };
      })
      .filter((r) => r.date && r.sebango);

    if (cleanedRecords.length === 0) {
      throw new Error('Tidak ada baris yang valid dengan Tanggal dan Sebango yang lengkap.');
    }

    // 2. Count Sebango occurrences per Date (Dynamic Shikake Calculation)
    const sebangoDateCountMap = new Map<string, number>();
    for (const r of cleanedRecords) {
      const key = `${r.date}__${r.sebango.toUpperCase()}`;
      sebangoDateCountMap.set(key, (sebangoDateCountMap.get(key) || 0) + 1);
    }

    // 3. Load Master Parts lookup
    const [partRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, sebango_code, part_number, part_name, berat_part_gr, shikake, material
       FROM master_parts
       WHERE is_active = TRUE`
    );

    const partMap = new Map<string, any>();
    for (const p of partRows) {
      if (p.sebango_code) {
        partMap.set(String(p.sebango_code).toUpperCase().trim(), p);
      }
    }

    // 4. Match & preview items
    let totalEstimatedAllowanceKg = 0;
    let matchedCount = 0;
    let unmatchedCount = 0;
    let minDate = cleanedRecords[0].date;
    let maxDate = cleanedRecords[0].date;

    const uniqueSebangos = new Set<string>();
    const matchedSebangos = new Set<string>();
    const unmatchedSebangos = new Set<string>();

    const previewItems = cleanedRecords.map((r, idx) => {
      if (r.date < minDate) minDate = r.date;
      if (r.date > maxDate) maxDate = r.date;

      const upperSebango = r.sebango.toUpperCase();
      uniqueSebangos.add(upperSebango);

      const countKey = `${r.date}__${upperSebango}`;
      const dynamicShikake = Math.max(1, sebangoDateCountMap.get(countKey) || 1);

      const masterPart = partMap.get(upperSebango) || null;
      const isMatched = !!masterPart;

      let beratPartGr = 0;
      let partNumber: string | null = null;
      let partName: string | null = null;
      let allowanceKg = 0;

      if (masterPart) {
        matchedCount++;
        matchedSebangos.add(upperSebango);
        partNumber = masterPart.part_number;
        partName = masterPart.part_name;
        beratPartGr = Number(masterPart.berat_part_gr) || 0;
        allowanceKg = beratPartGr > 0
          ? Number(((3 * (beratPartGr / 1000)) / dynamicShikake).toFixed(3))
          : 0;
        totalEstimatedAllowanceKg += allowanceKg;
      } else {
        unmatchedCount++;
        unmatchedSebangos.add(upperSebango);
      }

      return {
        row_number: idx + 1,
        date: r.date,
        shift: r.shift,
        factory: r.factory,
        tonase: r.tonase,
        mesin: r.mesin,
        sebango: r.sebango,
        act_total: r.act_total,
        act_ok: r.act_ok,
        ng_total: r.ng_total,
        is_matched: isMatched,
        part_number: partNumber,
        part_name: partName,
        berat_part_gr: beratPartGr,
        calculated_shikake: dynamicShikake,
        allowance_kg: allowanceKg,
        status: isMatched ? 'matched' : 'unmatched',
        status_message: isMatched
          ? 'Cocok'
          : 'Sebango tidak terdaftar di Master Part (Akan di-skip)',
      };
    });

    totalEstimatedAllowanceKg = Number(totalEstimatedAllowanceKg.toFixed(3));

    return {
      summary: {
        total_rows: cleanedRecords.length,
        matched_rows: matchedCount,
        unmatched_rows: unmatchedCount,
        match_rate_percentage: cleanedRecords.length > 0
          ? Number(((matchedCount / cleanedRecords.length) * 100).toFixed(1))
          : 0,
        total_estimated_allowance_kg: totalEstimatedAllowanceKg,
        min_date: minDate,
        max_date: maxDate,
        unique_sebangos_count: uniqueSebangos.size,
        matched_sebangos_count: matchedSebangos.size,
        unmatched_sebangos_count: unmatchedSebangos.size,
        unmatched_sebango_codes: Array.from(unmatchedSebangos),
      },
      items: previewItems,
    };
  }

  /**
   * Import production report CSV records, compute dynamic shikake and allowance per item.
   * Unmatched Sebangos are automatically skipped.
   */
  static async importProductionReport(
    payload: ImportProductionReportPayload,
    userId?: string | null
  ) {
    const { filename, batch_name, records } = payload;
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('Data laporan produksi kosong atau tidak valid.');
    }

    // 1. Clean and normalize records
    const cleanedRecords = records
      .map((r) => {
        const rawDate = String(r.date || '').trim();
        const rawSebango = String(r.sebango || '').trim();
        const rawShift = String(r.shift || 'D').toUpperCase().trim();
        const normalizedShift: 'Pagi' | 'Malam' =
          rawShift === 'N' || rawShift === 'MALAM' ? 'Malam' : 'Pagi';

        return {
          date: rawDate,
          factory: String(r.factory || '').trim(),
          tonase: String(r.tonase || '').trim(),
          sebango: rawSebango,
          shift: normalizedShift,
          mesin: String(r.mesin || '').trim(),
          act_total: Math.max(0, parseInt(String(r.act_total || 0), 10) || 0),
          act_ok: Math.max(0, parseInt(String(r.act_ok || 0), 10) || 0),
          ng_total: Math.max(0, parseInt(String(r.ng_total || 0), 10) || 0),
        };
      })
      .filter((r) => r.date && r.sebango);

    if (cleanedRecords.length === 0) {
      throw new Error('Tidak ada baris yang valid dengan Tanggal dan Sebango yang lengkap.');
    }

    // 2. Count Sebango occurrences per Date (Dynamic Shikake Calculation)
    const sebangoDateCountMap = new Map<string, number>();
    for (const r of cleanedRecords) {
      const key = `${r.date}__${r.sebango.toUpperCase()}`;
      sebangoDateCountMap.set(key, (sebangoDateCountMap.get(key) || 0) + 1);
    }

    // 3. Load Master Parts lookup (by sebango_code)
    const [partRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, sebango_code, part_number, part_name, berat_part_gr, shikake
       FROM master_parts
       WHERE is_active = TRUE`
    );

    const partMap = new Map<string, any>();
    for (const p of partRows) {
      if (p.sebango_code) {
        partMap.set(String(p.sebango_code).toUpperCase().trim(), p);
      }
    }

    // 4. Calculate allowance for each row
    let totalBatchAllowanceKg = 0;
    let matchedCount = 0;
    let minDate = cleanedRecords[0].date;
    let maxDate = cleanedRecords[0].date;

    const processedItems: any[] = [];

    for (const r of cleanedRecords) {
      if (r.date < minDate) minDate = r.date;
      if (r.date > maxDate) maxDate = r.date;

      const countKey = `${r.date}__${r.sebango.toUpperCase()}`;
      const dynamicShikake = Math.max(1, sebangoDateCountMap.get(countKey) || 1);

      // Match with master parts
      const masterPart = partMap.get(r.sebango.toUpperCase()) || null;

      // If matched, compute allowance and prepare for database insertion
      if (masterPart) {
        matchedCount++;
        const beratPartGr = Number(masterPart.berat_part_gr) || 0;
        const allowanceKg = beratPartGr > 0
          ? Number(((3 * (beratPartGr / 1000)) / dynamicShikake).toFixed(3))
          : 0;

        totalBatchAllowanceKg += allowanceKg;

        processedItems.push({
          id: randomUUID(),
          production_date: r.date,
          shift: r.shift,
          factory_raw: r.factory || null,
          tonase_raw: r.tonase || null,
          sebango_code: r.sebango,
          mesin_raw: r.mesin || null,
          act_total_pcs: r.act_total,
          act_ok_pcs: r.act_ok,
          ng_total_pcs: r.ng_total,
          master_part_id: masterPart.id,
          part_number_snapshot: masterPart.part_number,
          part_name_snapshot: masterPart.part_name,
          berat_part_gr_snapshot: beratPartGr,
          calculated_shikake: dynamicShikake,
          allowance_kg: allowanceKg,
        });
      }
      // Unmatched rows are skipped automatically!
    }

    if (processedItems.length === 0) {
      throw new Error('Tidak ada baris yang cocok dengan Master Part. Seluruh baris di-skip sehingga import dibatalkan.');
    }

    totalBatchAllowanceKg = Number(totalBatchAllowanceKg.toFixed(3));

    // 5. Save Batch Header
    const batchId = randomUUID();
    const batchTitle = batch_name || `Laporan Produksi ${minDate} s/d ${maxDate}`;

    await pool.query(
      `INSERT INTO production_analytics_batches
       (id, batch_name, filename, min_production_date, max_production_date, total_rows, matched_rows, total_allowance_kg, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        batchId,
        batchTitle,
        filename,
        minDate,
        maxDate,
        cleanedRecords.length,
        matchedCount,
        totalBatchAllowanceKg,
        userId || null,
      ]
    );

    // 6. Bulk Insert Items (Only matched items)
    for (const item of processedItems) {
      await pool.query(
        `INSERT INTO production_analytics_items
         (id, batch_id, production_date, shift, factory_raw, tonase_raw, sebango_code, mesin_raw, act_total_pcs, act_ok_pcs, ng_total_pcs, master_part_id, part_number_snapshot, part_name_snapshot, berat_part_gr_snapshot, calculated_shikake, allowance_kg)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          batchId,
          item.production_date,
          item.shift,
          item.factory_raw,
          item.tonase_raw,
          item.sebango_code,
          item.mesin_raw,
          item.act_total_pcs,
          item.act_ok_pcs,
          item.ng_total_pcs,
          item.master_part_id,
          item.part_number_snapshot,
          item.part_name_snapshot,
          item.berat_part_gr_snapshot,
          item.calculated_shikake,
          item.allowance_kg,
        ]
      );
    }

    return {
      batch_id: batchId,
      batch_name: batchTitle,
      filename,
      date_range: {
        min_date: minDate,
        max_date: maxDate,
      },
      total_rows: cleanedRecords.length,
      matched_rows: matchedCount,
      unmatched_rows: cleanedRecords.length - matchedCount,
      total_allowance_kg: totalBatchAllowanceKg,
    };
  }

  /**
   * Get yearly comparison metrics (12 months): Allowance vs Actual Output Crushing vs System NG.
   */
  static async getYearlyAnalytics(year?: number, factory?: string) {
    const qYear = year || new Date().getFullYear();

    // 1. Monthly Production Allowance
    let allowanceQuery = `
      SELECT 
        MONTH(production_date) AS month_num,
        COALESCE(SUM(allowance_kg), 0) AS total_allowance_kg,
        COALESCE(SUM(act_total_pcs), 0) AS total_act_pcs,
        COALESCE(SUM(ng_total_pcs), 0) AS total_prod_ng_pcs,
        COUNT(*) AS total_items
      FROM production_analytics_items
      WHERE YEAR(production_date) = ?
    `;
    const allowanceParams: any[] = [qYear];

    if (factory && factory !== 'all') {
      allowanceQuery += ` AND factory_raw = ?`;
      allowanceParams.push(factory);
    }

    allowanceQuery += ` GROUP BY MONTH(production_date)`;
    const [allowanceRows] = await pool.query<RowDataPacket[]>(allowanceQuery, allowanceParams);

    // 2. Monthly Actual Output from Validated Input Verifications
    const [verRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        MONTH(verification_date) AS month_num,
        COALESCE(SUM(total_actual_output_kg), 0) AS total_actual_output_kg,
        COALESCE(SUM(total_system_weight_kg), 0) AS total_system_weight_kg,
        COALESCE(SUM(total_crushing_waste_kg), 0) AS total_crushing_waste_kg
       FROM input_verifications
       WHERE YEAR(verification_date) = ? AND status = 'validated'
       GROUP BY MONTH(verification_date)`,
      [qYear]
    );

    // 3. Monthly System Part NG Transactions
    const [ngRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        MONTH(transaction_date) AS month_num,
        COALESCE(SUM(weight_kg), 0) AS total_ng_kg,
        COALESCE(SUM(quantity_pcs), 0) AS total_ng_pcs
       FROM ng_transactions
       WHERE YEAR(transaction_date) = ?
       GROUP BY MONTH(transaction_date)`,
      [qYear]
    );

    // 4. Monthly Part Runner NG Transactions
    const [runnerRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        MONTH(transaction_date) AS month_num,
        COALESCE(SUM(total_runner_weight_kg), 0) AS total_runner_kg
       FROM runner_material_transactions
       WHERE YEAR(transaction_date) = ?
       GROUP BY MONTH(transaction_date)`,
      [qYear]
    );

    // 5. Assemble 12 months map
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const monthlyMap = new Map<number, {
      allowance_kg: number;
      actual_output_kg: number;
      system_ng_kg: number;
      system_runner_kg: number;
      total_prod_act_pcs: number;
      total_prod_ng_pcs: number;
    }>();

    for (let m = 1; m <= 12; m++) {
      monthlyMap.set(m, {
        allowance_kg: 0,
        actual_output_kg: 0,
        system_ng_kg: 0,
        system_runner_kg: 0,
        total_prod_act_pcs: 0,
        total_prod_ng_pcs: 0,
      });
    }

    for (const r of allowanceRows) {
      const m = Number(r.month_num);
      const cur = monthlyMap.get(m);
      if (cur) {
        cur.allowance_kg = Number(Number(r.total_allowance_kg).toFixed(2));
        cur.total_prod_act_pcs = Number(r.total_act_pcs) || 0;
        cur.total_prod_ng_pcs = Number(r.total_prod_ng_pcs) || 0;
      }
    }

    for (const r of verRows) {
      const m = Number(r.month_num);
      const cur = monthlyMap.get(m);
      if (cur) {
        cur.actual_output_kg = Number(Number(r.total_actual_output_kg).toFixed(2));
      }
    }

    for (const r of ngRows) {
      const m = Number(r.month_num);
      const cur = monthlyMap.get(m);
      if (cur) {
        cur.system_ng_kg = Number(Number(r.total_ng_kg).toFixed(2));
      }
    }

    for (const r of runnerRows) {
      const m = Number(r.month_num);
      const cur = monthlyMap.get(m);
      if (cur) {
        cur.system_runner_kg = Number(Number(r.total_runner_kg).toFixed(2));
      }
    }

    let overallAllowanceKg = 0;
    let overallInputKg = 0;
    let overallActualOutputKg = 0;
    let overallSystemNgKg = 0;
    let overallSystemRunnerKg = 0;

    const monthlyComparison = monthNames.map((name, idx) => {
      const m = idx + 1;
      const data = monthlyMap.get(m)!;

      const inputKg = Number((data.system_ng_kg + data.system_runner_kg).toFixed(2));
      const gapNgKg = Number((data.allowance_kg - inputKg).toFixed(2));
      const gapCrushingKg = Number((inputKg - data.actual_output_kg).toFixed(2));
      const crushingEfficiencyPct = inputKg > 0
        ? Number(((data.actual_output_kg / inputKg) * 100).toFixed(1))
        : data.actual_output_kg > 0 ? 100 : 0;

      overallAllowanceKg += data.allowance_kg;
      overallInputKg += inputKg;
      overallActualOutputKg += data.actual_output_kg;
      overallSystemNgKg += data.system_ng_kg;
      overallSystemRunnerKg += data.system_runner_kg;

      return {
        month_number: m,
        month_name: name,
        allowance_kg: data.allowance_kg,
        input_kg: inputKg,
        actual_output_kg: data.actual_output_kg,
        system_ng_kg: data.system_ng_kg,
        system_runner_kg: data.system_runner_kg,
        gap_ng_kg: gapNgKg,
        gap_crushing_kg: gapCrushingKg,
        difference_kg: gapNgKg,
        ratio_percent: crushingEfficiencyPct,
        total_prod_act_pcs: data.total_prod_act_pcs,
        total_prod_ng_pcs: data.total_prod_ng_pcs,
      };
    });

    overallAllowanceKg = Number(overallAllowanceKg.toFixed(2));
    overallInputKg = Number(overallInputKg.toFixed(2));
    overallActualOutputKg = Number(overallActualOutputKg.toFixed(2));
    overallSystemNgKg = Number(overallSystemNgKg.toFixed(2));
    overallSystemRunnerKg = Number(overallSystemRunnerKg.toFixed(2));

    const overallGapNgKg = Number((overallAllowanceKg - overallInputKg).toFixed(2));
    const overallGapCrushingKg = Number((overallInputKg - overallActualOutputKg).toFixed(2));
    const overallCrushingEfficiencyPct = overallInputKg > 0
      ? Number(((overallActualOutputKg / overallInputKg) * 100).toFixed(1))
      : overallActualOutputKg > 0 ? 100 : 0;

    // 6. Available Production Date Range
    const [dateRangeRows] = await pool.query<RowDataPacket[]>(
      `SELECT MIN(production_date) AS min_date, MAX(production_date) AS max_date, COUNT(*) AS total_items
       FROM production_analytics_items
       WHERE YEAR(production_date) = ?`,
      [qYear]
    );

    return {
      year: qYear,
      factory: factory || 'all',
      summary: {
        total_allowance_kg: overallAllowanceKg,
        total_input_kg: overallInputKg,
        total_actual_output_kg: overallActualOutputKg,
        total_system_ng_kg: overallSystemNgKg,
        total_system_runner_kg: overallSystemRunnerKg,
        overall_gap_ng_kg: overallGapNgKg,
        overall_gap_crushing_kg: overallGapCrushingKg,
        overall_crushing_efficiency_percent: overallCrushingEfficiencyPct,
        total_records_count: dateRangeRows[0]?.total_items || 0,
        min_date: dateRangeRows[0]?.min_date || null,
        max_date: dateRangeRows[0]?.max_date || null,
      },
      monthly_comparison: monthlyComparison,
    };
  }

  /**
   * Get Pareto Analysis Data for Materials (Resin)
   */
  static async getParetoMaterials(year?: number, factory?: string) {
    const qYear = year || new Date().getFullYear();

    // 1. Part NG weight per material
    let ngQuery = `
      SELECT 
        COALESCE(mm.material_name, mp.material, 'OTHER') AS material_name,
        COALESCE(SUM(nt.weight_kg), 0) AS ng_weight_kg,
        COALESCE(SUM(nt.quantity_pcs), 0) AS ng_pcs
      FROM ng_transactions nt
      JOIN master_parts mp ON nt.master_part_id = mp.id
      LEFT JOIN master_materials mm ON mp.material_id = mm.id
      WHERE YEAR(nt.transaction_date) = ?
    `;
    const ngParams: any[] = [qYear];
    if (factory && factory !== 'all') {
      ngQuery += ` AND nt.factory_id = ?`;
      ngParams.push(factory);
    }
    ngQuery += ` GROUP BY COALESCE(mm.material_name, mp.material, 'OTHER')`;
    const [ngRows] = await pool.query<RowDataPacket[]>(ngQuery, ngParams);

    // 2. Runner weight per material
    let runnerQuery = `
      SELECT 
        COALESCE(rmt.material_name_snapshot, 'OTHER') AS material_name,
        COALESCE(SUM(rmt.total_runner_weight_kg), 0) AS runner_weight_kg,
        COALESCE(SUM(rmt.total_pcs), 0) AS runner_pcs
      FROM runner_material_transactions rmt
      WHERE YEAR(rmt.transaction_date) = ?
    `;
    const runnerParams: any[] = [qYear];
    if (factory && factory !== 'all') {
      runnerQuery += ` AND rmt.factory_id = ?`;
      runnerParams.push(factory);
    }
    runnerQuery += ` GROUP BY COALESCE(rmt.material_name_snapshot, 'OTHER')`;
    const [runnerRows] = await pool.query<RowDataPacket[]>(runnerQuery, runnerParams);

    // 3. Merge map by material
    const materialMap = new Map<string, {
      material_name: string;
      ng_weight_kg: number;
      runner_weight_kg: number;
      total_weight_kg: number;
      total_pcs: number;
    }>();

    for (const r of ngRows) {
      const mat = (r.material_name || 'OTHER').trim();
      const ngKg = Number(Number(r.ng_weight_kg).toFixed(2));
      const pcs = Number(r.ng_pcs) || 0;
      materialMap.set(mat, {
        material_name: mat,
        ng_weight_kg: ngKg,
        runner_weight_kg: 0,
        total_weight_kg: ngKg,
        total_pcs: pcs,
      });
    }

    for (const r of runnerRows) {
      const mat = (r.material_name || 'OTHER').trim();
      const runnerKg = Number(Number(r.runner_weight_kg).toFixed(2));
      const pcs = Number(r.runner_pcs) || 0;
      if (materialMap.has(mat)) {
        const cur = materialMap.get(mat)!;
        cur.runner_weight_kg = runnerKg;
        cur.total_weight_kg = Number((cur.total_weight_kg + runnerKg).toFixed(2));
        cur.total_pcs += pcs;
      } else {
        materialMap.set(mat, {
          material_name: mat,
          ng_weight_kg: 0,
          runner_weight_kg: runnerKg,
          total_weight_kg: runnerKg,
          total_pcs: pcs,
        });
      }
    }

    // Fallback: If transactions are empty, aggregate from production_analytics_items
    if (materialMap.size === 0) {
      let prodQuery = `
        SELECT 
          COALESCE(mp.material, 'OTHER') AS material_name,
          COALESCE(SUM((pai.ng_total_pcs * pai.berat_part_gr_snapshot) / 1000), 0) AS ng_weight_kg,
          COALESCE(SUM(pai.ng_total_pcs), 0) AS ng_pcs
        FROM production_analytics_items pai
        LEFT JOIN master_parts mp ON pai.master_part_id = mp.id
        WHERE YEAR(pai.production_date) = ?
      `;
      const prodParams: any[] = [qYear];
      if (factory && factory !== 'all') {
        prodQuery += ` AND pai.factory_raw = ?`;
        prodParams.push(factory);
      }
      prodQuery += ` GROUP BY COALESCE(mp.material, 'OTHER')`;
      const [prodRows] = await pool.query<RowDataPacket[]>(prodQuery, prodParams);

      for (const r of prodRows) {
        const mat = (r.material_name || 'OTHER').trim();
        const ngKg = Number(Number(r.ng_weight_kg).toFixed(2));
        const pcs = Number(r.ng_pcs) || 0;
        if (ngKg > 0 || pcs > 0) {
          materialMap.set(mat, {
            material_name: mat,
            ng_weight_kg: ngKg,
            runner_weight_kg: 0,
            total_weight_kg: ngKg,
            total_pcs: pcs,
          });
        }
      }
    }

    const items = Array.from(materialMap.values()).filter(m => m.total_weight_kg > 0 || m.total_pcs > 0);
    items.sort((a, b) => b.total_weight_kg - a.total_weight_kg || b.total_pcs - a.total_pcs);

    const grandTotalKg = items.reduce((acc, cur) => acc + cur.total_weight_kg, 0);

    let cumulativeKg = 0;
    const paretoData = items.map((item, idx) => {
      cumulativeKg += item.total_weight_kg;
      const percentage = grandTotalKg > 0 ? Number(((item.total_weight_kg / grandTotalKg) * 100).toFixed(1)) : 0;
      const cumulativePercentage = grandTotalKg > 0 ? Number(((cumulativeKg / grandTotalKg) * 100).toFixed(1)) : 0;

      return {
        rank: idx + 1,
        material_name: item.material_name,
        ng_weight_kg: item.ng_weight_kg,
        runner_weight_kg: item.runner_weight_kg,
        total_weight_kg: item.total_weight_kg,
        total_pcs: item.total_pcs,
        percentage,
        cumulative_percentage: Math.min(100, cumulativePercentage),
      };
    });

    return {
      year: qYear,
      factory: factory || 'all',
      grand_total_kg: Number(grandTotalKg.toFixed(2)),
      total_materials_count: paretoData.length,
      items: paretoData,
    };
  }

  /**
   * Get Pareto Analysis Data for Part NG
   */
  static async getParetoPartsNg(year?: number, factory?: string) {
    const qYear = year || new Date().getFullYear();

    // 1. From ng_transactions
    let query = `
      SELECT 
        COALESCE(mp.part_number, nt.part_number_snapshot, '-') AS part_number,
        COALESCE(mp.part_name, nt.part_name_snapshot, '-') AS part_name,
        COALESCE(mp.sebango_code, '-') AS sebango_code,
        COALESCE(m.model_code, '-') AS model_code,
        COALESCE(mm.material_name, mp.material, '-') AS material_name,
        COALESCE(SUM(nt.quantity_pcs), 0) AS total_ng_pcs,
        COALESCE(SUM(nt.weight_kg), 0) AS total_ng_kg
      FROM ng_transactions nt
      LEFT JOIN master_parts mp ON nt.master_part_id = mp.id
      LEFT JOIN master_models m ON mp.model_id = m.id
      LEFT JOIN master_materials mm ON mp.material_id = mm.id
      WHERE YEAR(nt.transaction_date) = ?
    `;
    const params: any[] = [qYear];
    if (factory && factory !== 'all') {
      query += ` AND nt.factory_id = ?`;
      params.push(factory);
    }
    query += ` GROUP BY 
      COALESCE(mp.part_number, nt.part_number_snapshot, '-'),
      COALESCE(mp.part_name, nt.part_name_snapshot, '-'),
      COALESCE(mp.sebango_code, '-'),
      COALESCE(m.model_code, '-'),
      COALESCE(mm.material_name, mp.material, '-')`;
    const [ngRows] = await pool.query<RowDataPacket[]>(query, params);

    // 2. Map & calculate totals
    const partMap = new Map<string, {
      part_number: string;
      part_name: string;
      sebango_code: string;
      model_code: string;
      material_name: string;
      total_ng_pcs: number;
      total_ng_kg: number;
    }>();

    for (const r of ngRows) {
      const key = `${r.part_number}_${r.sebango_code}`;
      const pcs = Number(r.total_ng_pcs) || 0;
      const kg = Number(Number(r.total_ng_kg).toFixed(2)) || 0;
      partMap.set(key, {
        part_number: r.part_number,
        part_name: r.part_name,
        sebango_code: r.sebango_code,
        model_code: r.model_code,
        material_name: r.material_name,
        total_ng_pcs: pcs,
        total_ng_kg: kg,
      });
    }

    // Fallback: If ng_transactions is empty, aggregate from production_analytics_items
    if (partMap.size === 0) {
      let prodQuery = `
        SELECT 
          COALESCE(pai.part_number_snapshot, '-') AS part_number,
          COALESCE(pai.part_name_snapshot, '-') AS part_name,
          COALESCE(pai.sebango_code, '-') AS sebango_code,
          COALESCE(m.model_code, '-') AS model_code,
          COALESCE(mp.material, '-') AS material_name,
          COALESCE(SUM(pai.ng_total_pcs), 0) AS total_ng_pcs,
          COALESCE(SUM((pai.ng_total_pcs * pai.berat_part_gr_snapshot) / 1000), 0) AS total_ng_kg
        FROM production_analytics_items pai
        LEFT JOIN master_parts mp ON pai.master_part_id = mp.id
        LEFT JOIN master_models m ON mp.model_id = m.id
        WHERE YEAR(pai.production_date) = ?
      `;
      const prodParams: any[] = [qYear];
      if (factory && factory !== 'all') {
        prodQuery += ` AND pai.factory_raw = ?`;
        prodParams.push(factory);
      }
      prodQuery += ` GROUP BY 
        COALESCE(pai.part_number_snapshot, '-'),
        COALESCE(pai.part_name_snapshot, '-'),
        COALESCE(pai.sebango_code, '-'),
        COALESCE(m.model_code, '-'),
        COALESCE(mp.material, '-')`;
      const [prodRows] = await pool.query<RowDataPacket[]>(prodQuery, prodParams);

      for (const r of prodRows) {
        const key = `${r.part_number}_${r.sebango_code}`;
        const pcs = Number(r.total_ng_pcs) || 0;
        const kg = Number(Number(r.total_ng_kg).toFixed(2)) || 0;
        if (pcs > 0 || kg > 0) {
          partMap.set(key, {
            part_number: r.part_number,
            part_name: r.part_name,
            sebango_code: r.sebango_code,
            model_code: r.model_code,
            material_name: r.material_name,
            total_ng_pcs: pcs,
            total_ng_kg: kg,
          });
        }
      }
    }

    const items = Array.from(partMap.values()).filter(p => p.total_ng_pcs > 0 || p.total_ng_kg > 0);
    items.sort((a, b) => b.total_ng_kg - a.total_ng_kg || b.total_ng_pcs - a.total_ng_pcs);

    const grandTotalKg = items.reduce((acc, cur) => acc + cur.total_ng_kg, 0);
    const grandTotalPcs = items.reduce((acc, cur) => acc + cur.total_ng_pcs, 0);

    let cumulativeKg = 0;
    const paretoData = items.map((item, idx) => {
      cumulativeKg += item.total_ng_kg;
      const percentage = grandTotalKg > 0
        ? Number(((item.total_ng_kg / grandTotalKg) * 100).toFixed(1))
        : (grandTotalPcs > 0 ? Number(((item.total_ng_pcs / grandTotalPcs) * 100).toFixed(1)) : 0);
      const cumulativePercentage = grandTotalKg > 0
        ? Number(((cumulativeKg / grandTotalKg) * 100).toFixed(1))
        : (grandTotalPcs > 0 ? Number(((item.total_ng_pcs / grandTotalPcs) * 100).toFixed(1)) : 0);

      return {
        rank: idx + 1,
        part_number: item.part_number,
        part_name: item.part_name,
        sebango_code: item.sebango_code,
        model_code: item.model_code,
        material_name: item.material_name,
        total_ng_pcs: item.total_ng_pcs,
        total_ng_kg: item.total_ng_kg,
        percentage,
        cumulative_percentage: Math.min(100, cumulativePercentage),
      };
    });

    return {
      year: qYear,
      factory: factory || 'all',
      grand_total_kg: Number(grandTotalKg.toFixed(2)),
      grand_total_pcs: grandTotalPcs,
      total_parts_count: paretoData.length,
      items: paretoData,
    };
  }

  /**
   * Get Paginated Production Analytics Records with search & filters.
   */
  static async getProductionRecords(params: {
    page?: number;
    limit?: number;
    year?: number;
    month?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    factory?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const offset = (page - 1) * limit;

    let whereSql = `WHERE 1=1`;
    const queryParams: any[] = [];

    if (params.year) {
      whereSql += ` AND YEAR(pai.production_date) = ?`;
      queryParams.push(params.year);
    }

    if (params.month) {
      whereSql += ` AND MONTH(pai.production_date) = ?`;
      queryParams.push(params.month);
    }

    if (params.startDate) {
      whereSql += ` AND pai.production_date >= ?`;
      queryParams.push(params.startDate);
    }

    if (params.endDate) {
      whereSql += ` AND pai.production_date <= ?`;
      queryParams.push(params.endDate);
    }

    if (params.factory && params.factory !== 'all') {
      whereSql += ` AND pai.factory_raw = ?`;
      queryParams.push(params.factory);
    }

    if (params.search && params.search.trim()) {
      const s = `%${params.search.trim()}%`;
      whereSql += ` AND (pai.sebango_code LIKE ? OR pai.part_name_snapshot LIKE ? OR pai.part_number_snapshot LIKE ? OR pai.mesin_raw LIKE ?)`;
      queryParams.push(s, s, s, s);
    }

    // Count Total
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM production_analytics_items pai ${whereSql}`,
      queryParams
    );
    const total = Number(countRows[0]?.total || 0);

    // Fetch Records
    const [records] = await pool.query<RowDataPacket[]>(
      `SELECT 
        pai.id,
        pai.batch_id,
        pai.production_date,
        pai.shift,
        pai.factory_raw,
        pai.tonase_raw,
        pai.sebango_code,
        pai.mesin_raw,
        pai.act_total_pcs,
        pai.act_ok_pcs,
        pai.ng_total_pcs,
        pai.master_part_id,
        pai.part_number_snapshot,
        pai.part_name_snapshot,
        pai.berat_part_gr_snapshot,
        pai.calculated_shikake,
        pai.allowance_kg,
        pai.created_at,
        pab.filename AS batch_filename
       FROM production_analytics_items pai
       LEFT JOIN production_analytics_batches pab ON pai.batch_id = pab.id
       ${whereSql}
       ORDER BY pai.production_date DESC, pai.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get Batches History.
   */
  static async getBatchesList() {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        pab.*,
        u.full_name AS uploader_name
       FROM production_analytics_batches pab
       LEFT JOIN users u ON pab.uploaded_by = u.id
       ORDER BY pab.created_at DESC`
    );
    return rows;
  }

  /**
   * Delete a Batch and its items with database transaction.
   */
  static async deleteBatch(batchId: string) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Delete associated items first (safety cascade)
      await connection.query(
        `DELETE FROM production_analytics_items WHERE batch_id = ?`,
        [batchId]
      );

      // 2. Delete the batch header
      const [res]: any = await connection.query(
        `DELETE FROM production_analytics_batches WHERE id = ?`,
        [batchId]
      );

      await connection.commit();
      return res.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Rollback the latest uploaded batch.
   */
  static async rollbackLatestBatch() {
    const [latest]: any = await pool.query<RowDataPacket[]>(
      `SELECT id, batch_name, filename, created_at, total_rows, total_allowance_kg 
       FROM production_analytics_batches 
       ORDER BY created_at DESC LIMIT 1`
    );

    if (!latest || latest.length === 0) {
      return null;
    }

    const batch = latest[0];
    await this.deleteBatch(batch.id);
    return batch;
  }
}
