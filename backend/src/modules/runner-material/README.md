# Runner Material Module

Modul ini bertanggung jawab mengelola pencatatan data **Part Runner NG per Jenis Material** berdasarkan unggahan file laporan produksi Excel (`.xlsx` / `.xls`) seperti `08. LAPORAN AGUSTUS 2026.xlsx` maupun format `.csv`.

## Deskripsi Functions & Alur Data

1. **Excel & CSV File Ingestion**:
   - File Excel (`.xlsx` / `.xls`) atau `.csv` diunggah via `multipart/form-data` ke backend (`POST /api/runner-material/preview`).
   - Backend mem-parsing buffer spreadsheet secara langsung menggunakan `xlsx` (SheetJS) tanpa membebani bundle frontend.
   - Kolom yang dipetakan secara dinamis:
     - Tanggal: `PRODUCTION DATE`, `DATE`, `TANGGAL` (format `DD-MM-YYYY` atau Excel serial date distandarisasi ke `YYYY-MM-DD`).
     - Shift: `SHIFT` (`DAY` / `D` / `PAGI` → `Pagi`, `NIGHT` / `N` / `MALAM` → `Malam`).
     - Sebango: `SEBANGO`, `KODE SEBANGO`.
     - Qty Total: `ACTUAL TOTAL (PCS)`, `ACT TOTAL`, `TOTAL`.

2. **Dukungan Multi-Tanggal (Laporan Bulanan)**:
   - Jika file mencakup banyak tanggal (misal laporan sebulan penuh), backend mendeteksi seluruh tanggal unik (`available_dates`).
   - Endpoint mendukung query/body parameter `selected_date` untuk memfilter tanggal produksi spesifik (default: tanggal produksi terbaru di file, atau semua tanggal jika `selected_date=all`).

3. **Master Part Lookup & Perhitungan Runner**:
   - Setiap kode Sebango dicocokkan ke tabel `master_parts` dan `master_materials`.
   - Berat runner per sebango dihitung dengan rumus:
     $$\text{runner\_weight\_kg} = \frac{\text{ACTUAL TOTAL (PCS)} \times \text{berat\_runner\_gr}}{1000}$$

4. **Pengelompokan Per Material & Shift**:
   - Total pcs dan total bobot runner (kg) digabungkan per kombinasi `(material, shift)`.
   - Menghasilkan daftar Sebango yang cocok beserta rincian part dan daftar Sebango yang tidak terdaftar (`unmatched_sebangos`).
   - Hasil konfirmasi disimpan ke tabel `runner_material_transactions`.

## API Endpoints

- `POST /api/runner-material/preview` — Mengunggah file Excel/CSV atau payload JSON `records` untuk mengkalkulasi preview runner per material (mendukung parameter `selected_date`).
- `POST /api/runner-material/save` — Menyimpan data terkonfirmasi runner per material ke database `runner_material_transactions`.
- `GET /api/runner-material` — Mengambil daftar riwayat pencatatan runner material (dengan pagination & date range filter).
- `GET /api/runner-material/analytics/summary` — Ringkasan material pareto runner bulanan/tahunan.
- `GET /api/runner-material/analytics/detail` — Tren harian per shift untuk material spesifik.
- `GET /api/runner-material/batches` — Mengambil daftar batch import dengan ringkasan jumlah record, berat total, dan rentang tanggal untuk rollback (Admin/Super-Admin).
- `DELETE /api/runner-material/batch/:batchRef` — Melakukan rollback / hapus seluruh transaksi runner material dalam satu batch tertentu (Admin/Super-Admin).
- `POST /api/runner-material/rollback-batch` — Alternatif payload JSON `{ batch_ref }` untuk rollback batch (Admin/Super-Admin).
- `PUT /api/runner-material/:id` — Update individual record (Admin/Super-Admin).
- `DELETE /api/runner-material/:id` — Hapus individual record (Admin/Super-Admin).
- `DELETE /api/runner-material/all` — Hapus seluruh data runner (Super-Admin - legacy).

