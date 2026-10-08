/** Nama lokasi plant (nilai dari backend: factories.location). */
export type PlantLocation = string;

export interface DashboardSummaryStats {
  year: number;
  month: number;
  location: PlantLocation;
  scrap_kg: number; // material no-reuse (NG + runner)
  input_kg: number; // material reuse (NG + runner)
  output_kg: number; // hasil timbang verifikasi operator
  gap_kg: number; // berat sistem - hasil timbang (shift tervalidasi)
  input_pcs: number;
}

/** Titik data minimum untuk grafik garis per shift (kg). */
export interface ShiftChartPoint {
  day_num: number;
  pagi_kg: number;
  malam_kg: number;
  planning_kg?: number | null;
}

export interface DailyRecycleChartItem {
  day: string;
  day_num: number;
  pagi_ng_kg?: number;
  pagi_runner_kg?: number;
  malam_ng_kg?: number;
  malam_runner_kg?: number;
  pagi_kg: number;
  malam_kg: number;
  pagi_input_kg?: number;
  pagi_scrap_kg?: number;
  pagi_output_kg?: number;
  pagi_gap_kg?: number;
  malam_input_kg?: number;
  malam_scrap_kg?: number;
  malam_output_kg?: number;
  malam_gap_kg?: number;
  pagi_pcs?: number;
  malam_pcs?: number;
  total_kg: number;
  total_input_kg?: number;
  total_scrap_kg?: number;
  total_output_kg?: number;
  total_gap_kg?: number;
  /** Planning Harian (allowance dari upload data produksi); null = data produksi hari itu belum diupload. */
  planning_kg?: number | null;
}

export interface DailyRecycleChartResponse {
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

export interface DepartmentParetoItem {
  rank: number;
  department_id: string;
  department_code: string;
  department_name: string;
  total_kg: number;
  total_pcs: number;
  total_transaksi: number;
  percentage: number;
}

export interface SenderDailyChartItem {
  day: string;
  day_num: number;
  pagi_kg: number;
  malam_kg: number;
  pagi_pcs: number;
  malam_pcs: number;
  total_kg: number;
  total_pcs: number;
}

export interface SenderTopPartItem {
  no: number;
  part_name: string;
  part_number: string;
  model: string;
  total_pcs: number;
  total_kg: number;
  percentage: number;
}

export interface SenderMaterialItem {
  no: number;
  material: string;
  total_pcs: number;
  total_kg: number;
  percentage: number;
}

export interface SenderDashboardStats {
  year: number;
  month: number;
  department_id: string | null;
  department_name: string;
  department_code: string;
  factory_name: string;
  total_requests: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  approved_weight_kg: number;
  approved_pcs: number;
  total_submitted_weight_kg: number;
  total_pcs?: number;
  daily_chart: SenderDailyChartItem[];
  top_parts: SenderTopPartItem[];
  top_materials: SenderMaterialItem[];
  recent_requests: Array<{
    id: string;
    request_number: string;
    sender_name: string;
    sender_username: string;
    request_type: string;
    shift: string;
    request_date: string;
    status: 'pending' | 'approved' | 'rejected';
    total_weight_kg: number;
    total_pcs: number;
    notes?: string;
    rejection_reason?: string;
    created_at: string;
    item_count?: number;
  }>;
}
