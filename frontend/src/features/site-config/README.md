# Modul Site Configuration (`src/features/site-config`)

Modul ini digunakan oleh Super-Administrator untuk melakukan kustomisasi identitas aplikasi (Judul Tab, Logo Web, Background Login) serta skema warna tema (Primary, Secondary, Accent).

> **Catatan Arsitektur**: Pengaturan koneksi MinIO/S3 Storage (Base URL, Bucket Name, Folder Master Parts) dipindahkan ke file environment backend (`.env`) untuk menjaga keamanan sistem dan mencegah modifikasi yang tidak diinginkan oleh pengguna web.

## Fitur Utama
1. **Branding & Identitas**: Mengatur judul browser tab, upload icon/logo web dengan pratinjau langsung, dan upload background login.
2. **Live Color Picker**: Mengubah 3 variabel warna tema (Primary, Secondary, Accent).
3. **Instant Preview**: Warna tema langsung teraplikasikan secara real-time pada CSS variables `:root` dan `.dark`.
4. **Reset Default Sugity**: Mengembalikan identitas dan warna ke standar default PT Sugity Creatives (`#008d51`, `#E76114`, `#037233`).
5. **Persistensi Database**: Menyimpan konfigurasi ke backend via `PUT /api/site-config`.
