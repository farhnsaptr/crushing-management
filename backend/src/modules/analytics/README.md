# Analytics Module (Backend)

Modul ini menyediakan layanan analitik produksi, komparasi 3-komponen (*Allowance, Input NG & Runner, Output Crushing*), matriks selisih bulanan (*Gap NG* dan *Gap Crushing*), analisis **Pareto Material** & **Pareto Part NG**, serta fitur **Live Preview Kecocokan & Rollback Batch**.

## Fitur Utama
1. **Live Preview & Validasi Kecocokan CSV (`POST /api/analytics/preview`)**:
   - Menerima raw records CSV dan melakukan pencocokan instan ke `master_parts`.
   - Mengembalikan ringkasan statistik (jumlah baris cocok vs tidak cocok, match rate %, total estimasi allowance kg, daftar Sebango yang tidak terdaftar).
   - Menghitung Shikake aktual per (Tanggal + Sebango) dan estimasi allowance per baris sebelum disimpan.

2. **Import Data Laporan Produksi CSV (`POST /api/analytics/upload`)**:
   - Memproses data dari file CSV laporan produksi.
   - Menyimpan batch header ke `production_analytics_batches` dan rincian ke `production_analytics_items`.
   - Baris dengan Sebango yang tidak terdaftar di Master Part **otomatis di-skip**.

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
