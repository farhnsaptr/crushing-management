# Project Brief: Recycle Material Management

Gunakan dokumen ini sebagai konteks utama sebelum mengerjakan task apapun di project ini. Ikuti aturan coding di `AGENTS.md` untuk semua kode yang ditulis.

## 1. Ringkasan Sistem

Recycle Material Management adalah sistem untuk mencatat dan memantau alur material recycle di PT Sugity Creatives (Tier-1 automotive component manufacturer, MM2100, Bekasi). Sistem mencatat part NG (Not Good/reject) dari proses injection molding, menghitung berat material yang masuk ke proses crushing (penghancuran jadi material daur ulang), dan menampilkan ringkasannya lewat dashboard.

## 2. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | Express + TypeScript (Node.js) |
| Database | MySQL |
| Auth | JWT |
| Real-time dashboard | Server-Sent Events (SSE) |
| Icon | lucide-react |
| Chart | Recharts |
| API Docs | Swagger (swagger-ui-express + swagger-jsdoc) |
| Cache / Logs | Redis (untuk Global Logs) |
| Rate limiting | express-rate-limit |
| Package manager | npm (khusus npm, jangan pakai yarn/pnpm) |

## 3. Role & Hak Akses

Role yang tersedia untuk saat ini: **`admin`** dan **`operator`** (kemungkinan ada role tambahan di masa depan, tapi untuk sekarang cukup 2 ini).

| Kemampuan | Operator | Admin |
|---|:---:|:---:|
| Login | ✅ | ✅ |
| Lihat dashboard (real-time) | ✅ | ✅ |
| Input part NG (ketik) | ✅ | ✅ |
| Input part NG (scan) | ✅ | ✅ |
| Export dashboard ke Excel | ✅ | ✅ |
| Import data produksi aktual (CSV MIS lama → `production_actual`) | ✅ | ✅ |
| Kelola master part (`master_parts`) | ❌ | ✅ |
| Kelola user (buat/nonaktifkan akun operator) | ❌ | ✅ |
| Global Logs (audit trail request, lihat bagian 10) | ❌ | ✅ |
| Site Configuration (atur tema warna frontend, lihat bagian 11) | ❌ | ✅ |

> Catatan: pembagian di atas sudah dikoreksi langsung oleh Farhan — operator dan admin sama-sama bisa export & import data operasional; yang jadi eksklusif admin hanya fitur administratif sistem (kelola master data, kelola user, Global Logs, Site Configuration).

Implementasi proteksi endpoint: middleware `verifyToken` (validasi JWT) dikombinasikan dengan middleware `requireRole(['admin'])` untuk endpoint yang khusus admin.

## 4. Sumber Data & Alur Masuknya Data

Ada 3 sumber data yang mengalir ke 3 tabel berbeda:

1. **Excel master part** (`Data_Base_Part_Resin_SC1_Baru.xlsx`) → diimport ke tabel **`master_parts`** (dilakukan sekali di awal, admin bisa update kalau ada part baru/berubah). Berisi data part, model, customer, jenis part, material, berat part (gr), dan berat runner (gr).
2. **Operator input NG** (lewat halaman ketik atau scan QR) → masuk ke tabel **`ng_transactions`**, real-time, kapan saja part NG ditemukan.
3. **CSV MIS shopfloor lama** (`Report__Production.csv`, kolom penting: `DATE`, `SEBANGO`, `SHIFT`, `ACT TOTAL`) → diimport berkala oleh admin ke tabel **`production_actual`**, dipakai untuk hitung berat runner. Join ke `master_parts` pakai `sebango_code`.

Kedua sumber data (`ng_transactions` dan `production_actual`) berjalan independen, tidak saling menunggu — digabungkan hanya saat query dashboard, berdasarkan tanggal & shift yang sama.

## 5. Rumus Bisnis (WAJIB di backend, lihat AGENTS.md poin 4)

