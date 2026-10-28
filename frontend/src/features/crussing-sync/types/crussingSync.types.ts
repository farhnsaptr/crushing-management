export type CrussingSyncStatusValue = 'success' | 'partial' | 'failed';

export interface CrussingManualOverlap {
 analytics_rows: number;
 runner_rows: number;
}

export interface CrussingSyncStatus {
 location: string;
 external_location: string | null;
 date_from: string;
 date_to: string;
 mapped: boolean;
 last_status: CrussingSyncStatusValue | null;
 last_success_at: string | null;
 last_attempt_at: string | null;
 records_received: number;
 analytics_rows: number;
 runner_rows: number;
 unmatched_sebangos: number;
 last_error: string | null;
 manual_overlap: CrussingManualOverlap;
}

export interface CrussingSyncResult {
 location: string;
 external_location: string;
 date_from: string;
 date_to: string;
 synced_at: string;
 duration_ms: number;
 last_status: 'success' | 'partial';
 records_received: number;
 analytics: {
 rows: number;
 allowance_kg: number;
 unmatched_rows: number;
 };
 runner: {
 rows: number;
 total_kg: number;
 };
 unmatched_sebangos: string[];
 warnings: string[];
}

export interface UnmatchedSebangoItem {
  code: string;
  raw: string;
  count: number;
  total_pcs: number;
  part_no?: string;
  material_name?: string;
  reason: string;
}

export interface UnmatchedSebangosResponse {
  location: string;
  external_location: string;
  date_from: string;
  date_to: string;
  total_unmatched_codes: number;
  total_unmatched_rows: number;
  total_unmatched_pcs: number;
  items: UnmatchedSebangoItem[];
}
