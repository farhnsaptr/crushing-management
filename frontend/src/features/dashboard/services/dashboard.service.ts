import { apiClient } from '../../../services/api.client';
import type {
  DashboardSummaryStats,
  DailyRecycleChartResponse,
  ParetoMaterialItem,
  TopNgPartItem,
  DepartmentParetoItem,
  SenderDashboardStats,
  PlantLocation,
} from '../types/dashboard.types';

export class DashboardService {
  static async getSummary(
    year?: number,
    month?: number,
    location: PlantLocation = 'Cibitung'
  ): Promise<DashboardSummaryStats> {
    const response = await apiClient.get('/api/dashboard/summary', {
      params: { year, month, location },
    });
    return response.data.data;
  }

  static async getDailyChart(
    year?: number,
    month?: number,
    location: PlantLocation = 'Cibitung'
  ): Promise<DailyRecycleChartResponse> {
    const response = await apiClient.get('/api/dashboard/daily-chart', {
      params: { year, month, location },
    });
    return response.data.data || { total_allowance_kg: 0, daily_chart: [] };
  }

  static async getParetoMaterial(
    year?: number,
    month?: number,
    location: PlantLocation = 'Cibitung'
  ): Promise<ParetoMaterialItem[]> {
    const response = await apiClient.get('/api/dashboard/pareto-material', {
      params: { year, month, location },
    });
    return response.data.data || [];
  }

  static async getTopNgParts(
    year?: number,
    month?: number,
    location: PlantLocation = 'Cibitung'
  ): Promise<TopNgPartItem[]> {
    const response = await apiClient.get('/api/dashboard/top-ng-parts', {
      params: { year, month, location },
    });
    return response.data.data || [];
  }

  static async getDepartmentPareto(
    year?: number,
    month?: number,
    location: PlantLocation = 'Cibitung'
  ): Promise<DepartmentParetoItem[]> {
    const response = await apiClient.get('/api/dashboard/departments-pareto', {
      params: { year, month, location },
    });
    return response.data.data || [];
  }

  static async getSenderStats(year?: number, month?: number): Promise<SenderDashboardStats> {
    const response = await apiClient.get('/api/dashboard/sender-stats', {
      params: { year, month },
    });
    return response.data.data;
  }

  static async downloadExcelReport(
    startDate: string,
    endDate: string,
    location: PlantLocation = 'Cibitung'
  ): Promise<void> {
    const response = await apiClient.get('/api/dashboard/export', {
      params: { start_date: startDate, end_date: endDate, location },
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NG_Transactions_${location}_${startDate}_to_${endDate}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}
