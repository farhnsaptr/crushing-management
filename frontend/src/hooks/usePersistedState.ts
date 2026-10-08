import { useCallback, useState } from 'react';

const read = <T,>(key: string | null, initial: T): T => {
  if (!key) return initial;
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? initial : (JSON.parse(raw) as T);
  } catch {
    return initial; // localStorage bisa tidak tersedia (mode privat / data situs diblokir)
  }
};

/**
 * State yang tersimpan di localStorage browser. `key = null` -> tidak disimpan (mis. user belum dimuat).
 * Nilai tersimpan TIDAK divalidasi di sini; validasi terhadap daftar pilihan aktif dilakukan pemakainya.
 */
export function usePersistedState<T>(key: string | null, initial: T): [T, (value: T) => void] {
  const [state, setState] = useState<{ key: string | null; value: T }>(() => ({ key, value: read(key, initial) }));

  // Key berubah (mis. ganti akun) -> baca ulang dari storage tanpa effect
  const value = state.key === key ? state.value : read(key, initial);

  const setValue = useCallback(
    (next: T) => {
      setState({ key, value: next });
      if (!key) return;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // abaikan: preferensi hanya berlaku selama sesi
      }
    },
    [key]
  );

  return [value, setValue];
}
