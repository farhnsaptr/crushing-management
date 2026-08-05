import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { redisClient, getIsRedisConnected } from '../config/redis';

export function requestLogger(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    const user = req.user ? req.user.username : 'guest';
    const role = req.user ? req.user.role : 'none';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const method = req.method;
    const endpoint = req.originalUrl || req.url;
    const status = res.statusCode.toString();
    const timestamp = new Date().toISOString();

    if (getIsRedisConnected()) {
      try {
        await redisClient.xAdd(
          'logs:api-requests',
          '*',
          {
            waktu: timestamp,
            user,
            role,
            metode: method,
            endpoint,
            ip_address: String(ip),
            status,
            durasi: String(duration),
          },
          {
            TRIM: {
              strategy: 'MAXLEN',
              strategyModifier: '~',
              threshold: 50000,
            },
          }
        );
      } catch (err) {
        console.warn('[Logger] Failed to write log entry to Redis Stream:', err);
      }
    }
  });

  next();
}
