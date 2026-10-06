import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2';

export interface EffectiveMaterial {
  id: string | null; // id master_materials; null jika dicatat atas nama campuran (campuran tidak ada di master_materials)
  name: string;
  recycle_type: 'reuse' | 'no_reuse';
  is_mixed: boolean; // true jika material asli sedang dicampur
}

/**
 * Material efektif untuk transaksi BARU: jika material sedang dicampur (mixed_material_id terisi)
 * dipakai nama + jenis recycle campuran, jika tidak material itu sendiri.
 * Hasilnya dibekukan sebagai snapshot nama di tabel transaksi.
 */
export async function resolveEffectiveMaterial(
  materialId: string | null | undefined
): Promise<EffectiveMaterial | null> {
  if (!materialId) return null;
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT m.id, m.material_name, m.recycle_type, x.mixed_name, x.recycle_type AS mixed_recycle_type
     FROM master_materials m
     LEFT JOIN mixed_materials x ON x.id = m.mixed_material_id
     WHERE m.id = ?`,
    [materialId]
  );
  const r = rows[0];
  if (!r) return null;
  if (r.mixed_name) {
    return { id: null, name: r.mixed_name, recycle_type: r.mixed_recycle_type, is_mixed: true };
  }
  return { id: r.id, name: r.material_name, recycle_type: r.recycle_type, is_mixed: false };
}
