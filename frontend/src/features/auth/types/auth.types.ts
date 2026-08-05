export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    role: 'admin' | 'operator';
  };
}
