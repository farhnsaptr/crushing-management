import { Response } from 'express';
import { NgTransactionsService } from './ngTransactions.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class NgTransactionsController {
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { master_part_id, quantity_pcs, shift, input_method, transaction_date, notes } = req.body;

      if (!master_part_id || !quantity_pcs || !shift || !input_method || !transaction_date) {
        sendError(res, 'master_part_id, quantity_pcs, shift, input_method, and transaction_date are required', 400);
        return;
      }

      if (!['Pagi', 'Malam'].includes(shift)) {
        sendError(res, 'shift must be Pagi or Malam', 400);
        return;
      }

      if (!['typed', 'scan'].includes(input_method)) {
        sendError(res, 'input_method must be typed or scan', 400);
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
        input_method,
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
}
