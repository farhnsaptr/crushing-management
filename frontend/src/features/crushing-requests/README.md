# Fitur Tiket Request Pengiriman NG (Frontend)

Fitur ini menyediakan sistem permohonan dan persetujuan tiket pengiriman material reject (Part NG) antara Pengirim dan Operator Crushing.

## Alur Sistem
1. **Pengirim (`pengirim`)**: Menginput tiket pengajuan Part NG melalui katalog visual part yang sesuai dengan pabrik penugasannya.
2. **Operator Crushing (`operator`, `admin`, `super-admin`)**: Melakukan verifikasi dan persetujuan (Approve/Reject) tiket pengiriman Part NG di halaman *Verifikasi Permintaan*.
3. **Input Part Runner NG**: Diinput langsung oleh Operator Crushing di halaman *Input Part Runner NG*.

## Struktur Modul
- `pages/SenderRequestsPage.tsx` — Halaman pengajuan tiket Part NG baru dan pelacakan riwayat untuk role `pengirim`.
- `pages/RequestApprovalPage.tsx` — Halaman verifikasi dan persetujuan/penolakan tiket untuk role `operator`, `admin`, dan `super-admin`.
- `components/CreateRequestForm.tsx` — Form pembuatan tiket Part NG dengan visual catalog terkunci sesuai pabrik pengirim.
- `components/MyRequestsTable.tsx` — Tabel daftar tiket milik pengirim dengan status tracking.
- `components/PendingApprovalTable.tsx` — Tabel tiket masuk untuk diverifikasi oleh operator.
- `components/RequestDetailModal.tsx` — Modal rincian tiket beserta tombol aksi Approve/Reject.
- `components/RejectReasonModal.tsx` — Modal konfirmasi alasan penolakan tiket.
- `hooks/useCrushingRequests.ts` — Hook untuk logika formulir pengirim dan riwayat tiket.
- `hooks/useRequestApproval.ts` — Hook untuk logika approval operator.
- `services/crushingRequests.service.ts` — Service API client untuk komunikasi dengan backend `/api/crushing-requests`.
- `types/crushingRequests.types.ts` — Interface tipe TypeScript.
