import { randomUUID } from 'crypto';
import { RowDataPacket } from 'mysql2';
import { pool } from '../../config/database';
import { broadcastSseEvent } from '../../utils/sse.util';
import { JwtPayloadUser } from '../../middlewares/auth.middleware';
import { resolveEffectiveMaterial } from '../materials/effectiveMaterial';

export interface ListRequestsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'pending' | 'approved';
  startDate?: string;
  endDate?: string;
  shift?: string;
  departmentId?: string;
  factoryId?: string;
}

export interface UpdateRequestHeaderDto {
  request_date?: string;
  shift?: 'Pagi' | 'Malam';
  department_id?: string;
  factory_id?: string | null;
  notes?: string | null;
}

export interface AddItemToRequestDto {
  item_type: 'part_ng' | 'runner_ng';
  master_part_id?: string;
  material_id?: string;
  quantity_pcs?: number;
  weight_kg?: number;
  notes?: string;
}

export interface UpdateRequestItemDto {
  quantity_pcs?: number;
  weight_kg?: number;
  verified_quantity_pcs?: number;
  verified_weight_kg?: number;
  adjustment_notes?: string | null;
  waste_quantity_pcs?: number;
  notes?: string | null;
}

export class DatabaseManagementService {
  /**
   * List crushing requests with search, filter, and pagination
   */
  static async listRequests(params: ListRequestsParams) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const values: any[] = [];

    if (params.search && params.search.trim()) {
      const q = `%${params.search.trim()}%`;
      conditions.push(`(
        cr.request_number LIKE ? OR
        u.full_name LIKE ? OR
        u.username LIKE ? OR
        d.name LIKE ? OR
        f.name LIKE ? OR
        cr.id IN (
          SELECT cri.request_id FROM crushing_request_items cri
          WHERE cri.part_number_snapshot LIKE ? OR cri.part_name_snapshot LIKE ? OR cri.material_name_snapshot LIKE ?
        )
      )`);
      values.push(q, q, q, q, q, q, q, q);
    }

    if (params.status && params.status !== 'all') {
      conditions.push('cr.status = ?');
      values.push(params.status);
    }

    if (params.startDate) {
      conditions.push('cr.request_date >= ?');
      values.push(params.startDate);
    }

    if (params.endDate) {
      conditions.push('cr.request_date <= ?');
      values.push(params.endDate);
    }

    if (params.shift && (params.shift === 'Pagi' || params.shift === 'Malam')) {
      conditions.push('cr.shift = ?');
      values.push(params.shift);
    }

    if (params.departmentId) {
      conditions.push('cr.department_id = ?');
      values.push(params.departmentId);
    }

    if (params.factoryId) {
      conditions.push('cr.factory_id = ?');
      values.push(params.factoryId);
    }

    const whereClause = conditions.join(' AND ');

