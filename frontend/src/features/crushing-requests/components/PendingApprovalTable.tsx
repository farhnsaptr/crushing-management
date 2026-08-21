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
  XCircle,
  Eye,
  Check,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  Network,
  Scale,
  RefreshCw,
} from 'lucide-react';

interface PendingApprovalTableProps {
  requests: CrushingRequest[];
  departments: Department[];
  statusFilter: 'pending' | 'approved' | 'rejected' | 'all';
  onStatusFilterChange: (status: 'pending' | 'approved' | 'rejected' | 'all') => void;
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
  onQuickApprove: (id: string) => void;
  onQuickReject: (req: CrushingRequest) => void;
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
  onQuickApprove,
  onQuickReject,
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
      case 'rejected':
        return (
          <Badge variant="danger" size="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <XCircle size={13} />
              <span>Ditolak</span>
            </div>
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="warning" size="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={13} />
              <span>Menunggu Validasi</span>
            </div>
          </Badge>
        );
    }
  };

  const totalPages = Math.ceil(totalRecords / limit) || 1;
  const startNumber = (page - 1) * limit + 1;
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
                { id: 'pending', label: 'Menunggu Verifikasi (Pending)' },
                { id: 'approved', label: 'Sudah Disetujui (Approved)' },
                { id: 'rejected', label: 'Ditolak (Rejected)' },
                { id: 'all', label: 'Semua Tiket' },
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
              variant="outline"
              size="sm"
              onClick={onRefresh}
              isLoading={isLoading}
              leftIcon={<RefreshCw size={14} />}
            >
              Refresh
            </Button>
          </div>

          {/* Department Filter & Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }}>
              <Input
                placeholder="Cari no. tiket, nama pengirim, departemen..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchQueryChange(e.target.value);
                  onPageChange(1);
                }}
                leftIcon={<Search size={16} />}
              />
            </div>

            <div style={{ width: '240px' }}>
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  onSelectDeptId(e.target.value);
                  onPageChange(1);
                }}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  color: 'var(--text-main, #0f172a)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="">-- Filter Semua Departemen --</option>
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

      {/* Requests Table Card */}
      <Card
        title={
          statusFilter === 'pending'
            ? 'Tiket Pengiriman Menunggu Verifikasi Operator'
            : statusFilter === 'approved'
            ? 'Daftar Tiket Telah Disetujui'
            : statusFilter === 'rejected'
            ? 'Daftar Tiket Ditolak'
            : 'Seluruh Riwayat Tiket Pengiriman'
        }
        subtitle={`Ditemukan ${totalRecords} data tiket pengiriman`}
      >
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
            Memuat data tiket pengiriman...
          </div>
        ) : requests.length === 0 ? (
          <div
            style={{
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              color: 'var(--text-muted, #64748b)',
              backgroundColor: 'var(--bg-main, #f8fafc)',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px dashed var(--border-color, #cbd5e1)',
            }}
          >
            Tidak ada tiket pengiriman ditemukan untuk filter saat ini.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr
                    style={{
                      backgroundColor: 'var(--bg-main, #f1f5f9)',
                      textAlign: 'left',
                      color: 'var(--text-muted, #475569)',
                      borderBottom: '1px solid var(--border-color, #cbd5e1)',
                    }}
                  >
                    <th style={{ padding: '0.75rem 0.85rem' }}>No. Tiket</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>Pengirim</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>Departemen & Pabrik</th>
                    <th style={{ padding: '0.75rem 0.85rem' }}>Tanggal & Shift</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>Total Pcs</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>Total Berat</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>Aksi Validasi</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid var(--border-color, #e2e8f0)',
                        backgroundColor: r.status === 'pending' ? 'rgba(231, 97, 20, 0.02)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '0.75rem 0.85rem', fontWeight: 800, color: 'var(--primary-color, #008d51)' }}>
                        <div>
                          <code>{r.request_number}</code>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '0.15rem' }}>
                          {r.item_count || 1} item
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>{r.sender_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>@{r.sender_username}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                          <Network size={14} color="var(--primary-color, #008d51)" />
                          <span>{r.department_name || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                          <Building2 size={13} color="var(--secondary-color, #e76114)" />
                          <span>{r.factory_name || '-'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>{r.request_date}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Shift {r.shift}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 700 }}>
                        {r.total_pcs > 0 ? `${r.total_pcs} pcs` : '-'}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                          <Scale size={14} />
                          <span>{Number(r.total_weight_kg || 0).toFixed(2)} kg</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                        {getStatusBadge(r.status)}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onViewDetail(r)}
                            leftIcon={<Eye size={14} />}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.775rem' }}
                          >
                            Rincian
                          </Button>

                          {r.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => onQuickApprove(r.id)}
                                disabled={isActionLoading}
                                title="Setujui Tiket"
                                leftIcon={<Check size={14} />}
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.775rem' }}
                              >
                                Setujui
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => onQuickReject(r)}
                                disabled={isActionLoading}
                                title="Tolak Tiket"
                                leftIcon={<X size={14} />}
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.775rem' }}
                              >
                                Tolak
                              </Button>
                            </>
                          )}
                        </div>
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
