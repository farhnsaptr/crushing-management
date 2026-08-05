import { apiClient } from '../../../services/api.client';
import type { User, CreateUserPayload, UpdateUserPayload } from '../types/users.types';

export class UsersService {
  static async getUsers(): Promise<User[]> {
    const response = await apiClient.get('/api/users');
    return response.data.data;
  }

  static async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await apiClient.post('/api/users', payload);
    return response.data.data;
  }

  static async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    const response = await apiClient.put(`/api/users/${id}`, payload);
    return response.data.data;
  }

  static async toggleUserStatus(id: string, is_active: boolean): Promise<User> {
    const response = await apiClient.put(`/api/users/${id}/status`, { is_active });
    return response.data.data;
  }

  static async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/api/users/${id}`);
  }
}
