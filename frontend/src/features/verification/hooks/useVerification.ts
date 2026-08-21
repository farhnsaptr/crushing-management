import { useState, useCallback, useEffect } from 'react';
import { VerificationService } from '../services/verification.service';
import { getAutoShiftAndDate } from '../../../config/shift.config';
import type {
  VerificationDetailResponse,
  VerificationItem,
} from '../types/verification.types';

export const useVerification = (initialDate?: string, initialShift?: 'Pagi' | 'Malam') => {
  const autoShiftDate = getAutoShiftAndDate();

  const [date, setDate] = useState<string>(initialDate || autoShiftDate.date);
  const [shift, setShift] = useState<'Pagi' | 'Malam'>(initialShift || autoShiftDate.shift);
  const [notes, setNotes] = useState<string>('');

  const [data, setData] = useState<VerificationDetailResponse | null>(null);
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await VerificationService.getVerificationDetails(date, shift);
      setData(res);
      const mappedItems = (res.items || []).map((it) => ({
        ...it,
        box_count: res.is_validated ? it.box_count : (it.box_count === 0 ? '' : it.box_count),
        kg_per_box: it.kg_per_box ?? 5.0,
      }));
      setItems(mappedItems);
      setNotes(res.header?.notes || '');
    } catch (err: any) {
      console.error('Failed to load verification details:', err);
      setData(null);
      setItems([]);
      setToast({
        message: err?.response?.data?.message || 'Gagal memuat detail verifikasi input.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [date, shift]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Update box count or kg_per_box for a specific material item in state
  const handleUpdateItem = (index: number, field: 'box_count' | 'kg_per_box', value: number | '') => {
    setItems((prevItems) =>
      prevItems.map((item, idx) => {
        if (idx !== index) return item;

        const newBoxCount = field === 'box_count' ? value : item.box_count;
        const newKgPerBox = field === 'kg_per_box' ? value : item.kg_per_box;

        const numBoxes = typeof newBoxCount === 'number' ? Math.max(0, newBoxCount) : (parseInt(String(newBoxCount), 10) || 0);
        const numKg = typeof newKgPerBox === 'number' ? Math.max(0, newKgPerBox) : (parseFloat(String(newKgPerBox)) || 0);

        const actualOut = Number((numBoxes * numKg).toFixed(2));
        const wasteLoss = Number(Math.max(0, item.system_total_weight_kg - actualOut).toFixed(2));

        return {
          ...item,
          box_count: newBoxCount,
          kg_per_box: newKgPerBox,
          actual_output_kg: actualOut,
          crushing_waste_kg: wasteLoss,
        };
      })
    );
  };

  // Submit and save verification
  const handleSaveVerification = async () => {
    setIsSaving(true);
    try {
      const payload = {
        verification_date: date,
        shift,
        notes,
        items: items.map((item) => {
          const numBoxes = typeof item.box_count === 'number' ? item.box_count : (parseInt(String(item.box_count), 10) || 0);
          const numKg = typeof item.kg_per_box === 'number' ? item.kg_per_box : (parseFloat(String(item.kg_per_box)) || 5.0);

          return {
            material_id: item.material_id,
            material_name: item.material_name,
            system_ng_weight_kg: Number(item.system_ng_weight_kg.toFixed(2)),
            system_runner_weight_kg: Number(item.system_runner_weight_kg.toFixed(2)),
            system_total_weight_kg: Number(item.system_total_weight_kg.toFixed(2)),
            box_count: numBoxes,
            kg_per_box: numKg,
          };
        }),
      };

      await VerificationService.saveVerification(payload);
      setToast({
        message: `Pekerjaan Tanggal ${date} (${shift}) berhasil divalidasi oleh Operator!`,
        type: 'success',
      });
      await fetchDetails();
    } catch (err: any) {
      console.error('Failed to save verification:', err);
      setToast({
        message: err?.response?.data?.message || 'Gagal menyimpan validasi verifikasi input.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculated Totals from current items state
  const totalSystemKg = Number(items.reduce((sum, item) => sum + item.system_total_weight_kg, 0).toFixed(2));
  const totalActualOutputKg = Number(items.reduce((sum, item) => sum + item.actual_output_kg, 0).toFixed(2));
  const totalCrushingWasteKg = Number(items.reduce((sum, item) => sum + item.crushing_waste_kg, 0).toFixed(2));

  return {
    date,
    setDate,
    shift,
    setShift,
    notes,
    setNotes,
    data,
    items,
    isLoading,
    isSaving,
    toast,
    setToast,
    fetchDetails,
    handleUpdateItem,
    handleSaveVerification,
    totals: {
      totalSystemKg,
      totalActualOutputKg,
      totalCrushingWasteKg,
    },
  };
};
