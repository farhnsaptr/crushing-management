# Modul Fitur Input Part NG (`ng-input`)

Modul ini bertanggung jawab untuk menangani pendaftaran transaksi barang/part rusak (NG - Non-Conforming Goods) oleh operator atau admin secara manual tanpa menggunakan QR Code Scanner.

## Struktur Folder

```
ng-input/
├── components/
│   ├── NgFilterCard.tsx           # Card filter atas untuk mode Jenis Part / Factory
│   ├── NgPartGridCard.tsx         # Grid kartu part (gambar di atas, nama/model di bawah)
│   ├── NgInputFormCard.tsx        # Form input Qty, Shift, dan estimasi berat otomatis
│   ├── NgMaterialSummaryList.tsx  # Pareto list material & part (urut Kg terbanyak)
│   ├── NgPartDetailModal.tsx      # Modal detail analitik part
│   ├── NgDailyChart.tsx           # Grafik Recharts stacked shift (Pagi & Malam) & garis allowance
│   └── NgTransactionLogTable.tsx  # Tabel log transaksi NG dalam modal
├── hooks/
│   ├── useNgInput.ts              # Logic & state management form input NG
│   └── useNgDetail.ts             # Logic & state management ringkasan detail material & part modal
├── pages/
│   └── NgInputPage.tsx            # Layout utama dengan Tab Bar (Detail Input NG vs Input Part NG Baru)
├── services/
│   └── ngInput.service.ts         # Pemanggilan endpoint API backend (/api/ng-transactions)
├── types/
│   └── ngInput.types.ts           # Type definitions untuk payload dan response NG
└── README.md                      # Dokumentasi modul
```

## Fitur Utama

1. **Detail Input NG & Pareto Analytics**:
   - Pemilihan filter **Bulan & Tahun** dengan pencarian langsung.
   - Daftar Material disortir dari **akumulasi berat NG (Kg) terbanyak**.
   - Accordion sub-list Part yang disortir dari **berat NG (Kg) terbanyak**.
   - Modal Detail Part berisi **Grafik Harian Stacked Shift Pagi/Malam** dengan **Garis Threshold Allowance** dan **Tabel Log Transaksi**.
2. **Dual Filter Grouping (Single Mode)**:
   - Pengelompokan berdasarkan **Jenis Part** (Bumper, Grille, Door Trim, dsb).
   - Pengelompokan berdasarkan **Factory** (Factory 1, Factory 2, dsb).
3. **Visual Part Grid Cards & Auto Weight Calculation**:
   - Kartu visual part dan kalkulasi estimasi berat Kilogram otomatis.
