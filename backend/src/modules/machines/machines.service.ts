import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class MachinesService {
  static async listMachines() {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT m.id, m.factory_id, m.code, m.name, m.type, m.tonnage, m.status, m.created_at,
              f.code AS factory_code, f.name AS factory_name
       FROM machines m
       JOIN factories f ON m.factory_id = f.id
       ORDER BY f.code ASC, m.code ASC`
    );
    return rows;
  }

  static async getMachinesByFactory(factoryId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT m.id, m.factory_id, m.code, m.name, m.type, m.tonnage, m.status, m.created_at,
              f.code AS factory_code, f.name AS factory_name
       FROM machines m
       JOIN factories f ON m.factory_id = f.id
       WHERE m.factory_id = ? AND m.status = 'active'`,
      [factoryId]
    );
    return rows;
  }

  static async getMachineById(id: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT m.id, m.factory_id, m.code, m.name, m.type, m.tonnage, m.status, m.created_at,
              f.code AS factory_code, f.name AS factory_name
       FROM machines m
       JOIN factories f ON m.factory_id = f.id
       WHERE m.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async createMachine(data: {
    factory_id: string;
    code: string;
    name: string;
    type?: string;
    tonnage?: string;
    status?: 'active' | 'inactive';
  }) {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO machines (id, factory_id, code, name, type, tonnage, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.factory_id,
        data.code,
        data.name,
        data.type || 'Injection Mold',
        data.tonnage || null,
        data.status || 'active',
      ]
    );

    return this.getMachineById(id);
  }

  static async updateMachine(
    id: string,
    data: {
      factory_id?: string;
      code?: string;
      name?: string;
      type?: string;
      tonnage?: string;
      status?: 'active' | 'inactive';
    }
  ) {
    const existing = await this.getMachineById(id);
    if (!existing) {
      throw new Error('Machine not found');
    }

    const factory_id = data.factory_id || existing.factory_id;
    const code = data.code || existing.code;
    const name = data.name || existing.name;
    const type = data.type !== undefined ? data.type : existing.type;
    const tonnage = data.tonnage !== undefined ? data.tonnage : existing.tonnage;
    const status = data.status || existing.status;

    await pool.query(
      `UPDATE machines SET factory_id = ?, code = ?, name = ?, type = ?, tonnage = ?, status = ?
       WHERE id = ?`,
      [factory_id, code, name, type, tonnage, status, id]
    );

    return this.getMachineById(id);
  }

  static async deleteMachine(id: string) {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM machines WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Machine not found');
    }

    return { id };
  }
}
