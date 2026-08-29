import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import {
  CheckCircle2,
  Calendar,
  Sun,
  Moon,
  Box,
  Scale,
  FileCheck,
  Info,
  Layers,
  Check,
} from 'lucide-react';
import type { VerificationDetailResponse, VerificationItem } from '../types/verification.types';

interface VerificationFormCardProps {
  date: string;
  setDate: (date: string) => void;
  shift: 'Pagi' | 'Malam';
  setShift: (shift: 'Pagi' | 'Malam') => void;
  notes: string;
  setNotes: (notes: string) => void;
  data: VerificationDetailResponse | null;
  items: VerificationItem[];
  isLoading: boolean;
  isSaving: boolean;
  onUpdateItem: (index: number, value: number | '') => void;
  onSave: () => Promise<void>;
  totals: {
    totalSystemKg: number;
    totalActualOutputKg: number;
    totalCrushingWasteKg: number;
  };
}

export const VerificationFormCard: React.FC<VerificationFormCardProps> = ({
  date,
  setDate,
  shift,
  setShift,
  notes,
  setNotes,
  data,
  items,
  isLoading,
  isSaving,
  onUpdateItem,
  onSave,
}) => {
  const isValidated = data?.is_validated || false;
  const hasInput = items.length > 0;
  const headerInfo = data?.header;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Status & Filter Controls Banner */}
      <div
        style={{
          padding: '1.15rem 1.35rem',
          borderRadius: '14px',
          backgroundColor: !hasInput
            ? '#f8fafc'
            : isValidated
              ? 'rgba(0, 141, 81, 0.08)'
              : 'rgba(231, 97, 20, 0.08)',
          border: `1.5px solid ${!hasInput ? '#cbd5e1' : isValidated ? '#008d51' : '#e76114'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: !hasInput ? '#64748b' : isValidated ? '#008d51' : '#e76114',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: !hasInput ? 'none' : isValidated ? '0 4px 12px rgba(0, 141, 81, 0.25)' : '0 4px 12px rgba(231, 97, 20, 0.25)',
            }}
          >
            {!hasInput ? (
              <Info size={24} />
            ) : isValidated ? (
              <CheckCircle2 size={24} />
            ) : (
              <Scale size={24} />
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                Status Verifikasi: {!hasInput ? 'BELUM ADA INPUT MATERIAL' : isValidated ? 'SUDAH DIVALIDASI' : 'MENUNGGU INPUT HASIL TIMBANGAN'}
              </h3>
              <Badge variant={!hasInput ? 'neutral' : isValidated ? 'success' : 'warning'}>
                Tanggal {date} — Shift {shift}
              </Badge>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted, #64748b)', margin: '0.25rem 0 0 0' }}>
              {!hasInput
                ? `Belum ada data transaksi material reuse pada Tanggal ${date} (Shift ${shift}).`
                : isValidated
                  ? `Validasi telah diselesaikan oleh ${headerInfo?.validated_by_name || 'Operator'} pada ${headerInfo?.validated_at ? new Date(headerInfo.validated_at).toLocaleString('id-ID') : '-'}`
                  : 'Timbang hasil akhir crushing di lapangan per jenis material, lalu inputkan berat riil dalam Kilogram (kg).'}
            </p>
          </div>
        </div>

        {/* Date & Shift Quick Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Date Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={16} color="var(--text-muted, #64748b)" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: '0.4rem 0.65rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          {/* Shift Button Toggle */}
          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#ffffff', padding: '0.2rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <button
              type="button"
              onClick={() => setShift('Pagi')}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: shift === 'Pagi' ? '#008d51' : 'transparent',
                color: shift === 'Pagi' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Sun size={14} /> Pagi (D)
            </button>
            <button
              type="button"
              onClick={() => setShift('Malam')}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: shift === 'Malam' ? '#e76114' : 'transparent',
                color: shift === 'Malam' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Moon size={14} /> Malam (N)
            </button>
          </div>
        </div>
      </div>

      {/* Main Validation Card */}
      <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck size={20} color="#008d51" /> Form Input Hasil Crushing Aktual (Material Reuse)
            </h2>
            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Masukkan total berat fisik (kg) yang diperoleh dari proses penggilingan pada shift ini.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Badge variant="secondary" size="md">
              {items.length} Jenis Material Terdaftar
            </Badge>
          </div>
        </div>

        {/* Verification Items Table (Blind Mode - Direct Kg Only) */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Memuat daftar material yang diproses pada tanggal & shift terpilih...
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <Layers size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#475569' }}>
              Tidak ada material <strong>Reuse</strong> yang digiling pada Tanggal {date} (Shift {shift}).
            </p>
            <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
              Silahkan lakukan input Part NG atau Part Runner terlebih dahulu jika terdapat proses crushing.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.85rem 1rem', width: '60px' }}>No</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Jenis Material (Reuse)</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '260px' }}>
                    Berat Hasil Timbangan Aktual (kg)
                  </th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '150px' }}>Status Input</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const hasValue = item.actual_output_kg !== '' && typeof item.actual_output_kg === 'number' && item.actual_output_kg > 0;

                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: hasValue ? 'rgba(0, 141, 81, 0.02)' : 'transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Box size={18} color="#008d51" />
                          <span style={{ fontSize: '0.95rem' }}>{item.material_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={item.actual_output_kg}
                            onChange={(e) => {
                              const val = e.target.value;
                              onUpdateItem(idx, val === '' ? '' : parseFloat(val));
                            }}
                            style={{
                              width: '140px',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '8px',
                              border: '2px solid var(--primary-color, #008d51)',
                              textAlign: 'center',
                              fontWeight: 900,
                              fontSize: '1rem',
                              color: '#0f172a',
                              backgroundColor: '#ffffff',
                              outline: 'none',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                            }}
                          />
                          <span style={{ fontWeight: 800, color: 'var(--text-muted, #64748b)' }}>kg</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        {hasValue ? (
                          <Badge variant="success" size="sm">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Check size={12} />
                              <span>Terisi ({Number(item.actual_output_kg).toFixed(2)} kg)</span>
                            </div>
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            Belum Diisi
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Notes & Submit Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
              Catatan Validasi Opsional
            </label>
            <input
              type="text"
              placeholder="Contoh: Kondisi gilingan bersih, output siap dipindahkan ke karung/silo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={items.length === 0}
              style={{
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <Button
              type="button"
              variant="primary"
              onClick={onSave}
              isLoading={isSaving}
              disabled={isLoading || items.length === 0}
              leftIcon={<CheckCircle2 size={18} />}
              style={{
                fontWeight: 900,
                padding: '0.75rem 2rem',
                backgroundColor: items.length === 0 ? '#cbd5e1' : 'var(--primary-color, #008d51)',
                cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.925rem',
              }}
            >
              Validasi Pekerjaan Shift Ini
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
