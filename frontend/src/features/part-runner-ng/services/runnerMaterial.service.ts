import { apiClient } from '../../../services/api.client';
import type {
  ParsedCsvRow,
  RunnerMaterialPreviewResponse,
  RunnerMaterialSavePayload,
  RunnerMaterialRecord,
  UpdateRunnerMaterialPayload,
  RunnerMaterialAnalyticsSummaryResponse,
  RunnerMaterialAnalyticsDetailResponse,
  RunnerBatchItem,
} from '../types/runnerMaterial.types';

export class RunnerMaterialService {
  /**
   * Sends uploaded Excel (.xlsx/.xls) or CSV file to backend for parsing & calculation.
   */
  static async previewImportFile(file: File, selectedDate?: string): Promise<RunnerMaterialPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ success: boolean; data: RunnerMaterialPreviewResponse }>(
      '/api/runner-material/preview',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: selectedDate ? { selected_date: selectedDate } : undefined,
      }
    );
    return response.data.data;
  }

  /**
   * Backwards compatibility: sends parsed rows to backend for matching & calculation.
   */
  static async previewImport(records: ParsedCsvRow[], selectedDate?: string): Promise<RunnerMaterialPreviewResponse> {
    const response = await apiClient.post<{ success: boolean; data: RunnerMaterialPreviewResponse }>(
      '/api/runner-material/preview',
      { records },
      {
        params: selectedDate ? { selected_date: selectedDate } : undefined,
      }
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
   * Retrieves unique runner material import batches with summary metadata.
   */
  static async listBatches(): Promise<RunnerBatchItem[]> {
    const response = await apiClient.get<{ success: boolean; data: RunnerBatchItem[] }>(
      '/api/runner-material/batches'
    );
    return response.data.data;
  }

  /**
   * Rollback / delete all runner material transaction records for a specific batch.
   */
  static async rollbackBatch(batchRef: string): Promise<{ batchRef: string; deletedCount: number }> {
    const response = await apiClient.delete<{ success: boolean; data: { batchRef: string; deletedCount: number } }>(
      `/api/runner-material/batch/${encodeURIComponent(batchRef)}`
    );
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
   * Gets daily trend chart (with Shift Pagi & Shift Malam) & transaction history for a specific material.
   */
  static async getAnalyticsDetail(materialName: string, year: number, month?: number): Promise<RunnerMaterialAnalyticsDetailResponse> {
    const response = await apiClient.get<{ success: boolean; data: RunnerMaterialAnalyticsDetailResponse }>(
      '/api/runner-material/analytics/detail',
      { params: { material_name: materialName, year, month } }
    );
    return response.data.data;
  }
}


