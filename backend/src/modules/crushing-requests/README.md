# Crushing Requests Module (Backend)

Modul ini mengelola siklus pengajuan pengiriman part NG dan runner NG dari departemen pengirim ke operator/admin crushing untuk menjamin *traceability* dan integritas data fisik dengan penyimpanan draf langsung di database MySQL.

## Alur Kerja (Workflow)
1. **Penyimpanan Draf di MySQL (`is_submitted = FALSE`)**:
   - Saat pengirim menyusun item di keranjang pengiriman, draf tersimpan langsung di tabel `crushing_requests` & `crushing_request_items` dengan `is_submitted = FALSE`.
   - Data draf ini persisten lintas browser dan perangkat.
   - Operator **tidak akan melihat** baris yang berstatus `is_submitted = FALSE`.
2. **Submit Pengiriman Resmi (`POST /api/crushing-requests` atau `is_submitted = TRUE`)**:
   - Saat pengirim menekan tombol submit, status draf diubah menjadi `is_submitted = TRUE` dan `submitted_at = NOW()`.
   - Shift dan tanggal operasional server otomatis dikunci.
   - Perhitungan estimasi berat dilakukan di backend (`weight_kg = quantity_pcs * berat_part_gr / 1000`).
   - Notifikasi real-time disiarkan ke operator lewat SSE (`crushing_request_created`).
   - Pengirim dapat membatalkan pengiriman instan jika salah kirim (`DELETE /api/crushing-requests/:id`).
3. **Operator / Admin** memvalidasi fisik di lapangan vs data pengajuan di sistem:
   - **Verifikasi & Setujui (`PATCH /:id/approve`)**:
     - Operator memeriksa kecocokan fisik setiap item.
     - Jika ada selisih (kurang/lebih fisik), operator memasukkan kuantitas terverifikasi (`verified_quantity_pcs`, `verified_weight_kg`) dan catatan penyesuaian (`adjustment_notes`).
     - Data asli pengajuan pengirim (`quantity_pcs`, `weight_kg`) **tetap tersimpan utuh di database** sebagai audit trail.
     - Mengubah status menjadi `approved`, mencatat validator, dan secara otomatis menyinkronkan data fisik terverifikasi ke `ng_transactions` / `runner_material_transactions`.

## Endpoint
- `POST /api/crushing-requests` — Membuat/mengajukan pengiriman NG resmi (`is_submitted = TRUE`)
- `GET /api/crushing-requests` — Mengambil daftar pengiriman yang telah di-submit (`is_submitted = TRUE`)
- `GET /api/crushing-requests/:id` — Mengambil detail pengiriman beserta rincian item asli dan terverifikasi
- `DELETE /api/crushing-requests/:id` — Membatalkan pengiriman pending (Undo pengirim)
- `PATCH /api/crushing-requests/:id/approve` — Menyetujui & memvalidasi pengiriman dengan penyesuaian fisik (`operator`, `admin`, `super-admin`)
- `GET /api/crushing-requests/draft` — Mengambil draf pengiriman aktif dari database MySQL (`is_submitted = FALSE`)
- `PUT /api/crushing-requests/draft` — Menyimpan draf pengiriman ke database MySQL (`is_submitted = FALSE`)
- `DELETE /api/crushing-requests/draft` — Menghapus draf pengiriman dari database MySQL
