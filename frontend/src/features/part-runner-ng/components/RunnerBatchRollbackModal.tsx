import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import type { RunnerBatchItem } from '../types/runnerMaterial.types';
import { AlertTriangle, RotateCcw, Calendar, Layers, Clock, FileCheck2 } from 'lucide-react';

interface RunnerBatchRollbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: RunnerBatchItem[];
  isLoadingBatches: boolean;
  onConfirmRollback: (batchRef: string) => Promise<void>;
  initialBatchRef?: string;
  isActionLoading: boolean;
}

export const RunnerBatchRollbackModal: React.FC<RunnerBatchRollbackModalProps> = ({
  isOpen,
  onClose,
  batches,
  isLoadingBatches,
  onConfirmRollback,
  initialBatchRef,
  isActionLoading,
}) => {
  const [selectedBatchRef, setSelectedBatchRef] = useState<string>('');

  useEffect(() => {
    if (initialBatchRef) {
      setSelectedBatchRef(initialBatchRef);
    } else if (batches.length > 0 && !selectedBatchRef) {
      setSelectedBatchRef(batches[0].batch_ref);
    }
  }, [initialBatchRef, batches, isOpen]);

  const activeBatch = batches.find((b) => b.batch_ref === selectedBatchRef);

  const handleRollback = async () => {
    if (!selectedBatchRef) return;
    await onConfirmRollback(selectedBatchRef);
  };

  const formatDate = (dStr?: string) => {
    if (!dStr) return '-';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  const formatDateTime = (dStr?: string) => {
    if (!dStr) return '-';
    try {
      const d = new Date(dStr);
      return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dStr;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rollback Data Runner Material per Batch" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Warning Alert */}
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
          <AlertTriangle size={26} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <h4 style={{ fontSize: '0.925rem', fontWeight: 800, margin: 0, color: '#dc2626' }}>
              Rollback Transaksi per Batch
            </h4>
            <p style={{ fontSize: '0.825rem', marginTop: '0.35rem', lineHeight: 1.45, color: '#7f1d1d' }}>
              Tindakan ini akan menghapus <strong>seluruh data runner material dalam batch yang dipilih</strong>.
              Data dari batch lain akan tetap tersimpan aman.
            </p>
          </div>
        </div>

        {/* Batch Selector Dropdown */}
        <div>
          <label
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-main, #0f172a)',
              marginBottom: '0.4rem',
              display: 'block',
            }}
          >
            Pilih Batch yang Ingin Di-rollback:
          </label>
          {isLoadingBatches ? (
            <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Memuat daftar batch...
            </div>
          ) : batches.length === 0 ? (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--bg-main, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                fontSize: '0.85rem',
                color: 'var(--text-muted, #64748b)',
              }}
            >
              Tidak ada batch transaksi runner yang tersedia untuk di-rollback.
            </div>
          ) : (
            <select
              value={selectedBatchRef}
              onChange={(e) => setSelectedBatchRef(e.target.value)}
              disabled={isActionLoading}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-card, #ffffff)',
                color: 'var(--text-main, #0f172a)',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {batches.map((b) => (
                <option key={b.batch_ref} value={b.batch_ref}>
                  {b.batch_ref} — {b.total_records} record ({b.total_weight_kg.toFixed(2)} kg)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Selected Batch Summary Card */}
        {activeBatch && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'var(--bg-main, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              fontSize: '0.825rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileCheck2 size={16} color="var(--secondary-color, #e76114)" />
                <strong>Kode Batch:</strong>
              </span>
              <Badge variant="warning">{activeBatch.batch_ref}</Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={16} />
                <strong>Total Data / Berat:</strong>
              </span>
              <span style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                {activeBatch.total_records} record ({activeBatch.total_weight_kg.toFixed(2)} kg)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} />
                <strong>Rentang Tanggal:</strong>
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                {formatDate(activeBatch.min_date)} s/d {formatDate(activeBatch.max_date)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} />
                <strong>Waktu Import:</strong>
              </span>
              <span style={{ color: 'var(--text-muted, #64748b)' }}>
                {formatDateTime(activeBatch.created_at)}
              </span>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            borderTop: '1px solid var(--border-color, #e2e8f0)',
            paddingTop: '1rem',
          }}
        >
          <Button variant="secondary" onClick={onClose} disabled={isActionLoading}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleRollback}
            isLoading={isActionLoading}
            disabled={!selectedBatchRef || batches.length === 0}
            leftIcon={<RotateCcw size={16} />}
          >
            Ya, Rollback Batch Ini
          </Button>
        </div>
      </div>
    </Modal>
  );
};
