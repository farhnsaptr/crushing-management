import { useState, useEffect, useCallback } from 'react';
import { VerificationService } from '../services/verification.service';
import { usePlantLocation } from '../../factories/hooks/usePlantLocation';
import type { VerificationDetailResponse, VerificationItem } from '../types/verification.types';

export interface AccuracyItem {
  material_name: string;
  system_weight_kg: number;
  verified_weight_kg: number | null;
  difference_kg: number | null;
}

export function useAccuracyEvaluation() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(today);
  const [shift, setShift] = useState<'Pagi' | 'Malam'>('Pagi');
  const { locations, location, setLocation, isLoaded: isLocationLoaded } = usePlantLocation();

  const [data, setData] = useState<VerificationDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccuracyData = useCallback(async () => {
    if (!location) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await VerificationService.getVerificationDetails(date, shift, location);
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch accuracy evaluation data:', err);
      setError(err?.response?.data?.message || err?.message || 'Gagal memuat data evaluasi akurasi');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [date, shift, location]);

  useEffect(() => {
    if (isLocationLoaded && location) {
      fetchAccuracyData();
    }
  }, [isLocationLoaded, location, date, shift, fetchAccuracyData]);

  // Map items to simple accuracy comparison
  const items: AccuracyItem[] = (data?.items || []).map((it: VerificationItem) => {
    const sysKg = Number((it.system_total_weight_kg || 0).toFixed(2));
    const hasActual = it.actual_output_kg !== '' && typeof it.actual_output_kg === 'number';
    const verKg = hasActual ? Number(Number(it.actual_output_kg).toFixed(2)) : null;
    const diffKg = verKg !== null ? Number((verKg - sysKg).toFixed(2)) : null;

    return {
      material_name: it.material_name,
      system_weight_kg: sysKg,
      verified_weight_kg: verKg,
      difference_kg: diffKg,
    };
  });

  const totalSystemKg = items.reduce((acc, it) => acc + it.system_weight_kg, 0);
  const totalVerifiedKg = items.reduce((acc, it) => acc + (it.verified_weight_kg || 0), 0);
  const totalDiffKg = data?.is_validated ? Number((totalVerifiedKg - totalSystemKg).toFixed(2)) : null;

  return {
    date,
    setDate,
    shift,
    setShift,
    location,
    setLocation,
    locations,
    data,
    items,
    totals: {
      totalSystemKg: Number(totalSystemKg.toFixed(2)),
      totalVerifiedKg: Number(totalVerifiedKg.toFixed(2)),
      totalDiffKg,
    },
    isValidated: data?.is_validated || false,
    hasInput: data?.has_input ?? false,
    header: data?.header || null,
    isLoading,
    error,
    refresh: fetchAccuracyData,
  };
}
