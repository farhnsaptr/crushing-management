import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { redisClient, getIsRedisConnected } from '../config/redis';
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

    const logItemData = {
      waktu: timestamp,
      user,
      role,
      metode: method,
      endpoint,
      ip_address: String(ip),
      status: status.toString(),
      durasi: String(duration),
    };

    if (getIsRedisConnected()) {
      try {
        const entryId = await redisClient.xAdd(
          'logs:api-requests',
          '*',
          logItemData,
          {
            TRIM: {
              strategy: 'MAXLEN',
              strategyModifier: '~',
              threshold: 50000,
            },
          }
        );

        // Broadcast real-time SSE event to all connected clients
        broadcastSseEvent('new_log', {
          id: entryId,
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
        console.warn('[Logger] Failed to write log entry to Redis Stream:', err);
      }
    } else {
      // Fallback SSE broadcast even if Redis is temporarily offline
      broadcastSseEvent('new_log', {
        id: Date.now().toString(),
        waktu: timestamp,
        user,
        role,
        metode: method,
        endpoint,
        ip_address: String(ip),
        status,
        durasi_ms: duration,
      });
    }
  });

  next();
}
