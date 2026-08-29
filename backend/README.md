# Backend API - Material Management

RESTful API service untuk sistem pencatatan dan pemantauan daur ulang material plastik injection molding di PT Sugity Creatives.

## Structure
```
backend/
├── src/
│   ├── config/             # Database (MySQL), Swagger, dan Environment variables
│   ├── middlewares/        # Auth JWT, Rate Limiting, Request Logger (MySQL Audit), Error Handler
│   ├── modules/
│   │   ├── auth/           # Login & Token Verification
│   │   ├── users/          # User Management (Admin)
│   │   ├── factories/      # Master Data Pabrik/Lokasi Operasional
│   │   ├── machines/       # Master Data Mesin Inject Mold & Tonnage
│   │   ├── master-parts/   # Master Part catalog, QR lookup, & autocomplete
│   │   ├── crushing-requests/ # Pengajuan kirim part NG, draft SQL & verifikasi operator
│   │   ├── ng-transactions/# Input Transaksi Part NG (Ketik & Scan)
│   │   ├── production-actual/# Import data aktual produksi dari CSV shopfloor
│   │   ├── dashboard/      # Stat Summary, Pareto, Charts, SSE stream, & Export
│   │   ├── analytics/      # Data analitik produksi, 3-bar chart, gap matriks, pareto & rollback
│   │   ├── site-config/    # Application theme configuration (Admin)
│   │   └── global-logs/    # Global API audit trail logs (MySQL)
│   ├── utils/              # Response helper & SSE Event Emitter
│   ├── app.ts              # Express application config & routing
│   └── server.ts           # HTTP Server Entry point
```

## Features
- RESTful endpoints dengan standar JSON response.
- Pemisahan data master `factories` dan `machines` secara fleksibel.
- Interactive API Documentation via Swagger UI (`http://localhost:4000/api-docs`).
- Rate limiting via `express-rate-limit`.
- Audit log otomatis ke tabel MySQL `api_audit_logs`.
- Pengajuan dan penyimpanan draft pengiriman part NG langsung ke database MySQL (`is_submitted = FALSE/TRUE`).
- Real-time updates via Server-Sent Events (SSE).
- Role-based authorization (`super-admin`, `admin`, `operator`, `pengirim`).

## Environment Setup
Pastikan file `.env` di folder `backend/` memiliki konfigurasi berikut:
```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=crushing_management
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
```

## Run Locally
```bash
# Terminal (di folder backend)
npm run dev
```
Backend akan berjalan di `http://localhost:4000` menggunakan `tsx watch` (hot-reload cepat tanpa issue kompatibilitas TypeScript). Dokumentasi Swagger interaktif di `http://localhost:4000/api-docs`.
