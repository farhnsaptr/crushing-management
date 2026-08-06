import { useState, useEffect } from 'react';
import { MasterPartsService } from '../services/masterParts.service';
import { MachinesService } from '../../machines/services/machines.service';
import type {
  MasterPart,
  CreateMasterPartPayload,
  ImportPreviewResult,
  ParsedPartRow,
} from '../types/masterParts.types';
import type { Machine } from '../../machines/types/machines.types';
import type { ToastMessage } from '../../../components/common/Toast';

export const useMasterParts = () => {
  const [parts, setParts] = useState<MasterPart[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJenis, setSelectedJenis] = useState<string>('all');

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingPart, setEditingPart] = useState<MasterPart | null>(null);

  // Preview Import Result
  const [previewData, setPreviewData] = useState<ImportPreviewResult | null>(null);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchParts = async () => {
    setIsLoading(true);
    try {
      const res = await MasterPartsService.getParts(page, limit, searchQuery, selectedJenis);
      setParts(res.parts || []);
      setTotal(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal memuat data master parts.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const data = await MachinesService.getMachines();
      setMachines(data || []);
    } catch (err) {
      console.warn('Failed to load machines', err);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [page, searchQuery, selectedJenis]);

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingPart(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (part: MasterPart) => {
    setEditingPart(part);
    setIsCreateModalOpen(true);
  };

  const handleCreatePart = async (payload: CreateMasterPartPayload) => {
    try {
      await MasterPartsService.createPart(payload);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Master part berhasil ditambahkan.',
      });
      setIsCreateModalOpen(false);
      fetchParts();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menambahkan master part.',
      });
    }
  };

  const handleUpdatePart = async (id: string, payload: Partial<CreateMasterPartPayload>) => {
    try {
      await MasterPartsService.updatePart(id, payload);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Master part berhasil diperbarui.',
      });
      setIsCreateModalOpen(false);
      setEditingPart(null);
      fetchParts();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal memperbarui master part.',
      });
    }
  };

  const handleDeletePart = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data master part ini?')) {
      return;
    }

    try {
      await MasterPartsService.deletePart(id);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Master part berhasil dihapus.',
      });
      fetchParts();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus master part.',
      });
    }
  };

  const handleDeleteAllParts = async () => {
    if (!window.confirm('PERINGATAN SUPER-ADMIN!\n\nApakah Anda yakin ingin menghapus SELURUH data master parts dari database? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      await MasterPartsService.deleteAllParts();
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Seluruh data master parts berhasil dihapus dari database.',
      });
      fetchParts();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus seluruh data master parts.',
      });
    }
  };

  // 1. Process Excel File & Open Preview Modal
  const handlePreviewImportFile = async (file: File) => {
    setIsUploading(true);
    try {
      const previewRes = await MasterPartsService.previewImportFile(file);
      setPreviewData(previewRes);
      setIsUploadModalOpen(false);
      setIsPreviewModalOpen(true);
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal membaca file Excel.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Commit Preview Rows to Database
  const handleCommitImport = async (rows: ParsedPartRow[]) => {
    setIsCommitting(true);
    try {
      const result = await MasterPartsService.commitImport(rows);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: `Berhasil mengimpor ${result.insertedCount} master parts ke database.`,
      });
      setIsPreviewModalOpen(false);
      setPreviewData(null);
      fetchParts();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan data impor.',
      });
    } finally {
      setIsCommitting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await MasterPartsService.downloadTemplate();
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: 'Template Excel berhasil diunduh.',
      });
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: 'Gagal mengunduh template Excel.',
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      await MasterPartsService.exportExcel();
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: 'Data master parts berhasil diekspor ke Excel.',
      });
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: 'Gagal mengekspor data master parts.',
      });
    }
  };

  return {
    parts,
    machines,
    page,
    setPage,
    limit,
    total,
    totalPages,
    searchQuery,
    setSearchQuery,
    selectedJenis,
    setSelectedJenis,
    isLoading,
    isUploading,
    isCommitting,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingPart,
    previewData,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCreatePart,
    handleUpdatePart,
    handleDeletePart,
    handleDeleteAllParts,
    handlePreviewImportFile,
    handleCommitImport,
    handleDownloadTemplate,
    handleExportExcel,
    fetchParts,
    toast,
    setToast,
  };
};
