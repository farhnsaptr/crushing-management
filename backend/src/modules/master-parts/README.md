# Modul Master Parts (`master-parts`)

Modul ini mengelola katalog data master part resin, model kendaraan, berat part/runner, serta lookup QR code.

## Deskripsi & Logic
1. **Best-Possible-Search / Autocomplete (`MasterPartsService.searchParts`)**:
   - Mendukung pencarian part instan berdasarkan part number atau part name untuk halaman input ketik.
2. **Model Dynamic Lookup (`MasterPartsService.getModelsForPartNumber`)**:
   - Karena 1 part number dapat dipakai di lebih dari 1 model kendaraan (contoh: 55552-KK020-C0 pada model 640A & 660A), query ini mengembalikan daftar distinct model kendaraan untuk mengisi dropdown Model secara otomatis setelah part number dipilih.
3. **Instan Lookup QR Code (`MasterPartsService.getByQrCode`)**:
   - Pencarian berakurasi tinggi via `qr_code_value` (menggunakan index MySQL `idx_qr_code`) untuk mendukung alur input scan QR.
4. **Filter Berdasarkan Jenis Part (`MasterPartsService.getPartsByJenis`)**:
   - Menampilkan daftar part sesuai `jenis_part` (misal: BUMPER, GRILLE, DOOR TRIM) untuk halaman input scan.

## Struktur File
```
master-parts/
├── masterParts.controller.ts  # HTTP Handler & Query params parsing
├── masterParts.service.ts     # Business logic & MySQL JOIN queries
├── masterParts.routes.ts      # Public read / Admin write routing & Swagger docs
└── README.md
```

## Daftar Endpoint
| Method | Endpoint | Access | Deskripsi |
|---|---|---|---|
| `GET` | `/api/master-parts/search` | Authenticated | Autocomplete pencarian part_number / part_name |
| `GET` | `/api/master-parts/models` | Authenticated | Ambil model kendaraan untuk part_number |
| `GET` | `/api/master-parts/by-qr` | Authenticated | Lookup data part instan berdasarkan QR payload |
| `GET` | `/api/master-parts/by-jenis` | Authenticated | Filter part berdasarkan `jenis_part` |
| `GET` | `/api/master-parts` | Authenticated | List semua master part (paginated) |
| `POST` | `/api/master-parts` | Admin Only | Tambah master part baru |
