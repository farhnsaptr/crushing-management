import { apiClient } from '../../../services/api.client';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data.data;
  }

  static async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  }
}
