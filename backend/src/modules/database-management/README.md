# Database Management Module (Backend)

Modul ini menyediakan RESTful API khusus bagi **Super Admin** untuk mengelola, merevisi, mengoreksi, dan menghapus data tiket pengiriman (`crushing_requests`) dan transaksi historis (`ng_transactions`, `runner_material_transactions`) secara aman dengan mekanisme integritas data dan audit trail.

## Fitur Utama

1. **Pengelolaan Tiket Request Pengiriman (`/api/admin/database/requests`)**:
   - `GET /requests`: Pencarian tiket (berdasarkan no request seperti `REQ-20261015-3906`, nama pengirim, part number/name, dsb), filter status (`pending`/`approved`), tanggal, shift, dan departemen.
   - `GET /requests/:id`: Mengambil detail lengkap tiket beserta rincian seluruh item part dan data transaksi yang terbentuk.
   - `POST /requests/:id/unapprove`: **Membatalkan / Menghapus status Approval** tiket. Menghapus transaksi yang terlanjur terbentuk di `ng_transactions` dan `runner_material_transactions`, mereset hasil verifikasi fisik, mengembalikan total ke kuantitas asli pengirim, dan mengembalikan status tiket ke `pending` agar siap diverifikasi ulang.
   - `PUT /requests/:id`: Mengedit header tiket (tanggal, shift, departemen, pabrik, catatan). Jika tiket sudah approved, tanggal, shift, dan departemen pada transaksi terkait otomatis ikut tersinkronisasi.
   - `DELETE /requests/:id`: Menghapus tiket secara permanen beserta item dan transaksi terkait.
   - `POST /requests/:id/items`: Menambahkan part baru (part_ng atau runner_ng) ke dalam tiket yang sudah ada. Jika tiket berstatus approved, transaksi baru otomatis terbentuk.
   - `POST /requests/:id/items/batch`: Menambahkan kumpulan part baru secara batch dalam 1 transaksi database atomik (otomatis sinkron ke transaksi jika approved).
   - `PUT /requests/:id/items/:itemId`: Mengoreksi jumlah pcs, berat, verified quantity, atau catatan part tertentu pada tiket (otomatis sinkron ke transaksi jika approved).
   - `DELETE /requests/:id/items/:itemId`: Menghapus satu part dari tiket (dan otomatis mencabut transaksi terkait jika approved).

2. **Pengelolaan Transaksi Langsung (`/api/admin/database/transactions`)**:
   - `GET /transactions/ng`: List & search transaksi Part NG.
   - `PUT /transactions/ng/:id`: Edit transaksi Part NG (pcs, shift, tanggal, recycle type, notes).
   - `DELETE /transactions/ng/:id`: Hapus satu transaksi Part NG.
   - `GET /transactions/runner`: List & search transaksi Runner Material.
   - `PUT /transactions/runner/:id`: Edit transaksi Runner (berat kg, pcs, shift, tanggal).
   - `DELETE /transactions/runner/:id`: Hapus satu transaksi Runner.

## Keamanan
Semua endpoint dalam modul ini diproteksi oleh middleware `verifyToken` dan `requireRole(['super-admin'])`.
Aktivitas perubahan data di-broadcast melalui SSE (`broadcastSseEvent`) untuk pembaruan realtime pada dashboard dan verifikasi.
