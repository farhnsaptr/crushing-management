# Modul Materials (Master Material Resin)

CRUD `master_materials` + penentuan material efektif untuk transaksi baru.

## Struktur
- `materials.routes.ts` / `materials.controller.ts` / `materials.service.ts` — CRUD & daftar part pemakai
- `effectiveMaterial.ts` — `resolveEffectiveMaterial(materialId)`: nama + jenis recycle efektif (campuran jika material sedang dicampur), dipakai modul ng-transactions, crushing-requests, dan runner-material

## Material Campuran
- `master_materials.mixed_material_id` menunjuk ke `mixed_materials` (dikelola modul `mixed-materials`). `POST/PUT /api/materials` menerima `mixed_material_id` (`null` = lepas).
- Transaksi baru material yang sedang dicampur dicatat atas nama & jenis recycle campuran (`material_id` kosong karena campuran tidak ada di `master_materials`); riwayat lama tidak berubah.
- Nama master material unik juga terhadap nama campuran.
