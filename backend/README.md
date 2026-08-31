# Backend API - Material Management

RESTful API service untuk sistem pencatatan dan pemantauan daur ulang material plastik injection molding di PT Sugity Creatives.

## Structure
```
backend/
├── src/
│   ├── config/             # Database (MySQL), S3/MinIO, Swagger, dan Environment variables
│   ├── middlewares/        # Auth JWT, Rate Limiting, Request Logger (MySQL Audit), Error Handler
│   ├── modules/
│   │   ├── auth/           # Login & Token Verification
│   │   ├── users/          # User Management (Admin)
│   │   ├── factories/      # Master Data Pabrik/Lokasi Operasional
│   │   ├── machines/       # Master Data Mesin Inject Mold & Tonnage
│   │   ├── master-parts/   # Master Part catalog, QR lookup, autocomplete & S3 image upload
│   │   ├── crushing-requests/ # Pengajuan kirim part NG, draft SQL & verifikasi operator
│   │   ├── ng-transactions/# Input Transaksi Part NG (Ketik & Scan)
│   │   ├── production-actual/# Import data aktual produksi dari CSV shopfloor
│   │   ├── dashboard/      # Stat Summary, Pareto, Charts, SSE stream, & Export
│   │   ├── analytics/      # Data analitik produksi, 3-bar chart, gap matriks, pareto & rollback
│   │   ├── site-config/    # Application theme & visual branding configuration
│   │   └── global-logs/    # Global API audit trail logs (MySQL)
│   ├── utils/              # Response helper & SSE Event Emitter
│   ├── app.ts              # Express application config & routing
│   └── server.ts           # HTTP Server Entry point
```

## Features
- RESTful endpoints dengan standar JSON response.
- Interactive API Documentation via Swagger UI (`/api-docs`).
- Rate limiting via `express-rate-limit`.
- Audit log otomatis ke tabel MySQL `api_audit_logs`.
- Real-time updates via Server-Sent Events (SSE).
- Role-based authorization (`super-admin`, `admin`, `operator`, `pengirim`).
- Cloud Object Storage (MinIO / S3) untuk upload dan kompresi foto master part.

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
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://172.19.85.135:3000
COOKIE_SECURE=false

# Swagger / API Documentation Server URL (Opsional: jika kosong, otomatis menggunakan host/domain saat ini)
API_BASE_URL=

# MinIO / AWS S3 Config
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=crushing-management-parts
MINIO_REGION=us-east-1
MINIO_BASE_URL=http://172.19.85.135:9000
MINIO_FOLDER_MASTER_PARTS=master-parts
```

## Run Locally
```bash
# Development (Hot reload)
npm run dev

# Production Build & Run
npm run build
npm start
```
Dokumentasi Swagger interaktif dapat diakses di `/api-docs` (misal: `http://localhost:4000/api-docs` atau `http://<IP_SERVER>:<PORT>/api-docs`).
