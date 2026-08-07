import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.config';

export const s3Client = new S3Client({
  endpoint: env.MINIO_ENDPOINT,
  region: env.MINIO_REGION,
  credentials: {
    accessKeyId: env.MINIO_ACCESS_KEY,
    secretAccessKey: env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO S3 compatibility
});
