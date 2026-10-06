# Feature: Mixed Materials (Material Campuran)

Halaman `/admin/mixed-materials` untuk mengelola material campuran (mis. A + B + C -> D), terpisah dari Master Material.

## Struktur
- `pages/MixedMaterialsPage.tsx` — komposisi halaman
- `components/` — `MixedMaterialsTable`, `MixedMaterialModal` (nama + jenis recycle), `MixedMaterialMembersModal`
- `hooks/useMixedMaterials.ts` — state & orkestrasi API
- `services/mixedMaterials.service.ts` — `/api/mixed-materials`
- `types/`

## Fitur
- CRUD material campuran; jenis recycle (Reuse / No Reuse) dipilih user.
- Lihat anggota campuran (material asli + jumlah part).
- Anggota diatur dari edit Master Material (dropdown "Dicampur ke"). Seluruh pencatatan efektif dilakukan backend.
