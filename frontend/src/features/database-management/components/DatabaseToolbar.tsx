import React, { useState, useEffect, useRef } from 'react';
import { Search, RotateCcw, FileText, PackageX, Layers, X } from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';

interface DatabaseToolbarProps {
  activeTab: 'requests' | 'ng_transactions' | 'runner_transactions';
  onTabChange: (tab: 'requests' | 'ng_transactions' | 'runner_transactions') => void;
  search: string;
  onSearchChange: (search: string) => void;
  status?: string;
  onStatusChange?: (status: any) => void;
  shift?: string;
  onShiftChange: (shift: string) => void;
  startDate?: string;
  onStartDateChange: (date: string) => void;
  endDate?: string;
  onEndDateChange: (date: string) => void;
  departmentId?: string;
  onDepartmentChange: (deptId: string) => void;
  factoryId?: string;
  onFactoryChange?: (factId: string) => void;
  departments: Array<{ id: string; name: string }>;
  factories?: Array<{ id: string; name: string }>;
  onRefresh: () => void;
  isLoading: boolean;
}

export const DatabaseToolbar: React.FC<DatabaseToolbarProps> = ({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  status,
  onStatusChange,
  shift,
  onShiftChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  departmentId,
  onDepartmentChange,
  factoryId,
  onFactoryChange,
  departments,
  factories,
  onRefresh,
  isLoading,
}) => {
  const [localSearch, setLocalSearch] = useState<string>(search);
  const debouncedSearch = useDebounce(localSearch, 300);
  const isFirstRender = useRef(true);

  // Sync debounced search value to parent
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onSearchChange(debouncedSearch);
  }, [debouncedSearch]);

  // Sync if parent search is reset
  useEffect(() => {
    if (search === '' && localSearch !== '') {
      setLocalSearch('');
    }
  }, [search]);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      {/* Top row: Tab Switcher & Refresh button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onTabChange('requests')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: activeTab === 'requests' ? '1.5px solid var(--secondary-color, #e76114)' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'requests' ? '#fff7ed' : '#ffffff',
              color: activeTab === 'requests' ? 'var(--secondary-color, #e76114)' : '#475569',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <FileText size={16} />
            <span>Request Pengiriman (Tiket)</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('ng_transactions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: activeTab === 'ng_transactions' ? '1.5px solid var(--secondary-color, #e76114)' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'ng_transactions' ? '#fff7ed' : '#ffffff',
              color: activeTab === 'ng_transactions' ? 'var(--secondary-color, #e76114)' : '#475569',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <PackageX size={16} />
            <span>Transaksi Part NG</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('runner_transactions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: activeTab === 'runner_transactions' ? '1.5px solid var(--secondary-color, #e76114)' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'runner_transactions' ? '#fff7ed' : '#ffffff',
              color: activeTab === 'runner_transactions' ? 'var(--secondary-color, #e76114)' : '#475569',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Layers size={16} />
            <span>Transaksi Runner Material</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.85rem',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#334155',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          <RotateCcw size={14} className={isLoading ? 'spin' : ''} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Filter Row: Search & Dropdowns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.6rem',
          alignItems: 'center',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', gridColumn: 'span 2' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder={
              activeTab === 'requests'
                ? 'Cari no tiket (misal REQ-20261015-3906), part, atau pengirim...'
                : 'Cari nama part, nomor part, atau catatan...'
            }
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 2rem 0.5rem 2.2rem',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.82rem',
              outline: 'none',
              backgroundColor: '#f8fafc',
            }}
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '2px',
              }}
              title="Hapus kata kunci"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status filter (only for requests) */}
        {activeTab === 'requests' && onStatusChange && (
          <select
            value={status || 'all'}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.82rem',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: 600,
            }}
          >
            <option value="all">Semua Status</option>
            <option value="pending">⏳ Pending (Menunggu Verifikasi)</option>
            <option value="approved">✅ Approved (Sudah Disetujui)</option>
          </select>
        )}

        {/* Shift Filter */}
        <select
          value={shift || ''}
          onChange={(e) => onShiftChange(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '10px',
            border: '1.5px solid #cbd5e1',
            fontSize: '0.82rem',
            backgroundColor: '#ffffff',
            color: '#334155',
            fontWeight: 600,
          }}
        >
          <option value="">Semua Shift</option>
          <option value="Pagi">Shift Pagi</option>
          <option value="Malam">Shift Malam</option>
        </select>

        {/* Department Filter */}
        <select
          value={departmentId || ''}
          onChange={(e) => onDepartmentChange(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '10px',
            border: '1.5px solid #cbd5e1',
            fontSize: '0.82rem',
            backgroundColor: '#ffffff',
            color: '#334155',
            fontWeight: 600,
          }}
        >
          <option value="">Semua Departemen</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* Factory Filter (if requests tab) */}
        {activeTab === 'requests' && factories && onFactoryChange && (
          <select
            value={factoryId || ''}
            onChange={(e) => onFactoryChange(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.82rem',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: 600,
            }}
          >
            <option value="">Semua Pabrik</option>
            {factories.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        )}

        {/* Date Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <input
            type="date"
            value={startDate || ''}
            onChange={(e) => onStartDateChange(e.target.value)}
            title="Tanggal Awal"
            style={{
              width: '100%',
              padding: '0.45rem 0.5rem',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.8rem',
              backgroundColor: '#ffffff',
              color: '#334155',
            }}
          />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>s/d</span>
          <input
            type="date"
            value={endDate || ''}
            onChange={(e) => onEndDateChange(e.target.value)}
            title="Tanggal Akhir"
            style={{
              width: '100%',
              padding: '0.45rem 0.5rem',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.8rem',
              backgroundColor: '#ffffff',
              color: '#334155',
            }}
          />
        </div>
      </div>
    </div>
  );
};
