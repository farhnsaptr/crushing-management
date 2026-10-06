import { useState, useEffect, useCallback } from 'react';
import { MixedMaterialsService } from '../services/mixedMaterials.service';
import { useDebounce } from '../../../hooks';
import type {
  MixedMaterial,
  MixedMaterialPayload,
  MixedMaterialMembersResponse,
} from '../types/mixedMaterials.types';
import type { ToastMessage } from '../../../components/common/Toast';
import { extractErrorMessage } from '../../../services/api.client';

export const useMixedMaterials = () => {
  const [items, setItems] = useState<MixedMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<MixedMaterial | null>(null);

  const [isMembersOpen, setIsMembersOpen] = useState<boolean>(false);
  const [membersData, setMembersData] = useState<MixedMaterialMembersResponse | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = (type: 'success' | 'error', message: string) =>
    setToast({ id: Date.now().toString(), type, message });

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await MixedMaterialsService.list(debouncedSearch));
    } catch (err: any) {
      notify('error', extractErrorMessage(err, 'Gagal memuat material campuran.'));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: MixedMaterial) => {
    setEditing(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: MixedMaterialPayload) => {
    try {
      if (editing) {
        await MixedMaterialsService.update(editing.id, payload);
        notify('success', 'Material campuran berhasil diperbarui.');
      } else {
        await MixedMaterialsService.create(payload);
        notify('success', 'Material campuran berhasil ditambahkan.');
      }
      setIsModalOpen(false);
      setEditing(null);
      fetchItems();
    } catch (err: any) {
      notify('error', extractErrorMessage(err, 'Gagal menyimpan material campuran.'));
      throw err;
    }
  };

  const handleDelete = async (item: MixedMaterial) => {
    const warn = item.members_count > 0 ? `\n\n${item.members_count} anggota akan dilepas dari campuran ini.` : '';
    if (!window.confirm(`Hapus material campuran "${item.mixed_name}"?${warn}`)) return;
    try {
      await MixedMaterialsService.remove(item.id);
      notify('success', 'Material campuran berhasil dihapus.');
      fetchItems();
    } catch (err: any) {
      notify('error', extractErrorMessage(err, 'Gagal menghapus material campuran.'));
    }
  };

  const viewMembers = async (item: MixedMaterial) => {
    setIsMembersOpen(true);
    setIsLoadingMembers(true);
    try {
      setMembersData(await MixedMaterialsService.getMembers(item.id));
    } catch {
      setMembersData(null);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const closeMembers = () => {
    setIsMembersOpen(false);
    setMembersData(null);
  };

  return {
    items,
    searchQuery,
    setSearchQuery,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editing,
    isMembersOpen,
    membersData,
    isLoadingMembers,
    toast,
    setToast,
    fetchItems,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
    viewMembers,
    closeMembers,
  };
};
