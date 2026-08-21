import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { CrushingRequest } from '../types/crushingRequests.types';
import { AlertTriangle, X } from 'lucide-react';

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CrushingRequest | null;
  rejectionReason: string;
  onRejectionReasonChange: (val: string) => void;
  onConfirmReject: () => void;
  isLoading: boolean;
}

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  isOpen,
  onClose,
  request,
  rejectionReason,
  onRejectionReasonChange,
  onConfirmReject,
  isLoading,
}) => {
  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tolak Tiket: ${request.request_number}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={onConfirmReject}
            isLoading={isLoading}
            disabled={!rejectionReason.trim()}
            leftIcon={<X size={16} />}
          >
            Konfirmasi Penolakan
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md, 8px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#b91c1c',
            fontSize: '0.85rem',
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <span>
            Tiket dari <strong>{request.sender_name}</strong> ({request.department_name}) akan ditolak dan tidak akan dicatat ke transaksi crushing.
          </span>
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
            Alasan Penolakan <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            placeholder="Contoh: Jumlah fisik part tidak sesuai surat jalan, part tercampur jenis lain..."
            value={rejectionReason}
            onChange={(e) => onRejectionReasonChange(e.target.value)}
            rows={4}
            required
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-card, #ffffff)',
              color: 'var(--text-main, #0f172a)',
              fontSize: '0.875rem',
              marginTop: '0.35rem',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>
      </div>
    </Modal>
  );
};
