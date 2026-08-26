# Crushing Requests Module (Backend)

Modul ini mengelola siklus pengajuan pengiriman part NG dan runner NG dari departemen pengirim ke operator/admin crushing untuk menjamin *traceability* dan integritas data fisik.

## Alur Kerja (Workflow)
1. **Pengirim** membuat pengajuan pengiriman baru (`POST /api/crushing-requests`).
   - Sistem memvalidasi bahwa part yang dipilih berasal dari pabrik yang ditugaskan ke akun pengirim.
   - Shift dan tanggal operasional server otomatis dihitung dan dikunci.
   - Perhitungan estimasi berat dilakukan di backend (`weight_kg = quantity_pcs * berat_part_gr / 1000`).
   - Pengajuan dibuat dengan status `pending` dan notifikasi disiarkan lewat SSE (`crushing_request_created`).
   - Pengirim dapat membatalkan pengiriman instan jika salah kirim (`DELETE /api/crushing-requests/:id`).
2. **Operator / Admin** memvalidasi fisik di lapangan vs data pengajuan di sistem:
   - **Verifikasi & Setujui (`PATCH /:id/approve`)**:
     - Operator memeriksa kecocokan fisik setiap item.
     - Jika ada selisih (kurang/lebih fisik), operator memasukkan kuantitas terverifikasi (`verified_quantity_pcs`, `verified_weight_kg`) dan catatan penyesuaian (`adjustment_notes`).
     - Data asli pengajuan pengirim (`quantity_pcs`, `weight_kg`) **tetap tersimpan utuh di database** sebagai audit trail.
     - Mengubah status menjadi `approved`, mencatat validator, dan secara otomatis menyinkronkan data fisik terverifikasi ke `ng_transactions` / `runner_material_transactions`.

## Endpoint
- `POST /api/crushing-requests` — Membuat pengajuan pengiriman NG baru
- `GET /api/crushing-requests` — Mengambil daftar pengiriman (pengirim hanya melihat miliknya; operator/admin melihat semua dengan filter)
- `GET /api/crushing-requests/:id` — Mengambil detail pengiriman beserta rincian item asli dan terverifikasi
- `DELETE /api/crushing-requests/:id` — Membatalkan pengiriman pending (Undo pengirim)
- `PATCH /api/crushing-requests/:id/approve` — Menyetujui & memvalidasi pengiriman dengan penyesuaian fisik (`operator`, `admin`, `super-admin`)
- `GET /api/crushing-requests/draft` — Mengambil draf pengiriman sementara dari Redis
- `PUT /api/crushing-requests/draft` — Menyimpan draf pengiriman sementara ke Redis
- `DELETE /api/crushing-requests/draft` — Menghapus draf pengiriman dari Redis
