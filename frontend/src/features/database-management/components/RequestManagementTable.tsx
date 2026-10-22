import React from 'react';
import { Eye, Undo2, Trash2, Calendar, Clock, Building2, User, CheckCircle2, AlertCircle } from 'lucide-react';
import type { DatabaseRequestHeader, DatabasePagination } from '../types/databaseManagement.types';

interface RequestManagementTableProps {
  requests: DatabaseRequestHeader[];
  pagination: DatabasePagination;
  onPageChange: (newPage: number) => void;
  onOpenDetail: (id: string) => void;
  onOpenUnapprove: (request: DatabaseRequestHeader) => void;
  onOpenDelete: (request: DatabaseRequestHeader) => void;
  isLoading: boolean;
}

export const RequestManagementTable: React.FC<RequestManagementTableProps> = ({
  requests,
  pagination,
  onPageChange,
  onOpenDetail,
  onOpenUnapprove,
  onOpenDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '3rem 1rem',
          textAlign: 'center',
          color: '#64748b',
          fontWeight: 600,
          border: '1.5px solid #e2e8f0',
        }}
      >
        Memuat data tiket pengiriman...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '3.5rem 1rem',
          textAlign: 'center',
          color: '#64748b',
          border: '1.5px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
          }}
        >
          <AlertCircle size={22} />
        </div>
        <strong style={{ color: '#1e293b', fontSize: '0.95rem' }}>Tidak ada tiket yang ditemukan</strong>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Coba ubah kata kunci pencarian atau sesuaikan filter tanggal dan departemen.
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--primary-color, #0f172a)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              <th style={{ padding: '0.85rem 1rem' }}>No. Tiket & Waktu</th>
              <th style={{ padding: '0.85rem 1rem' }}>Departemen & Lokasi</th>
              <th style={{ padding: '0.85rem 1rem' }}>Pengirim / Validator</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Total Fisik</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'center', minWidth: '180px' }}>Aksi Kelola</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r, idx) => {
              const isApproved = r.status === 'approved';

              return (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 1 ? '#f8fafc' : '#ffffff')}
                >
                  {/* Tiket & Waktu */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <strong
                        onClick={() => onOpenDetail(r.id)}
                        style={{
                          color: 'var(--secondary-color, #e76114)',
                          fontSize: '0.9rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {r.request_number}
                      </strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem' }}>
                        <Calendar size={12} />
                        <span>{r.request_date}</span>
                        <span>•</span>
                        <Clock size={12} />
                        <span style={{ fontWeight: 700, color: '#334155' }}>Shift {r.shift}</span>
                      </div>
                    </div>
                  </td>

                  {/* Dept & Lokasi */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontWeight: 800, color: '#1e293b' }}>
                        {r.department_name || 'Departemen N/A'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.75rem' }}>
                        <Building2 size={12} />
                        <span>{r.factory_name || 'Pabrik N/A'}</span>
                        {r.factory_location && (
                          <span style={{ backgroundColor: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                            {r.factory_location}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Pengirim & Validator */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
                        <User size={12} style={{ color: '#94a3b8' }} />
                        <span style={{ fontWeight: 700, color: '#334155' }}>{r.sender_name || r.sender_username}</span>
                      </div>
                      {isApproved && r.validator_name && (
                        <div style={{ fontSize: '0.72rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={11} />
                          <span>Oleh: {r.validator_name}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Total Fisik */}
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                        {Number(r.total_weight_kg || 0).toFixed(2)} kg
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {r.total_pcs || 0} pcs ({r.items_count || 0} jenis part)
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: isApproved ? '#ecfdf5' : '#fffbeb',
                        color: isApproved ? '#059669' : '#d97706',
                        border: isApproved ? '1px solid #a7f3d0' : '1px solid #fde68a',
                      }}
                    >
                      {isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      {/* Detail / Kelola */}
                      <button
                        type="button"
                        onClick={() => onOpenDetail(r.id)}
                        title="Buka detail tiket untuk edit atau kelola part"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={13} />
                        <span>Kelola</span>
                      </button>

                      {/* Batalkan Approve (hanya jika approved) */}
                      {isApproved && (
                        <button
                          type="button"
                          onClick={() => onOpenUnapprove(r)}
                          title="Batalkan approval dan hapus transaksi terkait"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.35rem 0.6rem',
                            borderRadius: '8px',
                            border: '1px solid #fde68a',
                            backgroundColor: '#fffbeb',
                            color: '#d97706',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Undo2 size={13} />
                          <span>Hapus Approve</span>
                        </button>
                      )}

                      {/* Hapus Tiket */}
                      <button
                        type="button"
                        onClick={() => onOpenDelete(r)}
                        title="Hapus tiket pengiriman permanen"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.35rem 0.45rem',
                          borderRadius: '8px',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.8rem',
        }}
      >
        <div style={{ color: '#64748b', fontWeight: 600 }}>
          Menampilkan {requests.length} dari total {pagination.total} tiket
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: pagination.page <= 1 ? '#f1f5f9' : '#ffffff',
              color: pagination.page <= 1 ? '#94a3b8' : '#334155',
              cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
              fontWeight: 700,
            }}
          >
            Sebelumnya
          </button>
          <span style={{ fontWeight: 800, padding: '0 0.5rem', color: '#1e293b' }}>
            Halaman {pagination.page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: pagination.page >= pagination.totalPages ? '#f1f5f9' : '#ffffff',
              color: pagination.page >= pagination.totalPages ? '#94a3b8' : '#334155',
              cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 700,
            }}
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
};
