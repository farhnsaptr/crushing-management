# Modul User Management (`users`)

Modul ini khusus digunakan oleh **Admin** untuk mengelola akun operator dan admin lainnya dalam sistem.

## Deskripsi & Logic
1. **Hak Akses Eksklusif Admin**:
   - Seluruh endpoint di modul ini diproteksi oleh middleware `requireRole(['admin'])`. Operator tidak dapat mengakses modul ini (403 Forbidden).
2. **Tambah User Baru (`UsersService.createUser`)**:
   - Memeriksa keunikan `username` di tabel `users`.
   - Meng-hash password menggunakan `bcrypt` sebelum disimpan ke MySQL database.
   - Menyimpan role yang diperbolehkan (`admin` atau `operator`).
3. **Aktivasi / Non-aktivasi Akun (`UsersService.updateUserStatus`)**:
   - Mengubah flag `is_active` (true/false) untuk mengontrol izin login pengguna tanpa menghapus riwayat transaksi historical yang telah dibuat oleh user tersebut.

## Struktur File
```
users/
├── users.controller.ts  # Handler HTTP request
├── users.service.ts     # Business logic & MySQL query
├── users.routes.ts      # Route guard (admin only) & Swagger docs
└── README.md
```

## Daftar Endpoint
| Method | Endpoint | Access | Deskripsi |
|---|---|---|---|
| `GET` | `/api/users` | Admin Only | Ambil daftar seluruh user |
| `POST` | `/api/users` | Admin Only | Buat akun user baru (operator/admin) |
| `PUT` | `/api/users/:id/status` | Admin Only | Ubah status aktif/nonaktif user |
| `DELETE` | `/api/users/:id` | Admin Only | Hapus akun user |
