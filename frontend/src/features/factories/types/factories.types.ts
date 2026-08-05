export interface Factory {
  id: string;
  code: string;
  name: string;
  location?: string;
  created_at?: string;
}

export interface CreateFactoryPayload {
  code: string;
  name: string;
  location?: string;
}

export interface UpdateFactoryPayload {
  code?: string;
  name?: string;
  location?: string;
}
