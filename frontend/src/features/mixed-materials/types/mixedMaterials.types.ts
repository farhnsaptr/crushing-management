export type RecycleType = 'reuse' | 'no_reuse';

export interface MixedMaterial {
  id: string;
  mixed_name: string;
  description?: string | null;
  recycle_type: RecycleType;
  members_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface MixedMaterialPayload {
  mixed_name: string;
  description?: string;
  recycle_type: RecycleType;
}

export interface MixedMaterialMember {
  id: string;
  material_name: string;
  recycle_type: RecycleType;
  used_parts_count: number;
}

export interface MixedMaterialMembersResponse {
  mixed: MixedMaterial;
  members: MixedMaterialMember[];
  totalMembers: number;
}
