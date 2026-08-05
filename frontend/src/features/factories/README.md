# Modul Factory Management (Frontend)

Modul ini bertanggung jawab mengelola master data pabrik/lokasi operasional PT Sugity Creatives (`/admin/factories`).

## Fungsi Utama
- Menampilkan daftar pabrik terdaftar (Kode, Nama, Lokasi, dan Tanggal Dibuat).
- Fitur Tambah Pabrik Baru (`POST /api/factories`).
- Fitur Edit Data Pabrik (`PUT /api/factories/:id`).
- Fitur Hapus Data Pabrik (`DELETE /api/factories/:id`).
- Filter pencarian real-time berdasarkan kode, nama, atau lokasi pabrik.

## Hak Akses Role
- **`super-admin`**: Akses Penuh (Read & Write).
- **`admin`**: Akses Penuh (Read & Write Master Data).
- **`operator`**: Terblokir (Forbidden).

## Struktur Folder (`src/features/factories/`)
```
factories/
├── components/
│   ├── FactoryModal.tsx     # Modal form tambah & edit pabrik
│   └── FactoryTable.tsx     # Tabel UI data pabrik
├── hooks/
│   └── useFactories.ts      # Logic state, filtering, modal, dan toast
├── pages/
│   └── FactoriesPage.tsx    # Halaman utama modul Factory Management
├── services/
│   └── factories.service.ts # HTTP Client API calls ke backend /api/factories
├── types/
│   └── factories.types.ts   # Interface TypeScript (Factory, Payload)
└── README.md
```

## API Endpoint yang Dikonsumsi
- `GET /api/factories` - Mengambil daftar seluruh pabrik.
- `POST /api/factories` - Menambahkan data pabrik baru.
- `PUT /api/factories/:id` - Mengubah data pabrik.
- `DELETE /api/factories/:id` - Menghapus data pabrik.
