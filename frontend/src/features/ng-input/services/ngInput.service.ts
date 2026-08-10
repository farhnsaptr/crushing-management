import { apiClient } from '../../../services/api.client';
import type { CreateNgTransactionPayload, NgTransactionResult, MasterPart } from '../types/ngInput.types';
import type { Factory } from '../../factories/types/factories.types';

export class NgInputService {
  static async getFactories(): Promise<Factory[]> {
    const response = await apiClient.get('/api/factories');
    return response.data.data || [];
  }

  static async getMasterParts(jenis?: string): Promise<MasterPart[]> {
    const params: Record<string, any> = { page: 1, limit: 1000 };
    if (jenis && jenis !== 'all') {
      params.jenis = jenis;
    }
    const response = await apiClient.get('/api/master-parts', { params });
    return response.data.data?.parts || [];
  }

  static async submitNgTransaction(payload: CreateNgTransactionPayload): Promise<NgTransactionResult> {
    const response = await apiClient.post('/api/ng-transactions', payload);
    return response.data.data;
  }
}
