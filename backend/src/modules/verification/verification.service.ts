import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';

export interface VerificationItemDto {
  material_id?: string | null;
  material_name: string;
  system_ng_weight_kg: number;
  system_runner_weight_kg: number;
  system_total_weight_kg: number;
  box_count: number;
  kg_per_box: number;
  actual_output_kg: number;
  crushing_waste_kg: number;
}

export interface SaveVerificationPayloadDto {
  verification_date: string;
  shift: 'Pagi' | 'Malam';
  notes?: string;
  items: Array<{
    material_id?: string | null;
    material_name: string;
    system_ng_weight_kg?: number;
    system_runner_weight_kg?: number;
    system_total_weight_kg?: number;
    actual_output_kg: number;
    box_count?: number;
    kg_per_box?: number;
  }>;
}

export class VerificationService {
  /**
   * Get verification status & aggregated system weights per reuse material for date & shift.
   */
  static async getVerificationDetails(dateStr: string, shift: 'Pagi' | 'Malam') {
    const cleanDate = dateStr.trim();
    const cleanShift = shift === 'Malam' ? 'Malam' : 'Pagi';

    // 1. Check existing header record in input_verifications
    const [headerRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM input_verifications WHERE verification_date = ? AND shift = ?`,
      [cleanDate, cleanShift]
    );

    const existingHeader = headerRows[0] || null;

    // 2. Fetch Part NG reuse material transactions
    const [ngRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        mm.id AS material_id,
        COALESCE(mm.material_name, mp.material, 'Unassigned Material') AS material_name,
        SUM(t.weight_kg) AS total_ng_kg
       FROM ng_transactions t
       JOIN master_parts mp ON t.master_part_id = mp.id
       LEFT JOIN master_materials mm ON mp.material_id = mm.id
       WHERE DATE(t.transaction_date) = ? AND t.shift = ?
         AND (mm.recycle_type = 'reuse' OR (mm.recycle_type IS NULL AND LOWER(mp.material) NOT LIKE '%no reuse%'))
       GROUP BY mm.id, COALESCE(mm.material_name, mp.material, 'Unassigned Material')`,
      [cleanDate, cleanShift]
    );

    // 3. Fetch Part Runner reuse material transactions
    const [runnerRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        mm.id AS material_id,
        COALESCE(mm.material_name, rmt.material_name_snapshot, 'Unassigned Material') AS material_name,
        SUM(rmt.total_runner_weight_kg) AS total_runner_kg
       FROM runner_material_transactions rmt
       LEFT JOIN master_materials mm ON (rmt.material_id = mm.id OR rmt.material_name_snapshot = mm.material_name)
       WHERE DATE(rmt.transaction_date) = ? AND rmt.shift = ?
         AND (mm.recycle_type = 'reuse' OR (mm.recycle_type IS NULL AND LOWER(rmt.material_name_snapshot) NOT LIKE '%no reuse%'))
       GROUP BY mm.id, COALESCE(mm.material_name, rmt.material_name_snapshot, 'Unassigned Material')`,
      [cleanDate, cleanShift]
    );

    // Group materials in map
    interface CombinedMat {
      material_id: string | null;
      material_name: string;
      system_ng_weight_kg: number;
      system_runner_weight_kg: number;
      system_total_weight_kg: number;
      box_count: number;
      kg_per_box: number;
      actual_output_kg: number;
      crushing_waste_kg: number;
    }

    const materialMap = new Map<string, CombinedMat>();

    for (const r of ngRows) {
      const name = r.material_name;
      const matId = r.material_id || null;
      const ngWeight = Number(r.total_ng_kg) || 0;

      const entry = materialMap.get(name) || {
        material_id: matId,
        material_name: name,
        system_ng_weight_kg: 0,
        system_runner_weight_kg: 0,
        system_total_weight_kg: 0,
        box_count: 0,
        kg_per_box: 0,
        actual_output_kg: 0,
        crushing_waste_kg: 0,
      };
      entry.system_ng_weight_kg += ngWeight;
      entry.system_total_weight_kg += ngWeight;
      materialMap.set(name, entry);
    }

    for (const r of runnerRows) {
      const name = r.material_name;
      const matId = r.material_id || null;
      const runnerWeight = Number(r.total_runner_kg) || 0;

      const entry = materialMap.get(name) || {
        material_id: matId,
        material_name: name,
        system_ng_weight_kg: 0,
        system_runner_weight_kg: 0,
        system_total_weight_kg: 0,
        box_count: 0,
        kg_per_box: 0,
        actual_output_kg: 0,
        crushing_waste_kg: 0,
      };
      entry.system_runner_weight_kg += runnerWeight;
      entry.system_total_weight_kg += runnerWeight;
      materialMap.set(name, entry);
    }

    // 4. If existing verification items exist in DB, merge actual_output_kg
    if (existingHeader) {
      const [savedItems] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM input_verification_items WHERE verification_id = ?`,
        [existingHeader.id]
      );

      for (const sItem of savedItems) {
        const name = sItem.material_name_snapshot;
        const entry = materialMap.get(name) || {
          material_id: sItem.material_id || null,
          material_name: name,
          system_ng_weight_kg: Number(sItem.system_ng_weight_kg) || 0,
          system_runner_weight_kg: Number(sItem.system_runner_weight_kg) || 0,
          system_total_weight_kg: Number(sItem.system_total_weight_kg) || 0,
          box_count: 0,
          kg_per_box: 0,
          actual_output_kg: 0,
          crushing_waste_kg: 0,
        };

        entry.box_count = Number(sItem.box_count) || 0;
        entry.kg_per_box = Number(sItem.kg_per_box) || 0;
        entry.actual_output_kg = Number(sItem.actual_output_kg) || 0;
        entry.crushing_waste_kg = Number(sItem.crushing_waste_kg) || Math.max(0, entry.system_total_weight_kg - entry.actual_output_kg);

        materialMap.set(name, entry);
      }
    }

