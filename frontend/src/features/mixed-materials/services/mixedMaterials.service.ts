import { apiClient } from '../../../services/api.client';
import type {
  MixedMaterial,
  MixedMaterialPayload,
  MixedMaterialMembersResponse,
} from '../types/mixedMaterials.types';

export class MixedMaterialsService {
  static async list(search: string = ''): Promise<MixedMaterial[]> {
    const response = await apiClient.get('/api/mixed-materials', { params: { search } });
    return response.data.data || [];
  }

  static async getMembers(id: string): Promise<MixedMaterialMembersResponse> {
    const response = await apiClient.get(`/api/mixed-materials/${id}/members`);
    return response.data.data;
  }

  static async create(payload: MixedMaterialPayload): Promise<MixedMaterial> {
    const response = await apiClient.post('/api/mixed-materials', payload);
    return response.data.data;
  }

  static async update(id: string, payload: Partial<MixedMaterialPayload>): Promise<MixedMaterial> {
    const response = await apiClient.put(`/api/mixed-materials/${id}`, payload);
    return response.data.data;
  }

  static async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/mixed-materials/${id}`);
  }
}
