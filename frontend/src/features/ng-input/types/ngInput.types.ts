import type { MasterPart } from '../../master-parts/types/masterParts.types';
import type { Factory } from '../../factories/types/factories.types';

export type FilterMode = 'jenis' | 'factory';
export type PlantLocation = 'Cibitung' | 'Karawang';

export interface CreateNgTransactionPayload {
  master_part_id: string;
  quantity_pcs: number;
  shift: 'Pagi' | 'Malam';
  transaction_date: string;
  notes?: string;
}

export interface NgTransactionResult {
  id: string;
  master_part_id: string;
  part_number_snapshot: string;
  part_name_snapshot: string;
  model_snapshot: string;
  berat_part_gr_snapshot: number;
  quantity_pcs: number;
  weight_kg: number;
  shift: 'Pagi' | 'Malam';
  transaction_date: string;
  input_by: string;
  input_by_name?: string;
  notes?: string;
  created_at: string;
}

export interface PartSummaryItem {
  master_part_id: string;
  part_name: string;
  part_number: string;
  model: string;
  plant_location?: PlantLocation;
  allowance_kg: number | null;
  total_weight_kg: number;
  total_quantity_pcs: number;
}

export interface MaterialSummaryItem {
  material_name: string;
  total_weight_kg: number;
  total_quantity_pcs: number;
  parts: PartSummaryItem[];
}

export interface MaterialSummaryResponse {
  year: number;
  month: number;
  location?: PlantLocation;
  max_material_weight_kg: number;
  materials: MaterialSummaryItem[];
}

export interface DailyShiftChartItem {
  day: string;
  day_num: number;
  pagi_kg: number;
  malam_kg: number;
  pagi_pcs: number;
  malam_pcs: number;
  total_kg: number;
  allowance_kg: number;
  is_exceeded: boolean;
}

export interface PartMonthlyDetailResponse {
  part: {
    id: string;
    part_name: string;
    part_number: string;
    model: string;
    material: string;
    plant_location?: PlantLocation;
    berat_part_gr: number;
    allowance_kg: number;
  };
  period: {
    year: number;
    month: number;
    location?: PlantLocation;
  };
  daily_chart: DailyShiftChartItem[];
  transactions: NgTransactionResult[];
}

export type { MasterPart, Factory };
