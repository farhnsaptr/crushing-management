import React from 'react';
import { Edit2, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import type { DirectRunnerTransactionItem, DatabasePagination } from '../types/databaseManagement.types';

interface RunnerTransactionsTableProps {
  transactions: DirectRunnerTransactionItem[];
  pagination: DatabasePagination;
  onPageChange: (newPage: number) => void;
  onEdit: (item: DirectRunnerTransactionItem) => void;
  onDelete: (item: DirectRunnerTransactionItem) => void;
  isLoading: boolean;
}

export const RunnerTransactionsTable: React.FC<RunnerTransactionsTableProps> = ({
  transactions,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
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
        Memuat data transaksi Runner...
      </div>
    );
  }

  if (transactions.length === 0) {
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
        <strong style={{ color: '#1e293b', fontSize: '0.95rem' }}>Tidak ada transaksi Runner Material</strong>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Sesuaikan kata kunci pencarian atau rentang tanggal.
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
              <th style={{ padding: '0.85rem 1rem' }}>Tanggal & Shift</th>
              <th style={{ padding: '0.85rem 1rem' }}>Nama Material</th>
              <th style={{ padding: '0.85rem 1rem' }}>Departemen & Pabrik</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Berat Runner</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Total Pcs</th>
              <th style={{ padding: '0.85rem 1rem' }}>Batch / Tiket</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, idx) => (
              <tr
                key={t.id}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 1 ? '#f8fafc' : '#ffffff')}
              >
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, color: '#0f172a' }}>
                      <Calendar size={13} color="#64748b" />
                      <span>{t.transaction_date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <Clock size={12} />
                      <span>Shift {t.shift}</span>
                    </div>
                  </div>
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>{t.material_name_snapshot}</strong>
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{t.department_name || '-'}</span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {t.factory_name} {t.factory_location ? `(${t.factory_location})` : ''}
                    </span>
                  </div>
                </td>

                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                    {Number(t.total_runner_weight_kg).toFixed(2)} kg
                  </strong>
                </td>

                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#64748b', fontWeight: 700 }}>
                  {t.total_pcs || 0} pcs
                </td>

                <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: '#475569' }}>
                  {t.request_number && (
                    <div style={{ fontWeight: 700, color: 'var(--secondary-color, #e76114)', marginBottom: '0.15rem' }}>
                      {t.request_number}
                    </div>
                  )}
                  <span>{t.import_batch_ref || '-'}</span>
                </td>

                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => onEdit(t)}
                      title="Edit transaksi runner"
                      style={{
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(t)}
                      title="Hapus transaksi runner"
                      style={{
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #fecaca',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
          Menampilkan {transactions.length} dari total {pagination.total} transaksi
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
