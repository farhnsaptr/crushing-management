import { useState, useCallback, useEffect } from 'react';
import { parseProductionCsv } from '../utils/csvParser.util';
import { RunnerMaterialService } from '../services/runnerMaterial.service';
import type { RunnerMaterialPreviewResponse, RunnerMaterialRecord, UpdateRunnerMaterialPayload } from '../types/runnerMaterial.types';

export const useRunnerImport = () => {
  const [entryMode, setEntryMode] = useState<'csv' | 'manual'>('csv');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<RunnerMaterialPreviewResponse | null>(null);

  // History & Pagination State
  const [historyRecords, setHistoryRecords] = useState<RunnerMaterialRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Individual Edit & Delete Modals State
  const [editingRecord, setEditingRecord] = useState<RunnerMaterialRecord | null>(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState<boolean>(false);
  const [isDeletingAllModalOpen, setIsDeletingAllModalOpen] = useState<boolean>(false);
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
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseError('Format file tidak valid. Harap pilih file berformat .csv');
      return;
    }
    setSelectedFile(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setParseError(null);
    setPreviewData(null);
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setParseError(null);

    try {
      const csvText = await selectedFile.text();
      const parsedRows = parseProductionCsv(csvText);

      if (parsedRows.length === 0) {
        setParseError('File CSV tidak memiliki baris data valid atau ACT TOTAL > 0.');
        setIsLoading(false);
        return;
      }

      // Call backend API preview for master parts lookup & per-material calculation
      const resData = await RunnerMaterialService.previewImport(parsedRows);

      if (!resData || !Array.isArray(resData.matched_materials) || resData.matched_materials.length === 0) {
        setParseError('Tidak ada kode Sebango yang cocok dengan Master Parts di sistem.');
        setIsLoading(false);
        return;
      }

      setPreviewData(resData);
      setPreviewModalOpen(true);
    } catch (err: any) {
      console.error('Error processing CSV:', err);
      setParseError(err.message || 'Gagal memproses file CSV Produksi.');
    } finally {
      setIsLoading(false);
    }
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

  // Delete all records (Super-Admin only)
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
    isActionLoading,
    handleUpdateRecord,
    handleDeleteRecord,
    handleDeleteAllRecords,
    toast,
    setToast,
  };
};
