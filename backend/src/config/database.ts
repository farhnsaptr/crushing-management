import mysql from 'mysql2/promise';
import { env } from './env.config';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

export async function testDbConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('[Database] Connected successfully to MySQL database:', env.DB_NAME);
    return true;
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    return false;
  }
}
