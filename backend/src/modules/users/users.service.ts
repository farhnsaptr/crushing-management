import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class UsersService {
  static async listUsers(currentUserId?: string) {
    if (currentUserId) {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id, username, full_name, role, is_active, last_login_at, created_at, updated_at FROM users WHERE id != ? ORDER BY created_at DESC',
        [currentUserId]
      );
      return rows;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, full_name, role, is_active, last_login_at, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }

  static async createUser(data: {
    username: string;
    password: string;
    full_name: string;
    role: 'admin' | 'operator';
  }) {
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE username = ?',
      [data.username]
    );

    if (existing.length > 0) {
      throw new Error('Username already exists');
    }

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(data.password, 10);
    await pool.query<ResultSetHeader>(
      'INSERT INTO users (id, username, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [id, data.username, passwordHash, data.full_name, data.role]
    );

    return {
      id,
      username: data.username,
      full_name: data.full_name,
      role: data.role,
      is_active: true,
    };
  }

  static async updateUser(
    userId: string,
    data: {
      full_name?: string;
      role?: 'admin' | 'operator';
      password?: string;
    }
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.full_name) {
      fields.push('full_name = ?');
      values.push(data.full_name);
    }

    if (data.role) {
      fields.push('role = ?');
      values.push(data.role);
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
      'SELECT id, username, full_name, role, is_active, last_login_at, created_at, updated_at FROM users WHERE id = ?',
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
