# Uploads Module (Chunked Upload)

Modul ini memungkinkan upload file **lebih dari 1MB** di produksi. Nginx produksi membatasi body request maksimal 1MB (`client_max_body_size` default) dan konfigurasinya tidak bisa diubah, jadi file besar dipotong frontend menjadi beberapa request kecil lalu dirakit ulang di backend.

## Struktur
```
uploads/
├── uploads.routes.ts      # POST /api/uploads/chunk
├── uploads.controller.ts  # Terima chunk, buat upload_id pada chunk pertama
└── uploads.service.ts     # Simpan, rakit, hapus chunk + sweep folder basi
```
Middleware perakit ada di `src/middlewares/chunkedUpload.middleware.ts` (`attachChunkedFile`).

## Alur
1. Frontend (`frontend/src/services/chunkedUpload.service.ts`) memotong file per **768KB** dan mengirim tiap potongan ke `POST /api/uploads/chunk` (`multipart/form-data`: `index`, `chunk`, `upload_id`). Chunk pertama dikirim tanpa `upload_id`; server membuatnya dan mengembalikan `{ upload_id }`.
2. Chunk disimpan di `<os.tmpdir()>/crushing-chunked-uploads/<userId>_<upload_id>/` — sengaja di luar `uploads/` karena folder itu disajikan publik oleh `express.static`. Prefix user id mencegah user lain memakai `upload_id` yang sama.
3. Endpoint tujuan menerima JSON `{ upload_id, total_chunks, filename }`. Middleware `attachChunkedFile` merakit chunk menjadi `req.file`, jadi controller tetap membaca `req.file.buffer` seperti upload biasa.
4. Folder chunk dihapus setelah response endpoint tujuan selesai (sukses maupun gagal). Folder yang tidak pernah diselesaikan (misal tab ditutup) dihapus otomatis setelah 1 jam, saat ada upload baru.

## Batasan
- Maks. 1MB per chunk, maks. 100 chunk, maks. **25MB** total file hasil rakitan.
- Jumlah chunk harus sama dengan `total_chunks`, jika tidak request ditolak 400 (mencegah file terpotong diproses diam-diam).

## Endpoint yang Mendukung `upload_id`
- `POST /api/runner-material/preview`
- `POST /api/analytics/preview`
- `POST /api/analytics/upload`
- `POST /api/master-parts/preview-import`
- `POST /api/master-parts/:id/upload-image`

Untuk menambah endpoint lain: pasang `attachChunkedFile` setelah `multer().single(...)` di route, lalu panggil `uploadFileInChunks(file)` di service frontend.

## Self-check
`backend/scripts/check-chunked-upload.ts` (lokal saja, folder `scripts/` di-gitignore; tanpa DB) memverifikasi file 3MB terkirim dengan tiap request < 1MB, hasil rakitan identik, chunk hilang ditolak, dan `upload_id` tidak bisa dipakai lintas user.
```bash
npx tsx scripts/check-chunked-upload.ts
```
