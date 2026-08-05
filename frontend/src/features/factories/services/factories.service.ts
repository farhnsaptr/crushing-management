import { apiClient } from '../../../services/api.client';
import type { Factory, CreateFactoryPayload, UpdateFactoryPayload } from '../types/factories.types';

export class FactoriesService {
  static async getFactories(): Promise<Factory[]> {
    const response = await apiClient.get('/api/factories');
    return response.data.data;
  }

  static async getFactoryById(id: string): Promise<Factory> {
    const response = await apiClient.get(`/api/factories/${id}`);
    return response.data.data;
  }

  static async createFactory(payload: CreateFactoryPayload): Promise<Factory> {
    const response = await apiClient.post('/api/factories', payload);
    return response.data.data;
  }

  static async updateFactory(id: string, payload: UpdateFactoryPayload): Promise<Factory> {
    const response = await apiClient.put(`/api/factories/${id}`, payload);
    return response.data.data;
  }

  static async deleteFactory(id: string): Promise<void> {
    await apiClient.delete(`/api/factories/${id}`);
  }
}
