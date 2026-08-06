# Modul Master Parts Management (Frontend)

Modul ini bertanggung jawab mengelola master data parts dan moulding plastik injection (`/admin/master-parts`) yang dikonsumsi oleh transaksi daur ulang material.

## Fungsi Utama
- Menampilkan daftar master parts (Sebango Code, Part Number, Part Name, Customer, Model, Mesin, Jenis Part, Material, Berat Part, Berat Runner, STD QTY NG, Allowance (kg), QR Code).
- **Import Bulk Data Excel/CSV Dua Tahap**:
  1. Upload file `.xlsx`/`.csv` & Validasi Diagnostik Header (`POST /api/master-parts/preview-import`).
  2. Modal Data Viewer Pra-Impor untuk meninjau baris data, status *Valid* atau *Skipped (Sebango Kosong)*, dan hasil kalkulasi rumus.
  3. Konfirmasi Simpan ke Database (`POST /api/master-parts/commit-import`).
- **Logika Rumus Bisnis Terpusat di Backend**:
  - `std_qty_ng` = `shikake * 2`
  - `allowance_kg` = `(std_qty_ng * berat_part_gr) / 1000`
- **Fitur Export Data Master Parts**: Mengunduh seluruh data master parts aktif ke format Excel (`GET /api/master-parts/export`).
- **Fitur Unduh Template Format Excel**: Mengunduh template `.xlsx` berkolom standar (`GET /api/master-parts/template`).
- Fitur Tambah & Edit Data Manual per item.

## Hak Akses Role
- **`super-admin`**: Akses Penuh (Read & Write).
- **`admin`**: Akses Penuh (Read & Write Master Data).
- **`operator`**: Terblokir (Forbidden).

## Struktur Folder (`src/features/master-parts/`)
```
master-parts/
├── components/
│   ├── MasterPartImportPreviewModal.tsx  # Modal viewer preview data pra-impor
│   ├── MasterPartModal.tsx               # Modal form tambah & edit manual
│   ├── MasterPartsTable.tsx              # Tabel UI data master parts
│   └── MasterPartUploadModal.tsx          # Modal upload file & disclaimer format
├── hooks/
│   └── useMasterParts.ts                 # Logic state, pagination, upload preview, commit, & export
├── pages/
│   └── MasterPartsPage.tsx               # Halaman utama modul Master Parts
├── services/
│   └── masterParts.service.ts            # HTTP Client API calls ke backend /api/master-parts
├── types/
│   └── masterParts.types.ts              # Interface TypeScript (MasterPart, ParsedRow, PreviewResult)
└── README.md
```

## API Endpoint yang Dikonsumsi
- `GET /api/master-parts` - Mengambil daftar master parts terdaftar (Paginated).
- `POST /api/master-parts` - Menambahkan master part baru secara manual.
- `PUT /api/master-parts/:id` - Mengubah data master part.
- `DELETE /api/master-parts/:id` - Menghapus data master part.
- `POST /api/master-parts/preview-import` - Melakukan parsing file Excel & kalkulasi rumus.
- `POST /api/master-parts/commit-import` - Menyimpan baris data terkonfirmasi ke DB.
- `GET /api/master-parts/template` - Mengunduh file template Excel (.xlsx).
- `GET /api/master-parts/export` - Mengunduh file ekspor data master parts (.xlsx).
