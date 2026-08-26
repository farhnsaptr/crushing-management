import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import { broadcastSseEvent } from '../../utils/sse.util';
import { JwtPayloadUser } from '../../middlewares/auth.middleware';
import { redisClient, getIsRedisConnected } from '../../config/redis';

export interface CreateRequestItemDto {
  item_type: 'part_ng' | 'runner_ng';
  master_part_id?: string;
  material_id?: string;
  material_name?: string;
  quantity_pcs?: number;
  runner_weight_kg?: number;
  notes?: string;
}

export interface CreateCrushingRequestDto {
  request_type?: 'part_ng' | 'runner_ng' | 'mixed';
  shift: 'Pagi' | 'Malam';
  request_date: string; // YYYY-MM-DD
  notes?: string;
  factory_id?: string;
  department_id?: string;
  items: CreateRequestItemDto[];
}

export interface CrushingRequestRow extends RowDataPacket {
  id: string;
  request_number: string;
  sender_id: string;
  sender_name?: string;
  sender_username?: string;
  factory_id: string;
  factory_name?: string;
  factory_code?: string;
  department_id: string;
  department_name?: string;
  department_code?: string;
  request_type: 'part_ng' | 'runner_ng' | 'mixed';
  shift: 'Pagi' | 'Malam';
  request_date: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  validated_by?: string | null;
  validator_name?: string | null;
  validated_at?: string | null;
  total_weight_kg: number;
  total_pcs: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface CrushingRequestItemRow extends RowDataPacket {
  id: string;
  request_id: string;
  item_type: 'part_ng' | 'runner_ng';
  master_part_id: string | null;
  material_id: string | null;
  part_number_snapshot: string | null;
  part_name_snapshot: string | null;
  model_snapshot: string | null;
  material_name_snapshot: string | null;
  berat_part_gr_snapshot: number | null;
  quantity_pcs: number;
  weight_kg: number;
  notes: string | null;
  created_at: string;
  image_url?: string | null;
}

export class CrushingRequestsService {
  private static generateRequestNumber(dateStr: string): string {
    const cleanDate = dateStr.replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `REQ-${cleanDate}-${randomSuffix}`;
  }

  static async createRequest(user: JwtPayloadUser, dto: CreateCrushingRequestDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new Error('Permintaan wajib memiliki minimal 1 item part atau runner');
    }

    const factoryId = user.factory_id || dto.factory_id;
    const departmentId = user.department_id || dto.department_id;

    if (!factoryId) {
      throw new Error('Factory penugasan tidak ditemukan pada akun Anda');
    }
    if (!departmentId) {
      throw new Error('Departemen pengirim tidak ditemukan pada akun Anda');
    }

    const requestId = randomUUID();
    const requestNumber = this.generateRequestNumber(dto.request_date);

    // Process & calculate items in backend (AGENTS.md rule 4)
    let totalWeightKg = 0;
    let totalPcs = 0;
    const processedItems: Array<{
      id: string;
      item_type: 'part_ng' | 'runner_ng';
      master_part_id: string | null;
      material_id: string | null;
      part_number_snapshot: string | null;
      part_name_snapshot: string | null;
      model_snapshot: string | null;
      material_name_snapshot: string | null;
      berat_part_gr_snapshot: number | null;
      quantity_pcs: number;
      weight_kg: number;
      notes: string | null;
    }> = [];

