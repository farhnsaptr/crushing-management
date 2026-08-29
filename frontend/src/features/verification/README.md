# Fitur Verifikasi Input & Output Crushing (Frontend)

Modul ini digunakan oleh Operator Crushing untuk memvalidasi hasil akhir penggilingan (crushing) material *Reuse* di akhir setiap shift operasional dengan konsep **Blind Verification**.

## Alur Sistem
1. Sistem otomatis mendeteksi seluruh material *Reuse* yang digiling pada tanggal & shift aktif (berdasarkan transaksi Part NG dan Part Runner).
2. **Blind Verification (Anti-Manipulasi Data)**:
   - Form verifikasi **hanya menampilkan daftar nama material reuse** dan field input **Berat Hasil Timbangan Aktual (kg)**.
   - Angka estimasi sistem (Part NG, Runner, Total Sistem) dan perhitungan *Waste Loss* disembunyikan dari operator agar proses penimbangan murni objektif.
3. Operator menimbang fisik hasil gilingan per jenis material di lapangan dan menginputkan berat riil dalam Kilogram (kg).
4. Operator menekan **"Validasi Pekerjaan Shift Ini"** untuk menyimpan data ke database. Jika output aktual lebih banyak dari input sistem (karena sisa gilingan sebelumnya/faktor timbangan), sistem tetap mengizinkan penyimpanan tanpa memblokir pekerjaan operator.

## Struktur Modul
- `pages/VerificationPage.tsx` — Halaman utama validasi input & output shift.
- `components/VerificationFormCard.tsx` — Komponen formulir blind verification dengan input langsung Kg per material.
- `components/VerificationModal.tsx` — Modal verifikasi popup untuk akses cepat dari dashboard/menu.
- `hooks/useVerification.ts` — Hook untuk state management tanggal/shift, form input Kg, dan integrasi API.
- `services/verification.service.ts` — Service API client ke `/api/verification`.
- `types/verification.types.ts` — Definisi interface TypeScript.
