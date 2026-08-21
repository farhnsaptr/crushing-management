import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { CrushingRequestsService } from '../services/crushingRequests.service';
import { MasterPartsService } from '../../master-parts/services/masterParts.service';
import { MaterialsService } from '../../materials/services/materials.service';
import type { CrushingRequest, CreateRequestItemPayload } from '../types/crushingRequests.types';
import type { MasterPart } from '../../master-parts/types/masterParts.types';
import type { Material } from '../../materials/types/materials.types';
import type { ToastState } from '../../../components/common/Toast';
import { getAutoShiftAndDate } from '../../../config/shift.config';

export function useCrushingRequests() {
  const { user } = useAuth();

  // Tab State: 'create' vs 'history'
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Form State initialized automatically from current time/date (8 PM to 7 AM is Malam)
  const initialAuto = useMemo(() => getAutoShiftAndDate(), []);
  const [shift, setShift] = useState<'Pagi' | 'Malam'>(initialAuto.shift);
  const [requestDate, setRequestDate] = useState<string>(initialAuto.date);
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<CreateRequestItemPayload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);

  // Item Draft State (for adding item to request list)
  const [itemType, setItemType] = useState<'part_ng' | 'runner_ng'>('part_ng');
  const [selectedPart, setSelectedPart] = useState<MasterPart | null>(null);
  const [partQuantityPcs, setPartQuantityPcs] = useState<number | ''>(1);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [runnerWeightKg, setRunnerWeightKg] = useState<number | ''>('');
  const [itemNotes, setItemNotes] = useState<string>('');

  // Lookup Data & Filtering (filtered by sender's factory)
  const [availableParts, setAvailableParts] = useState<MasterPart[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [jenisOptions, setJenisOptions] = useState<string[]>([]);
  const [selectedJenis, setSelectedJenis] = useState<string>('ALL');
  const [isLoadingParts, setIsLoadingParts] = useState<boolean>(false);
  const [partSearchQuery, setPartSearchQuery] = useState<string>('');

  // History State
  const [historyRequests, setHistoryRequests] = useState<CrushingRequest[]>([]);
  const [historyTotal, setHistoryTotal] = useState<number>(0);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [historyLimit] = useState<number>(10);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Detail Modal State
  const [selectedRequestDetail, setSelectedRequestDetail] = useState<CrushingRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null);

  // Ref to track draft auto-save debounce timer
  const saveDraftTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Draft from Server (Redis) on mount / user load
  const fetchServerDraft = useCallback(async () => {
    if (!user?.id) return;
    try {
      const serverDraft = await CrushingRequestsService.getDraft();
      if (serverDraft) {
        if (serverDraft.shift === 'Pagi' || serverDraft.shift === 'Malam') {
          setShift(serverDraft.shift);
        }
        if (serverDraft.requestDate) {
          setRequestDate(serverDraft.requestDate);
        }
        if (typeof serverDraft.notes === 'string') {
          setNotes(serverDraft.notes);
        }
        if (Array.isArray(serverDraft.items) && serverDraft.items.length > 0) {
          setItems(serverDraft.items);
        }
      }
    } catch (err) {
      console.warn('Failed to load draft from Redis:', err);
    } finally {
      setIsDraftLoaded(true);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchServerDraft();
  }, [fetchServerDraft]);

  // 2. Automatically sync draft state to Server (Redis) with debounce
  useEffect(() => {
    if (!user?.id || !isDraftLoaded) return;

    if (saveDraftTimerRef.current) {
      clearTimeout(saveDraftTimerRef.current);
    }

    saveDraftTimerRef.current = setTimeout(async () => {
      try {
        if (items.length > 0 || notes.trim() !== '' || shift !== 'Pagi') {
          setIsSavingDraft(true);
          await CrushingRequestsService.saveDraft({
            shift,
            requestDate,
            notes,
            items,
            savedAt: new Date().toISOString(),
          });
        } else {
          await CrushingRequestsService.deleteDraft();
        }
      } catch (err) {
        console.warn('Failed to sync draft to Redis server:', err);
      } finally {
        setIsSavingDraft(false);
      }
    }, 600); // 600ms debounce

    return () => {
      if (saveDraftTimerRef.current) {
        clearTimeout(saveDraftTimerRef.current);
      }
    };
  }, [user?.id, isDraftLoaded, shift, requestDate, notes, items]);

  // Fetch Parts locked to sender's assigned factory
  const fetchParts = useCallback(async () => {
    setIsLoadingParts(true);
    try {
      const factoryId = user?.factory_id || undefined;
      const res = await MasterPartsService.getParts(1, 300, '', '', '', 'asc', factoryId);
      setAvailableParts(res.parts || []);
    } catch (err: any) {
      console.error('Failed to load parts for sender:', err);
    } finally {
      setIsLoadingParts(false);
    }
  }, [user?.factory_id]);

  // Fetch Jenis Part List
  const fetchJenisList = useCallback(async () => {
    try {
      const list = await MasterPartsService.getJenisList();
      setJenisOptions(list || []);
    } catch (err: any) {
      console.error('Failed to load jenis part list:', err);
    }
  }, []);

  // Fetch Materials
  const fetchMaterials = useCallback(async () => {
    try {
      const mats = await MaterialsService.listMaterials();
      setAvailableMaterials(mats || []);
    } catch (err: any) {
      console.error('Failed to load materials:', err);
    }
  }, []);

  useEffect(() => {
    fetchParts();
    fetchJenisList();
    fetchMaterials();
  }, [fetchParts, fetchJenisList, fetchMaterials]);

  // Fetch History Requests
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await CrushingRequestsService.listRequests({
        status: historyStatusFilter,
        page: historyPage,
        limit: historyLimit,
      });
      setHistoryRequests(res.requests);
      setHistoryTotal(res.pagination.total);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Gagal memuat riwayat permintaan',
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [historyStatusFilter, historyPage, historyLimit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Filtered Parts
  const filteredParts = useMemo(() => {
    return availableParts.filter((p) => {
      // Filter by Jenis Part
      if (selectedJenis !== 'ALL' && p.jenis_part !== selectedJenis) {
        return false;
      }
      // Filter by Search Query
      if (partSearchQuery.trim() !== '') {
        const q = partSearchQuery.toLowerCase().trim();
        const matchName = p.part_name?.toLowerCase().includes(q);
        const matchNum = p.part_number?.toLowerCase().includes(q);
        const matchModel = p.model_code?.toLowerCase().includes(q);
        const matchSebango = p.sebango_code?.toLowerCase().includes(q);
        const matchMat = p.material?.toLowerCase().includes(q);
        return matchName || matchNum || matchModel || matchSebango || matchMat;
      }
      return true;
    });
  }, [availableParts, selectedJenis, partSearchQuery]);

  const handleSelectPart = (part: MasterPart) => {
    setSelectedPart(part);
    if (!partQuantityPcs || Number(partQuantityPcs) <= 0) {
      setPartQuantityPcs(1);
    }
  };

  // Add Item to Draft List
  const handleAddItem = () => {
    if (itemType === 'part_ng') {
      if (!selectedPart) {
        setToast({ type: 'error', message: 'Silakan pilih salah satu part dari grid terlebih dahulu.' });
        return;
      }
      const qty = typeof partQuantityPcs === 'number' ? partQuantityPcs : parseInt(partQuantityPcs, 10);
      if (!qty || qty <= 0) {
        setToast({ type: 'error', message: 'Jumlah quantity (pcs) harus lebih dari 0.' });
        return;
      }

      const calculatedWeight = Number(((qty * Number(selectedPart.berat_part_gr)) / 1000).toFixed(2));

      setItems((prev) => [
        ...prev,
        {
          item_type: 'part_ng',
          master_part_id: selectedPart.id,
          material_name: selectedPart.part_name,
          quantity_pcs: qty,
          runner_weight_kg: calculatedWeight,
          notes: itemNotes.trim() || undefined,
        },
      ]);

      // Reset item draft form
      setSelectedPart(null);
      setPartQuantityPcs(1);
      setItemNotes('');
      setToast({ type: 'success', message: `Part '${selectedPart.part_name}' ditambahkan ke draf tiket.` });
    } else if (itemType === 'runner_ng') {
      const weight = typeof runnerWeightKg === 'number' ? runnerWeightKg : parseFloat(runnerWeightKg);
      if (!weight || weight <= 0) {
        setToast({ type: 'error', message: 'Berat runner harus lebih dari 0 kg.' });
        return;
      }

      const matName = selectedMaterial ? selectedMaterial.material_name : 'Material Runner';

      setItems((prev) => [
        ...prev,
        {
          item_type: 'runner_ng',
          material_id: selectedMaterial ? selectedMaterial.id : undefined,
          material_name: matName,
          runner_weight_kg: Number(weight.toFixed(2)),
          quantity_pcs: 0,
          notes: itemNotes.trim() || undefined,
        },
      ]);

      // Reset item draft form
      setSelectedMaterial(null);
      setRunnerWeightKg('');
      setItemNotes('');
      setToast({ type: 'success', message: `Runner '${matName}' (${weight} kg) ditambahkan ke draf tiket.` });
    }
  };

  const handleAddRunnerBatch = (
    newRunnerItems: Array<{
      material_id?: string;
      material_name: string;
      runner_weight_kg: number;
      notes?: string;
    }>
  ) => {
    if (newRunnerItems.length === 0) return;
    const mapped: CreateRequestItemPayload[] = newRunnerItems.map((r) => ({
      item_type: 'runner_ng',
      material_id: r.material_id,
      material_name: r.material_name,
      runner_weight_kg: Number(r.runner_weight_kg.toFixed(2)),
      quantity_pcs: 0,
      notes: r.notes?.trim() || undefined,
    }));
    setItems((prev) => [...prev, ...mapped]);
    setToast({
      type: 'success',
      message: `${mapped.length} item material runner berhasil ditambahkan ke draf tiket.`,
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Clear / Reset Draft
  const handleClearDraft = async () => {
    if (items.length > 0 || notes) {
      if (!window.confirm('Apakah Anda yakin ingin mengosongkan draf tiket ini?')) {
        return;
      }
    }
    setItems([]);
    setNotes('');
    setShift('Pagi');
    setSelectedPart(null);
    setSelectedMaterial(null);
    setRunnerWeightKg('');

    try {
      await CrushingRequestsService.deleteDraft();
    } catch (err) {
      console.warn('Failed to delete draft from server:', err);
    }

    setToast({ type: 'info', message: 'Draf tiket pengiriman telah dikosongkan.' });
  };

  // Submit Request Ticket
  const handleSubmitRequest = async () => {
    if (items.length === 0) {
      setToast({ type: 'error', message: 'Tambahkan minimal 1 item part atau runner ke daftar rincian tiket sebelum mengirim.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const newReq = await CrushingRequestsService.createRequest({
        shift,
        request_date: requestDate,
        notes: notes.trim() || undefined,
        items,
      });

      setToast({
        type: 'success',
        message: `Tiket request '${newReq.request_number}' berhasil dibuat! Menunggu validasi operator crushing.`,
      });

      // Clear form (backend automatically deletes Redis draft)
      setItems([]);
      setNotes('');
      setSelectedPart(null);

      setActiveTab('history');
      fetchHistory();
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Gagal membuat tiket request',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Detail Modal
  const handleOpenDetailModal = async (req: CrushingRequest) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    try {
      const full = await CrushingRequestsService.getRequestById(req.id);
      setSelectedRequestDetail(full);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Gagal memuat rincian tiket',
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Calculated total estimated weight of draft
  const estimatedTotalWeightKg = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.runner_weight_kg) || 0), 0);
  }, [items]);

  const estimatedTotalPcs = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity_pcs) || 0), 0);
  }, [items]);

  return {
    user,
    activeTab,
    setActiveTab,
    shift,
    setShift,
    requestDate,
    setRequestDate,
    notes,
    setNotes,
    items,
    itemType,
    setItemType,
    selectedPart,
    handleSelectPart,
    partQuantityPcs,
    setPartQuantityPcs,
    selectedMaterial,
    setSelectedMaterial,
    runnerWeightKg,
    setRunnerWeightKg,
    itemNotes,
    setItemNotes,
    availableParts,
    filteredParts,
    jenisOptions,
    selectedJenis,
    setSelectedJenis,
    availableMaterials,
    isLoadingParts,
    partSearchQuery,
    setPartSearchQuery,
    handleAddItem,
    handleAddRunnerBatch,
    handleRemoveItem,
    handleClearDraft,
    isSubmitting,
    isSavingDraft,
    handleSubmitRequest,
    estimatedTotalWeightKg,
    estimatedTotalPcs,
    historyRequests,
    historyTotal,
    historyPage,
    setHistoryPage,
    historyLimit,
    historyStatusFilter,
    setHistoryStatusFilter,
    isLoadingHistory,
    fetchHistory,
    selectedRequestDetail,
    isDetailModalOpen,
    setIsDetailModalOpen,
    isLoadingDetail,
    handleOpenDetailModal,
    toast,
    setToast,
  };
}