    for (const item of dto.items) {
      if (item.item_type === 'part_ng') {
        if (!item.master_part_id) {
          throw new Error('Part NG wajib memilih Master Part');
        }

        const [partRows] = await pool.query<RowDataPacket[]>(
          `SELECT mp.id, mp.part_number, mp.part_name, mp.berat_part_gr, mp.material, m.model_code, mc.factory_id
           FROM master_parts mp
           JOIN machines mc ON mp.machine_id = mc.id
           JOIN master_models m ON mp.model_id = m.id
           WHERE mp.id = ? AND mp.is_active = TRUE`,
          [item.master_part_id]
        );

        if (partRows.length === 0) {
          throw new Error('Master part tidak ditemukan atau tidak aktif');
        }

        const part = partRows[0];

        // Security validation: verify part belongs to user's assigned factory
        if (user.role === 'pengirim' && part.factory_id !== factoryId) {
          throw new Error(`Part '${part.part_name}' bukan berasal dari pabrik yang ditugaskan ke Anda`);
        }

        const qtyPcs = Math.max(1, Number(item.quantity_pcs) || 1);
        const beratGr = Number(part.berat_part_gr) || 0;
        const itemWeightKg = Number(((qtyPcs * beratGr) / 1000).toFixed(2));

        totalWeightKg += itemWeightKg;
        totalPcs += qtyPcs;

        processedItems.push({
          id: randomUUID(),
          item_type: 'part_ng',
          master_part_id: part.id,
          material_id: null,
          part_number_snapshot: part.part_number,
          part_name_snapshot: part.part_name,
          model_snapshot: part.model_code,
          material_name_snapshot: part.material,
          berat_part_gr_snapshot: beratGr,
          quantity_pcs: qtyPcs,
          weight_kg: itemWeightKg,
          notes: item.notes || null,
        });
      } else if (item.item_type === 'runner_ng') {
        let materialName = item.material_name || 'Material Runner';
        let materialId: string | null = item.material_id || null;

        if (materialId) {
          const [matRows] = await pool.query<RowDataPacket[]>(
            'SELECT id, material_name FROM master_materials WHERE id = ?',
            [materialId]
          );
          if (matRows.length > 0) {
            materialName = matRows[0].material_name;
          }
        }

        const runnerWeight = Math.max(0.01, Number(item.runner_weight_kg) || 0);
        totalWeightKg += runnerWeight;

        processedItems.push({
          id: randomUUID(),
          item_type: 'runner_ng',
          master_part_id: null,
          material_id: materialId,
          part_number_snapshot: null,
          part_name_snapshot: null,
          model_snapshot: null,
          material_name_snapshot: materialName,
          berat_part_gr_snapshot: null,
          quantity_pcs: item.quantity_pcs || 0,
          weight_kg: Number(runnerWeight.toFixed(2)),
          notes: item.notes || null,
        });
      }
    }

    const inferredType: 'part_ng' | 'runner_ng' | 'mixed' =
      dto.request_type ||
      (processedItems.every((i) => i.item_type === 'part_ng')
        ? 'part_ng'
        : processedItems.every((i) => i.item_type === 'runner_ng')
        ? 'runner_ng'
        : 'mixed');

    // Insert Header
    await pool.query(
      `INSERT INTO crushing_requests
       (id, request_number, sender_id, factory_id, department_id, request_type, shift, request_date, status, total_weight_kg, total_pcs, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [
        requestId,
        requestNumber,
        user.id,
        factoryId,
        departmentId,
        inferredType,
        dto.shift,
        dto.request_date,
        Number(totalWeightKg.toFixed(2)),
        totalPcs,
        dto.notes || null,
      ]
    );

    // Insert Items
    for (const item of processedItems) {
      await pool.query(
        `INSERT INTO crushing_request_items
         (id, request_id, item_type, master_part_id, material_id, part_number_snapshot, part_name_snapshot, model_snapshot, material_name_snapshot, berat_part_gr_snapshot, quantity_pcs, weight_kg, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          requestId,
          item.item_type,
          item.master_part_id,
          item.material_id,
          item.part_number_snapshot,
          item.part_name_snapshot,
          item.model_snapshot,
          item.material_name_snapshot,
          item.berat_part_gr_snapshot,
          item.quantity_pcs,
          item.weight_kg,
          item.notes,
        ]
      );
    }

    const created = await this.getRequestById(requestId, user);

    // Clear Redis temporary draft
    await this.deleteDraft(user.id);

    // Broadcast SSE Event
    broadcastSseEvent('crushing_request_created', {
      requestId,
      requestNumber,
      senderName: user.full_name,
      totalWeightKg,
      totalPcs,
      shift: dto.shift,
      status: 'pending',
    });

