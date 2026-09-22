import { useState, useCallback, useEffect } from 'react';
import { RunnerMaterialService } from '../services/runnerMaterial.service';
import type {
  RunnerMaterialPreviewResponse,
  RunnerMaterialRecord,
  UpdateRunnerMaterialPayload,
  RunnerBatchItem,
} from '../types/runnerMaterial.types';

export const useRunnerImport = () => {
  const [entryMode, setEntryMode] = useState<'csv' | 'manual'>('csv');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');

  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<RunnerMaterialPreviewResponse | null>(null);

  // History & Pagination State
  const [historyRecords, setHistoryRecords] = useState<RunnerMaterialRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Individual Edit & Rollback Modals State
  const [editingRecord, setEditingRecord] = useState<RunnerMaterialRecord | null>(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState<boolean>(false);
  const [isDeletingAllModalOpen, setIsDeletingAllModalOpen] = useState<boolean>(false);
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState<boolean>(false);
  const [selectedBatchToRollback, setSelectedBatchToRollback] = useState<string>('');
  const [batchesList, setBatchesList] = useState<RunnerBatchItem[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchHistory = useCallback(async (currentPage = page, currentLimit = limit) => {
    setIsLoadingHistory(true);
    try {
      const data = await RunnerMaterialService.listRecords(currentPage, currentLimit);
      if (data && Array.isArray(data.records)) {
        setHistoryRecords(data.records);
        if (data.pagination) {
          setTotalRecords(data.pagination.total || 0);
          setTotalPages(data.pagination.totalPages || 1);
        }
      } else {
        setHistoryRecords([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Failed to load runner material history:', err);
      setHistoryRecords([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchHistory(page, limit);
  }, [fetchHistory, page, limit]);

  const handleFileSelect = (file: File) => {
    setParseError(null);
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls') && !lowerName.endsWith('.csv')) {
      setParseError('Format file tidak didukung. Harap pilih file Excel (.xlsx / .xls) atau .csv.');
      return;
    }
    setSelectedFile(file);
    setSelectedDateFilter('');
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setParseError(null);
    setPreviewData(null);
    setSelectedDateFilter('');
  };

  const handleProcessFile = async (dateOverride?: string) => {
    if (!selectedFile) return;

    setIsLoading(true);
    setParseError(null);

    try {
      const validOverride = typeof dateOverride === 'string' && dateOverride.trim() !== '' && !dateOverride.includes('[object') ? dateOverride.trim() : undefined;
      const dateToUse = validOverride || selectedDateFilter || undefined;
      const resData = await RunnerMaterialService.previewImportFile(selectedFile, dateToUse);

      if (!resData || !Array.isArray(resData.matched_materials) || resData.matched_materials.length === 0) {
        setParseError('Tidak ada kode Sebango yang cocok dengan Master Parts di sistem untuk tanggal yang dipilih.');
        setIsLoading(false);
        return;
      }

      setPreviewData(resData);
      if (resData.selected_date) {
        setSelectedDateFilter(resData.selected_date);
      }
      setPreviewModalOpen(true);
    } catch (err: any) {
      console.error('Error processing production file:', err);
      setParseError(err.response?.data?.error || err.message || 'Gagal memproses file Laporan Produksi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeDateFilter = async (newDate: string) => {
    setSelectedDateFilter(newDate);
    await handleProcessFile(newDate);
  };

  const handleConfirmSave = async () => {
    if (!previewData || !Array.isArray(previewData.matched_materials) || previewData.matched_materials.length === 0) return;

    setIsSaving(true);
    try {
      const payloadItems = previewData.matched_materials.map((m) => ({
        material_id: m.material_id || null,
        material_name: m.material_name,
        shift: m.shift || 'Pagi',
        total_pcs: m.total_pcs,
        total_runner_weight_kg: m.total_runner_weight_kg,
        transaction_date: m.transaction_date || previewData.transaction_date,
      }));

      const res = await RunnerMaterialService.saveRecords({
        transaction_date: previewData.transaction_date,
        batch_ref: previewData.batch_ref,
        items: payloadItems,
      });

      const savedCount = res?.savedCount ?? payloadItems.length;
      const batchRef = res?.batchRef || previewData.batch_ref;

      setToast({
        message: `Berhasil mencatat ${savedCount} record runner material (Batch: ${batchRef})`,
        type: 'success',
      });

      setPreviewModalOpen(false);
      handleClearFile();
      setPage(1);
      await fetchHistory(1, limit);
    } catch (err: any) {
      console.error('Error saving runner material records:', err);
      setToast({
        message: err.message || 'Gagal menyimpan data runner material.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Manual Form Submission Handler (Batch Multi-Material)
  const handleSaveManualBatch = async (payload: {
    transaction_date: string;
    batch_ref: string;
    items: Array<{
      material_id?: string | null;
      material_name: string;
      total_pcs: number;
      total_runner_weight_kg: number;
    }>;
  }) => {
    setIsSaving(true);
    try {
      const res = await RunnerMaterialService.saveRecords({
        transaction_date: payload.transaction_date,
        batch_ref: payload.batch_ref,
        items: payload.items,
      });

      const savedCount = res?.savedCount ?? payload.items.length;
      const batchRef = res?.batchRef || payload.batch_ref;

      setToast({
        message: `Berhasil mencatat ${savedCount} data manual runner material (Batch: ${batchRef})`,
        type: 'success',
      });

      setPage(1);
      await fetchHistory(1, limit);
    } catch (err: any) {
      console.error('Error saving manual runner material batch:', err);
      setToast({
        message: err.response?.data?.error || err.message || 'Gagal menyimpan data manual runner.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update record (Super-Admin & Admin)
  const handleUpdateRecord = async (id: string, payload: UpdateRunnerMaterialPayload) => {
    setIsActionLoading(true);
    try {
      await RunnerMaterialService.updateRecord(id, payload);
      setToast({
        message: 'Berhasil memperbarui data runner material.',
        type: 'success',
      });
      setIsEditingModalOpen(false);
      setEditingRecord(null);
      await fetchHistory(page, limit);
    } catch (err: any) {
      console.error('Error updating runner material record:', err);
      setToast({
        message: err.response?.data?.error || err.message || 'Gagal memperbarui data.',
        type: 'error',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete individual record (Super-Admin & Admin)
  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data runner material ini?')) return;

    setIsActionLoading(true);
    try {
      await RunnerMaterialService.deleteRecord(id);
      setToast({
        message: 'Berhasil menghapus 1 data runner material.',
        type: 'success',
      });
      await fetchHistory(page, limit);
    } catch (err: any) {
      console.error('Error deleting runner material record:', err);
      setToast({
        message: err.response?.data?.error || err.message || 'Gagal menghapus data.',
        type: 'error',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Fetch batches for rollback
  const fetchBatches = useCallback(async () => {
    setIsLoadingBatches(true);
    try {
      const list = await RunnerMaterialService.listBatches();
      setBatchesList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Failed to load batches for rollback:', err);
    } finally {
      setIsLoadingBatches(false);
    }
  }, []);

  // Rollback records per batch
  const handleRollbackBatch = async (batchRef: string) => {
    if (!batchRef) return;
    setIsActionLoading(true);
    try {
      const res = await RunnerMaterialService.rollbackBatch(batchRef);
      setToast({
        message: `Berhasil me-rollback batch ${res.batchRef} (${res.deletedCount} data dihapus).`,
        type: 'success',
      });
      setIsRollbackModalOpen(false);
      setSelectedBatchToRollback('');
      setPage(1);
      await fetchHistory(1, limit);
      await fetchBatches();
    } catch (err: any) {
      console.error('Error rolling back batch:', err);
      setToast({
        message: err.response?.data?.error || err.message || 'Gagal melakukan rollback batch.',
        type: 'error',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete all records (Super-Admin only - backwards compatibility)
  const handleDeleteAllRecords = async () => {
    setIsActionLoading(true);
    try {
      await RunnerMaterialService.deleteAllRecords();
      setToast({
        message: `Berhasil menghapus seluruh data runner material.`,
        type: 'success',
      });
      setIsDeletingAllModalOpen(false);
      setPage(1);
      await fetchHistory(1, limit);
    } catch (err: any) {
      console.error('Error deleting all runner material records:', err);
      setToast({
        message: err.response?.data?.error || err.message || 'Gagal menghapus seluruh data.',
        type: 'error',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    entryMode,
    setEntryMode,
    selectedFile,
    isLoading,
    isSaving,
    parseError,
    handleFileSelect,
    handleClearFile,
    handleProcessFile,
    selectedDateFilter,
    setSelectedDateFilter,
    handleChangeDateFilter,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleConfirmSave,
    handleSaveManualBatch,
    historyRecords: Array.isArray(historyRecords) ? historyRecords : [],
    isLoadingHistory,
    page,
    setPage,
    limit,
    setLimit,
    totalRecords,
    totalPages,
    fetchHistory,
    editingRecord,
    setEditingRecord,
    isEditingModalOpen,
    setIsEditingModalOpen,
    isDeletingAllModalOpen,
    setIsDeletingAllModalOpen,
    isRollbackModalOpen,
    setIsRollbackModalOpen,
    selectedBatchToRollback,
    setSelectedBatchToRollback,
    batchesList,
    isLoadingBatches,
    fetchBatches,
    handleRollbackBatch,
    isActionLoading,
    handleUpdateRecord,
    handleDeleteRecord,
    handleDeleteAllRecords,
    toast,
    setToast,
  };
};
