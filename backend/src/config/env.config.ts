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
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: requireEnv('JWT_EXPIRES_IN'),
  CORS_ORIGIN: requireEnv('CORS_ORIGIN'),
  COOKIE_SECURE: requireEnv('COOKIE_SECURE') === 'true',
  MINIO_ACCESS_KEY: requireEnv('MINIO_ACCESS_KEY'),
  MINIO_SECRET_KEY: requireEnv('MINIO_SECRET_KEY'),
  MINIO_BUCKET_NAME: requireEnv('MINIO_BUCKET_NAME'),
  MINIO_REGION: requireEnv('MINIO_REGION'),
  MINIO_BASE_URL: requireEnv('MINIO_BASE_URL'),
 MINIO_FOLDER_MASTER_PARTS: requireEnv('MINIO_FOLDER_MASTER_PARTS'),
 API_BASE_URL: process.env.API_BASE_URL || '',
 // Integrasi Crusing API. Opsional agar aplikasi tetap bisa boot tanpa integrasi.
 CRUSSING_API_BASE_URL: process.env.CRUSSING_API_BASE_URL || '',
 CRUSSING_API_CLIENT_ID: process.env.CRUSSING_API_CLIENT_ID || '',
 CRUSSING_API_CLIENT_SECRET: process.env.CRUSSING_API_CLIENT_SECRET || '',
 CRUSSING_API_TIMEOUT_MS: parseInt(process.env.CRUSSING_API_TIMEOUT_MS || '60000', 10),
 // Format: 'Cibitung=SC1,Karawang=SC2'
 CRUSSING_LOCATION_MAP: process.env.CRUSSING_LOCATION_MAP || '',
};
