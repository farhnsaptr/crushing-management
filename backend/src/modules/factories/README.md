# Modul Factories (`factories`)

Modul ini mengelola master data pabrik/lokasi operasional PT Sugity Creatives.

## Deskripsi & Logic
1. **Pemisahan Entitas Pabrik**:
   - Lokasi pabrik dipisah ke dalam tabel `factories` (bukan string statis di master parts).
   - Menyimpan `id` (UUID), `code` (misal FAC2, FAC3), `name` (misal FACTORY 2), dan `location`.
2. **Hak Akses**:
   - Operator & Admin dapat membaca daftar pabrik (`GET /api/factories`).
   - Admin dapat menambah, mengubah, dan menghapus data pabrik (`POST`, `PUT`, `DELETE`).

## Daftar Endpoint
| Method | Endpoint | Access | Deskripsi |
|---|---|---|---|
| `GET` | `/api/factories` | Authenticated | Ambil daftar seluruh pabrik |
| `GET` | `/api/factories/:id` | Authenticated | Ambil detail pabrik berdasarkan ID |
| `POST` | `/api/factories` | Admin Only | Tambah data pabrik baru |
| `PUT` | `/api/factories/:id` | Admin Only | Update data pabrik |
| `DELETE` | `/api/factories/:id` | Admin Only | Hapus data pabrik |
