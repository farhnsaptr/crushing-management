import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class FactoriesService {
  static async listFactories() {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, code, name, location, created_at FROM factories ORDER BY created_at ASC'
    );
    return rows;
  }

  static async getFactoryById(id: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, code, name, location, created_at FROM factories WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async createFactory(data: { code: string; name: string; location?: string }) {
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM factories WHERE code = ?',
      [data.code]
    );

    if (existing.length > 0) {
      throw new Error(`Factory with code '${data.code}' already exists`);
    }

    const id = randomUUID();
    await pool.query(
      'INSERT INTO factories (id, code, name, location) VALUES (?, ?, ?, ?)',
      [id, data.code, data.name, data.location || null]
    );

    return { id, ...data };
  }

  static async updateFactory(id: string, data: { code?: string; name?: string; location?: string }) {
    const existing = await this.getFactoryById(id);
    if (!existing) {
      throw new Error('Factory not found');
    }

    const code = data.code || existing.code;
    const name = data.name || existing.name;
    const location = data.location !== undefined ? data.location : existing.location;

    await pool.query(
      'UPDATE factories SET code = ?, name = ?, location = ? WHERE id = ?',
      [code, name, location, id]
    );

    return { id, code, name, location };
  }

  static async deleteFactory(id: string) {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM factories WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Factory not found');
    }

    return { id };
  }
}
