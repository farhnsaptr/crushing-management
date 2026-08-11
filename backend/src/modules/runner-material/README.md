# Runner Material Module

Modul ini bertanggung jawab mengelola pencatatan data **Part Runner NG per Jenis Material** berdasarkan import data produksi CSV (MIS shopfloor).

## Deskripsi Functions & Alur Data

1. **Client-Side CSV Reading**:
   - File CSV dikirim oleh client dalam bentuk array hasil parse (`date`, `sebango_code`, `shift`, `act_total_pcs`).

2. **Shift & Sebango Aggregation**:
   - Apabila terdapat beberapa baris untuk sebango yang sama (misalnya Shift D (pagi) dan Shift N (malam)), nilai `ACT TOTAL` diakumulasikan.

3. **Master Part Lookup & Perhitungan Runner**:
   - Setiap kode Sebango dicocokkan ke tabel `master_parts`.
   - Berat runner per sebango dihitung dengan rumus:
     $$\text{runner\_weight\_kg} = \frac{\text{ACT TOTAL} \times \text{berat\_runner\_gr}}{1000}$$

4. **Pengelompokan Per Material**:
   - Jika beberapa sebango berbeda terhubung pada jenis material yang sama, total pcs dan total berat runner (kg) digabungkan per material.
   - Hasil akumulasi per material disimpan ke tabel `runner_material_transactions`.

## API Endpoints

- `POST /api/runner-material/preview` — Mengkalkulasi preview pencatatan runner per material.
- `POST /api/runner-material/save` — Menyimpan data terkonfirmasi runner per material ke database.
- `GET /api/runner-material` — Mengambil daftar riwayat pencatatan runner material.
