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
}
