import { apiClient } from '../../../services/api.client';
import type { AuditLogsResponse } from '../types/globalLogs.types';

export class GlobalLogsService {
  static async getLogs(count: number = 50): Promise<AuditLogsResponse> {
    const response = await apiClient.get('/api/admin/logs', {
      params: { count },
    });
    return response.data.data;
  }

  static async clearAllLogs(): Promise<void> {
    await apiClient.delete('/api/admin/logs');
  }
}
