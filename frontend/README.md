# Frontend Web Application - PT Sugity Creatives Recycle Material Management

Aplikasi web modern berbasis React (Vite + TypeScript + React Router DOM v7) untuk sistem manajemen daur ulang material plastik injection molding di PT Sugity Creatives.

## Structure
```
frontend/
├── src/
│   ├── assets/                # Font Outfit (.ttf) & aset gambar
│   ├── components/
│   │   ├── common/            # Reusable UI Components (Button, Input, Card, Modal, Table, Badge, Toast)
│   │   ├── errors/            # Shared Error Components (NotFoundPage 404 & ForbiddenPage 403)
│   │   ├── layout/            # App Shell Layout (Sidebar, Header, MainLayout)
│   │   └── guard/             # Role-based Route Guard (ProtectedRoute)
│   ├── config/                # Environment config & dynamic navigation items
│   ├── context/               # AuthContext (JWT Session) & ThemeContext (Dynamic Colors)
│   ├── features/
│   │   ├── auth/              # Halaman & Form Login
│   │   ├── users/             # Admin User Management
│   │   ├── global-logs/       # Admin Redis Streams Audit Log Viewer
│   │   └── site-config/       # Admin Theme Color Customizer
│   ├── services/              # Axios API Client dengan JWT Interceptor
│   ├── index.css              # Font Outfit, CSS Reset & Color Variables
│   ├── App.tsx                # App Routing setup
│   └── main.tsx               # React Entry Point
```

## Features
- **Design Aesthetic**: Referensi dari `recycle-mate` dengan font **Outfit** dan skema warna resmi PT Sugity Creatives (`#008d51`, `#E76114`, `#037233`).
- **Dynamic Sidebar**: Menu sidebar terpusat di `navigation.config.ts` dan difilter otomatis berdasar role pengguna.
- **Strict AGENTS.md**: Pemisahan tegas antara komponen UI murni (`*.tsx`) dan logika API/state (`hooks/` & `services/`).
- **Shared Error Pages**: Komponen khusus untuk 404 Not Found dan 403 Forbidden.

## Run Locally
```bash
# Terminal (di folder frontend)
npm run dev
```
Aplikasi frontend akan berjalan di `http://localhost:5173`.
