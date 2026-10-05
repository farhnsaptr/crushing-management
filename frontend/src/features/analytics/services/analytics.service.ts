import { apiClient } from '../../../services/api.client';
import { uploadFileInChunks } from '../../../services/chunkedUpload.service';
import type {
  YearlyAnalyticsResponse,
  ProductionAnalyticsItem,
  ProductionAnalyticsBatch,
  RawProductionCsvRow,
} from '../types/analytics.types';

export class AnalyticsService {
  /**
   * Preview and analyze production Excel (.xlsx/.xls) or CSV file.
   * File diunggah per-chunk (< 1MB/request) lalu dirakit backend via `upload_id`.
   */
  static async previewProductionFile(file: File): Promise<any> {
    const uploadRef = await uploadFileInChunks(file);
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/api/analytics/preview',
      uploadRef
    );
    return response.data.data;
  }

  /**
   * Upload and import production report file (per-chunk, dirakit backend via `upload_id`).
   */
  static async uploadProductionFile(file: File, batch_name?: string): Promise<any> {
    const uploadRef = await uploadFileInChunks(file);
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/api/analytics/upload',
      { ...uploadRef, batch_name }
    );
    return response.data.data;
  }

  /**
   * Preview and analyze production CSV report before uploading (JSON payload).
   */
  static async previewProductionReport(
    records: RawProductionCsvRow[]
  ): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/api/analytics/preview',
      { records }
    );
    return response.data.data;
  }

  /**
   * Upload and import production CSV report (JSON payload).
   */
  static async uploadProductionReport(
    filename: string,
    records: RawProductionCsvRow[],
    batch_name?: string
  ): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/api/analytics/upload',
      {
        filename,
        batch_name,
        records,
      }
    );
    return response.data.data;
  }

  /**
   * Fetch 12-month yearly comparison analytics.
   */
  static async getYearlyComparison(
    year?: number,
    factory?: string
  ): Promise<YearlyAnalyticsResponse> {
    const response = await apiClient.get<{ success: boolean; data: YearlyAnalyticsResponse }>(
      '/api/analytics/yearly-comparison',
      { params: { year, factory } }
    );
    return response.data.data;
  }

  /**
   * Fetch paginated detailed production analytics items.
   */
  static async getProductionRecords(params?: {
    page?: number;
    limit?: number;
    year?: number;
    month?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    factory?: string;
  }): Promise<{ records: ProductionAnalyticsItem[]; pagination: any }> {
    const response = await apiClient.get<{
      success: boolean;
      data: ProductionAnalyticsItem[];
      pagination: any;
    }>('/api/analytics/records', { params });

    return {
      records: response.data.data,
      pagination: response.data.pagination,
    };
  }

  /**
   * Fetch Pareto Analysis for Materials (Resin).
   */
  static async getParetoMaterials(
    year?: number,
    factory?: string
  ): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      '/api/analytics/pareto/materials',
      { params: { year, factory } }
    );
    return response.data.data;
  }

  /**
   * Fetch Pareto Analysis for Part NG.
   */
  static async getParetoPartsNg(
    year?: number,
    factory?: string
  ): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      '/api/analytics/pareto/parts-ng',
      { params: { year, factory } }
    );
    return response.data.data;
  }

  /**
   * Rollback the most recently uploaded production batch.
   */
  static async rollbackLatestBatch(): Promise<ProductionAnalyticsBatch> {
    const response = await apiClient.post<{
      success: boolean;
      data: ProductionAnalyticsBatch;
      message: string;
    }>('/api/analytics/rollback');
    return response.data.data;
  }

  /**
   * Fetch batches history.
   */
  static async getBatches(): Promise<ProductionAnalyticsBatch[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: ProductionAnalyticsBatch[];
    }>('/api/analytics/batches');
    return response.data.data;
  }

  /**
   * Delete an uploaded batch.
   */
  static async deleteBatch(batchId: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean; data: any }>(
      `/api/analytics/batches/${batchId}`
    );
    return response.data.success;
  }
}
