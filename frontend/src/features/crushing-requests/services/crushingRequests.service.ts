import { apiClient } from '../../../services/api.client';
import type {
  CrushingRequest,
  CreateCrushingRequestPayload,
  ApproveCrushingRequestPayload,
  CrushingRequestListResponse,
  CreateRequestItemPayload,
  SenderEvaluationResponse,
  SenderEvaluationFilters,
  SenderActivityHeatmapResponse,
} from '../types/crushingRequests.types';

export interface RequestDraftData {
  shift: 'Pagi' | 'Malam';
  requestDate: string;
  notes: string;
  items: CreateRequestItemPayload[];
  savedAt?: string;
}

export class CrushingRequestsService {
  static async createRequest(payload: CreateCrushingRequestPayload): Promise<CrushingRequest> {
    const response = await apiClient.post<{ success: boolean; data: CrushingRequest }>(
      '/api/crushing-requests',
      payload
    );
    return response.data.data;
  }

  static async listRequests(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    department_id?: string;
    factory_id?: string;
    sender_id?: string;
    shift?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<CrushingRequestListResponse> {
    const response = await apiClient.get<{ success: boolean; data: CrushingRequestListResponse }>(
      '/api/crushing-requests',
      { params }
    );
    return response.data.data;
  }

  static async getEvaluation(params?: SenderEvaluationFilters): Promise<SenderEvaluationResponse> {
    const response = await apiClient.get<{ success: boolean; data: SenderEvaluationResponse }>(
      '/api/crushing-requests/evaluation',
      { params }
    );
    return response.data.data;
  }

  static async getSenderActivityHeatmap(senderId: string, months: number = 6): Promise<SenderActivityHeatmapResponse> {
    const response = await apiClient.get<{ success: boolean; data: SenderActivityHeatmapResponse }>(
      `/api/crushing-requests/senders/${senderId}/activity-heatmap`,
      { params: { months } }
    );
    return response.data.data;
  }

  static async getRequestById(id: string): Promise<CrushingRequest> {
    const response = await apiClient.get<{ success: boolean; data: CrushingRequest }>(
      `/api/crushing-requests/${id}`
    );
    return response.data.data;
  }

  static async approveRequest(id: string, payload?: ApproveCrushingRequestPayload): Promise<CrushingRequest> {
    const response = await apiClient.patch<{ success: boolean; data: CrushingRequest }>(
      `/api/crushing-requests/${id}/approve`,
      payload
    );
    return response.data.data;
  }

  static async cancelRequest(id: string): Promise<{ id: string; request_number: string; cancelled: boolean }> {
    const response = await apiClient.delete<{ success: boolean; data: { id: string; request_number: string; cancelled: boolean } }>(
      `/api/crushing-requests/${id}`
    );
    return response.data.data;
  }

  // Database (MySQL) Cross-Device Draft APIs
  static async getDraft(): Promise<RequestDraftData | null> {
    const response = await apiClient.get<{ success: boolean; data: RequestDraftData | null }>(
      '/api/crushing-requests/draft'
    );
    return response.data.data;
  }

  static async saveDraft(draft: RequestDraftData): Promise<RequestDraftData | null> {
    const response = await apiClient.put<{ success: boolean; data: RequestDraftData | null }>(
      '/api/crushing-requests/draft',
      draft
    );
    return response.data.data;
  }

  static async deleteDraft(): Promise<void> {
    await apiClient.delete('/api/crushing-requests/draft');
  }
}
