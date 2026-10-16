import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { useAccuracyEvaluation } from '../hooks/useAccuracyEvaluation';
import { useIsNarrow } from '../../../hooks';
import {
  ArrowLeft,
  Calendar,
  Sun,
  Moon,
  MapPin,
  RefreshCw,
  Box,
  Layers,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const AccuracyEvaluationPage: React.FC = () => {
  const navigate = useNavigate();
  const [containerRef, isNarrow] = useIsNarrow<HTMLDivElement>(768);

  const {
    date,
    setDate,
    shift,
    setShift,
    location,
    setLocation,
    locations,
    items,
    totals,
    isValidated,
    hasInput,
    header,
    isLoading,
    error,
    refresh,
  } = useAccuracyEvaluation();

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2.5rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: isNarrow ? '1 1 100%' : 'none' }}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate('/verification')}
            leftIcon={<ArrowLeft size={16} />}
            title="Kembali ke Verifikasi Output"
          >
            {isNarrow ? '' : 'Kembali'}
          </Button>
          <h1 style={{ fontSize: isNarrow ? '1.1rem' : '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Evaluasi Akurasi Output Crushing
          </h1>
        </div>

        {/* Refresh Button */}
        <div style={{ marginLeft: isNarrow ? 'auto' : undefined }}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={refresh}
            isLoading={isLoading}
            leftIcon={<RefreshCw size={14} />}
          >
            Segarkan
          </Button>
        </div>
      </div>

      {/* Filter Bar: Tanggal, Shift, & Lokasi */}
      <Card
        style={{
          padding: isNarrow ? '0.75rem' : '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isNarrow ? '1fr 1fr' : 'auto auto auto',
            gap: '0.5rem',
            width: isNarrow ? '100%' : 'auto',
            alignItems: 'center',
          }}
        >
          {/* Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={15} color="#64748b" style={{ flexShrink: 0 }} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.45rem 0.5rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          {/* Plant Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={15} color="#64748b" style={{ flexShrink: 0 }} />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.45rem 0.5rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.8rem',
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

          {/* Shift Toggle Buttons */}
          <div
            style={{
              gridColumn: isNarrow ? '1 / -1' : 'auto',
              display: 'flex',
              gap: '0.35rem',
              backgroundColor: '#f8fafc',
              padding: '0.2rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              width: isNarrow ? '100%' : 'auto',
              boxSizing: 'border-box',
            }}
          >
            <button
              type="button"
              onClick={() => setShift('Pagi')}
              style={{
                flex: 1,
                padding: '0.4rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: shift === 'Pagi' ? '#008d51' : 'transparent',
                color: shift === 'Pagi' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Sun size={13} /> Pagi
            </button>
            <button
              type="button"
              onClick={() => setShift('Malam')}
              style={{
                flex: 1,
                padding: '0.4rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: shift === 'Malam' ? '#e76114' : 'transparent',
                color: shift === 'Malam' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Moon size={13} /> Malam
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ width: isNarrow ? '100%' : 'auto', display: 'flex', justifyContent: isNarrow ? 'flex-start' : 'flex-end' }}>
          {isValidated ? (
            <Badge variant="success" size={isNarrow ? 'sm' : 'md'}>
              <CheckCircle2 size={13} style={{ marginRight: '0.3rem' }} />
              Diverifikasi: {header?.validated_by_name || 'Operator'}
            </Badge>
          ) : hasInput ? (
            <Badge variant="warning" size={isNarrow ? 'sm' : 'md'}>
              <Clock size={13} style={{ marginRight: '0.3rem' }} />
              Menunggu Verifikasi Operator
            </Badge>
          ) : (
            <Badge variant="neutral" size={isNarrow ? 'sm' : 'md'}>
              Belum Ada Transaksi Input
            </Badge>
          )}
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.825rem', fontWeight: 700 }}>
          {error}
        </div>
      )}

      {/* Main Table Card */}
      <Card style={{ padding: isNarrow ? '0.85rem' : '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: isNarrow ? '0.95rem' : '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Tabel Komparasi Berat Material
          </h2>

          <Badge variant="secondary" size="sm">
            {items.length} Material
          </Badge>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
            Memuat perbandingan berat sistem dan verifikasi...
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <Layers size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#475569' }}>
              Tidak ada data material reuse pada tanggal {date} (Shift {shift}).
            </p>
            <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
              Silakan ganti pilihan tanggal, shift, atau lokasi untuk melihat data lainnya.
            </p>
          </div>
        ) : isNarrow ? (
          /* Mobile Card View (< 768px) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((item, idx) => {
              const hasVerified = item.verified_weight_kg !== null && item.verified_weight_kg > 0;
              const diff = item.difference_kg;

              return (
                <div
                  key={idx}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}
                >
                  {/* Top Row: Material Name & Index */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>#{idx + 1}</span>
                      <Box size={15} color="#008d51" style={{ flexShrink: 0 }} />
                      <strong style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.material_name}
                      </strong>
                    </div>
                    {hasVerified ? (
                      <Badge variant="success" size="sm">
                        Diverifikasi
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Belum Diisi
                      </Badge>
                    )}
                  </div>

                  {/* Comparison Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.35rem',
                      backgroundColor: '#f8fafc',
                      padding: '0.55rem 0.5rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      textAlign: 'center',
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>Sistem</span>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginTop: '0.1rem' }}>
                        {item.system_weight_kg.toFixed(2)} kg
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>Verifikasi</span>
                      <strong style={{ fontSize: '0.85rem', color: hasVerified ? '#008d51' : '#64748b', display: 'block', marginTop: '0.1rem' }}>
                        {hasVerified ? `${item.verified_weight_kg!.toFixed(2)} kg` : '-'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>Selisih</span>
                      <strong
                        style={{
                          fontSize: '0.85rem',
                          display: 'block',
                          marginTop: '0.1rem',
                          color: diff === null ? '#64748b' : diff > 0 ? '#2563eb' : diff < 0 ? '#ef4444' : '#008d51',
                        }}
                      >
                        {diff !== null ? `${diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} kg` : '-'}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Mobile Total Summary Card */}
            <div
              style={{
                marginTop: '0.25rem',
                padding: '0.85rem',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.78rem', color: '#0f172a', letterSpacing: '0.02em' }}>TOTAL KESELURUHAN</strong>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{items.length} Material</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', textAlign: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Total Sistem</span>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginTop: '0.1rem' }}>
                    {totals.totalSystemKg.toFixed(2)} kg
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Total Verifikasi</span>
                  <strong style={{ fontSize: '0.85rem', color: '#008d51', display: 'block', marginTop: '0.1rem' }}>
                    {totals.totalVerifiedKg > 0 ? `${totals.totalVerifiedKg.toFixed(2)} kg` : '-'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Total Selisih</span>
                  <strong
                    style={{
                      fontSize: '0.85rem',
                      display: 'block',
                      marginTop: '0.1rem',
                      color:
                        totals.totalDiffKg === null
                          ? '#64748b'
                          : totals.totalDiffKg > 0
                          ? '#2563eb'
                          : totals.totalDiffKg < 0
                          ? '#ef4444'
                          : '#008d51',
                    }}
                  >
                    {totals.totalDiffKg !== null
                      ? `${totals.totalDiffKg > 0 ? `+${totals.totalDiffKg.toFixed(2)}` : totals.totalDiffKg.toFixed(2)} kg`
                      : '-'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Table (>= 768px) */
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.85rem 1rem', width: '60px' }}>No</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Nama Material</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', width: '180px' }}>
                    Input Sistem (kg)
                  </th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', width: '200px' }}>
                    Output Verifikasi (kg)
                  </th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', width: '160px' }}>
                    Selisih (kg)
                  </th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '150px' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const hasVerified = item.verified_weight_kg !== null && item.verified_weight_kg > 0;
                  const diff = item.difference_kg;

                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Box size={18} color="#008d51" />
                          <span>{item.material_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                        {item.system_weight_kg.toFixed(2)} kg
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 900, color: hasVerified ? '#008d51' : '#64748b' }}>
                        {hasVerified ? `${item.verified_weight_kg!.toFixed(2)} kg` : '-'}
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 1rem',
                          textAlign: 'right',
                          fontWeight: 800,
                          color: diff === null ? '#64748b' : diff > 0 ? '#2563eb' : diff < 0 ? '#ef4444' : '#008d51',
                        }}
                      >
                        {diff !== null ? `${diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} kg` : '-'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        {hasVerified ? (
                          <Badge variant="success" size="sm">
                            Diverifikasi
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
              {items.length > 0 && (
                <tfoot>
                  <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #e2e8f0', fontWeight: 900 }}>
                    <td colSpan={2} style={{ padding: '0.85rem 1rem', color: '#0f172a' }}>
                      TOTAL
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#0f172a' }}>
                      {totals.totalSystemKg.toFixed(2)} kg
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#008d51' }}>
                      {totals.totalVerifiedKg > 0 ? `${totals.totalVerifiedKg.toFixed(2)} kg` : '-'}
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        textAlign: 'right',
                        color: totals.totalDiffKg === null ? '#64748b' : totals.totalDiffKg > 0 ? '#2563eb' : totals.totalDiffKg < 0 ? '#ef4444' : '#008d51',
                      }}
                    >
                      {totals.totalDiffKg !== null ? `${totals.totalDiffKg > 0 ? `+${totals.totalDiffKg.toFixed(2)}` : totals.totalDiffKg.toFixed(2)} kg` : '-'}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AccuracyEvaluationPage;
