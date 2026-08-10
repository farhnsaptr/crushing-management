# Dashboard Feature Module (Frontend)

Modul ini bertanggung jawab merender halaman **Recycle Material Management Dashboard** dengan visualisasi analitik eksekutif, integrasi variabel warna/tema **Site Config**, serta penanganan unduh laporan Excel (.xlsx).

## Structure
- `components/`
  - `DashboardMetricCards.tsx` - Top KPI cards (`Total Input`, `Total Output`, `Waste`)
  - `DailyRecycleChart.tsx` - Recharts AreaChart tren daur ulang harian
  - `ParetoMaterialTable.tsx` - Tabel peringkat Top 10 Pareto Material Recycle
  - `TopNgPartsTable.tsx` - Tabel peringkat Part NG Terbanyak
- `hooks/useDashboard.ts` - Custom hook untuk state filter (Bulan, Tahun, Plant Location), API fetching paralel, dan trigger export Excel
- `services/dashboard.service.ts` - Client API service & blob file downloader untuk laporan Excel (`.xlsx`)
- `types/dashboard.types.ts` - Type definitions untuk summary KPI, daily chart, pareto material, dan top NG parts
- `pages/DashboardPage.tsx` - Halaman utama penataan tata letak presisi sesuai wireframe

## Features
- **Visual Sesuai Wireframe**: Header judul korporat, info tanggal & user login, kartu KPI `Total Input`, `Total Output`, `Waste`.
- **Tombol Aksi Navigasi & Export**:
  - `+ Add Data`: Navigasi langsung ke form input NG (`/ng-input`).
  - `Export`: Mendownload laporan spreadsheet Excel (`.xlsx`) secara instan dari backend.
- **Filter Periode & Lokasi Plant**: Filter berdasarkan Bulan, Tahun, dan Lokasi Plant (`Cibitung` vs `Karawang`) dengan data yang terisolasi mutlak.
