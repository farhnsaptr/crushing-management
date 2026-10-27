const COMBINED_RE =
  /^(?<pre>[A-Z0-9]+)-(?<num>[A-Z0-9]+(?:\/[A-Z0-9]+)+)-(?<suf>.+)$/;

export type SebangoStrategy = 'exact' | 'expanded' | 'none';

export interface SebangoResolution {
  raw: unknown;
  normalized: string;
  strategy: SebangoStrategy;
  matched: string[];
  missing: string[];
  ambiguous: string[];
}

// Minimal 2 separator, mis. "I4-D7901-BLCK" / "U0-6136/38-NH696".
const SEBANGO_LIKE_RE = /^[A-Z0-9]+(?:[/-][A-Z0-9]+){2,}$/;

export function normalizeSebango(raw: unknown): string {
  const value = String(raw ?? '').toUpperCase().replace(/\s+/g, '');
  const paren = /^(.+)\(([^)]+)\)$/.exec(value);

  if (!paren) return value;

  const [, outside, inside] = paren;

  // Anomali: SEBANGO sebenarnya ditulis di dalam kurung, mis.
  // "FR T BRAND(I4-D7901-BLCK)". Ambil isi kurung hanya jika teks di luarnya
  // bukan kode SEBANGO, supaya anotasi seperti "U0-...-NH696(RESIN)" tetap dibuang.
  if (SEBANGO_LIKE_RE.test(inside) && !SEBANGO_LIKE_RE.test(outside)) {
    return inside;
  }

  return outside; // buang anotasi akhir, mis. "(RESIN)"
}

export function expandSebango(sebango: string): string[] {
  const m = COMBINED_RE.exec(sebango);
  if (!m?.groups) return [sebango]; // bukan gabungan

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
 * Cocok persis dulu; baru perluas. Duplikat di master dilaporkan ambiguous.
 */
export function resolveSebango(
  raw: unknown,
  masterMap: Map<string, unknown[]>
): SebangoResolution {
  const normalized = normalizeSebango(raw);
  const exactRows = masterMap.get(normalized);

  if (exactRows) {
    return {
      raw,
      normalized,
      strategy: 'exact',
      matched: exactRows.length === 1 ? [normalized] : [],
      missing: [],
      ambiguous: exactRows.length > 1 ? [normalized] : [],
    };
  }

  const expanded = expandSebango(normalized);
  const matched: string[] = [];
  const missing: string[] = [];
  const ambiguous: string[] = [];

  for (const s of expanded) {
    const rows = masterMap.get(s);
    if (!rows) missing.push(s);
    else if (rows.length > 1) ambiguous.push(s);
    else matched.push(s);
  }

  const strategy: SebangoStrategy =
    expanded.length === 1 && expanded[0] === normalized ? 'none' : 'expanded';

  return { raw, normalized, strategy, matched, missing, ambiguous };
}

export function buildSebangoMasterMap<T>(
  rows: T[],
  getSebango: (row: T) => unknown
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const key = normalizeSebango(getSebango(row));
    if (!key) continue;
    const existing = map.get(key);
    if (existing) existing.push(row);
    else map.set(key, [row]);
  }
  return map;
}
