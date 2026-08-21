import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class UsersService {
  static async listUsers(currentUserId?: string) {
    let query = `
      SELECT 
        u.id, u.username, u.full_name, u.role, u.factory_id, f.name AS factory_name,
        u.department_id, d.name AS department_name,
        u.is_active, u.last_login_at, u.created_at, u.updated_at 
      FROM users u
      LEFT JOIN factories f ON u.factory_id = f.id
      LEFT JOIN departments d ON u.department_id = d.id
    `;
    const params: any[] = [];

    if (currentUserId) {
      query += ' WHERE u.id != ?';
      params.push(currentUserId);
    }

    query += ' ORDER BY u.created_at DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows;
  }

  static async createUser(data: {
    username: string;
    password: string;
    full_name: string;
    role: 'super-admin' | 'admin' | 'operator' | 'pengirim';
    factory_id?: string | null;
    department_id?: string | null;
  }) {
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE username = ?',
      [data.username]
    );

    if (existing.length > 0) {
      throw new Error('Username already exists');
    }

    if (data.role === 'pengirim') {
      if (!data.factory_id || !data.department_id) {
        throw new Error('Pengguna dengan role Pengirim wajib memilih Factory dan Departemen');
      }
    }

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(data.password, 10);
    await pool.query<ResultSetHeader>(
      'INSERT INTO users (id, username, password_hash, full_name, role, factory_id, department_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        data.username,
        passwordHash,
        data.full_name,
        data.role,
        data.factory_id || null,
        data.department_id || null,
      ]
    );

    return {
      id,
      username: data.username,
      full_name: data.full_name,
      role: data.role,
      factory_id: data.factory_id || null,
      department_id: data.department_id || null,
      is_active: true,
    };
  }

  static async updateUser(
    userId: string,
    data: {
      full_name?: string;
      role?: 'super-admin' | 'admin' | 'operator' | 'pengirim';
      factory_id?: string | null;
      department_id?: string | null;
      password?: string;
    }
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.full_name !== undefined) {
      fields.push('full_name = ?');
      values.push(data.full_name);
    }

    if (data.role !== undefined) {
      fields.push('role = ?');
      values.push(data.role);
    }

    if (data.factory_id !== undefined) {
      fields.push('factory_id = ?');
      values.push(data.factory_id || null);
    }

    if (data.department_id !== undefined) {
      fields.push('department_id = ?');
      values.push(data.department_id || null);
    }

    if (data.password && data.password.trim() !== '') {
      const passwordHash = await bcrypt.hash(data.password, 10);
      fields.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (fields.length === 0) {
      throw new Error('No fields provided for update');
    }

    values.push(userId);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    const [result] = await pool.query<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }

    const [updatedRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        u.id, u.username, u.full_name, u.role, u.factory_id, f.name AS factory_name,
        u.department_id, d.name AS department_name,
        u.is_active, u.last_login_at, u.created_at, u.updated_at 
      FROM users u
      LEFT JOIN factories f ON u.factory_id = f.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = ?`,
      [userId]
    );

    return updatedRows[0];
  }

  static async updateUserStatus(userId: string, isActive: boolean) {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }

    return { id: userId, is_active: isActive };
  }

  static async deleteUser(userId: string) {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }

    return { id: userId };
  }
}
