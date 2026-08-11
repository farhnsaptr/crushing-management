# Modul Fitur Input Part Runner NG (`part-runner-ng`)

Modul ini bertanggung jawab khusus untuk menangani pendaftaran & pencatatan data **Part Runner NG per Jenis Material**, baik melalui import file CSV laporan produksi MIS shopfloor maupun input manual langsung, serta menyajikan analisis ringkasan & grafik tren bulanan.

## Struktur Folder

```
part-runner-ng/
├── components/
│   ├── RunnerCsvUploadCard.tsx         # Card upload CSV file produksi & petunjuk kolom
│   ├── RunnerManualFormCard.tsx        # Card form input manual runner material (multi-row)
│   ├── MaterialSearchInput.tsx         # Search autocomplete input component untuk material
│   ├── RunnerImportPreviewModal.tsx    # Modal preview interaktif per material sebelum disimpan
│   ├── RunnerMaterialSortedList.tsx     # Card/tabel terurut agregasi runner per material (Tab 2)
│   ├── RunnerMaterialDetailModal.tsx   # Modal analitik: Grafik tren bulanan & riwayat transaksi per material
│   ├── RunnerMaterialEditModal.tsx     # Modal edit per individu (Super-Admin & Admin)
│   └── RunnerDeleteAllModal.tsx        # Modal konfirmasi hapus semua data (Super-Admin)
├── hooks/
│   ├── useRunnerImport.ts              # Hook untuk pencatatan CSV/Manual & paginasi riwayat
│   └── useRunnerDetail.ts              # Hook untuk Tab 2: sorting, filtering, & modal grafik per material
├── pages/
│   └── PartRunnerNgPage.tsx            # Halaman utama (Tab 1: Catat vs Tab 2: Detail Input Runner)
├── services/
│   └── runnerMaterial.service.ts       # HTTP Client API calls (/api/runner-material)
├── types/
│   └── runnerMaterial.types.ts         # Type definitions untuk CSV, manual, analytics, & records
├── utils/
│   └── csvParser.util.ts               # Client-side parser CSV produksi (DATE, SEBANGO, SHIFT, ACT TOTAL)
└── README.md                           # Dokumentasi modul
```

## Fitur Utama

1. **2-Tab Navigation Layout**:
   - **Tab 1: Catat Part Runner NG**: Mode pencatatan CSV/Manual & tabel riwayat transaksi umum.
   - **Tab 2: Detail Input Runner**: Rincian agregasi material yang diurutkan & grafik analitik bulanan per material.

2. **Sorted Material Summary & Filtering (Tab 2)**:
   - Menampilkan daftar material yang diurutkan berdasarkan akumulasi **Berat Runner (kg)** terbesar (peringkat #1, #2, #3 Gold/Silver/Bronze badge).
   - Filter berdasarkan **Tahun**, **Bulan**, **Pencarian Nama Material**, dan **Urutan (Sorting)**.

3. **Grafik Tren Bulanan & Riwayat per Material**:
   - Klik tombol **"Detail & Grafik"** pada material mana saja untuk membuka `RunnerMaterialDetailModal`.
   - Menampilkan **Grafik Batang Tren Bulanan (Recharts)** akumulasi berat runner per bulan (Jan - Des) serta tabel riwayat transaksi khusus material tersebut.

4. **Dual Entry Mode & Autocomplete (Tab 1)**:
   - Import CSV / Form Manual dengan komponen pencarian autocomplete `MaterialSearchInput`.
   - Auto-generate Batch Reference (`MANUAL-YYYYMMDD-XXXX`).
