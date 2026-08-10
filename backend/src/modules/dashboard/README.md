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

### 5. `GET /api/dashboard/export-excel`
Mendownload laporan spreadsheet Excel (`.xlsx`) yang berisi 4 worksheet:
1. Ringkasan KPI
2. Daily Recycle Data
3. Pareto Material Top 10
4. Part NG Terbanyak
