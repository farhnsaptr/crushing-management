import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import type { RunnerMaterialRecord, UpdateRunnerMaterialPayload } from '../types/runnerMaterial.types';
import { Save, Layers, Calendar, Scale } from 'lucide-react';

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
  const [runnerWeightKg, setRunnerWeightKg] = useState<number | ''>('');
  const [transactionDate, setTransactionDate] = useState<string>('');

  useEffect(() => {
    if (record) {
      setMaterialName(record.material_name_snapshot || '');
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
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading} leftIcon={<Save size={18} />}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
