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

  static async list(search: string = '') {
    const params: any[] = [];
    let where = '';
    if (search.trim()) {
      where = 'WHERE xm.mixed_name LIKE ? OR xm.description LIKE ?';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT xm.id, xm.mixed_name, xm.description, xm.recycle_type, xm.created_at, xm.updated_at,
              COUNT(mm.id) AS members_count
       FROM mixed_materials xm
       LEFT JOIN master_materials mm ON mm.mixed_material_id = xm.id
       ${where}
       GROUP BY xm.id
       ORDER BY xm.mixed_name ASC`,
      params
    );
    return rows.map((r): any => ({ ...r, members_count: Number(r.members_count || 0) }));
  }

  static async getById(id: string) {
    const rows = await this.list();
    return rows.find((r) => r.id === id) || null;
  }

  static async create(data: { mixed_name: string; description?: string; recycle_type?: RecycleType }) {
    const name = (data.mixed_name || '').trim();
    if (!name) throw new Error('Nama material campuran wajib diisi.');
    if (data.recycle_type !== 'reuse' && data.recycle_type !== 'no_reuse') {
      throw new Error('Jenis recycle (reuse / no_reuse) wajib dipilih.');
    }
    await this.assertUniqueName(name);
    const id = randomUUID();
    await pool.query(
      'INSERT INTO mixed_materials (id, mixed_name, description, recycle_type) VALUES (?, ?, ?, ?)',
      [id, name, data.description?.trim() || null, data.recycle_type]
    );
    return this.getById(id);
  }

  static async update(id: string, data: { mixed_name?: string; description?: string; recycle_type?: RecycleType }) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Material campuran tidak ditemukan.');

    const name = data.mixed_name !== undefined ? data.mixed_name.trim() : existing.mixed_name;
    if (!name) throw new Error('Nama material campuran wajib diisi.');
    if (name !== existing.mixed_name) await this.assertUniqueName(name, id);

    const recycleType = data.recycle_type || existing.recycle_type;
    if (recycleType !== 'reuse' && recycleType !== 'no_reuse') throw new Error('Jenis recycle tidak valid.');
    const description = data.description !== undefined ? data.description.trim() || null : existing.description;

    await pool.query(
      'UPDATE mixed_materials SET mixed_name = ?, description = ?, recycle_type = ? WHERE id = ?',
      [name, description, recycleType, id]
    );
    return this.getById(id);
  }

  /** Menghapus campuran melepas semua anggotanya (FK ON DELETE SET NULL); transaksi lama tetap atas nama campuran. */
  static async remove(id: string) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Material campuran tidak ditemukan.');
    await pool.query('DELETE FROM mixed_materials WHERE id = ?', [id]);
    return { id };
  }

  /** Anggota (material asli) beserta jumlah part yang memakainya. */
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
