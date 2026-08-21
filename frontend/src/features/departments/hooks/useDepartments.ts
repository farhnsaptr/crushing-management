import { useState, useEffect, useCallback } from 'react';
import { DepartmentsService } from '../services/departments.service';
import type { Department, CreateDepartmentPayload, UpdateDepartmentPayload } from '../types/departments.types';
import type { ToastState } from '../../../components/common/Toast';

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await DepartmentsService.listDepartments();
      setDepartments(data);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Gagal memuat data departemen',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleOpenCreateModal = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleCreateDepartment = async (payload: CreateDepartmentPayload) => {
    try {
      await DepartmentsService.createDepartment(payload);
      setToast({
        type: 'success',
        message: `Departemen '${payload.name}' berhasil ditambahkan`,
      });
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Gagal menambahkan departemen');
    }
  };

  const handleUpdateDepartment = async (id: string, payload: UpdateDepartmentPayload) => {
    try {
      await DepartmentsService.updateDepartment(id, payload);
      setToast({
        type: 'success',
        message: 'Departemen berhasil diperbarui',
      });
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Gagal memperbarui departemen');
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus departemen '${name}'?`)) {
      return;
    }

    try {
      await DepartmentsService.deleteDepartment(id);
      setToast({
        type: 'success',
        message: `Departemen '${name}' berhasil dihapus`,
      });
      fetchDepartments();
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Gagal menghapus departemen',
      });
    }
  };

  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return {
    departments: filteredDepartments,
    rawCount: departments.length,
    isLoading,
    searchQuery,
    setSearchQuery,
    isModalOpen,
    setIsModalOpen,
    editingDepartment,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCreateDepartment,
    handleUpdateDepartment,
    handleDeleteDepartment,
    fetchDepartments,
    toast,
    setToast,
  };
}
