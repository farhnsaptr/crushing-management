import { apiClient } from '../../../services/api.client';
import type {
  VerificationDetailResponse,
  SaveVerificationPayload,
  VerificationDashboardStatusResponse,
} from '../types/verification.types';

export class VerificationService {
  /**
   * Fetches input verification details & combined reuse materials for date & shift.
   */
  static async getVerificationDetails(
    date: string,
    shift: 'Pagi' | 'Malam'
  ): Promise<VerificationDetailResponse> {
    const response = await apiClient.get<{ success: boolean; data: VerificationDetailResponse }>(
      '/api/verifications/details',
      { params: { date, shift } }
    );
    return response.data.data;
  }

  /**
   * Saves or updates input verification (Header + Box Count Items).
   */
  static async saveVerification(payload: SaveVerificationPayload): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/api/verifications/save',
      payload
    );
    return response.data.data;
  }

  /**
   * Gets verification reminder status for Dashboard indicator.
   */
  static async getDashboardStatus(
    date?: string,
    shift?: string
  ): Promise<VerificationDashboardStatusResponse> {
    const response = await apiClient.get<{ success: boolean; data: VerificationDashboardStatusResponse }>(
      '/api/verifications/status',
      { params: { date, shift } }
    );
    return response.data.data;
  }
}
