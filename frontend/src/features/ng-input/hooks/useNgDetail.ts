import { useState, useEffect, useCallback } from 'react';
import { NgInputService } from '../services/ngInput.service';
import type {
  MaterialSummaryResponse,
  PartMonthlyDetailResponse,
  PartSummaryItem,
  PlantLocation,
} from '../types/ngInput.types';

export const MONTH_NAMES = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

export function useNgDetail() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedLocation, setSelectedLocation] = useState<PlantLocation>('Cibitung');

  const [summaryData, setSummaryData] = useState<MaterialSummaryResponse | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);

  // Track expanded state for material accordions (material_name -> boolean)
  const [expandedMaterials, setExpandedMaterials] = useState<Record<string, boolean>>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPartSummary, setSelectedPartSummary] = useState<PartSummaryItem | null>(null);
  const [partDetail, setPartDetail] = useState<PartMonthlyDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    setErrorMessage(null);
    try {
      const data = await NgInputService.getMaterialSummary(selectedYear, selectedMonth, selectedLocation);
      setSummaryData(data);
      // All material accordions remain closed by default as requested
      setExpandedMaterials({});
    } catch (err: any) {
      console.error('Failed to fetch material summary:', err);
      setErrorMessage(err.message || 'Gagal memuat data ringkasan material');
    } finally {
      setIsLoadingSummary(false);
    }
  }, [selectedYear, selectedMonth, selectedLocation]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const toggleExpandMaterial = (materialName: string) => {
    setExpandedMaterials((prev) => ({
      ...prev,
      [materialName]: !prev[materialName],
    }));
  };

  const openPartModal = async (part: PartSummaryItem) => {
    setSelectedPartSummary(part);
    setIsModalOpen(true);
    setIsLoadingDetail(true);
    setPartDetail(null);
    try {
      const detailData = await NgInputService.getPartMonthlyDetail(
        part.master_part_id,
        selectedYear,
        selectedMonth,
        selectedLocation
      );
      setPartDetail(detailData);
    } catch (err: any) {
      console.error('Failed to fetch part detail analytics:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPartSummary(null);
    setPartDetail(null);
  };

  const monthLabel = MONTH_NAMES.find((m) => m.value === selectedMonth)?.label || 'Bulan';

  return {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedLocation,
    setSelectedLocation,
    summaryData,
    isLoadingSummary,
    fetchSummary,
    expandedMaterials,
    toggleExpandMaterial,
    isModalOpen,
    openPartModal,
    closeModal,
    selectedPartSummary,
    partDetail,
    isLoadingDetail,
    errorMessage,
    monthLabel,
  };
}
