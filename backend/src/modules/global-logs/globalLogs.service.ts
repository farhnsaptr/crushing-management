import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';

export class GlobalLogsService {
  static async getLogs(count: number = 100) {
    try {
      const limit = Math.max(1, Math.min(1000, Number(count) || 100));

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          id,
          DATE_FORMAT(timestamp, '%Y-%m-%dT%H:%i:%s.000Z') AS waktu,
          username AS user,
          role,
          method AS metode,
          endpoint,
          ip_address,
          status_code AS status,
          response_time_ms AS durasi_ms
         FROM api_audit_logs
         ORDER BY timestamp DESC
         LIMIT ?`,
        [limit]
      );

      const [countResult] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total FROM api_audit_logs`
      );
      const total = countResult[0]?.total || 0;

      return {
        logs: rows,
        total,
      };
    } catch (err: any) {
      console.error('[GlobalLogsService] Error fetching logs from MySQL database:', err);
      return {
        logs: [],
        total: 0,
        error: err.message,
      };
    }
  }

  static async clearAllLogs(): Promise<void> {
    await pool.query('DELETE FROM api_audit_logs');
  }
}
