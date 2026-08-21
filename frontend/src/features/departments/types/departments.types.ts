export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateDepartmentPayload {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateDepartmentPayload {
  code?: string;
  name?: string;
  description?: string;
}
