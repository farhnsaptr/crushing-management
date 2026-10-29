# Modul Mixed Materials (Material Campuran)

Mengelola material campuran (mis. A + B + C -> D) di tabel `mixed_materials`, terpisah dari `master_materials`.

## Struktur
- `mixedMaterials.routes.ts` / `.controller.ts` / `.service.ts`

## Endpoint (`/api/mixed-materials`)
- `GET /` — daftar campuran + jumlah anggota (`?search=`)
- `GET /:id/members` — anggota (material asli) + jumlah part per anggota
- `POST /` — buat campuran (`mixed_name`, `recycle_type` wajib, `description`) — admin
- `PUT /:id`, `DELETE /:id` — admin (hapus melepas semua anggota)

## Aturan
- Anggota ditentukan dari edit master material (`master_materials.mixed_material_id`), bukan dari modul ini.
- Jenis recycle campuran dipilih user dan boleh berbeda dengan anggotanya; transaksi baru anggota memakai jenis recycle campuran.
- Nama campuran unik terhadap `mixed_materials` dan `master_materials`.
- Transaksi baru (NG part, item request, runner) dicatat atas nama campuran lewat `materials/effectiveMaterial.ts`; riwayat lama tidak berubah.

## Lokasi Plant
- `mixed_material_locations` memetakan campuran ke plant (`Cibitung`/`Karawang`).
- `GET /?location=Karawang` memfilter daftar; `POST/PUT` menerima `locations: string[]` (minimal 1).
- Lokasi tidak boleh dilepas jika masih ada anggota material di plant tersebut.
