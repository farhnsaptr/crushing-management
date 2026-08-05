import { useState, useEffect } from 'react';
import { FactoriesService } from '../services/factories.service';
import type { Factory, CreateFactoryPayload, UpdateFactoryPayload } from '../types/factories.types';
import type { ToastMessage } from '../../../components/common/Toast';

export const useFactories = () => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingFactory, setEditingFactory] = useState<Factory | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchFactories = async () => {
    setIsLoading(true);
    try {
      const data = await FactoriesService.getFactories();
      setFactories(data || []);
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal memuat daftar pabrik.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFactories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingFactory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (factory: Factory) => {
    setEditingFactory(factory);
    setIsModalOpen(true);
  };

  const handleCreateFactory = async (payload: CreateFactoryPayload) => {
    try {
      await FactoriesService.createFactory(payload);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Data pabrik berhasil ditambahkan.',
      });
      setIsModalOpen(false);
      fetchFactories();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menambahkan data pabrik.',
      });
    }
  };

  const handleUpdateFactory = async (id: string, payload: UpdateFactoryPayload) => {
    try {
      await FactoriesService.updateFactory(id, payload);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Data pabrik berhasil diperbarui.',
      });
      setIsModalOpen(false);
      setEditingFactory(null);
      fetchFactories();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal memperbarui data pabrik.',
      });
    }
  };

  const handleDeleteFactory = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pabrik ini? Seluruh data relasi mesin & part terkait dapat terpengaruh.')) {
      return;
    }

    try {
      await FactoriesService.deleteFactory(id);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Data pabrik berhasil dihapus.',
      });
      fetchFactories();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus data pabrik.',
      });
    }
  };

  const filteredFactories = factories.filter(
    (f) =>
      f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.location && f.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return {
    factories: filteredFactories,
    rawCount: factories.length,
    searchQuery,
    setSearchQuery,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingFactory,
    handleOpenCreateModal,
    handleOpenEditModal,
    toast,
    setToast,
    fetchFactories,
    handleCreateFactory,
    handleUpdateFactory,
    handleDeleteFactory,
  };
};
