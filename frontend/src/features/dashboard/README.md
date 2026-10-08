# Fitur Dashboard Analytics (Frontend)

Fitur ini menyediakan visualisasi KPI, grafik harian, dan analisis pareto untuk pemantauan material recycle.

## Layout (satu layar, tanpa scroll)
Dashboard admin/operator/guest dirancang muat dalam satu layar tanpa scroll (desktop & tablet landscape lebar). Gaya ada di `dashboard.css`; responsif memakai **container query** pada `.dash-root` (lebar konten, bukan lebar layar, karena sidebar bisa dibuka/tutup):
- **≥ 1150px**: toolbar satu baris (judul, filter, info user), 4 kartu KPI, grafik (mengisi sisa tinggi layar), 3 tabel berdampingan (Pareto Departemen, Part NG Terbanyak, Pareto Material) setinggi isinya. Tiap tabel maksimal **5 baris** (dibatasi backend) supaya tulisan tetap terbaca. Ukuran tulisan tabel mengikuti tinggi layar (`--dash-fs`, 12–15px), jadi baris tidak pernah terpotong; tidak ada scroll di dalam kartu. Tinggi section tabel **dikunci** untuk header + 5 baris (`--dash-rows`) walau datanya lebih sedikit, supaya ukuran grafik tidak berubah-ubah.
- **900–1149px**: sama, kolom sekunder tabel (Trx, Pcs, Model) disembunyikan (nilainya ada di tooltip `title`).
- **< 900px (tablet portrait/HP)**: layout bertumpuk, halaman scroll ke bawah (tanpa scroll di dalam kartu maupun ke samping); kolom sekunder pindah ke baris kedua di bawah nama.
- **< 600px (HP)**: toolbar menumpuk, KPI 2×2, tabel 1 kolom.
- **HP posisi vertikal** (lebar ≤ 767px & portrait): dashboard di-blur dan muncul pesan "Putar perangkat Anda" (`RotateDeviceOverlay`); tidak bisa di-scroll sampai diputar ke landscape. Header aplikasi tetap bisa diakses. Tablet portrait (≥ 768px) tidak terpengaruh.
- Layar lebih pendek dari 640px: kembali ke layout bertumpuk (scroll halaman).
- Komponen: `DashboardToolbar`, `DashboardMetricCards`, `DailyRecycleChart`/`ShiftLineChart`, dan tiga tabel. Pareto Departemen dibatasi 5 baris dari backend (4 teratas + "Lainnya"), Pareto Material 5 teratas.

## Fitur Utama
- **Role Pengirim (`pengirim`)**:
  - Executive KPI Cards Departemen (Total Part Diterima kg, Total Kuantitas Pcs Part NG, Total Tiket Pengiriman Disetujui/Menunggu).
  - **Daily Part NG Chart**: Grafik garis harian bershading gradasi (2 garis: Shift Pagi = warna primary, Shift Malam = warna secondary) sepanjang bulan; komponen bersama `ShiftLineChart`.
  - **Ranking Part NG Terkirim**: Tabel part reject tertinggi yang dikirim oleh departemen beserta visualisasi persentase kontribusi.
  - **Akumulasi Jenis Material Terkirim**: Rekapitulasi berat per jenis resin plastik (PP, ABS, dll) dari seluruh part yang dikirim.
  - **Pengajuan Tiket Terkini Departemen**: Tabel pelacakan status 5 tiket pengiriman terbaru dari seluruh anggota departemen.
- **Role Guest (`guest`)**: Viewer murni. Melihat dashboard yang sama dengan admin (KPI, grafik, pareto, toggle lokasi, filter bulan/tahun, Segarkan); tidak ada tombol aksi di dashboard. Aturan role ada di `config/permissions.config.ts` (`canManageData`).
- **Role Operator / Admin / Super-Admin**:
  - Tombol aksi (Verifikasi Pengiriman, Input Part Runner, Detail Part NG, Export) dan status verifikasi **dihapus dari dashboard** agar ringkas; halaman terkait diakses lewat sidebar. `ExportDateModal` dan `handleExportExcel` di `useDashboard` masih ada tetapi belum dipasang di UI.
  - Executive KPI Cards (semua angka dari backend, per bulan & lokasi): **Material No-Reuse (Scrap)**, **Input** (reuse NG + runner), **Output** (hasil timbang verifikasi operator), **Gap** (jumlah kekurangan per material = max(0, berat sistem − hasil timbang), hanya shift yang sudah divalidasi; tidak pernah minus, kelebihan timbangan tidak ditampilkan).
  - Toggle lokasi plant diambil dari backend (`/api/factories/locations`); pilihan terakhir tersimpan per user di browser (`usePlantLocation`, berbagi dengan form Verifikasi).
  - Grafik garis harian daur ulang per shift (Pagi & Malam, total NG + Runner), ditambah **garis putus-putus Planning Harian** (allowance dari upload data produksi di Analitik). Garis hanya muncul di hari yang data produksinya sudah diupload; nilainya juga tampil di tooltip.
  - **Pareto Departemen Pengirim Part NG Terbanyak** (Peringkat, Nama Departemen, Total Transaksi, Jumlah Pcs, Total Berat kg, Proporsi %).
  - Top Part NG terbanyak.
  - Pareto Material / Resin.
