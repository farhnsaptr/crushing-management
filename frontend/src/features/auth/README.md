# Modul Auth (`src/features/auth`)

Modul ini menangani antarmuka autentikasi pengguna (Halaman Login, form validation, dan integrasi session JWT).

## Struktur Modul
- `pages/LoginPage.tsx`: Halaman utama login dengan glassmorphism card dan brand PT Sugity Creatives.
- `components/LoginForm.tsx`: Komponen form input username dan password.
- `hooks/useAuthForm.ts`: Custom hook pemisah logika form & error handling.
- `services/auth.service.ts`: Service pemanggilan API endpoint `/api/auth/login`.
- `types/auth.types.ts`: Definisi interface request & response autentikasi.
