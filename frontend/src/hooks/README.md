# Common Hooks (`src/hooks`)

Folder ini berisi kumpulan custom React hooks yang bersifat reusable dan dapat digunakan lintas fitur di aplikasi frontend.

## Daftar Hooks

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
