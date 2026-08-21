export type UserRole = 'super-admin' | 'admin' | 'operator' | 'pengirim';

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  factory_id?: string | null;
  factory_name?: string | null;
  department_id?: string | null;
  department_name?: string | null;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  full_name: string;
  role: UserRole;
  factory_id?: string | null;
  department_id?: string | null;
}

export interface UpdateUserPayload {
  full_name?: string;
  role?: UserRole;
  factory_id?: string | null;
  department_id?: string | null;
  password?: string;
}
