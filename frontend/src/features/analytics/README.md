# Fitur Data Analitik, Komparasi Gap, Analisis Pareto, & Rollback Batch (Frontend)

Modul ini menyediakan antarmuka analitik visual komprehensif untuk menghubungkan data laporan produksi dengan data riil crushing dan transaksi NG di sistem.

## Fitur Utama
1. **Upload File Laporan Produksi CSV & Live Preview Kecocokan**:
   - Mendukung format file CSV `Report  Production.csv`.
   - **Live Preview & Match Analysis**: Sebelum submit, sistem otomatis menganalisis setiap baris Sebango terhadap Master Part di database.
   - Menampilkan statistik kecocokan (Total Baris, Baris Cocok/Diproses, dan Baris Tidak Cocok/Di-skip).
   - Menyediakan tabel pratinjau interaktif dengan filter tab (*Semua*, *Cocok*, *Di-skip*) dan fitur pencarian Sebango.
   - Baris dengan Sebango yang tidak terdaftar otomatis di-skip dari penyimpanan database.
2. **Rollback & Manajemen Batch Upload**:
   - Tombol **Rollback Data** untuk membatalkan 1 batch upload data produksi terakhir jika terjadi kesalahan input oleh operator.
   - Modal riwayat batch dengan opsi hapus/rollback per batch dan kalkulasi ulang otomatis.
3. **Grafik Komparasi 3 Batang Bulanan (Allowance vs Input vs Output)**:
   - Grafik batang interaktif 12 bulan membandingkan **Allowance Produksi (kg)** vs **Input NG & Runner Sistem (kg)** vs **Aktual Output Crushing (kg)**.
   - Dilengkapi hover tooltip detail dengan kalkulasi selisih.
4. **Matriks Selisih Bulanan (Gap NG & Gap Crushing)**:
   - Sumbu X: 12 Bulan (Jan – Des) + Total Tahunan.
   - Sumbu Y:
     - **Gap NG (Allowance - Input)**: Berwarna hijau jika plus/surplus allowance, berwarna merah jika minus.
     - **Gap Crushing (Input - Output)**: Rekapitulasi waste/loss proses giling dengan warna teks standar.
5. **Tab Analisis Pareto Material Resin**:
   - Visualisasi grafik Pareto (Bar chart berat kg per material + Garis kurva kumulatif 0–100% + Garis batas 80/20).
   - Tabel ranking kontribusi material dari volume terbesar.
6. **Tab Analisis Pareto Part NG**:
   - Visualisasi grafik Pareto part dengan akumulasi NG terbesar (Pcs & Kg).
   - Tabel ranking prioritas penanganan kualitas & pemulihan part.
7. **Tabel Rincian Data Analitik**:
   - Menampilkan seluruh baris Sebango, Shikake Aktual, Berat Part (gr), Nilai Allowance (kg), dan Hasil Produksi dengan fitur pencarian dan filter bulan/pabrik.

## Struktur Modul
- `pages/AnalyticsPage.tsx` — Halaman utama analitik produksi dengan navigasi 3 tab dan tombol Rollback.
- `components/AnalyticsUploadModal.tsx` — Modal upload, parsing CSV, preview kecocokan Master Part, dan filter baris yang di-skip.
- `components/AnalyticsRollbackModal.tsx` — Modal konfirmasi rollback batch terakhir & riwayat batch.
- `components/AnalyticsYearlyChart.tsx` — Komponen grafik komparasi 3 batang bulanan (Allowance vs Input vs Output).
- `components/AnalyticsMonthlyGapTable.tsx` — Tabel matriks bulanan Gap NG dan Gap Crushing.
- `components/AnalyticsParetoMaterial.tsx` — Komponen visual grafik Pareto material & tabel ranking.
- `components/AnalyticsParetoPartNg.tsx` — Komponen visual grafik Pareto part NG & tabel ranking.
- `components/AnalyticsDataTable.tsx` — Tabel rincian Sebango & kalkulasi allowance.
- `hooks/useAnalytics.ts` — Hook untuk state management analitik, rollback orchestration, dan API integration.
- `services/analytics.service.ts` — API client service.
- `types/analytics.types.ts` — Type definitions.
