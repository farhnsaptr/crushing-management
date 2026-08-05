import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface ProductionActualImportRow {
  production_date: string; // YYYY-MM-DD
  sebango_code: string;
  shift: 'Pagi' | 'Malam' | 'D' | 'N';
  actual_qty_pcs: number;
  mesin?: string;
  factory?: string;
}

export class ProductionActualService {
  static async importRecords(records: ProductionActualImportRow[], batchRef?: string) {
    const importBatch = batchRef || `batch_${Date.now()}`;
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const item of records) {
      try {
        // Normalize shift: D -> Pagi, N -> Malam
        const normalizedShift: 'Pagi' | 'Malam' =
          item.shift === 'D' || item.shift === 'Pagi' ? 'Pagi' : 'Malam';

        // Lookup master part by sebango_code
        const [partRows] = await pool.query<RowDataPacket[]>(
          `SELECT mp.id AS master_part_id, mp.part_number, mp.berat_runner_gr, m.model_code
           FROM master_parts mp
           JOIN master_models m ON mp.model_id = m.id
           WHERE mp.sebango_code = ? AND mp.is_active = TRUE
           LIMIT 1`,
          [item.sebango_code]
        );

        if (partRows.length === 0) {
          failCount++;
          errors.push(`Sebango code '${item.sebango_code}' not found in master parts`);
          continue;
        }

        const masterPart = partRows[0];

        const id = randomUUID();

        // Insert or update on duplicate key (uq_part_date_shift)
        await pool.query(
          `INSERT INTO production_actual
           (id, master_part_id, part_number_snapshot, model_snapshot, berat_runner_gr_snapshot, actual_qty_pcs, shift, production_date, sebango_code_raw, mesin_raw, factory_raw, import_batch_ref)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             actual_qty_pcs = VALUES(actual_qty_pcs),
             berat_runner_gr_snapshot = VALUES(berat_runner_gr_snapshot),
             import_batch_ref = VALUES(import_batch_ref),
             synced_at = CURRENT_TIMESTAMP`,
          [
            id,
            masterPart.master_part_id,
            masterPart.part_number,
            masterPart.model_code,
            masterPart.berat_runner_gr || 0,
            item.actual_qty_pcs,
            normalizedShift,
            item.production_date,
            item.sebango_code,
            item.mesin || null,
            item.factory || null,
            importBatch,
          ]
        );

        successCount++;
      } catch (err: any) {
        failCount++;
        errors.push(`Error importing sebango '${item.sebango_code}': ${err.message}`);
      }
    }

    return {
      batchRef: importBatch,
      successCount,
      failCount,
      errors,
    };
  }

  static async listRecords(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM production_actual'
    );
    const total = countRows[0].total;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT pa.*, mp.part_name
       FROM production_actual pa
       JOIN master_parts mp ON pa.master_part_id = mp.id
       ORDER BY pa.production_date DESC, pa.id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return {
      records: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
