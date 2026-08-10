# Modul Fitur Input Part NG (`ng-input`)

Modul ini bertanggung jawab untuk menangani pendaftaran transaksi barang/part rusak (NG - Non-Conforming Goods) oleh operator atau admin secara manual tanpa menggunakan QR Code Scanner.

## Struktur Folder

```
ng-input/
├── components/
│   ├── NgFilterCard.tsx      # Card filter atas untuk mode Jenis Part / Factory
│   ├── NgPartGridCard.tsx    # Grid kartu part (gambar di atas, nama/model di bawah)
│   └── NgInputFormCard.tsx   # Form input Qty, Shift, dan estimasi berat otomatis
├── hooks/
│   └── useNgInput.ts         # Logic & state management (filter, auto-detect shift, kalkulasi berat)
├── pages/
│   └── NgInputPage.tsx       # Layout utama 2 kolom
├── services/
│   └── ngInput.service.ts    # Pemanggilan endpoint API backend (/api/ng-transactions)
├── types/
│   └── ngInput.types.ts      # Type definitions untuk payload dan response NG
└── README.md                 # Dokumentasi modul
```

## Fitur Utama

1. **Dual Filter Grouping (Single Mode)**:
   - Pengelompokan berdasarkan **Jenis Part** (Bumper, Grille, Door Trim, dsb).
   - Pengelompokan berdasarkan **Factory** (Factory 1, Factory 2, dsb).
2. **Visual Part Grid Cards**:
   - Menampilkan gambar part di posisi teratas kartu (ratio 16:9).
   - Menampilkan Nama Part, Nomor Part, dan Model di bawah gambar (tanpa QR Code).
3. **Autodeteksi Shift**:
   - Pukul **21:00 - 07:00** $\rightarrow$ Otomatis memilih **Shift Malam**.
   - Pukul **07:00 - 21:00** $\rightarrow$ Otomatis memilih **Shift Pagi**.
   - User dapat mengganti shift secara manual melalui tombol toggle.
4. **Real-time Auto Weight Calculation**:
   - Menghitung estimasi berat dalam Kilogram secara otomatis dengan rumus: `(Input Qty pcs * Berat Part gr) / 1000`.
5. **Real-time SSE Syncing**:
   - Setiap kali transaksi NG disimpan, backend menyiarkan SSE event yang memperbarui angka Dashboard secara otomatis.
