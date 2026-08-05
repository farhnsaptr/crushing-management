export interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'operator';
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  full_name: string;
  role: 'admin' | 'operator';
}

export interface UpdateUserPayload {
  full_name?: string;
  role?: 'admin' | 'operator';
  password?: string;
}
