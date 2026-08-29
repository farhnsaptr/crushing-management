# Modul Global Audit Logs (`src/features/global-logs`)

Modul ini menampilkan log audit aktivitas RESTful API yang direkam secara real-time ke dalam database MySQL dan disiarkan via Server-Sent Events (SSE).

## Fitur Utama
1. **HTTP Method Badge**: Visualisasi badge warna untuk method `GET` (biru), `POST` (hijau), `PUT` (kuning), `PATCH` (ungu), dan `DELETE` (merah).
2. **Detail Log**: Informasi URL endpoint, IP address, Username, Role, Response Time (ms), Status Code, dan Timestamp.
3. **Filtering & Search**: Pencarian instan berdasarkan URL / IP / Username dan filter jenis HTTP Method & Status Code.
4. **Real-Time SSE Live Stream**: Pembaruan log real-time otomatis saat ada request baru di sistem.
5. **Pagination & Clear Logs**: Paginasi numerik lengkap dan tombol pembersihan riwayat log untuk Super-Admin.
