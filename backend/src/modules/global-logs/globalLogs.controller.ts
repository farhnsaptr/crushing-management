import { Request, Response } from 'express';
import { GlobalLogsService } from './globalLogs.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { addSseClient, broadcastSseEvent } from '../../utils/sse.util';

export class GlobalLogsController {
  static async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const count = parseInt(req.query.count as string, 10) || 50;
      const result = await GlobalLogsService.getLogs(count);
      sendSuccess(res, result, 'Global API logs retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve global logs', 500);
    }
  }

  static async streamLogs(req: Request, res: Response): Promise<void> {
    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      // Send initial history
      const initial = await GlobalLogsService.getLogs(100);
      res.write(`event: initial_logs\ndata: ${JSON.stringify(initial.logs || [])}\n\n`);

      // Register connection to broadcaster
      addSseClient(res);
    } catch (error: any) {
      console.error('[GlobalLogsController] Stream error:', error);
    }
  }

  static async clearAllLogs(req: Request, res: Response): Promise<void> {
    try {
      await GlobalLogsService.clearAllLogs();
      broadcastSseEvent('logs_cleared', {});
      sendSuccess(res, null, 'All global audit logs cleared');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to clear logs', 500);
    }
  }
}
