import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value.trim() === '') {
    throw new Error(`[Env Config Error] Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  PORT: requireEnv('PORT'),
  DB_HOST: requireEnv('DB_HOST'),
  DB_PORT: parseInt(requireEnv('DB_PORT'), 10),
  DB_USER: requireEnv('DB_USER'),
  DB_PASSWORD: process.env.DB_PASSWORD ?? '',
  DB_NAME: requireEnv('DB_NAME'),
  REDIS_HOST: requireEnv('REDIS_HOST'),
  REDIS_PORT: parseInt(requireEnv('REDIS_PORT'), 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? '',
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: requireEnv('JWT_EXPIRES_IN'),
  CORS_ORIGIN: requireEnv('CORS_ORIGIN'),
};
