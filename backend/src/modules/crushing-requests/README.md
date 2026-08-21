# Crushing Requests Module (Backend)

Modul ini mengelola siklus tiket permintaan (*request*) pengiriman part NG dan runner NG dari departemen pengirim ke operator/admin crushing untuk menjamin *traceability* data.

## Alur Kerja (Workflow)
1. **Pengirim** membuat tiket request baru (`POST /api/crushing-requests`).
   - Sistem memvalidasi bahwa part yang dipilih berasal dari pabrik yang ditugaskan ke akun pengirim.
   - Perhitungan estimasi berat dilakukan di backend (`weight_kg = quantity_pcs * berat_part_gr / 1000`).
   - Tiket dibuat dengan status `pending` dan notifikasi disiarkan lewat SSE (`crushing_request_created`).
2. **Operator / Admin** memvalidasi fisik di lapangan vs data di sistem:
   - **Setujui (`PATCH /:id/approve`)**: Mengubah status menjadi `approved`, mencatat validator, dan secara otomatis menyinkronkan data ke `ng_transactions` / `runner_material_transactions` berelasi ke `request_id`, `department_id`, dan `factory_id`.
   - **Tolak (`PATCH /:id/reject`)**: Mengubah status menjadi `rejected` dengan alasan penolakan wajib diisi.

## Endpoint
- `POST /api/crushing-requests` — Membuat tiket pengiriman NG baru
- `GET /api/crushing-requests` — Mengambil daftar tiket (pengirim hanya melihat miliknya; operator/admin melihat semua dengan filter)
- `GET /api/crushing-requests/:id` — Mengambil detail tiket request beserta rincian item
- `PATCH /api/crushing-requests/:id/approve` — Menyetujui tiket pengiriman (`operator`, `admin`, `super-admin`)
- `PATCH /api/crushing-requests/:id/reject` — Menolak tiket pengiriman dengan alasan penolakan (`operator`, `admin`, `super-admin`)
