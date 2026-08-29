import { useState, useCallback, useEffect } from 'react';
import { AnalyticsService } from '../services/analytics.service';
import type {
  YearlyAnalyticsResponse,
  ProductionAnalyticsItem,
  ProductionAnalyticsBatch,
  RawProductionCsvRow,
  ParetoMaterialsResponse,
  ParetoPartsNgResponse,
} from '../types/analytics.types';

export type AnalyticsTabType = 'overview' | 'pareto-material' | 'pareto-part-ng';

export const useAnalytics = (initialYear?: number) => {
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState<AnalyticsTabType>('overview');
  const [year, setYear] = useState<number>(initialYear || currentYear);
  const [factory, setFactory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [monthFilter, setMonthFilter] = useState<number | ''>('');

  const [yearlyData, setYearlyData] = useState<YearlyAnalyticsResponse | null>(null);
  const [records, setRecords] = useState<ProductionAnalyticsItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [batches, setBatches] = useState<ProductionAnalyticsBatch[]>([]);

  const [paretoMaterialsData, setParetoMaterialsData] = useState<ParetoMaterialsResponse | null>(null);
  const [paretoPartsNgData, setParetoPartsNgData] = useState<ParetoPartsNgResponse | null>(null);

  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState<boolean>(false);
  const [isLoadingParetoMaterials, setIsLoadingParetoMaterials] = useState<boolean>(false);
  const [isLoadingParetoPartsNg, setIsLoadingParetoPartsNg] = useState<boolean>(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isRollbacking, setIsRollbacking] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState<boolean>(false);

  // Fetch yearly chart & summary
  const fetchYearlyData = useCallback(async () => {
    setIsLoadingChart(true);
    try {
      const res = await AnalyticsService.getYearlyComparison(year, factory);
      setYearlyData(res);
    } catch (err: any) {
      console.error('Failed to load yearly analytics:', err);
      setToast({
        message: err?.response?.data?.message || 'Gagal memuat data komparasi analitik tahunan.',
        type: 'error',
      });
    } finally {
      setIsLoadingChart(false);
    }
  }, [year, factory]);

  // Fetch paginated table records
  const fetchRecords = useCallback(async () => {
    setIsLoadingRecords(true);
    try {
      const res = await AnalyticsService.getProductionRecords({
        page,
        limit: 20,
        year,
        month: monthFilter === '' ? undefined : monthFilter,
        search,
        factory: factory === 'all' ? undefined : factory,
      });
      setRecords(res.records);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load production records:', err);
    } finally {
      setIsLoadingRecords(false);
    }
  }, [page, year, monthFilter, search, factory]);

  // Fetch Pareto Materials
  const fetchParetoMaterials = useCallback(async () => {
    setIsLoadingParetoMaterials(true);
    try {
      const res = await AnalyticsService.getParetoMaterials(year, factory);
      setParetoMaterialsData(res);
    } catch (err: any) {
      console.error('Failed to load pareto materials:', err);
    } finally {
      setIsLoadingParetoMaterials(false);
    }
  }, [year, factory]);

  // Fetch Pareto Parts NG
  const fetchParetoPartsNg = useCallback(async () => {
    setIsLoadingParetoPartsNg(true);
    try {
      const res = await AnalyticsService.getParetoPartsNg(year, factory);
      setParetoPartsNgData(res);
    } catch (err: any) {
      console.error('Failed to load pareto parts NG:', err);
    } finally {
      setIsLoadingParetoPartsNg(false);
    }
  }, [year, factory]);

  // Fetch Batches History
  const fetchBatches = useCallback(async () => {
    setIsLoadingBatches(true);
    try {
      const res = await AnalyticsService.getBatches();
      setBatches(res || []);
    } catch (err: any) {
      console.error('Failed to load batches list:', err);
    } finally {
      setIsLoadingBatches(false);
    }
  }, []);

  useEffect(() => {
    fetchYearlyData();
    fetchRecords();
    fetchParetoMaterials();
    fetchParetoPartsNg();
    fetchBatches();
  }, [fetchYearlyData, fetchRecords, fetchParetoMaterials, fetchParetoPartsNg, fetchBatches]);

  // Refresh all analytics data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchYearlyData(),
      fetchRecords(),
      fetchParetoMaterials(),
      fetchParetoPartsNg(),
      fetchBatches(),
    ]);
  }, [fetchYearlyData, fetchRecords, fetchParetoMaterials, fetchParetoPartsNg, fetchBatches]);

  // Upload production report handler
  const handleUploadReport = async (filename: string, rawRows: RawProductionCsvRow[], batchName?: string) => {
    setIsUploading(true);
    try {
      const res = await AnalyticsService.uploadProductionReport(filename, rawRows, batchName);
      setToast({
        message: `Berhasil mengimpor ${res.total_rows} baris (${res.matched_rows} part cocok)! Total Allowance: ${res.total_allowance_kg} kg.`,
        type: 'success',
      });
      setIsUploadModalOpen(false);
      await refreshAll();
    } catch (err: any) {
      console.error('Failed to upload report:', err);
      setToast({
        message: err?.response?.data?.message || 'Gagal mengunggah laporan produksi.',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Rollback latest batch
  const handleRollbackLatestBatch = async () => {
    setIsRollbacking(true);
    try {
      const rolledBack = await AnalyticsService.rollbackLatestBatch();
      setToast({
        message: `Rollback Berhasil! 1 batch data produksi ("${rolledBack.filename || rolledBack.batch_name}") telah dihapus.`,
        type: 'success',
      });
      setIsRollbackModalOpen(false);
      await refreshAll();
    } catch (err: any) {
      console.error('Failed to rollback batch:', err);
      setToast({
        message: err?.response?.data?.message || 'Gagal melakukan rollback batch data produksi.',
        type: 'error',
      });
    } finally {
      setIsRollbacking(false);
    }
  };

  // Delete specific batch
  const handleDeleteBatch = async (batchId: string) => {
    setIsRollbacking(true);
    try {
      const success = await AnalyticsService.deleteBatch(batchId);
      if (success) {
        setToast({
          message: 'Batch laporan produksi berhasil dihapus.',
          type: 'success',
        });
        await refreshAll();
      }
    } catch (err: any) {
      console.error('Failed to delete batch:', err);
      setToast({
        message: err?.response?.data?.message || 'Gagal menghapus batch data produksi.',
        type: 'error',
      });
    } finally {
      setIsRollbacking(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    year,
    setYear,
    factory,
    setFactory,
    search,
    setSearch,
    page,
    setPage,
    monthFilter,
    setMonthFilter,
    yearlyData,
    records,
    pagination,
    batches,
    paretoMaterialsData,
    paretoPartsNgData,
    isLoadingChart,
    isLoadingRecords,
    isLoadingParetoMaterials,
    isLoadingParetoPartsNg,
    isLoadingBatches,
    isUploading,
    isRollbacking,
    toast,
    setToast,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isRollbackModalOpen,
    setIsRollbackModalOpen,
    fetchYearlyData,
    fetchRecords,
    fetchParetoMaterials,
    fetchParetoPartsNg,
    fetchBatches,
    refreshAll,
    handleUploadReport,
    handleRollbackLatestBatch,
    handleDeleteBatch,
  };
};
