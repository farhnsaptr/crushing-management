import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Spinner } from '../../../components/common/Spinner';
import { formatIndonesianDate } from '../../../config/shift.config';
import { useIsNarrow } from '../../../hooks';
import type {
  SenderEvaluationItem,
  CrushingRequest,
  SenderActivityHeatmapResponse,
} from '../types/crushingRequests.types';
import { ActivityHeatmap } from './ActivityHeatmap';
import {
  User,
  Building2,
  Calendar,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SenderRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sender: SenderEvaluationItem | null;
  date: string;
  shift: string;
  requests: CrushingRequest[];
  isLoading: boolean;
  onViewRequestDetail: (req: CrushingRequest) => void;
  heatmap?: SenderActivityHeatmapResponse | null;
  isLoadingHeatmap?: boolean;
  heatmapMonths?: number;
  onMonthsChange?: (months: number) => void;
}

export const SenderRequestsModal: React.FC<SenderRequestsModalProps> = ({
  isOpen,
  onClose,
  sender,
  date,
  shift,
  requests,
  isLoading,
  onViewRequestDetail,
  heatmap,
  isLoadingHeatmap = false,
  heatmapMonths = 6,
  onMonthsChange,
}) => {
  const [contentRef, isMobile] = useIsNarrow<HTMLDivElement>(620);

  if (!sender) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Rincian Pengajuan — @${sender.username}`}
      size="xl"
      footer={
        <Button variant="secondary" onClick={onClose} style={{ width: isMobile ? '100%' : 'auto' }}>
          Tutup
        </Button>
      }
    >
      <div ref={contentRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Info Header Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--bg-main, #f8fafc)',
            borderRadius: 'var(--radius-lg, 10px)',
            border: '1px solid var(--border-color, #e2e8f0)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <User size={18} style={{ color: 'var(--primary-color, #008d51)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>Pengirim</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                {sender.full_name} (@{sender.username})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 size={18} style={{ color: 'var(--primary-color, #008d51)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>Departemen & Pabrik</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
                {sender.department_name} • {sender.factory_name}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar size={18} style={{ color: 'var(--primary-color, #008d51)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>Tanggal & Shift</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
                {formatIndonesianDate(date)} ({shift === 'all' ? 'Semua Shift' : `Shift ${shift}`})
              </div>
            </div>
          </div>
        </div>

        {/* GitHub-Style Sender Activity Heatmap */}
        <ActivityHeatmap
          activities={heatmap?.activities || []}
          totalSubmissions={heatmap?.summary?.total_submissions}
          totalWeightKg={heatmap?.summary?.total_weight_kg}
          activeDays={heatmap?.summary?.active_days}
          isLoading={isLoadingHeatmap}
          months={heatmapMonths}
          onMonthsChange={onMonthsChange}
          title={`Grafik Aktivitas Pengiriman — ${sender.full_name}`}
        />

        {/* Ticket Section Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            paddingBottom: '0.5rem',
            marginTop: '0.25rem',
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
            Daftar Tiket Pengajuan Hari Ini
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
            {requests.length} tiket ditemukan
          </div>
        </div>

        {/* Content Table / Mobile Cards / Empty State */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
            <Spinner size={36} />
          </div>
        ) : requests.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'rgba(234, 179, 8, 0.08)',
              borderRadius: 'var(--radius-lg, 10px)',
              border: '1.5px dashed var(--warning-color, #eab308)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={36} style={{ color: 'var(--warning-color, #ca8a04)' }} />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                Belum Ada Pengajuan Request
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
                Pengirim <strong>{sender.full_name}</strong> belum mengirimkan permintaan part/runner NG pada tanggal & shift ini.
              </div>
            </div>
          </div>
        ) : isMobile ? (
          /* ==================== MOBILE REQUEST CARDS ==================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {requests.map((req) => (
              <div
                key={req.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-lg, 10px)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
                }}
              >
                {/* Header: No Tiket & Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary-color, #008d51)' }}>
                    {req.request_number}
                  </div>
                  {req.status === 'approved' ? (
                    <Badge variant="success" size="sm">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={12} />
                        <span>Disetujui</span>
                      </div>
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        <span>Pending</span>
                      </div>
                    </Badge>
                  )}
                </div>

                {/* Meta details */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Badge variant={req.shift === 'Pagi' ? 'info' : 'warning'} size="sm">
                      {req.shift}
                    </Badge>
                    <span style={{ textTransform: 'capitalize' }}>
                      {req.request_type ? req.request_type.replace('_', ' ') : '-'}
                    </span>
                  </div>
                  <div>
                    {req.submitted_at
                      ? new Date(req.submitted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                      : '-'}
                  </div>
                </div>

                {/* Numbers row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    padding: '0.4rem 0.6rem',
                    backgroundColor: 'var(--bg-main, #f8fafc)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontSize: '0.8rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>Total Pcs: </span>
                    <strong style={{ color: 'var(--text-main, #0f172a)' }}>{req.total_pcs.toLocaleString()} pcs</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>Total Berat: </span>
                    <strong style={{ color: 'var(--text-main, #0f172a)' }}>{Number(req.total_weight_kg).toFixed(2)} kg</strong>
                  </div>
                </div>

                {/* Action button */}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onViewRequestDetail(req)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Eye size={14} />
                    <span>Rincian Part</span>
                  </div>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          /* ==================== DESKTOP TABLE VIEW ==================== */
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: 'var(--radius-lg, 10px)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>No. Tiket</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>Shift</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>Jenis</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>Waktu Submit</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', textAlign: 'right' }}>Total Pcs</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', textAlign: 'right' }}>Total Berat (kg)</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    style={{
                      borderBottom: '1px solid var(--border-color, #e2e8f0)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--primary-color, #008d51)' }}>
                      {req.request_number}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge variant={req.shift === 'Pagi' ? 'info' : 'warning'} size="sm">
                        {req.shift}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textTransform: 'capitalize' }}>
                      {req.request_type ? req.request_type.replace('_', ' ') : '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted, #64748b)', fontSize: '0.8rem' }}>
                      {req.submitted_at
                        ? new Date(req.submitted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                      {req.total_pcs.toLocaleString()} pcs
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                      {Number(req.total_weight_kg).toFixed(2)} kg
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {req.status === 'approved' ? (
                        <Badge variant="success" size="sm">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={12} />
                            <span>Disetujui</span>
                          </div>
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} />
                            <span>Pending</span>
                          </div>
                        </Badge>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onViewRequestDetail(req)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Eye size={14} />
                          <span>Rincian Part</span>
                        </div>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};
