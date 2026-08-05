# Modul Global Audit Logs (`src/features/global-logs`)

Modul ini menampilkan log audit aktivitas RESTful API yang direkam secara real-time ke dalam Redis Streams.

## Fitur Utama
1. **HTTP Method Badge**: Visualisasi badge warna untuk method `GET` (biru), `POST` (hijau), `PUT` (kuning), dan `DELETE` (merah).
2. **Detail Log**: Informasi URL endpoint, IP address, ID pengguna, execution time (ms), dan timestamp.
3. **Filtering & Search**: Pencarian cepat berdasar URL/IP/User ID dan filter jenis HTTP Method.
4. **Live Stream Auto-Refresh**: Pilihan toggle auto-refresh interval 5 detik.
