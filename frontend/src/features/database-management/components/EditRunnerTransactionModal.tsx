import React, { useState, useEffect } from 'react';
import { Edit2, X } from 'lucide-react';
import type { DirectRunnerTransactionItem } from '../types/databaseManagement.types';

interface EditRunnerTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: DirectRunnerTransactionItem | null;
  onUpdate: (
    id: string,
    payload: {
      total_runner_weight_kg?: number;
      total_pcs?: number;
      shift?: 'Pagi' | 'Malam';
      transaction_date?: string;
    }
  ) => Promise<void>;
}

export const EditRunnerTransactionModal: React.FC<EditRunnerTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onUpdate,
}) => {
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [totalPcs, setTotalPcs] = useState<number>(0);
  const [shift, setShift] = useState<'Pagi' | 'Malam'>('Pagi');
  const [transactionDate, setTransactionDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (transaction) {
      setTotalWeight(Number(transaction.total_runner_weight_kg) || 0);
      setTotalPcs(transaction.total_pcs || 0);
      setShift(transaction.shift || 'Pagi');
      setTransactionDate(transaction.transaction_date || '');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(transaction.id, {
        total_runner_weight_kg: totalWeight,
        total_pcs: totalPcs,
        shift,
        transaction_date: transactionDate,
      });
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
          maxWidth: '500px',
          padding: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1.5px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
            Edit Transaksi Runner
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
          <strong style={{ color: '#0f172a' }}>{transaction.material_name_snapshot}</strong>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>
            Batch / Ref: {transaction.import_batch_ref || '-'}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                Tanggal Transaksi:
              </label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.82rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                Shift:
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as 'Pagi' | 'Malam')}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.82rem',
                  backgroundColor: '#ffffff',
                  fontWeight: 700,
                }}
              >
                <option value="Pagi">Shift Pagi</option>
                <option value="Malam">Shift Malam</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
              Berat Total Runner (kg):
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={totalWeight}
              onChange={(e) => setTotalWeight(parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 800,
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
              Total Pcs (Opsional):
            </label>
            <input
              type="number"
              min="0"
              value={totalPcs}
              onChange={(e) => setTotalPcs(parseInt(e.target.value, 10) || 0)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
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
                backgroundColor: 'var(--secondary-color, #e76114)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              <Edit2 size={14} />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
