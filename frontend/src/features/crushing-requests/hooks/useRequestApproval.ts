import { useState, useEffect, useCallback } from 'react';
import { CrushingRequestsService } from '../services/crushingRequests.service';
import { DepartmentsService } from '../../departments/services/departments.service';
import { useDebounce } from '../../../hooks';
import type { CrushingRequest } from '../types/crushingRequests.types';
import type { Department } from '../../departments/types/departments.types';
import type { ToastState } from '../../../components/common/Toast';

export function useRequestApproval() {
  const [requests, setRequests] = useState<CrushingRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
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

  // Reject Prompt Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');

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
        message: err.response?.data?.message || err.message || 'Gagal memuat daftar verifikasi permintaan',
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
        message: err.response?.data?.message || err.message || 'Gagal mengambil detail tiket',
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleApprove = async (requestId: string, notes?: string) => {
    setIsActionLoading(true);
    try {
      const approved = await CrushingRequestsService.approveRequest(requestId, notes);
      setToast({
        type: 'success',
        message: `Tiket '${approved.request_number}' berhasil disetujui & disinkronkan ke database transaksi!`,
      });
      setIsDetailModalOpen(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Gagal menyetujui tiket',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenRejectModal = (req: CrushingRequest) => {
    setSelectedRequest(req);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      setToast({ type: 'error', message: 'Silakan isi alasan penolakan tiket.' });
      return;
    }

    setIsActionLoading(true);
    try {
      await CrushingRequestsService.rejectRequest(selectedRequest.id, rejectionReason.trim());
      setToast({
        type: 'info',
        message: `Tiket '${selectedRequest.request_number}' telah ditolak.`,
      });
      setIsRejectModalOpen(false);
      setIsDetailModalOpen(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Gagal menolak tiket',
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
    isRejectModalOpen,
    setIsRejectModalOpen,
    rejectionReason,
    setRejectionReason,
    handleOpenRejectModal,
    handleConfirmReject,
    fetchRequests,
    toast,
    setToast,
  };
}
