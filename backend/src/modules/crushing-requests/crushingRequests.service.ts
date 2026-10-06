import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import { broadcastSseEvent } from '../../utils/sse.util';
import { JwtPayloadUser } from '../../middlewares/auth.middleware';
import { StorageService } from '../../services/storage.service';
import { resolveEffectiveMaterial } from '../materials/effectiveMaterial';

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

export interface ApproveItemAdjustmentDto {
  id: string;
  verified_quantity_pcs?: number;
  verified_weight_kg?: number;
  adjustment_notes?: string;
  waste_quantity_pcs?: number;
}

export interface ApproveCrushingRequestDto {
  notes?: string;
  items?: ApproveItemAdjustmentDto[];
}

export interface CrushingRequestRow extends RowDataPacket {
  id: string;
  request_number: string;
  sender_id: string;
  sender_name?: string;
  sender_username?: string;
  factory_id?: string | null;
  factory_name?: string | null;
  factory_code?: string;
  department_id: string;
  department_name?: string;
  department_code?: string;
  request_type: 'part_ng' | 'runner_ng' | 'mixed';
  shift: 'Pagi' | 'Malam';
  request_date: string;
  status: 'pending' | 'approved';
  is_submitted: boolean;
  submitted_at?: string | null;
  rejection_reason?: string | null;
  validated_by?: string | null;
  validator_name?: string | null;
  validated_at?: string | null;
  submitted_total_weight_kg: number;
  submitted_total_pcs: number;
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
  verified_quantity_pcs: number | null;
  verified_weight_kg: number | null;
  adjustment_notes: string | null;
  waste_quantity_pcs: number;
  notes: string | null;
  created_at: string;
  image_url?: string | null;
  part_factory_id?: string | null;
}

function getBackendAutoShiftAndDate(): { shift: 'Pagi' | 'Malam'; date: string } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const now = new Date();
  const parts = formatter.formatToParts(now);
  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }

  const hour = parseInt(map.hour, 10);
  let shift: 'Pagi' | 'Malam';
  let dateStr = `${map.year}-${map.month}-${map.day}`;

  if (hour >= 20) {
    // 20:00 - 23:59 WIB: Shift Malam hari ini
    shift = 'Malam';
  } else if (hour < 7) {
    // 00:00 - 06:59 WIB: Shift Malam (lanjutan operasional shift malam kemarin)
    shift = 'Malam';
    const prevDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const prevParts = formatter.formatToParts(prevDate);
    const prevMap: Record<string, string> = {};
    for (const p of prevParts) {
      prevMap[p.type] = p.value;
    }
    dateStr = `${prevMap.year}-${prevMap.month}-${prevMap.day}`;
  } else {
    // 07:00 - 19:59 WIB: Shift Pagi hari ini
    shift = 'Pagi';
  }

  return { shift, date: dateStr };
}

export class CrushingRequestsService {
  private static generateRequestNumber(dateStr: string): string {
    const cleanDate = dateStr.replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `REQ-${cleanDate}-${rand}`;
  }

  /**
   * Process items, calculate weights and snapshots.
   */
  private static async processItemsPayload(
    items: CreateRequestItemDto[],
    factoryId?: string | null,
    userRole?: string
  ) {
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
      part_factory_id?: string | null;
    }> = [];

