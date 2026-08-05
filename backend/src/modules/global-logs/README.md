# Modul Global Audit Logs (`global-logs`)

Modul ini khusus digunakan oleh **Admin** untuk memantau jejak audit (audit trail) dari seluruh HTTP request API yang masuk ke sistem.

## Deskripsi & Logic
1. **Penyimpanan di Redis Streams**:
   - Berbeda dari data transaksi bisnis yang disimpan di MySQL, audit log disimpan di **Redis Streams** (`logs:api-requests`) untuk kecepatan dan throughput tinggi.
   - Dipush oleh middleware global `requestLogger` di `app.ts` pada event `res.on('finish')`.
2. **Trimming Log Otomatis**:
   - Membatasi panjang stream dengan `MAXLEN ~ 50000` (approximate trimming) agar Redis memory tidak meluap.
3. **Pagination & Query (`GlobalLogsService.getLogs`)**:
   - Menggunakan perintah Redis `XREVRANGE` untuk membaca log berurutan waktu (terbaru ke terlama) dengan pagination.
4. **Graceful Fallback**:
   - Jika service Redis belum menyala, API tidak akan crash melainkan merespons dengan pemberitahuan warning secara tertib.

## Struktur File
```
global-logs/
├── globalLogs.controller.ts  # Validation & pagination params
├── globalLogs.service.ts     # Query Redis stream XREVRANGE & XLEN
├── globalLogs.routes.ts      # Admin-only route guard & Swagger docs
└── README.md
```

## Daftar Endpoint
| Method | Endpoint | Access | Deskripsi |
|---|---|---|---|
| `GET` | `/api/admin/logs` | Admin Only | Membaca daftar log request API dari Redis Streams |
