import { useState, useEffect, useCallback } from 'react';
import { DatabaseManagementService } from '../services/databaseManagement.service';
import { apiClient, extractErrorMessage } from '../../../services/api.client';
import type {
  DatabaseRequestHeader,
  DatabaseRequestDetailResponse,
  DatabaseRequestItem,
  ListRequestsFilter,
  DatabasePagination,
  DirectNgTransactionItem,
  DirectRunnerTransactionItem,
} from '../types/databaseManagement.types';

export function useDatabaseManagement() {
  const [activeTab, setActiveTab] = useState<'requests' | 'ng_transactions' | 'runner_transactions'>('requests');

  // Lookups
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [factories, setFactories] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [masterParts, setMasterParts] = useState<Array<{ id: string; part_number: string; part_name: string; sebango_code?: string; berat_part_gr: number; material: string }>>([]);
  const [materials, setMaterials] = useState<Array<{ id: string; material_name: string }>>([]);

  // ==========================
  // 1. REQUESTS STATE
  // ==========================
  const [requests, setRequests] = useState<DatabaseRequestHeader[]>([]);
  const [requestsPagination, setRequestsPagination] = useState<DatabasePagination>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [requestsFilter, setRequestsFilter] = useState<ListRequestsFilter>({
    page: 1,
    limit: 15,
    search: '',
    status: 'all',
    startDate: '',
    endDate: '',
    shift: '',
    departmentId: '',
    factoryId: '',
  });
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);

  // Selected Detail
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requestDetail, setRequestDetail] = useState<DatabaseRequestDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Modals for Requests
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isEditHeaderModalOpen, setIsEditHeaderModalOpen] = useState<boolean>(false);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<DatabaseRequestItem | null>(null);
  const [unapproveTarget, setUnapproveTarget] = useState<DatabaseRequestHeader | null>(null);
  const [deleteRequestTarget, setDeleteRequestTarget] = useState<DatabaseRequestHeader | null>(null);

  // ==========================
  // 2. NG TRANSACTIONS STATE
  // ==========================
  const [ngTransactions, setNgTransactions] = useState<DirectNgTransactionItem[]>([]);
  const [ngPagination, setNgPagination] = useState<DatabasePagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [ngFilter, setNgFilter] = useState({
    page: 1,
    limit: 20,
    search: '',
    startDate: '',
    endDate: '',
    shift: '',
    departmentId: '',
  });
  const [isLoadingNg, setIsLoadingNg] = useState<boolean>(false);
  const [editingNgTrx, setEditingNgTrx] = useState<DirectNgTransactionItem | null>(null);
  const [deleteNgTrxTarget, setDeleteNgTrxTarget] = useState<DirectNgTransactionItem | null>(null);

  // ==========================
  // 3. RUNNER TRANSACTIONS STATE
  // ==========================
  const [runnerTransactions, setRunnerTransactions] = useState<DirectRunnerTransactionItem[]>([]);
  const [runnerPagination, setRunnerPagination] = useState<DatabasePagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [runnerFilter, setRunnerFilter] = useState({
    page: 1,
    limit: 20,
    search: '',
    startDate: '',
    endDate: '',
    shift: '',
    departmentId: '',
  });
  const [isLoadingRunner, setIsLoadingRunner] = useState<boolean>(false);
  const [editingRunnerTrx, setEditingRunnerTrx] = useState<DirectRunnerTransactionItem | null>(null);
  const [deleteRunnerTrxTarget, setDeleteRunnerTrxTarget] = useState<DirectRunnerTransactionItem | null>(null);

  // Alert message
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load Lookups on mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [deptRes, factRes, partsRes, matsRes] = await Promise.allSettled([
          apiClient.get('/api/departments'),
          apiClient.get('/api/factories'),
          apiClient.get('/api/master-parts?limit=1000'),
          apiClient.get('/api/materials'),
        ]);

        if (deptRes.status === 'fulfilled') {
          setDepartments(deptRes.value.data.data || []);
        }
        if (factRes.status === 'fulfilled') {
          setFactories(factRes.value.data.data || []);
        }
        if (partsRes.status === 'fulfilled') {
          const raw = partsRes.value.data.data;
          const list = Array.isArray(raw) ? raw : Array.isArray(raw?.parts) ? raw.parts : [];
          setMasterParts(list);
        }
        if (matsRes.status === 'fulfilled') {
          const raw = matsRes.value.data.data;
          const list = Array.isArray(raw) ? raw : Array.isArray(raw?.materials) ? raw.materials : [];
          setMaterials(list);
        }
      } catch (err) {
        console.error('Failed to load lookups', err);
      }
    };
    loadLookups();
  }, []);

  // Fetch Requests
  const fetchRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    try {
      const res = await DatabaseManagementService.getRequests(requestsFilter);
      setRequests(res.requests);
      setRequestsPagination(res.pagination);
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal memuat daftar tiket'));
    } finally {
      setIsLoadingRequests(false);
    }
  }, [requestsFilter]);

  // Fetch Request Detail
  const fetchRequestDetail = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await DatabaseManagementService.getRequestDetail(id);
      setRequestDetail(res);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal memuat detail tiket'));
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // Fetch NG Transactions
  const fetchNgTransactions = useCallback(async () => {
    setIsLoadingNg(true);
    try {
      const res = await DatabaseManagementService.getNgTransactions(ngFilter);
      setNgTransactions(res.transactions);
      setNgPagination(res.pagination);
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal memuat transaksi Part NG'));
    } finally {
      setIsLoadingNg(false);
    }
  }, [ngFilter]);

  // Fetch Runner Transactions
  const fetchRunnerTransactions = useCallback(async () => {
    setIsLoadingRunner(true);
    try {
      const res = await DatabaseManagementService.getRunnerTransactions(runnerFilter);
      setRunnerTransactions(res.transactions);
      setRunnerPagination(res.pagination);
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal memuat transaksi Runner'));
    } finally {
      setIsLoadingRunner(false);
    }
  }, [runnerFilter]);

  // Trigger fetch based on tab
  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    } else if (activeTab === 'ng_transactions') {
      fetchNgTransactions();
    } else if (activeTab === 'runner_transactions') {
      fetchRunnerTransactions();
    }
  }, [activeTab, fetchRequests, fetchNgTransactions, fetchRunnerTransactions]);

  // ==========================
  // ACTION HANDLERS
  // ==========================

  // Open detail drawer
  const handleOpenDetail = (reqId: string) => {
    setSelectedRequestId(reqId);
    fetchRequestDetail(reqId);
  };

  // Unapprove request
  const handleConfirmUnapprove = async (reason?: string) => {
    if (!unapproveTarget) return;
    try {
      const res = await DatabaseManagementService.unapproveRequest(unapproveTarget.id, reason);
      showNotification('success', res.message);
      setUnapproveTarget(null);
      fetchRequests();
      if (selectedRequestId === unapproveTarget.id) {
        fetchRequestDetail(unapproveTarget.id);
      }
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal membatalkan approval tiket'));
    }
  };

  // Delete entire request
  const handleConfirmDeleteRequest = async () => {
    if (!deleteRequestTarget) return;
    try {
      const res = await DatabaseManagementService.deleteRequest(deleteRequestTarget.id);
      showNotification('success', res.message);
      setDeleteRequestTarget(null);
      setIsDetailModalOpen(false);
      setRequestDetail(null);
      fetchRequests();
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal menghapus tiket'));
    }
  };

  // Update request header
  const handleUpdateHeader = async (payload: {
    request_date?: string;
    shift?: 'Pagi' | 'Malam';
    department_id?: string;
    factory_id?: string | null;
    notes?: string | null;
  }) => {
    if (!requestDetail) return;
    try {
      const res = await DatabaseManagementService.updateRequestHeader(requestDetail.request.id, payload);
      showNotification('success', res.message);
      setIsEditHeaderModalOpen(false);
      fetchRequests();
      fetchRequestDetail(requestDetail.request.id);
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal memperbarui info tiket'));
    }
  };

  // Add part to request
  const handleAddPart = async (payload: {
    item_type: 'part_ng' | 'runner_ng';
    master_part_id?: string;
    material_id?: string;
    quantity_pcs?: number;
    weight_kg?: number;
    notes?: string;
  }) => {
    if (!requestDetail) return;
    try {
      const res = await DatabaseManagementService.addItemToRequest(requestDetail.request.id, payload);
      showNotification('success', res.message);
      setIsAddPartModalOpen(false);
      fetchRequests();
      fetchRequestDetail(requestDetail.request.id);
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal menambahkan part ke tiket'));
    }
  };

  // Add multiple parts (batch) to request
  const handleAddBatchParts = async (
    items: Array<{
      item_type: 'part_ng' | 'runner_ng';
      master_part_id?: string;
      material_id?: string;
      quantity_pcs?: number;
      weight_kg?: number;
      notes?: string;
    }>
  ) => {
    if (!requestDetail) return;
    try {
      const res = await DatabaseManagementService.addItemsBatchToRequest(requestDetail.request.id, items);
      showNotification('success', res.message);
      setIsAddPartModalOpen(false);
      fetchRequests();
      fetchRequestDetail(requestDetail.request.id);
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal menambahkan kumpulan part ke tiket'));
    }
  };

  // Update part item
  const handleUpdateItem = async (
    itemId: string,
    payload: {
      quantity_pcs?: number;
      weight_kg?: number;
      verified_quantity_pcs?: number;
      verified_weight_kg?: number;
      adjustment_notes?: string | null;
      waste_quantity_pcs?: number;
      notes?: string | null;
    }
  ) => {
    if (!requestDetail) return;
    try {
      const res = await DatabaseManagementService.updateRequestItem(requestDetail.request.id, itemId, payload);
      showNotification('success', res.message);
      setEditingItem(null);
      fetchRequests();
      fetchRequestDetail(requestDetail.request.id);
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal memperbarui item tiket'));
    }
  };

  // Delete part item
  const handleDeleteItem = async (itemId: string) => {
    if (!requestDetail) return;
    if (!window.confirm('Yakin ingin menghapus part ini dari tiket?')) return;
    try {
      const res = await DatabaseManagementService.deleteRequestItem(requestDetail.request.id, itemId);
      showNotification('success', res.message);
      fetchRequests();
      fetchRequestDetail(requestDetail.request.id);
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal menghapus item dari tiket'));
    }
  };

  // Edit direct NG transaction
  const handleUpdateNgTrx = async (
    id: string,
    payload: {
      quantity_pcs?: number;
      shift?: 'Pagi' | 'Malam';
      transaction_date?: string;
      recycle_type_snapshot?: 'reuse' | 'no_reuse';
      notes?: string;
    }
  ) => {
    try {
      const res = await DatabaseManagementService.updateNgTransaction(id, payload);
      showNotification('success', res.message);
      setEditingNgTrx(null);
      fetchNgTransactions();
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal memperbarui transaksi Part NG'));
    }
  };

  // Delete direct NG transaction
  const handleDeleteNgTrx = async () => {
    if (!deleteNgTrxTarget) return;
    try {
      const res = await DatabaseManagementService.deleteNgTransaction(deleteNgTrxTarget.id);
      showNotification('success', res.message);
      setDeleteNgTrxTarget(null);
      fetchNgTransactions();
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal menghapus transaksi Part NG'));
    }
  };

  // Edit direct Runner transaction
  const handleUpdateRunnerTrx = async (
    id: string,
    payload: {
      total_runner_weight_kg?: number;
      total_pcs?: number;
      shift?: 'Pagi' | 'Malam';
      transaction_date?: string;
    }
  ) => {
    try {
      const res = await DatabaseManagementService.updateRunnerTransaction(id, payload);
      showNotification('success', res.message);
      setEditingRunnerTrx(null);
      fetchRunnerTransactions();
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal memperbarui transaksi Runner'));
    }
  };

  // Delete direct Runner transaction
  const handleDeleteRunnerTrx = async () => {
    if (!deleteRunnerTrxTarget) return;
    try {
      const res = await DatabaseManagementService.deleteRunnerTransaction(deleteRunnerTrxTarget.id);
      showNotification('success', res.message);
      setDeleteRunnerTrxTarget(null);
      fetchRunnerTransactions();
    } catch (err: any) {
      showNotification('error', extractErrorMessage(err, 'Gagal menghapus transaksi Runner'));
    }
  };

  return {
    activeTab,
    setActiveTab,
    departments,
    factories,
    masterParts,
    materials,
    notification,

    // Requests
    requests,
    requestsPagination,
    requestsFilter,
    setRequestsFilter,
    isLoadingRequests,
    fetchRequests,

    // Detail & Modals
    selectedRequestId,
    requestDetail,
    isLoadingDetail,
    isDetailModalOpen,
    setIsDetailModalOpen,
    handleOpenDetail,
    isEditHeaderModalOpen,
    setIsEditHeaderModalOpen,
    handleUpdateHeader,
    isAddPartModalOpen,
    setIsAddPartModalOpen,
    handleAddPart,
    handleAddBatchParts,
    editingItem,
    setEditingItem,
    handleUpdateItem,
    handleDeleteItem,

    // Unapprove & Delete Request
    unapproveTarget,
    setUnapproveTarget,
    handleConfirmUnapprove,
    deleteRequestTarget,
    setDeleteRequestTarget,
    handleConfirmDeleteRequest,

    // NG Transactions
    ngTransactions,
    ngPagination,
    ngFilter,
    setNgFilter,
    isLoadingNg,
    fetchNgTransactions,
    editingNgTrx,
    setEditingNgTrx,
    handleUpdateNgTrx,
    deleteNgTrxTarget,
    setDeleteNgTrxTarget,
    handleDeleteNgTrx,

    // Runner Transactions
    runnerTransactions,
    runnerPagination,
    runnerFilter,
    setRunnerFilter,
    isLoadingRunner,
    fetchRunnerTransactions,
    editingRunnerTrx,
    setEditingRunnerTrx,
    handleUpdateRunnerTrx,
    deleteRunnerTrxTarget,
    setDeleteRunnerTrxTarget,
    handleDeleteRunnerTrx,
  };
}
