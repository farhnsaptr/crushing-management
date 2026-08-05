# Backend API - Recycle Material Management

RESTful API service untuk sistem pencatatan dan pemantauan daur ulang material plastik injection molding di PT Sugity Creatives.

## Structure
```
backend/
├── src/
│   ├── config/             # Database (MySQL), Redis, Swagger, dan Environment variables
│   ├── middlewares/        # Auth JWT, Rate Limiting, Request Logger (Redis Stream), Error Handler
│   ├── modules/
│   │   ├── auth/           # Login & Token Verification
│   │   ├── users/          # User Management (Admin)
│   │   ├── factories/      # Master Data Pabrik/Lokasi Operasional
│   │   ├── machines/       # Master Data Mesin Inject Mold & Tonnage
│   │   ├── master-parts/   # Master Part catalog, QR lookup, & autocomplete
│   │   ├── ng-transactions/# Input Transaksi Part NG (Ketik & Scan)
│   │   ├── production-actual/# Import data aktual produksi dari CSV shopfloor
│   │   ├── dashboard/      # Stat Summary, Pareto, Charts, SSE stream, & Export
│   │   ├── site-config/    # Application theme configuration (Admin)
│   │   └── global-logs/    # Global API audit trail logs (Admin)
│   ├── utils/              # Response helper & SSE Event Emitter
│   ├── app.ts              # Express application config & routing
│   └── server.ts           # HTTP Server Entry point
```

## Features
- RESTful endpoints dengan standar JSON response.
- Pemisahan data master `factories` dan `machines` secara fleksibel.
- Interactive API Documentation via Swagger UI (`http://localhost:4000/api-docs`).
- Rate limiting via `express-rate-limit`.
- Audit log otomatis ke Redis Streams (`logs:api-requests`).
- Real-time updates via Server-Sent Events (SSE).
- Role-based authorization (`admin` vs `operator`).

## Environment Setup
Pastikan file `.env` di folder `backend/` memiliki konfigurasi berikut:
```env
PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
JWT_SECRET=
JWT_EXPIRES_IN=
CORS_ORIGIN=
```

## Run Locally
```bash
# Terminal (di folder backend)
npm run dev
```
Backend akan berjalan di `http://localhost:4000` menggunakan `tsx watch` (hot-reload cepat tanpa issue kompatibilitas TypeScript). Dokumentasi Swagger interaktif di `http://localhost:4000/api-docs`.
