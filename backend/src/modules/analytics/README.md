# Analytics Module (Backend)

Modul ini menyediakan layanan analitik produksi, komparasi 3-komponen (*Allowance, Input NG & Runner, Output Crushing*), matriks selisih bulanan (*Gap NG* dan *Gap Crushing*), analisis **Pareto Material** & **Pareto Part NG**, serta fitur **Live Preview Kecocokan & Rollback Batch**.

## Fitur Utama
1. **Live Preview & Validasi Kecocokan Excel/CSV (`POST /api/analytics/preview`)**:
   - Menerima file Excel (`.xlsx` / `.xls` seperti `08. LAPORAN AGUSTUS 2026.xlsx`) via `multipart/form-data` atau raw records CSV, lalu melakukan pencocokan instan ke `master_parts`.
   - File > 1MB dikirim per-chunk lewat `POST /api/uploads/chunk`, lalu endpoint ini menerima JSON `{ upload_id, total_chunks, filename }` (lihat modul `uploads`). Berlaku juga untuk `POST /api/analytics/upload`.
 - Mengembalikan ringkasan statistik (jumlah baris cocok vs tidak cocok, match rate %, total estimasi allowance kg, daftar Sebango yang tidak terdaftar), plus jumlah baris gabungan yang diperluas (`expanded_rows`) dan daftar `unresolved`.
 - **Resolusi SEBANGO gabungan**: kode seperti `U0-3315/6-201B` dicocokkan persis dulu ke Master Part; jika tidak ada, diperluas menjadi `U0-3315-201B` + `U0-3316-201B` dan setiap hasil mendapat kuantitas penuh (tidak dibagi). Sebango hasil perluasan yang tidak ada di master, atau yang duplikat/ambigu di master, dilaporkan di `unresolved` dan tidak disimpan diam-diam.
 - Menghitung Shikake aktual per (Tanggal + Sebango hasil resolusi) dan estimasi allowance per baris sebelum disimpan.

2. **Import Data Laporan Produksi Excel/CSV (`POST /api/analytics/upload`)**:
   - Memproses data dari file Excel Laporan Produksi atau file CSV.
 - Menyimpan batch header ke `production_analytics_batches` dan rincian ke `production_analytics_items` (termasuk `sebango_code_raw` dan `source_row_number` untuk jejak audit).
 - Baris dengan Sebango yang tidak terdaftar di Master Part **otomatis di-skip**, tetapi kode yang gagal dicocokkan tetap dikembalikan di `unresolved` (tidak hilang diam-diam).

3. **Rollback Batch Produksi (`POST /api/analytics/rollback`)**:
   - Menghapus 1 batch upload data produksi paling mutakhir secara otomatis dengan transaksi database ACID yang aman.
   - Mengembalikan seluruh kalkulasi allowance ke kondisi sebelum batch tersebut diunggah.

4. **Komparasi 3 Batang Bulanan & Gap (`GET /api/analytics/yearly-comparison?year=YYYY&factory=...`)**:
   - Mengagregasi data 12 bulan: **Allowance Produksi (kg)** vs **Input NG & Runner Sistem (kg)** vs **Aktual Output Crushing (kg)**.
   - Menyediakan kalkulasi bulanan:
     - `gap_ng_kg = allowance_kg - input_kg`
     - `gap_crushing_kg = input_kg - actual_output_kg`
     - `crushing_efficiency_pct = (actual_output_kg / input_kg) * 100%`

5. **Analisis Pareto Material (`GET /api/analytics/pareto/materials?year=YYYY&factory=...`)**:
   - Mengagregasi transaksi part NG dan runner per jenis material resin.
   - Mengurutkan *descending* berdasarkan total volume bobot (kg).
   - Menghitung kontribusi (%) dan persentase kumulatif (0–100%) dengan batas 80/20.

6. **Analisis Pareto Part NG (`GET /api/analytics/pareto/parts-ng?year=YYYY&factory=...`)**:
   - Mengagregasi kuantitas (pcs) dan bobot (kg) part NG bermasalah.
   - Mengurutkan *descending* untuk memprioritaskan perbaikan mutu (80% reject terkonsentrasi pada part teratas).

7. **Query Rincian Data Analitik (`GET /api/analytics/records`)**:
   - Menampilkan data rincian per baris Sebango, Shikake, Allowance, dan hasil produksi dengan filter tanggal, pencarian, dan pagination.

8. **Riwayat & Hapus Batch Upload (`GET /api/analytics/batches` & `DELETE /api/analytics/batches/:batchId`)**:
   - Mengelola riwayat file laporan produksi yang telah diimpor dengan opsi penghapusan per batch.
