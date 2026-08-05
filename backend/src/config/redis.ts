import { createClient } from 'redis';
import { env } from './env.config';

export const redisClient = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
  password: env.REDIS_PASSWORD || undefined,
});

let isRedisConnected = false;

redisClient.on('connect', () => {
  isRedisConnected = true;
  console.log('[Redis] Client connected successfully');
});

redisClient.on('error', (err) => {
  isRedisConnected = false;
  // Graceful log without crashing app if docker redis is not up yet
  console.warn('[Redis] Connection warning:', err.message || err);
});

export async function initRedis(): Promise<boolean> {
  try {
    await redisClient.connect();
    return true;
  } catch (error: any) {
    console.warn('[Redis] Failed to initialize connection:', error.message || error);
    return false;
  }
}

export function getIsRedisConnected(): boolean {
  return isRedisConnected;
}
