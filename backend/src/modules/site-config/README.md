# Modul Site Configuration (`site-config`)

Modul ini mengelola konfigurasi variabel branding visual (Site Title, Logo, Background Login) dan tema warna aplikasi frontend (Primary, Secondary, Accent untuk mode Terang & Gelap).

> **Catatan Arsitektur**: Pengaturan koneksi MinIO/S3 Storage (Base URL, Bucket Name, Folder Master Parts) sepenuhnya dikonfigurasi melalui environment variables (`.env`) pada backend agar tidak dapat diubah secara bebas oleh pengguna melalui Web UI.

## Deskripsi & Logic
1. **Aturan Skema Database (`init.sql`)**:
   - Kolom `key` pada tabel `site_config` menyimpan key identitas (`site_title`, `site_logo`, `site_background`) dan key palet warna (`theme_light_primary`, `theme_light_secondary`, `theme_light_accent`, `theme_dark_primary`, `theme_dark_secondary`, `theme_dark_accent`).
2. **Validasi Backend (`SiteConfigService.updateConfig`)**:
   - Backend memverifikasi format string hex color dengan Regex `/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/` untuk key palet warna.
   - Mengatur `updated_by` dengan Foreign Key yang menunjuk ke `users(id)` pengguna admin yang memperbarui.
3. **Pembacaan Publik / Terautentikasi**:
   - Frontend membaca endpoint `GET /api/site-config` saat aplikasi pertama kali dimuat (load) untuk diset ke dalam metadata dokumen (title, favicon) dan CSS variables (`--primary-color`, `--secondary-color`, `--accent-color`).

## Struktur File
```
site-config/
├── siteConfig.controller.ts  # Request handler
├── siteConfig.service.ts     # Validation & DB persistence
├── siteConfig.routes.ts      # Public read / Admin update & upload routes
└── README.md
```

## Daftar Endpoint
| Method | Endpoint | Access | Deskripsi |
|---|---|---|---|
| `GET` | `/api/site-config` | Public / Auth | Ambil seluruh konfigurasi branding & tema visual frontend |
| `PUT` | `/api/site-config` | Super-Admin Only | Update item konfigurasi branding dan hex color tema |
| `POST` | `/api/site-config/upload` | Super-Admin Only | Upload file aset visual (Logo / Background Login) |
