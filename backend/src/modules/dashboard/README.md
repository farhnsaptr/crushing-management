# Modul Dashboard (`dashboard`)

Modul ini mengagregasikan seluruh data transaksi produksi dan material daur ulang untuk ditampilkan pada dashboard utama serta menyediakan streaming data real-time via Server-Sent Events (SSE).

## Deskripsi & Logic (Rumus Bisnis di Backend)
1. **Ringkasan Total (`DashboardService.getSummaryStats`)**:
   - $\text{Input (kg)} = \sum (\text{ng\_transactions.weight\_kg})$
   - $\text{Runner (kg)} = \sum (\text{production\_actual.runner\_weight\_kg})$
   - $\text{Output (kg)} = \text{Input (kg)} + \text{Runner (kg)}$ (rendemen dianggap 100%)
   - $\text{Waste (kg)} = (\text{Input} + \text{Runner}) - \text{Output} = 0$
2. **Grafik Batang Tumpuk Harian (`v_daily_recycle_summary`)**:
   - Membaca data total kg per hari per shift (Pagi/Malam) selama sebulan.
3. **Tabel Pareto Material (`v_pareto_material`)**:
   - Mengelompokkan transaksi berdasarkan jenis material dan mengurutkannya dari total kg terbanyak.
4. **Tabel Part NG Terbanyak (`v_part_ng_terbanyak`)**:
   - Mengurutkan part reject berdasarkan total pcs terbanyak.
5. **Real-time SSE Connection (`GET /api/dashboard/stream`)**:
   - Endpoint `text/event-stream` tanpa buffering untuk mengirimkan update instan ke frontend ketika terjadi input transaksi baru.
6. **Export Data (`GET /api/dashboard/export`)**:
   - Mengkonsolidasikan data ringkasan, pareto, dan top NG part ke dalam format dataset konsisten yang siap di-export ke Excel oleh frontend.

## Struktur File
```
dashboard/
├── dashboard.controller.ts  # SSE handler & HTTP response wrapper
├── dashboard.service.ts     # Agregasi rumus bisnis, views query, & SSE integration
├── dashboard.routes.ts      # Dashboard routing & Swagger docs
└── README.md
```

## Daftar Endpoint
| Method | Endpoint | Access | Deskripsi |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Authenticated | Ambil total Input, Runner, Output, dan Waste (kg) |
| `GET` | `/api/dashboard/daily-chart` | Authenticated | Ambil data grafik harian per shift |
| `GET` | `/api/dashboard/pareto-material`| Authenticated | Ambil tabel pareto material recycle |
| `GET` | `/api/dashboard/top-ng-parts` | Authenticated | Ambil tabel top part NG terbanyak |
| `GET` | `/api/dashboard/stream` | Authenticated | Server-Sent Events (SSE) stream endpoint |
| `GET` | `/api/dashboard/export` | Authenticated | Export dataset laporan dashboard |