- **Input (kg)** = SUM(`ng_transactions.weight_kg`), di mana `weight_kg = quantity_pcs × berat_part_gr_snapshot / 1000`
- **Runner (kg)** = SUM(`production_actual.runner_weight_kg`), di mana `runner_weight_kg = actual_qty_pcs × berat_runner_gr_snapshot / 1000`
- **Output (kg)** = Input (kg) + Runner (kg) — rendemen dianggap 100%, tidak ada faktor pengurang
- **Waste (kg)** = (Input + Runner) − Output = **0** (disepakati sementara; tulis formula eksplisit di query, bukan hardcode angka 0, supaya gampang diubah kalau nanti ada faktor loss)

Semua kalkulasi ini ada di backend (endpoint dashboard), frontend hanya menampilkan hasilnya.

## 6. Shift

Sistem pakai 2 shift: **`Pagi`** dan **`Malam`** (ENUM tetap, bukan data dinamis dari tabel terpisah).

## 7. Halaman & Alurnya

### a. Dashboard
- Card: Total Input (kg), Total Output (kg), Waste (kg) — untuk periode yang dipilih (default: bulan berjalan).
- Update real-time lewat SSE saat ada input NG baru masuk.
- Grafik batang tumpuk: total kg per hari selama sebulan, dipecah per shift (Pagi/Malam), dengan label total kg di atas tiap batang.
- Tabel Pareto material recycle: material diurutkan dari kg terbanyak (dari `v_pareto_material`).
- Tabel Part NG terbanyak: diurutkan dari pcs terbanyak (dari `v_part_ng_terbanyak`).
- Tombol "Add Data" → menuju halaman Input NG (Scan).
- Tombol "Export ke Excel" (operator & admin bisa akses).

### b. Input Part NG (Ketik)
- User ketik nama/nomor part → sistem tampilkan best-possible-search (autocomplete) dari `master_parts` (query berdasar `part_number`/`part_name`).
- Setelah part dipilih, dropdown Model muncul otomatis (karena satu part number bisa dipakai beberapa model — ambil distinct model dari `master_parts` yang punya `part_number` sama).
- Tampilkan gambar part (mockup di tahap awal, dari `master_parts.image_url`).
- Input quantity (pcs), pilih shift (Pagi/Malam).
- Submit → simpan ke `ng_transactions` dengan `input_method = 'typed'`.

### c. Input Part NG (Scan)
- User pilih jenis part (`jenis_part`) terlebih dahulu untuk filter.
- Sistem tampilkan semua gambar & QR code part yang sesuai filter.
- Field nama part & model terisi otomatis begitu QR di-scan (lookup by `qr_code_value`).
- Input quantity (pcs) tetap diketik manual, pilih shift (Pagi/Malam).
- Submit → simpan ke `ng_transactions` dengan `input_method = 'scan'`.

## 8. Database

Skema database ada di `src/database/migration/init.sql` (single source of truth, selalu diedit langsung kalau ada perubahan skema — lihat AGENTS.md poin 5). Tabel utama:

- `users` — akun login (role: admin/operator)
- `master_models` — lookup model kendaraan
- `master_parts` — data part dari Excel (sebango, model, part number/name, material, berat part & runner, qr_code_value, image_url)
- `ng_transactions` — input NG dari operator (ketik/scan)
- `production_actual` — hasil import CSV MIS lama, dasar hitung runner
- `site_config` — key-value pengaturan tema frontend (lihat bagian 10)

Ditambah view: `v_daily_recycle_summary`, `v_pareto_material`, `v_part_ng_terbanyak`, `v_daily_runner_summary`.

> Catatan: `site_config` adalah satu-satunya tabel di sistem ini yang datanya bukan data transaksi produksi, tapi pengaturan aplikasi (application setting). Global Logs (bagian 9) sengaja **tidak** disimpan di MySQL — dijelaskan terpisah karena pakai Redis.

## 9. Global Logs (khusus Admin) — disimpan di Redis

Audit trail semua request ke API, ditampilkan di halaman khusus admin.

**Kolom yang dicatat per entry:**
- `waktu` (timestamp request masuk)
- `user` / `role` (siapa yang melakukan request, dari JWT payload; `guest` kalau belum login)
- `metode` (HTTP method: GET/POST/PUT/DELETE)
- `endpoint` (path yang diakses)
- `ip_address`
- `status` (HTTP status code response)
- `durasi` (response time dalam ms)

