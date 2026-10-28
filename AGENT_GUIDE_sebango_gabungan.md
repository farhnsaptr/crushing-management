# Panduan Agent: Resolusi SEBANGO Gabungan saat Import Report Produksi

Stack: **React (Vite)** di frontend, **Express (Node.js, ESM)** di backend.

## 1. Tujuan

File report produksi (xlsx) kadang menulis SEBANGO **gabungan**, misalnya `U0-3315/6-201B`. Di master parts, sebango tersimpan **satuan**: `U0-3315-201B` dan `U0-3316-201B`. Saat import, sebango gabungan harus diperluas menjadi sebango satuan, lalu setiap sebango satuan mendapat **jumlah produksi penuh** dari baris tersebut.

Contoh: baris `U0-3315/6-201B` dengan 10 part menjadi 10 untuk `U0-3315-201B` dan 10 untuk `U0-3316-201B`. Jumlah **tidak dibagi**.

## 2. Aturan wajib

1. **Jangan hardcode** daftar sebango, pola per sebango, atau `if (sebango === ...)`. Semua keputusan diambil dari regex dan isi master.
2. **Cocokkan persis dulu, baru perluas.** Master sudah memuat beberapa sebango bergaris miring (contoh: `U0-3305/6-SH842`, `U0-5025/6-202B`, `U0-5616/7-BLCK`, `L0-5623/4-BLCK`, `U0-5619/20-BLCK`). Jika langsung diperluas, sebango ini gagal cocok.
3. **Perluasan memakai substitusi, bukan penjumlahan +1.** Token setelah `/` menimpa N karakter terakhir token pertama, N = panjang token itu. Dengan begitu `5619/20` menjadi `5620` dan sebango alfanumerik tidak bermasalah.
4. **Sebango yang tidak ketemu di master tidak boleh dilewati diam-diam.** Kembalikan sebagai error/warning di hasil import.
5. Jangan menebak makna ambigu (lihat bagian 7).

## 3. Contoh perluasan

| Input report | Hasil |
|---|---|
| `U0-3315/6-201B` | `U0-3315-201B`, `U0-3316-201B` |
| `U0-6136/38-NH696` | `U0-6136-NH696`, `U0-6138-NH696` |
| `U0-5619/20-BLCK` | `U0-5619-BLCK`, `U0-5620-BLCK` |
| `U0-2994/5/6/7-201B` | `U0-2994-201B`, `U0-2995-201B`, `U0-2996-201B`, `U0-2997-201B` |
| `U0-1234/5-1-BLCK` | `U0-1234-1-BLCK`, `U0-1235-1-BLCK` (suffix boleh berisi `-`) |
| `U0-6136/38-NH696(RESIN)` | anotasi `(RESIN)` dibuang saat normalisasi, lalu seperti baris 2 |

## 4. Regex

```
^(?<pre>[A-Z0-9]+)-(?<num>[A-Z0-9]+(?:\/[A-Z0-9]+)+)-(?<suf>.+)$
```

- `pre`: prefix (`U0`, `L0`, `US`).
- `num`: angka dengan minimal satu `/`; `(?:\/...)+` membuat jumlah token bebas (2, 3, 4, ...). Memakai `[A-Z0-9]`, bukan `\d`, karena ada sebango alfanumerik (`1A16`, `230B`).
- `suf`: sisanya, `.+` karena suffix bisa mengandung `-` (`11BK03`, `1-BLCK`).

Input harus dinormalisasi lebih dulu: uppercase, hapus semua whitespace, buang anotasi `(...)` di akhir.

## 5. Implementasi backend

File: `server/src/utils/sebango.js`

```js
const COMBINED_RE =
  /^(?<pre>[A-Z0-9]+)-(?<num>[A-Z0-9]+(?:\/[A-Z0-9]+)+)-(?<suf>.+)$/;

export function normalizeSebango(raw) {
  return String(raw ?? '')
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/\([^)]*\)$/, ''); // buang anotasi akhir, mis. "(RESIN)"
}

export function expandSebango(sebango) {
  const m = COMBINED_RE.exec(sebango);
  if (!m) return [sebango]; // bukan gabungan
  const { pre, num, suf } = m.groups;
  const [first, ...rest] = num.split('/');
  const nums = [
    first,
    ...rest.map((t) =>
      t.length < first.length ? first.slice(0, -t.length) + t : t
    ),
  ];
  return [...new Set(nums)].map((n) => `${pre}-${n}-${suf}`);
}

/**
 * masterMap: Map<string, Array<masterRow>> dengan key sebango ter-normalisasi.
 * Hasil: { raw, normalized, strategy: 'exact' | 'expanded' | 'none', matched[], missing[] }
 */
export function resolveSebango(raw, masterMap) {
  const normalized = normalizeSebango(raw);

  if (masterMap.has(normalized)) {
    return { raw, normalized, strategy: 'exact', matched: [normalized], missing: [] };
  }

  const expanded = expandSebango(normalized);
  const matched = expanded.filter((s) => masterMap.has(s));
  const missing = expanded.filter((s) => !masterMap.has(s));
  const strategy =
    expanded.length === 1 && expanded[0] === normalized ? 'none' : 'expanded';

  return { raw, normalized, strategy, matched, missing };
}
```

