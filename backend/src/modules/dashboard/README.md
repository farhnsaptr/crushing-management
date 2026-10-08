# Dashboard Module (Backend)

Modul ini menyediakan API agregasi statistik, visualisasi grafik harian daur ulang material, pemeringkatan material pareto & part NG terbanyak, serta generator laporan Excel (.xlsx).

## Structure
- `dashboard.routes.ts` - Express router endpoints
- `dashboard.controller.ts` - HTTP Request/Response handlers & file download headers
- `dashboard.service.ts` - Agregasi data dari SQL View (`v_daily_recycle_summary`, `v_pareto_material`, `v_part_ng_terbanyak`) & SheetJS `xlsx` report generator

## Endpoints

### 1. `GET /api/dashboard/summary`
Mengembalikan KPI per bulan & lokasi: `scrap_kg` (material no-reuse NG + runner, menurut jenis recycle efektif termasuk material campur), `input_kg` (material reuse NG + runner), `output_kg` (total hasil timbang verifikasi `validated` di lokasi tsb), `gap_kg` (jumlah `crushing_waste_kg` verifikasi tervalidasi = kekurangan per material `max(0, sistem − timbang)`; tidak pernah minus, kelebihan timbangan tidak dihitung; Scrap + Gap = Waste di sistem lama), dan `input_pcs`. Runner tanpa `factory_id` tidak dihitung. `daily-chart` memakai definisi yang sama per hari/shift (`*_input_kg`, `*_scrap_kg`, `*_output_kg`, `*_gap_kg`); Export Excel menyambung verifikasi per lokasi.
- **Query Params**: `year`, `month`, `location` (`Cibitung` | `Karawang`)

### 2. `GET /api/dashboard/daily-chart`
Mengembalikan data grafik harian total recycle material (kg & pcs per tanggal).
- **Planning Harian** (`planning_kg` per hari) = SUM(`production_analytics_items.allowance_kg`) dari data produksi yang sudah diupload di modul Analytics (allowance di-snapshot saat upload). Hari yang belum diupload bernilai `null`.
- **Query Params**: `year`, `month`, `location`

### 3. `GET /api/dashboard/pareto-material`
Mengembalikan daftar Top 5 Pareto Material (dibatasi 5 baris agar tabel dashboard muat tanpa scroll dengan tulisan yang terbaca).
- **Query Params**: `year`, `month`, `location`

### 3b. `GET /api/dashboard/departments-pareto`
Pareto departemen pengirim NG. Dibatasi `DEPARTMENT_PARETO_MAX_ROWS` (5) baris agar tabel dashboard muat tanpa scroll: 4 departemen teratas + 1 baris `Lainnya (n departemen)` (`department_id: 'others'`) berisi jumlah sisanya, persentase total tetap lengkap.
- **Query Params**: `year`, `month`, `location`

### 4. `GET /api/dashboard/top-ng-parts`
Mengembalikan daftar Part NG Terbanyak (Top 5).
- **Query Params**: `year`, `month`, `location`

### 5. `GET /api/dashboard/export`
Mendownload laporan spreadsheet Excel (.xlsx) yang berisi 2 worksheet:
1. **Transaksi NG**: Berisi data riwayat transaksi NG dengan kolom huruf kapital (`TANGGAL`, `SHIFT`, `SEBANGO`, `PART NAME`, `PART NUMBER`, `MATERIAL`, `REUSE/NO REUSE`, `MODEL`, `BERAT PART`, `QTY PER PCS`, `ALLOWANCE`, `INPUT`, `OUTPUT`). Nilai `OUTPUT` mengambil nilai aktual hasil verifikasi/validasi operator per shift & material.
2. **Transaksi Runner**: Berisi data riwayat transaksi Runner per material dengan kolom huruf kapital (`TANGGAL`, `SHIFT`, `NAMA MATERIAL`, `REUSE/NO REUSE`, `QTY PER PCS`, `INPUT`, `OUTPUT`, `BATCH / SUMBER`). Nilai `OUTPUT` mengambil nilai aktual hasil verifikasi/validasi operator.
- **Query Params**: `start_date`, `end_date`, `location` (`Cibitung` | `Karawang`)
