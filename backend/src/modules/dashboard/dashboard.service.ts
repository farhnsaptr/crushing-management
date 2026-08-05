import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';

export class DashboardService {
  static async getSummaryStats(startDate?: string, endDate?: string) {
    let ngWhere = 'WHERE 1=1';
    let prodWhere = 'WHERE 1=1';
    const ngParams: any[] = [];
    const prodParams: any[] = [];

    if (startDate && endDate) {
      ngWhere += ' AND transaction_date BETWEEN ? AND ?';
      ngParams.push(startDate, endDate);

      prodWhere += ' AND production_date BETWEEN ? AND ?';
      prodParams.push(startDate, endDate);
    }

    const [inputRows] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(weight_kg), 0) AS total_input_kg,
              COALESCE(SUM(quantity_pcs), 0) AS total_input_pcs
       FROM ng_transactions ${ngWhere}`,
      ngParams
    );

    const [runnerRows] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(runner_weight_kg), 0) AS total_runner_kg,
              COALESCE(SUM(actual_qty_pcs), 0) AS total_actual_pcs
       FROM production_actual ${prodWhere}`,
      prodParams
    );

    const inputKg = Number(inputRows[0].total_input_kg);
    const runnerKg = Number(runnerRows[0].total_runner_kg);
    const outputKg = inputKg + runnerKg;
    const wasteKg = (inputKg + runnerKg) - outputKg; // 0 by design

    return {
      input_kg: parseFloat(inputKg.toFixed(3)),
      runner_kg: parseFloat(runnerKg.toFixed(3)),
      output_kg: parseFloat(outputKg.toFixed(3)),
      waste_kg: parseFloat(wasteKg.toFixed(3)),
      input_pcs: Number(inputRows[0].total_input_pcs),
      actual_pcs: Number(runnerRows[0].total_actual_pcs),
    };
  }

  static async getDailyChartData(startDate?: string, endDate?: string) {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (startDate && endDate) {
      whereClause += ' AND transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT transaction_date, shift, total_kg, total_pcs
       FROM v_daily_recycle_summary
       ${whereClause}
       ORDER BY transaction_date ASC`,
      params
    );

    return rows;
  }

  static async getParetoMaterial() {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT material, total_kg, total_pcs, total_transaksi FROM v_pareto_material'
    );
    return rows;
  }

  static async getTopNgParts() {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT part_number, part_name, model, total_pcs, total_kg FROM v_part_ng_terbanyak LIMIT 10'
    );
    return rows;
  }
}
