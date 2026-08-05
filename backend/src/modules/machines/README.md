# Modul Machines (`machines`)

Modul ini mengelola master data mesin cetak injection molding dan relasinya ke pabrik (`factory_id`).

## Deskripsi & Logic
1. **Pemisahan Entitas Mesin**:
   - Informasi mesin disimpan pada tabel `machines` (bukan string statis di master parts).
   - Menyimpan `id` (UUID), `factory_id` (FK ke `factories`), `code` (misal MC-01), `name` (misal #1 3500T), `tonnage`, dan `status`.
2. **Filter per Pabrik (`GET /api/machines/by-factory/:factory_id`)**:
   - Memungkinkan dropdown mesin pada UI terisi secara dinamis sesuai pabrik yang dipilih.

## Daftar Endpoint
| Method | Endpoint | Access | Deskripsi |
|---|---|---|---|
| `GET` | `/api/machines` | Authenticated | Ambil daftar seluruh mesin |
| `GET` | `/api/machines/by-factory/:factory_id` | Authenticated | Ambil daftar mesin aktif per pabrik |
| `GET` | `/api/machines/:id` | Authenticated | Ambil detail mesin berdasarkan ID |
| `POST` | `/api/machines` | Admin Only | Tambah data mesin baru |
| `PUT` | `/api/machines/:id` | Admin Only | Update data mesin |
| `DELETE` | `/api/machines/:id` | Admin Only | Hapus data mesin |
