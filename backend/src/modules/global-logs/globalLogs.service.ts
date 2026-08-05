import { redisClient, getIsRedisConnected } from '../../config/redis';

export class GlobalLogsService {
  static async getLogs(count: number = 100, startId: string = '+', endId: string = '-') {
    if (!getIsRedisConnected()) {
      return {
        logs: [],
        total: 0,
        notice: 'Redis server is not currently connected. Logs are paused.',
      };
    }

    try {
      // Use XREVRANGE to fetch logs in reverse chronological order
      const rawEntries = await redisClient.xRevRange('logs:api-requests', startId, endId, {
        COUNT: count,
      });

      const logs = rawEntries
        .filter((entry) => !entry.message.endpoint || !entry.message.endpoint.includes('/auth/me'))
        .map((entry) => ({
          id: entry.id,
          waktu: entry.message.waktu,
          user: entry.message.user,
          role: entry.message.role,
          metode: entry.message.metode,
          endpoint: entry.message.endpoint,
          ip_address: entry.message.ip_address,
          status: parseInt(entry.message.status || '200', 10),
          durasi_ms: parseInt(entry.message.durasi || '0', 10),
        }));

      const streamLength = await redisClient.xLen('logs:api-requests');

      return {
        logs,
        total: streamLength,
      };
    } catch (err: any) {
      console.error('[GlobalLogsService] Error fetching logs from Redis stream:', err);
      return {
        logs: [],
        total: 0,
        error: err.message,
      };
    }
  }

  static async clearAllLogs(): Promise<void> {
    if (getIsRedisConnected()) {
      await redisClient.del('logs:api-requests');
    }
  }
}
