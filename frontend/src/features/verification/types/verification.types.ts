export interface VerificationItem {
  material_id?: string | null;
  material_name: string;
  system_ng_weight_kg: number;
  system_runner_weight_kg: number;
  system_total_weight_kg: number;
  box_count: number | '';
  kg_per_box: number | '';
  actual_output_kg: number;
  crushing_waste_kg: number;
}

export interface VerificationHeader {
  id: string;
  status: 'pending' | 'validated';
  total_system_weight_kg: number;
  total_actual_output_kg: number;
  total_crushing_waste_kg: number;
  notes?: string;
  validated_by?: string;
  validated_by_name?: string;
  validated_at?: string;
}

export interface VerificationSummary {
  total_materials_count: number;
  total_system_weight_kg: number;
  total_actual_output_kg: number;
  total_crushing_waste_kg: number;
}

export interface VerificationDetailResponse {
  date: string;
  shift: 'Pagi' | 'Malam';
  has_input?: boolean;
  is_validated: boolean;
  header: VerificationHeader | null;
  summary: VerificationSummary;
  items: VerificationItem[];
}

export interface SaveVerificationPayload {
  verification_date: string;
  shift: 'Pagi' | 'Malam';
  notes?: string;
  items: Array<{
    material_id?: string | null;
    material_name: string;
    system_ng_weight_kg: number;
    system_runner_weight_kg: number;
    system_total_weight_kg: number;
    box_count: number;
    kg_per_box: number;
  }>;
}

export interface VerificationDashboardStatusResponse {
  date: string;
  shift: 'Pagi' | 'Malam';
  has_input: boolean;
  is_validated: boolean;
  status: 'no_input' | 'pending' | 'validated';
  message: string;
  header: {
    id: string;
    status: 'pending' | 'validated';
    total_system_weight_kg: number;
    total_actual_output_kg: number;
    total_crushing_waste_kg: number;
    validated_by_name?: string;
    validated_at?: string;
  } | null;
}
