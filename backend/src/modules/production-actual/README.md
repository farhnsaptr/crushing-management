# Modul Production Actual (`production-actual`)

Modul ini menangani proses import data produksi aktual yang diexport secara berkala dari sistem MIS shopfloor lama (`Report__Production.csv`).

## Deskripsi & Logic
1. **Pencocokan Sebango & Snapshotting (`ProductionActualService.importRecords`)**:
   - Menerima batch record dari file CSV/JSON dengan kolom utama: `DATE`, `SEBANGO`, `SHIFT` (`D` / `N`), dan `ACT TOTAL`.
   - Melakukan join ke `master_parts` berdasarkan `sebango_code` untuk mengambil `berat_runner_gr`.
   - Mengubah kode shift (`D` $\rightarrow$ `Pagi`, `N` $\rightarrow$ `Malam`).
2. **Kalkulasi Berat Runner**:
   - Nilai `runner_weight_kg` dihitung otomatis di MySQL:
     $$\text{runner\_weight\_kg} = \frac{\text{actual\_qty\_pcs} \times \text{berat\_runner\_gr\_snapshot}}{1000}$$
3. **Idempotency & Re-import (`ON DUPLICATE KEY UPDATE`)**:
   - Menggunakan Unique Key `uq_part_date_shift` (`master_part_id`, `production_date`, `shift`). Jika file CSV di-import ulang, data yang ada akan diperbarui tanpa membuat duplikat.
4. **Rate Limiting**:
   - Endpoint diproteksi oleh `importLimiter` (maksimal 20 import per 15 menit) untuk mencegah overload database.

## Struktur File
```
production-actual/
├── productionActual.controller.ts  # Input validation
├── productionActual.service.ts     # Join master part, mapping shift, ON DUPLICATE KEY UPDATE
├── productionActual.routes.ts      # Rate-limited routing & Swagger docs
└── README.md
```

## Daftar Endpoint
| Method | Endpoint | Access | Deskripsi |
|---|---|---|---|
| `POST` | `/api/production-actual/import` | Authenticated (Rate limited) | Import batch data produksi aktual dari CSV MIS lama |
| `GET` | `/api/production-actual` | Authenticated | Lihat riwayat data produksi aktual yang diimport |