Implementasi ini sudah diuji dengan Node terhadap semua contoh di bagian 3.

## 6. Integrasi ke alur import (Express)

1. **Muat master sekali per request import**, bukan per baris:
   ```js
   const masterMap = new Map();
   for (const row of masterRows) {
     const key = normalizeSebango(row.sebango);
     if (!masterMap.has(key)) masterMap.set(key, []);
     masterMap.get(key).push(row);
   }
   ```
   Memakai `Map<string, Array>` karena sebango di master bisa **duplikat** (contoh di file master: `U0-737-FR`, `U0-5056/7-RT57`). Jika `masterMap.get(key).length > 1`, laporkan sebagai `ambiguous` dan jangan memilih salah satu diam-diam.
2. **Untuk setiap baris report**, panggil `resolveSebango(row.SEBANGO, masterMap)`.
3. **Untuk setiap sebango di `matched`**, buat satu record produksi dengan **nilai kuantitas yang sama** dengan baris sumber. Simpan juga nomor baris sumber dan sebango asli (`raw`) untuk jejak audit.
4. **Untuk setiap sebango di `missing`**, jangan buat record. Masukkan ke daftar error: `{ rowNumber, raw, missing }`.
5. **Baris dengan `strategy: 'none'`** dan tidak ada di master adalah sebango yang memang belum terdaftar. Perlakukan sebagai error yang sama dengan `missing`.
6. **Sheet yang dibaca**: file report yang diuji punya dua sheet (`Worksheet` dan `Sheet1`). Pastikan sheet yang dibaca sesuai dan jangan mengasumsikan hanya satu.
7. **Nilai sel Excel** bisa bukan string (angka, null). Selalu lewat `normalizeSebango` yang sudah memakai `String(raw ?? '')`.

### Respons API yang disarankan

```json
{
  "summary": { "rows": 2368, "resolved": 2300, "expandedRows": 310, "unresolved": 12 },
  "unresolved": [
    { "rowNumber": 41, "raw": "U0-6136/38-NH696(RESIN)", "missing": ["U0-6138-NH696"] }
  ]
}
```

### Frontend (React Vite)

Frontend **tidak** menjalankan logika ini. Ia hanya menampilkan **preview hasil resolusi** dari backend sebelum user mengonfirmasi import: berapa baris terdeteksi gabungan, hasil perluasannya, dan tabel sebango yang belum ada di master. Dengan begitu satu sumber kebenaran tetap di backend.

## 7. Hal ambigu yang harus dikonfirmasi ke user, jangan ditebak

- `U0-6136/38-NH696`: perluasan menghasilkan `U0-6138-NH696`, yang **tidak ada di master** (master hanya punya `6135`, `6136`, `6137` untuk `NH696`). Bisa karena master belum lengkap, atau maksudnya rentang 6136 sampai 6138. Jangan menambahkan logika rentang tanpa konfirmasi.
- `U0-2627/8-BLCK`: `U0-2627-BLCK` dan `U0-2628-BLCK` tidak ada di master. Ini data master yang kurang, bukan bug regex.

## 8. Test yang harus lulus

Buat `sebango.test.js` (Vitest/Jest) minimal dengan kasus berikut:

```js
expandSebango('U0-3315/6-201B')       // ['U0-3315-201B','U0-3316-201B']
expandSebango('U0-6136/38-NH696')     // ['U0-6136-NH696','U0-6138-NH696']
expandSebango('U0-2994/5/6/7-201B')   // 4 sebango: 2994, 2995, 2996, 2997
expandSebango('U0-5619/20-BLCK')      // ['U0-5619-BLCK','U0-5620-BLCK']
expandSebango('U0-1234/5-1-BLCK')     // ['U0-1234-1-BLCK','U0-1235-1-BLCK']
expandSebango('U0-4511-R1G3')         // ['U0-4511-R1G3'] (bukan gabungan)
normalizeSebango(' u0-6136/38-nh696(RESIN) ') // 'U0-6136/38-NH696'
```

Test `resolveSebango` dengan master kecil:

- Master berisi `U0-5025/6-202B` → `resolveSebango('U0-5025/6-202B')` harus `strategy: 'exact'` (bukan diperluas).
- Master berisi 3315 dan 3316 → `U0-3315/6-201B` menghasilkan dua `matched`.
- Master hanya berisi `U0-6136-NH696` → `U0-6136/38-NH696(RESIN)` menghasilkan `missing: ['U0-6138-NH696']`.

## 9. Definition of done

- Semua test di bagian 8 lulus.
- Tidak ada string sebango spesifik atau tabel mapping manual di kode produksi.
- Baris gabungan menghasilkan record per sebango satuan dengan kuantitas penuh.
- Sebango yang tidak cocok muncul di laporan error, tidak hilang diam-diam.
- Pada file report contoh, sebango berikut terdeteksi penuh: `3315/6`, `3317/8`, `2990/1`, `2992/3`, `5018/9`, `5036/7`, `5044/5`, `5085/6`, `5092/3`, `5094/5`, `2994/5/6/7`.
