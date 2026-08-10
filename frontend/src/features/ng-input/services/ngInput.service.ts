import { apiClient } from '../../../services/api.client';
import type {
  CreateNgTransactionPayload,
  NgTransactionResult,
  MasterPart,
  MaterialSummaryResponse,
  PartMonthlyDetailResponse,
  PlantLocation,
} from '../types/ngInput.types';
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

  static async getMaterialSummary(year: number, month: number, location: PlantLocation = 'Cibitung'): Promise<MaterialSummaryResponse> {
    const response = await apiClient.get('/api/ng-transactions/summary-by-material', {
      params: { year, month, location },
    });
    return response.data.data;
  }

  static async getPartMonthlyDetail(
    partId: string,
    year: number,
    month: number,
    location: PlantLocation = 'Cibitung'
  ): Promise<PartMonthlyDetailResponse> {
    const response = await apiClient.get(`/api/ng-transactions/part-detail/${partId}`, {
      params: { year, month, location },
    });
    return response.data.data;
  }
}
