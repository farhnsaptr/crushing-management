# User Management Module (Backend)

Modul ini mengelola data autentikasi dan otorisasi pengguna sistem Recycle Material Management.

## Peran Pengguna (Roles)
1. **`pengirim`** — Pengguna yang mengirimkan part NG/runner, wajib terikat dengan `factory_id` dan `department_id`.
2. **`operator`** — Petugas operasional crushing yang memvalidasi dan menyetujui request pengiriman, input NG, dan verifikasi box output.
3. **`admin`** — Administrator yang mengelola master data pabrik, mesin, material, part, dan departemen.
4. **`super-admin`** — Akses menyeluruh ke seluruh sistem termasuk User Management, Global Audit Logs, dan Site Configuration.

## Endpoint
- `GET /api/users` — Mengambil daftar akun pengguna (`super-admin`)
- `POST /api/users` — Menambahkan akun pengguna baru (`super-admin`)
- `PUT /api/users/:id` — Memperbarui profil, role, atau password pengguna (`super-admin`)
- `PATCH /api/users/:id/status` — Mengaktifkan/menonaktifkan status akun (`super-admin`)
- `DELETE /api/users/:id` — Menghapus akun pengguna (`super-admin`)
