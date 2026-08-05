import React from 'react';
import type { AuditLogItem } from '../types/globalLogs.types';
import { Table, type Column } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';

interface LogTableProps {
  logs: AuditLogItem[];
  isLoading: boolean;
  newlyAddedIds: Set<string>;
}

export const LogTable: React.FC<LogTableProps> = ({ logs, isLoading, newlyAddedIds }) => {
  const getMethodBadgeVariant = (method: string = 'GET') => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'info';
      case 'POST':
        return 'success';
      case 'PUT':
        return 'warning';
      case 'DELETE':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getStatusBadgeVariant = (status: number = 200) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'danger';
    return 'neutral';
  };

  const columns: Column<AuditLogItem>[] = [
    {
      header: 'Method',
      accessorKey: 'metode',
      cell: (log) => (
        <Badge variant={getMethodBadgeVariant(log.metode || 'GET')} size="sm">
          {(log.metode || 'GET').toUpperCase()}
        </Badge>
      ),
      width: '90px',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (log) => (
        <Badge variant={getStatusBadgeVariant(log.status || 200)} size="sm">
          {log.status || 200}
        </Badge>
      ),
      width: '80px',
    },
    {
      header: 'API Endpoint Path',
      accessorKey: 'endpoint',
      cell: (log) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)' }}>
          {log.endpoint || '-'}
        </span>
      ),
    },
    {
      header: 'User (Role)',
      cell: (log) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.user || 'guest'}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {(log.role || 'none').toUpperCase()}
          </span>
        </div>
      ),
      width: '140px',
    },
    {
      header: 'IP Address',
      accessorKey: 'ip_address',
      cell: (log) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          {log.ip_address || '-'}
        </span>
      ),
      width: '130px',
    },
    {
      header: 'Durasi',
      accessorKey: 'durasi_ms',
      cell: (log) => (
        <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
          {log.durasi_ms !== undefined ? `${log.durasi_ms} ms` : '-'}
        </span>
      ),
      width: '90px',
    },
    {
      header: 'Waktu',
      accessorKey: 'waktu',
      cell: (log) => {
        let dateStr = '-';
        if (log.waktu) {
          try {
            dateStr = new Date(log.waktu).toLocaleString('id-ID');
          } catch {
            dateStr = log.waktu;
          }
        }
        return <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dateStr}</span>;
      },
      width: '170px',
    },
  ];

  return (
    <Table
      columns={columns}
      data={logs}
      isLoading={isLoading}
      emptyMessage="Belum ada audit log tercatat di Redis Streams."
      keyExtractor={(row) => row.id || Math.random().toString()}
      rowClassName={(row) => (newlyAddedIds.has(row.id) ? 'new-log-highlight' : '')}
    />
  );
};