    for (const item of items) {
      if (item.item_type === 'part_ng') {
        if (!item.master_part_id) {
          throw new Error('Part NG wajib memilih Master Part');
        }

        const [partRows] = await pool.query<RowDataPacket[]>(
          `SELECT mp.id, mp.part_number, mp.part_name, mp.berat_part_gr, mp.material, mp.material_id, m.model_code, mc.factory_id
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
        const effMat = await resolveEffectiveMaterial(part.material_id);

        // Security validation: verify part belongs to user's assigned factory (skip if ALL / null)
        if (userRole === 'pengirim' && factoryId && factoryId !== 'ALL' && part.factory_id !== factoryId) {
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
          material_id: effMat?.id || null,
          part_number_snapshot: part.part_number,
          part_name_snapshot: part.part_name,
          model_snapshot: part.model_code,
          material_name_snapshot: effMat?.name || part.material,
          berat_part_gr_snapshot: beratGr,
          quantity_pcs: qtyPcs,
          weight_kg: itemWeightKg,
          notes: item.notes || null,
          part_factory_id: part.factory_id || null,
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
          const effMat = await resolveEffectiveMaterial(materialId);
          if (effMat) {
            materialId = effMat.id;
            materialName = effMat.name;
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

    return { processedItems, totalWeightKg, totalPcs };
  }

  /**
   * Submit new crushing request or promote existing draft to is_submitted = TRUE.
   */
  static async createRequest(user: JwtPayloadUser, dto: CreateCrushingRequestDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new Error('Permintaan wajib memiliki minimal 1 item part atau runner');
    }

    const rawFactoryId = user.factory_id || dto.factory_id;
    const factoryId = (rawFactoryId && rawFactoryId !== 'ALL') ? rawFactoryId : null;
    const departmentId = user.department_id || dto.department_id;

    if (!departmentId) {
      throw new Error('Departemen pengirim tidak ditemukan pada akun Anda');
    }

    // Auto-calculate shift and date based on current operational server time (Asia/Jakarta)
    // Always synchronize shift and request_date to the active operational shift at submission time
    const autoShiftDate = getBackendAutoShiftAndDate();
    const finalShift: 'Pagi' | 'Malam' = autoShiftDate.shift;
    const finalRequestDate: string = autoShiftDate.date;

    const { processedItems, totalWeightKg, totalPcs } = await this.processItemsPayload(
      dto.items,
      factoryId,
      user.role
    );

    const inferredType: 'part_ng' | 'runner_ng' | 'mixed' =
      dto.request_type ||
      (processedItems.every((i) => i.item_type === 'part_ng')
        ? 'part_ng'
        : processedItems.every((i) => i.item_type === 'runner_ng')
        ? 'runner_ng'
        : 'mixed');

    const targetFactoryId = factoryId || (processedItems.find((i) => i.part_factory_id)?.part_factory_id) || null;

    // Check if an existing unsubmitted draft exists for this sender
    const [existingDrafts] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM crushing_requests WHERE sender_id = ? AND is_submitted = FALSE LIMIT 1`,
      [user.id]
    );

    let requestId: string;
    const finalRequestNumber = this.generateRequestNumber(finalRequestDate);

    if (existingDrafts.length > 0) {
      requestId = existingDrafts[0].id;

      // Update existing draft to submitted
      await pool.query(
        `UPDATE crushing_requests
         SET request_number = ?, factory_id = ?, department_id = ?, request_type = ?, shift = ?, request_date = ?,
             status = 'pending', is_submitted = TRUE, submitted_at = NOW(),
             submitted_total_weight_kg = ?, submitted_total_pcs = ?, total_weight_kg = ?, total_pcs = ?,
             notes = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          finalRequestNumber,
          targetFactoryId,
          departmentId,
          inferredType,
          finalShift,
          finalRequestDate,
          Number(totalWeightKg.toFixed(2)),
          totalPcs,
          Number(totalWeightKg.toFixed(2)),
          totalPcs,
          dto.notes || null,
          requestId,
        ]
      );

      // Clean old draft items
      await pool.query(`DELETE FROM crushing_request_items WHERE request_id = ?`, [requestId]);
    } else {
      requestId = randomUUID();

      await pool.query(
        `INSERT INTO crushing_requests
         (id, request_number, sender_id, factory_id, department_id, request_type, shift, request_date, status, is_submitted, submitted_at, submitted_total_weight_kg, submitted_total_pcs, total_weight_kg, total_pcs, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', TRUE, NOW(), ?, ?, ?, ?, ?)`,
        [
          requestId,
          finalRequestNumber,
          user.id,
          targetFactoryId,
          departmentId,
          inferredType,
          finalShift,
          finalRequestDate,
          Number(totalWeightKg.toFixed(2)),
          totalPcs,
          Number(totalWeightKg.toFixed(2)),
          totalPcs,
          dto.notes || null,
        ]
      );
    }

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

    // Broadcast SSE Event
    broadcastSseEvent('crushing_request_created', {
      requestId,
      requestNumber: finalRequestNumber,
      senderName: user.full_name,
      totalWeightKg,
      totalPcs,
      factoryId,
      departmentId,
    });

    return created;
  }

  /**
   * List submitted requests with pagination & role filtering.
   * Operators and Admins only see rows where is_submitted = TRUE.
   */
  static async listRequests(
    user: JwtPayloadUser,
    params: {
      status?: 'pending' | 'approved' | 'all';
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

    // Operator and history only sees officially submitted requests
    let whereClause = 'WHERE r.is_submitted = TRUE';
    const queryParams: any[] = [];

    // Role-based filtering
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
        r.factory_id, COALESCE(f.name, 'Semua Factory (ALL)') AS factory_name, f.code AS factory_code,
        r.department_id, d.name AS department_name, d.code AS department_code,
        r.request_type, r.shift, r.request_date, r.status, r.is_submitted, r.submitted_at,
        r.validated_by, v.full_name AS validator_name, r.validated_at,
        r.submitted_total_weight_kg, r.submitted_total_pcs,
        r.total_weight_kg, r.total_pcs, r.notes, r.created_at, r.updated_at,
        (SELECT COUNT(*) FROM crushing_request_items WHERE request_id = r.id) AS item_count
       FROM crushing_requests r
       JOIN users u ON r.sender_id = u.id
       LEFT JOIN factories f ON r.factory_id = f.id
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
        r.factory_id, COALESCE(f.name, 'Semua Factory (ALL)') AS factory_name, f.code AS factory_code,
        r.department_id, d.name AS department_name, d.code AS department_code,
        r.request_type, r.shift, r.request_date, r.status, r.is_submitted, r.submitted_at,
        r.validated_by, v.full_name AS validator_name, r.validated_at,
        r.submitted_total_weight_kg, r.submitted_total_pcs,
        r.total_weight_kg, r.total_pcs, r.notes, r.created_at, r.updated_at
       FROM crushing_requests r
       JOIN users u ON r.sender_id = u.id
       LEFT JOIN factories f ON r.factory_id = f.id
       JOIN departments d ON r.department_id = d.id
       LEFT JOIN users v ON r.validated_by = v.id
       WHERE r.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Pengajuan pengiriman tidak ditemukan');
    }

    const request = rows[0];

    // Access control: pengirim only sees own requests
    if (user.role === 'pengirim' && request.sender_id !== user.id) {
      throw new Error('Akses ditolak. Anda tidak memiliki izin melihat pengiriman ini.');
    }

    const [items] = await pool.query<CrushingRequestItemRow[]>(
      `SELECT 
        i.id, i.request_id, i.item_type, i.master_part_id, i.material_id,
        i.part_number_snapshot, i.part_name_snapshot, i.model_snapshot,
        COALESCE(NULLIF(i.material_name_snapshot, ''), mm.material_name, mp.material, 'Material') AS material_name_snapshot,
        i.berat_part_gr_snapshot,
        i.quantity_pcs, i.weight_kg,
        i.verified_quantity_pcs, i.verified_weight_kg, i.adjustment_notes, i.waste_quantity_pcs,
        i.notes, i.created_at,
        mp.image_url,
        mc.factory_id AS part_factory_id
       FROM crushing_request_items i
       LEFT JOIN master_parts mp ON i.master_part_id = mp.id
       LEFT JOIN master_materials mm ON (i.material_id = mm.id OR mp.material_id = mm.id)
       LEFT JOIN machines mc ON mp.machine_id = mc.id
       WHERE i.request_id = ?
       ORDER BY i.created_at ASC`,
      [id]
    );

    return {
      ...request,
      items: items.map((it) => ({
        ...it,
        image_url: StorageService.formatImageUrl(it.image_url),
      })),
    };
  }

  /**
   * Operator verifies & approves a crushing request.
   */
  static async approveRequest(requestId: string, validatorUser: JwtPayloadUser, payload?: ApproveCrushingRequestDto) {
    const request = await this.getRequestById(requestId, validatorUser);

    if (request.status === 'approved') {
      throw new Error('Pengiriman ini sudah disetujui sebelumnya');
    }

    // 1. Process Adjustments
    const adjustmentsMap = new Map<string, ApproveItemAdjustmentDto>();
    if (payload?.items) {
      for (const it of payload.items) {
        adjustmentsMap.set(it.id, it);
      }
    }

    let finalVerifiedTotalWeight = 0;
    let finalVerifiedTotalPcs = 0;
    const verifiedItemsForTransaction: Array<{
      item: CrushingRequestItemRow;
      verifiedQty: number;
      verifiedWeight: number;
      adjustmentNotes: string | null;
      wasteQty: number;
    }> = [];

    for (const item of request.items) {
      const adj = adjustmentsMap.get(item.id);
      let verifiedQty: number;
      let verifiedWeight: number;
      let adjNotes: string | null = null;

      if (item.item_type === 'part_ng') {
        const beratGr = Number(item.berat_part_gr_snapshot) || 0;
        if (adj && typeof adj.verified_quantity_pcs === 'number') {
          verifiedQty = Math.max(0, adj.verified_quantity_pcs);
        } else {
          verifiedQty = item.quantity_pcs;
        }

        if (adj && typeof adj.verified_weight_kg === 'number') {
          verifiedWeight = Math.max(0, Number(adj.verified_weight_kg.toFixed(2)));
        } else {
          verifiedWeight = beratGr > 0 ? Number(((verifiedQty * beratGr) / 1000).toFixed(2)) : item.weight_kg;
        }

        adjNotes = adj?.adjustment_notes?.trim() || null;
      } else {
        // runner_ng
        verifiedQty = item.quantity_pcs || 0;
        if (adj && typeof adj.verified_weight_kg === 'number') {
          verifiedWeight = Math.max(0, Number(adj.verified_weight_kg.toFixed(2)));
        } else {
          verifiedWeight = item.weight_kg;
        }
        adjNotes = adj?.adjustment_notes?.trim() || null;
      }

      const wasteQty = item.item_type === 'part_ng'
        ? Math.min(verifiedQty, Math.max(0, Math.floor(Number(adj?.waste_quantity_pcs) || 0)))
        : 0;

      finalVerifiedTotalWeight += verifiedWeight;
      finalVerifiedTotalPcs += verifiedQty;

      // Update item in database
      await pool.query(
        `UPDATE crushing_request_items
         SET verified_quantity_pcs = ?, verified_weight_kg = ?, adjustment_notes = ?, waste_quantity_pcs = ?
         WHERE id = ?`,
        [verifiedQty, verifiedWeight, adjNotes, wasteQty, item.id]
      );

      verifiedItemsForTransaction.push({
        item,
        verifiedQty,
        verifiedWeight,
        adjustmentNotes: adjNotes,
        wasteQty,
      });
    }

    // 2. Update crushing_requests status & verified totals
    await pool.query(
      `UPDATE crushing_requests
       SET status = 'approved',
           total_weight_kg = ?,
           total_pcs = ?,
           validated_by = ?,
           validated_at = CURRENT_TIMESTAMP,
           notes = COALESCE(?, notes)
       WHERE id = ?`,
      [
        Number(finalVerifiedTotalWeight.toFixed(2)),
        finalVerifiedTotalPcs,
        validatorUser.id,
        payload?.notes || null,
        requestId,
      ]
    );

    // 3. Automatically generate records in ng_transactions and runner_material_transactions using VERIFIED counts
    for (const { item, verifiedQty, verifiedWeight, adjustmentNotes, wasteQty } of verifiedItemsForTransaction) {
      if (item.item_type === 'part_ng' && item.master_part_id && verifiedQty > 0) {
        const noteText = adjustmentNotes
          ? `[Pengiriman ${request.request_number}] ${adjustmentNotes}`
          : item.notes
          ? `[Pengiriman ${request.request_number}] ${item.notes}`
          : `Pengiriman: ${request.request_number}`;

        // Pecah quantity per keputusan operator: sebagian pcs bisa reuse, sebagian lagi (dari part yang sama) waste
        // -- misal kiriman non-produksi yang sebagian part-nya terkontaminasi cat/material lain.
        // Material efektif saat transaksi masuk statistik (campuran jika material part sedang dicampur)
        const [partMatRows] = await pool.query<RowDataPacket[]>(
          'SELECT material_id FROM master_parts WHERE id = ?',
          [item.master_part_id]
        );
        const effMat = await resolveEffectiveMaterial(partMatRows[0]?.material_id || item.material_id);
        // Campuran bertipe no_reuse: seluruh qty menjadi waste, tidak ada pemisahan reuse
        const forceNoReuse = !!effMat?.is_mixed && effMat.recycle_type === 'no_reuse';
        const buckets: Array<{ qty: number; recycleType: 'reuse' | 'no_reuse' }> = forceNoReuse
          ? [{ qty: verifiedQty, recycleType: 'no_reuse' }]
          : [
              { qty: verifiedQty - wasteQty, recycleType: 'reuse' },
              { qty: wasteQty, recycleType: 'no_reuse' },
            ];

        for (const bucket of buckets) {
          if (bucket.qty <= 0) continue;
          await pool.query(
            `INSERT INTO ng_transactions
             (id, master_part_id, request_id, department_id, factory_id, material_name_snapshot, part_number_snapshot, part_name_snapshot, model_snapshot, berat_part_gr_snapshot, quantity_pcs, recycle_type_snapshot, shift, transaction_date, input_by, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              randomUUID(),
              item.master_part_id,
              requestId,
              request.department_id,
              request.factory_id || item.part_factory_id || null,
              effMat?.name || item.material_name_snapshot || null,
              item.part_number_snapshot,
              item.part_name_snapshot,
              item.model_snapshot,
              item.berat_part_gr_snapshot,
              bucket.qty,
              bucket.recycleType,
              request.shift,
              request.request_date,
              request.sender_id,
              bucket.recycleType === 'no_reuse' ? `${noteText} (Waste - tidak direcycle)` : noteText,
            ]
          );
        }
      } else if (item.item_type === 'runner_ng' && verifiedWeight > 0) {
        const runnerId = randomUUID();
        const runnerMat = await resolveEffectiveMaterial(item.material_id);
        await pool.query(
          `INSERT INTO runner_material_transactions
           (id, material_id, request_id, department_id, factory_id, material_name_snapshot, total_pcs, total_runner_weight_kg, transaction_date, shift, import_batch_ref)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            runnerId,
            runnerMat ? runnerMat.id : item.material_id || null,
            requestId,
            request.department_id,
            request.factory_id,
            runnerMat?.name || item.material_name_snapshot || 'Runner Material',
            verifiedQty,
            verifiedWeight,
            request.request_date,
            request.shift,
            `Pengiriman: ${request.request_number}`,
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
      totalWeightKg: Number(finalVerifiedTotalWeight.toFixed(2)),
      totalPcs: finalVerifiedTotalPcs,
    });

    return updated;
  }

  /**
   * Cancel / Delete a pending request (Undo functionality)
   */
  static async cancelRequest(requestId: string, user: JwtPayloadUser) {
    const request = await this.getRequestById(requestId, user);

    if (user.role === 'pengirim' && request.sender_id !== user.id) {
      throw new Error('Anda tidak memiliki akses untuk membatalkan pengiriman ini');
    }

    if (request.status !== 'pending') {
      throw new Error(`Pengiriman tidak dapat dibatalkan karena statusnya sudah '${request.status}'`);
    }

    await pool.query('DELETE FROM crushing_requests WHERE id = ?', [requestId]);

    // SSE Broadcast
    broadcastSseEvent('crushing_request_cancelled', {
      requestId,
      requestNumber: request.request_number,
      senderId: request.sender_id,
      cancelledBy: user.full_name,
    });

    return { id: requestId, request_number: request.request_number, cancelled: true };
  }

  /**
   * Save temporary ticket draft to MySQL crushing_requests & crushing_request_items (is_submitted = FALSE)
   */
  static async saveDraft(user: JwtPayloadUser, draftData: any) {
    const rawFactoryId = user.factory_id || draftData.factory_id;
    const factoryId = (rawFactoryId && rawFactoryId !== 'ALL') ? rawFactoryId : null;
    const departmentId = user.department_id || draftData.department_id;

    if (!departmentId) {
      return null;
    }

    const autoShiftDate = getBackendAutoShiftAndDate();
    const finalShift: 'Pagi' | 'Malam' = autoShiftDate.shift;
    const finalRequestDate: string = autoShiftDate.date;

    const items: CreateRequestItemDto[] = Array.isArray(draftData.items) ? draftData.items : [];

    // Calculate item weights and totals
    let totalWeightKg = 0;
    let totalPcs = 0;
    const processedItems: any[] = [];

    for (const item of items) {
      if (item.item_type === 'part_ng' && item.master_part_id) {
        const [partRows] = await pool.query<RowDataPacket[]>(
          `SELECT mp.id, mp.part_number, mp.part_name, mp.berat_part_gr, mp.material, mp.material_id, m.model_code, mc.factory_id
           FROM master_parts mp
           JOIN machines mc ON mp.machine_id = mc.id
           JOIN master_models m ON mp.model_id = m.id
           WHERE mp.id = ? AND mp.is_active = TRUE`,
          [item.master_part_id]
        );

        if (partRows.length > 0) {
          const part = partRows[0];
        const effMat = await resolveEffectiveMaterial(part.material_id);
          const qtyPcs = Math.max(1, Number(item.quantity_pcs) || 1);
          const beratGr = Number(part.berat_part_gr) || 0;
          const itemWeightKg = Number(((qtyPcs * beratGr) / 1000).toFixed(2));

          totalWeightKg += itemWeightKg;
          totalPcs += qtyPcs;

          processedItems.push({
            id: randomUUID(),
            item_type: 'part_ng',
            master_part_id: part.id,
            material_id: effMat?.id || null,
            part_number_snapshot: part.part_number,
            part_name_snapshot: part.part_name,
            model_snapshot: part.model_code,
            material_name_snapshot: effMat?.name || part.material,
            berat_part_gr_snapshot: beratGr,
            quantity_pcs: qtyPcs,
            weight_kg: itemWeightKg,
            notes: item.notes || null,
          });
        }
      } else if (item.item_type === 'runner_ng') {
        const runnerWeight = Math.max(0.01, Number(item.runner_weight_kg) || 0);
        totalWeightKg += runnerWeight;

        processedItems.push({
          id: randomUUID(),
          item_type: 'runner_ng',
          master_part_id: null,
          material_id: item.material_id || null,
          part_number_snapshot: null,
          part_name_snapshot: null,
          model_snapshot: null,
          material_name_snapshot: item.material_name || 'Material Runner',
          berat_part_gr_snapshot: null,
          quantity_pcs: item.quantity_pcs || 0,
          weight_kg: Number(runnerWeight.toFixed(2)),
          notes: item.notes || null,
        });
      }
    }

    const inferredType: 'part_ng' | 'runner_ng' | 'mixed' =
      processedItems.every((i) => i.item_type === 'part_ng')
        ? 'part_ng'
        : processedItems.every((i) => i.item_type === 'runner_ng')
        ? 'runner_ng'
        : 'mixed';

    // Check if an unsubmitted draft already exists in MySQL
    const [existingDraftRows] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM crushing_requests WHERE sender_id = ? AND is_submitted = FALSE LIMIT 1`,
      [user.id]
    );

    let draftRequestId: string;

    const targetFactoryId = factoryId || (processedItems.find((i) => i.part_factory_id)?.part_factory_id) || null;

    if (existingDraftRows.length > 0) {
      draftRequestId = existingDraftRows[0].id;
      // Update existing draft header
      await pool.query(
        `UPDATE crushing_requests
         SET factory_id = ?, department_id = ?, request_type = ?, shift = ?, request_date = ?,
             submitted_total_weight_kg = ?, submitted_total_pcs = ?, total_weight_kg = ?, total_pcs = ?,
             notes = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          targetFactoryId,
          departmentId,
          inferredType,
          finalShift,
          finalRequestDate,
          Number(totalWeightKg.toFixed(2)),
          totalPcs,
          Number(totalWeightKg.toFixed(2)),
          totalPcs,
          draftData.notes || null,
          draftRequestId,
        ]
      );

      // Clean existing draft items
      await pool.query(`DELETE FROM crushing_request_items WHERE request_id = ?`, [draftRequestId]);
    } else {
      draftRequestId = randomUUID();
      const draftNumber = `DRAFT-${finalRequestDate.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      await pool.query(
        `INSERT INTO crushing_requests
         (id, request_number, sender_id, factory_id, department_id, request_type, shift, request_date, status, is_submitted, submitted_total_weight_kg, submitted_total_pcs, total_weight_kg, total_pcs, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', FALSE, ?, ?, ?, ?, ?)`,
        [
          draftRequestId,
          draftNumber,
          user.id,
          targetFactoryId,
          departmentId,
          inferredType,
          finalShift,
          finalRequestDate,
          Number(totalWeightKg.toFixed(2)),
          totalPcs,
          Number(totalWeightKg.toFixed(2)),
          totalPcs,
          draftData.notes || null,
        ]
      );
    }

    // Insert draft items
    for (const item of processedItems) {
      await pool.query(
        `INSERT INTO crushing_request_items
         (id, request_id, item_type, master_part_id, material_id, part_number_snapshot, part_name_snapshot, model_snapshot, material_name_snapshot, berat_part_gr_snapshot, quantity_pcs, weight_kg, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          draftRequestId,
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

    return {
      id: draftRequestId,
      shift: finalShift,
      requestDate: finalRequestDate,
      notes: draftData.notes || '',
      items: processedItems,
    };
  }

  /**
   * Retrieve temporary ticket draft from MySQL
   */
  static async getDraft(userId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, request_number, shift, request_date, notes
       FROM crushing_requests
       WHERE sender_id = ? AND is_submitted = FALSE
       ORDER BY updated_at DESC
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return null;
    }

    const draft = rows[0];
    const autoShiftDate = getBackendAutoShiftAndDate();

    // Automatically synchronize draft header if the operational shift or date has rolled over
    if (draft.shift !== autoShiftDate.shift || draft.request_date !== autoShiftDate.date) {
      await pool.query(
        `UPDATE crushing_requests
         SET shift = ?, request_date = ?, updated_at = NOW()
         WHERE id = ?`,
        [autoShiftDate.shift, autoShiftDate.date, draft.id]
      );
    }

    const [items] = await pool.query<RowDataPacket[]>(
      `SELECT 
        cri.id, cri.item_type, cri.master_part_id, cri.material_id,
        cri.part_number_snapshot AS part_number,
        cri.part_name_snapshot AS material_name,
        cri.model_snapshot AS model_code,
        cri.berat_part_gr_snapshot AS berat_part_gr,
        cri.quantity_pcs,
        cri.weight_kg AS runner_weight_kg,
        cri.notes,
        mp.image_url
       FROM crushing_request_items cri
       LEFT JOIN master_parts mp ON cri.master_part_id = mp.id
       WHERE cri.request_id = ?
       ORDER BY cri.created_at ASC`,
      [draft.id]
    );

    return {
      id: draft.id,
      shift: autoShiftDate.shift,
      requestDate: autoShiftDate.date,
      notes: draft.notes || '',
      items: items.map((it) => ({
        id: it.id,
        item_type: it.item_type,
        master_part_id: it.master_part_id,
        material_id: it.material_id,
        material_name: it.material_name || it.part_number,
        part_number: it.part_number,
        model_code: it.model_code,
        image_url: StorageService.formatImageUrl(it.image_url),
        berat_part_gr: Number(it.berat_part_gr) || 0,
        quantity_pcs: it.quantity_pcs,
        runner_weight_kg: Number(it.runner_weight_kg) || 0,
        notes: it.notes,
      })),
    };
  }

  /**
   * Delete temporary ticket draft from MySQL
   */
  static async deleteDraft(userId: string) {
    await pool.query(
      `DELETE FROM crushing_requests WHERE sender_id = ? AND is_submitted = FALSE`,
      [userId]
    );
  }
}
