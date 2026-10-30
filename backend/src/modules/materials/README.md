# Modul Materials (Master Material Resin)

CRUD `master_materials` + penentuan material efektif untuk transaksi baru.

## Struktur
- `materials.routes.ts` / `materials.controller.ts` / `materials.service.ts` — CRUD & daftar part pemakai
- `effectiveMaterial.ts` — `resolveEffectiveMaterial(materialId)`: nama + jenis recycle efektif (campuran jika material sedang dicampur), dipakai modul ng-transactions, crushing-requests, dan runner-material

## Material Campuran
- `master_materials.mixed_material_id` menunjuk ke `mixed_materials` (dikelola modul `mixed-materials`). `POST/PUT /api/materials` menerima `mixed_material_id` (`null` = lepas).
- Transaksi baru material yang sedang dicampur dicatat atas nama & jenis recycle campuran (`material_id` kosong karena campuran tidak ada di `master_materials`); riwayat lama tidak berubah.
- **No-reuse menang** (`usesMixedIdentity`): anggota dengan master material `no_reuse` yang dicampur ke campuran `reuse` TIDAK ikut identitas campuran; transaksinya dicatat atas nama & jenis materialnya sendiri sehingga masuk Scrap. Campuran `no_reuse` tetap membuat semua anggotanya waste. Saat approval Part NG, material efektif `no_reuse` otomatis seluruh qty-nya waste (tanpa pemisahan reuse).
- Nama master material unik juga terhadap nama campuran.

## Lokasi Plant
- `master_material_locations` memetakan material ke plant (`Cibitung`/`Karawang`). Material hanya tampil di plant yang dipetakan.
- `GET /api/materials?location=Karawang` memfilter daftar; `POST/PUT` menerima `locations: string[]` (minimal 1).
- `GET /api/materials/:id/parts?location=Karawang` memfilter part pemakai per plant.
- Material tidak boleh dilepas dari plant yang masih memakai material tersebut; campuran harus mencakup semua lokasi anggotanya.