**Implementasi teknis:**
- Pakai **Redis Streams** (`XADD`), bukan List/Set biasa — cocok untuk data log berurutan waktu dan mendukung query range (`XRANGE`/`XREVRANGE`) untuk pagination di halaman Global Logs.
- Nama stream: `logs:api-requests`.
- Middleware Express global (dipasang paling awal di `app.ts`) yang mencatat waktu mulai request, lalu setelah response selesai (`res.on('finish')`), `XADD` entry baru ke stream dengan field-field di atas.
- Karena Redis berbasis in-memory, batasi ukuran stream dengan `MAXLEN ~` (approximate trimming) supaya tidak membengkak tanpa batas — misal simpan maksimal 50.000-100.000 entry terakhir. Kalau butuh retensi log jangka panjang untuk audit resmi, pertimbangkan job berkala yang memindahkan log lama ke penyimpanan permanen (di luar scope awal ini).
- Endpoint `GET /api/admin/logs` (khusus admin) — baca dari stream dengan filter opsional (by user, by endpoint, by status, range tanggal) dan pagination cursor-based.

## 10. Site Configuration (khusus Admin)

Mengatur tema warna frontend. Aturan ketat: **wajib** hanya 3 warna (primary, secondary, accent) dan **wajib** hanya 2 tema (gelap/terang) — tidak boleh lebih dari itu.

**Tabel `site_config`** (key-value, lihat definisi lengkap di `init.sql`):

```sql
CREATE TABLE site_config (
  `key`        ENUM(
    'theme_light_primary','theme_light_secondary','theme_light_accent',
    'theme_dark_primary','theme_dark_secondary','theme_dark_accent'
  ) NOT NULL PRIMARY KEY,
  value        VARCHAR(20) NOT NULL,   -- hex color, contoh: #1E293B
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by   INT NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB;
```

- Kolom `key` sengaja dibuat **ENUM** (bukan `VARCHAR` bebas) supaya pembatasan "wajib cuma 3 warna x 2 tema" dipaksakan di level database, bukan cuma validasi aplikasi — tidak mungkin ada baris dengan key di luar 6 kombinasi itu.
- `updated_by` saya jadikan FK ke `users(id)` (bukan `text` bebas seperti contoh awal) supaya konsisten dengan pola audit di tabel lain di sistem ini, dan integritas datanya terjaga (tidak bisa ada `updated_by` yang usernya sudah tidak ada). Kalau kamu tetap mau simpan sebagai teks bebas (misal untuk fleksibilitas kalau updater bukan user sistem), kasih tahu saya.
- Endpoint `GET /api/admin/site-config` (baca semua 6 key sekaligus, dipakai frontend saat load untuk apply tema) dan `PUT /api/admin/site-config` (khusus admin, update satu/beberapa key sekaligus, validasi format hex color di backend sesuai AGENTS.md poin 4).
- Frontend baca config ini sekali saat aplikasi load (bukan tiap render), simpan di context/store, dan expose lewat CSS variables supaya gampang dipakai di seluruh komponen (`--color-primary`, `--color-secondary`, `--color-accent`), dikombinasikan dengan toggle tema gelap/terang.

## 11. Rate Limiting

Pakai **express-rate-limit** di backend untuk membatasi request, terutama endpoint sensitif seperti `/api/auth/login` (mencegah brute force) dan endpoint publik lainnya. Konfigurasi limit per-endpoint (bukan satu limit global untuk semua), karena endpoint seperti dashboard SSE butuh koneksi lama yang beda karakteristik dari endpoint biasa.

## 12. Aturan Coding

Ikuti `AGENTS.md` secara ketat:
1. Struktur modular per fitur
2. Pisah UI dan logic (services untuk API call, hooks untuk state lokal)
3. Komponen reusable sebelum bikin halaman
4. Business logic 100% di backend, frontend cuma panggil API
5. Perubahan skema database wajib update `src/database/migration/init.sql`
6. README wajib diupdate tiap ada fitur baru
7. Tidak boleh hardcode data bisnis/config
