import { useState, useEffect, useCallback } from 'react';
import { MaterialsService } from '../services/materials.service';
import { useDebounce } from '../../../hooks';
import type { Material, CreateMaterialPayload } from '../types/materials.types';
import type { ToastMessage } from '../../../components/common/Toast';

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await MaterialsService.getMaterials(page, limit, debouncedSearchQuery);
      setMaterials(res.materials || []);
      setTotal(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal memuat data master material.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearchQuery]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleOpenCreateModal = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (material: Material) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleCreateMaterial = async (payload: CreateMaterialPayload) => {
    try {
      await MaterialsService.createMaterial(payload);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Master material berhasil ditambahkan.',
      });
      setIsModalOpen(false);
      fetchMaterials();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menambahkan master material.',
      });
    }
  };

  const handleUpdateMaterial = async (id: string, payload: Partial<CreateMaterialPayload>) => {
    try {
      await MaterialsService.updateMaterial(id, payload);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Master material berhasil diperbarui.',
      });
      setIsModalOpen(false);
      setEditingMaterial(null);
      fetchMaterials();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal memperbarui master material.',
      });
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data material ini?')) {
      return;
    }

    try {
      await MaterialsService.deleteMaterial(id);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Master material berhasil dihapus.',
      });
      fetchMaterials();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus master material.',
      });
    }
  };

  const handleDeleteAllMaterials = async () => {
    if (
      !window.confirm(
        'PERINGATAN SUPER-ADMIN!\n\nApakah Anda yakin ingin menghapus SELURUH data material dari database? Tindakan ini tidak dapat dibatalkan.'
      )
    ) {
      return;
    }

    try {
      await MaterialsService.deleteAllMaterials();
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Seluruh data master material berhasil dihapus dari database.',
      });
      fetchMaterials();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus seluruh data material.',
      });
    }
  };

  return {
    materials,
    page,
    setPage,
    limit,
    total,
    totalPages,
    searchQuery,
    setSearchQuery,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingMaterial,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCreateMaterial,
    handleUpdateMaterial,
    handleDeleteMaterial,
    handleDeleteAllMaterials,
    fetchMaterials,
    toast,
    setToast,
  };
};
