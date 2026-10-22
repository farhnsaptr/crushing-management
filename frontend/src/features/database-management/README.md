# Database Management Feature (Frontend)

Modul frontend untuk fitur **Database Management** yang khusus disediakan untuk role `super-admin`. Modul ini memungkinkan super admin melakukan koreksi data, CRUD terhadap tiket permintaan pengiriman beserta item part di dalamnya, serta membatalkan status approval dan mengelola transaksi penimbangan secara langsung.

## 📁 Struktur Folder

```text
features/database-management/
├── components/
│   ├── AddPartModal.tsx             # Modal full-screen untuk menambahkan Part NG / Runner ke tiket (katalog kartu & draf interaktif mirip halaman pengirim)
│   ├── ConfirmDeleteDialog.tsx      # Modal dialog konfirmasi hapus universal
│   ├── DatabaseToolbar.tsx          # Toolbar navigasi tab, search, filter status/shift/date/department/factory
│   ├── EditNgTransactionModal.tsx   # Modal edit transaksi Part NG langsung
│   ├── EditRequestHeaderModal.tsx   # Modal edit data header tiket (tanggal, shift, departemen, factory, notes)
│   ├── EditRequestItemModal.tsx     # Modal edit kuantitas, berat, dan hasil verifikasi item tiket
│   ├── EditRunnerTransactionModal.tsx # Modal edit transaksi Runner langsung
│   ├── NgTransactionsTable.tsx      # Tabel daftar transaksi Part NG (direct CRUD)
│   ├── RequestDetailModal.tsx       # Modal detail tiket, daftar part items, dan status transaksi terkait
│   ├── RequestManagementTable.tsx   # Tabel utama daftar tiket permintaan dan status approval
│   ├── RunnerTransactionsTable.tsx  # Tabel daftar transaksi Runner (direct CRUD)
│   └── UnapproveConfirmDialog.tsx   # Modal konfirmasi pembatalan approval tiket (revert ke pending)
├── hooks/
│   └── useDatabaseManagement.ts     # Custom hook orkestrasi state, filter, modal, lookup, dan API calls
├── pages/
│   └── DatabaseManagementPage.tsx   # Komponen page utama (Super-Admin Console)
├── services/
│   └── databaseManagement.service.ts # Klien API Axios untuk endpoint /api/admin/database
├── types/
│   └── databaseManagement.types.ts  # Definisi TypeScript interface & DTO
└── README.md                        # Dokumentasi fitur
```

## ✨ Fitur Utama

1. **Konsol Tiket Permintaan (`crushing_requests` & items)**:
   - Pencarian real-time berdasarkan nomor tiket, pengirim, dan catatan.
   - Filter multivariat: Status (All, Pending, Approved, Rejected), Shift, Rentang Tanggal, Departemen, dan Factory.
   - **Kelola Tiket**: Melihat rincian tiket, item part/runner di dalamnya, dan transaksi penimbangan terkait.
   - **Edit Header Tiket**: Mengubah tanggal tiket, shift, departemen, factory, dan catatan pengirim.
   - **Kelola Part Item**:
     - Menambah part NG atau runner baru ke tiket secara batch menggunakan **modal full-screen interaktif** (desain disamakan dengan halaman pengirim: katalog kartu part, stepper kuantitas langsung di kartu, filter jenis part/pabrik, input runner material, dan panel draf akumulasi total berat/pcs).
     - Mengubah kuantitas kirim, berat, serta hasil verifikasi penimbangan/waste.
     - Menghapus part item dengan rekalkulasi otomatis total tiket di backend.
   - **Hapus Approve (Batalkan Approval)**: Mengembalikan status tiket menjadi `pending`, mereset field verifikasi, dan menghapus transaksi `ng_transactions` serta `runner_material_transactions` terkait agar tidak merusak data analitik/dashboard.
   - **Hapus Tiket**: Menghapus tiket secara permanen beserta seluruh item part dan membersihkan transaksi terkait.

2. **Konsol Transaksi Part NG (`ng_transactions`)**:
   - Menampilkan rekaman hasil penimbangan part NG di tabel terpisah.
   - Edit langsung kuantitas pcs, shift, tanggal transaksi, kategori recycle (`reuse`/`no_reuse`), dan catatan.
   - Hapus transaksi penimbangan langsung jika terjadi kesalahan input ganda.

3. **Konsol Transaksi Runner (`runner_material_transactions`)**:
   - Menampilkan rekaman hasil penimbangan runner material.
   - Edit berat runner (kg), total pcs, shift, dan tanggal transaksi.
   - Hapus transaksi runner langsung.

## 🔐 Keamanan & Hak Akses
- Halaman hanya dapat diakses oleh user dengan role `super-admin`.
- Endpoint backend dilindungi dengan middleware `requireRole(['super-admin'])`.
