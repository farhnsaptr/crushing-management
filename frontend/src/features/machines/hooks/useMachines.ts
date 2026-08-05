import { useState, useEffect } from 'react';
import { MachinesService } from '../services/machines.service';
import { FactoriesService } from '../../factories/services/factories.service';
import type { Machine, CreateMachinePayload, UpdateMachinePayload } from '../types/machines.types';
import type { Factory } from '../../factories/types/factories.types';
import type { ToastMessage } from '../../../components/common/Toast';

export const useMachines = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [machinesData, factoriesData] = await Promise.all([
        MachinesService.getMachines(),
        FactoriesService.getFactories(),
      ]);
      setMachines(machinesData || []);
      setFactories(factoriesData || []);
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal memuat data mesin dan pabrik.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingMachine(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (machine: Machine) => {
    setEditingMachine(machine);
    setIsModalOpen(true);
  };

  const handleCreateMachine = async (payload: CreateMachinePayload) => {
    try {
      await MachinesService.createMachine(payload);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Data mesin berhasil ditambahkan.',
      });
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menambahkan data mesin.',
      });
    }
  };

  const handleUpdateMachine = async (id: string, payload: UpdateMachinePayload) => {
    try {
      await MachinesService.updateMachine(id, payload);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Data mesin berhasil diperbarui.',
      });
      setIsModalOpen(false);
      setEditingMachine(null);
      fetchInitialData();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal memperbarui data mesin.',
      });
    }
  };

  const handleDeleteMachine = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus mesin ini? Seluruh data relasi master parts & transaksi terkait dapat terpengaruh.')) {
      return;
    }

    try {
      await MachinesService.deleteMachine(id);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Data mesin berhasil dihapus.',
      });
      fetchInitialData();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus data mesin.',
      });
    }
  };

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.type && m.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.tonnage && m.tonnage.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFactory =
      selectedFactoryId === 'all' || m.factory_id === selectedFactoryId;

    const matchesStatus =
      selectedStatus === 'all' || m.status === selectedStatus;

    return matchesSearch && matchesFactory && matchesStatus;
  });

  const activeCount = machines.filter((m) => m.status === 'active').length;
  const inactiveCount = machines.filter((m) => m.status === 'inactive').length;

  return {
    machines: filteredMachines,
    factories,
    rawCount: machines.length,
    activeCount,
    inactiveCount,
    searchQuery,
    setSearchQuery,
    selectedFactoryId,
    setSelectedFactoryId,
    selectedStatus,
    setSelectedStatus,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingMachine,
    handleOpenCreateModal,
    handleOpenEditModal,
    toast,
    setToast,
    fetchInitialData,
    handleCreateMachine,
    handleUpdateMachine,
    handleDeleteMachine,
  };
};
