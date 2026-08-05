import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';

export class MasterPartsService {
  static async searchParts(query: string) {
    const searchTerm = `%${query}%`;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT mp.part_number, mp.part_name, mp.jenis_part, mp.material
       FROM master_parts mp
       WHERE (mp.part_number LIKE ? OR mp.part_name LIKE ?) AND mp.is_active = TRUE
       LIMIT 20`,
      [searchTerm, searchTerm]
    );
    return rows;
  }

  static async getModelsForPartNumber(partNumber: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT mp.id AS master_part_id, mp.part_number, mp.part_name, mp.berat_part_gr, mp.image_url,
              m.id AS model_id, m.model_code, mc.name AS machine_name, f.name AS factory_name
       FROM master_parts mp
       JOIN master_models m ON mp.model_id = m.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories f ON mc.factory_id = f.id
       WHERE mp.part_number = ? AND mp.is_active = TRUE`,
      [partNumber]
    );
    return rows;
  }

  static async getByQrCode(qrCodeValue: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT mp.id AS master_part_id, mp.part_number, mp.part_name, mp.jenis_part, mp.material,
              mp.berat_part_gr, mp.image_url, mp.qr_code_value,
              m.id AS model_id, m.model_code, mc.name AS machine_name, f.name AS factory_name
       FROM master_parts mp
       JOIN master_models m ON mp.model_id = m.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories f ON mc.factory_id = f.id
       WHERE mp.qr_code_value = ? AND mp.is_active = TRUE
       LIMIT 1`,
      [qrCodeValue]
    );
    return rows[0] || null;
  }

  static async getPartsByJenis(jenisPart: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT mp.id AS master_part_id, mp.part_number, mp.part_name, mp.jenis_part, mp.material,
              mp.berat_part_gr, mp.image_url, mp.qr_code_value,
              m.model_code, mc.name AS machine_name, f.name AS factory_name
       FROM master_parts mp
       JOIN master_models m ON mp.model_id = m.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories f ON mc.factory_id = f.id
       WHERE mp.jenis_part = ? AND mp.is_active = TRUE`,
      [jenisPart]
    );
    return rows;
  }

  static async listAllParts(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM master_parts WHERE is_active = TRUE'
    );
    const total = countRows[0].total;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT mp.*, m.model_code, mc.name AS machine_name, mc.code AS machine_code, f.name AS factory_name, f.code AS factory_code
       FROM master_parts mp
       JOIN master_models m ON mp.model_id = m.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories f ON mc.factory_id = f.id
       WHERE mp.is_active = TRUE
       ORDER BY mp.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return {
      parts: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createPart(data: {
    sebango_code: string;
    machine_id: string;
    customer: string;
    model_id: string;
    part_number: string;
    part_name: string;
    jenis_part: string;
    material: string;
    shikake?: number;
    berat_part_gr: number;
    berat_runner_gr?: number;
    image_url?: string;
    qr_code_value?: string;
  }) {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO master_parts
       (id, sebango_code, machine_id, customer, model_id, part_number, part_name, jenis_part, material, shikake, berat_part_gr, berat_runner_gr, image_url, qr_code_value)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.sebango_code,
        data.machine_id,
        data.customer,
        data.model_id,
        data.part_number,
        data.part_name,
        data.jenis_part,
        data.material,
        data.shikake ?? 1,
        data.berat_part_gr,
        data.berat_runner_gr ?? 0,
        data.image_url ?? null,
        data.qr_code_value ?? null,
      ]
    );

    return { id, ...data };
  }
}
