import { apiClient } from '../../../services/api.client';
import type {
  MasterPart,
  CreateMasterPartPayload,
  ImportPreviewResult,
  ParsedPartRow,
} from '../types/masterParts.types';

export class MasterPartsService {
  static async getParts(
    page: number = 1,
    limit: number = 20,
    search: string = '',
    jenis: string = '',
    sortBy: string = '',
    sortOrder: string = 'asc'
  ) {
    const response = await apiClient.get('/api/master-parts', {
      params: { page, limit, search, jenis, sortBy, sortOrder },
    });
    return response.data.data;
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
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/master-parts/preview-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

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
    const formData = new FormData();
    formData.append('image', imageBlobOrFile, 'part_image.jpg');

    const response = await apiClient.post(`/api/master-parts/${partId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }
}
