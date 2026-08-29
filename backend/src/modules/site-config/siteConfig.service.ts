import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import { env } from '../../config/env.config';

export interface SiteConfigItem {
  key: string;
  value: string;
}

export interface StorageSiteConfig {
  minio_base_url: string;
  minio_bucket_name: string;
  minio_folder_master_parts: string;
}

export class SiteConfigService {
  private static cachedConfig: Record<string, string> | null = null;
  private static cacheExpiresAt: number = 0;
  private static readonly CACHE_TTL_MS = 60 * 1000; // Cache 1 menit untuk performa

  static async getConfig(forceRefresh: boolean = false): Promise<Record<string, string>> {
    const now = Date.now();
    if (!forceRefresh && this.cachedConfig && now < this.cacheExpiresAt) {
      return this.cachedConfig;
    }

    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT `key`, value, updated_at FROM site_config'
      );
      const configMap: Record<string, string> = {};
      for (const row of rows) {
        configMap[row.key] = row.value;
      }
      this.cachedConfig = configMap;
      this.cacheExpiresAt = now + this.CACHE_TTL_MS;
      return configMap;
    } catch (err) {
      // Jika tabel belum di-migrate atau koneksi gagal, gunakan cache terakhir atau object kosong
      return this.cachedConfig || {};
    }
  }

  /**
   * Helper sinkron untuk StorageService agar performa query/format URL tetap instan (O(1))
   */
  static getStorageConfigSync(): StorageSiteConfig {
    const cfg = this.cachedConfig || {};
    return {
      minio_base_url: cfg['minio_base_url'] || env.MINIO_BASE_URL,
      minio_bucket_name: cfg['minio_bucket_name'] || env.MINIO_BUCKET_NAME,
      minio_folder_master_parts: cfg['minio_folder_master_parts'] || 'master-parts',
    };
  }

  /**
   * Helper async untuk memastikan nilai terbaru dari database
   */
  static async getStorageConfig(): Promise<StorageSiteConfig> {
    const cfg = await this.getConfig();
    return {
      minio_base_url: cfg['minio_base_url'] || env.MINIO_BASE_URL,
      minio_bucket_name: cfg['minio_bucket_name'] || env.MINIO_BUCKET_NAME,
      minio_folder_master_parts: cfg['minio_folder_master_parts'] || 'master-parts',
    };
  }

  /**
   * Cek dampak perubahan bucket/folder terhadap data master parts yang sudah tersimpan
   */
  static async checkStorageImpact(newBucket?: string, newFolder?: string) {
    const currentConfig = await this.getStorageConfig();
    const currentBucket = currentConfig.minio_bucket_name;
    const currentFolder = currentConfig.minio_folder_master_parts;

    const targetBucket = (newBucket || currentBucket).trim();
    const targetFolder = (newFolder || currentFolder).trim();

    const isBucketChanged = targetBucket !== currentBucket;
    const isFolderChanged = targetFolder !== currentFolder;
    const isChanged = isBucketChanged || isFolderChanged;

    if (!isChanged) {
      return {
        isChanged: false,
        oldBucket: currentBucket,
        newBucket: targetBucket,
        oldFolder: currentFolder,
        newFolder: targetFolder,
        affectedCount: 0,
        affectedParts: [],
      };
    }

    // Query master parts yang memiliki gambar
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT mp.id, mp.part_number, mp.part_name, mp.image_url,
              m.model_code, mc.name AS machine_name
       FROM master_parts mp
       JOIN master_models m ON mp.model_id = m.id
       JOIN machines mc ON mp.machine_id = mc.id
       WHERE mp.image_url IS NOT NULL AND mp.image_url != ''
       ORDER BY mp.part_number ASC`
    );

    const affectedParts = rows.map((r) => {
      const currentKey = r.image_url.replace(/^\/+/, '');
      // Ekstrak nama file dari key (misal: 'master-parts/abc.jpg' -> 'abc.jpg')
      const keyParts = currentKey.split('/');
      const filename = keyParts[keyParts.length - 1];
      const newKey = `${targetFolder}/${filename}`;

      return {
        id: r.id,
        part_number: r.part_number,
        part_name: r.part_name,
        model_code: r.model_code,
        machine_name: r.machine_name,
        current_image_key: currentKey,
        new_image_key: newKey,
      };
    });

    return {
      isChanged: true,
      oldBucket: currentBucket,
      newBucket: targetBucket,
      oldFolder: currentFolder,
      newFolder: targetFolder,
      affectedCount: affectedParts.length,
      affectedParts,
    };
  }

  static async updateConfig(
    items: { key: string; value: string }[],
    updatedByUserId: string,
    migrationAction?: 'migrate_all' | 'config_only'
  ) {
    const colorKeys = new Set([
      'theme_light_primary',
      'theme_light_secondary',
      'theme_light_accent',
      'theme_dark_primary',
      'theme_dark_secondary',
      'theme_dark_accent',
    ]);

    const stringKeys = new Set([
      'site_title',
      'site_logo',
      'site_background',
      // MinIO Storage Dynamic Settings:
      'minio_base_url',
      'minio_bucket_name',
      'minio_folder_master_parts',
    ]);

    const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

    // Cari nilai bucket & folder baru dari payload jika ada
    const currentConfig = await this.getStorageConfig();
    const oldBucket = currentConfig.minio_bucket_name;
    const oldFolder = currentConfig.minio_folder_master_parts;

    let newBucket = oldBucket;
    let newFolder = oldFolder;

    for (const item of items) {
      if (item.key === 'minio_bucket_name') newBucket = item.value.trim();
      if (item.key === 'minio_folder_master_parts') newFolder = item.value.trim();
    }

    // Jika user memilih migrasi seluruh master parts (migrate_all)
    if (migrationAction === 'migrate_all' && (oldBucket !== newBucket || oldFolder !== newFolder)) {
      const { StorageService } = await import('../../services/storage.service');

      const [parts] = await pool.query<RowDataPacket[]>(
        `SELECT id, image_url FROM master_parts WHERE image_url IS NOT NULL AND image_url != ''`
      );

      for (const part of parts) {
        const oldKey = StorageService.extractKey(part.image_url);
        if (!oldKey) continue;

        const keyParts = oldKey.split('/');
        const filename = keyParts[keyParts.length - 1];
        const newKey = `${newFolder}/${filename}`;

        // 1. Pindahkan / Copy object fisik di MinIO S3
        await StorageService.moveObject(oldBucket, oldKey, newBucket, newKey);

        // 2. Update record master_parts di database MySQL
        await pool.query('UPDATE master_parts SET image_url = ? WHERE id = ?', [newKey, part.id]);
      }
    }

    for (const item of items) {
      const isColor = colorKeys.has(item.key);
      const isString = stringKeys.has(item.key);

      if (!isColor && !isString) {
        throw new Error(`Invalid config key: ${item.key}`);
      }

      if (isColor && !hexColorRegex.test(item.value)) {
        throw new Error(`Invalid hex color value for key '${item.key}': ${item.value}`);
      }

      await pool.query(
        `INSERT INTO site_config (\`key\`, value, updated_by)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE value = VALUES(value), updated_by = VALUES(updated_by)`,
        [item.key, item.value, updatedByUserId]
      );
    }

    // Invalidate cache setelah update
    return await this.getConfig(true);
  }
}

