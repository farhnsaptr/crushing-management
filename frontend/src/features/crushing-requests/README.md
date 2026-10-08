# Fitur Pengiriman Part NG (Frontend)

Fitur ini menyediakan sistem permohonan dan verifikasi pengiriman material reject (Part NG) antara Pengirim dan Operator Crushing dengan audit trail non-destructive dan draf langsung ke database MySQL.

## Alur Sistem
1. **Pengirim (`pengirim`)**: Menginput pengajuan pengiriman Part NG melalui katalog visual part (dengan fitur 1-click add keranjang, stepper tambah/kurang kuantitas di katalog & rincian pengiriman, shift otomatis terkunci dan tersinkronisasi otomatis saat submit/rollover hari, serta auto-save draf ke database MySQL). Katalog dilengkapi **dropdown pemilihan pabrik**: opsinya berasal dari `GET /api/factories` yang sudah difilter backend sesuai penugasan user — pengirim yang ditugaskan ke satu pabrik hanya melihat pabrik tersebut (terkunci), sedangkan pengirim "Semua Pabrik" (`factory_id` NULL) bisa memilih pabrik mana pun atau Semua Pabrik. Pabrik terpilih memfilter katalog part dan ikut dikirim sebagai `factory_id` saat submit. Pengiriman dilakukan secara instan dengan toast notifikasi interaktif yang menyediakan tombol **Undo** untuk membatalkan pengiriman dan memulihkan draf jika terjadi kesalahan input.
2. **Operator Crushing (`operator`, `admin`, `super-admin`)**: Melakukan verifikasi fisik di halaman *Verifikasi Permintaan*. Operator hanya melihat pengiriman yang sudah di-submit (`is_submitted = TRUE`). Operator dapat menyesuaikan kuantitas fisik aktual yang diterima jika ada selisih (kurang/lebih) langsung di rincian modal sebelum menyetujui. Data kuantitas asli dari pengirim tetap tersimpan utuh di database sebagai audit trail. Untuk setiap item Part NG, operator juga bisa menandai **berapa pcs (dari qty terverifikasi) yang jadi waste** — dipakai khususnya saat menerima kiriman dari divisi non-produksi yang berisiko sebagian part-nya sudah terkontaminasi (cat/material lain), sehingga dari beberapa pcs part yang sama, sebagian bisa reuse dan sebagian jadi waste. Pcs yang ditandai waste tidak akan dihitung sebagai input material reuse di modul Verifikasi.
3. **Input Part Runner NG**: Diinput langsung oleh Operator Crushing di halaman *Input Part Runner NG*.

## Struktur Modul
- `pages/SenderRequestsPage.tsx` — Halaman pengajuan pengiriman Part NG baru dan pelacakan riwayat untuk role `pengirim`.
- `hooks/useCrushingRequests.ts` — Pilihan factory terakhir pengirim disimpan per user di browser (`usePersistedState`) dan dibuang bila sudah tidak ada di daftar factory user.
- `pages/RequestApprovalPage.tsx` — Halaman verifikasi dan persetujuan pengiriman untuk role `operator`, `admin`, dan `super-admin`.
- `components/CreateRequestForm.tsx` — Form pembuatan pengiriman Part NG berbasis sistem keranjang 1-click, toggle katalog Grid/List, serta daftar rincian pengiriman interaktif dengan tombol stepper `+`/`-` pcs dan live calculation berat. Responsif berdasarkan lebar area form, bukan lebar layar (≤ 820px, termasuk tablet saat sidebar terbuka): bar filter (search, pabrik, jenis) sticky & tersusun 2 baris, katalog grid 2 kolom dengan tombol stepper ukuran jari, dan rincian pengiriman berubah menjadi bottom cart bar yang membuka sheet rincian + tombol kirim.
- `components/MyRequestsTable.tsx` — Tabel daftar pengiriman milik pengirim dengan status tracking.
- `components/PendingApprovalTable.tsx` — Tabel pengiriman masuk untuk diverifikasi oleh operator.
- `components/RequestDetailModal.tsx` — Modal rincian pengiriman full-screen beserta visual foto part besar, kontrol penyesuaian kuantitas fisik inline, perbandingan audit trail, dan tombol validasi persetujuan.
- `hooks/useCrushingRequests.ts` — Hook untuk logika formulir pengirim, pengiriman langsung, shift engine real-time, sinkronisasi draf database, dan aksi Undo toast.
- `hooks/useRequestApproval.ts` — Hook untuk logika verifikasi fisik dan approval operator.
- `services/crushingRequests.service.ts` — Service API client untuk komunikasi dengan backend `/api/crushing-requests`.
- `types/crushingRequests.types.ts` — Interface tipe TypeScript.
