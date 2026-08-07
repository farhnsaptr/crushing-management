import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3.config';
import { env } from '../config/env.config';
import { randomUUID } from 'crypto';
import path from 'path';
import sharp from 'sharp';

export class StorageService {
  /**
   * Upload buffer / image file to MinIO S3 bucket after compressing with Sharp
   */
  static async uploadImageBuffer(
    buffer: Buffer,
    originalname: string = 'image.jpg',
    mimetype: string = 'image/jpeg',
    folder: string = 'master-parts'
  ): Promise<string> {
    const ext = '.jpg'; // Store compressed image as web-optimized JPEG
    const key = `${folder}/${randomUUID()}${ext}`;

    // Compress image using Sharp (max 1280x720 inside, quality 80, progressive)
    let finalBuffer = buffer;
    try {
      finalBuffer = await sharp(buffer)
        .resize({
          width: 1280,
          height: 720,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 80,
          progressive: true,
        })
        .toBuffer();

      console.log(
        `[StorageService] Image compressed with Sharp: Original ${buffer.length} bytes -> Compressed ${finalBuffer.length} bytes`
      );
    } catch (compressErr) {
      console.warn('[StorageService] Sharp compression fallback:', compressErr);
    }

    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.MINIO_BUCKET_NAME,
        Key: key,
        Body: finalBuffer,
        ContentType: 'image/jpeg',
      })
    );

    return `${env.MINIO_PUBLIC_URL}/${key}`;
  }

  /**
   * Delete an existing image object from MinIO S3 bucket given its public URL
   */
  static async deleteImageFromUrl(imageUrl: string | null | undefined): Promise<void> {
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes(env.MINIO_BUCKET_NAME)) {
      return;
    }

    try {
      // Extract key from public URL: http://127.0.0.1:9000/crushing-management-parts/master-parts/UUID.jpg -> master-parts/UUID.jpg
      const urlParts = imageUrl.split(`${env.MINIO_BUCKET_NAME}/`);
      if (urlParts.length < 2) return;

      const key = urlParts[1];
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: env.MINIO_BUCKET_NAME,
          Key: key,
        })
      );
      console.log(`[StorageService] Deleted old image object from MinIO S3: ${key}`);
    } catch (err) {
      console.warn(`[StorageService] Failed to delete old image object ${imageUrl}:`, err);
    }
  }
}
