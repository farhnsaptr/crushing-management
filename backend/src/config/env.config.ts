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
  // true hanya untuk HTTPS production. false untuk HTTP / akses via IP LAN.
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'http://127.0.0.1:9000',
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY || 'minioadmin',
  MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME || 'crushing-management-parts',
  MINIO_REGION: process.env.MINIO_REGION || 'us-east-1',
  // Domain MinIO yang bisa diakses browser (tanpa bucket name & tanpa trailing slash)
  // Ganti ini jika domain/IP berubah — data di DB tidak terpengaruh karena hanya simpan key
  MINIO_BASE_URL: process.env.MINIO_BASE_URL || 'http://127.0.0.1:9000',
};
