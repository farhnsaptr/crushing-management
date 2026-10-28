import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { BarChart3, MoveHorizontal } from 'lucide-react';
import { useIsNarrow } from '../../../hooks';
import type { MonthlyComparisonItem } from '../types/analytics.types';

interface AnalyticsYearlyChartProps {
  monthlyData: MonthlyComparisonItem[];
  year: number;
  isLoading?: boolean;
}

export const AnalyticsYearlyChart: React.FC<AnalyticsYearlyChartProps> = ({
  monthlyData,
  year,
  isLoading,
}) => {
  const [containerRef, isNarrow] = useIsNarrow<HTMLDivElement>(768);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Find max value across allowance, input, and actual output for dynamic scaling of bars
  const maxValue = Math.max(
    ...monthlyData.map((d) => Math.max(d.allowance_kg || 0, d.input_kg || 0, d.actual_output_kg || 0)),
    10 // min ceiling
  );

  return (
    <Card ref={containerRef} style={{ padding: isNarrow ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      {/* Chart Header & Legend */}
      <div style={{ display: 'flex', alignItems: isNarrow ? 'flex-start' : 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} color="#008d51" />
            <h2 style={{ fontSize: isNarrow ? '1rem' : '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Grafik Komparasi Allowance vs Input vs Output ({year})
            </h2>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Allowance produksi, input sistem (Part NG & Runner), dan aktual output crushing per bulan.
          </p>
        </div>

        {/* 3-Series Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isNarrow ? '0.75rem' : '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: isNarrow ? '0.75rem' : '0.825rem', fontWeight: 700, color: '#475569' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#008d51', flexShrink: 0 }} />
            <span>Allowance</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: isNarrow ? '0.75rem' : '0.825rem', fontWeight: 700, color: '#475569' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#2563eb', flexShrink: 0 }} />
            <span>Input NG & Runner</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: isNarrow ? '0.75rem' : '0.825rem', fontWeight: 700, color: '#475569' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#e76114', flexShrink: 0 }} />
            <span>Aktual Output</span>
          </div>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      {isNarrow && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#008d51', fontWeight: 700, backgroundColor: 'rgba(0, 141, 81, 0.06)', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
          <MoveHorizontal size={14} />
          <span>Geser horizontal untuk melihat grafik 12 bulan secara lengkap</span>
        </div>
      )}

      {/* Chart Area */}
      {isLoading ? (
        <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          Memuat visualisasi komparasi tahunan...
        </div>
      ) : (
        <div
          className="no-scrollbar"
          style={{
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '0.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              position: 'relative',
              minWidth: isNarrow ? '680px' : '100%',
            }}
          >
            {/* Main Bars Grid (12 Months) */}
            <div
              style={{
                height: isNarrow ? '240px' : '300px',
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '0.5rem',
                alignItems: 'flex-end',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #e2e8f0',
                position: 'relative',
              }}
            >
              {/* Horizontal Grid lines (background) */}
              <div style={{ position: 'absolute', top: '0', left: 0, right: 0, borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />

              {monthlyData.map((item, idx) => {
                const allowanceHeightPct = maxValue > 0 ? (item.allowance_kg / maxValue) * 100 : 0;
                const inputHeightPct = maxValue > 0 ? ((item.input_kg || (item.system_ng_kg + item.system_runner_kg)) / maxValue) * 100 : 0;
                const outputHeightPct = maxValue > 0 ? (item.actual_output_kg / maxValue) * 100 : 0;
                const isHovered = hoveredIndex === idx;
                const inputVal = item.input_kg ?? (item.system_ng_kg + item.system_runner_kg);


                return (
                  <div
                    key={idx}
                    onMouseEnter={(e) => {
                      setHoveredIndex(idx);
                      setCursorPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseMove={(e) => {
                      setCursorPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      height: '100%',
                      position: 'relative',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      padding: '0.15rem',
                      backgroundColor: isHovered ? 'rgba(0, 141, 81, 0.04)' : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >

                    {/* Bars Container */}
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        gap: '2px',
                      }}
                    >
                      {/* Bar 1: Allowance Produksi */}
                      <div
                        style={{
                          width: '30%',
                          height: `${Math.max(allowanceHeightPct, 2)}%`,
                          backgroundColor: '#008d51',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease',
                          boxShadow: isHovered ? '0 0 6px rgba(0, 141, 81, 0.4)' : 'none',
                          opacity: item.allowance_kg === 0 ? 0.25 : 1,
                        }}
                        title={`Allowance: ${item.allowance_kg} kg`}
                      />

                      {/* Bar 2: Input Sistem */}
                      <div
                        style={{
                          width: '30%',
                          height: `${Math.max(inputHeightPct, 2)}%`,
                          backgroundColor: '#2563eb',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease',
                          boxShadow: isHovered ? '0 0 6px rgba(37, 99, 235, 0.4)' : 'none',
                          opacity: inputVal === 0 ? 0.25 : 1,
                        }}
                        title={`Input: ${inputVal} kg`}
                      />

                      {/* Bar 3: Actual Output */}
                      <div
                        style={{
                          width: '30%',
                          height: `${Math.max(outputHeightPct, 2)}%`,
                          backgroundColor: '#e76114',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease',
                          boxShadow: isHovered ? '0 0 6px rgba(231, 97, 20, 0.4)' : 'none',
                          opacity: item.actual_output_kg === 0 ? 0.25 : 1,
                        }}
                        title={`Output: ${item.actual_output_kg} kg`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Month Names Footer */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '0.5rem',
                textAlign: 'center',
              }}
            >
              {monthlyData.map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.775rem', fontWeight: 800, color: hoveredIndex === idx ? '#008d51' : '#64748b' }}>
                  {item.month_name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Cursor-Following Detail Card (Dashboard Theme) */}
      {hoveredIndex !== null && monthlyData[hoveredIndex] && (() => {
        const item = monthlyData[hoveredIndex];
        const inputVal = item.input_kg ?? (item.system_ng_kg + item.system_runner_kg);
        const gapNg = item.gap_ng_kg ?? Number((item.allowance_kg - inputVal).toFixed(2));
        const gapCrushing = item.gap_crushing_kg ?? Number((inputVal - item.actual_output_kg).toFixed(2));

        const tooltipWidth = 240;
        const tooltipHeight = 185;
        const left = cursorPos.x + 16 + tooltipWidth > window.innerWidth
          ? cursorPos.x - tooltipWidth - 12
          : cursorPos.x + 16;
        const top = cursorPos.y + 16 + tooltipHeight > window.innerHeight
          ? cursorPos.y - tooltipHeight - 12
          : cursorPos.y + 16;

        return (
          <div
            style={{
              position: 'fixed',
              left: `${left}px`,
              top: `${top}px`,
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
              border: '1.5px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.8rem',
              minWidth: `${tooltipWidth}px`,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: 900,
                marginBottom: '0.4rem',
                color: '#0f172a',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.25rem',
              }}
            >
              Bulan {item.month_name} {year}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#008d51' }} />
                  Allowance
                </span>
                <strong style={{ color: '#0f172a' }}>{item.allowance_kg.toLocaleString('id-ID')} kg</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#2563eb' }} />
                  Input Sistem
                </span>
                <strong style={{ color: '#0f172a' }}>{inputVal.toLocaleString('id-ID')} kg</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#e76114' }} />
                  Aktual Output
                </span>
                <strong style={{ color: '#0f172a' }}>{item.actual_output_kg.toLocaleString('id-ID')} kg</strong>
              </div>

              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '0.35rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Gap NG:</span>
                  <strong style={{ color: gapNg >= 0 ? '#059669' : '#dc2626' }}>
                    {gapNg > 0 ? `+${gapNg.toLocaleString('id-ID')}` : gapNg.toLocaleString('id-ID')} kg
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Gap Crushing:</span>
                  <strong style={{ color: gapCrushing >= 0 ? '#059669' : '#dc2626' }}>
                    {gapCrushing > 0 ? `+${gapCrushing.toLocaleString('id-ID')}` : gapCrushing.toLocaleString('id-ID')} kg
                  </strong>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </Card>
  );
};
