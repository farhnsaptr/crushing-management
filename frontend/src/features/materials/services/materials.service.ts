import { apiClient } from '../../../services/api.client';
import type { Material, CreateMaterialPayload, MaterialPartsResponse } from '../types/materials.types';

export class MaterialsService {
  static async getMaterials(page: number = 1, limit: number = 20, search: string = ''): Promise<{
    materials: Material[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const response = await apiClient.get('/api/materials', {
      params: { page, limit, search },
    });
    return response.data.data;
  }

  static async getMaterialById(id: string): Promise<Material> {
    const response = await apiClient.get(`/api/materials/${id}`);
    return response.data.data;
  }

  static async getMaterialParts(id: string): Promise<MaterialPartsResponse> {
    const response = await apiClient.get(`/api/materials/${id}/parts`);
    return response.data.data;
  }

  static async createMaterial(payload: CreateMaterialPayload): Promise<Material> {
    const response = await apiClient.post('/api/materials', payload);
    return response.data.data;
  }

  static async updateMaterial(id: string, payload: Partial<CreateMaterialPayload>): Promise<Material> {
    const response = await apiClient.put(`/api/materials/${id}`, payload);
    return response.data.data;
  }

  static async deleteMaterial(id: string): Promise<void> {
    await apiClient.delete(`/api/materials/${id}`);
  }

  static async deleteAllMaterials(): Promise<void> {
    await apiClient.delete('/api/materials/all');
  }
}
