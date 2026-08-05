import { Request, Response } from 'express';
import { GlobalLogsService } from './globalLogs.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export class GlobalLogsController {
  static async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const count = parseInt(req.query.count as string, 10) || 50;
      const startId = (req.query.start_id as string) || '+';
      const endId = (req.query.end_id as string) || '-';

      const result = await GlobalLogsService.getLogs(count, startId, endId);
      sendSuccess(res, result, 'Global API logs retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve global logs', 500);
    }
  }
}
