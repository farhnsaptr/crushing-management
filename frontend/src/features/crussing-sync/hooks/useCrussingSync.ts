import { useCallback, useEffect, useState } from 'react';
import { extractErrorMessage } from '../../../services/api.client';
import { CrussingSyncService } from '../services/crussingSync.service';
import type { CrussingSyncResult, CrussingSyncStatus } from '../types/crussingSync.types';

interface UseCrussingSyncOptions {
 location: string;
 year: number;
 month?: number;
 enabled?: boolean;
}

export function useCrussingSync({
 location,
 year,
 month,
 enabled = true,
}: UseCrussingSyncOptions) {
 const [status, setStatus] = useState<CrussingSyncStatus | null>(null);
 const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);
 const [isSyncing, setIsSyncing] = useState<boolean>(false);
 const [error, setError] = useState<string | null>(null);

 const refreshStatus = useCallback(async () => {
 if (!enabled || !location) {
 setStatus(null);
 return;
 }

 setIsLoadingStatus(true);
 try {
 const data = await CrussingSyncService.getStatus({ location, year, month });
 setStatus(data);
 } catch (err) {
 console.error('Failed to load Crusing sync status:', err);
 } finally {
 setIsLoadingStatus(false);
 }
 }, [enabled, location, year, month]);

 useEffect(() => {
 // eslint-disable-next-line react-hooks/set-state-in-effect
 refreshStatus();
 }, [refreshStatus]);

 const sync = useCallback(async (): Promise<CrussingSyncResult | null> => {
 if (!enabled || !location) return null;

 setIsSyncing(true);
 setError(null);
 try {
 const result = await CrussingSyncService.sync({ location, year, month });
 await refreshStatus();
 return result;
 } catch (err) {
 console.error('Failed to sync Crusing API:', err);
 setError(extractErrorMessage(err, 'Gagal sinkronisasi data Crusing API.'));
 await refreshStatus();
 return null;
 } finally {
 setIsSyncing(false);
 }
 }, [enabled, location, year, month, refreshStatus]);

 return {
 status,
 isLoadingStatus,
 isSyncing,
 error,
 sync,
 refreshStatus,
 };
}
