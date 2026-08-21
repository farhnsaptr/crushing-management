import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/database';
import { env } from '../../config/env.config';
import { RowDataPacket } from 'mysql2';

export interface UserRow extends RowDataPacket {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  role: 'super-admin' | 'admin' | 'operator' | 'pengirim';
  factory_id?: string | null;
  factory_name?: string | null;
  department_id?: string | null;
  department_name?: string | null;
  is_active: boolean;
  last_login_at?: string;
}

export class AuthService {
  static async login(username: string, passwordPlain: string) {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT 
        u.id, u.username, u.password_hash, u.full_name, u.role, u.is_active,
        u.factory_id, f.name AS factory_name,
        u.department_id, d.name AS department_name
       FROM users u
       LEFT JOIN factories f ON u.factory_id = f.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.username = ? LIMIT 1`,
      [username]
    );

    if (rows.length === 0) {
      throw new Error('Invalid username or password');
    }

    const user = rows[0];

    if (!user.is_active) {
      throw new Error('Account is inactive. Please contact administrator.');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid username or password');
    }

    // Update last_login_at timestamp in database
    await pool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const tokenPayload = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      factory_id: user.factory_id || null,
      factory_name: user.factory_name || null,
      department_id: user.department_id || null,
      department_name: user.department_name || null,
    };

    const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: '30d',
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        factory_id: user.factory_id || null,
        factory_name: user.factory_name || null,
        department_id: user.department_id || null,
        department_name: user.department_name || null,
      },
    };
  }

  static async getFreshUserProfile(userId: string) {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT 
        u.id, u.username, u.full_name, u.role, u.is_active, u.last_login_at,
        u.factory_id, f.name AS factory_name,
        u.department_id, d.name AS department_name
       FROM users u
       LEFT JOIN factories f ON u.factory_id = f.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ? LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  }
}
