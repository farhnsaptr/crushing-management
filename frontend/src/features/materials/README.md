# Modul Material Management (Frontend)

Modul ini bertanggung jawab mengelola master data bahan baku/resin plastik (`/admin/materials`) yang direferensikan oleh master parts dan transaksi daur ulang.

## Fungsi Utama
- Menampilkan daftar master material resin (Nama Material, Deskripsi/Catatan, Tanggal Didaftarkan).
- Menambah & Mengedit data master material resin murni.
- Menghapus data material individual atau pembersihan masal oleh `super-admin`.
- Paginasi interaktif ber-nomor halaman (`1, 2, 3, ..., N`) di atas tabel.

## Hak Akses Role
- **`super-admin`**: Akses Penuh (Read & Write & Purge All).
- **`admin`**: Akses Penuh (Read & Write).
- **`operator`**: Terblokir (Forbidden).

## Struktur Folder (`src/features/materials/`)
```
materials/
├── components/
│   ├── MaterialModal.tsx      # Modal form tambah & edit material resin
│   └── MaterialsTable.tsx     # Tabel UI daftar master material
├── hooks/
│   └── useMaterials.ts        # Hook state management, API orchestration, & pagination
├── pages/
│   └── MaterialsPage.tsx      # Halaman utama modul Material Management
├── services/
│   └── materials.service.ts   # HTTP Client API calls ke backend /api/materials
├── types/
│   └── materials.types.ts     # Type definitions & payload interfaces
└── README.md
```

## API Endpoint yang Dikonsumsi
- `GET /api/materials` - Mengambil daftar master material terdaftar (Paginated).
- `GET /api/materials/:id` - Mengambil detail material.
- `POST /api/materials` - Menambahkan material baru.
- `PUT /api/materials/:id` - Mengubah data material.
- `DELETE /api/materials/:id` - Menghapus data material.
- `DELETE /api/materials/all` - Menghapus seluruh data material (Super-admin only).
