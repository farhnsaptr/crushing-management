import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { useIsNarrow } from '../../../hooks';
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
  MapPin,
} from 'lucide-react';
import type { VerificationDetailResponse, VerificationItem } from '../types/verification.types';

interface VerificationFormCardProps {
  date: string;
  setDate: (date: string) => void;
  shift: 'Pagi' | 'Malam';
  setShift: (shift: 'Pagi' | 'Malam') => void;
  locations: string[];
  location: string;
  setLocation: (location: string) => void;
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
  locations,
  location,
  setLocation,
  notes,
  setNotes,
  data,
  items,
  isLoading,
  isSaving,
  onUpdateItem,
  onSave,
}) => {
  const [containerRef, isNarrow] = useIsNarrow<HTMLDivElement>(768);

  const isValidated = data?.is_validated || false;
  // Verifikasi hanya bisa dilakukan bila sudah ada minimal satu transaksi reuse (has_input dari backend)
  const hasInput = data?.has_input ?? false;
  // Material campuran tanpa input sistem (berat sistem 0) ditampilkan di bagian terpisah; backend sudah mengurutkannya di akhir
  const firstNoSystemIdx = items.findIndex((it) => it.system_total_weight_kg === 0);
  const headerInfo = data?.header;

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Status & Filter Controls Banner */}
      <div
        style={{
          padding: isNarrow ? '1rem' : '1.15rem 1.35rem',
          borderRadius: '14px',
          backgroundColor: !hasInput
            ? '#f8fafc'
            : isValidated
              ? 'rgba(0, 141, 81, 0.08)'
              : 'rgba(231, 97, 20, 0.08)',
          border: `1.5px solid ${!hasInput ? '#cbd5e1' : isValidated ? '#008d51' : '#e76114'}`,
          display: 'flex',
          flexDirection: isNarrow ? 'column' : 'row',
          alignItems: isNarrow ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: !hasInput ? '#64748b' : isValidated ? '#008d51' : '#e76114',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: !hasInput ? 'none' : isValidated ? '0 4px 12px rgba(0, 141, 81, 0.25)' : '0 4px 12px rgba(231, 97, 20, 0.25)',
            }}
          >
            {!hasInput ? (
              <Info size={22} />
            ) : isValidated ? (
              <CheckCircle2 size={22} />
            ) : (
              <Scale size={22} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: isNarrow ? '0.95rem' : '1.05rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                Status: {!hasInput ? 'BELUM ADA INPUT' : isValidated ? 'SUDAH DIVALIDASI' : 'MENUNGGU HASIL TIMBANG'}
              </h3>
              <Badge variant={!hasInput ? 'neutral' : isValidated ? 'success' : 'warning'} size="sm">
                Tgl {date} — Shift {shift} — {location}
              </Badge>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: '0.25rem 0 0 0' }}>
              {!hasInput
                ? `Belum ada transaksi reuse pada Tanggal ${date} (Shift ${shift}).`
                : isValidated
                  ? `Validasi diselesaikan oleh ${headerInfo?.validated_by_name || 'Operator'} pada ${headerInfo?.validated_at ? new Date(headerInfo.validated_at).toLocaleString('id-ID') : '-'}`
                  : 'Timbang hasil akhir crushing per jenis material, lalu masukkan berat riil dalam kg.'}
            </p>
          </div>
        </div>

        {/* Date & Shift Quick Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            flexWrap: 'wrap',
            width: isNarrow ? '100%' : 'auto',
          }}
        >
          {/* Date Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: isNarrow ? 1 : 'none' }}>
            <Calendar size={16} color="var(--text-muted, #64748b)" style={{ flexShrink: 0 }} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: isNarrow ? '100%' : 'auto',
                padding: '0.45rem 0.65rem',
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

          {/* Lokasi Plant */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: isNarrow ? 1 : 'none' }}>
            <MapPin size={16} color="var(--text-muted, #64748b)" style={{ flexShrink: 0 }} />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                width: isNarrow ? '100%' : 'auto',
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: '#0f172a',
                outline: 'none',
              }}
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Button Toggle */}
          <div
            style={{
              display: 'flex',
              gap: '0.35rem',
              backgroundColor: '#ffffff',
              padding: '0.2rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              width: isNarrow ? '100%' : 'auto',
            }}
          >
            <button
              type="button"
              onClick={() => setShift('Pagi')}
              style={{
                flex: isNarrow ? 1 : 'none',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: shift === 'Pagi' ? '#008d51' : 'transparent',
                color: shift === 'Pagi' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Sun size={14} /> Pagi (D)
            </button>
            <button
              type="button"
              onClick={() => setShift('Malam')}
              style={{
                flex: isNarrow ? 1 : 'none',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: shift === 'Malam' ? '#e76114' : 'transparent',
                color: shift === 'Malam' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Moon size={14} /> Malam (N)
            </button>
          </div>
        </div>
      </div>

      {/* Main Validation Card */}
      <Card style={{ padding: isNarrow ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: isNarrow ? 'flex-start' : 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: isNarrow ? '1rem' : '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck size={20} color="#008d51" /> Form Input Hasil Crushing Aktual
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Masukkan total berat fisik (kg) yang diperoleh dari proses penggilingan pada shift ini.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Badge variant="secondary" size="md">
              {items.length} Jenis Material
            </Badge>
          </div>
        </div>

        {/* Verification Items View */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Memuat daftar material yang diproses pada tanggal & shift terpilih...
          </div>
        ) : !hasInput ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <Layers size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#475569' }}>
              Tidak ada material <strong>Reuse</strong> yang digiling pada Tanggal {date} (Shift {shift}).
            </p>
            <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
              Silahkan lakukan input Part NG atau Part Runner terlebih dahulu jika terdapat proses crushing.
            </p>
          </div>
        ) : isNarrow ? (
          /* Mobile Card View (< 768px) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {items.map((item, idx) => {
              const hasValue = item.actual_output_kg !== '' && typeof item.actual_output_kg === 'number' && item.actual_output_kg > 0;

              return (
                <React.Fragment key={idx}>
                  {idx === firstNoSystemIdx && (
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: '#64748b',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px dashed #cbd5e1',
                      }}
                    >
                      Material campuran lain (tanpa input sistem) — isi bila ada hasil crushing:
                    </div>
                  )}

                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: `1.5px solid ${hasValue ? 'var(--primary-color, #008d51)' : '#e2e8f0'}`,
                      backgroundColor: hasValue ? 'rgba(0, 141, 81, 0.03)' : '#ffffff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Top Row: Material & Status */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>#{idx + 1}</span>
                        <Box size={18} color="#008d51" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', wordBreak: 'break-word' }}>
                          {item.material_name}
                        </span>
                      </div>
                      <div>
                        {hasValue ? (
                          <Badge variant="success" size="sm">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Check size={12} />
                              <span>{Number(item.actual_output_kg).toFixed(2)} kg</span>
                            </div>
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            Belum Diisi
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Input Row: Full Width Touch Friendly */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        backgroundColor: '#f8fafc',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                        Hasil Timbang Aktual:
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
                            width: '120px',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '8px',
                            border: '2px solid var(--primary-color, #008d51)',
                            textAlign: 'right',
                            fontWeight: 900,
                            fontSize: '1.05rem',
                            color: '#0f172a',
                            backgroundColor: '#ffffff',
                            outline: 'none',
                          }}
                        />
                        <span style={{ fontWeight: 800, color: '#64748b', fontSize: '0.85rem' }}>kg</span>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          /* Desktop Table View (>= 768px) */
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
                    <React.Fragment key={idx}>
                      {idx === firstNoSystemIdx && (
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <td colSpan={4} style={{ padding: '0.55rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>
                            Material campuran lain (tanpa input sistem) — isi bila ada hasil crushing yang perlu dicatat
                          </td>
                        </tr>
                      )}
                      <tr
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
                    </React.Fragment>
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
              disabled={!hasInput}
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isNarrow ? 'stretch' : 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <Button
              type="button"
              variant="primary"
              onClick={onSave}
              isLoading={isSaving}
              disabled={isLoading || !hasInput}
              leftIcon={<CheckCircle2 size={18} />}
              style={{
                width: isNarrow ? '100%' : 'auto',
                fontWeight: 900,
                padding: '0.75rem 2rem',
                backgroundColor: !hasInput ? '#cbd5e1' : 'var(--primary-color, #008d51)',
                cursor: !hasInput ? 'not-allowed' : 'pointer',
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
