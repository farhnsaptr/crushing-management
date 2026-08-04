# AGENTS.md

Dokumen ini berisi preferensi dan aturan coding yang harus diikuti oleh siapa pun (atau AI agent apa pun) yang berkontribusi pada codebase ini. Tujuannya agar struktur project tetap konsisten, modular, dan mudah dirawat dalam jangka panjang.

## 1. Prinsip Modularitas

- Sistem harus dikembangkan secara **modular**, bukan monolitik.
- Setiap fitur/domain harus punya folder sendiri yang self-contained (komponen, logic, service, types, dsb berada dalam satu modul).
- Hindari file besar yang menangani banyak tanggung jawab sekaligus (God Component / God Service). Jika sebuah file mulai menangani lebih dari satu concern, pecah menjadi beberapa file/module.
- Modul harus punya boundary yang jelas — hindari dependency menyilang yang tidak perlu antar modul yang tidak berkaitan.

## 2. Pemisahan Tampilan (UI) dan Logika

- Berlaku untuk React (web/Vite) maupun React Native: **tampilan (UI) dan logika harus dipisah secara tegas**.
- Pola yang digunakan:
  - **Komponen UI** (`*.tsx` di folder `components/` atau `pages/`/`screens/`) → hanya bertanggung jawab merender tampilan, menerima data dan callback lewat props.
  - **Logika/state** → dipisah ke custom hooks (`useXxx.ts`), services, atau store (misal Zustand/Redux), bukan ditulis langsung di dalam komponen.
- Karena project ini fokus di frontend murni (backend pegang semua business logic, lihat poin 4), isi hooks/services di sini **bukan** tempat kalkulasi/aturan bisnis — cakupannya:
  - **`services/`** → pemanggilan API ke backend (fetch/axios), mapping request-response, error handling.
  - **`hooks/`** → state lokal komponen (form state, loading/error state, kontrol UI seperti buka/tutup modal), dan orkestrasi pemanggilan `services/` (kapan fetch, kapan refetch).
- Jadi wajar kalau file di `hooks/`/`services/` jumlahnya sedikit atau isinya ringan — itu tandanya pemisahan sudah benar, karena bagian yang berat (kalkulasi, aturan bisnis) memang seharusnya ada di backend, bukan hilang/tidak perlu dipisah.
- Hindari menulis fetch/API call atau manipulasi state kompleks langsung di dalam file komponen — tetap taruh di `hooks/`/`services/` meskipun ringan, supaya komponen tetap murni UI dan gampang ditest/dipakai ulang.
- Contoh struktur yang disarankan:
  ```
  features/
    order/
      components/       # UI murni
      hooks/             # state lokal & orkestrasi pemanggilan API
      services/          # API calls ke backend
      types/              # type definitions
      index.ts
  ```

## 3. Komponen Reusable, Bukan Halaman Statis

- Dilarang membuat halaman sebagai kumpulan elemen statis yang ditulis ulang di setiap screen.
- Sebelum membangun sebuah halaman, **buat dulu komponen dasar yang reusable**, seperti:
  - Button (dengan variant: primary, secondary, danger, dll)
  - Navbar / Header
  - Card, ListItem, Input, Modal, Badge, dsb.
- Komponen reusable ini diletakkan di folder `components/` (shared/global) dan digunakan ulang di berbagai screen/fitur.
- Halaman (screen) sebaiknya lebih banyak berupa **komposisi** dari komponen-komponen kecil, bukan markup yang ditulis dari nol setiap kali.

## 4. Logic Terpusat di Backend

- Semua **business logic** (kalkulasi, validasi bisnis, aturan konversi, agregasi data, rules yang bisa berubah sewaktu-waktu) harus ditempatkan di **backend**, bukan di frontend.
- Frontend (React / React Native) hanya bertanggung jawab untuk:
  - Menampilkan data (rendering UI).
  - Mengumpulkan input dari user.
  - Memanggil API backend dan menampilkan hasilnya.
- Frontend **dilarang** melakukan hal-hal berikut secara mandiri:
  - Menghitung nilai turunan dari data bisnis (misal: konversi satuan, total/summary, kalkulasi harga, dsb) — ini harus sudah dihitung backend dan dikirim lewat response API.
  - Menyimpan aturan bisnis (business rule) dalam bentuk kondisi/`if-else` di komponen atau hook (misal: aturan validasi form yang berkaitan dengan data bisnis, bukan validasi UI sederhana seperti "field wajib diisi").
  - Melakukan agregasi/pengolahan data mentah dari beberapa endpoint untuk menghasilkan angka bisnis baru (harus difasilitasi oleh satu endpoint backend yang sudah mengembalikan hasil akhirnya).
