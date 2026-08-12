import { useState, useCallback, useEffect } from 'react';
import { RunnerMaterialService } from '../services/runnerMaterial.service';
import type {
  RunnerMaterialAnalyticsSummaryResponse,
  RunnerMaterialAnalyticsDetailResponse,
} from '../types/runnerMaterial.types';

export const useRunnerDetail = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = All Months
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'weight_desc' | 'weight_asc' | 'name_asc' | 'transactions_desc'>('weight_desc');

  const [summaryData, setSummaryData] = useState<RunnerMaterialAnalyticsSummaryResponse | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);

  // Detail Modal State
  const [selectedMaterialName, setSelectedMaterialName] = useState<string | null>(null);
  const [detailSelectedMonth, setDetailSelectedMonth] = useState<number>(currentMonth);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [materialDetailData, setMaterialDetailData] = useState<RunnerMaterialAnalyticsDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Fetch summary analytics list
  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const monthParam = selectedMonth > 0 ? selectedMonth : undefined;
      const data = await RunnerMaterialService.getAnalyticsSummary(selectedYear, monthParam);
      setSummaryData(data);
    } catch (err) {
      console.error('Failed to load runner material analytics summary:', err);
      setSummaryData(null);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Fetch detail for a specific material and month
  const fetchMaterialDetail = useCallback(async (materialName: string, targetMonth?: number) => {
    setIsLoadingDetail(true);
    try {
      const m = targetMonth && targetMonth >= 1 && targetMonth <= 12 ? targetMonth : (selectedMonth > 0 ? selectedMonth : currentMonth);
      setDetailSelectedMonth(m);
      const detail = await RunnerMaterialService.getAnalyticsDetail(materialName, selectedYear, m);
      setMaterialDetailData(detail);
    } catch (err) {
      console.error('Failed to load material detail analytics:', err);
      setMaterialDetailData(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [selectedYear, selectedMonth, currentMonth]);

  // Open modal and fetch detail
  const openMaterialDetail = async (materialName: string, targetMonth?: number) => {
    setSelectedMaterialName(materialName);
    setIsModalOpen(true);
    await fetchMaterialDetail(materialName, targetMonth);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMaterialName(null);
    setMaterialDetailData(null);
  };

  // Filter & Sort Materials
  const rawMaterials = summaryData?.materials || [];

  const filteredMaterials = rawMaterials.filter((m) =>
    m.material_name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    if (sortBy === 'weight_desc') return b.total_runner_weight_kg - a.total_runner_weight_kg;
    if (sortBy === 'weight_asc') return a.total_runner_weight_kg - b.total_runner_weight_kg;
    if (sortBy === 'name_asc') return a.material_name.localeCompare(b.material_name);
    if (sortBy === 'transactions_desc') return b.total_transactions - a.total_transactions;
    return 0;
  });

  return {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    summaryData,
    isLoadingSummary,
    fetchSummary,
    sortedMaterials,
    isModalOpen,
    openMaterialDetail,
    closeModal,
    selectedMaterialName,
    detailSelectedMonth,
    fetchMaterialDetail,
    materialDetailData,
    isLoadingDetail,
  };
};
