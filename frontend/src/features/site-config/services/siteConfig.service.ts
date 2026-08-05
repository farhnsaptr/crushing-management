import { apiClient } from '../../../services/api.client';
import type { UpdateSiteConfigPayload } from '../types/siteConfig.types';

export class SiteConfigService {
  static async getConfig(): Promise<Record<string, string>> {
    const response = await apiClient.get('/api/site-config');
    return response.data.data;
  }

  static async updateConfig(payload: UpdateSiteConfigPayload): Promise<Record<string, string>> {
    const response = await apiClient.put('/api/site-config', payload);
    return response.data.data;
  }
}
