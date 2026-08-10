# Modul NG Transactions (`ng-transactions`)

Modul ini mengelola pencatatan transaksi part NG (reject/not good) yang diinput oleh operator lewat halaman ketik maupun halaman scan QR.

## Deskripsi & Logic
1. **Historical Snapshotting (`NgTransactionsService.createTransaction`)**:
   - Saat transaksi NG disimpan, sistem membaca data master part dan menyimpan snapshot (`part_number_snapshot`, `part_name_snapshot`, `model_snapshot`, `berat_part_gr_snapshot`) ke tabel `ng_transactions`.
   - Hal ini menjamin integritas laporan historis agar tidak berubah meskipun master part mengalami pengeditan di kemudian hari.
2. **Kalkulasi Berat Otomatis (Stored Generated Column)**:
   - Nilai `weight_kg` dihitung di level MySQL via formula:
     $$\text{weight\_kg} = \frac{\text{quantity\_pcs} \times \text{berat\_part\_gr\_snapshot}}{1000}$$
3. **Real-time SSE Broadcast**:
   - Sesaat setelah data tersimpan di MySQL, `NgTransactionsService` memicu event `broadcastSseEvent('ng_transaction_created', data)` yang secara otomatis memperbarui tampilan dashboard pada layar pengguna tanpa perlu reload.

## Struktur File
```
ng-transactions/
├── ngTransactions.controller.ts  # Validation & HTTP response
├── ngTransactions.service.ts     # Snapshotting logic, DB query, & SSE trigger
├── ngTransactions.routes.ts      # Routing & Swagger docs
└── README.md
```

## Daftar Endpoint
| Method | Endpoint | Access | Deskripsi |
|---|---|---|---|
| `POST` | `/api/ng-transactions` | Authenticated | Catat transaksi NG baru (ketik/scan) |
| `GET` | `/api/ng-transactions` | Authenticated | Ambil riwayat transaksi NG (filter tanggal & shift) |
| `GET` | `/api/ng-transactions/summary-by-material` | Authenticated | Ambil ringkasan pareto material & part berdasar bulan & tahun |
| `GET` | `/api/ng-transactions/part-detail/:partId` | Authenticated | Ambil analitik detail part, grafik harian shift & allowance, serta log transaksi |
