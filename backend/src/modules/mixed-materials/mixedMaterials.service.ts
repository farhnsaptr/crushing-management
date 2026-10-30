import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';

type RecycleType = 'reuse' | 'no_reuse';

export class MixedMaterialsService {
  /** Nama campuran harus unik juga terhadap master_materials. */
  private static async assertUniqueName(name: string, excludeId?: string) {
    const [m] = await pool.query<RowDataPacket[]>('SELECT id FROM master_materials WHERE material_name = ?', [name]);
    if (m.length > 0) throw new Error(`Nama "${name}" sudah dipakai oleh master material.`);
    const [x] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM mixed_materials WHERE mixed_name = ? AND id != ?',
      [name, excludeId || '']
    );
    if (x.length > 0) throw new Error(`Nama material campuran "${name}" sudah terdaftar.`);
  }

  static async normalizeLocations(locations?: string[]): Promise<string[]> {
 const unique = [...new Set((locations || []).map((l) => String(l).trim()).filter(Boolean))];
 if (unique.length === 0) throw new Error('Pilih minimal 1 lokasi plant untuk material campuran.');

 const [rows] = await pool.query<RowDataPacket[]>(
 `SELECT DISTINCT location FROM factories
 WHERE location IS NOT NULL AND TRIM(location) != ''`
 );
 const valid = new Set(rows.map((r) => String(r.location)));
 const invalid = unique.filter((l) => !valid.has(l));
 if (invalid.length > 0) throw new Error(`Lokasi plant tidak valid: ${invalid.join(', ')}.`);
 return unique;
 }

 private static async replaceLocations(mixedId: string, locations: string[]) {
 await pool.query('DELETE FROM mixed_material_locations WHERE mixed_material_id = ?', [mixedId]);
 for (const location of locations) {
 await pool.query(
 'INSERT INTO mixed_material_locations (mixed_material_id, location) VALUES (?, ?)',
 [mixedId, location]
 );
 }
 }

 /** Tolak pelepasan lokasi jika masih ada anggota material di plant tersebut. */
 private static async assertLocationsRemovable(mixedId: string, keptLocations: string[]) {
 const [rows] = await pool.query<RowDataPacket[]>(
 'SELECT location FROM mixed_material_locations WHERE mixed_material_id = ?',
 [mixedId]
 );
 const removed = rows.map((r) => String(r.location)).filter((l) => !keptLocations.includes(l));

 for (const location of removed) {
 const [used] = await pool.query<RowDataPacket[]>(
 `SELECT COUNT(*) AS total
 FROM master_materials mm
 JOIN master_material_locations mml ON mml.material_id = mm.id
 WHERE mm.mixed_material_id = ? AND mml.location = ?`,
 [mixedId, location]
 );
 if (Number(used[0]?.total || 0) > 0) {
 throw new Error(`Campuran masih punya anggota material di plant ${location}.`);
 }
 }
 }

 static async list(search: string = '', location: string = '') {
 const params: any[] = [];
 let where = '';
 if (search.trim()) {
 where = 'WHERE (xm.mixed_name LIKE ? OR xm.description LIKE ?)';
 params.push(`%${search.trim()}%`, `%${search.trim()}%`);
 }
 if (location && location.trim() !== '') {
 where += `${where ? ' AND' : ' WHERE'} EXISTS (SELECT 1 FROM mixed_material_locations mxl WHERE mxl.mixed_material_id = xm.id AND mxl.location = ?)`;
 params.push(location.trim());
 }
 const [rows] = await pool.query<RowDataPacket[]>(
 `SELECT xm.id, xm.mixed_name, xm.description, xm.recycle_type, xm.created_at, xm.updated_at,
 (SELECT GROUP_CONCAT(mxl.location ORDER BY mxl.location)
 FROM mixed_material_locations mxl WHERE mxl.mixed_material_id = xm.id) AS locations_csv,
 COUNT(mm.id) AS members_count
 FROM mixed_materials xm
 LEFT JOIN master_materials mm ON mm.mixed_material_id = xm.id
 ${where}
 GROUP BY xm.id
 ORDER BY xm.mixed_name ASC`,
 params
 );
 return rows.map((r): any => ({
 ...r,
 locations: r.locations_csv ? String(r.locations_csv).split(',') : [],
 members_count: Number(r.members_count || 0),
 }));
 }

 static async getById(id: string) {
 const rows = await this.list();
 return rows.find((r) => r.id === id) || null;
 }

 static async create(data: { mixed_name: string; description?: string; recycle_type?: RecycleType; locations?: string[] }) {
 const name = (data.mixed_name || '').trim();
 if (!name) throw new Error('Nama material campuran wajib diisi.');
 if (data.recycle_type !== 'reuse' && data.recycle_type !== 'no_reuse') {
 throw new Error('Jenis recycle (reuse / no_reuse) wajib dipilih.');
 }
 const locations = await this.normalizeLocations(data.locations);
 await this.assertUniqueName(name);
 const id = randomUUID();
 await pool.query(
 'INSERT INTO mixed_materials (id, mixed_name, description, recycle_type) VALUES (?, ?, ?, ?)',
 [id, name, data.description?.trim() || null, data.recycle_type]
 );
 await this.replaceLocations(id, locations);
 return this.getById(id);
 }

 static async update(id: string, data: { mixed_name?: string; description?: string; recycle_type?: RecycleType; locations?: string[] }) {
 const existing = await this.getById(id);
 if (!existing) throw new Error('Material campuran tidak ditemukan.');

 const name = data.mixed_name !== undefined ? data.mixed_name.trim() : existing.mixed_name;
 if (!name) throw new Error('Nama material campuran wajib diisi.');
 if (name !== existing.mixed_name) await this.assertUniqueName(name, id);

 const recycleType = data.recycle_type || existing.recycle_type;
 if (recycleType !== 'reuse' && recycleType !== 'no_reuse') throw new Error('Jenis recycle tidak valid.');
 const description = data.description !== undefined ? data.description.trim() || null : existing.description;
 const locations = data.locations !== undefined
 ? await this.normalizeLocations(data.locations)
 : existing.locations;
 if (data.locations !== undefined) await this.assertLocationsRemovable(id, locations);

 await pool.query(
 'UPDATE mixed_materials SET mixed_name = ?, description = ?, recycle_type = ? WHERE id = ?',
 [name, description, recycleType, id]
 );
 if (data.locations !== undefined) await this.replaceLocations(id, locations);
 return this.getById(id);
 }

 /** Menghapus campuran melepas semua anggotanya (FK ON DELETE SET NULL); transaksi lama tetap atas nama campuran. */
 static async remove(id: string) {
 const existing = await this.getById(id);
 if (!existing) throw new Error('Material campuran tidak ditemukan.');
 await pool.query('DELETE FROM mixed_materials WHERE id = ?', [id]);
 return { id };
 }

 static async getMembers(id: string) {
    const mixed = await this.getById(id);
    if (!mixed) throw new Error('Material campuran tidak ditemukan.');
    const [members] = await pool.query<RowDataPacket[]>(
      `SELECT mm.id, mm.material_name, mm.recycle_type, COUNT(mp.id) AS used_parts_count
       FROM master_materials mm
       LEFT JOIN master_parts mp ON mp.material_id = mm.id
       WHERE mm.mixed_material_id = ?
       GROUP BY mm.id
       ORDER BY mm.material_name ASC`,
      [id]
    );
    return {
      mixed,
      members: members.map((m) => ({ ...m, used_parts_count: Number(m.used_parts_count || 0) })),
      totalMembers: members.length,
    };
  }
}
