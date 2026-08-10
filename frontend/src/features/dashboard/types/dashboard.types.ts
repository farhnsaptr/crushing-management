export type PlantLocation = 'Cibitung' | 'Karawang';

export interface DashboardSummaryStats {
  year: number;
  month: number;
  location: PlantLocation;
  input_kg: number;
  output_kg: number;
  waste_kg: number;
  input_pcs: number;
}

export interface DailyRecycleChartItem {
  day: string;
  day_num: number;
  pagi_kg: number;
  malam_kg: number;
  pagi_pcs?: number;
  malam_pcs?: number;
  total_kg: number;
}

export interface DailyRecycleChartResponse {
  total_allowance_kg: number;
  daily_chart: DailyRecycleChartItem[];
}

export interface ParetoMaterialItem {
  no: number;
  material: string;
  total_kg: number;
  total_pcs: number;
}

export interface TopNgPartItem {
  no: number;
  part_name: string;
  part_number: string;
  model: string;
  total_pcs: number;
  total_kg: number;
}
