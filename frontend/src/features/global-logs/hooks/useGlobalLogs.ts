import { useState, useEffect } from 'react';
import { env } from '../../../config/env.config';
import { GlobalLogsService } from '../services/globalLogs.service';
import type { AuditLogItem } from '../types/globalLogs.types';

export const useGlobalLogs = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());

  // Individual Filters
  const [usernameFilter, setUsernameFilter] = useState<string>('');
  const [endpointFilter, setEndpointFilter] = useState<string>('');
  const [statusCodeFilter, setStatusCodeFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSseConnected, setIsSseConnected] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);

    const streamUrl = `${env.API_BASE_URL}/api/admin/logs/stream`;
    const eventSource = new EventSource(streamUrl, {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      setIsSseConnected(true);
      setIsLoading(false);
    };

    eventSource.addEventListener('initial_logs', (e: MessageEvent) => {
      try {
        const initialData: AuditLogItem[] = JSON.parse(e.data);
        setLogs(initialData || []);
      } catch (err) {
        console.warn('Failed to parse initial logs SSE event', err);
      } finally {
        setIsLoading(false);
      }
    });

    eventSource.addEventListener('new_log', (e: MessageEvent) => {
      try {
        const newLog: AuditLogItem = JSON.parse(e.data);

        setLogs((prevLogs) => {
          if (prevLogs.some((l) => l.id === newLog.id)) {
            return prevLogs;
          }
          return [newLog, ...prevLogs];
        });

        // Trigger 3-second green highlight animation
        if (newLog.id) {
          setNewlyAddedIds((prevSet) => new Set(prevSet).add(newLog.id));

          setTimeout(() => {
            setNewlyAddedIds((prevSet) => {
              const updated = new Set(prevSet);
              updated.delete(newLog.id);
              return updated;
            });
          }, 3000);
        }
      } catch (err) {
        console.warn('Failed to parse new_log SSE event', err);
      }
    });

    eventSource.addEventListener('logs_cleared', () => {
      setLogs([]);
      setNewlyAddedIds(new Set());
      setCurrentPage(1);
    });

    eventSource.onerror = () => {
      setIsSseConnected(false);
      setIsLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Filter Logic
  const filteredLogs = logs.filter((log) => {
    const matchesUsername =
      !usernameFilter.trim() ||
      (log.user && log.user.toLowerCase().includes(usernameFilter.toLowerCase()));

    const matchesEndpoint =
      !endpointFilter.trim() ||
      (log.endpoint && log.endpoint.toLowerCase().includes(endpointFilter.toLowerCase()));

    const matchesStatus =
      !statusCodeFilter.trim() ||
      (log.status !== undefined && String(log.status).includes(statusCodeFilter.trim()));

    const matchesMethod =
      methodFilter === 'ALL' || (log.metode && log.metode.toUpperCase() === methodFilter);

    return matchesUsername && matchesEndpoint && matchesStatus && matchesMethod;
  });

  // Calculate Pagination bounds
  const totalItems = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  const handleResetFilters = () => {
    setUsernameFilter('');
    setEndpointFilter('');
    setStatusCodeFilter('');
    setMethodFilter('ALL');
    setCurrentPage(1);
  };

  const handleClearAllLogs = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus seluruh audit log aktivitas di database? Data yang dihapus tidak dapat dikembalikan.')) {
      return;
    }

    try {
      await GlobalLogsService.clearAllLogs();
      setLogs([]);
      setNewlyAddedIds(new Set());
      setCurrentPage(1);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus audit logs.');
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return {
    logs: paginatedLogs,
    totalFilteredItems: totalItems,
    totalRawItems: logs.length,
    newlyAddedIds,
    usernameFilter,
    setUsernameFilter,
    endpointFilter,
    setEndpointFilter,
    statusCodeFilter,
    setStatusCodeFilter,
    methodFilter,
    setMethodFilter,
    currentPage: safeCurrentPage,
    setCurrentPage,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalPages,
    isLoading,
    isSseConnected,
    handleResetFilters,
    handleClearAllLogs,
  };
};
