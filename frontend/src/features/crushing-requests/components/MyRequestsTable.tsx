import React from 'react';
import type { CrushingRequest } from '../types/crushingRequests.types';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Eye, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Scale } from 'lucide-react';

interface MyRequestsTableProps {
  requests: CrushingRequest[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  isLoading: boolean;
  onViewDetail: (req: CrushingRequest) => void;
}

export const MyRequestsTable: React.FC<MyRequestsTableProps> = ({
  requests,
  total,
  page,
  limit,
  onPageChange,
  statusFilter,
  onStatusFilterChange,
  isLoading,
  onViewDetail,
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

  const totalPages = Math.ceil(total / limit) || 1;
  const startNumber = (page - 1) * limit + 1;
  const endNumber = Math.min(page * limit, total);

  return (
    <Card>
      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          paddingBottom: '0.85rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'pending', label: 'Menunggu Verifikasi' },
            { id: 'approved', label: 'Disetujui' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onStatusFilterChange(tab.id);
                onPageChange(1);
              }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid',
                borderColor: statusFilter === tab.id ? 'var(--secondary-color, #e76114)' : 'var(--border-color, #cbd5e1)',
                backgroundColor: statusFilter === tab.id ? 'var(--secondary-color, #e76114)' : 'transparent',
                color: statusFilter === tab.id ? '#ffffff' : 'var(--text-muted, #64748b)',
                fontWeight: statusFilter === tab.id ? 800 : 600,
                fontSize: '0.825rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted, #64748b)' }}>
          Total <strong>{total}</strong> Pengiriman
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
          Memuat riwayat pengiriman...
        </div>
      ) : requests.length === 0 ? (
        <div
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted, #64748b)',
            backgroundColor: 'var(--bg-main, #f8fafc)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px dashed var(--border-color, #cbd5e1)',
          }}
        >
          Belum ada riwayat pengiriman untuk filter ini.
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
                  <th style={{ padding: '0.65rem 0.85rem' }}>No. Pengiriman</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Tanggal & Shift</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Pabrik & Dept</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Total Pcs</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Total Berat</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: 'var(--primary-color, #008d51)' }}>
                      <code>{r.request_number}</code>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>{r.request_date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Shift {r.shift}</div>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem' }}>
                      <div>{r.factory_name || '-'}</div>
                      <div style={{ color: 'var(--text-muted, #64748b)' }}>{r.department_name || '-'}</div>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700 }}>
                      {r.total_pcs > 0 ? `${r.total_pcs} pcs` : '-'}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                        <Scale size={14} />
                        <span>{Number(r.total_weight_kg || 0).toFixed(2)} kg</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                      {getStatusBadge(r.status)}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onViewDetail(r)}
                        leftIcon={<Eye size={14} />}
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem' }}
                      >
                        Detail
                      </Button>
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
              Menampilkan <strong>{startNumber} - {endNumber}</strong> dari <strong>{total}</strong> data
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
  );
};
