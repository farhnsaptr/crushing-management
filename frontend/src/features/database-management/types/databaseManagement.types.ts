export interface DatabaseRequestItem {
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
  waste_quantity_pcs: number;
  notes?: string | null;
  created_at: string;
  image_url?: string | null;
  sebango_code?: string | null;
  customer?: string | null;
}

export interface LinkedNgTransaction {
  id: string;
  master_part_id: string;
  part_number_snapshot: string;
  part_name_snapshot: string;
  quantity_pcs: number;
  weight_kg: number;
  recycle_type_snapshot: 'reuse' | 'no_reuse';
  shift: 'Pagi' | 'Malam';
  transaction_date: string;
  notes?: string | null;
}

export interface LinkedRunnerTransaction {
  id: string;
  material_id?: string | null;
  material_name_snapshot: string;
  total_pcs: number;
  total_runner_weight_kg: number;
  shift: 'Pagi' | 'Malam';
  transaction_date: string;
  import_batch_ref?: string | null;
}

export interface DatabaseRequestHeader {
  id: string;
  request_number: string;
  request_date: string;
  shift: 'Pagi' | 'Malam';
  status: 'pending' | 'approved';
  request_type: 'part_ng' | 'runner_ng' | 'mixed';
  total_weight_kg: number;
  total_pcs: number;
  notes?: string | null;
  created_at: string;
  submitted_at?: string | null;
  sender_id: string;
  sender_name?: string | null;
  sender_username?: string | null;
  department_id: string;
  department_name?: string | null;
  department_code?: string | null;
  factory_id?: string | null;
  factory_name?: string | null;
  factory_code?: string | null;
  factory_location?: string | null;
  validated_by?: string | null;
  validator_name?: string | null;
  validated_at?: string | null;
  items_count?: number;
  ng_transactions_count?: number;
  runner_transactions_count?: number;
}

export interface DatabaseRequestDetailResponse {
  request: DatabaseRequestHeader;
  items: DatabaseRequestItem[];
  linked_transactions: {
    ng_transactions: LinkedNgTransaction[];
    runner_transactions: LinkedRunnerTransaction[];
  };
}

export interface DatabasePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListRequestsFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'pending' | 'approved';
  startDate?: string;
  endDate?: string;
  shift?: string;
  departmentId?: string;
  factoryId?: string;
}

export interface DirectNgTransactionItem {
  id: string;
  master_part_id: string;
  request_id?: string | null;
  request_number?: string | null;
  department_id?: string | null;
  department_name?: string | null;
  factory_id?: string | null;
  factory_name?: string | null;
  factory_location?: string | null;
  material_name_snapshot?: string | null;
  part_number_snapshot: string;
  part_name_snapshot: string;
  model_snapshot: string;
  berat_part_gr_snapshot: number;
  quantity_pcs: number;
  weight_kg: number;
  recycle_type_snapshot: 'reuse' | 'no_reuse';
  shift: 'Pagi' | 'Malam';
  transaction_date: string;
  notes?: string | null;
  created_at: string;
  input_by_name?: string | null;
}

export interface DirectRunnerTransactionItem {
  id: string;
  material_id?: string | null;
  request_id?: string | null;
  request_number?: string | null;
  department_id?: string | null;
  department_name?: string | null;
  factory_id?: string | null;
  factory_name?: string | null;
  factory_location?: string | null;
  material_name_snapshot: string;
  total_pcs: number;
  total_runner_weight_kg: number;
  shift: 'Pagi' | 'Malam';
  transaction_date: string;
  import_batch_ref?: string | null;
  created_at: string;
}
