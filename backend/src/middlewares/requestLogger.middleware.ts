import { Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { AuthenticatedRequest } from './auth.middleware';
import { pool } from '../config/database';
import { broadcastSseEvent } from '../utils/sse.util';

export function requestLogger(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  res.on('finish', async () => {
    const endpoint = req.originalUrl || req.url;

    // Skip logging for frequent session check endpoint /api/auth/me & SSE stream connections
    if (endpoint.includes('/auth/me') || endpoint.includes('/admin/logs/stream')) {
      return;
    }

    const duration = Date.now() - startTime;
    const user = req.user ? req.user.username : 'guest';
    const role = req.user ? req.user.role : 'none';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const method = req.method;
    const status = res.statusCode;
    const timestamp = new Date().toISOString();
    const logId = randomUUID();

    try {
      // 1. Persist audit log to MySQL api_audit_logs table
      await pool.query(
        `INSERT INTO api_audit_logs 
         (id, timestamp, method, endpoint, status_code, response_time_ms, username, role, ip_address)
         VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
        [logId, method, endpoint, status, duration, user, role, String(ip)]
      );

      // 2. Broadcast real-time SSE event to all connected admin clients
      broadcastSseEvent('new_log', {
        id: logId,
        waktu: timestamp,
        user,
        role,
        metode: method,
        endpoint,
        ip_address: String(ip),
        status,
        durasi_ms: duration,
      });
    } catch (err) {
      console.warn('[Logger] Failed to write audit log to MySQL database:', err);
    }
  });

  next();
}
