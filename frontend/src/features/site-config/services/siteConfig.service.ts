import { apiClient } from '../../../services/api.client';

export class SiteConfigService {
  static async getConfig(): Promise<Record<string, string>> {
    const response = await apiClient.get('/api/site-config');
    return response.data.data;
  }

  static async updateConfig(
    items: { key: string; value: string }[]
  ): Promise<Record<string, string>> {
    const response = await apiClient.put('/api/site-config', { items });
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
