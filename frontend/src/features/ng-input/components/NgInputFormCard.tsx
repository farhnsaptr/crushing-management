import React from 'react';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import type { MasterPart } from '../types/ngInput.types';
import { Save, Sun, Moon, Scale, Package, Calendar, AlertCircle, Lock } from 'lucide-react';
import { formatIndonesianDate } from '../../../config/shift.config';

interface NgInputFormCardProps {
  selectedPart: MasterPart | null;
  quantityPcs: number | '';
  onQuantityChange: (val: number | '') => void;
  shift: 'Pagi' | 'Malam';
  onShiftChange: (shift: 'Pagi' | 'Malam') => void;
  transactionDate: string;
  onTransactionDateChange: (date: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  estimatedWeightKg: number;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const NgInputFormCard: React.FC<NgInputFormCardProps> = ({
  selectedPart,
  quantityPcs,
  onQuantityChange,
  shift,
  transactionDate,
  notes,
  onNotesChange,
  estimatedWeightKg,
  isSubmitting,
  onSubmit,
}) => {
  return (
    <Card title="Form Input Qty NG">
      {!selectedPart ? (
        <div
          style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)',
          }}
        >
          <AlertCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
            Silakan pilih salah satu part di sebelah kiri terlebih dahulu.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Selected Part Summary Banner */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                Part Terpilih
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#2563eb',
                }}
              >
                Model {selectedPart.model_code || '-'}
              </span>
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
              {selectedPart.part_name}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', paddingTop: '0.25rem' }}>
              <div>
                <strong>No. Part:</strong> {selectedPart.part_number}
              </div>
              <div>
                <strong>Berat/pcs:</strong> {Number(selectedPart.berat_part_gr)} gr
              </div>
              <div>
                <strong>Material:</strong> {selectedPart.material || '-'}
              </div>
              <div>
                <strong>Factory:</strong> {selectedPart.factory_name || selectedPart.factory_code || '-'}
              </div>
            </div>
          </div>

          {/* Operational Time & Shift Auto-Badge Card */}
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} style={{ color: 'var(--primary-color)' }} />
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Tanggal Transaksi
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {formatIndonesianDate(transactionDate)}
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: shift === 'Pagi' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(79, 70, 229, 0.12)',
                border: `1px solid ${shift === 'Pagi' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(79, 70, 229, 0.3)'}`,
                color: shift === 'Pagi' ? '#d97706' : '#4338ca',
                fontSize: '0.825rem',
                fontWeight: 800,
              }}
            >
              {shift === 'Pagi' ? <Sun size={15} /> : <Moon size={15} />}
              <span>Shift {shift}</span>
            </div>
          </div>

          {/* Input Quantity NG (pcs) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Input Quantity (pcs) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <Input
              type="number"
              min={1}
              placeholder="Masukkan jumlah pcs..."
              value={quantityPcs}
              onChange={(e) => {
                const val = e.target.value;
                onQuantityChange(val === '' ? '' : parseInt(val, 10) || '');
              }}
              leftIcon={<Package size={16} />}
              autoFocus
              required
            />
          </div>

          {/* Computed Weight Highlight Display Box */}
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Scale size={18} style={{ color: 'var(--primary-color)' }} />
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                  Estimasi Total Berat
                </span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                  ({quantityPcs || 0} pcs × {Number(selectedPart.berat_part_gr)} gr / 1000)
                </span>
              </div>
            </div>

            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-color)' }}>
              {estimatedWeightKg.toFixed(2)} <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>kg</span>
            </span>
          </div>

          {/* Notes / Catatan Opsional */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Catatan / Defect (Opsional)
            </label>
            <Input
              type="text"
              placeholder="Contoh: Bumper baret, Flash tebal..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={<Save size={18} />}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Simpan Transaksi NG
          </Button>
        </form>
      )}
    </Card>
  );
};
