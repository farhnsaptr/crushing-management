import { apiClient } from '../../../services/api.client';
import type {
  DatabaseRequestHeader,
  DatabaseRequestDetailResponse,
  ListRequestsFilter,
  DatabasePagination,
  DirectNgTransactionItem,
  DirectRunnerTransactionItem,
} from '../types/databaseManagement.types';

export class DatabaseManagementService {
  /**
   * List crushing requests
   */
  static async getRequests(filter: ListRequestsFilter): Promise<{
    requests: DatabaseRequestHeader[];
    pagination: DatabasePagination;
  }> {
    const response = await apiClient.get('/api/admin/database/requests', {
      params: {
        page: filter.page,
        limit: filter.limit,
        search: filter.search,
        status: filter.status,
        start_date: filter.startDate,
        end_date: filter.endDate,
        shift: filter.shift,
        department_id: filter.departmentId,
        factory_id: filter.factoryId,
      },
    });

    return {
      requests: response.data.data || [],
      pagination: response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  }

  /**
   * Get single crushing request detail
   */
  static async getRequestDetail(requestId: string): Promise<DatabaseRequestDetailResponse> {
    const response = await apiClient.get(`/api/admin/database/requests/${requestId}`);
    return response.data.data;
  }

  /**
   * Unapprove request (Batalkan status approved & hapus transaksi terkait)
   */
  static async unapproveRequest(requestId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/api/admin/database/requests/${requestId}/unapprove`, { reason });
    return response.data;
  }

  /**
   * Delete request permanently
   */
  static async deleteRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/admin/database/requests/${requestId}`);
    return response.data;
  }

  /**
   * Update request header
   */
  static async updateRequestHeader(
    requestId: string,
    payload: {
      request_date?: string;
      shift?: 'Pagi' | 'Malam';
      department_id?: string;
      factory_id?: string | null;
      notes?: string | null;
    }
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put(`/api/admin/database/requests/${requestId}`, payload);
    return response.data;
  }

  /**
   * Add new item/part to request
   */
  static async addItemToRequest(
    requestId: string,
    payload: {
      item_type: 'part_ng' | 'runner_ng';
      master_part_id?: string;
      material_id?: string;
      quantity_pcs?: number;
      weight_kg?: number;
      notes?: string;
    }
  ): Promise<{ success: boolean; message: string; item_id: string }> {
    const response = await apiClient.post(`/api/admin/database/requests/${requestId}/items`, payload);
    return response.data;
  }

  /**
   * Add multiple parts (batch items) to request at once
   */
  static async addItemsBatchToRequest(
    requestId: string,
    items: Array<{
      item_type: 'part_ng' | 'runner_ng';
      master_part_id?: string;
      material_id?: string;
      quantity_pcs?: number;
      weight_kg?: number;
      notes?: string;
    }>
  ): Promise<{ success: boolean; message: string; count: number }> {
    const response = await apiClient.post(`/api/admin/database/requests/${requestId}/items/batch`, { items });
    return response.data;
  }

  /**
   * Update specific item in request
   */
  static async updateRequestItem(
    requestId: string,
    itemId: string,
    payload: {
      quantity_pcs?: number;
      weight_kg?: number;
      verified_quantity_pcs?: number;
      verified_weight_kg?: number;
      adjustment_notes?: string | null;
      waste_quantity_pcs?: number;
      notes?: string | null;
    }
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put(`/api/admin/database/requests/${requestId}/items/${itemId}`, payload);
    return response.data;
  }

  /**
   * Delete specific item from request
   */
  static async deleteRequestItem(
    requestId: string,
    itemId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/admin/database/requests/${requestId}/items/${itemId}`);
    return response.data;
  }

  // ==========================
  // Direct Transactions CRUD
  // ==========================

  static async getNgTransactions(filter: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    shift?: string;
    departmentId?: string;
  }): Promise<{
    transactions: DirectNgTransactionItem[];
    pagination: DatabasePagination;
  }> {
    const response = await apiClient.get('/api/admin/database/transactions/ng', {
      params: {
        page: filter.page,
        limit: filter.limit,
        search: filter.search,
        start_date: filter.startDate,
        end_date: filter.endDate,
        shift: filter.shift,
        department_id: filter.departmentId,
      },
    });

    return {
      transactions: response.data.data || [],
      pagination: response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  }

  static async updateNgTransaction(
    id: string,
    payload: {
      quantity_pcs?: number;
      shift?: 'Pagi' | 'Malam';
      transaction_date?: string;
      recycle_type_snapshot?: 'reuse' | 'no_reuse';
      notes?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put(`/api/admin/database/transactions/ng/${id}`, payload);
    return response.data;
  }

  static async deleteNgTransaction(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/admin/database/transactions/ng/${id}`);
    return response.data;
  }

  static async getRunnerTransactions(filter: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    shift?: string;
    departmentId?: string;
  }): Promise<{
    transactions: DirectRunnerTransactionItem[];
    pagination: DatabasePagination;
  }> {
    const response = await apiClient.get('/api/admin/database/transactions/runner', {
      params: {
        page: filter.page,
        limit: filter.limit,
        search: filter.search,
        start_date: filter.startDate,
        end_date: filter.endDate,
        shift: filter.shift,
        department_id: filter.departmentId,
      },
    });

    return {
      transactions: response.data.data || [],
      pagination: response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  }

  static async updateRunnerTransaction(
    id: string,
    payload: {
      total_runner_weight_kg?: number;
      total_pcs?: number;
      shift?: 'Pagi' | 'Malam';
      transaction_date?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put(`/api/admin/database/transactions/runner/${id}`, payload);
    return response.data;
  }

  static async deleteRunnerTransaction(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/admin/database/transactions/runner/${id}`);
    return response.data;
  }
}
