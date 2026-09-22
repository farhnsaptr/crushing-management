# Modul Fitur Input Part Runner NG (`part-runner-ng`)

Modul ini bertanggung jawab khusus untuk menangani pendaftaran & pencatatan data **Part Runner NG per Jenis Material**, baik melalui import file Excel (`.xlsx` / `.xls`) seperti `08. LAPORAN AGUSTUS 2026.xlsx` maupun input manual langsung, serta menyajikan analisis ringkasan & grafik tren bulanan.

## Struktur Folder

```
part-runner-ng/
├── components/
│   ├── RunnerCsvUploadCard.tsx         # Card upload Excel (.xlsx/.xls) & CSV laporan produksi & petunjuk kolom
│   ├── RunnerManualFormCard.tsx        # Card form input manual runner material (multi-row)
│   ├── MaterialSearchInput.tsx         # Search autocomplete input component untuk material
│   ├── RunnerImportPreviewModal.tsx    # Modal preview interaktif per material (dengan filter tanggal produksi)
│   ├── RunnerMaterialSortedList.tsx     # Card/tabel terurut agregasi runner per material (Tab 2)
│   ├── RunnerMaterialDetailModal.tsx   # Modal analitik: Grafik tren bulanan & riwayat transaksi per material
│   ├── RunnerMaterialEditModal.tsx     # Modal edit per individu (Super-Admin & Admin)
│   └── RunnerBatchRollbackModal.tsx    # Modal konfirmasi rollback data runner material per batch (Super-Admin & Admin)
├── hooks/
│   ├── useRunnerImport.ts              # Hook untuk pencatatan Excel/Manual, date filtering & paginasi riwayat
│   └── useRunnerDetail.ts              # Hook untuk Tab 2: sorting, filtering, & modal grafik per material
├── pages/
│   └── PartRunnerNgPage.tsx            # Halaman utama (Tab 1: Catat vs Tab 2: Detail Input Runner)
├── services/
│   └── runnerMaterial.service.ts       # HTTP Client API calls (/api/runner-material)
├── types/
│   └── runnerMaterial.types.ts         # Type definitions untuk Excel, manual, analytics, & records
├── utils/
│   └── csvParser.util.ts               # Utility parser CSV (legacy/backwards-compatible)
└── README.md                           # Dokumentasi modul
```

## Fitur Utama

1. **2-Tab Navigation Layout**:
   - **Tab 1: Catat Part Runner NG**: Mode pencatatan Excel/Manual & tabel riwayat transaksi umum.
   - **Tab 2: Detail Input Runner**: Rincian agregasi material yang diurutkan & grafik analitik bulanan per material.

2. **Dukungan Import Excel & Multi-Tanggal (Tab 1)**:
   - Mengunggah file laporan produksi berformat spreadsheet Excel (`.xlsx`, `.xls`) atau `.csv` langsung ke backend via FormData.
   - Pemetaan dinamis untuk kolom `PRODUCTION DATE`, `SHIFT`, `SEBANGO`, dan `ACTUAL TOTAL (PCS)`.
   - Otomatis mendeteksi rentang tanggal pada file bulanan (misal 29 tanggal dalam `08. LAPORAN AGUSTUS 2026.xlsx`) dan menyediakan dropdown pemilih tanggal produksi pada modal pratinjau.

3. **Sorted Material Summary & Filtering (Tab 2)**:
   - Menampilkan daftar material yang diurutkan berdasarkan akumulasi **Berat Runner (kg)** terbesar (peringkat #1, #2, #3 Gold/Silver/Bronze badge).
   - Filter berdasarkan **Tahun**, **Bulan**, **Pencarian Nama Material**, dan **Urutan (Sorting)**.

4. **Grafik Tren Bulanan & Riwayat per Material**:
   - Klik tombol **"Detail & Grafik"** pada material mana saja untuk membuka `RunnerMaterialDetailModal`.
   - Menampilkan **Grafik Batang Tren Bulanan (Recharts)** akumulasi berat runner per bulan (Jan - Des) serta tabel riwayat transaksi khusus material tersebut.

5. **Dual Entry Mode & Autocomplete (Tab 1)**:
   - Import Excel / Form Manual dengan komponen pencarian autocomplete `MaterialSearchInput`.
   - Auto-generate Batch Reference (`MANUAL-YYYYMMDD-XXXX`).

6. **Rollback Transaksi Per Batch (Tab 1)**:
   - Menggantikan sistem "Hapus Semua Data" yang berisiko dengan sistem rollback terarah per nomor batch import (`import_batch_ref`).
   - Admin / Super-Admin dapat memilih batch melalui modal `RunnerBatchRollbackModal` maupun tombol pintas rollback langsung di tabel riwayat.
