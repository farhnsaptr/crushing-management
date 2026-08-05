import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';

export interface SiteConfigItem {
  key: string;
  value: string;
}

export class SiteConfigService {
  static async getConfig() {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT `key`, value, updated_at FROM site_config'
    );
    const configMap: Record<string, string> = {};
    for (const row of rows) {
      configMap[row.key] = row.value;
    }
    return configMap;
  }

  static async updateConfig(items: { key: string; value: string }[], updatedByUserId: string) {
    const allowedKeys = new Set([
      'theme_light_primary',
      'theme_light_secondary',
      'theme_light_accent',
      'theme_dark_primary',
      'theme_dark_secondary',
      'theme_dark_accent',
    ]);

    const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

    for (const item of items) {
      if (!allowedKeys.has(item.key)) {
        throw new Error(`Invalid config key: ${item.key}`);
      }
      if (!hexColorRegex.test(item.value)) {
        throw new Error(`Invalid hex color value for key '${item.key}': ${item.value}`);
      }

      await pool.query(
        `INSERT INTO site_config (\`key\`, value, updated_by)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE value = VALUES(value), updated_by = VALUES(updated_by)`,
        [item.key, item.value, updatedByUserId]
      );
    }

    return await this.getConfig();
  }
}
