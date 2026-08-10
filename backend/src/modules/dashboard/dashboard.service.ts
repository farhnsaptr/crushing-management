import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import * as XLSX from 'xlsx';

export class DashboardService {
  static async getSummaryStats(year?: number, month?: number, location: string = 'Cibitung') {
    const now = new Date();
    const qYear = year || now.getFullYear();
    const qMonth = month || now.getMonth() + 1;

    const [inputRows] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(t.weight_kg), 0) AS total_input_kg,
              COALESCE(SUM(t.quantity_pcs), 0) AS total_input_pcs
       FROM ng_transactions t
       JOIN master_parts mp ON t.master_part_id = mp.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories fc ON mc.factory_id = fc.id
       WHERE YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ? AND fc.location = ?`,
      [qYear, qMonth, location]
    );

    const inputKg = Number(inputRows[0].total_input_kg) || 0;
    const inputPcs = Number(inputRows[0].total_input_pcs) || 0;
    const outputKg = inputKg; // Total output matches input
    const wasteKg = Number((outputKg - inputKg).toFixed(3)); // Output - Input

    return {
      year: qYear,
      month: qMonth,
      location,
      input_kg: parseFloat(inputKg.toFixed(3)),
      output_kg: parseFloat(outputKg.toFixed(3)),
      waste_kg: wasteKg,
      input_pcs: inputPcs,
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

    const totalAllowanceKg = Number(Number(allowanceRows[0]?.total_allowance_kg || 0).toFixed(3));

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DAY(t.transaction_date) AS day_num,
        t.transaction_date,
        t.shift,
        SUM(t.weight_kg) AS total_kg,
        SUM(t.quantity_pcs) AS total_pcs
       FROM ng_transactions t
       JOIN master_parts mp ON t.master_part_id = mp.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories fc ON mc.factory_id = fc.id
       WHERE YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ? AND fc.location = ?
       GROUP BY DAY(t.transaction_date), t.transaction_date, t.shift
       ORDER BY day_num ASC`,
      [qYear, qMonth, location]
    );

    // Generate full days for the month (1..daysInMonth)
    const daysInMonth = new Date(qYear, qMonth, 0).getDate();
    const dayMap = new Map<number, { pagi_kg: number; malam_kg: number; pagi_pcs: number; malam_pcs: number }>();

    for (let d = 1; d <= daysInMonth; d++) {
      dayMap.set(d, { pagi_kg: 0, malam_kg: 0, pagi_pcs: 0, malam_pcs: 0 });
    }

    for (const r of rows) {
      const dayNum = Number(r.day_num);
      const entry = dayMap.get(dayNum) || { pagi_kg: 0, malam_kg: 0, pagi_pcs: 0, malam_pcs: 0 };
      const weight = Number(r.total_kg) || 0;
      const pcs = Number(r.total_pcs) || 0;

      if (r.shift === 'Pagi') {
        entry.pagi_kg += weight;
        entry.pagi_pcs += pcs;
      } else if (r.shift === 'Malam') {
        entry.malam_kg += weight;
        entry.malam_pcs += pcs;
      }
      dayMap.set(dayNum, entry);
    }

    const chartItems = Array.from(dayMap.entries()).map(([dayNum, data]) => {
      const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
      const pagiKg = Number(data.pagi_kg.toFixed(3));
      const malamKg = Number(data.malam_kg.toFixed(3));
      const totalKg = Number((pagiKg + malamKg).toFixed(3));
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
        COALESCE(mm.material_name, mp.material, 'Unknown Material') AS material,
        SUM(t.weight_kg) AS total_kg,
        SUM(t.quantity_pcs) AS total_pcs
       FROM ng_transactions t
       JOIN master_parts mp ON t.master_part_id = mp.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories fc ON mc.factory_id = fc.id
       LEFT JOIN master_materials mm ON mp.material_id = mm.id
       WHERE YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ? AND fc.location = ?
       GROUP BY COALESCE(mm.material_name, mp.material, 'Unknown Material')
       ORDER BY total_kg DESC
       LIMIT 10`,
      [qYear, qMonth, location]
    );

    return rows.map((r, index) => ({
      no: index + 1,
      material: r.material,
      total_kg: Number(Number(r.total_kg).toFixed(3)),
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
      total_kg: Number(Number(r.total_kg).toFixed(3)),
    }));
  }

  /**
   * Generate Excel spreadsheet (.xlsx) for NG transactions within date range & location.
   * Columns requested:
   * tanggal, shift, sebango, part name, part number, model, berat part, qty per pcs, berat output
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

    const [rows] = await pool.query<RowDataPacket[]>(
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

    const wb = XLSX.utils.book_new();

    // Custom exact columns requested by user:
    // tanggal, shift, sebango, part name, part number, model, berat part, qty per pcs, berat output
    const excelHeader = [
      'tanggal',
      'shift',
      'sebango',
      'part name',
      'part number',
      'model',
      'berat part',
      'qty per pcs',
      'berat output',
    ];

    const excelRows = rows.map((r) => [
      r.tanggal,
      r.shift,
      r.sebango || '-',
      r.part_name,
      r.part_number,
      r.model,
      Number(r.berat_part),
      Number(r.qty_per_pcs),
      Number(Number(r.berat_output).toFixed(3)),
    ]);

    const sheetData = [excelHeader, ...excelRows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Auto-fit column widths
    const colWidths = [
      { wch: 14 }, // tanggal
      { wch: 10 }, // shift
      { wch: 16 }, // sebango
      { wch: 32 }, // part name
      { wch: 22 }, // part number
      { wch: 12 }, // model
      { wch: 14 }, // berat part
      { wch: 14 }, // qty per pcs
      { wch: 14 }, // berat output
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Transaksi NG');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
}
