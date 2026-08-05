import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { addSseClient } from '../../utils/sse.util';

export class DashboardController {
  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date as string | undefined;
      const endDate = req.query.end_date as string | undefined;

      const stats = await DashboardService.getSummaryStats(startDate, endDate);
      sendSuccess(res, stats, 'Dashboard summary stats retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get dashboard summary', 500);
    }
  }

  static async getDailyChart(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date as string | undefined;
      const endDate = req.query.end_date as string | undefined;

      const chartData = await DashboardService.getDailyChartData(startDate, endDate);
      sendSuccess(res, chartData, 'Daily chart data retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get daily chart data', 500);
    }
  }

  static async getParetoMaterial(req: Request, res: Response): Promise<void> {
    try {
      const paretoData = await DashboardService.getParetoMaterial();
      sendSuccess(res, paretoData, 'Pareto material data retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get pareto material data', 500);
    }
  }

  static async getTopNgParts(req: Request, res: Response): Promise<void> {
    try {
      const topNgData = await DashboardService.getTopNgParts();
      sendSuccess(res, topNgData, 'Top NG parts retrieved');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get top NG parts', 500);
    }
  }

  static sseStream(req: Request, res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Send connection established event
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'SSE Stream Connected' })}\n\n`);

    addSseClient(res);
  }

  static async exportData(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date as string | undefined;
      const endDate = req.query.end_date as string | undefined;

      const stats = await DashboardService.getSummaryStats(startDate, endDate);
      const pareto = await DashboardService.getParetoMaterial();
      const topParts = await DashboardService.getTopNgParts();

      sendSuccess(res, { stats, pareto, topParts }, 'Export dataset generated');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to export dashboard data', 500);
    }
  }
}
