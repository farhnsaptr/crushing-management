import { useState, useEffect, useMemo } from 'react';
import { NgInputService } from '../services/ngInput.service';
import type { FilterMode, MasterPart, Factory } from '../types/ngInput.types';
import type { ToastMessage } from '../../../components/common/Toast';
import { getAutoShiftAndDate } from '../../../config/shift.config';

export const JENIS_PART_OPTIONS = [
  'BUMPER',
  'GRILLE',
  'DOOR TRIM',
  'QUARTER TRIM',
  'GARNISH',
  'SPOILER',
  'OTHERS',
];

export const useNgInput = () => {
  // Mode Filter: 'jenis' (default) vs 'factory'
  const [filterMode, setFilterMode] = useState<FilterMode>('jenis');
  const [selectedJenis, setSelectedJenis] = useState<string>('BUMPER');
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data State
  const [allParts, setAllParts] = useState<MasterPart[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState<boolean>(true);

  // Selected Part for Form Right Side
  const [selectedPart, setSelectedPart] = useState<MasterPart | null>(null);

  // Form State initialized automatically from current time/date (8 PM to 7 AM is Malam)
  const initialAuto = useMemo(() => getAutoShiftAndDate(), []);
  const [quantityPcs, setQuantityPcs] = useState<number | ''>('');
  const [shift, setShift] = useState<'Pagi' | 'Malam'>(initialAuto.shift);
  const [transactionDate, setTransactionDate] = useState<string>(initialAuto.date);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Fetch initial factories list
  useEffect(() => {
    const loadFactories = async () => {
      try {
        const facs = await NgInputService.getFactories();
        setFactories(facs);
        if (facs.length > 0 && !selectedFactoryId) {
          setSelectedFactoryId(facs[0].id);
        }
      } catch (err) {
        console.error('Failed to load factories for NG input', err);
      }
    };
    loadFactories();
  }, []);

  // Fetch master parts whenever filter mode or values change
  const fetchParts = async () => {
    setIsLoadingParts(true);
    try {
      const partsData = await NgInputService.getMasterParts();
      setAllParts(partsData);
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal memuat data master parts.',
      });
    } finally {
      setIsLoadingParts(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  // Dynamically extract unique jenis_part values from allParts
  const jenisOptions = useMemo(() => {
    const set = new Set<string>();
    allParts.forEach((p) => {
      if (p.jenis_part && p.jenis_part.trim() !== '' && p.jenis_part.trim() !== '-') {
        set.add(p.jenis_part.toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [allParts]);

  useEffect(() => {
    if (jenisOptions.length > 0 && !jenisOptions.includes(selectedJenis.toUpperCase())) {
      setSelectedJenis(jenisOptions[0]);
    }
  }, [jenisOptions]);

  // Filtered parts grid calculation
  const filteredParts = useMemo(() => {
    let result: MasterPart[] = [];
    if (filterMode === 'jenis') {
      if (selectedJenis === 'OTHERS') {
        result = allParts.filter(
          (p) => !['BUMPER', 'GRILLE', 'DOOR TRIM', 'QUARTER TRIM', 'GARNISH', 'SPOILER'].includes((p.jenis_part || '').toUpperCase())
        );
      } else {
        result = allParts.filter((p) => (p.jenis_part || '').toUpperCase() === selectedJenis.toUpperCase());
      }
    } else {
      // Filter mode: 'factory'
      if (!selectedFactoryId) {
        result = allParts;
      } else {
        const factoryObj = factories.find((f) => f.id === selectedFactoryId);
        if (!factoryObj) {
          result = allParts;
        } else {
          result = allParts.filter((p) => {
            const partFactoryId = (p as any).factory_id || (p as any).machine?.factory_id;
            if (partFactoryId && partFactoryId === selectedFactoryId) return true;

            if (p.factory_name && p.factory_name.toUpperCase() === factoryObj.name.toUpperCase()) return true;
            if (p.factory_code && p.factory_code.toUpperCase() === factoryObj.code.toUpperCase()) return true;

            return false;
          });
        }
      }
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.part_name || '').toLowerCase().includes(q) ||
          (p.part_number || '').toLowerCase().includes(q) ||
          (p.model_code || '').toLowerCase().includes(q) ||
          (p.sebango_code || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [allParts, filterMode, selectedJenis, selectedFactoryId, factories, searchQuery]);

  // Automatically select first part in filtered list if current selection isn't in filtered list
  useEffect(() => {
    if (filteredParts.length > 0) {
      const currentStillValid = selectedPart && filteredParts.some((p) => p.id === selectedPart.id);
      if (!currentStillValid) {
        setSelectedPart(filteredParts[0]);
      }
    } else {
      setSelectedPart(null);
    }
  }, [filteredParts]);

  // Compute estimated total weight in kg
  const estimatedWeightKg = useMemo(() => {
    if (!selectedPart || typeof quantityPcs !== 'number' || quantityPcs <= 0) {
      return 0;
    }
    const partWeightGr = Number(selectedPart.berat_part_gr || 0);
    return (quantityPcs * partWeightGr) / 1000;
  }, [selectedPart, quantityPcs]);

  const handleSelectPart = (part: MasterPart) => {
    setSelectedPart(part);
  };

  const handleFilterModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPart) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: 'Pilih part terlebih dahulu dari daftar di sebelah kiri.',
      });
      return;
    }

    if (typeof quantityPcs !== 'number' || quantityPcs <= 0) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: 'Masukkan jumlah Qty NG (pcs) yang valid (lebih besar dari 0).',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await NgInputService.submitNgTransaction({
        master_part_id: selectedPart.id,
        quantity_pcs: quantityPcs,
        shift,
        transaction_date: transactionDate,
        notes: notes.trim() || undefined,
      });

      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: `Transaksi NG berhasil disimpan! (${quantityPcs} pcs = ${estimatedWeightKg.toFixed(2)} kg)`,
      });

      // Reset form quantity
      setQuantityPcs('');
      setNotes('');
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan transaksi NG.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    filterMode,
    setFilterMode: handleFilterModeChange,
    selectedJenis,
    setSelectedJenis,
    jenisOptions,
    selectedFactoryId,
    setSelectedFactoryId,
    searchQuery,
    setSearchQuery,
    factories,
    filteredParts,
    isLoadingParts,
    selectedPart,
    handleSelectPart,
    quantityPcs,
    setQuantityPcs,
    shift,
    setShift,
    transactionDate,
    setTransactionDate,
    notes,
    setNotes,
    estimatedWeightKg,
    isSubmitting,
    handleSubmit,
    toast,
    setToast,
  };
};
