import { apiClient } from '../../../services/api.client';
import type {
  ParsedCsvRow,
  RunnerMaterialPreviewResponse,
  RunnerMaterialSavePayload,
  RunnerMaterialRecord,
  UpdateRunnerMaterialPayload,
  RunnerMaterialAnalyticsSummaryResponse,
  RunnerMaterialAnalyticsDetailResponse,
} from '../types/runnerMaterial.types';

export class RunnerMaterialService {
  /**
   * Sends client-parsed CSV rows to backend for matching & per-material calculation.
   */
  static async previewImport(records: ParsedCsvRow[]): Promise<RunnerMaterialPreviewResponse> {
    const response = await apiClient.post<{ success: boolean; data: RunnerMaterialPreviewResponse }>(
      '/api/runner-material/preview',
      { records }
    );
    return response.data.data;
  }

  /**
   * Saves confirmed per-material runner records.
   */
  static async saveRecords(payload: RunnerMaterialSavePayload): Promise<{
    batchRef: string;
    savedCount: number;
    transactionDate: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      data: { batchRef: string; savedCount: number; transactionDate: string };
    }>('/api/runner-material/save', payload);
    return response.data.data;
  }

  /**
   * Fetches paginated history of recorded runner materials.
   */
  static async listRecords(page: number = 1, limit: number = 20): Promise<{
    records: RunnerMaterialRecord[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        records: RunnerMaterialRecord[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      };
    }>('/api/runner-material', {
      params: { page, limit },
    });
    return response.data.data;
  }

  /**
   * Updates an individual runner material transaction record by ID.
   */
  static async updateRecord(id: string, payload: UpdateRunnerMaterialPayload): Promise<any> {
    const response = await apiClient.put(`/api/runner-material/${id}`, payload);
    return response.data.data;
  }

  /**
   * Deletes an individual runner material transaction record by ID.
   */
  static async deleteRecord(id: string): Promise<any> {
    const response = await apiClient.delete(`/api/runner-material/${id}`);
    return response.data.data;
  }

  /**
   * Deletes ALL runner material transaction records (Super-Admin only).
   */
  static async deleteAllRecords(): Promise<any> {
    const response = await apiClient.delete('/api/runner-material/all');
    return response.data.data;
  }

  /**
   * Gets sorted summary list of runner materials for analytics view.
   */
  static async getAnalyticsSummary(year: number, month?: number): Promise<RunnerMaterialAnalyticsSummaryResponse> {
    const response = await apiClient.get<{ success: boolean; data: RunnerMaterialAnalyticsSummaryResponse }>(
      '/api/runner-material/analytics/summary',
      { params: { year, month } }
    );
    return response.data.data;
  }

  /**
   * Gets monthly trend chart & transaction history for a specific material.
   */
  static async getAnalyticsDetail(materialName: string, year: number): Promise<RunnerMaterialAnalyticsDetailResponse> {
    const response = await apiClient.get<{ success: boolean; data: RunnerMaterialAnalyticsDetailResponse }>(
      '/api/runner-material/analytics/detail',
      { params: { material_name: materialName, year } }
    );
    return response.data.data;
  }
}


