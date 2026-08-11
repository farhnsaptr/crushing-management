import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface RunnerDeleteAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDeleteAll: () => void;
  totalRecordsCount: number;
  isLoading: boolean;
}

export const RunnerDeleteAllModal: React.FC<RunnerDeleteAllModalProps> = ({
  isOpen,
  onClose,
  onConfirmDeleteAll,
  totalRecordsCount,
  isLoading,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Semua Data Runner Material" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            color: '#b91c1c',
          }}
        >
          <AlertTriangle size={28} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#dc2626' }}>
              Tindakan Berbahaya (Khusus Super-Admin)
            </h4>
            <p style={{ fontSize: '0.825rem', marginTop: '0.35rem', lineHeight: 1.45, color: '#7f1d1d' }}>
              Anda akan menghapus secara permanen <strong>seluruh ({totalRecordsCount}) data transaksi runner material</strong> dari database.
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-main, #0f172a)', fontWeight: 600 }}>
          Apakah Anda benar-benar yakin ingin menghapus seluruh isi tabel runner material?
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={onConfirmDeleteAll}
            isLoading={isLoading}
            leftIcon={<Trash2 size={18} />}
          >
            Ya, Hapus Semua Data
          </Button>
        </div>
      </div>
    </Modal>
  );
};
