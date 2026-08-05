# Modul Authentication (`auth`)

Modul ini mengelola autentikasi pengguna, penerbitan JSON Web Token (JWT), serta pemeriksaan profil pengguna yang sedang aktif.

## Deskripsi & Logic
1. **Login (`AuthService.login`)**:
   - Menerima `username` dan `password` plain.
   - Mencari user di tabel `users` MySQL.
   - Memeriksa apakah status akun aktif (`is_active = TRUE`).
   - Memverifikasi hash password menggunakan `bcrypt.compare`.
   - Mengenerate JWT token bertipe Bearer yang berisi payload `id`, `username`, `full_name`, dan `role`.
   - Menyimpan token di cookie HTTP-only serta mengembalikan token di respons JSON.
2. **Rate Limiting**:
   - Diproteksi oleh `authLimiter` (maksimal 10 percobaan per 15 menit) untuk mencegah seragan brute-force.
3. **Session Check (`POST /api/auth/me`)**:
   - Diproteksi oleh middleware `verifyToken` untuk membaca dekripsi data user dari header Authorization / cookie.

## Struktur File
```
auth/
├── auth.controller.ts  # Handler HTTP Request/Response
├── auth.service.ts     # Business logic & query MySQL
├── auth.routes.ts      # Routing & Swagger documentation
└── README.md
```

## Daftar Endpoint
| Method | Endpoint | Access | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public (Rate limited) | Login user & dapatkan JWT token |
| `GET` | `/api/auth/me` | Authenticated | Ambil profil user yang sedang login |
| `POST` | `/api/auth/logout` | Authenticated | Hapus cookie token & logout |
