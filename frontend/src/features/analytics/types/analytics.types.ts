export interface MonthlyComparisonItem {
  month_number: number;
  month_name: string;
  allowance_kg: number;
  input_kg: number;
  actual_output_kg: number;
  system_ng_kg: number;
  system_runner_kg: number;
  gap_ng_kg: number;
  gap_crushing_kg: number;
  difference_kg: number;
  ratio_percent: number;
  total_prod_act_pcs: number;
  total_prod_ng_pcs: number;
}

export interface AnalyticsSummary {
  total_allowance_kg: number;
  total_input_kg: number;
  total_actual_output_kg: number;
  total_system_ng_kg: number;
  total_system_runner_kg: number;
  overall_gap_ng_kg: number;
  overall_gap_crushing_kg: number;
  overall_crushing_efficiency_percent: number;
  total_records_count: number;
  min_date: string | null;
  max_date: string | null;
}

export interface YearlyAnalyticsResponse {
  year: number;
  factory: string;
  summary: AnalyticsSummary;
  monthly_comparison: MonthlyComparisonItem[];
}

export interface ParetoMaterialItem {
  rank: number;
  material_name: string;
  ng_weight_kg: number;
  runner_weight_kg: number;
  total_weight_kg: number;
  total_pcs: number;
  percentage: number;
  cumulative_percentage: number;
}

export interface ParetoMaterialsResponse {
  year: number;
  factory: string;
  grand_total_kg: number;
  total_materials_count: number;
  items: ParetoMaterialItem[];
}

export interface ParetoPartNgItem {
  rank: number;
  part_number: string;
  part_name: string;
  sebango_code: string;
  model_code: string;
  material_name: string;
  total_ng_pcs: number;
  total_ng_kg: number;
  percentage: number;
  cumulative_percentage: number;
}

export interface ParetoPartsNgResponse {
  year: number;
  factory: string;
  grand_total_kg: number;
  grand_total_pcs: number;
  total_parts_count: number;
  items: ParetoPartNgItem[];
}

export interface ProductionAnalyticsItem {
  id: string;
  batch_id: string;
  production_date: string;
  shift: 'Pagi' | 'Malam';
  factory_raw?: string | null;
  tonase_raw?: string | null;
  sebango_code: string;
  mesin_raw?: string | null;
  act_total_pcs: number;
  act_ok_pcs: number;
  ng_total_pcs: number;
  master_part_id?: string | null;
  part_number_snapshot?: string | null;
  part_name_snapshot?: string | null;
  berat_part_gr_snapshot: number;
  calculated_shikake: number;
  allowance_kg: number;
  batch_filename?: string;
  created_at: string;
}

export interface ProductionAnalyticsBatch {
  id: string;
  batch_name: string;
  filename: string;
  min_production_date: string;
  max_production_date: string;
  total_rows: number;
  matched_rows: number;
  total_allowance_kg: number;
  uploaded_by?: string | null;
  uploader_name?: string | null;
  created_at: string;
}

export interface RawProductionCsvRow {
  date: string;
  factory?: string;
  tonase?: string;
  sebango: string;
  shift?: string;
  operator?: string;
  mesin?: string;
  act_total?: number | string;
  act_ok?: number | string;
  ng_total?: number | string;
}

export interface ProductionPreviewSummary {
  total_rows: number;
  matched_rows: number;
  unmatched_rows: number;
  match_rate_percentage: number;
  total_estimated_allowance_kg: number;
  min_date: string;
  max_date: string;
  unique_sebangos_count: number;
  matched_sebangos_count: number;
  unmatched_sebangos_count: number;
  unmatched_sebango_codes: string[];
}

export interface ProductionPreviewItem {
  row_number: number;
  date: string;
  shift: 'Pagi' | 'Malam';
  factory?: string;
  tonase?: string;
  mesin?: string;
  sebango: string;
  act_total: number;
  act_ok: number;
  ng_total: number;
  is_matched: boolean;
  part_number: string | null;
  part_name: string | null;
  berat_part_gr: number;
  calculated_shikake: number;
  allowance_kg: number;
  status: 'matched' | 'unmatched';
  status_message: string;
}

export interface ProductionPreviewResponse {
  summary: ProductionPreviewSummary;
  items: ProductionPreviewItem[];
}
