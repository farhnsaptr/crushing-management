import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class MaterialsService {
  /** Nama material harus unik juga terhadap nama material campuran. */
  private static async assertNotMixedName(name: string) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM mixed_materials WHERE mixed_name = ?', [name]);
    if (rows.length > 0) {
      throw new Error(`Nama "${name}" sudah dipakai oleh material campuran.`);
    }
  }

 private static async assertMixedExists(mixedId: string) {
 const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM mixed_materials WHERE id = ?', [mixedId]);
 if (rows.length === 0) throw new Error('Material campuran tidak ditemukan.');
 }

 /** Validasi & normalisasi lokasi plant material (sumber daftar: factories.location). */
 private static async normalizeLocations(locations?: string[]): Promise<string[]> {
 const unique = [...new Set((locations || []).map((l) => String(l).trim()).filter(Boolean))];
 if (unique.length === 0) throw new Error('Pilih minimal 1 lokasi plant untuk material.');

 const [rows] = await pool.query<RowDataPacket[]>(
 `SELECT DISTINCT location FROM factories
 WHERE location IS NOT NULL AND TRIM(location) != ''`
 );
 const valid = new Set(rows.map((r) => String(r.location)));
 const invalid = unique.filter((l) => !valid.has(l));
 if (invalid.length > 0) throw new Error(`Lokasi plant tidak valid: ${invalid.join(', ')}.`);
 return unique;
 }

 private static async replaceLocations(materialId: string, locations: string[]) {
 await pool.query('DELETE FROM master_material_locations WHERE material_id = ?', [materialId]);
 for (const location of locations) {
 await pool.query(
 'INSERT INTO master_material_locations (material_id, location) VALUES (?, ?)',
 [materialId, location]
 );
 }
 }

 /** Tolak pelepasan lokasi jika material masih dipakai part di plant tersebut. */
 private static async assertLocationsRemovable(materialId: string, keptLocations: string[]) {
 const [rows] = await pool.query<RowDataPacket[]>(
 'SELECT location FROM master_material_locations WHERE material_id = ?',
 [materialId]
 );
 const removed = rows.map((r) => String(r.location)).filter((l) => !keptLocations.includes(l));

 for (const location of removed) {
 const [used] = await pool.query<RowDataPacket[]>(
 `SELECT COUNT(DISTINCT mp.id) AS total
 FROM master_parts mp
 WHERE mp.material_id = ?
 AND (
 EXISTS (SELECT 1 FROM master_part_factories mpf
 JOIN factories f ON f.id = mpf.factory_id
 WHERE mpf.master_part_id = mp.id AND f.location = ?)
 OR EXISTS (SELECT 1 FROM machines mc
 JOIN factories f2 ON f2.id = mc.factory_id
 WHERE mc.id = mp.machine_id AND f2.location = ?)
 )`,
 [materialId, location, location]
 );
 if (Number(used[0]?.total || 0) > 0) {
 throw new Error(`Material masih dipakai part di plant ${location}.`);
 }
 }
 }

 /** Campuran harus mencakup semua lokasi material anggotanya. */
 private static async assertMixedCoversLocations(mixedId: string, locations: string[]) {
 const [rows] = await pool.query<RowDataPacket[]>(
 'SELECT location FROM mixed_material_locations WHERE mixed_material_id = ? AND location IN (?)',
 [mixedId, locations]
 );
 if (rows.length !== locations.length) {
 const covered = new Set(rows.map((r) => String(r.location)));
 const missing = locations.filter((l) => !covered.has(l));
 throw new Error(`Material campuran belum tersedia di plant: ${missing.join(', ')}.`);
 }
 }

 private static mapMaterialRow(r: RowDataPacket) {
 const { locations_csv, ...rest } = r;
 return {
 ...rest,
 locations: locations_csv ? String(locations_csv).split(',') : [],
 used_parts_count: Number(r.used_parts_count || 0),
 };
 }

 static async listAllMaterials(page: number = 1, limit: number = 20, search: string = '', location: string = '') {
 const offset = (page - 1) * limit;

 let whereClause = 'WHERE 1=1';
 const params: any[] = [];

 if (search && search.trim() !== '') {
 whereClause += ' AND (mm.material_name LIKE ? OR mm.description LIKE ?)';
 const s = `%${search.trim()}%`;
 params.push(s, s);
 }

 if (location && location.trim() !== '') {
 whereClause += ` AND EXISTS (SELECT 1 FROM master_material_locations mml WHERE mml.material_id = mm.id AND mml.location = ?)`;
 params.push(location.trim());
 }

 const countQuery = `SELECT COUNT(*) AS total FROM master_materials mm ${whereClause}`;
 const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params);
 const total = countRows[0].total;

 const partLocationFilter = location && location.trim() !== ''
 ? `AND EXISTS (SELECT 1 FROM master_part_factories mpf
 JOIN factories pf ON pf.id = mpf.factory_id
 WHERE mpf.master_part_id = mp.id AND pf.location = ?)`
 : '';
 const dataParams = location && location.trim() !== '' ? [location.trim(), ...params] : params;

 const dataQuery = `
 SELECT
 mm.id,
 mm.material_name,
 mm.description,
 mm.recycle_type,
 mm.mixed_material_id,
 xm.mixed_name AS mixed_material_name,
 mm.created_at,
 mm.updated_at,
 (SELECT GROUP_CONCAT(mml.location ORDER BY mml.location)
 FROM master_material_locations mml WHERE mml.material_id = mm.id) AS locations_csv,
 COUNT(DISTINCT mp.id) AS used_parts_count
 FROM master_materials mm
 LEFT JOIN mixed_materials xm ON xm.id = mm.mixed_material_id
 LEFT JOIN master_parts mp ON mp.material_id = mm.id ${partLocationFilter}
 ${whereClause}
 GROUP BY mm.id, xm.mixed_name
 ORDER BY mm.created_at DESC
 LIMIT ? OFFSET ?
 `;

 const [rows] = await pool.query<RowDataPacket[]>(dataQuery, [...dataParams, limit, offset]);

 return {
 materials: rows.map((r) => this.mapMaterialRow(r)),
 pagination: {
 page,
 limit,
 total,
 totalPages: Math.ceil(total / limit) || 1,
 },
 };
 }

  static async getMaterialById(id: string): Promise<any> {
 const [rows] = await pool.query<RowDataPacket[]>(
 `SELECT
 mm.id,
 mm.material_name,
 mm.description,
 mm.recycle_type,
 mm.mixed_material_id,
 xm.mixed_name AS mixed_material_name,
 mm.created_at,
 mm.updated_at,
 (SELECT GROUP_CONCAT(mml.location ORDER BY mml.location)
 FROM master_material_locations mml WHERE mml.material_id = mm.id) AS locations_csv,
 COUNT(mp.id) AS used_parts_count
 FROM master_materials mm
 LEFT JOIN mixed_materials xm ON xm.id = mm.mixed_material_id
 LEFT JOIN master_parts mp ON mp.material_id = mm.id
 WHERE mm.id = ?
 GROUP BY mm.id, xm.mixed_name`,
 [id]
 );
 if (!rows[0]) return null;
 return this.mapMaterialRow(rows[0]);
 }

 static async createMaterial(data: { material_name: string; description?: string; recycle_type?: 'reuse' | 'no_reuse'; mixed_material_id?: string | null; locations?: string[] }) {
 const cleanName = data.material_name.trim();
 const locations = await this.normalizeLocations(data.locations);

 // Check duplicate material_name
 const [existing] = await pool.query<RowDataPacket[]>(
 'SELECT id FROM master_materials WHERE material_name = ?',
 [cleanName]
 );

 if (existing.length > 0) {
 throw new Error(`Nama material "${cleanName}" sudah terdaftar.`);
 }

 await this.assertNotMixedName(cleanName);
 const mixedMaterialId = data.mixed_material_id || null;
 if (mixedMaterialId) {
 await this.assertMixedExists(mixedMaterialId);
 await this.assertMixedCoversLocations(mixedMaterialId, locations);
 }

 const id = randomUUID();
 let recycleType = data.recycle_type;
 if (!recycleType) {
 const desc = (data.description || '').toLowerCase();
 recycleType = desc.includes('no reuse') ? 'no_reuse' : 'reuse';
 }

 await pool.query(
 'INSERT INTO master_materials (id, material_name, description, recycle_type, mixed_material_id) VALUES (?, ?, ?, ?, ?)',
 [id, cleanName, data.description || null, recycleType, mixedMaterialId]
 );
 await this.replaceLocations(id, locations);

 return this.getMaterialById(id);
 }

 static async updateMaterial(id: string, data: { material_name?: string; description?: string; recycle_type?: 'reuse' | 'no_reuse'; mixed_material_id?: string | null; locations?: string[] }) {
 const existing = await this.getMaterialById(id);
 if (!existing) {
 throw new Error('Material not found');
 }

 const cleanName = data.material_name !== undefined ? data.material_name.trim() : existing.material_name;
 const description = data.description !== undefined ? data.description : existing.description;

 let recycleType = data.recycle_type !== undefined ? data.recycle_type : existing.recycle_type;
 if (data.recycle_type === undefined && data.description !== undefined) {
 const desc = (description || '').toLowerCase();
 recycleType = desc.includes('no reuse') ? 'no_reuse' : 'reuse';
 }

 if (data.material_name && cleanName !== existing.material_name) {
 const [dup] = await pool.query<RowDataPacket[]>(
 'SELECT id FROM master_materials WHERE material_name = ? AND id != ?',
 [cleanName, id]
 );
 if (dup.length > 0) {
 throw new Error(`Nama material "${cleanName}" sudah terdaftar.`);
 }

 if (data.material_name && cleanName !== existing.material_name) {
 await this.assertNotMixedName(cleanName);
 }
 }

 // mixed_material_id tidak dikirim = mapping campuran tidak diubah; null / '' = lepas dari campuran
 let mixedMaterialId: string | null = existing.mixed_material_id || null;
 if (data.mixed_material_id !== undefined) {
 mixedMaterialId = data.mixed_material_id || null;
 if (mixedMaterialId) await this.assertMixedExists(mixedMaterialId);
 }

 const locations = data.locations !== undefined
 ? await this.normalizeLocations(data.locations)
 : (existing.locations || []);
 if (data.locations !== undefined) await this.assertLocationsRemovable(id, locations);
 if (mixedMaterialId) await this.assertMixedCoversLocations(mixedMaterialId, locations);

 await pool.query(
 'UPDATE master_materials SET material_name = ?, description = ?, recycle_type = ?, mixed_material_id = ? WHERE id = ?',
 [cleanName, description, recycleType, mixedMaterialId, id]
 );
 if (data.locations !== undefined) await this.replaceLocations(id, locations);

 return this.getMaterialById(id);
 }

 static async deleteMaterial(id: string) {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM master_materials WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Material not found');
    }

    return { id };
  }

  static async deleteAllMaterials() {
    const connection = await pool.getConnection();
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      const [result] = await connection.query<ResultSetHeader>('DELETE FROM master_materials');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      return { deletedCount: result.affectedRows };
    } finally {
      connection.release();
    }
  }

  /**
   * Fetches all master parts utilizing this specific material ID
   */
  static async getMaterialParts(id: string, location: string = '') {
 const material = await this.getMaterialById(id);
 if (!material) {
 throw new Error('Material tidak ditemukan.');
 }

 const params: any[] = [id];
 let locationFilter = '';
 if (location && location.trim() !== '') {
 locationFilter = `AND EXISTS (SELECT 1 FROM master_part_factories mpf
 JOIN factories pf ON pf.id = mpf.factory_id
 WHERE mpf.master_part_id = mp.id AND pf.location = ?)`;
 params.push(location.trim());
 }

 const [parts] = await pool.query<RowDataPacket[]>(
 `SELECT
 mp.id,
 mp.part_number,
 mp.part_name,
 mp.sebango_code,
 mp.berat_part_gr,
 mp.berat_runner_gr,
 mp.jenis_part,
 mp.customer,
 mp.is_active,
 mmd.model_code,
 mmd.description AS model_description,
 mc.code AS machine_code,
 mc.name AS machine_name,
 fc.name AS factory_name,
 fc.location AS factory_location
 FROM master_parts mp
 LEFT JOIN master_models mmd ON mp.model_id = mmd.id
 LEFT JOIN machines mc ON mp.machine_id = mc.id
 LEFT JOIN factories fc ON mc.factory_id = fc.id
 WHERE mp.material_id = ? ${locationFilter}
 ORDER BY mp.part_name ASC`,
 params
 );

 return {
 material,
 parts,
 totalParts: parts.length,
 };
 }
}
