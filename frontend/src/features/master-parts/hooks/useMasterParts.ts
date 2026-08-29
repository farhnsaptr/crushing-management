import { useState, useEffect, useCallback } from 'react';
import { MasterPartsService } from '../services/masterParts.service';
import { MachinesService } from '../../machines/services/machines.service';
import { useDebounce } from '../../../hooks';
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
  const [jenisList, setJenisList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [selectedJenis, setSelectedJenis] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);

  // Selection & Image Draft State
  const [selectedPart, setSelectedPart] = useState<MasterPart | null>(null);
  const [draftImagePreview, setDraftImagePreview] = useState<string | null>(null);
  const [draftImagePayload, setDraftImagePayload] = useState<Blob | File | null>(null);
  const [isSubmittingImage, setIsSubmittingImage] = useState<boolean>(false);

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);

  const [editingPart, setEditingPart] = useState<MasterPart | null>(null);
  const [detailPart, setDetailPart] = useState<MasterPart | null>(null);

  // Preview Import Result
  const [previewData, setPreviewData] = useState<ImportPreviewResult | null>(null);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchParts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await MasterPartsService.getParts(page, limit, debouncedSearchQuery, selectedJenis, sortBy, sortOrder);
      const fetchedParts = res.parts || [];
      setParts(fetchedParts);
      setTotal(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 1);

      // Auto-select first item if current selectedPart is null or no longer in page
      if (fetchedParts.length > 0) {
        setSelectedPart((prev) => {
          if (!prev) return fetchedParts[0];
          const exists = fetchedParts.find((p: MasterPart) => p.id === prev.id);
          return exists || fetchedParts[0];
        });
      } else {
        setSelectedPart(null);
      }
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal memuat data master parts.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearchQuery, selectedJenis, sortBy, sortOrder]);

  const handleSelectPart = (part: MasterPart) => {
    setSelectedPart(part);
    setDraftImagePreview(null);
    setDraftImagePayload(null);
  };

  const handleOpenDetailModal = (part: MasterPart) => {
    setDetailPart(part);
    setIsDetailModalOpen(true);
  };

  const handleCaptureImage = async (dataUrl: string) => {
    if (!selectedPart) return;
    setDraftImagePreview(dataUrl);
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      setDraftImagePayload(blob);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: 'Foto berhasil diambil. Periksa pratinjau dan klik "Submit Foto" untuk mengompres & mengunggah ke S3.',
      });
    } catch (err) {
      console.error('Failed to create blob from camera dataUrl', err);
    }
  };

  const handleSelectImageFile = (file: File) => {
    if (!selectedPart) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDraftImagePreview(reader.result as string);
      setDraftImagePayload(file);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: `Foto ${file.name} dipilih. Klik "Submit Foto" untuk mengompres & mengunggah ke S3.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDraftImage = async () => {
    if (!selectedPart || !draftImagePayload) return;
    setIsSubmittingImage(true);
    try {
      const updatedPart = await MasterPartsService.uploadPartImage(selectedPart.id, draftImagePayload);
      setSelectedPart(updatedPart);
      setDraftImagePreview(null);
      setDraftImagePayload(null);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Foto berhasil dikompresi & disimpan',
      });
      fetchParts();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal mengompresi dan mengunggah foto.',
      });
    } finally {
      setIsSubmittingImage(false);
    }
  };

  const handleCancelDraftImage = () => {
    setDraftImagePreview(null);
    setDraftImagePayload(null);
    setToast({
      id: Date.now().toString(),
      type: 'info',
      message: 'Pratinjau foto draft dibatalkan.',
    });
  };

  const [isDeletingImage, setIsDeletingImage] = useState<boolean>(false);

  const handleDeleteImage = async () => {
    if (!selectedPart || !selectedPart.image_url) return;

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus foto untuk part "${selectedPart.part_name}" (${selectedPart.part_number}) dari MinIO S3?`
    );
    if (!confirmed) return;

    setIsDeletingImage(true);
    try {
      const updatedPart = await MasterPartsService.deletePartImage(selectedPart.id);
      setSelectedPart(updatedPart);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Foto master part berhasil dihapus',
      });
      fetchParts();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus foto master part.',
      });
    } finally {
      setIsDeletingImage(false);
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

  const handleSort = (field: string) => {
    if (sortBy === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortBy('');
        setSortOrder('asc');
      }
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const fetchJenisList = async () => {
    try {
      const data = await MasterPartsService.getJenisList();
      setJenisList(data || []);
    } catch (err) {
      console.warn('Failed to load jenis list', err);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  useEffect(() => {
    fetchMachines();
    fetchJenisList();
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
    jenisList,
    sortBy,
    sortOrder,
    handleSort,
    isLoading,
    isUploading,
    isCommitting,
    selectedPart,
    draftImagePreview,
    isSubmittingImage,
    isDeletingImage,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    isCameraModalOpen,
    setIsCameraModalOpen,
    editingPart,
    detailPart,
    previewData,
    handleSelectPart,
    handleOpenDetailModal,
    handleCaptureImage,
    handleSelectImageFile,
    handleSubmitDraftImage,
    handleCancelDraftImage,
    handleDeleteImage,
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
