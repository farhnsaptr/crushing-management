import { PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3.config';
import { env } from '../config/env.config';
import { SiteConfigService } from '../modules/site-config/siteConfig.service';
import { randomUUID } from 'crypto';
import path from 'path';
import sharp from 'sharp';

export class StorageService {
  /**
   * Helper untuk mengekstrak object key dari string path atau URL lengkap lama
   */
  static extractKey(imageUrlOrKey: string | null | undefined): string | null {
    if (!imageUrlOrKey || typeof imageUrlOrKey !== 'string') return null;
    const cleanStr = imageUrlOrKey.trim();
    if (!cleanStr) return null;

    const storageConfig = SiteConfigService.getStorageConfigSync();
    const bucketName = storageConfig.minio_bucket_name;

    // Jika mengandung bucket name
    if (cleanStr.includes(`${bucketName}/`)) {
      const parts = cleanStr.split(`${bucketName}/`);
      return parts[parts.length - 1].replace(/^\/+/, '');
    }

    // Jika merupakan URL penuh dengan protocol http/https tapi bucket tidak cocok
    if (cleanStr.startsWith('http://') || cleanStr.startsWith('https://')) {
      try {
        const parsed = new URL(cleanStr);
        const pathname = parsed.pathname.replace(/^\/+/, '');
        if (pathname.startsWith(`${bucketName}/`)) {
          return pathname.substring(bucketName.length + 1);
        }
        return pathname;
      } catch {
        // Fallback jika parsing URL gagal
      }
    }

    // Default: buang slash di awal jika ada
    return cleanStr.replace(/^\/+/, '');
  }

  /**
   * Membentuk public URL lengkap secara dinamis berdasarkan site_config (dengan fallback ke .env)
   */
  static formatImageUrl(keyOrUrl: string | null | undefined): string | null {
    const key = this.extractKey(keyOrUrl);
    if (!key) return null;

    const storageConfig = SiteConfigService.getStorageConfigSync();
    const baseUrl = storageConfig.minio_base_url.replace(/\/+$/, '');
    const bucket = storageConfig.minio_bucket_name.replace(/^\/+|\/+$/g, '');

    return `${baseUrl}/${bucket}/${key}`;
  }

  /**
   * Upload buffer / image file to MinIO S3 bucket after compressing with Sharp
   * Menggunakan nama folder dinamis dari site_config jika tidak dispesifikasikan eksplisit.
   */
  static async uploadImageBuffer(
    buffer: Buffer,
    originalname: string = 'image.jpg',
    mimetype: string = 'image/jpeg',
    folder?: string
  ): Promise<string> {
    const storageConfig = SiteConfigService.getStorageConfigSync();
    const targetFolder = folder || storageConfig.minio_folder_master_parts || 'master-parts';

    const ext = '.jpg'; // Store compressed image as web-optimized JPEG
    const key = `${targetFolder}/${randomUUID()}${ext}`;

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
        Bucket: storageConfig.minio_bucket_name,
        Key: key,
        Body: finalBuffer,
        ContentType: 'image/jpeg',
      })
    );

    // Kembalikan key saja untuk disimpan di database
    return key;
  }

  /**
   * Pindahkan / Salin objek S3 dari bucket/key lama ke bucket/key baru
   */
  static async moveObject(
    sourceBucket: string,
    sourceKey: string,
    targetBucket: string,
    targetKey: string
  ): Promise<boolean> {
    const cleanSourceKey = this.extractKey(sourceKey);
    const cleanTargetKey = this.extractKey(targetKey);
    if (!cleanSourceKey || !cleanTargetKey) return false;

    try {
      // 1. Copy object di S3
      await s3Client.send(
        new CopyObjectCommand({
          Bucket: targetBucket,
          CopySource: encodeURI(`${sourceBucket}/${cleanSourceKey}`),
          Key: cleanTargetKey,
        })
      );

      // 2. Delete source object jika lokasi berbeda
      if (sourceBucket !== targetBucket || cleanSourceKey !== cleanTargetKey) {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: sourceBucket,
            Key: cleanSourceKey,
          })
        );
      }

      console.log(
        `[StorageService] Moved S3 object: ${sourceBucket}/${cleanSourceKey} -> ${targetBucket}/${cleanTargetKey}`
      );
      return true;
    } catch (err) {
      console.warn(
        `[StorageService] Failed to move S3 object ${sourceBucket}/${cleanSourceKey} to ${targetBucket}/${cleanTargetKey}:`,
        err
      );
      return false;
    }
  }

  /**
   * Delete an existing image object from MinIO S3 bucket given its public URL or key
   */
  static async deleteImageFromUrl(imageUrlOrKey: string | null | undefined): Promise<void> {
    const key = this.extractKey(imageUrlOrKey);
    if (!key) return;

    const storageConfig = SiteConfigService.getStorageConfigSync();

    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: storageConfig.minio_bucket_name,
          Key: key,
        })
      );
      console.log(`[StorageService] Deleted image object from MinIO S3: ${key}`);
    } catch (err) {
      console.warn(`[StorageService] Failed to delete image object ${imageUrlOrKey}:`, err);
    }
  }
}

