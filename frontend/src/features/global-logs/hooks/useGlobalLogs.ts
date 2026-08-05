import { useState, useEffect } from 'react';
import { GlobalLogsService } from '../services/globalLogs.service';
import type { AuditLogItem } from '../types/globalLogs.types';

export const useGlobalLogs = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await GlobalLogsService.getLogs(100);
      setLogs(data.logs || []);
    } catch (err) {
      console.warn('Failed to fetch global audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const filteredLogs = logs.filter((log) => {
    const matchesMethod = methodFilter === 'ALL' || (log.metode && log.metode.toUpperCase() === methodFilter);
    const matchesSearch =
      (log.endpoint && log.endpoint.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.user && log.user.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesMethod && matchesSearch;
  });

  return {
    logs: filteredLogs,
    rawCount: logs.length,
    searchQuery,
    setSearchQuery,
    methodFilter,
    setMethodFilter,
    isLoading,
    autoRefresh,
    setAutoRefresh,
    fetchLogs,
  };
};
