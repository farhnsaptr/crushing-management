# Fitur Pengiriman Part NG (Frontend)

Fitur ini menyediakan sistem permohonan dan verifikasi pengiriman material reject (Part NG) antara Pengirim dan Operator Crushing dengan audit trail non-destructive.

## Alur Sistem
1. **Pengirim (`pengirim`)**: Menginput pengajuan pengiriman Part NG melalui katalog visual part (dengan fitur 1-click add keranjang, stepper tambah/kurang kuantitas di katalog & rincian pengiriman, shift otomatis terkunci, serta auto-save draf ke Redis). Pengiriman dilakukan secara instan dengan toast notifikasi interaktif yang menyediakan tombol **Undo** untuk membatalkan pengiriman dan memulihkan draf jika terjadi kesalahan input.
2. **Operator Crushing (`operator`, `admin`, `super-admin`)**: Melakukan verifikasi fisik di halaman *Verifikasi Permintaan*. Operator dapat menyesuaikan kuantitas fisik aktual yang diterima jika ada selisih (kurang/lebih) langsung di rincian modal sebelum menyetujui. Data kuantitas asli dari pengirim tetap tersimpan utuh di database sebagai audit trail.
3. **Input Part Runner NG**: Diinput langsung oleh Operator Crushing di halaman *Input Part Runner NG*.

## Struktur Modul
- `pages/SenderRequestsPage.tsx` — Halaman pengajuan pengiriman Part NG baru dan pelacakan riwayat untuk role `pengirim`.
- `pages/RequestApprovalPage.tsx` — Halaman verifikasi dan persetujuan pengiriman untuk role `operator`, `admin`, dan `super-admin`.
- `components/CreateRequestForm.tsx` — Form pembuatan pengiriman Part NG berbasis sistem keranjang 1-click, toggle katalog Grid/List, serta daftar rincian pengiriman interaktif dengan tombol stepper `+`/`-` pcs dan live calculation berat.
- `components/MyRequestsTable.tsx` — Tabel daftar pengiriman milik pengirim dengan status tracking.
- `components/PendingApprovalTable.tsx` — Tabel pengiriman masuk untuk diverifikasi oleh operator.
- `components/RequestDetailModal.tsx` — Modal rincian pengiriman full-screen beserta visual foto part besar, kontrol penyesuaian kuantitas fisik inline, perbandingan audit trail, dan tombol validasi persetujuan.
- `hooks/useCrushingRequests.ts` — Hook untuk logika formulir pengirim, pengiriman langsung, shift engine real-time, dan aksi Undo toast.
- `hooks/useRequestApproval.ts` — Hook untuk logika verifikasi fisik dan approval operator.
- `services/crushingRequests.service.ts` — Service API client untuk komunikasi dengan backend `/api/crushing-requests`.
- `types/crushingRequests.types.ts` — Interface tipe TypeScript.

