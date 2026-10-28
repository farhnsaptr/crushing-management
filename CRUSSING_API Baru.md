# Crussing API Documentation

## Base URL
`/api/crussing`

## Authentication
All protected endpoints require `Authorization: Bearer <token>` header.
Uses the same `api_user` table as the ILS API.

---

## Endpoints

### GET /api/crussing/health
Connectivity check (no auth).

**Response (200):**
```json
{ "message": "Crussing API Connected! Timestamp: 2026-10-27 10:00:00" }
```

---

### POST /api/crussing/auth
Get JWT token.

**Request:**
```json
{
  "client_id": "string",
  "client_secret": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 604800
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| 401 | `{"error": "Invalid credentials"}` |
| 403 | `{"error": "Account is deactivated"}` |
| 422 | `{"error": "Validation failed", "details": {...}}` |

---

### GET /api/crussing/me
Check auth status.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "API User",
    "email": "user@example.com",
    "client_id": "client123"
  }
}
```

**Error Responses:**
| Status | Body |
|--------|------|
| 401 | `{"error": "Unauthorized"}` |

---

### POST /api/crussing/budomari
Summary budomari per record: info produksi + pcs + persentase
(`ok_use`, `ng_loss`, `runner`, `dango`, `dango_part`).

Filter pakai rentang tanggal eksplisit `date_from` s/d `date_to` (dua-duanya inklusif).

**Request:**
```json
{
  "location": "SC1",
  "date_from": "2025-10-01",
  "date_to": "2025-10-31"
}
```

| Field | Rule |
|-------|------|
| `location` | required, `SC1` atau `SC2` |
| `date_from` | required, tanggal valid (`Y-m-d` atau `Y-m-d H:i:s`) — dinormalisasi ke 00:00:00 |
| `date_to` | required, tanggal valid, `>= date_from` — dinormalisasi ke 23:59:59 |

**Response (200):**
```json
{
  "success": true,
  "meta": {
    "location": "SC1",
    "date_from": "2025-10-01 00:00:00",
    "date_to": "2025-10-31 23:59:59"
  },
  "data": [
    {
      "sebango": "ABC123",
      "shift": "D",
      "date": "2025-10-15 08:00:00",
      "factory": "F1",
      "machine_no": "M01",
      "tonnage": "150",
      "part_no": "PN-001",
      "material_name": "PP BLACK",
      "reuse_flag": "1",
      "act_total_pcs": 1000,
      "act_ok_pcs": 950,
      "ng_total_pcs": 50,
      "ok_use_pct": 85.123,
      "ng_loss_pct": 5.001,
      "runner_pct": 8.5,
      "dango_pct": 1.2,
      "dango_part_pct": 0.176
    }
  ]
}
```

**Response Fields (per record):**
| JSON | Sumber kolom |
|------|--------------|
| `sebango` | `production_result.SEBANGO` |
| `shift` | `production_result.SHIFT` (`D` / `N`) |
| `date` | `production_result.DATE` |
| `factory` | `production_result.FACTORY` |
| `machine_no` | `production_result.MESIN` |
| `tonnage` | `production_result.TONASE` |
| `part_no` | `production_data_injection.PART_NO_INJECTION` |
| `material_name` | `production_data_injection.ENG_MAIN_ITEM_NAME` |
| `reuse_flag` | `production_data_sebango.STATUS` |
| `act_total_pcs` | `production_result.ACT_TOTAL` |
| `act_ok_pcs` | `production_result.ACT_OK` |
| `ng_total_pcs` | `production_result.NG_TOTAL` |
| `ok_use_pct` | hitung (cumulative OK / total usage × 100) |
| `ng_loss_pct` | hitung (cumulative NG / total usage × 100) |
| `runner_pct` | hitung (cumulative runner / total usage × 100) |
| `dango_pct` | hitung (`DAN_GO` / total usage × 100) |
| `dango_part_pct` | hitung (cumulative dango part / total usage × 100) |

> Saat `ACT_OK == 0` atau `PCS_MOLD == 0`, semua `*_pct` = 0 (guard pembagi nol).

**Error Responses:**
| Status | Body |
|--------|------|
| 401 | `{"error": "Unauthorized"}` |
| 422 | `{"error": "Validation failed", "details": {...}}` |

---

## Token Expiry
- Default: 168 hours (7 days)
- Configured via `$tokenExpiryHours` in `CrussingController`

## Catatan
- `api_user.token` menyimpan **satu** token terakhir. Karena ILS & Crussing berbagi
  tabel ini, auth ulang di salah satu API meng-invalidasi token API lain untuk user
  yang sama. Pakai client_id terpisah per API bila perlu token independen.
