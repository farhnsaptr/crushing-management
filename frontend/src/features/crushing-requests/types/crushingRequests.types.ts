export interface CrushingRequestItem {
  id: string;
  request_id: string;
  item_type: 'part_ng' | 'runner_ng';
  master_part_id?: string | null;
  material_id?: string | null;
  part_number_snapshot?: string | null;
  part_name_snapshot?: string | null;
  model_snapshot?: string | null;
  material_name_snapshot?: string | null;
  berat_part_gr_snapshot?: number | null;
  quantity_pcs: number;
  weight_kg: number;
  verified_quantity_pcs?: number | null;
  verified_weight_kg?: number | null;
  adjustment_notes?: string | null;
  notes?: string | null;
  image_url?: string | null;
  created_at: string;
}

export interface CrushingRequest {
  id: string;
  request_number: string;
  sender_id: string;
  sender_name?: string;
  sender_username?: string;
  factory_id: string;
  factory_name?: string;
  factory_code?: string;
  department_id: string;
  department_name?: string;
  department_code?: string;
  request_type: 'part_ng' | 'runner_ng' | 'mixed';
  shift: 'Pagi' | 'Malam';
  request_date: string;
  status: 'pending' | 'approved';
  rejection_reason?: string | null;
  validated_by?: string | null;
  validator_name?: string | null;
  validated_at?: string | null;
  submitted_total_weight_kg?: number;
  submitted_total_pcs?: number;
  total_weight_kg: number;
  total_pcs: number;
  notes?: string | null;
  item_count?: number;
  created_at: string;
  updated_at: string;
  items?: CrushingRequestItem[];
}

export interface ApproveItemAdjustmentPayload {
  id: string;
  verified_quantity_pcs?: number;
  verified_weight_kg?: number;
  adjustment_notes?: string;
}

export interface ApproveCrushingRequestPayload {
  notes?: string;
  items?: ApproveItemAdjustmentPayload[];
}

export interface CreateRequestItemPayload {
  item_type: 'part_ng' | 'runner_ng';
  master_part_id?: string;
  material_id?: string;
  material_name?: string;
  part_number?: string;
  model_code?: string;
  image_url?: string | null;
  berat_part_gr?: number;
  quantity_pcs: number;
  runner_weight_kg?: number;
  notes?: string;
}

export interface CreateCrushingRequestPayload {
  request_type?: 'part_ng' | 'runner_ng' | 'mixed';
  shift: 'Pagi' | 'Malam';
  request_date: string;
  notes?: string;
  factory_id?: string;
  department_id?: string;
  items: CreateRequestItemPayload[];
}

export interface CrushingRequestListResponse {
  requests: CrushingRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
