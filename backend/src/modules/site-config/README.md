# Modul Site Configuration (`site-config`)

Modul ini mengelola konfigurasi variabel tema visual aplikasi frontend (3 warna x 2 tema = 6 warna total).

## Deskripsi & Logic
1. **Aturan Skema Database (`init.sql`)**:
   - Kolom `key` pada tabel `site_config` bertipe `ENUM`:
     `'theme_light_primary'`, `'theme_light_secondary'`, `'theme_light_accent'`,
     `'theme_dark_primary'`, `'theme_dark_secondary'`, `'theme_dark_accent'`
   - Menjamin di level database bahwa hanya 6 kombinasi warna yang valid.
2. **Validasi Hex Color Backend (`SiteConfigService.updateConfig`)**:
   - Backend memverifikasi format string hex color dengan Regex `/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/`.
   - Mengatur `updated_by` dengan Foreign Key yang menunjuk ke `users(id)` pengguna admin yang memperbarui.
3. **Pembacaan Publik / Terautentikasi**:
   - Frontend membaca endpoint `GET /api/site-config` saat aplikasi pertama kali dimuat (load) untuk diset ke dalam CSS variables (`--color-primary`, `--color-secondary`, `--color-accent`).

## Struktur File
```
site-config/
├── siteConfig.controller.ts  # Request handler
├── siteConfig.service.ts     # Hex validation & DB update
├── siteConfig.routes.ts      # Public read / Admin update routes & Swagger docs
└── README.md
```

## Daftar Endpoint
| Method | Endpoint | Access | Deskripsi |
|---|---|---|---|
| `GET` | `/api/site-config` | Public / Auth | Ambil 6 variabel warna tema frontend |
| `PUT` | `/api/site-config` | Admin Only | Update variabel warna tema frontend (hex color) |
