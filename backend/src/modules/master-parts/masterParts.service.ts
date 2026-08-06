import { randomUUID } from 'crypto';
import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import XLSX from 'xlsx';

export interface ParsedPartRow {
  rowIndex: number;
  sebango_code: string;
  location: string;
  machine_code: string;
  customer: string;
  model_code: string;
  part_number: string;
  part_name: string;
  jenis_part: string;
  material: string;
  shikake: number;
  qty_day: number;
  prod_lot: number;
  qty_kbn: number;
  berat_part_gr: number;
  berat_runner_gr: number;
  std_qty_ng: number;
  allowance_kg: number;
  isValid: boolean;
  skipReason?: string;
}

export class MasterPartsService {
  static async searchParts(query: string) {
    const searchTerm = `%${query}%`;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT mp.part_number, mp.part_name, mp.jenis_part, mp.material
       FROM master_parts mp
       WHERE (mp.part_number LIKE ? OR mp.part_name LIKE ?) AND mp.is_active = TRUE
       LIMIT 20`,
      [searchTerm, searchTerm]
    );
    return rows;
  }

  static async getModelsForPartNumber(partNumber: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT mp.id AS master_part_id, mp.part_number, mp.part_name, mp.berat_part_gr, mp.image_url,
              m.id AS model_id, m.model_code, mc.name AS machine_name, f.name AS factory_name
       FROM master_parts mp
       JOIN master_models m ON mp.model_id = m.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories f ON mc.factory_id = f.id
       WHERE mp.part_number = ? AND mp.is_active = TRUE`,
      [partNumber]
    );
    return rows;
  }

  static async getByQrCode(qrCodeValue: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT mp.id AS master_part_id, mp.part_number, mp.part_name, mp.jenis_part, mp.material,
              mp.berat_part_gr, mp.image_url, mp.qr_code_value,
              m.id AS model_id, m.model_code, mc.name AS machine_name, f.name AS factory_name
       FROM master_parts mp
       JOIN master_models m ON mp.model_id = m.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories f ON mc.factory_id = f.id
       WHERE mp.qr_code_value = ? AND mp.is_active = TRUE
       LIMIT 1`,
      [qrCodeValue]
    );
    return rows[0] || null;
  }

  static async getPartsByJenis(jenisPart: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT mp.id AS master_part_id, mp.part_number, mp.part_name, mp.jenis_part, mp.material,
              mp.berat_part_gr, mp.image_url, mp.qr_code_value,
              m.model_code, mc.name AS machine_name, f.name AS factory_name
       FROM master_parts mp
       JOIN master_models m ON mp.model_id = m.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories f ON mc.factory_id = f.id
       WHERE mp.jenis_part = ? AND mp.is_active = TRUE`,
      [jenisPart]
    );
    return rows;
  }

  static async listAllParts(page: number = 1, limit: number = 20, search: string = '', jenis: string = '') {
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE mp.is_active = TRUE';
    const params: any[] = [];

    if (search && search.trim() !== '') {
      whereClause += ' AND (mp.part_number LIKE ? OR mp.part_name LIKE ? OR mp.sebango_code LIKE ? OR mp.customer LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (jenis && jenis.trim() !== '' && jenis !== 'all') {
      whereClause += ' AND mp.jenis_part = ?';
      params.push(jenis.trim());
    }

    const countQuery = `SELECT COUNT(*) AS total FROM master_parts mp ${whereClause}`;
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params);
    const total = countRows[0].total;

    const dataQuery = `
      SELECT mp.*, m.model_code, mc.name AS machine_name, mc.code AS machine_code, f.name AS factory_name, f.code AS factory_code
      FROM master_parts mp
      JOIN master_models m ON mp.model_id = m.id
      JOIN machines mc ON mp.machine_id = mc.id
      JOIN factories f ON mc.factory_id = f.id
      ${whereClause}
      ORDER BY mp.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query<RowDataPacket[]> (dataQuery, [...params, limit, offset]);

    const formattedRows = rows.map((r) => ({
      ...r,
      shikake: Number(r.shikake),
      qty_day: Number(r.qty_day),
      prod_lot: Number(r.prod_lot),
      qty_kbn: Number(r.qty_kbn),
      berat_part_gr: Number(r.berat_part_gr),
      berat_runner_gr: Number(r.berat_runner_gr),
      std_qty_ng: Number(r.std_qty_ng),
      allowance_kg: Number(r.allowance_kg),
    }));

    return {
      parts: formattedRows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async createPart(data: {
    sebango_code: string;
    machine_id: string;
    customer: string;
    model_id: string;
    part_number: string;
    part_name: string;
    jenis_part: string;
    material: string;
    shikake?: number;
    qty_day?: number;
    prod_lot?: number;
    qty_kbn?: number;
    berat_part_gr: number;
    berat_runner_gr?: number;
    image_url?: string;
    qr_code_value?: string;
  }) {
    const id = randomUUID();

    const shikakeVal = Number(data.shikake) || 1;
    const beratPartVal = Number(data.berat_part_gr) || 0;
    const stdQtyNg = shikakeVal * 2;
    const allowanceKg = Number(((stdQtyNg * beratPartVal) / 1000).toFixed(3));

    await pool.query(
      `INSERT INTO master_parts
       (id, sebango_code, machine_id, customer, model_id, part_number, part_name, jenis_part, material, shikake, qty_day, prod_lot, qty_kbn, berat_part_gr, berat_runner_gr, std_qty_ng, allowance_kg, image_url, qr_code_value)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.sebango_code,
        data.machine_id,
        data.customer || '-',
        data.model_id,
        data.part_number || '-',
        data.part_name || '-',
        data.jenis_part || '-',
        data.material || '-',
        shikakeVal,
        Number(data.qty_day) || 0,
        Number(data.prod_lot) || 0,
        Number(data.qty_kbn) || 0,
        beratPartVal,
        Number(data.berat_runner_gr) || 0,
        stdQtyNg,
        allowanceKg,
        data.image_url ?? null,
        data.qr_code_value ?? null,
      ]
    );

    return { id, ...data, std_qty_ng: stdQtyNg, allowance_kg: allowanceKg };
  }

  static async updatePart(
    id: string,
    data: {
      sebango_code?: string;
      machine_id?: string;
      customer?: string;
      model_id?: string;
      part_number?: string;
      part_name?: string;
      jenis_part?: string;
      material?: string;
      shikake?: number;
      qty_day?: number;
      prod_lot?: number;
      qty_kbn?: number;
      berat_part_gr?: number;
      berat_runner_gr?: number;
      image_url?: string;
      qr_code_value?: string;
    }
  ) {
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM master_parts WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      throw new Error('Master Part not found');
    }

    const current = existing[0];
    const shikakeVal = data.shikake !== undefined ? Number(data.shikake) : current.shikake;
    const beratPartVal = data.berat_part_gr !== undefined ? Number(data.berat_part_gr) : current.berat_part_gr;

    const stdQtyNg = shikakeVal * 2;
    const allowanceKg = Number(((stdQtyNg * beratPartVal) / 1000).toFixed(3));

    await pool.query(
      `UPDATE master_parts SET
        sebango_code = ?, machine_id = ?, customer = ?, model_id = ?, part_number = ?,
        part_name = ?, jenis_part = ?, material = ?, shikake = ?, qty_day = ?,
        prod_lot = ?, qty_kbn = ?, berat_part_gr = ?, berat_runner_gr = ?,
        std_qty_ng = ?, allowance_kg = ?, image_url = ?, qr_code_value = ?
       WHERE id = ?`,
      [
        data.sebango_code ?? current.sebango_code,
        data.machine_id ?? current.machine_id,
        data.customer ?? current.customer,
        data.model_id ?? current.model_id,
        data.part_number ?? current.part_number,
        data.part_name ?? current.part_name,
        data.jenis_part ?? current.jenis_part,
        data.material ?? current.material,
        shikakeVal,
        data.qty_day !== undefined ? Number(data.qty_day) : current.qty_day,
        data.prod_lot !== undefined ? Number(data.prod_lot) : current.prod_lot,
        data.qty_kbn !== undefined ? Number(data.qty_kbn) : current.qty_kbn,
        beratPartVal,
        data.berat_runner_gr !== undefined ? Number(data.berat_runner_gr) : current.berat_runner_gr,
        stdQtyNg,
        allowanceKg,
        data.image_url !== undefined ? data.image_url : current.image_url,
        data.qr_code_value !== undefined ? data.qr_code_value : current.qr_code_value,
        id,
      ]
    );

    return { id, ...data, std_qty_ng: stdQtyNg, allowance_kg: allowanceKg };
  }

  static async deletePart(id: string) {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM master_parts WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Master Part not found');
    }

    return { id };
  }

  static async deleteAllParts() {
    const connection = await pool.getConnection();
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      const [result] = await connection.query<ResultSetHeader>('DELETE FROM master_parts');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      return { deletedCount: result.affectedRows };
    } finally {
      connection.release();
    }
  }

  // Parse Excel File & Return Data Preview
  static async previewImportParts(fileBuffer: Buffer) {
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    } catch (err) {
      throw new Error(
        'Sistem tidak dapat membaca file Excel. Harap pastikan file tidak corrupt dan berformat .xlsx / .xls.'
      );
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('File Excel tidak memiliki lembar kerja (worksheet).');
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      throw new Error('File Excel kosong atau tidak memiliki data.');
    }

    // Inspect headers of first non-empty row or header row
    const firstRow = rawRows[0];
    const headerKeys = Object.keys(firstRow).map((k) => k.replace(/[\r\n]+/g, ' ').trim().toUpperCase());

    // Header Diagnostic Check
    const requiredHeaderMap: Record<string, string[]> = {
      SEBANGO: ['SEBANGO', 'SEBANGO CODE', 'KODE SEBANGO'],
      LOCATION: ['LOCATION', 'LOKASI', 'PABRIK', 'FACTORY'],
      MC: ['MC', 'MESIN', 'MACHINE', 'MACHINE CODE'],
      CUSTOMER: ['CUSTOMER'],
      MODEL: ['MODEL', 'MODEL CODE'],
      'PART NUMBER': ['PART NUMBER', 'PART NO', 'PART_NUMBER'],
      'PART NAME': ['PART NAME', 'PART_NAME'],
      'JENIS PART': ['JENIS PART (BUMPER, GRILLE, DLL)', 'JENIS PART', 'JENIS_PART', 'JENIS'],
      MATERIAL: ['MATERIAL'],
      SHIKAKE: ['SHIKAKE'],
      'BERAT PART': ['BERAT (GR)', 'BERAT PART', 'BERAT_PART', 'BERAT PART (GR)'],
    };

    const missingHeaders: string[] = [];

    for (const [standardName, aliases] of Object.entries(requiredHeaderMap)) {
      const found = headerKeys.some((hk) => aliases.some((alias) => hk.includes(alias)));
      if (!found) {
        missingHeaders.push(standardName);
      }
    }

    if (missingHeaders.length > 0) {
      throw new Error(
        `Sistem tidak dapat membaca file Excel. Kolom berikut tidak ditemukan atau formatnya salah: [${missingHeaders.join(
          ', '
        )}]. Harap periksa ulang header file Excel Anda sesuai template.`
      );
    }

    // Filter out header sub-row (e.g. Row 1 where BERAT (gr) is 'Part' and __EMPTY is 'Runner')
    const dataRows = rawRows.filter((r) => {
      const bVal = String(r['BERAT (gr)'] || r['BERAT PART'] || '').trim().toLowerCase();
      return bVal !== 'part';
    });

    const previewRows: ParsedPartRow[] = [];
    let validCount = 0;
    let skippedCount = 0;

    dataRows.forEach((row, index) => {
      // Find values using alias matching
      const getVal = (aliases: string[]) => {
        for (const key of Object.keys(row)) {
          const cleanKey = key.replace(/[\r\n]+/g, ' ').trim().toUpperCase();
          if (aliases.some((alias) => cleanKey === alias || cleanKey.includes(alias))) {
            return String(row[key]).trim();
          }
        }
        return '';
      };

      const sebango_code = getVal(['SEBANGO', 'SEBANGO CODE', 'KODE SEBANGO']);
      const location = getVal(['LOCATION', 'LOKASI', 'FACTORY']);
      const rawMachine = getVal(['MC', 'MESIN', 'MACHINE']);
      const parsedMc = parseMachineFromExcel(rawMachine);
      const machine_code = parsedMc.code;
      const customer = getVal(['CUSTOMER']);
      const model_code = getVal(['MODEL', 'MODEL CODE']);
      const part_number = getVal(['PART NUMBER', 'PART NO']);
      const part_name = getVal(['PART NAME']);
      const jenis_part = getVal(['JENIS PART (BUMPER, GRILLE, DLL)', 'JENIS PART', 'JENIS']);
      const material = getVal(['MATERIAL']);

      const shikakeStr = getVal(['SHIKAKE']);
      const qtyDayStr = getVal(['QTY/DAY', 'QTY/ DAY', 'QTY_DAY']);
      const prodLotStr = getVal(['PROD/LOT', 'PROD/ LOT', 'PROD_LOT']);
      const qtyKbnStr = getVal(['QTY/KBN', 'QTY/ KBN', 'QTY_KBN']);
      const beratPartStr = getVal(['BERAT (GR)', 'BERAT PART', 'BERAT']);
      const beratRunnerStr = getVal(['__EMPTY', 'BERAT RUNNER', 'RUNNER']);

      // Parsing numeric fields with default 0
      const shikake = parseInt(shikakeStr, 10) || (shikakeStr === '' ? 1 : 0);
      const qty_day = parseFloat(qtyDayStr) || 0;
      const prod_lot = parseInt(prodLotStr, 10) || 0;
      const qty_kbn = parseInt(qtyKbnStr, 10) || 0;
      const berat_part_gr = parseFloat(beratPartStr) || 0;
      const berat_runner_gr = parseFloat(beratRunnerStr) || 0;

      // Calculate Formulas
      const std_qty_ng = (shikake || 1) * 2;
      const allowance_kg = Number(((std_qty_ng * berat_part_gr) / 1000).toFixed(3));

      // Rule: Missing Sebango Code -> SKIP ROW
      let isValid = true;
      let skipReason: string | undefined = undefined;

      if (!sebango_code || sebango_code === '') {
        isValid = false;
        skipReason = 'Sebango Code Kosong';
        skippedCount++;
      } else {
        validCount++;
      }

      previewRows.push({
        rowIndex: index + 2, // Excel row 2+
        sebango_code: sebango_code || '-',
        location: location || 'FACTORY 2',
        machine_code: machine_code || 'MC-01',
        customer: customer || '-',
        model_code: model_code || '-',
        part_number: part_number || '-',
        part_name: part_name || '-',
        jenis_part: jenis_part || '-',
        material: material || '-',
        shikake,
        qty_day,
        prod_lot,
        qty_kbn,
        berat_part_gr,
        berat_runner_gr,
        std_qty_ng,
        allowance_kg,
        isValid,
        skipReason,
      });
    });

    return {
      summary: {
        totalRows: dataRows.length,
        validCount,
        skippedCount,
      },
      previewRows,
    };
  }

  // Commit Parsed Rows to Database
  static async commitImportParts(rows: ParsedPartRow[]) {
    const validRows = rows.filter((r) => r.isValid && r.sebango_code && r.sebango_code !== '-');

    if (validRows.length === 0) {
      throw new Error('Tidak ada baris data valid yang dapat disimpan.');
    }

    // Cache factories, machines, and models for fast lookup
    const [factories] = await pool.query<RowDataPacket[]>('SELECT id, code, name FROM factories');
    const [machines] = await pool.query<RowDataPacket[]>('SELECT id, code, name, factory_id FROM machines');
    const [models] = await pool.query<RowDataPacket[]>('SELECT id, model_code FROM master_models');

    const factoryMap = new Map<string, string>();
    factories.forEach((f) => {
      factoryMap.set(f.code.toUpperCase(), f.id);
      factoryMap.set(f.name.toUpperCase(), f.id);
    });

    const machineMap = new Map<string, string>();
    machines.forEach((m) => {
      machineMap.set(m.code.toUpperCase(), m.id);
      machineMap.set(m.name.toUpperCase(), m.id);
    });

    const modelMap = new Map<string, string>();
    models.forEach((m) => {
      modelMap.set(m.model_code.toUpperCase(), m.id);
    });

    // Default Factory (FACTORY 2 or first)
    const defaultFactoryId = factories[0]?.id;
    const defaultMachineId = machines[0]?.id;

    let insertedCount = 0;

    for (const row of validRows) {
      // 1. Resolve or Create Model
      let modelId = modelMap.get(row.model_code.toUpperCase());
      if (!modelId) {
        modelId = randomUUID();
        await pool.query('INSERT INTO master_models (id, model_code) VALUES (?, ?)', [
          modelId,
          row.model_code,
        ]);
        modelMap.set(row.model_code.toUpperCase(), modelId);
      }

      // 2. Resolve or Create Machine
      const parsedMc = parseMachineFromExcel(row.machine_code);
      let machineId = machineMap.get(parsedMc.code.toUpperCase()) || machineMap.get(row.machine_code.toUpperCase());

      if (!machineId) {
        // Resolve factory ID
        let factoryId = factoryMap.get(row.location.toUpperCase()) || defaultFactoryId;
        machineId = randomUUID();
        await pool.query(
          'INSERT INTO machines (id, factory_id, code, name, type, tonnage) VALUES (?, ?, ?, ?, ?, ?)',
          [machineId, factoryId, parsedMc.code, parsedMc.name, 'Injection Mold', parsedMc.tonnage]
        );
        machineMap.set(parsedMc.code.toUpperCase(), machineId);
        machineMap.set(row.machine_code.toUpperCase(), machineId);
      }

      // 3. Upsert Master Part
      const partId = randomUUID();
      await pool.query(
        `INSERT INTO master_parts
         (id, sebango_code, machine_id, customer, model_id, part_number, part_name, jenis_part, material, shikake, qty_day, prod_lot, qty_kbn, berat_part_gr, berat_runner_gr, std_qty_ng, allowance_kg)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           machine_id = VALUES(machine_id),
           customer = VALUES(customer),
           model_id = VALUES(model_id),
           part_number = VALUES(part_number),
           part_name = VALUES(part_name),
           jenis_part = VALUES(jenis_part),
           material = VALUES(material),
           shikake = VALUES(shikake),
           qty_day = VALUES(qty_day),
           prod_lot = VALUES(prod_lot),
           qty_kbn = VALUES(qty_kbn),
           berat_part_gr = VALUES(berat_part_gr),
           berat_runner_gr = VALUES(berat_runner_gr),
           std_qty_ng = VALUES(std_qty_ng),
           allowance_kg = VALUES(allowance_kg)`,
        [
          partId,
          row.sebango_code,
          machineId,
          row.customer || '-',
          modelId,
          row.part_number || '-',
          row.part_name || '-',
          row.jenis_part || '-',
          row.material || '-',
          row.shikake || 1,
          row.qty_day || 0,
          row.prod_lot || 0,
          row.qty_kbn || 0,
          row.berat_part_gr || 0,
          row.berat_runner_gr || 0,
          row.std_qty_ng,
          row.allowance_kg,
        ]
      );
      insertedCount++;
    }

    return { insertedCount };
  }

  // Generate Sample Excel Template (.xlsx)
  static generateTemplateBuffer(): Buffer {
    const data = [
      [
        'SEBANGO',
        'LOCATION',
        'MC',
        'CUSTOMER',
        'MODEL',
        'PART NUMBER',
        'PART NAME',
        'JENIS PART (BUMPER, GRILLE, DLL)',
        'MATERIAL',
        'SHIKAKE',
        'QTY/DAY',
        'PROD/LOT',
        'QTY/KBN',
        'BERAT PART (gr)',
        'BERAT RUNNER (gr)',
      ],
      [
        'U0-5604-BLCK',
        'FACTORY 2',
        '#2 3500T',
        'ADM',
        'D74A',
        '62631/2-BZ030',
        'BOARD, QUARTER TRIM, RR RH/LH',
        'QUARTER TRIM',
        'PP2 EXXON AP03-202B',
        2,
        275.76,
        186,
        6,
        2296,
        24,
      ],
      [
        'U0-5600-BLCK',
        'FACTORY 2',
        '#2 3500T',
        'ADM',
        'D74A',
        '67613/4-BZ050/80',
        'BOARD, RR DOOR TRIM, RH/LH',
        'DOOR TRIM',
        'PP2 EXXON AP03-202B',
        2,
        275.86,
        192,
        8,
        2070,
        0,
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'MasterPartsTemplate');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Export Master Parts Data to Excel (.xlsx)
  static async generateExportBuffer(): Promise<Buffer> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT mp.sebango_code, f.name AS location, mc.name AS mc, mp.customer, m.model_code AS model,
              mp.part_number, mp.part_name, mp.jenis_part, mp.material, mp.shikake, mp.qty_day,
              mp.prod_lot, mp.qty_kbn, mp.berat_part_gr, mp.berat_runner_gr, mp.std_qty_ng, mp.allowance_kg
       FROM master_parts mp
       JOIN master_models m ON mp.model_id = m.id
       JOIN machines mc ON mp.machine_id = mc.id
       JOIN factories f ON mc.factory_id = f.id
       WHERE mp.is_active = TRUE
       ORDER BY mp.created_at DESC`
    );

    const exportData = rows.map((r) => ({
      SEBANGO: r.sebango_code,
      LOCATION: r.location,
      MC: r.mc,
      CUSTOMER: r.customer,
      MODEL: r.model,
      'PART NUMBER': r.part_number,
      'PART NAME': r.part_name,
      'JENIS PART': r.jenis_part,
      MATERIAL: r.material,
      SHIKAKE: r.shikake,
      'QTY/DAY': r.qty_day,
      'PROD/LOT': r.prod_lot,
      'QTY/KBN': r.qty_kbn,
      'BERAT PART (gr)': r.berat_part_gr,
      'BERAT RUNNER (gr)': r.berat_runner_gr,
      'STD QTY NG': r.std_qty_ng,
      'ALLOWANCE (kg)': r.allowance_kg,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'MasterPartsData');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

export function parseMachineFromExcel(rawMc: string) {
  const clean = (rawMc || '').trim();
  if (!clean) {
    return { code: 'MC-01', name: 'MC-01', tonnage: '' };
  }

  // Regex matches "#2 3500T", "#B2 3500T", "# 2 3500T", "#10 850T", "MC-02 3500T", "MC 2 3500T", "2 3500T"
  const match = clean.match(/^(?:#|MC-?|MC\s+)?\s*([A-Za-z]*)(\d+)\s*(.*)$/i);
  if (match) {
    const prefix = match[1] ? match[1].toUpperCase() : '';
    const num = parseInt(match[2], 10);
    const paddedNum = String(num).padStart(2, '0');
    const code = prefix ? `MC-${prefix}${paddedNum}` : `MC-${paddedNum}`;
    const tonnage = match[3] ? match[3].trim() : '';
    const name = clean.startsWith('#') ? clean : tonnage ? `${code} (${tonnage})` : code;
    return { code, name, tonnage };
  }

  return { code: clean.toUpperCase(), name: clean, tonnage: '' };
}
