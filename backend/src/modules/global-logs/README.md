# Modul Global Audit Logs (`global-logs`)

Modul ini khusus digunakan oleh **Admin & Super-Admin** untuk memantau jejak audit (*audit trail*) dari seluruh HTTP request API yang masuk ke sistem secara terpusat di MySQL.

## Deskripsi & Logic
1. **Penyimpanan di Database MySQL (`api_audit_logs`)**:
   - Seluruh aktivitas API dicatat otomatis oleh middleware global `requestLogger` di `app.ts` pada event `res.on('finish')` ke tabel `api_audit_logs`.
   - Menyimpan atribut: `id`, `timestamp`, `method`, `endpoint`, `status_code`, `response_time_ms`, `username`, `role`, dan `ip_address`.
2. **Real-Time Live Streaming**:
   - Setiap kali ada log baru tersimpan, middleware memancarkan event SSE `new_log` ke admin client yang terhubung secara instan.
3. **Pagination & Query (`GlobalLogsService.getLogs`)**:
   - Mengambil log aktivitas berurutan waktu (terbaru ke terlama) dengan limit dan pagination yang efisien.
4. **Pembersihan Log (`GlobalLogsService.clearAllLogs`)**:
   - Mengosongkan data log audit di database saat diperlukan oleh Super-Admin.

## Struktur File
```
global-logs/
├── globalLogs.controller.ts  # Handler endpoints (getLogs, streamLogs, clearAllLogs)
├── globalLogs.service.ts     # Query database MySQL api_audit_logs
├── globalLogs.routes.ts      # Admin-only route guard & Swagger docs
└── README.md
```

## Daftar Endpoint
| Method | Endpoint | Access | Deskripsi |
|---|---|---|---|
| `GET` | `/api/admin/logs` | Admin / Super-Admin | Membaca daftar log request API dari tabel `api_audit_logs` |
| `GET` | `/api/admin/logs/stream` | Admin / Super-Admin | SSE Stream untuk live monitoring aktivitas real-time |
| `DELETE` | `/api/admin/logs` | Super-Admin Only | Menghapus seluruh riwayat log audit di database |
