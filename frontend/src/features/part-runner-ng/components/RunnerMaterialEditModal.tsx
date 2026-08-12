import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import type { RunnerMaterialRecord, UpdateRunnerMaterialPayload } from '../types/runnerMaterial.types';
import { Save, Layers, Calendar, Scale, Sun, Moon } from 'lucide-react';

interface RunnerMaterialEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: RunnerMaterialRecord | null;
  onSave: (id: string, payload: UpdateRunnerMaterialPayload) => void;
  isLoading: boolean;
}

export const RunnerMaterialEditModal: React.FC<RunnerMaterialEditModalProps> = ({
  isOpen,
  onClose,
  record,
  onSave,
  isLoading,
}) => {
  const [materialName, setMaterialName] = useState<string>('');
  const [shift, setShift] = useState<'Pagi' | 'Malam'>('Pagi');
  const [runnerWeightKg, setRunnerWeightKg] = useState<number | ''>('');
  const [transactionDate, setTransactionDate] = useState<string>('');

  useEffect(() => {
    if (record) {
      setMaterialName(record.material_name_snapshot || '');
      setShift(record.shift || 'Pagi');
      setRunnerWeightKg(Number(record.total_runner_weight_kg) || 0);
      setTransactionDate(record.transaction_date || '');
    }
  }, [record]);

  if (!record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim()) return;

    onSave(record.id, {
      material_name_snapshot: materialName.trim(),
      shift,
      total_runner_weight_kg: typeof runnerWeightKg === 'number' ? runnerWeightKg : 0,
      transaction_date: transactionDate,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Data Runner Material" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Nama Material */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Nama Material <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <Input
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            placeholder="Contoh: ABS, PP, POM..."
            leftIcon={<Layers size={16} />}
            required
          />
        </div>

        {/* Shift Produksi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Shift Produksi <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShift('Pagi')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: `2px solid ${shift === 'Pagi' ? '#008d51' : 'var(--border-color, #cbd5e1)'}`,
                backgroundColor: shift === 'Pagi' ? 'rgba(0, 141, 81, 0.1)' : 'var(--bg-card, #ffffff)',
                color: shift === 'Pagi' ? '#008d51' : 'var(--text-muted, #64748b)',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <Sun size={15} />
              <span>Shift Pagi</span>
            </button>
            <button
              type="button"
              onClick={() => setShift('Malam')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: `2px solid ${shift === 'Malam' ? '#e76114' : 'var(--border-color, #cbd5e1)'}`,
                backgroundColor: shift === 'Malam' ? 'rgba(231, 97, 20, 0.1)' : 'var(--bg-card, #ffffff)',
                color: shift === 'Malam' ? '#e76114' : 'var(--text-muted, #64748b)',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <Moon size={15} />
              <span>Shift Malam</span>
            </button>
          </div>
        </div>

        {/* Tanggal Produksi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Tanggal Produksi <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <Input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            leftIcon={<Calendar size={16} />}
            required
          />
        </div>

        {/* Total Runner (kg) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Total Berat Runner (kg) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <Input
            type="number"
            step="0.001"
            min={0}
            value={runnerWeightKg}
            onChange={(e) => {
              const val = e.target.value;
              setRunnerWeightKg(val === '' ? '' : parseFloat(val) || 0);
            }}
            placeholder="Berat runner kg..."
            leftIcon={<Scale size={16} />}
            required
          />
        </div>

        {/* Form Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading} leftIcon={<Save size={16} />}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
