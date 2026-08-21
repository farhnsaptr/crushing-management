# Master Departments Module (Backend)

Modul ini bertanggung jawab untuk pengelolaan master data Departemen (CRUD) yang menjadi dasar identifikasi pengirim part NG dan agregasi Pareto pengiriman material reject.

## Fitur Utama
1. **List & Detail Departemen**: Tersedia untuk semua pengguna terautentikasi (untuk keperluan dropdown dan filter).
2. **Tambah, Edit, Hapus Departemen**: Dibatasi untuk peran `admin` dan `super-admin`.

## Struktur Endpoint
- `GET /api/departments` — Mengambil daftar seluruh departemen terdaftar
- `GET /api/departments/:id` — Mengambil data satu departemen berdasarkan ID
- `POST /api/departments` — Menambahkan departemen baru (`admin`, `super-admin`)
- `PUT /api/departments/:id` — Memperbarui data departemen (`admin`, `super-admin`)
- `DELETE /api/departments/:id` — Menghapus departemen (`admin`, `super-admin`)
