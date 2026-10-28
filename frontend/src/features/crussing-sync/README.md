# Modul Status & Sinkronisasi Crusing API (`crussing-sync`)

Modul frontend untuk memicu tarik data dari Crusing API dan menampilkan kapan data terakhir masuk. Tidak ada polling; data hanya ditarik saat tombol refresh ditekan.

## Struktur Folder

```
crussing-sync/
├── components/CrussingSyncStatus.tsx   # Label "terakhir masuk", warning, error, trigger modal
├── components/UnmatchedSebangoModal.tsx # Modal detail kode Sebango yang tidak cocok / di-skip
├── hooks/useCrussingSync.ts            # State status, trigger sync, loading/error
├── services/crussingSync.service.ts    # HTTP client /api/crussing-sync
├── types/crussingSync.types.ts
└── README.md
```

## Pemakaian

```tsx
const { status, isLoadingStatus, isSyncing, error, sync } = useCrussingSync({
 location: 'Cibitung',
 year: 2026,
 month: 10,
});

await sync(); // POST /api/crussing-sync/sync, lalu refresh status
```

`CrussingSyncStatus` hanya menampilkan status. Tombol refresh tetap milik halaman masing-masing (Dashboard, Data Analitik, Input Runner) agar konsisten dengan tombol yang sudah ada.

## Catatan

- `GET /status` hanya membaca database lokal, tidak memanggil API eksternal.
- Sync per bulan (bukan setahun) karena response setahun bisa ~8 MB / 35 detik.
- Warning `manual_overlap` muncul jika ada data upload manual pada periode yang sama; rollback manual agar tidak dobel.
