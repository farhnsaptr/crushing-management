import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import type { RunnerMaterialAnalyticsDetailResponse } from '../types/runnerMaterial.types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Layers, Calendar, Scale, History, BarChart2, Edit2, Trash2 } from 'lucide-react';

interface RunnerMaterialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialDetail: RunnerMaterialAnalyticsDetailResponse | null;
  isLoading: boolean;
  onEditRecord?: (rec: any) => void;
  onDeleteRecord?: (id: string) => void;
  isAdminOrSuperAdmin?: boolean;
}

export const RunnerMaterialDetailModal: React.FC<RunnerMaterialDetailModalProps> = ({
  isOpen,
  onClose,
  materialDetail,
  isLoading,
  onEditRecord,
  onDeleteRecord,
  isAdminOrSuperAdmin = false,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleString('id-ID');
    } catch {
      return String(dateStr);
    }
  };

  const monthlyData = materialDetail?.monthlyTrend || [];
  const transactions = materialDetail?.transactions || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail & Analytics Runner Material: ${materialDetail?.materialName || 'Material'}`}
      size="lg"
    >
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
          Memuat grafik tren bulanan & riwayat transaksi material...
        </div>
      ) : !materialDetail ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
          Data analitik material tidak ditemukan.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top KPI Cards Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--bg-main, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'rgba(0, 141, 81, 0.1)',
                  color: 'var(--primary-color, #008d51)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                  Nama Material
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main, #0f172a)' }}>
                  {materialDetail.materialName}
                </h4>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'rgba(231, 97, 20, 0.08)',
                border: '1px solid rgba(231, 97, 20, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'var(--secondary-color, #e76114)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Scale size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                  Total Runner ({materialDetail.year})
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'var(--secondary-color, #e76114)' }}>
                  {materialDetail.totalWeightKg.toFixed(3)} kg
                </h4>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--bg-main, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <History size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                  Total Transaksi Input
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main, #0f172a)' }}>
                  {materialDetail.totalTransactions} Transaksi
                </h4>
              </div>
            </div>
          </div>

          {/* Monthly Trend Recharts Bar Chart */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={18} color="var(--primary-color, #008d51)" />
              <h3 style={{ fontSize: '0.975rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                Grafik akumulasi berat runner (kg) per Bulan — {materialDetail.year}
              </h3>
            </div>

            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #e2e8f0)" />
                  <XAxis dataKey="month" stroke="var(--text-muted, #64748b)" fontSize={12} />
                  <YAxis stroke="var(--text-muted, #64748b)" fontSize={12} unit=" kg" />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toFixed(3)} kg`, 'Berat Runner']}
                    labelFormatter={(label) => `Bulan ${label} ${materialDetail.year}`}
                    contentStyle={{
                      backgroundColor: 'var(--bg-card, #ffffff)',
                      borderColor: 'var(--border-color, #cbd5e1)',
                      borderRadius: '8px',
                      color: 'var(--text-main, #0f172a)',
                      fontWeight: 700,
                    }}
                  />
                  <Bar dataKey="total_runner_weight_kg" radius={[6, 6, 0, 0]}>
                    {monthlyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.total_runner_weight_kg > 0 ? 'var(--secondary-color, #e76114)' : '#cbd5e1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transactions History Table for Selected Material */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '0.975rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                Riwayat Transaksi Input Runner ({transactions.length} Entry)
              </h3>
              <Badge variant="info">{materialDetail.year}</Badge>
            </div>

            {transactions.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
                Belum ada transaksi recorded untuk material ini pada tahun {materialDetail.year}.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '280px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
                      <th style={{ padding: '0.55rem 0.75rem' }}>No</th>
                      <th style={{ padding: '0.55rem 0.75rem' }}>Tanggal Produksi</th>
                      <th style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>Total Runner (kg)</th>
                      <th style={{ padding: '0.55rem 0.75rem' }}>Batch / Sumber</th>
                      <th style={{ padding: '0.55rem 0.75rem' }}>Waktu Input</th>
                      {isAdminOrSuperAdmin && (
                        <th style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((rec, idx) => (
                      <tr key={rec.id || idx} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted, #64748b)' }}>{idx + 1}</td>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                          {rec.transaction_date || '-'}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                          {Number(rec.total_runner_weight_kg || 0).toFixed(3)} kg
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', fontSize: '0.775rem', color: 'var(--text-muted, #64748b)' }}>
                          <code>{rec.import_batch_ref || '-'}</code>
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', fontSize: '0.775rem', color: 'var(--text-muted, #64748b)' }}>
                          {formatDate(rec.created_at)}
                        </td>
                        {isAdminOrSuperAdmin && (
                          <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                              {onEditRecord && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => onEditRecord(rec)}
                                  title="Edit"
                                  leftIcon={<Edit2 size={12} />}
                                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.725rem' }}
                                >
                                  Edit
                                </Button>
                              )}
                              {onDeleteRecord && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => onDeleteRecord(rec.id)}
                                  title="Hapus"
                                  leftIcon={<Trash2 size={12} />}
                                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.725rem' }}
                                >
                                  Hapus
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
