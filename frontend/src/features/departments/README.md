# Fitur Master Departemen (Frontend)

Fitur ini menyediakan antarmuka bagi Admin dan Super-Admin untuk mengelola master data departemen (CRUD).

## Struktur Modul
- `pages/DepartmentsPage.tsx` — Halaman utama manajemen departemen.
- `components/DepartmentTable.tsx` — Tabel daftar departemen dengan tombol edit & hapus.
- `components/DepartmentModal.tsx` — Modal form penambahan dan pembaruan data departemen.
- `hooks/useDepartments.ts` — Custom hook untuk state & orkestrasi pemanggilan API.
- `services/departments.service.ts` — Service API client untuk komunikasi dengan backend `/api/departments`.
- `types/departments.types.ts` — Interface tipe TypeScript.
