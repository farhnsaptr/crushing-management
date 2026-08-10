export interface MasterPart {
  id: string;
  sebango_code: string;
  machine_id: string;
  machine_code?: string;
  machine_name?: string;
  factory_code?: string;
  factory_name?: string;
  customer: string;
  model_id: string;
  model_code?: string;
  part_number: string;
  part_name: string;
  jenis_part: string;
  material: string;
  shikake: number;
  qty_day?: number;
  prod_lot?: number;
  qty_kbn?: number;
  berat_part_gr: number;
  berat_runner_gr?: number;
  std_qty_ng?: number;
  allowance_kg?: number;
  image_url?: string;
  created_at?: string;
}

export interface CreateMasterPartPayload {
  sebango_code: string;
  machine_id: string;
  customer: string;
  model_id: string;
  part_number: string;
  part_name: string;
  jenis_part: string;
  material: string;
  shikake?: number;
  qty_day?: number;
  prod_lot?: number;
  qty_kbn?: number;
  berat_part_gr: number;
  berat_runner_gr?: number;
  image_url?: string;
}

export interface ParsedPartRow {
  rowIndex: number;
  sebango_code: string;
  location: string;
  machine_code: string;
  customer: string;
  model_code: string;
  part_number: string;
  part_name: string;
  jenis_part: string;
  material: string;
  shikake: number;
  qty_day: number;
  prod_lot: number;
  qty_kbn: number;
  berat_part_gr: number;
  berat_runner_gr: number;
  std_qty_ng: number;
  allowance_kg: number;
  isValid: boolean;
  skipReason?: string;
}

export interface ImportPreviewResult {
  summary: {
    totalRows: number;
    validCount: number;
    skippedCount: number;
  };
  previewRows: ParsedPartRow[];
}
