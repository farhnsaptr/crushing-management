import { useState, useEffect, useCallback } from 'react';
import { CrushingRequestsService } from '../services/crushingRequests.service';
import { DepartmentsService } from '../../departments/services/departments.service';
import { useDebounce } from '../../../hooks';
import type { CrushingRequest, ApproveCrushingRequestPayload } from '../types/crushingRequests.types';
import type { Department } from '../../departments/types/departments.types';
import type { ToastState } from '../../../components/common/Toast';

export function useRequestApproval() {
  const [requests, setRequests] = useState<CrushingRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Review & Action Modal
  const [selectedRequest, setSelectedRequest] = useState<CrushingRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const [toast, setToast] = useState<ToastState | null>(null);

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await DepartmentsService.listDepartments();
      setDepartments(data || []);
    } catch (err: any) {
      console.error('Failed to load departments:', err);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await CrushingRequestsService.listRequests({
        status: statusFilter,
        department_id: selectedDeptId || undefined,
        search: debouncedSearchQuery || undefined,
        page,
        limit,
      });
      setRequests(res.requests);
      setTotalRecords(res.pagination.total);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Gagal memuat daftar verifikasi pengiriman',
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, selectedDeptId, debouncedSearchQuery, page, limit]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleOpenDetailModal = async (req: CrushingRequest) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    try {
      const full = await CrushingRequestsService.getRequestById(req.id);
      setSelectedRequest(full);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Gagal mengambil detail pengiriman',
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleApprove = async (requestId: string, payload?: ApproveCrushingRequestPayload) => {
    setIsActionLoading(true);
    try {
      const approved = await CrushingRequestsService.approveRequest(requestId, payload);
      setToast({
        type: 'success',
        message: `Pengiriman '${approved.request_number}' berhasil diverifikasi & disinkronkan ke transaksi crushing!`,
      });
      setIsDetailModalOpen(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Gagal memverifikasi pengiriman',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    requests,
    departments,
    statusFilter,
    setStatusFilter,
    selectedDeptId,
    setSelectedDeptId,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    limit,
    totalRecords,
    isLoading,
    selectedRequest,
    isDetailModalOpen,
    setIsDetailModalOpen,
    isLoadingDetail,
    isActionLoading,
    handleOpenDetailModal,
    handleApprove,
    fetchRequests,
    toast,
    setToast,
  };
}
