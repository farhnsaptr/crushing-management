import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class MaterialsService {
  static async listAllMaterials(page: number = 1, limit: number = 20, search: string = '') {
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search && search.trim() !== '') {
      whereClause += ' AND (material_name LIKE ? OR description LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM master_materials ${whereClause}`;
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params);
    const total = countRows[0].total;

    const dataQuery = `
      SELECT * FROM master_materials
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query<RowDataPacket[]>(dataQuery, [...params, limit, offset]);

    return {
      materials: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getMaterialById(id: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM master_materials WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async createMaterial(data: { material_name: string; description?: string }) {
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
    await pool.query(
      'INSERT INTO master_materials (id, material_name, description) VALUES (?, ?, ?)',
      [id, cleanName, data.description || null]
    );

    return this.getMaterialById(id);
  }

  static async updateMaterial(id: string, data: { material_name?: string; description?: string }) {
    const existing = await this.getMaterialById(id);
    if (!existing) {
      throw new Error('Material not found');
    }

    const cleanName = data.material_name !== undefined ? data.material_name.trim() : existing.material_name;
    const description = data.description !== undefined ? data.description : existing.description;

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
      'UPDATE master_materials SET material_name = ?, description = ? WHERE id = ?',
      [cleanName, description, id]
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
}
