import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import * as XLSX from 'xlsx';

export class DashboardService {
  static async getSummaryStats(year?: number, month?: number, location: string = 'Cibitung') {
    const now = new Date();
    const qYear = year || now.getFullYear();
    const qMonth = month || now.getMonth() + 1;

    // 1. Fetch Part NG totals (Input, Output Reuse, Waste No-Reuse)
    const [ngRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COALESCE(SUM(t.weight_kg), 0) AS total_input_kg,
        COALESCE(SUM(t.quantity_pcs), 0) AS total_input_pcs,
        COALESCE(SUM(CASE WHEN mm.recycle_type = 'reuse' OR (mm.recycle_type IS NULL AND LOWER(mp.material) NOT LIKE '%no reuse%') THEN t.weight_kg ELSE 0 END), 0) AS total_output_kg,
        COALESCE(SUM(CASE WHEN mm.recycle_type = 'no_reuse' OR LOWER(mp.material) LIKE '%no reuse%' THEN t.weight_kg ELSE 0 END), 0) AS total_waste_kg
       FROM ng_transactions t
       JOIN master_parts mp ON t.master_part_id = mp.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories fc ON mc.factory_id = fc.id
       LEFT JOIN master_materials mm ON mp.material_id = mm.id
       WHERE YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ? AND fc.location = ?`,
      [qYear, qMonth, location]
    );

    // 2. Fetch Part Runner totals (Input, Output Reuse, Waste No-Reuse)
    const [runnerRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COALESCE(SUM(rmt.total_runner_weight_kg), 0) AS total_input_kg,
        COALESCE(SUM(CASE WHEN mm.recycle_type = 'reuse' OR (mm.recycle_type IS NULL AND LOWER(rmt.material_name_snapshot) NOT LIKE '%no reuse%') THEN rmt.total_runner_weight_kg ELSE 0 END), 0) AS total_output_kg,
        COALESCE(SUM(CASE WHEN mm.recycle_type = 'no_reuse' OR LOWER(rmt.material_name_snapshot) LIKE '%no reuse%' THEN rmt.total_runner_weight_kg ELSE 0 END), 0) AS total_waste_kg
       FROM runner_material_transactions rmt
       LEFT JOIN master_materials mm ON (rmt.material_id = mm.id OR rmt.material_name_snapshot = mm.material_name)
       WHERE YEAR(rmt.transaction_date) = ? AND MONTH(rmt.transaction_date) = ?`,
      [qYear, qMonth]
    );

    // 3. Fetch validated verifications totals (System Weight, Actual Output, Crushing Waste Loss)
    const [verRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COALESCE(SUM(total_system_weight_kg), 0) AS verified_system_kg,
        COALESCE(SUM(total_actual_output_kg), 0) AS verified_output_kg,
        COALESCE(SUM(total_crushing_waste_kg), 0) AS verified_waste_kg
       FROM input_verifications
       WHERE YEAR(verification_date) = ? AND MONTH(verification_date) = ? AND status = 'validated'`,
      [qYear, qMonth]
    );

    const ngInputKg = Number(ngRows[0]?.total_input_kg) || 0;
    const ngInputPcs = Number(ngRows[0]?.total_input_pcs) || 0;
    const ngReuseKg = Number(ngRows[0]?.total_output_kg) || 0;
    const ngNoReuseWasteKg = Number(ngRows[0]?.total_waste_kg) || 0;

    const runnerInputKg = Number(runnerRows[0]?.total_input_kg) || 0;
    const runnerReuseKg = Number(runnerRows[0]?.total_output_kg) || 0;
    const runnerNoReuseWasteKg = Number(runnerRows[0]?.total_waste_kg) || 0;

    const verifiedSystemKg = Number(verRows[0]?.verified_system_kg) || 0;
    const verifiedOutputKg = Number(verRows[0]?.verified_output_kg) || 0;
    const verifiedWasteKg = Number(verRows[0]?.verified_waste_kg) || 0;

    const totalInputKg = ngInputKg + runnerInputKg;
    const totalSystemReuseKg = ngReuseKg + runnerReuseKg;
    const totalNoReuseWasteKg = ngNoReuseWasteKg + runnerNoReuseWasteKg;

    // Calculate unverified reuse weight (reuse weight from shifts not yet validated)
    const unverifiedReuseKg = Math.max(0, totalSystemReuseKg - verifiedSystemKg);

    // Final KPI Card Values (Output反映 actual box count, Waste reflects no-reuse + crushing waste loss)
    const finalOutputKg = unverifiedReuseKg + verifiedOutputKg;
    const finalWasteKg = totalNoReuseWasteKg + verifiedWasteKg;

    return {
      year: qYear,
      month: qMonth,
      location,
      input_kg: parseFloat(totalInputKg.toFixed(2)),
      output_kg: parseFloat(finalOutputKg.toFixed(2)),
      waste_kg: parseFloat(finalWasteKg.toFixed(2)),
      input_pcs: ngInputPcs,
    };
  }

  static async getDailyChartData(year?: number, month?: number, location: string = 'Cibitung') {
    const now = new Date();
    const qYear = year || now.getFullYear();
    const qMonth = month || now.getMonth() + 1;

    // Fetch sum of all allowance_kg from active master_parts for the selected factory location
    const [allowanceRows] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(mp.allowance_kg), 0) AS total_allowance_kg
       FROM master_parts mp
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories fc ON mc.factory_id = fc.id
       WHERE mp.is_active = TRUE AND fc.location = ?`,
      [location]
    );

    const totalAllowanceKg = Number(Number(allowanceRows[0]?.total_allowance_kg || 0).toFixed(2));

    // 1. Fetch Part NG transactions per day & shift
    const [ngRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DAY(t.transaction_date) AS day_num,
        t.shift,
        SUM(t.weight_kg) AS total_kg,
        SUM(t.quantity_pcs) AS total_pcs
       FROM ng_transactions t
       JOIN master_parts mp ON t.master_part_id = mp.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories fc ON mc.factory_id = fc.id
       WHERE YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ? AND fc.location = ?
       GROUP BY DAY(t.transaction_date), t.shift
       ORDER BY day_num ASC`,
      [qYear, qMonth, location]
    );

    // 2. Fetch Runner Material transactions per day & shift
    const [runnerRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DAY(rmt.transaction_date) AS day_num,
        rmt.shift,
        SUM(rmt.total_runner_weight_kg) AS total_kg
       FROM runner_material_transactions rmt
       WHERE YEAR(rmt.transaction_date) = ? AND MONTH(rmt.transaction_date) = ?
       GROUP BY DAY(rmt.transaction_date), rmt.shift
       ORDER BY day_num ASC`,
      [qYear, qMonth]
    );

    // Generate full days for the month (1..daysInMonth)
    const daysInMonth = new Date(qYear, qMonth, 0).getDate();
    const dayMap = new Map<number, {
      pagi_ng_kg: number;
      pagi_runner_kg: number;
      malam_ng_kg: number;
      malam_runner_kg: number;
      pagi_pcs: number;
      malam_pcs: number;
    }>();

    for (let d = 1; d <= daysInMonth; d++) {
      dayMap.set(d, {
        pagi_ng_kg: 0,
        pagi_runner_kg: 0,
        malam_ng_kg: 0,
        malam_runner_kg: 0,
        pagi_pcs: 0,
        malam_pcs: 0,
      });
    }

    // Process Part NG data
    for (const r of ngRows) {
      const dayNum = Number(r.day_num);
      const entry = dayMap.get(dayNum) || {
        pagi_ng_kg: 0, pagi_runner_kg: 0, malam_ng_kg: 0, malam_runner_kg: 0, pagi_pcs: 0, malam_pcs: 0,
      };
      const weight = Number(r.total_kg) || 0;
      const pcs = Number(r.total_pcs) || 0;

      if (r.shift === 'Pagi') {
        entry.pagi_ng_kg += weight;
        entry.pagi_pcs += pcs;
      } else if (r.shift === 'Malam') {
        entry.malam_ng_kg += weight;
        entry.malam_pcs += pcs;
      }
      dayMap.set(dayNum, entry);
    }

    // Process Part Runner data
    for (const r of runnerRows) {
      const dayNum = Number(r.day_num);
      const entry = dayMap.get(dayNum) || {
        pagi_ng_kg: 0, pagi_runner_kg: 0, malam_ng_kg: 0, malam_runner_kg: 0, pagi_pcs: 0, malam_pcs: 0,
      };
      const weight = Number(r.total_kg) || 0;

      if (r.shift === 'Pagi') {
        entry.pagi_runner_kg += weight;
      } else if (r.shift === 'Malam') {
        entry.malam_runner_kg += weight;
      }
      dayMap.set(dayNum, entry);
    }

    const chartItems = Array.from(dayMap.entries()).map(([dayNum, data]) => {
      const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;

      const pagiNg = Number(data.pagi_ng_kg.toFixed(2));
      const pagiRunner = Number(data.pagi_runner_kg.toFixed(2));
      const malamNg = Number(data.malam_ng_kg.toFixed(2));
      const malamRunner = Number(data.malam_runner_kg.toFixed(2));

      const pagiKg = Number((pagiNg + pagiRunner).toFixed(2));
      const malamKg = Number((malamNg + malamRunner).toFixed(2));
      const totalKg = Number((pagiKg + malamKg).toFixed(2));

      return {
        day: dayStr,
        day_num: dayNum,
        pagi_ng_kg: pagiNg,
        pagi_runner_kg: pagiRunner,
        malam_ng_kg: malamNg,
        malam_runner_kg: malamRunner,
        pagi_kg: pagiKg,
        malam_kg: malamKg,
        pagi_pcs: data.pagi_pcs,
        malam_pcs: data.malam_pcs,
        total_kg: totalKg,
        total_pcs: data.pagi_pcs + data.malam_pcs,
      };
    });

    return {
      total_allowance_kg: totalAllowanceKg,
      daily_chart: chartItems,
    };
  }

