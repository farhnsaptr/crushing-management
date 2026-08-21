# Dashboard Module (Backend)

Modul ini menyediakan API agregasi statistik, visualisasi grafik harian daur ulang material, pemeringkatan material pareto & part NG terbanyak, serta generator laporan Excel (.xlsx).

## Structure
- `dashboard.routes.ts` - Express router endpoints
- `dashboard.controller.ts` - HTTP Request/Response handlers & file download headers
- `dashboard.service.ts` - Agregasi data dari SQL View (`v_daily_recycle_summary`, `v_pareto_material`, `v_part_ng_terbanyak`) & SheetJS `xlsx` report generator

## Endpoints

### 1. `GET /api/dashboard/summary`
Mengembalikan total statistik KPI: `input_kg`, `output_kg`, `waste_kg`, dan `input_pcs`.
- **Query Params**: `year`, `month`, `location` (`Cibitung` | `Karawang`)

### 2. `GET /api/dashboard/daily-chart`
Mengembalikan data grafik harian total recycle material (kg & pcs per tanggal).
- **Query Params**: `year`, `month`, `location`

### 3. `GET /api/dashboard/pareto-material`
Mengembalikan daftar Top 10 Pareto Material.
- **Query Params**: `year`, `month`, `location`

### 4. `GET /api/dashboard/top-ng-parts`
Mengembalikan daftar Part NG Terbanyak (Top 5).
- **Query Params**: `year`, `month`, `location`

### 5. `GET /api/dashboard/export`
Mendownload laporan spreadsheet Excel (`.xlsx`) yang berisi 2 worksheet:
1. **Transaksi NG**: Berisi data riwayat transaksi NG dengan kolom huruf kapital (`TANGGAL`, `SHIFT`, `SEBANGO`, `PART NAME`, `PART NUMBER`, `MODEL`, `BERAT PART`, `QTY PER PCS`, `BERAT OUTPUT`).
2. **Transaksi Runner**: Berisi data riwayat transaksi Runner per material dengan kolom huruf kapital (`TANGGAL`, `SHIFT`, `NAMA MATERIAL`, `QTY PER PCS`, `BERAT OUTPUT`, `BATCH / SUMBER`).
- **Query Params**: `start_date`, `end_date`, `location` (`Cibitung` | `Karawang`)
