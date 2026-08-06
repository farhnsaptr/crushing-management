import { apiClient } from '../../../services/api.client';
import type { Machine, CreateMachinePayload, UpdateMachinePayload } from '../types/machines.types';

export class MachinesService {
  static async getMachines(): Promise<Machine[]> {
    const response = await apiClient.get('/api/machines');
    return response.data.data;
  }

  static async getMachinesByFactory(factoryId: string): Promise<Machine[]> {
    const response = await apiClient.get(`/api/machines/by-factory/${factoryId}`);
    return response.data.data;
  }

  static async getMachineById(id: string): Promise<Machine> {
    const response = await apiClient.get(`/api/machines/${id}`);
    return response.data.data;
  }

  static async createMachine(payload: CreateMachinePayload): Promise<Machine> {
    const response = await apiClient.post('/api/machines', payload);
    return response.data.data;
  }

  static async updateMachine(id: string, payload: UpdateMachinePayload): Promise<Machine> {
    const response = await apiClient.put(`/api/machines/${id}`, payload);
    return response.data.data;
  }

  static async deleteMachine(id: string): Promise<void> {
    await apiClient.delete(`/api/machines/${id}`);
  }

  static async deleteAllMachines(): Promise<void> {
    await apiClient.delete('/api/machines/all');
  }
}
