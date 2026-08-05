import React from 'react';
import { useGlobalLogs } from '../hooks/useGlobalLogs';
import { LogTable } from '../components/LogTable';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Search, RefreshCw, Activity, Filter } from 'lucide-react';

export const GlobalLogsPage: React.FC = () => {
  const {
    logs,
    rawCount,
    searchQuery,
    setSearchQuery,
    methodFilter,
    setMethodFilter,
    isLoading,
    autoRefresh,
    setAutoRefresh,
    fetchLogs,
  } = useGlobalLogs();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Filter & Control Bar */}
      <Card>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Search Input */}
          <div style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }}>
            <Input
              placeholder="Cari URL, IP address, atau User ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>

          {/* HTTP Method Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} style={{ color: 'var(--text-muted)' }} />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.875rem',
                fontSize: '0.9rem',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
              }}
            >
              <option value="ALL">Semua Method HTTP</option>
              <option value="GET">GET Only</option>
              <option value="POST">POST Only</option>
              <option value="PUT">PUT Only</option>
              <option value="DELETE">DELETE Only</option>
            </select>
          </div>

          {/* Refresh Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button
              variant={autoRefresh ? 'secondary' : 'outline'}
              size="md"
              onClick={() => setAutoRefresh((prev) => !prev)}
              leftIcon={<Activity size={18} />}
            >
              {autoRefresh ? 'Auto Live (5s)' : 'Enable Live Stream'}
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={fetchLogs}
              isLoading={isLoading}
              leftIcon={<RefreshCw size={16} />}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card
        title="Audit Trail Redis Streams Log Viewer"
        subtitle={`Menampilkan ${logs.length} dari ${rawCount} log aktivitas API terbaru`}
      >
        <LogTable logs={logs} isLoading={isLoading} />
      </Card>
    </div>
  );
};
