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
  role: 'admin' | 'operator';
  is_active: boolean;
}

export class AuthService {
  static async login(username: string, passwordPlain: string) {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, username, password_hash, full_name, role, is_active FROM users WHERE username = ? LIMIT 1',
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

    const tokenPayload = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }
}
