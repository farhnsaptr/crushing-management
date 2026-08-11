import type { ParsedCsvRow } from '../utils/csvParser.util';

export type { ParsedCsvRow };

export interface MatchedSebangoDetail {
  sebango_code: string;
  part_number: string;
  part_name: string;
  act_pcs: number;
  berat_runner_gr: number;
  runner_weight_kg: number;
  shifts: string[];
}

export interface MaterialRunnerPreviewItem {
  material_id: string | null;
  material_name: string;
  total_pcs: number;
  total_runner_weight_kg: number;
  sebango_count: number;
  sebango_details: MatchedSebangoDetail[];
}

export interface UnmatchedSebangoItem {
  sebango_code: string;
  act_pcs: number;
  reason: string;
}

export interface RunnerMaterialPreviewResponse {
  transaction_date: string;
  batch_ref: string;
  matched_materials: MaterialRunnerPreviewItem[];
  unmatched_sebangos: UnmatchedSebangoItem[];
  summary: {
    total_csv_rows: number;
    unique_sebangos: number;
    matched_sebangos: number;
    unmatched_sebangos: number;
    total_materials: number;
    total_runner_weight_kg: number;
  };
}

export interface RunnerMaterialSavePayload {
  transaction_date: string;
  batch_ref?: string;
  items: Array<{
    material_id?: string | null;
    material_name: string;
    total_pcs: number;
    total_runner_weight_kg: number;
  }>;
}

export interface RunnerMaterialRecord {
  id: string;
  material_id: string | null;
  material_name_snapshot: string;
  total_pcs: number;
  total_runner_weight_kg: number;
  transaction_date: string;
  import_batch_ref: string | null;
  created_at: string;
}

export interface UpdateRunnerMaterialPayload {
  material_name_snapshot?: string;
  total_pcs?: number;
  total_runner_weight_kg?: number;
  transaction_date?: string;
}

export interface RunnerMaterialSummaryItem {
  rank: number;
  material_name: string;
  material_id: string | null;
  total_runner_weight_kg: number;
  total_transactions: number;
  last_transaction_date: string;
  percentage: number;
}

export interface RunnerMaterialAnalyticsSummaryResponse {
  year: number;
  month: number | null;
  grandTotalKg: number;
  totalMaterialsCount: number;
  materials: RunnerMaterialSummaryItem[];
}

export interface RunnerMonthlyTrendItem {
  month: string;
  monthNum: number;
  total_runner_weight_kg: number;
}

export interface RunnerMaterialAnalyticsDetailResponse {
  materialName: string;
  year: number;
  totalWeightKg: number;
  totalTransactions: number;
  monthlyTrend: RunnerMonthlyTrendItem[];
  transactions: RunnerMaterialRecord[];
}