  static async getParetoMaterial(year?: number, month?: number, location: string = 'Cibitung') {
    const now = new Date();
    const qYear = year || now.getFullYear();
    const qMonth = month || now.getMonth() + 1;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        material_name AS material,
        SUM(total_kg) AS total_kg,
        SUM(total_pcs) AS total_pcs
       FROM (
         SELECT 
           COALESCE(mm.material_name, mp.material, 'Unknown Material') AS material_name,
           t.weight_kg AS total_kg,
           t.quantity_pcs AS total_pcs
         FROM ng_transactions t
         JOIN master_parts mp ON t.master_part_id = mp.id
         JOIN machines mc ON mp.machine_id = mc.id
         JOIN factories fc ON mc.factory_id = fc.id
         LEFT JOIN master_materials mm ON mp.material_id = mm.id
         WHERE YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ? AND fc.location = ?

         UNION ALL

         SELECT 
           COALESCE(mm.material_name, rmt.material_name_snapshot, 'Unknown Material') AS material_name,
           rmt.total_runner_weight_kg AS total_kg,
           0 AS total_pcs
         FROM runner_material_transactions rmt
         LEFT JOIN master_materials mm ON (rmt.material_id = mm.id OR rmt.material_name_snapshot = mm.material_name)
         WHERE YEAR(rmt.transaction_date) = ? AND MONTH(rmt.transaction_date) = ?
       ) combined
       GROUP BY material_name
       ORDER BY total_kg DESC
       LIMIT 10`,
      [qYear, qMonth, location, qYear, qMonth]
    );

    return rows.map((r, index) => ({
      no: index + 1,
      material: r.material,
      total_kg: Number(Number(r.total_kg).toFixed(2)),
      total_pcs: Number(r.total_pcs),
    }));
  }

  static async getTopNgParts(year?: number, month?: number, location: string = 'Cibitung') {
    const now = new Date();
    const qYear = year || now.getFullYear();
    const qMonth = month || now.getMonth() + 1;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        t.part_name_snapshot AS part_name,
        t.part_number_snapshot AS part_number,
        t.model_snapshot AS model,
        SUM(t.quantity_pcs) AS total_pcs,
        SUM(t.weight_kg) AS total_kg
       FROM ng_transactions t
       JOIN master_parts mp ON t.master_part_id = mp.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories fc ON mc.factory_id = fc.id
       WHERE YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ? AND fc.location = ?
       GROUP BY t.part_name_snapshot, t.part_number_snapshot, t.model_snapshot
       ORDER BY total_pcs DESC
       LIMIT 5`,
      [qYear, qMonth, location]
    );

