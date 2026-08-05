# Modul Site Theme Configuration (`src/features/site-config`)

Modul ini digunakan oleh Administrator untuk melakukan kustomisasi skema warna tema aplikasi PT Sugity Creatives.

## Fitur Utama
1. **Live Color Picker**: Mengubah 6 variabel warna tema (Light Mode Primary, Secondary, Accent & Dark Mode Primary, Secondary, Accent).
2. **Instant Preview**: Warna tema langsung berubah secara real-time pada CSS variables `:root` dan `.dark`.
3. **Reset Default Sugity**: Mengembalikan warna ke standar default PT Sugity Creatives (`#008d51`, `#E76114`, `#037233`).
4. **Persistensi Database**: Menyimpan konfigurasi ke backend via `PUT /api/site-config`.
