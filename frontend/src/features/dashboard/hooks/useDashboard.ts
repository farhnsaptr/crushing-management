import { useState, useEffect, useCallback } from 'react';
import { DashboardService } from '../services/dashboard.service';
import { VerificationService } from '../../verification/services/verification.service';
import { useAuth } from '../../../context/AuthContext';
import { canManageData } from '../../../config/permissions.config';
import { extractErrorMessage } from '../../../services/api.client';
import type { VerificationDashboardStatusResponse } from '../../verification/types/verification.types';
import type {
  DashboardSummaryStats,
  DailyRecycleChartItem,
  ParetoMaterialItem,
  TopNgPartItem,
  DepartmentParetoItem,
  SenderDashboardStats,
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
  const { user } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedLocation, setSelectedLocation] = useState<PlantLocation>('Cibitung');

  // Plant / Operator / Admin Dashboard Data
  const [summaryStats, setSummaryStats] = useState<DashboardSummaryStats | null>(null);
  const [dailyChart, setDailyChart] = useState<DailyRecycleChartItem[]>([]);
  const [paretoMaterials, setParetoMaterials] = useState<ParetoMaterialItem[]>([]);
  const [topParts, setTopParts] = useState<TopNgPartItem[]>([]);
  const [departmentPareto, setDepartmentPareto] = useState<DepartmentParetoItem[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<VerificationDashboardStatusResponse | null>(null);

  // Sender Specific Dashboard Data
  const [senderStats, setSenderStats] = useState<SenderDashboardStats | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (user?.role === 'pengirim') {
        const senderData = await DashboardService.getSenderStats(selectedYear, selectedMonth);
        setSenderStats(senderData);
      } else {
        const [statsData, chartResult, paretoData, topPartsData, deptParetoData, verStatus] = await Promise.all([
          DashboardService.getSummary(selectedYear, selectedMonth, selectedLocation),
          DashboardService.getDailyChart(selectedYear, selectedMonth, selectedLocation),
          DashboardService.getParetoMaterial(selectedYear, selectedMonth, selectedLocation),
          DashboardService.getTopNgParts(selectedYear, selectedMonth, selectedLocation),
          DashboardService.getDepartmentPareto(selectedYear, selectedMonth, selectedLocation),
          canManageData(user?.role) ? VerificationService.getDashboardStatus() : Promise.resolve(null),
        ]);

        setSummaryStats(statsData);
        setDailyChart(chartResult.daily_chart || []);
        setParetoMaterials(paretoData);
        setTopParts(topPartsData);
        setDepartmentPareto(deptParetoData);
        setVerificationStatus(verStatus);
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard dataset:', err);
      setErrorMessage(extractErrorMessage(err, 'Gagal memuat data analitik dashboard'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, selectedYear, selectedMonth, selectedLocation]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleExportExcel = async (startDate: string, endDate: string, location?: PlantLocation) => {
    setIsExporting(true);
    try {
      await DashboardService.downloadExcelReport(startDate, endDate, location || selectedLocation);
    } catch (err: any) {
      console.error('Failed to export dashboard excel:', err);
      alert(extractErrorMessage(err, 'Gagal mendownload laporan Excel. Silakan coba lagi.'));
    } finally {
      setIsExporting(false);
    }
  };

  return {
    user,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedLocation,
    setSelectedLocation,
    summaryStats,
    dailyChart,
    paretoMaterials,
    topParts,
    departmentPareto,
    senderStats,
    verificationStatus,
    isLoading,
    isExporting,
    errorMessage,
    fetchDashboardData,
    handleExportExcel,
  };
}
