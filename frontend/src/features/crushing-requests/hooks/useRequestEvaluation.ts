import { useState, useEffect, useCallback } from 'react';
import { CrushingRequestsService } from '../services/crushingRequests.service';
import { DepartmentsService } from '../../departments/services/departments.service';
import { FactoriesService } from '../../factories/services/factories.service';
import { getDefaultDateString, getDefaultShift } from '../../../config/shift.config';
import { useDebounce } from '../../../hooks';
import type {
  SenderEvaluationItem,
  SenderEvaluationResponse,
  CrushingRequest,
} from '../types/crushingRequests.types';
import type { Department } from '../../departments/types/departments.types';
import type { Factory } from '../../factories/types/factories.types';
import type { ToastState } from '../../../components/common/Toast';
import { extractErrorMessage } from '../../../services/api.client';

export function useRequestEvaluation() {
  const [date, setDate] = useState<string>(getDefaultDateString());
  const [shift, setShift] = useState<'Pagi' | 'Malam' | 'all'>(getDefaultShift());
  const [departmentId, setDepartmentId] = useState<string>('');
  const [factoryId, setFactoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [evaluationData, setEvaluationData] = useState<SenderEvaluationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Level 2: Selected sender modal
  const [selectedSender, setSelectedSender] = useState<SenderEvaluationItem | null>(null);
  const [isSenderModalOpen, setIsSenderModalOpen] = useState<boolean>(false);
  const [senderRequests, setSenderRequests] = useState<CrushingRequest[]>([]);
  const [isLoadingSenderRequests, setIsLoadingSenderRequests] = useState<boolean>(false);

  // Level 3: Request detail modal (parts breakdown)
  const [selectedRequest, setSelectedRequest] = useState<CrushingRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Load departments & factories
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [depts, facts] = await Promise.all([
          DepartmentsService.listDepartments(),
          FactoriesService.getFactories(),
        ]);
        setDepartments(depts || []);
        setFactories(facts || []);
      } catch (err) {
        console.error('Failed to load master data for evaluation:', err);
      }
    }
    loadMasterData();
  }, []);

  // Fetch evaluation summary
  const fetchEvaluation = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await CrushingRequestsService.getEvaluation({
        date,
        shift: shift === 'all' ? undefined : shift,
        department_id: departmentId || undefined,
        factory_id: factoryId || undefined,
        search: debouncedSearchQuery || undefined,
      });
      setEvaluationData(data);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: extractErrorMessage(err, 'Gagal memuat data evaluasi pengirim'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [date, shift, departmentId, factoryId, debouncedSearchQuery]);

  useEffect(() => {
    fetchEvaluation();
  }, [fetchEvaluation]);

  // Open sender request tickets modal (Level 2)
  const handleOpenSenderModal = async (sender: SenderEvaluationItem) => {
    setSelectedSender(sender);
    setIsSenderModalOpen(true);
    setIsLoadingSenderRequests(true);
    try {
      const res = await CrushingRequestsService.listRequests({
        sender_id: sender.user_id,
        startDate: date,
        endDate: date,
        shift: shift === 'all' ? undefined : shift,
        limit: 100,
      });
      setSenderRequests(res.requests || []);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: extractErrorMessage(err, 'Gagal memuat rincian pengajuan pengirim'),
      });
    } finally {
      setIsLoadingSenderRequests(false);
    }
  };

  const handleCloseSenderModal = () => {
    setIsSenderModalOpen(false);
    setSelectedSender(null);
    setSenderRequests([]);
  };

  // Open specific request part breakdown modal (Level 3)
  const handleOpenDetailModal = async (req: CrushingRequest) => {
    setSelectedRequest(req);
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    try {
      const fullReq = await CrushingRequestsService.getRequestById(req.id);
      setSelectedRequest(fullReq);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: extractErrorMessage(err, 'Gagal memuat detail item pengajuan'),
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
  };

  return {
    date,
    setDate,
    shift,
    setShift,
    departmentId,
    setDepartmentId,
    factoryId,
    setFactoryId,
    searchQuery,
    setSearchQuery,
    departments,
    factories,
    evaluationData,
    isLoading,
    toast,
    setToast,
    fetchEvaluation,
    // Level 2
    selectedSender,
    isSenderModalOpen,
    senderRequests,
    isLoadingSenderRequests,
    handleOpenSenderModal,
    handleCloseSenderModal,
    // Level 3
    selectedRequest,
    isDetailModalOpen,
    isLoadingDetail,
    handleOpenDetailModal,
    handleCloseDetailModal,
  };
}