    const items = Array.from(materialMap.values()).map((item) => {
      const sysNg = Number(item.system_ng_weight_kg.toFixed(2));
      const sysRun = Number(item.system_runner_weight_kg.toFixed(2));
      const sysTot = Number((sysNg + sysRun).toFixed(2));

      const actualOut = Number((item.actual_output_kg || 0).toFixed(2));
      const wasteLoss = Number(Math.max(0, sysTot - actualOut).toFixed(2));

      return {
        material_id: item.material_id,
        material_name: item.material_name,
        system_ng_weight_kg: sysNg,
        system_runner_weight_kg: sysRun,
        system_total_weight_kg: sysTot,
        box_count: Number(item.box_count) || 0,
        kg_per_box: Number(item.kg_per_box) || 0,
        actual_output_kg: actualOut,
        crushing_waste_kg: wasteLoss,
      };
    });

    const totalSystemWeight = Number(items.reduce((acc, curr) => acc + curr.system_total_weight_kg, 0).toFixed(2));
    const totalActualOutput = Number(items.reduce((acc, curr) => acc + curr.actual_output_kg, 0).toFixed(2));
    const totalCrushingWaste = Number(items.reduce((acc, curr) => acc + curr.crushing_waste_kg, 0).toFixed(2));

    return {
      date: cleanDate,
      shift: cleanShift,
      has_input: items.length > 0,
      is_validated: existingHeader ? existingHeader.status === 'validated' : false,
      header: existingHeader
        ? {
          id: existingHeader.id,
          status: existingHeader.status,
          total_system_weight_kg: Number(existingHeader.total_system_weight_kg),
          total_actual_output_kg: Number(existingHeader.total_actual_output_kg),
          total_crushing_waste_kg: Number(existingHeader.total_crushing_waste_kg),
          notes: existingHeader.notes || '',
          validated_by: existingHeader.validated_by,
          validated_by_name: existingHeader.validated_by_name_snapshot,
          validated_at: existingHeader.validated_at,
        }
        : null,
      summary: {
        total_materials_count: items.length,
        total_system_weight_kg: totalSystemWeight,
        total_actual_output_kg: totalActualOutput,
        total_crushing_waste_kg: totalCrushingWaste,
      },
      items,
    };
  }

  /**
   * Save or Update Verification Records (Header + Items).
   */
  static async saveVerification(
    payload: SaveVerificationPayloadDto,
    userId?: string | null,
    userName?: string | null
  ) {
    const { verification_date, shift, notes, items } = payload;
    if (!verification_date || !shift) {
      throw new Error('Tanggal dan Shift verifikasi wajib diisi.');
    }

    const cleanDate = verification_date.trim();
    const cleanShift = shift === 'Malam' ? 'Malam' : 'Pagi';

    // 1. Calculate totals without hard-blocking when actual_output_kg exceeds system input
    let totalSysWeight = 0;
    let totalActOutput = 0;
    let totalWaste = 0;

    const processedItems = items.map((item) => {
      const sysNg = Number(item.system_ng_weight_kg) || 0;
      const sysRun = Number(item.system_runner_weight_kg) || 0;
      const sysTot = Number((sysNg + sysRun).toFixed(2));

      const actOut = Math.max(0, Number(Number(item.actual_output_kg || 0).toFixed(2)));
      // Safe Waste calculation: if actual output exceeds system input, waste is gracefully clamped at 0
      const waste = Number(Math.max(0, sysTot - actOut).toFixed(2));

      totalSysWeight += sysTot;
      totalActOutput += actOut;
      totalWaste += waste;

      return {
        material_id: item.material_id || null,
        material_name: item.material_name.trim(),
        system_ng_weight_kg: sysNg,
        system_runner_weight_kg: sysRun,
        system_total_weight_kg: sysTot,
        actual_output_kg: actOut,
        crushing_waste_kg: waste,
        box_count: Number(item.box_count) || 0,
        kg_per_box: Number(item.kg_per_box) || 0,
      };
    });

    totalSysWeight = Number(totalSysWeight.toFixed(2));
    totalActOutput = Number(totalActOutput.toFixed(2));
    totalWaste = Number(totalWaste.toFixed(2));

    // 2. Check existing header
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM input_verifications WHERE verification_date = ? AND shift = ?`,
      [cleanDate, cleanShift]
    );

    let verificationId: string;
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (existing.length > 0) {
      verificationId = existing[0].id;
      await pool.query(
        `UPDATE input_verifications
         SET status = 'validated',
             total_system_weight_kg = ?,
             total_actual_output_kg = ?,
             total_crushing_waste_kg = ?,
             notes = ?,
             validated_by = ?,
             validated_by_name_snapshot = ?,
             validated_at = ?
         WHERE id = ?`,
        [
          totalSysWeight,
          totalActOutput,
          totalWaste,
          notes || null,
          userId || null,
          userName || 'Operator',
          nowStr,
          verificationId,
        ]
      );
    } else {
      verificationId = randomUUID();
      await pool.query(
        `INSERT INTO input_verifications
         (id, verification_date, shift, status, total_system_weight_kg, total_actual_output_kg, total_crushing_waste_kg, notes, validated_by, validated_by_name_snapshot, validated_at)
         VALUES (?, ?, ?, 'validated', ?, ?, ?, ?, ?, ?, ?)`,
        [
          verificationId,
          cleanDate,
          cleanShift,
          totalSysWeight,
          totalActOutput,
          totalWaste,
          notes || null,
          userId || null,
          userName || 'Operator',
          nowStr,
        ]
      );
    }

    // 3. Re-insert items
    await pool.query(`DELETE FROM input_verification_items WHERE verification_id = ?`, [verificationId]);

    for (const item of processedItems) {
      const itemId = randomUUID();
      await pool.query(
        `INSERT INTO input_verification_items
         (id, verification_id, material_id, material_name_snapshot, system_ng_weight_kg, system_runner_weight_kg, system_total_weight_kg, actual_output_kg, crushing_waste_kg, box_count, kg_per_box)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          verificationId,
          item.material_id,
          item.material_name,
          item.system_ng_weight_kg,
          item.system_runner_weight_kg,
          item.system_total_weight_kg,
          item.actual_output_kg,
          item.crushing_waste_kg,
          item.box_count,
          item.kg_per_box,
        ]
      );
    }

    return {
      id: verificationId,
      verification_date: cleanDate,
      shift: cleanShift,
      status: 'validated',
      total_system_weight_kg: totalSysWeight,
      total_actual_output_kg: totalActOutput,
      total_crushing_waste_kg: totalWaste,
      validated_by_name: userName || 'Operator',
      validated_at: nowStr,
    };
  }

  /**
   * Get verification status indicator for Dashboard.
   */
  static async getDashboardVerificationStatus(dateStr?: string, shift?: string) {
    const targetDate = dateStr || new Date().toISOString().substring(0, 10);
    const targetShift = shift === 'Malam' ? 'Malam' : 'Pagi';

    // 1. Check if there are any input transactions (NG or Runner) for this date & shift
    const [txCountRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        (SELECT COUNT(*) FROM ng_transactions t 
         JOIN master_parts mp ON t.master_part_id = mp.id 
         LEFT JOIN master_materials mm ON mp.material_id = mm.id 
         WHERE DATE(t.transaction_date) = ? AND t.shift = ? 
           AND (mm.recycle_type = 'reuse' OR (mm.recycle_type IS NULL AND LOWER(mp.material) NOT LIKE '%no reuse%')))
        +
        (SELECT COUNT(*) FROM runner_material_transactions rmt 
         LEFT JOIN master_materials mm ON (rmt.material_id = mm.id OR rmt.material_name_snapshot = mm.material_name) 
         WHERE DATE(rmt.transaction_date) = ? AND rmt.shift = ? 
           AND (mm.recycle_type = 'reuse' OR (mm.recycle_type IS NULL AND LOWER(rmt.material_name_snapshot) NOT LIKE '%no reuse%')))
        AS total_reuse_transactions`,
      [targetDate, targetShift, targetDate, targetShift]
    );

    const totalReuseTx = Number(txCountRows[0]?.total_reuse_transactions) || 0;

    // 2. Check verification header record in input_verifications
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM input_verifications WHERE verification_date = ? AND shift = ?`,
      [targetDate, targetShift]
    );

    if (totalReuseTx === 0) {
      return {
        date: targetDate,
        shift: targetShift,
        has_input: false,
        is_validated: false,
        status: 'no_input',
        message: `Belum ada transaksi input material Reuse pada Tanggal ${targetDate} (Shift ${targetShift}).`,
        header: null,
      };
    }

    if (rows.length === 0 || rows[0].status !== 'validated') {
      return {
        date: targetDate,
        shift: targetShift,
        has_input: true,
        is_validated: false,
        status: 'pending',
        message: `Status Pekerjaan Tanggal ${targetDate} (${targetShift}) BELUM DIVALIDASI oleh Operator.`,
        header: null,
      };
    }

    const h = rows[0];
    return {
      date: targetDate,
      shift: targetShift,
      has_input: true,
      is_validated: true,
      status: 'validated',
      message: `Pekerjaan Tanggal ${targetDate} (${targetShift}) SUDAH DIVALIDASI oleh ${h.validated_by_name_snapshot || 'Operator'}.`,
      header: {
        id: h.id,
        status: h.status,
        total_system_weight_kg: Number(h.total_system_weight_kg),
        total_actual_output_kg: Number(h.total_actual_output_kg),
        total_crushing_waste_kg: Number(h.total_crushing_waste_kg),
        validated_by_name: h.validated_by_name_snapshot,
        validated_at: h.validated_at,
      },
    };
  }
}
