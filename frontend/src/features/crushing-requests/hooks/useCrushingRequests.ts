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
  const saveDraftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Automatically sync shift & operational date based on real-time clock (every 10 seconds)
  useEffect(() => {
    const updateAutoShift = () => {
      const current = getAutoShiftAndDate();
      setShift((prevShift) => (prevShift !== current.shift ? current.shift : prevShift));
      setRequestDate((prevDate) => (prevDate !== current.date ? current.date : prevDate));
    };

    updateAutoShift();
    const interval = setInterval(updateAutoShift, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Draft from Server (Database) on mount / user load (restores items & notes)
  const fetchServerDraft = useCallback(async () => {
    if (!user?.id) return;
    try {
      const serverDraft = await CrushingRequestsService.getDraft();
      if (serverDraft) {
        if (typeof serverDraft.notes === 'string') {
          setNotes(serverDraft.notes);
        }
        if (Array.isArray(serverDraft.items) && serverDraft.items.length > 0) {
          setItems(serverDraft.items);
        }
      }
    } catch (err) {
      console.warn('Failed to load draft from server database:', err);
    } finally {
      setIsDraftLoaded(true);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchServerDraft();
  }, [fetchServerDraft]);

  // 2. Automatically sync draft state to Server (Database) with debounce
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
        console.warn('Failed to sync draft to server database:', err);
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

  // 1-Click Quick Add Part directly to ticket items list
  const handleQuickAddPart = useCallback((part: MasterPart, delta = 1) => {
    const beratGr = Number(part.berat_part_gr) || 0;

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.item_type === 'part_ng' && it.master_part_id === part.id
      );

      if (existingIdx >= 0) {
        const nextItems = [...prev];
        const currentQty = nextItems[existingIdx].quantity_pcs || 0;
        const newQty = Math.max(1, currentQty + delta);
        const newWeight = Number(((newQty * beratGr) / 1000).toFixed(2));

        nextItems[existingIdx] = {
          ...nextItems[existingIdx],
          part_number: nextItems[existingIdx].part_number || part.part_number,
          model_code: nextItems[existingIdx].model_code || part.model_code,
          image_url: nextItems[existingIdx].image_url || part.image_url,
          berat_part_gr: beratGr,
          quantity_pcs: newQty,
          runner_weight_kg: newWeight,
        };
        return nextItems;
      } else {
        const initialQty = Math.max(1, delta);
        const initialWeight = Number(((initialQty * beratGr) / 1000).toFixed(2));
        return [
          ...prev,
          {
            item_type: 'part_ng',
            master_part_id: part.id,
            material_name: part.part_name,
            part_number: part.part_number,
            model_code: part.model_code,
            image_url: part.image_url,
            berat_part_gr: beratGr,
            quantity_pcs: initialQty,
            runner_weight_kg: initialWeight,
            notes: undefined,
          },
        ];
      }
    });

    setToast({
      type: 'success',
      message: `Part '${part.part_name}' masuk ke rincian pengiriman.`,
    });
  }, []);

  // Step Item Quantity (+ / -) in Ticket List
  const handleStepItemQty = useCallback((index: number, delta: number) => {
    setItems((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const target = prev[index];
      const currentQty = target.quantity_pcs || 1;
      const newQty = currentQty + delta;

      if (newQty <= 0) {
        return prev.filter((_, idx) => idx !== index);
      }

      const beratGr = target.berat_part_gr || 0;
      const nextItems = [...prev];
      nextItems[index] = {
        ...target,
        quantity_pcs: newQty,
        runner_weight_kg: beratGr > 0 ? Number(((newQty * beratGr) / 1000).toFixed(2)) : target.runner_weight_kg,
      };
      return nextItems;
    });
  }, []);

  // Update Item Quantity directly by input value in Ticket List
  const handleUpdateItemQty = useCallback((index: number, newQty: number) => {
    setItems((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const target = prev[index];
      const validQty = Math.max(1, newQty);
      const beratGr = target.berat_part_gr || 0;

      const nextItems = [...prev];
      nextItems[index] = {
        ...target,
        quantity_pcs: validQty,
        runner_weight_kg: beratGr > 0 ? Number(((validQty * beratGr) / 1000).toFixed(2)) : target.runner_weight_kg,
      };
      return nextItems;
    });
  }, []);

  // Update Item Defect Notes in Ticket List
  const handleUpdateItemNotes = useCallback((index: number, newNotes: string) => {
    setItems((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const nextItems = [...prev];
      nextItems[index] = {
        ...nextItems[index],
        notes: newNotes,
      };
      return nextItems;
    });
  }, []);

  // Get current quantity in ticket for a given part
  const getItemQuantityForPart = useCallback(
    (partId: string) => {
      const found = items.find((it) => it.item_type === 'part_ng' && it.master_part_id === partId);
      return found ? found.quantity_pcs : 0;
    },
    [items]
  );

  // Add Item to Draft List (Legacy/Runner Form Support)
  const handleAddItem = () => {
    if (itemType === 'part_ng') {
      if (!selectedPart) {
        setToast({ type: 'error', message: 'Silakan pilih salah satu part dari katalog terlebih dahulu.' });
        return;
      }
      const qty = typeof partQuantityPcs === 'number' ? partQuantityPcs : parseInt(partQuantityPcs, 10);
      if (!qty || qty <= 0) {
        setToast({ type: 'error', message: 'Jumlah quantity (pcs) harus lebih dari 0.' });
        return;
      }

      handleQuickAddPart(selectedPart, qty);
      setSelectedPart(null);
      setPartQuantityPcs(1);
      setItemNotes('');
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
      setToast({ type: 'success', message: `Runner '${matName}' (${weight} kg) ditambahkan ke draf pengiriman.` });
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
      message: `${mapped.length} item material runner berhasil ditambahkan ke draf pengiriman.`,
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Clear / Reset Draft
  const handleClearDraft = async () => {
    if (items.length > 0 || notes) {
      if (!window.confirm('Apakah Anda yakin ingin mengosongkan draf pengiriman ini?')) {
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

    setToast({ type: 'info', message: 'Draf pengiriman telah dikosongkan.' });
  };

  // Submit Request with Undo Capability
  const handleSubmitRequest = async () => {
    if (items.length === 0) {
      setToast({ type: 'error', message: 'Tambahkan minimal 1 item part atau runner ke daftar rincian pengiriman sebelum mengirim.' });
      return;
    }

    const currentShiftDate = getAutoShiftAndDate();
    const activeShift = currentShiftDate.shift;
    const activeDate = currentShiftDate.date;

    const backupItems = [...items];
    const backupNotes = notes;
    const backupShift = activeShift;
    const backupDate = activeDate;

    setIsSubmitting(true);
    try {
      const newReq = await CrushingRequestsService.createRequest({
        shift: activeShift,
        request_date: activeDate,
        notes: notes.trim() || undefined,
        items,
      });

      // Clear form
      setItems([]);
      setNotes('');
      setSelectedPart(null);

      // Refresh history list in background
      fetchHistory();

      // Show Success Toast with Interactive Undo Action
      setToast({
        type: 'success',
        message: `Pengiriman '${newReq.request_number}' (${backupItems.length} item) berhasil dikirim!`,
        durationMs: 7000,
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              await CrushingRequestsService.cancelRequest(newReq.id);
              // Restore backup draft state into form
              setItems(backupItems);
              setNotes(backupNotes);
              setShift(backupShift);
              setRequestDate(backupDate);
              setActiveTab('create');
              fetchHistory();
              setToast({
                type: 'info',
                message: `Pengiriman '${newReq.request_number}' dibatalkan. Draf item telah dipulihkan.`,
              });
            } catch (err: any) {
              setToast({
                type: 'error',
                message: err.response?.data?.message || err.message || 'Gagal membatalkan pengiriman',
              });
            }
          },
        },
      });
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Gagal membuat pengiriman',
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
        message: err.response?.data?.message || err.message || 'Gagal memuat detail pengiriman',
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
    handleQuickAddPart,
    handleStepItemQty,
    handleUpdateItemQty,
    handleUpdateItemNotes,
    getItemQuantityForPart,
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
