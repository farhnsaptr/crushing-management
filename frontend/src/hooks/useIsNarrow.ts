import { useEffect, useRef, useState } from 'react';

/**
 * true saat lebar ELEMEN (bukan layar) ≤ maxWidth. Pakai ini alih-alih media query
 * karena lebar konten bergantung pada sidebar (terbuka/tertutup), bukan hanya ukuran layar.
 */
export function useIsNarrow<T extends HTMLElement>(maxWidth: number) {
  const ref = useRef<T>(null);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setIsNarrow(entry.contentRect.width <= maxWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, [maxWidth]);

  return [ref, isNarrow] as const;
}
