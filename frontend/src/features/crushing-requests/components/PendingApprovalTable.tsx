import React from 'react';
import type { CrushingRequest } from '../types/crushingRequests.types';
import type { Department } from '../../departments/types/departments.types';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Input } from '../../../components/common/Input';
import {
  Clock,
  CheckCircle2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  Scale,
  RefreshCw,
} from 'lucide-react';

interface PendingApprovalTableProps {
  requests: CrushingRequest[];
  departments: Department[];
  statusFilter: 'pending' | 'approved' | 'all';
  onStatusFilterChange: (status: 'pending' | 'approved' | 'all') => void;
  selectedDeptId: string;
  onSelectDeptId: (deptId: string) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  totalRecords: number;
  isLoading: boolean;
  onViewDetail: (req: CrushingRequest) => void;
  isActionLoading: boolean;
  onRefresh: () => void;
}

export const PendingApprovalTable: React.FC<PendingApprovalTableProps> = ({
  requests,
  departments,
  statusFilter,
  onStatusFilterChange,
  selectedDeptId,
  onSelectDeptId,
  searchQuery,
  onSearchQueryChange,
  page,
  onPageChange,
  limit,
  totalRecords,
  isLoading,
  onViewDetail,
  isActionLoading,
  onRefresh,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success" size="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} />
              <span>Disetujui</span>
            </div>
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="warning" size="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={13} />
              <span>Menunggu Verifikasi</span>
            </div>
          </Badge>
        );
    }
  };

  const totalPages = Math.ceil(totalRecords / limit) || 1;
  const startNumber = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const endNumber = Math.min(page * limit, totalRecords);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Control & Filter Card */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Status Tabs Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              paddingBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'pending', label: 'Menunggu Verifikasi Fisik' },
                { id: 'approved', label: 'Sudah Disetujui & Divalidasi' },
                { id: 'all', label: 'Semua Pengiriman' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    onStatusFilterChange(tab.id as any);
                    onPageChange(1);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1.5px solid',
                    borderColor: statusFilter === tab.id ? 'var(--secondary-color, #e76114)' : 'var(--border-color, #cbd5e1)',
                    backgroundColor: statusFilter === tab.id ? 'var(--secondary-color, #e76114)' : 'transparent',
                    color: statusFilter === tab.id ? '#ffffff' : 'var(--text-muted, #64748b)',
                    fontWeight: statusFilter === tab.id ? 800 : 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              isLoading={isLoading}
              leftIcon={<RefreshCw size={14} />}
            >
              Refresh
            </Button>
          </div>

          {/* Search & Department Filters */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 280px' }}>
              <Input
                placeholder="Cari nomor pengiriman, pengirim, atau departemen..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchQueryChange(e.target.value);
                  onPageChange(1);
                }}
                leftIcon={<Search size={16} />}
              />
            </div>

            <div style={{ flex: '0 1 240px' }}>
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  onSelectDeptId(e.target.value);
                  onPageChange(1);
                }}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  color: 'var(--text-main, #0f172a)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="">Semua Departemen Asal</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table Card */}
      <Card>
        {isLoading && requests.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
            Memuat daftar pengiriman...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
            <Clock size={40} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main, #0f172a)' }}>
              Tidak ada pengiriman yang ditemukan
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {statusFilter === 'pending'
                ? 'Semua pengiriman masuk telah diverifikasi dan disetujui!'
                : 'Coba ubah kata kunci pencarian atau filter departemen di atas.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '2px solid var(--border-color, #e2e8f0)',
                      textAlign: 'left',
                      color: 'var(--text-muted, #475569)',
                      backgroundColor: 'var(--bg-main, #f8fafc)',
                    }}
                  >
                    <th style={{ padding: '0.75rem 0.85rem', width: '50px' }}>No</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>No. Pengiriman</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>Tanggal & Shift</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>Pengirim / Asal</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>Item Part</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>Total Berat</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'center', width: '160px' }}>Aksi</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, idx) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid var(--border-color, #e2e8f0)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-main, #f8fafc)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-muted, #64748b)' }}>
                        {startNumber + idx}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary-color, #008d51)' }}>
                          {r.request_number}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748b)' }}>
                          {r.request_type === 'part_ng' ? 'Part NG' : r.request_type === 'runner_ng' ? 'Runner NG' : 'Campuran'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                          {r.request_date}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                          Shift {r.shift}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                          {r.sender_name || 'Pengirim'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Building2 size={12} />
                          <span>{r.department_name} ({r.factory_code || r.factory_name})</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                        <Badge variant="secondary" size="sm">
                          {r.item_count || (r.items?.length || 0)} Item {r.total_pcs > 0 ? `(${r.total_pcs} pcs)` : ''}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Scale size={14} />
                          <span>{Number(r.total_weight_kg || 0).toFixed(2)} kg</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          {r.status === 'pending' ? (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => onViewDetail(r)}
                              disabled={isActionLoading}
                              style={{
                                padding: '0.35rem 0.85rem',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                backgroundColor: 'var(--primary-color, #008d51)',
                                borderColor: 'var(--primary-color, #008d51)',
                              }}
                            >
                              Verifikasi
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => onViewDetail(r)}
                              leftIcon={<Eye size={14} />}
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            >
                              Rincian
                            </Button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                        {getStatusBadge(r.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.85rem',
                borderTop: '1px solid var(--border-color, #e2e8f0)',
                paddingTop: '0.85rem',
                fontSize: '0.825rem',
              }}
            >
              <div style={{ color: 'var(--text-muted, #64748b)' }}>
                Menampilkan <strong>{startNumber} - {endNumber}</strong> dari <strong>{totalRecords}</strong> data
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onPageChange(Math.max(page - 1, 1))}
                  disabled={page <= 1 || isLoading}
                  leftIcon={<ChevronLeft size={15} />}
                >
                  Prev
                </Button>
                <span style={{ fontWeight: 800, padding: '0 0.35rem' }}>
                  {page} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                  disabled={page >= totalPages || isLoading}
                  rightIcon={<ChevronRight size={15} />}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
