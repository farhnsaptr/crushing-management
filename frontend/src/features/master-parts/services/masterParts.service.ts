import { apiClient } from '../../../services/api.client';
import { uploadFileInChunks } from '../../../services/chunkedUpload.service';
import type {
  MasterPart,
  CreateMasterPartPayload,
  ImportPreviewResult,
  ParsedPartRow,
} from '../types/masterParts.types';

export class MasterPartsService {
  static async getParts(
    page: number = 1,
    limit: number = 100,
    search: string = '',
    jenis: string = '',
    sortBy: string = '',
    sortOrder: string = 'asc',
    factoryId?: string
  ): Promise<{
    parts: MasterPart[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get('/api/master-parts', {
      params: { page, limit, search, jenis, sortBy, sortOrder, factory_id: factoryId },
    });
    return response.data.data || { parts: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  }

  // Alias for compatibility
  static listParts = MasterPartsService.getParts;

  static async getJenisList(): Promise<string[]> {
    const response = await apiClient.get('/api/master-parts/jenis-list');
    return response.data.data || [];
  }

  static async getAllModels(): Promise<Array<{ id: string; model_code: string; description?: string }>> {
    const response = await apiClient.get('/api/master-parts/all-models');
    return response.data.data || [];
  }

  static async createPart(payload: CreateMasterPartPayload): Promise<MasterPart> {
    const response = await apiClient.post('/api/master-parts', payload);
    return response.data.data;
  }

  static async updatePart(id: string, payload: Partial<CreateMasterPartPayload>): Promise<MasterPart> {
    const response = await apiClient.put(`/api/master-parts/${id}`, payload);
    return response.data.data;
  }

  static async deletePart(id: string): Promise<void> {
    await apiClient.delete(`/api/master-parts/${id}`);
  }

  static async previewImportFile(file: File): Promise<ImportPreviewResult> {
    const uploadRef = await uploadFileInChunks(file);
    const response = await apiClient.post('/api/master-parts/preview-import', uploadRef);

    return response.data.data;
  }

  static async commitImport(rows: ParsedPartRow[]): Promise<{ insertedCount: number }> {
    const response = await apiClient.post('/api/master-parts/commit-import', { rows });
    return response.data.data;
  }

  static async downloadTemplate(): Promise<void> {
    const response = await apiClient.get('/api/master-parts/template', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Master_Parts.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  static async exportExcel(): Promise<void> {
    const response = await apiClient.get('/api/master-parts/export', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Export_Master_Parts.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  static async deleteAllParts(): Promise<void> {
    await apiClient.delete('/api/master-parts/all');
  }

  static async uploadPartImage(partId: string, imageBlobOrFile: Blob | File): Promise<MasterPart> {
    const uploadRef = await uploadFileInChunks(
      new File([imageBlobOrFile], 'part_image.jpg', { type: imageBlobOrFile.type })
    );
    const response = await apiClient.post(`/api/master-parts/${partId}/upload-image`, uploadRef);

    return response.data.data;
  }

  static async deletePartImage(partId: string): Promise<MasterPart> {
    const response = await apiClient.delete(`/api/master-parts/${partId}/image`);
    return response.data.data;
  }
}
