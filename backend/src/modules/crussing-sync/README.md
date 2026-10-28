# Modul Sinkronisasi Crusing API (`crussing-sync`)

Modul ini menarik data produksi dari API eksternal Crusing (MIS Hub) lalu menyimpannya ke tabel lokal agar Dashboard (grafik Budomari), Data Analitik, dan Input Runner memakai sumber data yang sama.

## Struktur Folder

```
crussing-sync/
├── crussing.client.ts      # HTTP client, auth token cache, retry 401, error mapping
├── crussing.mapper.ts      # Fungsi murni mapping record API -> tipe lokal
├── crussingSync.service.ts # Orkestrasi sync, replace data per periode, status
├── crussingSync.controller.ts
├── crussingSync.routes.ts
└── README.md
```

## Konfigurasi (`backend/.env`)

```
CRUSSING_API_BASE_URL=https://apps.sugity.co.id/mishub/api/crussing
CRUSSING_API_CLIENT_ID=...
CRUSSING_API_CLIENT_SECRET=...
CRUSSING_API_TIMEOUT_MS=60000
CRUSSING_LOCATION_MAP=Cibitung=SC1,Karawang=SC2
```

## Endpoint

| Method | Path | Akses |
|---|---|---|
| `POST` | `/api/crussing-sync/sync` | `super-admin`, `admin`, `operator` |
| `GET` | `/api/crussing-sync/status?location=&year=&month=` | Semua user login |
| `GET` | `/api/crussing-sync/unmatched-sebangos?location=&year=&month=` | Semua user login |

Body sync:

```json
{ "location": "Cibitung", "year": 2026, "month": 10 }
```

`month` opsional. Tanpa `month` berarti satu tahun penuh (lebih lambat; UI memakai per bulan).

## Perilaku

1. Resolve lokasi internal (`Cibitung`/`Karawang`) ke kode API (`SC1`/`SC2`) lewat `CRUSSING_LOCATION_MAP`.
2. Auth ke `POST /auth`, token di-cache in-memory sampai 5 menit sebelum kedaluwarsa.
3. `POST /budomari` untuk rentang tanggal. Kalau 401, auth ulang sekali lalu retry.
4. Record dipetakan ke `production_analytics_items` (allowance & SEBANGO dihitung dengan logika import yang sudah ada) dan `runner_material_transactions` (berat runner = `act_total_pcs × berat_runner_gr / 1000`).
5. Data **hasil API** pada lokasi + periode yang sama diganti (delete + insert dalam satu transaksi). Data upload manual tidak dihapus; status mengembalikan `manual_overlap` sebagai peringatan.
6. Status terakhir disimpan di `crussing_sync_state` dan dibaca oleh UI tanpa memanggil API eksternal.

## Catatan

- API eksternal membatasi **60 request per window**. Satu sync = 1 auth (kalau cache kosong) + 1 request budomari. Jangan sync paralel.
- Response setahun bisa ~8 MB / 35 detik. Karena itu UI melakukan sync **per bulan** (sekitar 1 detik).
- Token `api_user` hanya satu; gunakan `client_id` khusus integrasi ini agar tidak saling invalidasi dengan API ILS.
