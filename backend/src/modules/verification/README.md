# Verification Module (Backend)

Modul ini mengelola validasi input vs output hasil penggilingan (crushing) per tanggal dan shift operasional untuk material dengan tipe *Reuse*.

## Alur Kerja (Workflow)
1. **Aggregasi Sistem (`GET /api/verification/details?date=YYYY-MM-DD&shift=Pagi|Malam`)**:
   - Mengambil akumulasi berat Part NG dan Part Runner per material reuse pada tanggal dan shift terkait.
   - Mengembalikan daftar material dan status apakah shift tersebut telah divalidasi.
   - Setelah ada minimal satu transaksi reuse, **semua material campuran bertipe reuse** ikut ditampilkan dengan berat sistem 0 (diurutkan setelah material yang punya input) supaya hasil crushing material campuran yang tidak ada di input tetap bisa dicatat (hasil timbangnya masuk Output; Gap tidak minus). Hanya campuran; material biasa tidak ditambahkan. `has_input` = ada transaksi reuse.
   - **Per lokasi**: verifikasi unik per (`date`, `shift`, `location`). Parameter `location` wajib (nilai dari `GET /api/factories/locations`); berat sistem hanya dari transaksi lokasi tsb (NG lewat part→mesin→factory, runner lewat `factory_id`; runner tanpa factory tidak dihitung).
2. **Penyimpanan Validasi (`POST /api/verification`)**:
   - Menerima payload berat output aktual langsung dalam satuan Kg (`actual_output_kg`).
   - Menyimpan data validasi ke tabel header `input_verifications` dan tabel rincian `input_verification_items`.
   - **Wajib ada transaksi**: simpan ditolak `400` bila belum ada transaksi reuse pada tanggal+shift+lokasi tsb. Baris tanpa berat sistem dan tanpa hasil timbang tidak disimpan.
   - **Non-blocking Policy**: Jika berat output aktual melebihi input sistem (misal karena sisa material crusher/hopper sebelumnya), sistem tetap menyimpan data tanpa melempar error dan menyesuaikan perhitungan waste loss secara aman (`crushing_waste_kg = Math.max(0, sysTot - actOut)`).
3. **Status Dashboard (`GET /api/verification/dashboard-status`)**:
   - Menyediakan indikator status validasi shift aktif untuk ditampilkan pada header dashboard.

## Endpoint
- `GET /api/verification/details` — Mengambil detail akumulasi input sistem dan data validasi
- `POST /api/verification` — Menyimpan atau memperbarui data verifikasi hasil output crushing
- `GET /api/verification/dashboard-status` — Mengambil status verifikasi untuk dashboard
