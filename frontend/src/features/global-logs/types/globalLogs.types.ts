export interface AuditLogItem {
  id: string;
  waktu?: string;
  user?: string;
  role?: string;
  metode?: string;
  endpoint?: string;
  ip_address?: string;
  status?: number;
  durasi_ms?: number;
}

export interface AuditLogsResponse {
  logs: AuditLogItem[];
  total: number;
}
