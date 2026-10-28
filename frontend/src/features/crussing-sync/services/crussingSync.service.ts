import { apiClient } from '../../../services/api.client';
import type { CrussingSyncResult, CrussingSyncStatus, UnmatchedSebangosResponse } from '../types/crussingSync.types';

export class CrussingSyncService {
 static async getStatus(params: {
 location: string;
 year: number;
 month?: number;
 }): Promise<CrussingSyncStatus> {
 const response = await apiClient.get<{ success: boolean; data: CrussingSyncStatus }>(
 '/api/crussing-sync/status',
 { params }
 );
 return response.data.data;
 }

 static async getUnmatchedSebangos(params: {
 location: string;
 year: number;
 month?: number;
 }): Promise<UnmatchedSebangosResponse> {
 const response = await apiClient.get<{ success: boolean; data: UnmatchedSebangosResponse }>(
 '/api/crussing-sync/unmatched-sebangos',
 { params }
 );
 return response.data.data;
 }

 static async sync(payload: {
 location: string;
 year: number;
 month?: number;
 }): Promise<CrussingSyncResult> {
 const response = await apiClient.post<{ success: boolean; data: CrussingSyncResult }>(
 '/api/crussing-sync/sync',
 payload
 );
 return response.data.data;
 }
}
