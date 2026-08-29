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
        actual_output_kg: res.is_validated ? it.actual_output_kg : (it.actual_output_kg === 0 ? '' : it.actual_output_kg),
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

  // Update actual output kg directly for a specific material item
  const handleUpdateItem = (index: number, value: number | '') => {
    setItems((prevItems) =>
      prevItems.map((item, idx) => {
        if (idx !== index) return item;

        const numKg = typeof value === 'number' ? Math.max(0, value) : (parseFloat(String(value)) || 0);
        const wasteLoss = Number(Math.max(0, item.system_total_weight_kg - numKg).toFixed(2));

        return {
          ...item,
          actual_output_kg: value,
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
          const numKg = typeof item.actual_output_kg === 'number'
            ? item.actual_output_kg
            : (parseFloat(String(item.actual_output_kg)) || 0);

          return {
            material_id: item.material_id,
            material_name: item.material_name,
            system_ng_weight_kg: Number(item.system_ng_weight_kg.toFixed(2)),
            system_runner_weight_kg: Number(item.system_runner_weight_kg.toFixed(2)),
            system_total_weight_kg: Number(item.system_total_weight_kg.toFixed(2)),
            actual_output_kg: Number(numKg.toFixed(2)),
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
  const totalActualOutputKg = Number(
    items.reduce((sum, item) => {
      const val = typeof item.actual_output_kg === 'number' ? item.actual_output_kg : (parseFloat(String(item.actual_output_kg)) || 0);
      return sum + val;
    }, 0).toFixed(2)
  );
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
