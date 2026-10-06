import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class MaterialsService {
  /** Nama material harus unik juga terhadap nama material campuran. */
  private static async assertNotMixedName(name: string) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM mixed_materials WHERE mixed_name = ?', [name]);
    if (rows.length > 0) {
      throw new Error(`Nama "${name}" sudah dipakai oleh material campuran.`);
    }
  }

  private static async assertMixedExists(mixedId: string) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM mixed_materials WHERE id = ?', [mixedId]);
    if (rows.length === 0) throw new Error('Material campuran tidak ditemukan.');
  }

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
        mm.mixed_material_id,
        xm.mixed_name AS mixed_material_name,
        mm.created_at,
        mm.updated_at,
        COUNT(mp.id) AS used_parts_count
      FROM master_materials mm
      LEFT JOIN mixed_materials xm ON xm.id = mm.mixed_material_id
      LEFT JOIN master_parts mp ON mp.material_id = mm.id
      ${whereClause}
      GROUP BY mm.id, xm.mixed_name
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
        mm.mixed_material_id,
        xm.mixed_name AS mixed_material_name,
        mm.created_at,
        mm.updated_at,
        COUNT(mp.id) AS used_parts_count
       FROM master_materials mm
       LEFT JOIN mixed_materials xm ON xm.id = mm.mixed_material_id
       LEFT JOIN master_parts mp ON mp.material_id = mm.id
       WHERE mm.id = ?
       GROUP BY mm.id, xm.mixed_name`,
      [id]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      used_parts_count: Number(rows[0].used_parts_count || 0),
    };
  }

  static async createMaterial(data: { material_name: string; description?: string; recycle_type?: 'reuse' | 'no_reuse'; mixed_material_id?: string | null }) {
    const cleanName = data.material_name.trim();

    // Check duplicate material_name
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM master_materials WHERE material_name = ?',
      [cleanName]
    );

    if (existing.length > 0) {
      throw new Error(`Nama material "${cleanName}" sudah terdaftar.`);
    }

    await this.assertNotMixedName(cleanName);
    const mixedMaterialId = data.mixed_material_id || null;
    if (mixedMaterialId) await this.assertMixedExists(mixedMaterialId);

    const id = randomUUID();
    let recycleType = data.recycle_type;
    if (!recycleType) {
      const desc = (data.description || '').toLowerCase();
      recycleType = desc.includes('no reuse') ? 'no_reuse' : 'reuse';
    }

    await pool.query(
      'INSERT INTO master_materials (id, material_name, description, recycle_type, mixed_material_id) VALUES (?, ?, ?, ?, ?)',
      [id, cleanName, data.description || null, recycleType, mixedMaterialId]
    );

    return this.getMaterialById(id);
  }

  static async updateMaterial(id: string, data: { material_name?: string; description?: string; recycle_type?: 'reuse' | 'no_reuse'; mixed_material_id?: string | null }) {
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

    if (data.material_name && cleanName !== existing.material_name) {
      await this.assertNotMixedName(cleanName);
    }

    // mixed_material_id tidak dikirim = mapping campuran tidak diubah; null / '' = lepas dari campuran
    let mixedMaterialId: string | null = existing.mixed_material_id || null;
    if (data.mixed_material_id !== undefined) {
      mixedMaterialId = data.mixed_material_id || null;
      if (mixedMaterialId) await this.assertMixedExists(mixedMaterialId);
    }

    await pool.query(
      'UPDATE master_materials SET material_name = ?, description = ?, recycle_type = ?, mixed_material_id = ? WHERE id = ?',
      [cleanName, description, recycleType, mixedMaterialId, id]
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
