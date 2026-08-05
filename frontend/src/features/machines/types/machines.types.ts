export interface Machine {
  id: string;
  factory_id: string;
  factory_code?: string;
  factory_name?: string;
  code: string;
  name: string;
  type: string;
  tonnage?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface CreateMachinePayload {
  factory_id: string;
  code: string;
  name: string;
  type?: string;
  tonnage?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateMachinePayload {
  factory_id?: string;
  code?: string;
  name?: string;
  type?: string;
  tonnage?: string;
  status?: 'active' | 'inactive';
}
