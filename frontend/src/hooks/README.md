# Common Hooks (`src/hooks`)

Folder ini berisi kumpulan custom React hooks yang bersifat reusable dan dapat digunakan lintas fitur di aplikasi frontend.

## Daftar Hooks

### `useIsNarrow<T>(maxWidth: number): [ref, boolean]`
Mengembalikan `ref` untuk dipasang ke elemen dan `true` saat lebar **elemen tsb** ≤ `maxWidth` (via `ResizeObserver`). Dipakai untuk layout responsif yang bergantung pada ruang konten sebenarnya (sidebar terbuka/tertutup), bukan lebar layar — misal rincian pengiriman berubah jadi bottom bar + sheet di form pengirim.

### `useDebounce<T>(value: T, delayMs?: number): T`
Hook utilitas untuk menunda pembaruan nilai (`value`) selama durasi tertentu (`delayMs`, default `400ms`). Sangat ideal untuk:
- Mengurangi pemanggilan API berlebih saat user mengetik pada input pencarian (search debounce).
- Mengurangi overhead filtering data berukuran besar.

#### Contoh Penggunaan:
```tsx
import { useState, useEffect } from 'react';
import { useDebounce } from '../../../hooks';

export function useExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    // Dipanggil hanya ketika user selesai mengetik (setelah jeda 400ms)
    fetchData({ search: debouncedSearch });
  }, [debouncedSearch]);

  return { searchQuery, setSearchQuery };
}
```