    return created;
  }

  static async listRequests(
    user: JwtPayloadUser,
    params: {
      status?: 'pending' | 'approved' | 'rejected' | 'all';
      startDate?: string;
      endDate?: string;
      department_id?: string;
      factory_id?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];

    // Role-based sender isolation
    if (user.role === 'pengirim') {
      whereClause += ' AND r.sender_id = ?';
      queryParams.push(user.id);
    }

    if (params.status && params.status !== 'all') {
      whereClause += ' AND r.status = ?';
      queryParams.push(params.status);
    }

    if (params.startDate && params.endDate) {
      whereClause += ' AND r.request_date BETWEEN ? AND ?';
      queryParams.push(params.startDate, params.endDate);
    }

    if (params.department_id) {
      whereClause += ' AND r.department_id = ?';
      queryParams.push(params.department_id);
    }

    if (params.factory_id) {
      whereClause += ' AND r.factory_id = ?';
      queryParams.push(params.factory_id);
    }

    if (params.search && params.search.trim() !== '') {
      whereClause += ' AND (r.request_number LIKE ? OR u.full_name LIKE ? OR d.name LIKE ?)';
      const s = `%${params.search.trim()}%`;
      queryParams.push(s, s, s);
    }

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM crushing_requests r
       JOIN users u ON r.sender_id = u.id
       JOIN departments d ON r.department_id = d.id
       ${whereClause}`,
      queryParams
    );

    const total = countRows[0].total;

    const [rows] = await pool.query<CrushingRequestRow[]>(
      `SELECT 
        r.id, r.request_number, r.sender_id, u.full_name AS sender_name, u.username AS sender_username,
        r.factory_id, f.name AS factory_name, f.code AS factory_code,
        r.department_id, d.name AS department_name, d.code AS department_code,
        r.request_type, r.shift, r.request_date, r.status, r.rejection_reason,
        r.validated_by, v.full_name AS validator_name, r.validated_at,
        r.total_weight_kg, r.total_pcs, r.notes, r.created_at, r.updated_at,
        (SELECT COUNT(*) FROM crushing_request_items WHERE request_id = r.id) AS item_count
       FROM crushing_requests r
       JOIN users u ON r.sender_id = u.id
       JOIN factories f ON r.factory_id = f.id
       JOIN departments d ON r.department_id = d.id
       LEFT JOIN users v ON r.validated_by = v.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    return {
      requests: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getRequestById(id: string, user: JwtPayloadUser): Promise<CrushingRequestRow & { items: CrushingRequestItemRow[] }> {
    const [rows] = await pool.query<CrushingRequestRow[]>(
      `SELECT 
        r.id, r.request_number, r.sender_id, u.full_name AS sender_name, u.username AS sender_username,
        r.factory_id, f.name AS factory_name, f.code AS factory_code,
        r.department_id, d.name AS department_name, d.code AS department_code,
        r.request_type, r.shift, r.request_date, r.status, r.rejection_reason,
        r.validated_by, v.full_name AS validator_name, r.validated_at,
        r.total_weight_kg, r.total_pcs, r.notes, r.created_at, r.updated_at
       FROM crushing_requests r
       JOIN users u ON r.sender_id = u.id
       JOIN factories f ON r.factory_id = f.id
       JOIN departments d ON r.department_id = d.id
       LEFT JOIN users v ON r.validated_by = v.id
       WHERE r.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Tiket request tidak ditemukan');
    }

    const request = rows[0];

    // Access control: pengirim only sees own requests
    if (user.role === 'pengirim' && request.sender_id !== user.id) {
      throw new Error('Akses ditolak. Anda tidak memiliki izin melihat tiket ini.');
    }

    const [items] = await pool.query<CrushingRequestItemRow[]>(
      `SELECT 
        i.id, i.request_id, i.item_type, i.master_part_id, i.material_id,
        i.part_number_snapshot, i.part_name_snapshot, i.model_snapshot,
        i.material_name_snapshot, i.berat_part_gr_snapshot,
        i.quantity_pcs, i.weight_kg, i.notes, i.created_at,
        mp.image_url
       FROM crushing_request_items i
       LEFT JOIN master_parts mp ON (i.master_part_id = mp.id OR (i.master_part_id IS NULL AND i.part_number_snapshot = mp.part_number))
       WHERE i.request_id = ?
       ORDER BY i.created_at ASC`,
      [id]
    );

    return {
      ...request,
      items,
    };
  }

  static async approveRequest(requestId: string, validatorUser: JwtPayloadUser, notes?: string) {
    const request = await this.getRequestById(requestId, validatorUser);

    if (request.status !== 'pending') {
      throw new Error(`Tiket request tidak dapat disetujui karena statusnya sudah '${request.status}'`);
    }

    // 1. Update crushing_requests status
    await pool.query(
      `UPDATE crushing_requests
       SET status = 'approved', validated_by = ?, validated_at = CURRENT_TIMESTAMP, notes = COALESCE(?, notes)
       WHERE id = ?`,
      [validatorUser.id, notes || null, requestId]
    );

    // 2. Automatically generate records in ng_transactions and runner_material_transactions
    for (const item of request.items) {
      if (item.item_type === 'part_ng' && item.master_part_id) {
        const transId = randomUUID();
        await pool.query(
          `INSERT INTO ng_transactions
           (id, master_part_id, request_id, department_id, factory_id, part_number_snapshot, part_name_snapshot, model_snapshot, berat_part_gr_snapshot, quantity_pcs, shift, transaction_date, input_by, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            transId,
            item.master_part_id,
            requestId,
            request.department_id,
            request.factory_id,
            item.part_number_snapshot,
            item.part_name_snapshot,
            item.model_snapshot,
            item.berat_part_gr_snapshot,
            item.quantity_pcs,
            request.shift,
            request.request_date,
            request.sender_id,
            item.notes ? `[Tiket ${request.request_number}] ${item.notes}` : `Tiket: ${request.request_number}`,
          ]
        );
      } else if (item.item_type === 'runner_ng') {
        const runnerId = randomUUID();
        await pool.query(
          `INSERT INTO runner_material_transactions
           (id, material_id, request_id, department_id, factory_id, material_name_snapshot, total_pcs, total_runner_weight_kg, transaction_date, shift, import_batch_ref)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            runnerId,
            item.material_id || null,
            requestId,
            request.department_id,
            request.factory_id,
            item.material_name_snapshot || 'Runner Material',
            item.quantity_pcs || 0,
            item.weight_kg,
            request.request_date,
            request.shift,
            `Tiket: ${request.request_number}`,
          ]
        );
      }
    }

    const updated = await this.getRequestById(requestId, validatorUser);

    // SSE Broadcast
    broadcastSseEvent('crushing_request_approved', {
      requestId,
      requestNumber: request.request_number,
      senderId: request.sender_id,
      validatorName: validatorUser.full_name,
      totalWeightKg: request.total_weight_kg,
    });

    return updated;
  }

  static async rejectRequest(requestId: string, validatorUser: JwtPayloadUser, rejectionReason: string) {
    if (!rejectionReason || rejectionReason.trim() === '') {
      throw new Error('Alasan penolakan tiket wajib diisi');
    }

    const request = await this.getRequestById(requestId, validatorUser);

    if (request.status !== 'pending') {
      throw new Error(`Tiket request tidak dapat ditolak karena statusnya sudah '${request.status}'`);
    }

    await pool.query(
      `UPDATE crushing_requests
       SET status = 'rejected', rejection_reason = ?, validated_by = ?, validated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [rejectionReason.trim(), validatorUser.id, requestId]
    );

    const updated = await this.getRequestById(requestId, validatorUser);

    // SSE Broadcast
    broadcastSseEvent('crushing_request_rejected', {
      requestId,
      requestNumber: request.request_number,
      senderId: request.sender_id,
      validatorName: validatorUser.full_name,
      rejectionReason: rejectionReason.trim(),
    });

    return updated;
  }

  /**
   * Save temporary ticket draft to Redis with 7 days TTL (cross-device/browser persistence)
   */
  static async saveDraft(userId: string, draftData: any) {
    if (!getIsRedisConnected()) {
      return null;
    }
    const key = `draft:crushing_request:${userId}`;
    await redisClient.set(key, JSON.stringify(draftData), {
      EX: 7 * 24 * 60 * 60, // 7 days TTL
    });
    return draftData;
  }

  /**
   * Retrieve temporary ticket draft from Redis
   */
  static async getDraft(userId: string) {
    if (!getIsRedisConnected()) {
      return null;
    }
    const key = `draft:crushing_request:${userId}`;
    const raw = await redisClient.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Delete temporary ticket draft from Redis
   */
  static async deleteDraft(userId: string) {
    if (!getIsRedisConnected()) {
      return;
    }
    const key = `draft:crushing_request:${userId}`;
    await redisClient.del(key);
  }
}
