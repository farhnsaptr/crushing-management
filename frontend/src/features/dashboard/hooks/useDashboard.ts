import { useState, useEffect, useCallback } from 'react';
import { DashboardService } from '../services/dashboard.service';
import { useAuth } from '../../../context/AuthContext';
import { extractErrorMessage } from '../../../services/api.client';
import { usePlantLocation } from '../../factories/hooks/usePlantLocation';
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
  // Lokasi: daftar dari backend, pilihan terakhir tersimpan per user di browser (berbagi dengan form Verifikasi)
  const {
    locations,
    location: selectedLocation,
    setLocation: setSelectedLocation,
    isLoaded: isLocationsLoaded,
  } = usePlantLocation();

  // Plant / Operator / Admin Dashboard Data
  const [summaryStats, setSummaryStats] = useState<DashboardSummaryStats | null>(null);
  const [dailyChart, setDailyChart] = useState<DailyRecycleChartItem[]>([]);
  const [paretoMaterials, setParetoMaterials] = useState<ParetoMaterialItem[]>([]);
  const [topParts, setTopParts] = useState<TopNgPartItem[]>([]);
  const [departmentPareto, setDepartmentPareto] = useState<DepartmentParetoItem[]>([]);

  // Sender Specific Dashboard Data
  const [senderStats, setSenderStats] = useState<SenderDashboardStats | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const role = user?.role;

  const fetchDashboardData = useCallback(async () => {
    // Lokasi belum tersedia dari backend: tunggu (atau selesai bila memang tidak ada lokasi)
    if (role !== 'pengirim' && !selectedLocation) {
      setIsLoading(!isLocationsLoaded);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (role === 'pengirim') {
        const senderData = await DashboardService.getSenderStats(selectedYear, selectedMonth);
        setSenderStats(senderData);
      } else {
        const [statsData, chartResult, paretoData, topPartsData, deptParetoData] = await Promise.all([
          DashboardService.getSummary(selectedYear, selectedMonth, selectedLocation),
          DashboardService.getDailyChart(selectedYear, selectedMonth, selectedLocation),
          DashboardService.getParetoMaterial(selectedYear, selectedMonth, selectedLocation),
          DashboardService.getTopNgParts(selectedYear, selectedMonth, selectedLocation),
          DashboardService.getDepartmentPareto(selectedYear, selectedMonth, selectedLocation),
        ]);

        setSummaryStats(statsData);
        setDailyChart(chartResult.daily_chart || []);
        setParetoMaterials(paretoData);
        setTopParts(topPartsData);
        setDepartmentPareto(deptParetoData);
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard dataset:', err);
      setErrorMessage(extractErrorMessage(err, 'Gagal memuat data analitik dashboard'));
    } finally {
      setIsLoading(false);
    }
  }, [role, selectedYear, selectedMonth, selectedLocation, isLocationsLoaded]);

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
    locations,
    selectedLocation,
    setSelectedLocation,
    summaryStats,
    dailyChart,
    paretoMaterials,
    topParts,
    departmentPareto,
    senderStats,
    isLoading,
    isExporting,
    errorMessage,
    fetchDashboardData,
    handleExportExcel,
  };
}
