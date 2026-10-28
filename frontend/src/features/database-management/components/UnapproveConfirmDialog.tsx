import React, { useState } from 'react';
import { AlertTriangle, Undo2, X } from 'lucide-react';
import type { DatabaseRequestHeader } from '../types/databaseManagement.types';

interface UnapproveConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: DatabaseRequestHeader | null;
  onConfirm: (reason?: string) => Promise<void>;
}

export const UnapproveConfirmDialog: React.FC<UnapproveConfirmDialogProps> = ({
  isOpen,
  onClose,
  request,
  onConfirm,
}) => {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      setReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          padding: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1.5px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706' }}>
            <AlertTriangle size={22} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
              Batalkan Status Approval
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ backgroundColor: '#fffbeb', borderRadius: '12px', padding: '0.85rem', border: '1px solid #fde68a', fontSize: '0.8rem', color: '#92400e', lineHeight: 1.5 }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>
            Peringatan Konfirmasi Tiket {request.request_number}:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>Status tiket akan dikembalikan menjadi <strong>Pending (Menunggu Verifikasi)</strong>.</li>
            <li>Seluruh record transaksi di <strong>ng_transactions</strong> dan <strong>runner_material_transactions</strong> yang terhubung dengan tiket ini akan <strong>otomatis dihapus</strong> dari database.</li>
            <li>Angka transaksi pada <strong>Dashboard & Verifikasi Output</strong> hari itu akan otomatis berkurang dan kembali bersih.</li>
            <li>Operator di pabrik dapat melakukan verifikasi fisik ulang dari awal setelah data diperbaiki.</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Alasan Pembatalan Approval (Opsional untuk audit log):
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Salah input kuantitas oleh operator, perlu penimbangan ulang part..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.8rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#d97706',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)',
              }}
            >
              <Undo2 size={15} />
              <span>{isSubmitting ? 'Memproses...' : 'Ya, Batalkan Approval'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
