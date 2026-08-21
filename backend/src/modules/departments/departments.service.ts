import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface DepartmentDto {
  code: string;
  name: string;
  description?: string;
}

export class DepartmentsService {
  static async listDepartments() {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, code, name, description, created_at, updated_at FROM departments ORDER BY name ASC'
    );
    return rows;
  }

  static async getDepartmentById(id: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, code, name, description, created_at, updated_at FROM departments WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async createDepartment(data: DepartmentDto) {
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM departments WHERE code = ?',
      [data.code]
    );

    if (existing.length > 0) {
      throw new Error(`Departemen dengan kode '${data.code}' sudah ada`);
    }

    const id = randomUUID();
    await pool.query(
      'INSERT INTO departments (id, code, name, description) VALUES (?, ?, ?, ?)',
      [id, data.code.trim().toUpperCase(), data.name.trim(), data.description ? data.description.trim() : null]
    );

    return {
      id,
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      description: data.description || null,
    };
  }

  static async updateDepartment(id: string, data: Partial<DepartmentDto>) {
    const existing = await this.getDepartmentById(id);
    if (!existing) {
      throw new Error('Departemen tidak ditemukan');
    }

    const code = data.code !== undefined ? data.code.trim().toUpperCase() : existing.code;
    const name = data.name !== undefined ? data.name.trim() : existing.name;
    const description = data.description !== undefined ? data.description : existing.description;

    if (data.code && data.code.trim().toUpperCase() !== existing.code) {
      const [duplicate] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM departments WHERE code = ? AND id != ?',
        [code, id]
      );
      if (duplicate.length > 0) {
        throw new Error(`Departemen dengan kode '${code}' sudah digunakan`);
      }
    }

    await pool.query(
      'UPDATE departments SET code = ?, name = ?, description = ? WHERE id = ?',
      [code, name, description || null, id]
    );

    return { id, code, name, description };
  }

  static async deleteDepartment(id: string) {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM departments WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Departemen tidak ditemukan');
    }

    return { id };
  }
}
