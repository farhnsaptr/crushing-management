import { apiClient } from '../../../services/api.client';
import type { Department, CreateDepartmentPayload, UpdateDepartmentPayload } from '../types/departments.types';

export class DepartmentsService {
  static async listDepartments(): Promise<Department[]> {
    const response = await apiClient.get<{ success: boolean; data: Department[] }>('/api/departments');
    return response.data.data;
  }

  static async getDepartmentById(id: string): Promise<Department> {
    const response = await apiClient.get<{ success: boolean; data: Department }>(`/api/departments/${id}`);
    return response.data.data;
  }

  static async createDepartment(payload: CreateDepartmentPayload): Promise<Department> {
    const response = await apiClient.post<{ success: boolean; data: Department }>('/api/departments', payload);
    return response.data.data;
  }

  static async updateDepartment(id: string, payload: UpdateDepartmentPayload): Promise<Department> {
    const response = await apiClient.put<{ success: boolean; data: Department }>(`/api/departments/${id}`, payload);
    return response.data.data;
  }

  static async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete(`/api/departments/${id}`);
  }
}
