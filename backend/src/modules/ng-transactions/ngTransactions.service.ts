import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import { broadcastSseEvent } from '../../utils/sse.util';

export interface CreateNgTransactionDto {
  master_part_id: string;
  quantity_pcs: number;
  shift: 'Pagi' | 'Malam';
  transaction_date: string; // YYYY-MM-DD
  input_by: string;
  notes?: string;
}

export class NgTransactionsService {
  static async createTransaction(dto: CreateNgTransactionDto) {
    // 1. Fetch master part details for snapshot
    const [partRows] = await pool.query<RowDataPacket[]>(
      `SELECT mp.part_number, mp.part_name, mp.berat_part_gr, m.model_code
       FROM master_parts mp
       JOIN master_models m ON mp.model_id = m.id
       WHERE mp.id = ? AND mp.is_active = TRUE`,
      [dto.master_part_id]
    );

    if (partRows.length === 0) {
      throw new Error('Master part not found or inactive');
    }

    const masterPart = partRows[0];
    const id = randomUUID();

    // 2. Insert into ng_transactions with UUID
    await pool.query(
      `INSERT INTO ng_transactions
       (id, master_part_id, part_number_snapshot, part_name_snapshot, model_snapshot, berat_part_gr_snapshot, quantity_pcs, shift, transaction_date, input_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        dto.master_part_id,
        masterPart.part_number,
        masterPart.part_name,
        masterPart.model_code,
        masterPart.berat_part_gr,
        dto.quantity_pcs,
        dto.shift,
        dto.transaction_date,
        dto.input_by,
        dto.notes || null,
      ]
    );

    // 3. Fetch inserted record (including generated weight_kg)
    const [insertedRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM ng_transactions WHERE id = ?',
      [id]
    );
    const newTransaction = insertedRows[0];

    // 4. Broadcast real-time SSE event for dashboard update
    broadcastSseEvent('ng_transaction_created', newTransaction);

    return newTransaction;
  }

  static async listTransactions(page: number = 1, limit: number = 20, startDate?: string, endDate?: string) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (startDate && endDate) {
      whereClause += ' AND transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM ng_transactions ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT t.*, u.full_name AS input_by_name
       FROM ng_transactions t
       JOIN users u ON t.input_by = u.id
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      transactions: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get material pareto summary for a specific year, month, and plant location
   * All calculations & sorting happen here in backend.
   */
  static async getMaterialSummary(year: number, month: number, location: 'Cibitung' | 'Karawang' = 'Cibitung') {
    // Fetch summary by material and parts under that material in the given month and factory location
    const [partRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COALESCE(mm.material_name, mp.material, 'Unknown Material') AS material_name,
        mp.id AS master_part_id,
        mp.part_name,
        mp.part_number,
        m.model_code AS model,
        mp.allowance_kg,
        fc.location AS plant_location,
        SUM(t.weight_kg) AS total_weight_kg,
        SUM(t.quantity_pcs) AS total_quantity_pcs
       FROM ng_transactions t
       JOIN master_parts mp ON t.master_part_id = mp.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories fc ON mc.factory_id = fc.id
       JOIN master_models m ON mp.model_id = m.id
       LEFT JOIN master_materials mm ON mp.material_id = mm.id
       WHERE YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ? AND fc.location = ?
       GROUP BY COALESCE(mm.material_name, mp.material, 'Unknown Material'), mp.id, mp.part_name, mp.part_number, m.model_code, mp.allowance_kg, fc.location
       ORDER BY total_weight_kg DESC`,
      [year, month, location]
    );

    // Group by material_name in backend
    const materialMap = new Map<string, {
      material_name: string;
      total_weight_kg: number;
      total_quantity_pcs: number;
      parts: any[];
    }>();

    for (const row of partRows) {
      const matName = row.material_name;
      const weight = Number(row.total_weight_kg) || 0;
      const qty = Number(row.total_quantity_pcs) || 0;

      if (!materialMap.has(matName)) {
        materialMap.set(matName, {
          material_name: matName,
          total_weight_kg: 0,
          total_quantity_pcs: 0,
          parts: [],
        });
      }

      const matGroup = materialMap.get(matName)!;
      matGroup.total_weight_kg += weight;
      matGroup.total_quantity_pcs += qty;
      matGroup.parts.push({
        master_part_id: row.master_part_id,
        part_name: row.part_name,
        part_number: row.part_number,
        model: row.model,
        plant_location: row.plant_location,
        allowance_kg: row.allowance_kg !== null ? Number(row.allowance_kg) : null,
        total_weight_kg: Number(weight.toFixed(2)),
        total_quantity_pcs: qty,
      });
    }

    // Convert map to array and sort materials by total_weight_kg DESC
    const materials = Array.from(materialMap.values()).map((mat) => {
      // Sort parts inside each material by total_weight_kg DESC
      mat.parts.sort((a, b) => b.total_weight_kg - a.total_weight_kg);
      return {
        ...mat,
        total_weight_kg: Number(mat.total_weight_kg.toFixed(2)),
      };
    });

    materials.sort((a, b) => b.total_weight_kg - a.total_weight_kg);

    // Calculate overall max material weight for frontend progress bar calculation convenience
    const maxMaterialWeightKg = materials.length > 0 ? materials[0].total_weight_kg : 0;

    return {
      year,
      month,
      location,
      max_material_weight_kg: maxMaterialWeightKg,
      materials,
    };
  }

