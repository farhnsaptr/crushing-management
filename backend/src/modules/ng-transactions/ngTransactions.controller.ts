import { Response } from 'express';
import { NgTransactionsService } from './ngTransactions.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class NgTransactionsController {
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { master_part_id, quantity_pcs, shift, transaction_date, notes } = req.body;

      if (!master_part_id || !quantity_pcs || !shift || !transaction_date) {
        sendError(res, 'master_part_id, quantity_pcs, shift, and transaction_date are required', 400);
        return;
      }

      if (!['Pagi', 'Malam'].includes(shift)) {
        sendError(res, 'shift must be Pagi or Malam', 400);
        return;
      }

      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const inputBy = req.user.id;

      const transaction = await NgTransactionsService.createTransaction({
        master_part_id,
        quantity_pcs,
        shift,
        transaction_date,
        input_by: inputBy,
        notes,
      });

      sendSuccess(res, transaction, 'NG Transaction recorded successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to record NG transaction', 400);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const startDate = req.query.start_date as string | undefined;
      const endDate = req.query.end_date as string | undefined;

      const result = await NgTransactionsService.listTransactions(page, limit, startDate, endDate);
      sendSuccess(res, result.transactions, 'NG Transactions retrieved', 200, result.pagination);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to list NG transactions', 500);
    }
  }

  static async getSummaryByMaterial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const now = new Date();
      const year = parseInt(req.query.year as string, 10) || now.getFullYear();
      const month = parseInt(req.query.month as string, 10) || now.getMonth() + 1;
      const location = (req.query.location as string) === 'Karawang' ? 'Karawang' : 'Cibitung';

      const summary = await NgTransactionsService.getMaterialSummary(year, month, location);
      sendSuccess(res, summary, 'Material summary retrieved successfully', 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve material summary', 500);
    }
  }

  static async getPartMonthlyDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const partId = String(req.params.partId);
      const now = new Date();
      const year = parseInt(req.query.year as string, 10) || now.getFullYear();
      const month = parseInt(req.query.month as string, 10) || now.getMonth() + 1;
      const location = (req.query.location as string) === 'Karawang' ? 'Karawang' : 'Cibitung';

      if (!partId) {
        sendError(res, 'partId is required', 400);
        return;
      }

      const detail = await NgTransactionsService.getPartMonthlyDetail(partId, year, month, location);
      sendSuccess(res, detail, 'Part monthly detail retrieved successfully', 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve part monthly detail', 500);
    }
  }
}
