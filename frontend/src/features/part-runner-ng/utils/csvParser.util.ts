export interface ParsedCsvRow {
  date: string;
  sebango_code: string;
  shift: string;
  act_total_pcs: number;
}

/**
 * Parses raw CSV line strings taking quotes into account.
 */
function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim().replace(/^"|"$/g, ''));
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  values.push(currentValue.trim().replace(/^"|"$/g, ''));
  return values;
}

/**
 * Parses a production CSV file content and extracts DATE, SEBANGO, SHIFT, and ACT TOTAL columns.
 */
export function parseProductionCsv(csvText: string): ParsedCsvRow[] {
  if (!csvText || csvText.trim() === '') {
    return [];
  }

  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length < 2) {
    return [];
  }

  // Parse header row
  const headerValues = parseCsvLine(lines[0]).map((h) => h.toUpperCase().trim());

  // Find column indices
  const dateIdx = headerValues.findIndex((h) => h === 'DATE' || h === 'TANGGAL');
  const sebangoIdx = headerValues.findIndex((h) => h === 'SEBANGO' || h === 'KODE SEBANGO');
  const shiftIdx = headerValues.findIndex((h) => h === 'SHIFT');
  const actTotalIdx = headerValues.findIndex((h) => h === 'ACT TOTAL' || h === 'ACTUAL TOTAL' || h === 'TOTAL');

  if (sebangoIdx === -1 || actTotalIdx === -1) {
    throw new Error('Format CSV tidak valid. Pastikan header memiliki kolom "SEBANGO" dan "ACT TOTAL".');
  }

  const result: ParsedCsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row = parseCsvLine(line);

    const rawDate = dateIdx !== -1 ? row[dateIdx] || '' : '';
    const rawSebango = (row[sebangoIdx] || '').trim();
    const rawShift = shiftIdx !== -1 ? (row[shiftIdx] || '').trim() : '';
    const rawActTotal = actTotalIdx !== -1 ? parseInt(row[actTotalIdx]?.replace(/,/g, '') || '0', 10) : 0;

    if (!rawSebango || isNaN(rawActTotal) || rawActTotal <= 0) {
      continue;
    }

    result.push({
      date: rawDate,
      sebango_code: rawSebango,
      shift: rawShift,
      act_total_pcs: rawActTotal,
    });
  }

  return result;
}
