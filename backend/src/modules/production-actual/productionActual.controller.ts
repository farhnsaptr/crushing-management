import { Request, Response } from 'express';
import { ProductionActualService } from './productionActual.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export class ProductionActualController {
  static async importRecords(req: Request, res: Response): Promise<void> {
    try {
      const { records, batch_ref } = req.body;

      if (!Array.isArray(records) || records.length === 0) {
        sendError(res, 'Payload must include non-empty records array', 400);
        return;
      }

      const result = await ProductionActualService.importRecords(records, batch_ref);
      sendSuccess(res, result, 'Production actual data import process finished');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to import production actual data', 500);
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const result = await ProductionActualService.listRecords(page, limit);
      sendSuccess(res, result.records, 'Production actual records retrieved', 200, result.pagination);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to list production actual records', 500);
    }
  }
}
