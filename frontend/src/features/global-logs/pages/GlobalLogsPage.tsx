import React from 'react';
import { useGlobalLogs } from '../hooks/useGlobalLogs';
import { LogTable } from '../components/LogTable';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Pagination } from '../../../components/common/Pagination';
import { RotateCcw, Trash2, Radio, User, Globe, Hash } from 'lucide-react';

export const GlobalLogsPage: React.FC = () => {
  const {
    logs,
    totalFilteredItems,
    totalRawItems,
    newlyAddedIds,
    usernameFilter,
    setUsernameFilter,
    endpointFilter,
    setEndpointFilter,
    statusCodeFilter,
    setStatusCodeFilter,
    methodFilter,
    setMethodFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    isLoading,
    isSseConnected,
    handleResetFilters,
    handleClearAllLogs,
  } = useGlobalLogs();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Advanced Filter Bar Card */}
      <Card
        title="Filter & Pencarian Audit Logs"
        subtitle="Filter data log berdasarkan Username, Path Endpoint, HTTP Method, atau Status Code"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Grid Inputs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* Username Search */}
            <Input
              label="Username"
              placeholder="Cari username..."
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
              leftIcon={<User size={16} />}
            />

            {/* Endpoint Path Search */}
            <Input
              label="Endpoint Path"
              placeholder="misal /api/users..."
              value={endpointFilter}
              onChange={(e) => setEndpointFilter(e.target.value)}
              leftIcon={<Globe size={16} />}
            />

            {/* HTTP Method Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                HTTP Method
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              >
                <option value="ALL">Semua Method</option>
                <option value="GET">GET Only</option>
                <option value="POST">POST Only</option>
                <option value="PUT">PUT Only</option>
                <option value="DELETE">DELETE Only</option>
              </select>
            </div>

            {/* Status Code Search */}
            <Input
              label="Status Code"
              placeholder="misal 200, 401, 500..."
              value={statusCodeFilter}
              onChange={(e) => setStatusCodeFilter(e.target.value)}
              leftIcon={<Hash size={16} />}
            />
          </div>

          {/* Action Row: Reset Filter, Purge Logs & SSE Live Badge */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                leftIcon={<RotateCcw size={15} />}
              >
                Reset Filter
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllLogs}
                leftIcon={<Trash2 size={15} />}
                style={{ color: '#ef4444' }}
              >
                Hapus Seluruh Log
              </Button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Badge variant={isSseConnected ? 'success' : 'warning'} size="md">
                <Radio size={14} style={{ animation: isSseConnected ? 'spin 3s linear infinite' : 'none' }} />
                {isSseConnected ? 'SSE Real-Time Stream Active' : 'Connecting Stream...'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Audit Logs Table Card with Numeric Pagination */}
      <Card
        title="Audit Trail Redis Streams — Real-Time Log Viewer"
        subtitle={`Menampilkan ${logs.length} baris di halaman ini (Total ${totalFilteredItems} terfilter dari ${totalRawItems} log)`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <LogTable logs={logs} isLoading={isLoading} newlyAddedIds={newlyAddedIds} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            totalItems={totalFilteredItems}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>
      </Card>
    </div>
  );
};
