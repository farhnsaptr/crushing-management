# Modul Machine Management (Frontend)

Modul ini bertanggung jawab mengelola master data mesin injection molding (`/admin/machines`).

## Fungsi Utama
- Menampilkan daftar unit mesin (Pabrik, Kode Mesin, Nama Mesin, Tipe, Tonase, Status Active/Inactive, Tanggal Dibuat).
- Fitur Tambah Mesin Baru (`POST /api/machines`).
- Fitur Edit Data Mesin (`PUT /api/machines/:id`).
- Fitur Hapus Data Mesin (`DELETE /api/machines/:id`).
- Filter pencarian real-time berdasarkan kode/nama/tonase, filter per Pabrik (dinamis dari API `/api/factories`), dan filter status (`Active`/`Inactive`).

## Hak Akses Role
- **`super-admin`**: Akses Penuh (Read & Write).
- **`admin`**: Akses Penuh (Read & Write Master Data).
- **`operator`**: Terblokir (Forbidden).

## Struktur Folder (`src/features/machines/`)
```
machines/
├── components/
│   ├── MachineModal.tsx     # Modal form tambah & edit mesin
│   └── MachineTable.tsx     # Tabel UI data mesin
├── hooks/
│   └── useMachines.ts       # Logic state, filtering, modal, dan toast
├── pages/
│   └── MachinesPage.tsx     # Halaman utama modul Machine Management
├── services/
│   └── machines.service.ts  # HTTP Client API calls ke backend /api/machines
├── types/
│   └── machines.types.ts    # Interface TypeScript (Machine, Payload)
└── README.md
```

## API Endpoint yang Dikonsumsi
- `GET /api/machines` - Mengambil daftar seluruh mesin.
- `GET /api/factories` - Mengambil daftar pabrik untuk dropdown dinamis.
- `POST /api/machines` - Menambahkan data mesin baru.
- `PUT /api/machines/:id` - Mengubah data mesin.
- `DELETE /api/machines/:id` - Menghapus data mesin.
