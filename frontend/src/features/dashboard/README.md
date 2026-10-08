# Fitur Dashboard Analytics (Frontend)

Fitur ini menyediakan visualisasi KPI, grafik harian, dan analisis pareto untuk pemantauan material recycle.

## Fitur Utama
- **Role Pengirim (`pengirim`)**:
  - Executive KPI Cards Departemen (Total Part Diterima kg, Total Kuantitas Pcs Part NG, Total Tiket Pengiriman Disetujui/Menunggu).
  - **Daily Part NG Chart**: Grafik garis harian bershading gradasi (2 garis: Shift Pagi = warna primary, Shift Malam = warna secondary) sepanjang bulan; komponen bersama `ShiftLineChart`.
  - **Ranking Part NG Terkirim**: Tabel part reject tertinggi yang dikirim oleh departemen beserta visualisasi persentase kontribusi.
  - **Akumulasi Jenis Material Terkirim**: Rekapitulasi berat per jenis resin plastik (PP, ABS, dll) dari seluruh part yang dikirim.
  - **Pengajuan Tiket Terkini Departemen**: Tabel pelacakan status 5 tiket pengiriman terbaru dari seluruh anggota departemen.
- **Role Guest (`guest`)**: Viewer murni. Melihat dashboard yang sama dengan admin (KPI, grafik, pareto, toggle lokasi, filter bulan/tahun, Segarkan) tanpa tombol aksi: Verifikasi Pengiriman, Input Part Runner, Detail Part NG, Export, banner & modal verifikasi disembunyikan dan status verifikasi tidak di-fetch. Aturan role ada di `config/permissions.config.ts` (`canManageData`).
- **Role Operator / Admin / Super-Admin**:
  - Executive KPI Cards (semua angka dari backend, per bulan & lokasi): **Material No-Reuse (Scrap)**, **Input** (reuse NG + runner), **Output** (hasil timbang verifikasi operator), **Gap** (jumlah kekurangan per material = max(0, berat sistem − hasil timbang), hanya shift yang sudah divalidasi; tidak pernah minus, kelebihan timbangan tidak ditampilkan).
  - Toggle lokasi plant diambil dari backend (`/api/factories/locations`); pilihan terakhir tersimpan per user di browser (`usePlantLocation`, berbagi dengan form Verifikasi).
  - Grafik garis harian daur ulang per shift (Pagi & Malam, total NG + Runner), ditambah **garis putus-putus Planning Harian** (allowance dari upload data produksi di Analitik). Garis hanya muncul di hari yang data produksinya sudah diupload; nilainya juga tampil di tooltip.
  - **Pareto Departemen Pengirim Part NG Terbanyak** (Peringkat, Nama Departemen, Total Transaksi, Jumlah Pcs, Total Berat kg, Proporsi %).
  - Top Part NG terbanyak.
  - Pareto Material / Resin.
  - Export Laporan Excel.
