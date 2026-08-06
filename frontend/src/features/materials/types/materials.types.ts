export interface Material {
  id: string;
  material_name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMaterialPayload {
  material_name: string;
  description?: string;
}
