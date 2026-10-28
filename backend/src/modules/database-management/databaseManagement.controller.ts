import { Response } from 'express';
import { DatabaseManagementService } from './databaseManagement.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class DatabaseManagementController {
  static async listRequests(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        page,
        limit,
        search,
        status,
        start_date,
        end_date,
        shift,
        department_id,
        factory_id,
      } = req.query;

      const result = await DatabaseManagementService.listRequests({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        status: status as any,
        startDate: start_date as string,
        endDate: end_date as string,
        shift: shift as string,
        departmentId: department_id as string,
        factoryId: factory_id as string,
      });

      return sendSuccess(res, result.requests, 'Daftar tiket pengiriman berhasil diambil', 200, result.pagination);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal mengambil daftar tiket', 500);
    }
  }

  static async getRequestDetail(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await DatabaseManagementService.getRequestDetail(id);
      return sendSuccess(res, result, 'Detail tiket berhasil diambil');
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal mengambil detail tiket', 404);
    }
  }

  static async unapproveRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      const result = await DatabaseManagementService.unapproveRequest(id, req.user!, reason);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal membatalkan approval tiket', 400);
    }
  }

  static async deleteRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await DatabaseManagementService.deleteRequest(id, req.user!);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal menghapus tiket', 400);
    }
  }

  static async updateRequestHeader(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await DatabaseManagementService.updateRequestHeader(id, req.body, req.user!);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal memperbarui header tiket', 400);
    }
  }

  static async addItemToRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await DatabaseManagementService.addItemToRequest(id, req.body, req.user!);
      return sendSuccess(res, result, result.message, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal menambahkan part ke tiket', 400);
    }
  }

  static async addItemsBatchToRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const items = req.body.items || req.body;
      const result = await DatabaseManagementService.addItemsBatchToRequest(id, items, req.user!);
      return sendSuccess(res, result, result.message, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal menambahkan kumpulan part ke tiket', 400);
    }
  }

  static async updateRequestItem(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const itemId = req.params.itemId as string;
      const result = await DatabaseManagementService.updateRequestItem(id, itemId, req.body, req.user!);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal memperbarui item tiket', 400);
    }
  }

  static async deleteRequestItem(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const itemId = req.params.itemId as string;
      const result = await DatabaseManagementService.deleteRequestItem(id, itemId, req.user!);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal menghapus item dari tiket', 400);
    }
  }

  // ==========================
  // Direct Transactions
  // ==========================

  static async listNgTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const { page, limit, search, start_date, end_date, shift, department_id } = req.query;
      const result = await DatabaseManagementService.listNgTransactions({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        startDate: start_date as string,
        endDate: end_date as string,
        shift: shift as string,
        departmentId: department_id as string,
      });
      return sendSuccess(res, result.transactions, 'Data transaksi Part NG berhasil diambil', 200, result.pagination);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal mengambil transaksi Part NG', 500);
    }
  }

  static async updateNgTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await DatabaseManagementService.updateNgTransaction(id, req.body);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal memperbarui transaksi Part NG', 400);
    }
  }

  static async deleteNgTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await DatabaseManagementService.deleteNgTransaction(id);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal menghapus transaksi Part NG', 400);
    }
  }

  static async listRunnerTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const { page, limit, search, start_date, end_date, shift, department_id } = req.query;
      const result = await DatabaseManagementService.listRunnerTransactions({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        startDate: start_date as string,
        endDate: end_date as string,
        shift: shift as string,
        departmentId: department_id as string,
      });
      return sendSuccess(res, result.transactions, 'Data transaksi Runner berhasil diambil', 200, result.pagination);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal mengambil transaksi Runner', 500);
    }
  }

  static async updateRunnerTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await DatabaseManagementService.updateRunnerTransaction(id, req.body);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal memperbarui transaksi Runner', 400);
    }
  }

  static async deleteRunnerTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await DatabaseManagementService.deleteRunnerTransaction(id);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Gagal menghapus transaksi Runner', 400);
    }
  }
}