    // Count total rows
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM crushing_requests cr
       LEFT JOIN users u ON cr.sender_id = u.id
       LEFT JOIN departments d ON cr.department_id = d.id
       LEFT JOIN factories f ON cr.factory_id = f.id
       WHERE ${whereClause}`,
      values
    );
    const total = Number(countRows[0]?.total) || 0;

    // Fetch items with counts
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        cr.id, cr.request_number, cr.request_date, cr.shift, cr.status, cr.request_type,
        cr.total_weight_kg, cr.total_pcs, cr.notes, cr.created_at, cr.submitted_at,
        cr.sender_id, u.full_name AS sender_name, u.username AS sender_username,
        cr.department_id, d.name AS department_name, d.code AS department_code,
        cr.factory_id, f.name AS factory_name, f.code AS factory_code, f.location AS factory_location,
        cr.validated_by, v.full_name AS validator_name, cr.validated_at,
        (SELECT COUNT(*) FROM crushing_request_items cri WHERE cri.request_id = cr.id) AS items_count,
        (SELECT COUNT(*) FROM ng_transactions nt WHERE nt.request_id = cr.id) AS ng_transactions_count,
        (SELECT COUNT(*) FROM runner_material_transactions rmt WHERE rmt.request_id = cr.id) AS runner_transactions_count
       FROM crushing_requests cr
       LEFT JOIN users u ON cr.sender_id = u.id
       LEFT JOIN departments d ON cr.department_id = d.id
       LEFT JOIN factories f ON cr.factory_id = f.id
       LEFT JOIN users v ON cr.validated_by = v.id
       WHERE ${whereClause}
       ORDER BY cr.request_date DESC, cr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return {
      requests: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single crushing request detail along with its items and generated transactions
   */
  static async getRequestDetail(requestId: string) {
    const [reqRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        cr.id, cr.request_number, cr.request_date, cr.shift, cr.status, cr.request_type,
        cr.total_weight_kg, cr.total_pcs, cr.notes, cr.created_at, cr.submitted_at,
        cr.sender_id, u.full_name AS sender_name, u.username AS sender_username,
        cr.department_id, d.name AS department_name, d.code AS department_code,
        cr.factory_id, f.name AS factory_name, f.code AS factory_code, f.location AS factory_location,
        cr.validated_by, v.full_name AS validator_name, cr.validated_at
       FROM crushing_requests cr
       LEFT JOIN users u ON cr.sender_id = u.id
       LEFT JOIN departments d ON cr.department_id = d.id
       LEFT JOIN factories f ON cr.factory_id = f.id
       LEFT JOIN users v ON cr.validated_by = v.id
       WHERE cr.id = ?`,
      [requestId]
    );

    if (!reqRows.length) {
      throw new Error(`Tiket pengiriman ID '${requestId}' tidak ditemukan.`);
    }

    const request = reqRows[0];

    // Fetch items
    const [items] = await pool.query<RowDataPacket[]>(
      `SELECT 
        cri.id, cri.request_id, cri.item_type, cri.master_part_id, cri.material_id,
        cri.part_number_snapshot, cri.part_name_snapshot, cri.model_snapshot,
        cri.material_name_snapshot, cri.berat_part_gr_snapshot,
        cri.quantity_pcs, cri.weight_kg,
        cri.verified_quantity_pcs, cri.verified_weight_kg,
        cri.adjustment_notes, cri.waste_quantity_pcs, cri.notes, cri.created_at,
        mp.image_url, mp.sebango_code, mp.customer
       FROM crushing_request_items cri
       LEFT JOIN master_parts mp ON cri.master_part_id = mp.id
       WHERE cri.request_id = ?
       ORDER BY cri.created_at ASC`,
      [requestId]
    );

    // Fetch linked transactions
    const [ngTrx] = await pool.query<RowDataPacket[]>(
      `SELECT id, master_part_id, part_number_snapshot, part_name_snapshot, quantity_pcs, weight_kg, recycle_type_snapshot, shift, transaction_date, notes
       FROM ng_transactions
       WHERE request_id = ?`,
      [requestId]
    );

    const [runnerTrx] = await pool.query<RowDataPacket[]>(
      `SELECT id, material_id, material_name_snapshot, total_pcs, total_runner_weight_kg, shift, transaction_date, import_batch_ref
       FROM runner_material_transactions
       WHERE request_id = ?`,
      [requestId]
    );

    return {
      request,
      items,
      linked_transactions: {
        ng_transactions: ngTrx,
        runner_transactions: runnerTrx,
      },
    };
  }

  /**
   * Unapprove request (Hapus / Batalkan Approve):
   * 1. Hapus transaksi terkait di ng_transactions & runner_material_transactions
   * 2. Reset verified fields di crushing_request_items
   * 3. Set status = 'pending', validated_by = NULL, validated_at = NULL
   * 4. Recalculate original totals
   */
  static async unapproveRequest(requestId: string, user: JwtPayloadUser, reason?: string) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT id, request_number, status FROM crushing_requests WHERE id = ? FOR UPDATE',
        [requestId]
      );

      if (!rows.length) {
        throw new Error('Tiket tidak ditemukan');
      }

      const req = rows[0];
      if (req.status !== 'approved') {
        throw new Error(`Tiket ${req.request_number} belum disetujui (status saat ini: ${req.status})`);
      }

      // 1. Delete linked transactions
      const [delNgResult]: any = await conn.query(
        'DELETE FROM ng_transactions WHERE request_id = ?',
        [requestId]
      );
      const [delRunnerResult]: any = await conn.query(
        'DELETE FROM runner_material_transactions WHERE request_id = ?',
        [requestId]
      );

      // 2. Reset item verifications
      await conn.query(
        `UPDATE crushing_request_items
         SET verified_quantity_pcs = NULL,
             verified_weight_kg = NULL,
             adjustment_notes = NULL,
             waste_quantity_pcs = 0
         WHERE request_id = ?`,
        [requestId]
      );

      // 3. Recalculate totals from original sender values
      const [sumRows] = await conn.query<RowDataPacket[]>(
        `SELECT 
          COALESCE(SUM(quantity_pcs), 0) AS original_pcs,
          COALESCE(SUM(weight_kg), 0.000) AS original_weight
         FROM crushing_request_items
         WHERE request_id = ?`,
        [requestId]
      );

      const originalPcs = Number(sumRows[0]?.original_pcs) || 0;
      const originalWeight = Number(Number(sumRows[0]?.original_weight || 0).toFixed(2));

      const noteAddition = reason?.trim()
        ? ` [Approval dibatalkan Super Admin (${user.username}): ${reason.trim()}]`
        : ` [Approval dibatalkan Super Admin (${user.username})]`;

      await conn.query(
        `UPDATE crushing_requests
         SET status = 'pending',
             validated_by = NULL,
             validated_at = NULL,
             total_pcs = ?,
             total_weight_kg = ?,
             notes = CONCAT(COALESCE(notes, ''), ?)
         WHERE id = ?`,
        [originalPcs, originalWeight, noteAddition, requestId]
      );

      await conn.commit();

      // Broadcast SSE
      broadcastSseEvent('crushing_request_unapproved', {
        requestId,
        requestNumber: req.request_number,
        unapprovedBy: user.full_name,
        deletedNgTransactionsCount: delNgResult.affectedRows || 0,
        deletedRunnerTransactionsCount: delRunnerResult.affectedRows || 0,
      });

      return {
        id: requestId,
        request_number: req.request_number,
        status: 'pending',
        deleted_ng_transactions: delNgResult.affectedRows || 0,
        deleted_runner_transactions: delRunnerResult.affectedRows || 0,
        message: `Approval tiket ${req.request_number} berhasil dibatalkan. Tiket kembali ke antrian Pending dan seluruh transaksi terkait telah dihapus.`,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Delete request permanently along with its items and transactions
   */
  static async deleteRequest(requestId: string, user: JwtPayloadUser) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT id, request_number, status FROM crushing_requests WHERE id = ? FOR UPDATE',
        [requestId]
      );

      if (!rows.length) {
        throw new Error('Tiket tidak ditemukan');
      }

      const req = rows[0];

      // 1. Delete linked transactions first
      await conn.query('DELETE FROM ng_transactions WHERE request_id = ?', [requestId]);
      await conn.query('DELETE FROM runner_material_transactions WHERE request_id = ?', [requestId]);

      // 2. Delete items & request
      await conn.query('DELETE FROM crushing_request_items WHERE request_id = ?', [requestId]);
      await conn.query('DELETE FROM crushing_requests WHERE id = ?', [requestId]);

      await conn.commit();

      broadcastSseEvent('crushing_request_cancelled', {
        requestId,
        requestNumber: req.request_number,
        deletedBy: user.full_name,
      });

      return {
        id: requestId,
        request_number: req.request_number,
        deleted: true,
        message: `Tiket ${req.request_number} dan seluruh data terkait berhasil dihapus permanen.`,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Update request header (date, shift, department, factory, notes)
   */
  static async updateRequestHeader(
    requestId: string,
    dto: UpdateRequestHeaderDto,
    _user: JwtPayloadUser
  ) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT id, request_number, status, request_date, shift, department_id, factory_id FROM crushing_requests WHERE id = ? FOR UPDATE',
        [requestId]
      );

      if (!rows.length) {
        throw new Error('Tiket tidak ditemukan');
      }

      const req = rows[0];
      const newDate = dto.request_date || req.request_date;
      const newShift = dto.shift || req.shift;
      const newDeptId = dto.department_id || req.department_id;
      const newFactoryId = dto.factory_id !== undefined ? dto.factory_id : req.factory_id;
      const newNotes = dto.notes !== undefined ? dto.notes : null;

      await conn.query(
        `UPDATE crushing_requests
         SET request_date = ?, shift = ?, department_id = ?, factory_id = ?,
             notes = COALESCE(?, notes)
         WHERE id = ?`,
        [newDate, newShift, newDeptId, newFactoryId, newNotes, requestId]
      );

      // If approved, sync header changes to linked transactions!
      if (req.status === 'approved') {
        await conn.query(
          `UPDATE ng_transactions
           SET transaction_date = ?, shift = ?, department_id = ?, factory_id = ?
           WHERE request_id = ?`,
          [newDate, newShift, newDeptId, newFactoryId, requestId]
        );

        await conn.query(
          `UPDATE runner_material_transactions
           SET transaction_date = ?, shift = ?, department_id = ?, factory_id = ?
           WHERE request_id = ?`,
          [newDate, newShift, newDeptId, newFactoryId, requestId]
        );
      }

      await conn.commit();

      broadcastSseEvent('crushing_request_updated', {
        requestId,
        requestNumber: req.request_number,
      });

      return {
        id: requestId,
        request_number: req.request_number,
        message: 'Data header tiket berhasil diperbarui.',
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Add new part (item) to an existing request (whether pending or approved)
   */
  static async addItemToRequest(
    requestId: string,
    dto: AddItemToRequestDto,
    user: JwtPayloadUser
  ) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM crushing_requests WHERE id = ? FOR UPDATE',
        [requestId]
      );

      if (!rows.length) {
        throw new Error('Tiket tidak ditemukan');
      }

      const req = rows[0];
      const itemId = randomUUID();

      let partNumberSnapshot: string | null = null;
      let partNameSnapshot: string | null = null;
      let modelSnapshot: string | null = null;
      let materialNameSnapshot: string | null = null;
      let beratPartGrSnapshot = 0;
      let quantityPcs = Math.max(0, Number(dto.quantity_pcs) || 0);
      let weightKg = 0;

      if (dto.item_type === 'part_ng') {
        if (!dto.master_part_id) {
          throw new Error('master_part_id wajib diisi untuk item part_ng');
        }

        const [partRows] = await conn.query<RowDataPacket[]>(
          `SELECT mp.id, mp.part_number, mp.part_name, mp.berat_part_gr, mp.material_id, mp.material,
                  mm.model_name, mc.factory_id
           FROM master_parts mp
           LEFT JOIN master_models mm ON mp.model_id = mm.id
           LEFT JOIN machines mc ON mp.machine_id = mc.id
           WHERE mp.id = ?`,
          [dto.master_part_id]
        );

        if (!partRows.length) {
          throw new Error('Master Part tidak ditemukan');
        }

        const p = partRows[0];
        partNumberSnapshot = p.part_number;
        partNameSnapshot = p.part_name;
        modelSnapshot = p.model_name || 'N/A';
        beratPartGrSnapshot = Number(p.berat_part_gr) || 0;
        weightKg = beratPartGrSnapshot > 0 ? Number(((quantityPcs * beratPartGrSnapshot) / 1000).toFixed(2)) : 0;

        const effMat = await resolveEffectiveMaterial(p.material_id);
        materialNameSnapshot = effMat?.name || p.material || 'Material';

        const isApproved = req.status === 'approved';
        const verifiedQty = isApproved ? quantityPcs : null;
        const verifiedWeight = isApproved ? weightKg : null;

        await conn.query(
          `INSERT INTO crushing_request_items
           (id, request_id, item_type, master_part_id, material_id,
            part_number_snapshot, part_name_snapshot, model_snapshot, material_name_snapshot, berat_part_gr_snapshot,
            quantity_pcs, weight_kg, verified_quantity_pcs, verified_weight_kg, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            requestId,
            'part_ng',
            p.id,
            p.material_id,
            partNumberSnapshot,
            partNameSnapshot,
            modelSnapshot,
            materialNameSnapshot,
            beratPartGrSnapshot,
            quantityPcs,
            weightKg,
            verifiedQty,
            verifiedWeight,
            dto.notes || 'Ditambahkan oleh Super Admin',
          ]
        );

        // If ticket is already approved, generate corresponding ng_transactions!
        if (isApproved && quantityPcs > 0) {
          const forceNoReuse = effMat?.recycle_type === 'no_reuse';
          await conn.query(
            `INSERT INTO ng_transactions
             (id, master_part_id, request_id, department_id, factory_id, material_name_snapshot, part_number_snapshot, part_name_snapshot, model_snapshot, berat_part_gr_snapshot, quantity_pcs, recycle_type_snapshot, shift, transaction_date, input_by, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              randomUUID(),
              p.id,
              requestId,
              req.department_id,
              req.factory_id || p.factory_id || null,
              materialNameSnapshot,
              partNumberSnapshot,
              partNameSnapshot,
              modelSnapshot,
              beratPartGrSnapshot,
              quantityPcs,
              forceNoReuse ? 'no_reuse' : 'reuse',
              req.shift,
              req.request_date,
              user.id,
              `[Ditambahkan Super Admin ke ${req.request_number}] ${dto.notes || ''}`.trim(),
            ]
          );
        }
      } else {
        // runner_ng
        weightKg = Math.max(0, Number(Number(dto.weight_kg || 0).toFixed(2)));
        quantityPcs = Math.max(0, Number(dto.quantity_pcs) || 0);

        let runnerMatId: string | null = dto.material_id || null;
        if (runnerMatId) {
          const effMat = await resolveEffectiveMaterial(runnerMatId);
          materialNameSnapshot = effMat?.name || 'Runner Material';
        } else {
          materialNameSnapshot = 'Runner Material';
        }

        const isApproved = req.status === 'approved';
        const verifiedQty = isApproved ? quantityPcs : null;
        const verifiedWeight = isApproved ? weightKg : null;

        await conn.query(
          `INSERT INTO crushing_request_items
           (id, request_id, item_type, master_part_id, material_id,
            part_number_snapshot, part_name_snapshot, model_snapshot, material_name_snapshot, berat_part_gr_snapshot,
            quantity_pcs, weight_kg, verified_quantity_pcs, verified_weight_kg, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            requestId,
            'runner_ng',
            null,
            runnerMatId,
            null,
            'Runner Material',
            null,
            materialNameSnapshot,
            0,
            quantityPcs,
            weightKg,
            verifiedQty,
            verifiedWeight,
            dto.notes || 'Ditambahkan oleh Super Admin',
          ]
        );

        if (isApproved && weightKg > 0) {
          await conn.query(
            `INSERT INTO runner_material_transactions
             (id, material_id, request_id, department_id, factory_id, material_name_snapshot, total_pcs, total_runner_weight_kg, transaction_date, shift, import_batch_ref)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              randomUUID(),
              runnerMatId,
              requestId,
              req.department_id,
              req.factory_id,
              materialNameSnapshot,
              quantityPcs,
              weightKg,
              req.request_date,
              req.shift,
              `Pengiriman: ${req.request_number} (Ditambahkan Super Admin)`,
            ]
          );
        }
      }

      // Recalculate totals on crushing_requests
      await this.recalculateRequestTotals(conn, requestId, req.status === 'approved');

      await conn.commit();

      broadcastSseEvent('crushing_request_updated', {
        requestId,
        requestNumber: req.request_number,
      });

      return {
        item_id: itemId,
        message: 'Part berhasil ditambahkan ke tiket.',
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Add multiple parts (batch items) to an existing request in a single transaction
   */
  static async addItemsBatchToRequest(
    requestId: string,
    items: AddItemToRequestDto[],
    user: JwtPayloadUser
  ) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Daftar part yang akan ditambahkan tidak boleh kosong.');
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM crushing_requests WHERE id = ? FOR UPDATE',
        [requestId]
      );

      if (!rows.length) {
        throw new Error('Tiket tidak ditemukan');
      }

      const req = rows[0];
      const isApproved = req.status === 'approved';
      const createdItemIds: string[] = [];

      for (const dto of items) {
        const itemId = randomUUID();
        createdItemIds.push(itemId);

        let partNumberSnapshot: string | null = null;
        let partNameSnapshot: string | null = null;
        let modelSnapshot: string | null = null;
        let materialNameSnapshot: string | null = null;
        let beratPartGrSnapshot = 0;
        let quantityPcs = Math.max(0, Number(dto.quantity_pcs) || 0);
        let weightKg = 0;

        if (dto.item_type === 'part_ng') {
          if (!dto.master_part_id) {
            throw new Error('master_part_id wajib diisi untuk item part_ng');
          }

          const [partRows] = await conn.query<RowDataPacket[]>(
            `SELECT mp.id, mp.part_number, mp.part_name, mp.berat_part_gr, mp.material_id, mp.material,
                    mm.model_name, mc.factory_id
             FROM master_parts mp
             LEFT JOIN master_models mm ON mp.model_id = mm.id
             LEFT JOIN machines mc ON mp.machine_id = mc.id
             WHERE mp.id = ?`,
            [dto.master_part_id]
          );

          if (!partRows.length) {
            throw new Error(`Master Part ID '${dto.master_part_id}' tidak ditemukan`);
          }

          const p = partRows[0];
          partNumberSnapshot = p.part_number;
          partNameSnapshot = p.part_name;
          modelSnapshot = p.model_name || 'N/A';
          beratPartGrSnapshot = Number(p.berat_part_gr) || 0;
          weightKg =
            beratPartGrSnapshot > 0
              ? Number(((quantityPcs * beratPartGrSnapshot) / 1000).toFixed(2))
              : Number(dto.weight_kg || 0);

          const effMat = await resolveEffectiveMaterial(p.material_id);
          materialNameSnapshot = effMat?.name || p.material || 'Material';

          const verifiedQty = isApproved ? quantityPcs : null;
          const verifiedWeight = isApproved ? weightKg : null;

          await conn.query(
            `INSERT INTO crushing_request_items
             (id, request_id, item_type, master_part_id, material_id,
              part_number_snapshot, part_name_snapshot, model_snapshot, material_name_snapshot, berat_part_gr_snapshot,
              quantity_pcs, weight_kg, verified_quantity_pcs, verified_weight_kg, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              itemId,
              requestId,
              'part_ng',
              p.id,
              p.material_id,
              partNumberSnapshot,
              partNameSnapshot,
              modelSnapshot,
              materialNameSnapshot,
              beratPartGrSnapshot,
              quantityPcs,
              weightKg,
              verifiedQty,
              verifiedWeight,
              dto.notes || 'Ditambahkan oleh Super Admin',
            ]
          );

          if (isApproved && quantityPcs > 0) {
            const forceNoReuse = effMat?.recycle_type === 'no_reuse';
            await conn.query(
              `INSERT INTO ng_transactions
               (id, master_part_id, request_id, department_id, factory_id, material_name_snapshot, part_number_snapshot, part_name_snapshot, model_snapshot, berat_part_gr_snapshot, quantity_pcs, recycle_type_snapshot, shift, transaction_date, input_by, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                randomUUID(),
                p.id,
                requestId,
                req.department_id,
                req.factory_id || p.factory_id || null,
                materialNameSnapshot,
                partNumberSnapshot,
                partNameSnapshot,
                modelSnapshot,
                beratPartGrSnapshot,
                quantityPcs,
                forceNoReuse ? 'no_reuse' : 'reuse',
                req.shift,
                req.request_date,
                user.id,
                `[Ditambahkan Super Admin ke ${req.request_number}] ${dto.notes || ''}`.trim(),
              ]
            );
          }
        } else {
          // runner_ng
          weightKg = Math.max(0, Number(Number(dto.weight_kg || 0).toFixed(2)));
          quantityPcs = Math.max(0, Number(dto.quantity_pcs) || 0);

          let runnerMatId: string | null = dto.material_id || null;
          if (runnerMatId) {
            const effMat = await resolveEffectiveMaterial(runnerMatId);
            materialNameSnapshot = effMat?.name || 'Runner Material';
          } else {
            materialNameSnapshot = 'Runner Material';
          }

          const verifiedQty = isApproved ? quantityPcs : null;
          const verifiedWeight = isApproved ? weightKg : null;

          await conn.query(
            `INSERT INTO crushing_request_items
             (id, request_id, item_type, master_part_id, material_id,
              part_number_snapshot, part_name_snapshot, model_snapshot, material_name_snapshot, berat_part_gr_snapshot,
              quantity_pcs, weight_kg, verified_quantity_pcs, verified_weight_kg, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              itemId,
              requestId,
              'runner_ng',
              null,
              runnerMatId,
              null,
              'Runner Material',
              null,
              materialNameSnapshot,
              0,
              quantityPcs,
              weightKg,
              verifiedQty,
              verifiedWeight,
              dto.notes || 'Ditambahkan oleh Super Admin',
            ]
          );

          if (isApproved && weightKg > 0) {
            await conn.query(
              `INSERT INTO runner_material_transactions
               (id, material_id, request_id, department_id, factory_id, material_name_snapshot, total_pcs, total_runner_weight_kg, transaction_date, shift, import_batch_ref)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                randomUUID(),
                runnerMatId,
                requestId,
                req.department_id,
                req.factory_id,
                materialNameSnapshot,
                quantityPcs,
                weightKg,
                req.request_date,
                req.shift,
                `Pengiriman: ${req.request_number} (Ditambahkan Super Admin)`,
              ]
            );
          }
        }
      }

      // Recalculate totals once
      await this.recalculateRequestTotals(conn, requestId, isApproved);

      await conn.commit();

      broadcastSseEvent('crushing_request_updated', {
        requestId,
        requestNumber: req.request_number,
      });

      return {
        item_ids: createdItemIds,
        count: createdItemIds.length,
        message: `${createdItemIds.length} part berhasil ditambahkan ke tiket ${req.request_number}.`,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Update quantity / notes of an individual item in a request
   */
  static async updateRequestItem(
    requestId: string,
    itemId: string,
    dto: UpdateRequestItemDto,
    _user: JwtPayloadUser
  ) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [reqRows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM crushing_requests WHERE id = ? FOR UPDATE',
        [requestId]
      );
      if (!reqRows.length) throw new Error('Tiket tidak ditemukan');
      const req = reqRows[0];

      const [itemRows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM crushing_request_items WHERE id = ? AND request_id = ? FOR UPDATE',
        [itemId, requestId]
      );
      if (!itemRows.length) throw new Error('Item tidak ditemukan di tiket ini');
      const item = itemRows[0];

      const isApproved = req.status === 'approved';

      const newQty = dto.quantity_pcs !== undefined ? Math.max(0, Number(dto.quantity_pcs)) : item.quantity_pcs;
      let newWeight = item.weight_kg;

      if (item.item_type === 'part_ng') {
        const beratGr = Number(item.berat_part_gr_snapshot) || 0;
        newWeight = beratGr > 0 ? Number(((newQty * beratGr) / 1000).toFixed(2)) : item.weight_kg;
      } else if (dto.weight_kg !== undefined) {
        newWeight = Math.max(0, Number(Number(dto.weight_kg).toFixed(2)));
      }

      let newVerifiedQty = item.verified_quantity_pcs;
      let newVerifiedWeight = item.verified_weight_kg;
      let newWasteQty = item.waste_quantity_pcs;

      if (isApproved) {
        newVerifiedQty = dto.verified_quantity_pcs !== undefined
          ? Math.max(0, Number(dto.verified_quantity_pcs))
          : (dto.quantity_pcs !== undefined ? newQty : item.verified_quantity_pcs ?? newQty);

        if (item.item_type === 'part_ng') {
          const beratGr = Number(item.berat_part_gr_snapshot) || 0;
          newVerifiedWeight = dto.verified_weight_kg !== undefined
            ? Math.max(0, Number(Number(dto.verified_weight_kg).toFixed(2)))
            : (beratGr > 0 ? Number(((newVerifiedQty * beratGr) / 1000).toFixed(2)) : newWeight);
        } else {
          newVerifiedWeight = dto.verified_weight_kg !== undefined
            ? Math.max(0, Number(Number(dto.verified_weight_kg).toFixed(2)))
            : newWeight;
        }

        if (dto.waste_quantity_pcs !== undefined) {
          newWasteQty = Math.max(0, Number(dto.waste_quantity_pcs));
        }
      }

      await conn.query(
        `UPDATE crushing_request_items
         SET quantity_pcs = ?, weight_kg = ?,
             verified_quantity_pcs = ?, verified_weight_kg = ?,
             waste_quantity_pcs = ?,
             adjustment_notes = COALESCE(?, adjustment_notes),
             notes = COALESCE(?, notes)
         WHERE id = ?`,
        [
          newQty,
          newWeight,
          newVerifiedQty,
          newVerifiedWeight,
          newWasteQty,
          dto.adjustment_notes !== undefined ? dto.adjustment_notes : null,
          dto.notes !== undefined ? dto.notes : null,
          itemId,
        ]
      );

      // If approved, update linked transactions!
      if (isApproved) {
        if (item.item_type === 'part_ng' && item.master_part_id) {
          // Re-sync ng_transactions for this master part under this request
          // Delete existing for this part and recreate with new verified values
          await conn.query(
            'DELETE FROM ng_transactions WHERE request_id = ? AND master_part_id = ?',
            [requestId, item.master_part_id]
          );

          if (newVerifiedQty > 0) {
            const effMat = await resolveEffectiveMaterial(item.material_id);
            const forceNoReuse = effMat?.recycle_type === 'no_reuse';
            const reuseQty = forceNoReuse ? 0 : Math.max(0, newVerifiedQty - newWasteQty);
            const wasteQty = forceNoReuse ? newVerifiedQty : newWasteQty;

            if (reuseQty > 0) {
              await conn.query(
                `INSERT INTO ng_transactions
                 (id, master_part_id, request_id, department_id, factory_id, material_name_snapshot, part_number_snapshot, part_name_snapshot, model_snapshot, berat_part_gr_snapshot, quantity_pcs, recycle_type_snapshot, shift, transaction_date, input_by, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'reuse', ?, ?, ?, ?)`,
                [
                  randomUUID(),
                  item.master_part_id,
                  requestId,
                  req.department_id,
                  req.factory_id,
                  item.material_name_snapshot,
                  item.part_number_snapshot,
                  item.part_name_snapshot,
                  item.model_snapshot,
                  item.berat_part_gr_snapshot,
                  reuseQty,
                  req.shift,
                  req.request_date,
                  req.sender_id,
                  `Pengiriman: ${req.request_number}`,
                ]
              );
            }

            if (wasteQty > 0) {
              await conn.query(
                `INSERT INTO ng_transactions
                 (id, master_part_id, request_id, department_id, factory_id, material_name_snapshot, part_number_snapshot, part_name_snapshot, model_snapshot, berat_part_gr_snapshot, quantity_pcs, recycle_type_snapshot, shift, transaction_date, input_by, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'no_reuse', ?, ?, ?, ?)`,
                [
                  randomUUID(),
                  item.master_part_id,
                  requestId,
                  req.department_id,
                  req.factory_id,
                  item.material_name_snapshot,
                  item.part_number_snapshot,
                  item.part_name_snapshot,
                  item.model_snapshot,
                  item.berat_part_gr_snapshot,
                  wasteQty,
                  req.shift,
                  req.request_date,
                  req.sender_id,
                  `Pengiriman: ${req.request_number} (Waste)`,
                ]
              );
            }
          }
        } else if (item.item_type === 'runner_ng') {
          await conn.query(
            `UPDATE runner_material_transactions
             SET total_pcs = ?, total_runner_weight_kg = ?
             WHERE request_id = ? AND (material_id <=> ? OR material_name_snapshot = ?)`,
            [newVerifiedQty, newVerifiedWeight, requestId, item.material_id, item.material_name_snapshot]
          );
        }
      }

      await this.recalculateRequestTotals(conn, requestId, isApproved);

      await conn.commit();

      broadcastSseEvent('crushing_request_updated', {
        requestId,
        requestNumber: req.request_number,
      });

      return {
        item_id: itemId,
        message: 'Item berhasil diperbarui.',
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Delete an item (part) from a request
   */
  static async deleteRequestItem(requestId: string, itemId: string, _user: JwtPayloadUser) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [reqRows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM crushing_requests WHERE id = ? FOR UPDATE',
        [requestId]
      );
      if (!reqRows.length) throw new Error('Tiket tidak ditemukan');
      const req = reqRows[0];

      const [itemRows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM crushing_request_items WHERE id = ? AND request_id = ? FOR UPDATE',
        [itemId, requestId]
      );
      if (!itemRows.length) throw new Error('Item tidak ditemukan di tiket ini');
      const item = itemRows[0];

      // If approved, delete linked transactions
      if (req.status === 'approved') {
        if (item.item_type === 'part_ng' && item.master_part_id) {
          await conn.query(
            'DELETE FROM ng_transactions WHERE request_id = ? AND master_part_id = ?',
            [requestId, item.master_part_id]
          );
        } else if (item.item_type === 'runner_ng') {
          await conn.query(
            'DELETE FROM runner_material_transactions WHERE request_id = ? AND (material_id <=> ? OR material_name_snapshot = ?)',
            [requestId, item.material_id, item.material_name_snapshot]
          );
        }
      }

      // Delete item
      await conn.query('DELETE FROM crushing_request_items WHERE id = ?', [itemId]);

      // Recalculate totals
      await this.recalculateRequestTotals(conn, requestId, req.status === 'approved');

      await conn.commit();

      broadcastSseEvent('crushing_request_updated', {
        requestId,
        requestNumber: req.request_number,
      });

      return {
        item_id: itemId,
        deleted: true,
        message: 'Item berhasil dihapus dari tiket.',
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Helper to recalculate total weight and pcs on crushing_requests
   */
  private static async recalculateRequestTotals(conn: any, requestId: string, isApproved: boolean) {
    const [sumRows] = await conn.query(
      `SELECT 
        COALESCE(SUM(quantity_pcs), 0) AS raw_pcs,
        COALESCE(SUM(weight_kg), 0) AS raw_weight,
        COALESCE(SUM(COALESCE(verified_quantity_pcs, quantity_pcs)), 0) AS ver_pcs,
        COALESCE(SUM(COALESCE(verified_weight_kg, weight_kg)), 0) AS ver_weight
       FROM crushing_request_items
       WHERE request_id = ?`,
      [requestId]
    );

    const s = sumRows[0] || {};
    const finalPcs = isApproved ? Number(s.ver_pcs) || 0 : Number(s.raw_pcs) || 0;
    const finalWeight = isApproved
      ? Number(Number(s.ver_weight || 0).toFixed(2))
      : Number(Number(s.raw_weight || 0).toFixed(2));

    await conn.query(
      `UPDATE crushing_requests
       SET total_pcs = ?, total_weight_kg = ?
       WHERE id = ?`,
      [finalPcs, finalWeight, requestId]
    );
  }

  // ===========================================================================
  // DIRECT TRANSACTIONS CRUD (ng_transactions & runner_material_transactions)
  // ===========================================================================

  static async listNgTransactions(params: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    shift?: string;
    departmentId?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const values: any[] = [];

    if (params.search && params.search.trim()) {
      const q = `%${params.search.trim()}%`;
      conditions.push(`(
        t.part_name_snapshot LIKE ? OR
        t.part_number_snapshot LIKE ? OR
        t.material_name_snapshot LIKE ? OR
        t.model_snapshot LIKE ? OR
        t.notes LIKE ? OR
        cr.request_number LIKE ?
      )`);
      values.push(q, q, q, q, q, q);
    }

    if (params.startDate) {
      conditions.push('t.transaction_date >= ?');
      values.push(params.startDate);
    }
    if (params.endDate) {
      conditions.push('t.transaction_date <= ?');
      values.push(params.endDate);
    }
    if (params.shift && (params.shift === 'Pagi' || params.shift === 'Malam')) {
      conditions.push('t.shift = ?');
      values.push(params.shift);
    }
    if (params.departmentId) {
      conditions.push('t.department_id = ?');
      values.push(params.departmentId);
    }

    const whereClause = conditions.join(' AND ');

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM ng_transactions t
       LEFT JOIN crushing_requests cr ON t.request_id = cr.id
       WHERE ${whereClause}`,
      values
    );
    const total = Number(countRows[0]?.total) || 0;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        t.id, t.master_part_id, t.request_id, cr.request_number,
        t.department_id, d.name AS department_name,
        t.factory_id, f.name AS factory_name, f.location AS factory_location,
        t.material_name_snapshot, t.part_number_snapshot, t.part_name_snapshot, t.model_snapshot,
        t.berat_part_gr_snapshot, t.quantity_pcs, t.weight_kg, t.recycle_type_snapshot,
        t.shift, t.transaction_date, t.notes, t.created_at,
        u.full_name AS input_by_name
       FROM ng_transactions t
       LEFT JOIN crushing_requests cr ON t.request_id = cr.id
       LEFT JOIN departments d ON t.department_id = d.id
       LEFT JOIN factories f ON t.factory_id = f.id
       LEFT JOIN users u ON t.input_by = u.id
       WHERE ${whereClause}
       ORDER BY t.transaction_date DESC, t.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return {
      transactions: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async updateNgTransaction(
    id: string,
    dto: {
      quantity_pcs?: number;
      shift?: 'Pagi' | 'Malam';
      transaction_date?: string;
      recycle_type_snapshot?: 'reuse' | 'no_reuse';
      notes?: string;
    }
  ) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, quantity_pcs, berat_part_gr_snapshot FROM ng_transactions WHERE id = ?',
      [id]
    );
    if (!rows.length) throw new Error('Transaksi NG tidak ditemukan');

    const trx = rows[0];
    const qty = dto.quantity_pcs !== undefined ? Math.max(0, Number(dto.quantity_pcs)) : trx.quantity_pcs;

    await pool.query(
      `UPDATE ng_transactions
       SET quantity_pcs = ?,
           shift = COALESCE(?, shift),
           transaction_date = COALESCE(?, transaction_date),
           recycle_type_snapshot = COALESCE(?, recycle_type_snapshot),
           notes = COALESCE(?, notes)
       WHERE id = ?`,
      [qty, dto.shift || null, dto.transaction_date || null, dto.recycle_type_snapshot || null, dto.notes || null, id]
    );

    return { id, message: 'Transaksi NG berhasil diperbarui.' };
  }

  static async deleteNgTransaction(id: string) {
    const [result]: any = await pool.query('DELETE FROM ng_transactions WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw new Error('Transaksi NG tidak ditemukan');
    return { id, deleted: true, message: 'Transaksi NG berhasil dihapus.' };
  }

  static async listRunnerTransactions(params: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    shift?: string;
    departmentId?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const values: any[] = [];

    if (params.search && params.search.trim()) {
      const q = `%${params.search.trim()}%`;
      conditions.push(`(
        rmt.material_name_snapshot LIKE ? OR
        rmt.import_batch_ref LIKE ? OR
        cr.request_number LIKE ?
      )`);
      values.push(q, q, q);
    }

    if (params.startDate) {
      conditions.push('rmt.transaction_date >= ?');
      values.push(params.startDate);
    }
    if (params.endDate) {
      conditions.push('rmt.transaction_date <= ?');
      values.push(params.endDate);
    }
    if (params.shift && (params.shift === 'Pagi' || params.shift === 'Malam')) {
      conditions.push('rmt.shift = ?');
      values.push(params.shift);
    }
    if (params.departmentId) {
      conditions.push('rmt.department_id = ?');
      values.push(params.departmentId);
    }

    const whereClause = conditions.join(' AND ');

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM runner_material_transactions rmt
       LEFT JOIN crushing_requests cr ON rmt.request_id = cr.id
       WHERE ${whereClause}`,
      values
    );
    const total = Number(countRows[0]?.total) || 0;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        rmt.id, rmt.material_id, rmt.request_id, cr.request_number,
        rmt.department_id, d.name AS department_name,
        rmt.factory_id, f.name AS factory_name, f.location AS factory_location,
        rmt.material_name_snapshot, rmt.total_pcs, rmt.total_runner_weight_kg,
        rmt.shift, rmt.transaction_date, rmt.import_batch_ref, rmt.created_at
       FROM runner_material_transactions rmt
       LEFT JOIN crushing_requests cr ON rmt.request_id = cr.id
       LEFT JOIN departments d ON rmt.department_id = d.id
       LEFT JOIN factories f ON rmt.factory_id = f.id
       WHERE ${whereClause}
       ORDER BY rmt.transaction_date DESC, rmt.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return {
      transactions: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async updateRunnerTransaction(
    id: string,
    dto: {
      total_runner_weight_kg?: number;
      total_pcs?: number;
      shift?: 'Pagi' | 'Malam';
      transaction_date?: string;
    }
  ) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM runner_material_transactions WHERE id = ?',
      [id]
    );
    if (!rows.length) throw new Error('Transaksi Runner tidak ditemukan');

    await pool.query(
      `UPDATE runner_material_transactions
       SET total_runner_weight_kg = COALESCE(?, total_runner_weight_kg),
           total_pcs = COALESCE(?, total_pcs),
           shift = COALESCE(?, shift),
           transaction_date = COALESCE(?, transaction_date)
       WHERE id = ?`,
      [
        dto.total_runner_weight_kg !== undefined ? Number(dto.total_runner_weight_kg) : null,
        dto.total_pcs !== undefined ? Number(dto.total_pcs) : null,
        dto.shift || null,
        dto.transaction_date || null,
        id,
      ]
    );

    return { id, message: 'Transaksi Runner berhasil diperbarui.' };
  }

  static async deleteRunnerTransaction(id: string) {
    const [result]: any = await pool.query('DELETE FROM runner_material_transactions WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw new Error('Transaksi Runner tidak ditemukan');
    return { id, deleted: true, message: 'Transaksi Runner berhasil dihapus.' };
  }
}