- Tujuannya: kalau ada penambahan/perubahan logic di kemudian hari, cukup ubah/tambah di backend (service/endpoint baru), **tanpa perlu ubah kode di frontend** — frontend tinggal memanggil API yang sudah menyediakan data/hasil yang dibutuhkan.
- Pengecualian yang boleh ada di frontend (bukan termasuk "logic bisnis"):
  - Logic murni UI (buka/tutup modal, state form sebelum submit, animasi, pagination di sisi client untuk data yang sudah diterima).
  - Validasi format input dasar (format email, panjang karakter) sebelum dikirim ke backend — tetap backend yang jadi validasi final/sumber kebenaran.

## 5. Perubahan Skema Database Wajib Lewat `init.sql`

- Skema database disimpan dalam **satu file tunggal**: `src/database/migration/init.sql`. File ini berisi seluruh `CREATE TABLE`, `CREATE VIEW`, dan struktur database lain yang berlaku saat ini (bukan riwayat perubahan bertahap, tapi representasi skema paling terbaru).
- Setiap kali ada keputusan yang menambah/mengubah struktur database (tabel baru, kolom baru, ubah tipe data, index, view baru, dsb), agent **wajib langsung mengedit `init.sql`** supaya file ini selalu mencerminkan skema database yang sedang berjalan.
- **Dilarang**:
  - Mengubah struktur tabel langsung di database (lewat MySQL Workbench/phpMyAdmin/query manual) tanpa mengupdate `init.sql`.
  - Membuat file SQL terpisah lain untuk tiap perubahan — semua perubahan skema masuk ke `init.sql` yang sama, bukan file baru per perubahan.
- Saat mengedit `init.sql`:
  - Untuk kolom/tabel baru → tambahkan langsung ke definisi `CREATE TABLE` yang relevan (bukan ditambah sebagai `ALTER TABLE` terpisah di bawahnya), supaya `init.sql` tetap jadi satu representasi skema yang bersih dan gampang dibaca dari atas ke bawah.
  - Kalau ada keputusan/alasan bisnis di balik perubahan tersebut (misal kenapa kolom tertentu ditambahkan), catat sebagai komentar SQL (`--`) di dekat definisi kolom/tabel terkait.
- Tujuannya: `init.sql` jadi satu sumber kebenaran (single source of truth) untuk skema database — kalau perlu setup database baru (environment baru, atau reset lokal), cukup jalankan file ini sekali, tanpa perlu jalankan banyak file migration berurutan.

## 6. Dokumentasi README per Folder/App

- Setiap folder modul dan setiap app dalam monorepo **wajib memiliki `README.md`**.
- README minimal berisi:
  - Deskripsi singkat fungsi folder/app tersebut
  - Struktur folder (jika relevan)
  - Cara menjalankan/menggunakan (khusus untuk app)
  - Daftar fitur utama
- **Aturan update README:**
  - ✅ Ada penambahan fitur baru → README **wajib** diupdate (deskripsi fitur, struktur baru jika ada, dsb).
  - ❌ Hanya fix bug/patch kecil → README **tidak perlu** diupdate.

## 7. Tidak Boleh Hardcode — Data Harus Dinamis dan Bersumber

- Dilarang menulis nilai statis (hardcoded) untuk data yang seharusnya berasal dari sumber data (API, database, config, environment variable, dsb).
- Termasuk yang tidak boleh di-hardcode:
  - Data bisnis (nama part, kode mesin, daftar user, status, dsb) → harus diambil dari database/API.
  - URL endpoint, kredensial, port, path → wajib lewat file konfigurasi/environment variable (`.env`, `config/`), bukan ditulis langsung di kode.
  - Label/teks yang bergantung pada data dinamis (misal daftar role, daftar shift, daftar leader) → ambil dari service/API, jangan ditulis manual sebagai array/object statis di komponen.
  - Nilai magic number/string yang punya makna bisnis → pindahkan ke constants file atau ambil dari sumber data, beri nama yang jelas.
- Yang **masih boleh** dianggap konstanta (bukan kategori "hardcode" di atas): nilai teknis yang memang tetap secara definisi (misal ukuran padding UI, breakpoint layout, warna tema) — ini boleh disimpan di file constants/theme, bukan berarti harus dari API.
- Jika data belum tersedia dari backend, buat dulu service/hook dengan interface yang jelas (bisa pakai mock sementara), agar saat data asli tersedia tinggal diganti sumbernya tanpa mengubah struktur kode di komponen.

## Ringkasan Cepat

| Aturan | Wajib? |
|---|---|
| Struktur modular per fitur | ✅ |
| Pisah UI dan logic (state/API call) | ✅ |
| Logic bisnis di backend, frontend cuma panggil API | ✅ |
| Komponen reusable sebelum halaman statis | ✅ |
| Perubahan skema DB wajib update `src/database/migration/init.sql` | ✅ |
| Ubah skema DB langsung manual (query/GUI) tanpa update `init.sql` | ❌ |
| README.md di setiap folder/app | ✅ |
| Update README saat fitur baru | ✅ |
| Update README saat fix bug | ❌ |
| Data bisnis/konfigurasi hardcode langsung di kode | ❌ |
| Data diambil dinamis dari API/DB/config | ✅ |
