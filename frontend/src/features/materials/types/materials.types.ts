export interface Material {
  id: string;
  material_name: string;
  description?: string;
  recycle_type: 'reuse' | 'no_reuse';
  mixed_material_id?: string | null; // campuran tempat material ini dimasukkan
  mixed_material_name?: string | null;
  used_parts_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMaterialPayload {
  material_name: string;
  description?: string;
  recycle_type?: 'reuse' | 'no_reuse';
  mixed_material_id?: string | null; // null = lepas dari campuran
}

export interface MaterialPartDetail {
  id: string;
  part_number: string;
  part_name: string;
  sebango_code: string;
  berat_part_gr: number;
  berat_runner_gr: number | null;
  jenis_part: string;
  customer: string;
  is_active: boolean;
  model_code: string;
  model_description: string | null;
  machine_code: string;
  machine_name: string;
  factory_name: string;
}

export interface MaterialPartsResponse {
  material: Material;
  parts: MaterialPartDetail[];
  totalParts: number;
}
