# Fitur Dashboard Analytics (Frontend)

Fitur ini menyediakan visualisasi KPI, grafik harian, dan analisis pareto untuk pemantauan material recycle.

## Fitur Utama
- **Role Pengirim (`pengirim`)**:
  - Executive KPI Cards Departemen (Total Part Diterima kg, Total Kuantitas Pcs Part NG, Total Tiket Pengiriman Disetujui/Menunggu).
  - **Daily Part NG Chart**: Grafik batang harian akumulasi pengiriman Part NG per Shift (Pagi & Malam) sepanjang bulan.
  - **Ranking Part NG Terkirim**: Tabel part reject tertinggi yang dikirim oleh departemen beserta visualisasi persentase kontribusi.
  - **Akumulasi Jenis Material Terkirim**: Rekapitulasi berat per jenis resin plastik (PP, ABS, dll) dari seluruh part yang dikirim.
  - **Pengajuan Tiket Terkini Departemen**: Tabel pelacakan status 5 tiket pengiriman terbaru dari seluruh anggota departemen.
- **Role Operator / Admin / Super-Admin**:
  - Executive KPI Cards (Total Input, Total Output, Waste, Input Pcs).
  - Grafik harian daur ulang per shift.
  - **Pareto Departemen Pengirim Part NG Terbanyak** (Peringkat, Nama Departemen, Total Transaksi, Jumlah Pcs, Total Berat kg, Proporsi %).
  - Top Part NG terbanyak.
  - Pareto Material / Resin.
  - Export Laporan Excel.
