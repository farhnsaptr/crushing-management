import { useState, useCallback, useEffect } from 'react';
import { RunnerMaterialService } from '../services/runnerMaterial.service';
import type {
  RunnerMaterialAnalyticsSummaryResponse,
  RunnerMaterialAnalyticsDetailResponse,
  RunnerMaterialSummaryItem,
} from '../types/runnerMaterial.types';

export const useRunnerDetail = () => {
  const currentYear = new Date().getFullYear();
  
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = All Months
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'weight_desc' | 'weight_asc' | 'name_asc' | 'transactions_desc'>('weight_desc');

  const [summaryData, setSummaryData] = useState<RunnerMaterialAnalyticsSummaryResponse | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);

  // Detail Modal State
  const [selectedMaterialName, setSelectedMaterialName] = useState<string | null>(null);
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

  // Open modal and fetch detail & monthly chart
  const openMaterialDetail = async (materialName: string) => {
    setSelectedMaterialName(materialName);
    setIsModalOpen(true);
    setIsLoadingDetail(true);

    try {
      const detail = await RunnerMaterialService.getAnalyticsDetail(materialName, selectedYear);
      setMaterialDetailData(detail);
    } catch (err) {
      console.error('Failed to load material detail analytics:', err);
      setMaterialDetailData(null);
    } finally {
      setIsLoadingDetail(false);
    }
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
    materialDetailData,
    isLoadingDetail,
  };
};
