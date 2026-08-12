import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class MaterialsService {
  static async listAllMaterials(page: number = 1, limit: number = 20, search: string = '') {
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search && search.trim() !== '') {
      whereClause += ' AND (mm.material_name LIKE ? OR mm.description LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM master_materials mm ${whereClause}`;
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params);
    const total = countRows[0].total;

    const dataQuery = `
      SELECT 
        mm.id,
        mm.material_name,
        mm.description,
        mm.recycle_type,
        mm.created_at,
        mm.updated_at,
        COUNT(mp.id) AS used_parts_count
      FROM master_materials mm
      LEFT JOIN master_parts mp ON mp.material_id = mm.id
      ${whereClause}
      GROUP BY mm.id
      ORDER BY mm.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query<RowDataPacket[]>(dataQuery, [...params, limit, offset]);

    return {
      materials: rows.map((r) => ({
        ...r,
        used_parts_count: Number(r.used_parts_count || 0),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getMaterialById(id: string): Promise<any> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        mm.id,
        mm.material_name,
        mm.description,
        mm.recycle_type,
        mm.created_at,
        mm.updated_at,
        COUNT(mp.id) AS used_parts_count
       FROM master_materials mm
       LEFT JOIN master_parts mp ON mp.material_id = mm.id
       WHERE mm.id = ?
       GROUP BY mm.id`,
      [id]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      used_parts_count: Number(rows[0].used_parts_count || 0),
    };
  }

  static async createMaterial(data: { material_name: string; description?: string; recycle_type?: 'reuse' | 'no_reuse' }) {
    const cleanName = data.material_name.trim();

    // Check duplicate material_name
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM master_materials WHERE material_name = ?',
      [cleanName]
    );

    if (existing.length > 0) {
      throw new Error(`Nama material "${cleanName}" sudah terdaftar.`);
    }

    const id = randomUUID();
    let recycleType = data.recycle_type;
    if (!recycleType) {
      const desc = (data.description || '').toLowerCase();
      recycleType = desc.includes('no reuse') ? 'no_reuse' : 'reuse';
    }

    await pool.query(
      'INSERT INTO master_materials (id, material_name, description, recycle_type) VALUES (?, ?, ?, ?)',
      [id, cleanName, data.description || null, recycleType]
    );

    return this.getMaterialById(id);
  }

  static async updateMaterial(id: string, data: { material_name?: string; description?: string; recycle_type?: 'reuse' | 'no_reuse' }) {
    const existing = await this.getMaterialById(id);
    if (!existing) {
      throw new Error('Material not found');
    }

    const cleanName = data.material_name !== undefined ? data.material_name.trim() : existing.material_name;
    const description = data.description !== undefined ? data.description : existing.description;
    
    let recycleType = data.recycle_type !== undefined ? data.recycle_type : existing.recycle_type;
    if (data.recycle_type === undefined && data.description !== undefined) {
      const desc = (description || '').toLowerCase();
      recycleType = desc.includes('no reuse') ? 'no_reuse' : 'reuse';
    }

    if (data.material_name && cleanName !== existing.material_name) {
      const [dup] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM master_materials WHERE material_name = ? AND id != ?',
        [cleanName, id]
      );
      if (dup.length > 0) {
        throw new Error(`Nama material "${cleanName}" sudah terdaftar.`);
      }
    }

    await pool.query(
      'UPDATE master_materials SET material_name = ?, description = ?, recycle_type = ? WHERE id = ?',
      [cleanName, description, recycleType, id]
    );

    return this.getMaterialById(id);
  }

  static async deleteMaterial(id: string) {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM master_materials WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Material not found');
    }

    return { id };
  }

  static async deleteAllMaterials() {
    const connection = await pool.getConnection();
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      const [result] = await connection.query<ResultSetHeader>('DELETE FROM master_materials');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      return { deletedCount: result.affectedRows };
    } finally {
      connection.release();
    }
  }

  /**
   * Fetches all master parts utilizing this specific material ID
   */
  static async getMaterialParts(id: string) {
    const material = await this.getMaterialById(id);
    if (!material) {
      throw new Error('Material tidak ditemukan.');
    }

    const [parts] = await pool.query<RowDataPacket[]>(
      `SELECT 
        mp.id,
        mp.part_number,
        mp.part_name,
        mp.sebango_code,
        mp.berat_part_gr,
        mp.berat_runner_gr,
        mp.jenis_part,
        mp.customer,
        mp.is_active,
        mmd.model_code,
        mmd.description AS model_description,
        mc.code AS machine_code,
        mc.name AS machine_name,
        fc.name AS factory_name
       FROM master_parts mp
       LEFT JOIN master_models mmd ON mp.model_id = mmd.id
       LEFT JOIN machines mc ON mp.machine_id = mc.id
       LEFT JOIN factories fc ON mc.factory_id = fc.id
       WHERE mp.material_id = ?
       ORDER BY mp.part_name ASC`,
      [id]
    );

    return {
      material,
      parts,
      totalParts: parts.length,
    };
  }
}