    return rows.map((r, index) => ({
      no: index + 1,
      part_name: r.part_name,
      part_number: r.part_number,
      model: r.model,
      total_pcs: Number(r.total_pcs),
      total_kg: Number(Number(r.total_kg).toFixed(2)),
    }));
  }

  /**
   * Generate Excel spreadsheet (.xlsx) for NG & Runner transactions within date range & location.
   * Sheet 1: Transaksi NG (TANGGAL, SHIFT, SEBANGO, PART NAME, PART NUMBER, MODEL, BERAT PART, QTY PER PCS, BERAT OUTPUT)
   * Sheet 2: Transaksi Runner (TANGGAL, SHIFT, NAMA MATERIAL, QTY PER PCS, BERAT OUTPUT, BATCH / SUMBER)
   */
  static async generateExcelBuffer(
    startDate?: string,
    endDate?: string,
    location: string = 'Cibitung'
  ): Promise<Buffer> {
    const now = new Date();
    const defaultStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const defaultEnd = now.toISOString().split('T')[0];

    const qStart = startDate || defaultStart;
    const qEnd = endDate || defaultEnd;

    // 1. Fetch NG Transactions
    const [ngRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS tanggal,
        t.shift AS shift,
        mp.sebango_code AS sebango,
        t.part_name_snapshot AS part_name,
        t.part_number_snapshot AS part_number,
        t.model_snapshot AS model,
        t.berat_part_gr_snapshot AS berat_part,
        t.quantity_pcs AS qty_per_pcs,
        t.weight_kg AS berat_output
       FROM ng_transactions t
       JOIN master_parts mp ON t.master_part_id = mp.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories fc ON mc.factory_id = fc.id
       WHERE t.transaction_date BETWEEN ? AND ?
         AND fc.location = ?
       ORDER BY t.transaction_date ASC, t.created_at ASC`,
      [qStart, qEnd, location]
    );

    // 2. Fetch Runner Material Transactions
    const [runnerRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(rmt.transaction_date, '%Y-%m-%d') AS tanggal,
        rmt.shift AS shift,
        COALESCE(mm.material_name, rmt.material_name_snapshot) AS material_name,
        rmt.total_pcs AS qty_per_pcs,
        rmt.total_runner_weight_kg AS berat_output,
        COALESCE(rmt.import_batch_ref, '-') AS batch_ref
       FROM runner_material_transactions rmt
       LEFT JOIN master_materials mm ON (rmt.material_id = mm.id OR rmt.material_name_snapshot = mm.material_name)
       LEFT JOIN factories fc ON rmt.factory_id = fc.id
       WHERE rmt.transaction_date BETWEEN ? AND ?
         AND (rmt.factory_id IS NULL OR fc.location = ?)
       ORDER BY rmt.transaction_date ASC, rmt.created_at ASC`,
      [qStart, qEnd, location]
    );

    const wb = XLSX.utils.book_new();

    // Sheet 1: Transaksi NG (Capitalized Headers)
    const ngHeaders = [
      'TANGGAL',
      'SHIFT',
      'SEBANGO',
      'PART NAME',
      'PART NUMBER',
      'MODEL',
      'BERAT PART',
      'QTY PER PCS',
      'BERAT OUTPUT',
    ];

    const ngExcelRows = ngRows.map((r) => [
      r.tanggal,
      r.shift,
      r.sebango || '-',
      r.part_name,
      r.part_number,
      r.model,
      Number(r.berat_part),
      Number(r.qty_per_pcs),
      Number(Number(r.berat_output).toFixed(2)),
    ]);

    const wsNg = XLSX.utils.aoa_to_sheet([ngHeaders, ...ngExcelRows]);
    wsNg['!cols'] = [
      { wch: 14 }, // TANGGAL
      { wch: 10 }, // SHIFT
      { wch: 16 }, // SEBANGO
      { wch: 32 }, // PART NAME
      { wch: 22 }, // PART NUMBER
      { wch: 12 }, // MODEL
      { wch: 14 }, // BERAT PART
      { wch: 14 }, // QTY PER PCS
      { wch: 14 }, // BERAT OUTPUT
    ];
    XLSX.utils.book_append_sheet(wb, wsNg, 'Transaksi NG');

    // Sheet 2: Transaksi Runner (Capitalized Headers)
    const runnerHeaders = [
      'TANGGAL',
      'SHIFT',
      'NAMA MATERIAL',
      'QTY PER PCS',
      'BERAT OUTPUT',
      'BATCH / SUMBER',
    ];

    const runnerExcelRows = runnerRows.map((r) => [
      r.tanggal,
      r.shift,
      r.material_name || '-',
      Number(r.qty_per_pcs || 0),
      Number(Number(r.berat_output || 0).toFixed(2)),
      r.batch_ref || '-',
    ]);

    const wsRunner = XLSX.utils.aoa_to_sheet([runnerHeaders, ...runnerExcelRows]);
    wsRunner['!cols'] = [
      { wch: 14 }, // TANGGAL
      { wch: 10 }, // SHIFT
      { wch: 24 }, // NAMA MATERIAL
      { wch: 14 }, // QTY PER PCS
      { wch: 16 }, // BERAT OUTPUT
      { wch: 28 }, // BATCH / SUMBER
    ];
    XLSX.utils.book_append_sheet(wb, wsRunner, 'Transaksi Runner');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  /**
   * Get Pareto of departments sending the most NG parts (ranking, total kg, total pcs, and percentage)
   */
  static async getDepartmentPareto(year?: number, month?: number, location: string = 'Cibitung') {
    const now = new Date();
    const qYear = year || now.getFullYear();
    const qMonth = month || now.getMonth() + 1;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COALESCE(d.id, 'unknown') AS department_id,
        COALESCE(d.code, 'N/A') AS department_code,
        COALESCE(d.name, 'Tanpa Departemen') AS department_name,
        COALESCE(SUM(t.weight_kg), 0) AS total_kg,
        COALESCE(SUM(t.quantity_pcs), 0) AS total_pcs,
        COUNT(t.id) AS total_transaksi
       FROM ng_transactions t
       JOIN master_parts mp ON t.master_part_id = mp.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories fc ON mc.factory_id = fc.id
       LEFT JOIN departments d ON t.department_id = d.id
       WHERE YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ? AND fc.location = ?
       GROUP BY d.id, d.code, d.name
       ORDER BY total_kg DESC`,
      [qYear, qMonth, location]
    );

    const totalPlantKg = rows.reduce((sum, r) => sum + Number(r.total_kg || 0), 0);

    return rows.map((r, index) => {
      const kg = Number(Number(r.total_kg).toFixed(2));
      const percentage = totalPlantKg > 0 ? Number(((kg / totalPlantKg) * 100).toFixed(1)) : 0;
      return {
        rank: index + 1,
        department_id: r.department_id,
        department_code: r.department_code,
        department_name: r.department_name,
        total_kg: kg,
        total_pcs: Number(r.total_pcs || 0),
        total_transaksi: Number(r.total_transaksi || 0),
        percentage,
      };
    });
  }

  /**
   * Get department-scoped dashboard summary and analytics for a sender user
   */
  static async getSenderDashboardStats(userId: string, year?: number, month?: number) {
    const now = new Date();
    const qYear = year || now.getFullYear();
    const qMonth = month || now.getMonth() + 1;

    // 1. Determine department and factory of the requesting sender
    const [userRows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.username, u.full_name, u.role, u.department_id, d.name AS department_name, d.code AS department_code,
              u.factory_id, f.name AS factory_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN factories f ON u.factory_id = f.id
       WHERE u.id = ?`,
      [userId]
    );

    const currentUser = userRows[0] || {};
    let departmentId = currentUser.department_id || null;
    let departmentName = currentUser.department_name || 'Umum';
    let departmentCode = currentUser.department_code || 'ALL';
    let factoryName = currentUser.factory_name || 'Semua Pabrik';

    // If user's department_id is not set in users table, lookup from their most recent request
    if (!departmentId) {
      const [deptLookup] = await pool.query<RowDataPacket[]>(
        `SELECT r.department_id, d.name AS department_name, d.code AS department_code,
                r.factory_id, f.name AS factory_name
         FROM crushing_requests r
         LEFT JOIN departments d ON r.department_id = d.id
         LEFT JOIN factories f ON r.factory_id = f.id
         WHERE r.sender_id = ? AND r.department_id IS NOT NULL
         ORDER BY r.created_at DESC LIMIT 1`,
        [userId]
      );
      if (deptLookup.length > 0 && deptLookup[0].department_id) {
        departmentId = deptLookup[0].department_id;
        departmentName = deptLookup[0].department_name || departmentName;
        departmentCode = deptLookup[0].department_code || departmentCode;
        factoryName = deptLookup[0].factory_name || factoryName;
      }
    }

    const filterClause = departmentId ? '(r.department_id = ? OR r.sender_id = ?)' : 'r.sender_id = ?';
    const queryParams = departmentId ? [departmentId, userId, qYear, qMonth] : [userId, qYear, qMonth];
    const recentQueryParams = departmentId ? [departmentId, userId] : [userId];

    // 2. Aggregate Department KPI Summary
    const [summaryRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) AS total_requests,
        COALESCE(SUM(CASE WHEN r.status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_count,
        COALESCE(SUM(CASE WHEN r.status = 'approved' THEN 1 ELSE 0 END), 0) AS approved_count,
        COALESCE(SUM(CASE WHEN r.status = 'rejected' THEN 1 ELSE 0 END), 0) AS rejected_count,
        COALESCE(SUM(CASE WHEN r.status = 'approved' THEN r.total_weight_kg ELSE 0 END), 0) AS approved_weight_kg,
        COALESCE(SUM(CASE WHEN r.status = 'approved' THEN r.total_pcs ELSE 0 END), 0) AS approved_pcs,
        COALESCE(SUM(CASE WHEN r.status != 'rejected' THEN r.total_weight_kg ELSE 0 END), 0) AS total_submitted_weight_kg,
        COALESCE(SUM(CASE WHEN r.status != 'rejected' THEN r.total_pcs ELSE 0 END), 0) AS total_pcs
       FROM crushing_requests r
       WHERE ${filterClause} AND YEAR(r.request_date) = ? AND MONTH(r.request_date) = ?`,
      queryParams
    );

    const s = summaryRows[0] || {};
    const totalApprovedKg = Number(Number(s.approved_weight_kg || 0).toFixed(2));
    const totalSubmittedKg = Number(Number(s.total_submitted_weight_kg || 0).toFixed(2));
    const baseKg = totalApprovedKg > 0 ? totalApprovedKg : totalSubmittedKg;

    // 3. Daily Breakdown for selected month (Shift Pagi & Shift Malam) - include all non-rejected requests
    const [dailyRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DAY(r.request_date) AS day_num,
        r.shift,
        SUM(r.total_weight_kg) AS total_kg,
        SUM(r.total_pcs) AS total_pcs
       FROM crushing_requests r
       WHERE ${filterClause} AND YEAR(r.request_date) = ? AND MONTH(r.request_date) = ? AND r.status != 'rejected'
       GROUP BY DAY(r.request_date), r.shift
       ORDER BY day_num ASC`,
      queryParams
    );

    const daysInMonth = new Date(qYear, qMonth, 0).getDate();
    const dailyMap = new Map<number, { pagi_kg: number; malam_kg: number; pagi_pcs: number; malam_pcs: number }>();
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap.set(d, { pagi_kg: 0, malam_kg: 0, pagi_pcs: 0, malam_pcs: 0 });
    }

    for (const row of dailyRows) {
      const dayNum = Number(row.day_num);
      const entry = dailyMap.get(dayNum) || { pagi_kg: 0, malam_kg: 0, pagi_pcs: 0, malam_pcs: 0 };
      const weight = Number(row.total_kg) || 0;
      const pcs = Number(row.total_pcs) || 0;

      if (row.shift === 'Malam') {
        entry.malam_kg += weight;
        entry.malam_pcs += pcs;
      } else {
        entry.pagi_kg += weight;
        entry.pagi_pcs += pcs;
      }
      dailyMap.set(dayNum, entry);
    }

    const daily_chart = Array.from(dailyMap.entries()).map(([dayNum, data]) => {
      const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
      const pagiKg = Number(data.pagi_kg.toFixed(2));
      const malamKg = Number(data.malam_kg.toFixed(2));
      const totalKg = Number((pagiKg + malamKg).toFixed(2));

      return {
        day: dayStr,
        day_num: dayNum,
        pagi_kg: pagiKg,
        malam_kg: malamKg,
        pagi_pcs: data.pagi_pcs,
        malam_pcs: data.malam_pcs,
        total_kg: totalKg,
        total_pcs: data.pagi_pcs + data.malam_pcs,
      };
    });

    // 4. Top 10 Part NG Terkirim Departemen
    const [topPartRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        i.part_name_snapshot AS part_name,
        i.part_number_snapshot AS part_number,
        COALESCE(i.model_snapshot, '-') AS model,
        SUM(i.quantity_pcs) AS total_pcs,
        SUM(i.weight_kg) AS total_kg
       FROM crushing_request_items i
       JOIN crushing_requests r ON i.request_id = r.id
       WHERE ${filterClause} AND YEAR(r.request_date) = ? AND MONTH(r.request_date) = ? AND r.status != 'rejected'
       GROUP BY i.part_name_snapshot, i.part_number_snapshot, i.model_snapshot
       ORDER BY total_kg DESC
       LIMIT 10`,
      queryParams
    );

    const top_parts = topPartRows.map((r, idx) => {
      const kg = Number(Number(r.total_kg || 0).toFixed(2));
      const percentage = baseKg > 0 ? Number(((kg / baseKg) * 100).toFixed(1)) : 0;
      return {
        no: idx + 1,
        part_name: r.part_name || 'Part NG',
        part_number: r.part_number || '-',
        model: r.model || '-',
        total_pcs: Number(r.total_pcs || 0),
        total_kg: kg,
        percentage,
      };
    });

    // 5. Akumulasi Jenis Material Terkirim Departemen
    const [materialRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        sub.material,
        SUM(sub.quantity_pcs) AS total_pcs,
        SUM(sub.weight_kg) AS total_kg
       FROM (
         SELECT 
           COALESCE(i.material_name_snapshot, mp.material, 'Unassigned') AS material,
           i.quantity_pcs,
           i.weight_kg
         FROM crushing_request_items i
         JOIN crushing_requests r ON i.request_id = r.id
         LEFT JOIN master_parts mp ON i.master_part_id = mp.id
         WHERE ${filterClause} AND YEAR(r.request_date) = ? AND MONTH(r.request_date) = ? AND r.status != 'rejected'
       ) sub
       GROUP BY sub.material
       ORDER BY total_kg DESC
       LIMIT 10`,
      queryParams
    );

    const top_materials = materialRows.map((r, idx) => {
      const kg = Number(Number(r.total_kg || 0).toFixed(2));
      const percentage = baseKg > 0 ? Number(((kg / baseKg) * 100).toFixed(1)) : 0;
      return {
        no: idx + 1,
        material: r.material || 'Material',
        total_pcs: Number(r.total_pcs || 0),
        total_kg: kg,
        percentage,
      };
    });

    // 6. 5 Tiket Pengiriman Terkini Seluruh Departemen
    const [recentRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        r.id, r.request_number, r.sender_id, u.full_name AS sender_name, u.username AS sender_username,
        r.request_type, r.shift, r.request_date, r.status,
        r.total_weight_kg, r.total_pcs, r.notes, r.rejection_reason, r.created_at,
        (SELECT COUNT(*) FROM crushing_request_items WHERE request_id = r.id) AS item_count
       FROM crushing_requests r
       JOIN users u ON r.sender_id = u.id
       WHERE ${filterClause}
       ORDER BY r.created_at DESC
       LIMIT 5`,
      recentQueryParams
    );

    return {
      year: qYear,
      month: qMonth,
      department_id: departmentId,
      department_name: departmentName,
      department_code: departmentCode,
      factory_name: factoryName,
      total_requests: Number(s.total_requests || 0),
      pending_count: Number(s.pending_count || 0),
      approved_count: Number(s.approved_count || 0),
      rejected_count: Number(s.rejected_count || 0),
      approved_weight_kg: totalApprovedKg,
      approved_pcs: Number(s.approved_pcs || 0),
      total_submitted_weight_kg: totalSubmittedKg,
      total_pcs: Number(s.total_pcs || 0),
      daily_chart,
      top_parts,
      top_materials,
      recent_requests: recentRows.map((r) => ({
        ...r,
        total_weight_kg: Number(Number(r.total_weight_kg || 0).toFixed(2)),
      })),
    };
  }
}
