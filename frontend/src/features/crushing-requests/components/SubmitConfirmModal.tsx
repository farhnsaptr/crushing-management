import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import type { CreateRequestItemPayload } from '../types/crushingRequests.types';
import type { UserProfile } from '../../../context/AuthContext';
import {
  Send,
  Calendar,
  AlertTriangle,
  Network,
  User,
} from 'lucide-react';
import { formatIndonesianDate } from '../../../config/shift.config';

interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  user: UserProfile | null;
  shift: 'Pagi' | 'Malam';
  requestDate: string;
  notes?: string;
  items: CreateRequestItemPayload[];
  totalWeightKg: number;
  totalPcs: number;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  user,
  shift,
  requestDate,
  notes,
  items,
  totalWeightKg,
  totalPcs,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Konfirmasi Pengiriman Part NG"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Periksa Kembali
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
            leftIcon={<Send size={16} />}
            style={{ fontWeight: 800 }}
          >
            Ya, Kirim Pengajuan Sekarang
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Warning Notice Banner */}
        <div
          style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'rgba(231, 97, 20, 0.08)',
            border: '1px solid rgba(231, 97, 20, 0.3)',
            borderRadius: 'var(--radius-md, 8px)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            color: 'var(--secondary-color, #e76114)',
          }}
        >
          <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.85rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.15rem' }}>Verifikasi Fisik Sebelum Pengiriman</strong>
            <span>Pastikan seluruh fisik part NG yang diserahkan ke operator crushing sesuai dengan rincian pengiriman di bawah ini.</span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--bg-main, #f8fafc)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-color, #e2e8f0)',
            fontSize: '0.8rem',
          }}
        >
          <div>
            <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.7rem', fontWeight: 600 }}>Pengirim:</div>
            <div style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
              <User size={13} color="var(--primary-color, #008d51)" />
              <span>{user?.full_name}</span>
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.7rem', fontWeight: 600 }}>Departemen / Pabrik:</div>
            <div style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
              <Network size={13} color="var(--primary-color, #008d51)" />
              <span>{user?.department_name} ({user?.factory_name || '-'})</span>
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.7rem', fontWeight: 600 }}>Waktu Pengiriman:</div>
            <div style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
              <Calendar size={13} color="var(--secondary-color, #e76114)" />
              <span>{formatIndonesianDate(requestDate)} (Shift {shift})</span>
            </div>
          </div>
        </div>

        {/* Total Summary Highlight Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(0, 141, 81, 0.06)',
              border: '1.5px solid rgba(0, 141, 81, 0.25)',
              borderRadius: 'var(--radius-md, 8px)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Item
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-color, #008d51)', marginTop: '0.15rem' }}>
              {items.length} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Macam</span>
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(59, 130, 246, 0.06)',
              border: '1.5px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 'var(--radius-md, 8px)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Quantity
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563eb', marginTop: '0.15rem' }}>
              {totalPcs} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Pcs</span>
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(231, 97, 20, 0.08)',
              border: '1.5px solid rgba(231, 97, 20, 0.3)',
              borderRadius: 'var(--radius-md, 8px)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Berat
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)', marginTop: '0.15rem' }}>
              {totalWeightKg.toFixed(2)} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>kg</span>
            </div>
          </div>
        </div>

        {/* Item Breakdown List */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', marginBottom: '0.4rem' }}>
            Rincian Item yang Akan Dikirim:
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: 'var(--radius-md, 8px)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
                  <th style={{ padding: '0.5rem 0.75rem', width: '30px' }}>No</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Tipe</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Nama Part / Material</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Jumlah (Pcs)</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Berat (kg)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted, #64748b)' }}>{idx + 1}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <Badge variant={it.item_type === 'part_ng' ? 'primary' : 'warning'} size="sm">
                        {it.item_type === 'part_ng' ? 'Part NG' : 'Runner'}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                      <div>{it.material_name}</div>
                      {it.notes && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic' }}>
                          Catatan: {it.notes}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                      {it.quantity_pcs > 0 ? `${it.quantity_pcs} pcs` : '-'}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 800, color: 'var(--secondary-color, #e76114)' }}>
                      {Number(it.runner_weight_kg || 0).toFixed(2)} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {notes && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '0.775rem',
              color: '#92400e',
            }}
          >
            <strong>Catatan Pengiriman: </strong> {notes}
          </div>
        )}
      </div>
    </Modal>
  );
};
