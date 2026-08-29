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
      minio_base_url: cfg['minio_base_url'] || env.MINIO_BASE_URL || 'http://127.0.0.1:9000',
      minio_bucket_name: cfg['minio_bucket_name'] || env.MINIO_BUCKET_NAME || 'crushing-management-parts',
      minio_folder_master_parts: cfg['minio_folder_master_parts'] || 'master-parts',
    };
  }

  /**
   * Helper async untuk memastikan nilai terbaru dari database
   */
  static async getStorageConfig(): Promise<StorageSiteConfig> {
    const cfg = await this.getConfig();
    return {
      minio_base_url: cfg['minio_base_url'] || env.MINIO_BASE_URL || 'http://127.0.0.1:9000',
      minio_bucket_name: cfg['minio_bucket_name'] || env.MINIO_BUCKET_NAME || 'crushing-management-parts',
      minio_folder_master_parts: cfg['minio_folder_master_parts'] || 'master-parts',
    };
  }

  static async updateConfig(items: { key: string; value: string }[], updatedByUserId: string) {
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

