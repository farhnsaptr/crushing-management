# Modul User Management (`src/features/users`)

Modul ini menyediakan antarmuka bagi Administrator untuk mengelola akun pengguna sistem.

## Fitur Utama
1. **Daftar Pengguna**: Menampilkan tabel pengguna (`full_name`, `username`, `role`, `status`, `created_at`).
2. **Pencarian Instant**: Filter pengguna berdasarkan nama, username, atau role.
3. **Tambah Pengguna Baru**: Modal form pembuatan akun baru (`admin` / `operator`).
4. **Toggle Status Keaktifan**: Mengubah status aktif/non-aktif akun secara instant (`PUT /api/users/:id/status`).
5. **Hapus Pengguna**: Menghapus akun pengguna dari sistem (`DELETE /api/users/:id`).
