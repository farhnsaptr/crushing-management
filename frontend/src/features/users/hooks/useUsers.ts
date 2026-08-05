import { useState, useEffect } from 'react';
import { UsersService } from '../services/users.service';
import type { User, CreateUserPayload, UpdateUserPayload } from '../types/users.types';
import type { ToastMessage } from '../../../components/common/Toast';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await UsersService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal memuat daftar pengguna.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCreateUser = async (payload: CreateUserPayload) => {
    try {
      await UsersService.createUser(payload);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Pengguna baru berhasil ditambahkan.',
      });
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menambahkan pengguna.',
      });
    }
  };

  const handleUpdateUser = async (id: string, payload: UpdateUserPayload) => {
    try {
      await UsersService.updateUser(id, payload);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Data pengguna berhasil diperbarui.',
      });
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal memperbarui pengguna.',
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await UsersService.toggleUserStatus(id, !currentStatus);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: `Status pengguna berhasil diubah ke ${!currentStatus ? 'Aktif' : 'Non-Aktif'}.`,
      });
      fetchUsers();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal mengubah status pengguna.',
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
    try {
      await UsersService.deleteUser(id);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Pengguna berhasil dihapus.',
      });
      fetchUsers();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus pengguna.',
      });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    users: filteredUsers,
    searchQuery,
    setSearchQuery,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingUser,
    handleOpenCreateModal,
    handleOpenEditModal,
    toast,
    setToast,
    fetchUsers,
    handleCreateUser,
    handleUpdateUser,
    handleToggleStatus,
    handleDeleteUser,
  };
};
