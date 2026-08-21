import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import {
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sun,
  Moon,
  Box,
  Scale,
  FileCheck,
  Info,
  Layers,
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
  onUpdateItem: (index: number, field: 'box_count' | 'kg_per_box', value: number | '') => void;
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
  totals,
}) => {
  const isValidated = data?.is_validated || false;
  const hasInput = items.length > 0;
  const headerInfo = data?.header;

  // Check if any material item has actual output exceeding system weight
  const hasExceedingOutput = items.some((item) => item.actual_output_kg > item.system_total_weight_kg);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Validation Status Indicator Banner */}
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
              <AlertTriangle size={24} />
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                Status Pekerjaan: {!hasInput ? 'BELUM ADA INPUT TRANSAKSI' : isValidated ? 'SUDAH DIVALIDASI' : 'BELUM DIVALIDASI'}
              </h3>
              <Badge variant={!hasInput ? 'neutral' : isValidated ? 'success' : 'warning'}>
                Tanggal {date} — Shift {shift}
              </Badge>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted, #64748b)', margin: '0.25rem 0 0 0' }}>
              {!hasInput
                ? `Belum ada input transaksi Part NG atau Part Runner pada Tanggal ${date} (Shift ${shift}). Lakukan input terlebih dahulu.`
                : isValidated
                  ? `Validasi diselesaikan oleh ${headerInfo?.validated_by_name || 'Operator'} pada ${headerInfo?.validated_at || '-'}`
                  : 'Silahkan periksa hasil crushing di dunia nyata dan masukkan jumlah box yang dihasilkan per material.'}
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
        {/* Card Header & Summary KPI Widgets */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck size={20} color="#008d51" /> Form Validasi Crushing Output (Material Reuse)
            </h2>
            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Sistem mencocokkan total berat (Part NG + Part Runner) dengan jumlah box fisik yang dihasilkan di dunia nyata.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Total System Input */}
            <div style={{ padding: '0.65rem 1rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', display: 'block' }}>Total Berat Sistem</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>{totals.totalSystemKg.toFixed(2)} kg</span>
            </div>

            {/* Total Actual Output */}
            <div style={{ padding: '0.65rem 1rem', borderRadius: '10px', backgroundColor: 'rgba(0, 141, 81, 0.08)', border: '1px solid rgba(0, 141, 81, 0.25)' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#008d51', display: 'block' }}>Total Actual Output</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#008d51' }}>{totals.totalActualOutputKg.toFixed(2)} kg</span>
            </div>

            {/* Total Crushing Waste / Loss */}
            <div style={{ padding: '0.65rem 1rem', borderRadius: '10px', backgroundColor: totals.totalCrushingWasteKg > 0 ? 'rgba(239, 68, 68, 0.08)' : '#f8fafc', border: `1px solid ${totals.totalCrushingWasteKg > 0 ? 'rgba(239, 68, 68, 0.3)' : '#e2e8f0'}` }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: totals.totalCrushingWasteKg > 0 ? '#ef4444' : '#64748b', display: 'block' }}>Crushing Waste / Loss</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: totals.totalCrushingWasteKg > 0 ? '#ef4444' : '#0f172a' }}>{totals.totalCrushingWasteKg.toFixed(2)} kg</span>
            </div>
          </div>
        </div>

        {/* Informational Guidance Alert */}
        <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.06)', borderLeft: '4px solid #2563eb', fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={16} color="#2563eb" style={{ flexShrink: 0 }} />
          <span>
            <strong>Aturan Validasi:</strong> Standar berat box adalah <strong>5.00 kg/box</strong>. Output box riil <strong>tidak boleh melebihi berat akumulasi sistem</strong>. Jika jumlah box x berat box lebih kecil dari berat sistem, selisihnya menjadi <strong>Waste Crushing Loss</strong>.
          </span>
        </div>

        {/* Verification Items Table */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Memuat akumulasi data Part NG & Part Runner untuk tanggal & shift terpilih...
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <Layers size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#475569' }}>
              Tidak ada data input material <strong>Reuse</strong> pada Tanggal {date} (Shift {shift}).
            </p>
            <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
              Silahkan lakukan input Part NG atau Part Runner terlebih dahulu.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '0.65rem 0.85rem', width: '50px' }}>No</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Material (Reuse)</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Part NG (kg)</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Runner (kg)</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right', backgroundColor: '#e2e8f0' }}>Total Sistem (kg)</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', width: '130px' }}>Jumlah Box</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', width: '130px' }}>Kg per Box</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: '#008d51' }}>Actual Output (kg)</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: '#ef4444' }}>Waste Loss (kg)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const isExceeding = item.actual_output_kg > item.system_total_weight_kg;

                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: isExceeding ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '0.65rem 0.85rem', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Box size={16} color={isExceeding ? '#ef4444' : '#008d51'} />
                          <span>{item.material_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700 }}>
                        {item.system_ng_weight_kg.toFixed(2)} kg
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700, color: '#e76114' }}>
                        {item.system_runner_weight_kg.toFixed(2)} kg
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 900, backgroundColor: '#f8fafc', color: '#0f172a' }}>
                        {item.system_total_weight_kg.toFixed(2)} kg
                      </td>
                      <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          value={item.box_count}
                          onChange={(e) => {
                            const val = e.target.value;
                            onUpdateItem(idx, 'box_count', val === '' ? '' : Math.max(0, parseInt(val, 10)));
                          }}
                          style={{
                            width: '90px',
                            padding: '0.35rem 0.5rem',
                            borderRadius: '6px',
                            border: `2px solid ${isExceeding ? '#ef4444' : '#cbd5e1'}`,
                            textAlign: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: isExceeding ? '#ef4444' : '#0f172a',
                            backgroundColor: isExceeding ? '#fff5f5' : '#ffffff',
                            outline: 'none',
                            boxShadow: isExceeding ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                          }}
                        />
                      </td>
                      <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="5.00"
                          value={item.kg_per_box}
                          onChange={(e) => {
                            const val = e.target.value;
                            onUpdateItem(idx, 'kg_per_box', val === '' ? '' : parseFloat(val));
                          }}
                          style={{
                            width: '90px',
                            padding: '0.35rem 0.5rem',
                            borderRadius: '6px',
                            border: `2px solid ${isExceeding ? '#ef4444' : '#cbd5e1'}`,
                            textAlign: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: isExceeding ? '#ef4444' : '#0f172a',
                            backgroundColor: isExceeding ? '#fff5f5' : '#ffffff',
                            outline: 'none',
                            boxShadow: isExceeding ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                          }}
                        />
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 900, color: isExceeding ? '#ef4444' : '#008d51' }}>
                        {item.actual_output_kg.toFixed(2)} kg
                        {isExceeding && (
                          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#ef4444', marginTop: '0.15rem' }}>
                            *Melebihi berat sistem ({item.system_total_weight_kg.toFixed(2)} kg)
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 900, color: item.crushing_waste_kg > 0 ? '#ef4444' : '#64748b' }}>
                        {item.crushing_waste_kg.toFixed(2)} kg
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
              Catatan Opsional
            </label>
            <input
              type="text"
              placeholder="Contoh: Kondisi fisik material A dalam 5 box bersih, terdapat 5kg sisa limbah crushing..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={items.length === 0 || hasExceedingOutput}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: hasExceedingOutput ? '#ef4444' : '#64748b', fontWeight: hasExceedingOutput ? 800 : 400 }}>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={onSave}
              isLoading={isSaving}
              disabled={isLoading || items.length === 0 || hasExceedingOutput}
              leftIcon={<CheckCircle2 size={18} />}
              style={{
                fontWeight: 900,
                padding: '0.65rem 1.75rem',
                backgroundColor: items.length === 0 || hasExceedingOutput ? '#cbd5e1' : '#008d51',
                cursor: items.length === 0 || hasExceedingOutput ? 'not-allowed' : 'pointer',
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
