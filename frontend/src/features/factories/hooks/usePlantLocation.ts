import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { usePersistedState } from '../../../hooks/usePersistedState';
import { FactoriesService } from '../services/factories.service';

/**
 * Lokasi plant aktif user (Dashboard & Verifikasi berbagi pilihan yang sama).
 * Daftar lokasi dari backend; pilihan terakhir disimpan di browser per user dan
 * dibuang bila sudah tidak ada di daftar. Default: lokasi pertama dari backend.
 */
export function usePlantLocation() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [stored, setStored] = usePersistedState<string | null>(user ? `pref:${user.id}:plant_location` : null, null);

  useEffect(() => {
    FactoriesService.getLocations()
      .then(setLocations)
      .catch((err) => console.error('Failed to load plant locations:', err))
      .finally(() => setIsLoaded(true));
  }, []);

  const location = stored && locations.includes(stored) ? stored : (locations[0] ?? '');

  return { locations, location, setLocation: setStored, isLoaded };
}
