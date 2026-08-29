import { apiClient } from '../../../services/api.client';
import type { StorageImpactResult } from '../types/siteConfig.types';

export class SiteConfigService {
  static async getConfig(): Promise<Record<string, string>> {
    const response = await apiClient.get('/api/site-config');
    return response.data.data;
  }

  static async checkStorageImpact(newBucket?: string, newFolder?: string): Promise<StorageImpactResult> {
    const response = await apiClient.post('/api/site-config/check-storage-impact', {
      new_bucket_name: newBucket,
      new_folder_master_parts: newFolder,
    });
    return response.data.data;
  }

  static async updateConfig(
    items: { key: string; value: string }[],
    migrationAction?: 'migrate_all' | 'config_only'
  ): Promise<Record<string, string>> {
    const response = await apiClient.put('/api/site-config', { items, migrationAction });
    return response.data.data;
  }

  static async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/site-config/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }
}
