import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import type { CrushingRequest } from '../types/crushingRequests.types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Network,
  User,
  Calendar,
  Layers,
  Scale,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CrushingRequest | null;
  isLoading: boolean;
  isOperatorOrAdmin?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (req: CrushingRequest) => void;
  isActionLoading?: boolean;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  isLoading,
  isOperatorOrAdmin,
  onApprove,
  onReject,
  isActionLoading,
}) => {
  if (!request && !isLoading) return null;

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Rincian Tiket: ${request?.request_number || 'Loading...'}`}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Button variant="outline" onClick={onClose} disabled={isActionLoading}>
            Tutup
          </Button>

          {isOperatorOrAdmin && request?.status === 'pending' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="danger"
                onClick={() => onReject && onReject(request)}
                disabled={isActionLoading}
                leftIcon={<X size={16} />}
              >
                Tolak Tiket
              </Button>
              <Button
                variant="primary"
                onClick={() => onApprove && onApprove(request.id)}
                isLoading={isActionLoading}
                leftIcon={<Check size={16} />}
              >
                Setujui (Approve)
              </Button>
            </div>
          )}
        </div>
      }
    >
      {isLoading || !request ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
          Memuat rincian tiket...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Status & Rejection Banner if rejected */}
          {request.status === 'rejected' && (
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md, 8px)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                color: '#b91c1c',
                fontSize: '0.85rem',
              }}
            >
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 800 }}>Tiket Permintaan Ditolak</div>
                <div style={{ marginTop: '0.2rem' }}>
                  <strong>Alasan Penolakan:</strong> {request.rejection_reason || 'Tidak ada alasan khusus.'}
                </div>
              </div>
            </div>
          )}

          {/* Ticket Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-main, #f8fafc)',
              padding: '1rem',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--border-color, #e2e8f0)',
              fontSize: '0.825rem',
            }}
          >
            <div>
              <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>Status Tiket:</div>
              <div style={{ marginTop: '0.2rem' }}>{getStatusBadge(request.status)}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>Pengirim:</div>
              <div style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} />
                <span>{request.sender_name} (@{request.sender_username})</span>
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>Departemen & Pabrik:</div>
              <div style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Network size={14} color="var(--primary-color, #008d51)" />
                <span>{request.department_name} ({request.factory_name})</span>
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>Waktu Pengiriman:</div>
              <div style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} />
                <span>{request.request_date} (Shift {request.shift})</span>
              </div>
            </div>

            {request.validated_by && (
              <div>
                <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>Divalidasi Oleh:</div>
                <div style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                  {request.validator_name || 'Operator'}{' '}
                  {request.validated_at && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 'normal' }}>
                      ({new Date(request.validated_at).toLocaleString('id-ID')})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {request.notes && (
            <div style={{ fontSize: '0.825rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>Catatan Pengirim: </span>
              <span style={{ color: 'var(--text-main, #0f172a)' }}>{request.notes}</span>
            </div>
          )}

          {/* Items Table */}
          <div>
            <h4 style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', marginBottom: '0.5rem' }}>
              Rincian Item yang Dikirimkan ({request.items?.length || 0} Item)
            </h4>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: 'var(--radius-md, 8px)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Tipe</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Nama Part / Material</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Part Number & Model</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Jumlah (Pcs)</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Berat (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {request.items && request.items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <Badge variant={item.item_type === 'part_ng' ? 'primary' : 'warning'} size="sm">
                          {item.item_type === 'part_ng' ? 'Part NG' : 'Runner NG'}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                        <div>{item.part_name_snapshot || item.material_name_snapshot || 'Material'}</div>
                        {item.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic' }}>
                            {item.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem' }}>
                        {item.part_number_snapshot ? (
                          <div>
                            <code>{item.part_number_snapshot}</code> ({item.model_snapshot || '-'})
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                        {item.quantity_pcs > 0 ? `${item.quantity_pcs} pcs` : '-'}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                        {Number(item.weight_kg || 0).toFixed(2)} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Summary Footer Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.15rem',
              backgroundColor: 'rgba(231, 97, 20, 0.06)',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid rgba(231, 97, 20, 0.2)',
            }}
          >
            <div style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)', fontSize: '0.875rem' }}>
              Total Akumulasi: {request.total_pcs > 0 && <span>{request.total_pcs} Pcs | </span>}
              <span>{request.items?.length || 0} Item</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Scale size={18} color="var(--secondary-color, #e76114)" />
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                {Number(request.total_weight_kg || 0).toFixed(2)} kg
              </span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
