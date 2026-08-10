import { useState, useEffect, useCallback } from 'react';
import { DashboardService } from '../services/dashboard.service';
import type {
  DashboardSummaryStats,
  DailyRecycleChartItem,
  ParetoMaterialItem,
  TopNgPartItem,
  PlantLocation,
} from '../types/dashboard.types';

export const MONTH_OPTIONS = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

export function useDashboard() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedLocation, setSelectedLocation] = useState<PlantLocation>('Cibitung');

  const [summaryStats, setSummaryStats] = useState<DashboardSummaryStats | null>(null);
  const [dailyChart, setDailyChart] = useState<DailyRecycleChartItem[]>([]);
  const [totalAllowanceKg, setTotalAllowanceKg] = useState<number>(0);
  const [paretoMaterials, setParetoMaterials] = useState<ParetoMaterialItem[]>([]);
  const [topParts, setTopParts] = useState<TopNgPartItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [statsData, chartResult, paretoData, topPartsData] = await Promise.all([
        DashboardService.getSummary(selectedYear, selectedMonth, selectedLocation),
        DashboardService.getDailyChart(selectedYear, selectedMonth, selectedLocation),
        DashboardService.getParetoMaterial(selectedYear, selectedMonth, selectedLocation),
        DashboardService.getTopNgParts(selectedYear, selectedMonth, selectedLocation),
      ]);

      setSummaryStats(statsData);
      setDailyChart(chartResult.daily_chart || []);
      setTotalAllowanceKg(chartResult.total_allowance_kg || 0);
      setParetoMaterials(paretoData);
      setTopParts(topPartsData);
    } catch (err: any) {
      console.error('Failed to fetch dashboard dataset:', err);
      setErrorMessage(err.message || 'Gagal memuat data analitik dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth, selectedLocation]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleExportExcel = async (startDate: string, endDate: string, location?: PlantLocation) => {
    setIsExporting(true);
    try {
      await DashboardService.downloadExcelReport(startDate, endDate, location || selectedLocation);
    } catch (err: any) {
      console.error('Failed to export dashboard excel:', err);
      alert('Gagal mendownload laporan Excel. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedLocation,
    setSelectedLocation,
    summaryStats,
    dailyChart,
    totalAllowanceKg,
    paretoMaterials,
    topParts,
    isLoading,
    isExporting,
    errorMessage,
    fetchDashboardData,
    handleExportExcel,
  };
}