  /**
   * Get part monthly detail analytics for modal view:
   * - Part info, factory location & allowance
   * - Daily shift breakdown (Pagi vs Malam) for entire month
   * - Transaction logs
   */
  static async getPartMonthlyDetail(partId: string, year: number, month: number, location: 'Cibitung' | 'Karawang' = 'Cibitung') {
    // 1. Get part details with factory location join
    const [partRows] = await pool.query<RowDataPacket[]>(
      `SELECT mp.id, mp.part_name, mp.part_number, mp.allowance_kg, mp.berat_part_gr, mp.material, m.model_code, fc.location AS plant_location
       FROM master_parts mp
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories fc ON mc.factory_id = fc.id
       JOIN master_models m ON mp.model_id = m.id
       WHERE mp.id = ?`,
      [partId]
    );

    if (partRows.length === 0) {
      throw new Error('Part not found');
    }

    const part = partRows[0];

    // 2. Get daily aggregated transactions per shift for that month and location
    const [dailyRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DAY(t.transaction_date) AS day_num,
        t.transaction_date,
        t.shift,
        SUM(t.weight_kg) AS total_weight_kg,
        SUM(t.quantity_pcs) AS total_quantity_pcs
       FROM ng_transactions t
       JOIN master_parts mp ON t.master_part_id = mp.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories fc ON mc.factory_id = fc.id
       WHERE t.master_part_id = ? AND YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ? AND fc.location = ?
       GROUP BY DAY(t.transaction_date), t.transaction_date, t.shift
       ORDER BY day_num ASC`,
      [partId, year, month, location]
    );

    // Generate full days for the month (1..daysInMonth)
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyMap = new Map<number, { pagi_kg: number; malam_kg: number; pagi_pcs: number; malam_pcs: number }>();

    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap.set(d, { pagi_kg: 0, malam_kg: 0, pagi_pcs: 0, malam_pcs: 0 });
    }

    for (const row of dailyRows) {
      const dayNum = Number(row.day_num);
      const entry = dailyMap.get(dayNum) || { pagi_kg: 0, malam_kg: 0, pagi_pcs: 0, malam_pcs: 0 };
      const weight = Number(row.total_weight_kg) || 0;
      const pcs = Number(row.total_quantity_pcs) || 0;

      if (row.shift === 'Pagi') {
        entry.pagi_kg += weight;
        entry.pagi_pcs += pcs;
      } else if (row.shift === 'Malam') {
        entry.malam_kg += weight;
        entry.malam_pcs += pcs;
      }
      dailyMap.set(dayNum, entry);
    }

    const allowanceKg = part.allowance_kg !== null ? Number(part.allowance_kg) : 0;

    const dailyChart = Array.from(dailyMap.entries()).map(([dayNum, data]) => {
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
        allowance_kg: allowanceKg,
        is_exceeded: allowanceKg > 0 ? totalKg > allowanceKg : false,
      };
    });

    // 3. Get transaction log list for selected location
    const [transRows] = await pool.query<RowDataPacket[]>(
      `SELECT t.*, u.full_name AS input_by_name
       FROM ng_transactions t
       JOIN master_parts mp ON t.master_part_id = mp.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories fc ON mc.factory_id = fc.id
       JOIN users u ON t.input_by = u.id
       WHERE t.master_part_id = ? AND YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ? AND fc.location = ?
       ORDER BY t.transaction_date DESC, t.created_at DESC`,
      [partId, year, month, location]
    );

    return {
      part: {
        id: part.id,
        part_name: part.part_name,
        part_number: part.part_number,
        model: part.model_code,
        material: part.material,
        plant_location: part.plant_location || location,
        berat_part_gr: Number(part.berat_part_gr),
        allowance_kg: allowanceKg,
      },
      period: {
        year,
        month,
        location,
      },
      daily_chart: dailyChart,
      transactions: transRows,
    };
  }
}

