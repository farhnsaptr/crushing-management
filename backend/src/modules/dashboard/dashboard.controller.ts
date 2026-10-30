import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class DashboardController {
  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const location = (req.query.location as string) === 'Karawang' ? 'Karawang' : 'Cibitung';

      const stats = await DashboardService.getSummaryStats(year, month, location);
      sendSuccess(res, stats, 'Dashboard summary stats retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get dashboard summary', 500);
    }
  }

  static async getDailyChart(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const location = (req.query.location as string) === 'Karawang' ? 'Karawang' : 'Cibitung';
 const departmentId = (req.query.department_id as string) || undefined;

      const chartData = await DashboardService.getDailyChartData(year, month, location, departmentId);
      sendSuccess(res, chartData, 'Daily chart data retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get daily chart data', 500);
    }
  }

  static async getBudomariChart(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const location = (req.query.location as string) === 'Karawang' ? 'Karawang' : 'Cibitung';

      const chartData = await DashboardService.getBudomariDailyChart(year, month, location);
      sendSuccess(res, chartData, 'Budomari daily chart data retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get budomari chart data', 500);
    }
  }

  static async getParetoMaterial(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const location = (req.query.location as string) === 'Karawang' ? 'Karawang' : 'Cibitung';
 const departmentId = (req.query.department_id as string) || undefined;

      const paretoData = await DashboardService.getParetoMaterial(year, month, location, departmentId);
      sendSuccess(res, paretoData, 'Pareto material data retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get pareto material data', 500);
    }
  }

  static async getTopNgParts(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const location = (req.query.location as string) === 'Karawang' ? 'Karawang' : 'Cibitung';
 const departmentId = (req.query.department_id as string) || undefined;

      const topNgData = await DashboardService.getTopNgParts(year, month, location, departmentId);
      sendSuccess(res, topNgData, 'Top NG parts retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get top NG parts', 500);
    }
  }

  static async getDepartmentPareto(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const location = (req.query.location as string) === 'Karawang' ? 'Karawang' : 'Cibitung';

      const data = await DashboardService.getDepartmentPareto(year, month, location);
      sendSuccess(res, data, 'Department Pareto data retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get department Pareto data', 500);
    }
  }

  static async getSenderStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;

      const data = await DashboardService.getSenderDashboardStats(req.user.id, year, month);
      sendSuccess(res, data, 'Sender dashboard stats retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get sender dashboard stats', 500);
    }
  }

  static async exportExcel(req: Request, res: Response): Promise<void> {
    try {
      const startDate = (req.query.start_date as string) || (req.query.startDate as string);
      const endDate = (req.query.end_date as string) || (req.query.endDate as string);
      const location = (req.query.location as string) === 'Karawang' ? 'Karawang' : 'Cibitung';

      const buffer = await DashboardService.generateExcelBuffer(startDate, endDate, location);

      const filename = `NG_Transactions_${location}_${startDate || 'start'}_to_${endDate || 'end'}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to export dashboard excel file', 500);
    }
  }
}
