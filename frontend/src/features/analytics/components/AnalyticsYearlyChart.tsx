import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { BarChart3 } from 'lucide-react';
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Find max value across allowance, input, and actual output for dynamic scaling of bars
  const maxValue = Math.max(
    ...monthlyData.map((d) => Math.max(d.allowance_kg || 0, d.input_kg || 0, d.actual_output_kg || 0)),
    10 // min ceiling
  );

  return (
    <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      {/* Chart Header & Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} color="#008d51" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Grafik Komparasi Allowance vs Input vs Output (Tahun {year})
            </h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Perbandingan total allowance produksi, total input sistem (Part NG & Runner), dan aktual output timbangan crushing per bulan.
          </p>
        </div>

        {/* 3-Series Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', fontWeight: 700, color: '#475569' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#008d51' }} />
            <span>Allowance Produksi (kg)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', fontWeight: 700, color: '#475569' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#2563eb' }} />
            <span>Input NG & Runner (kg)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', fontWeight: 700, color: '#475569' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#e76114' }} />
            <span>Aktual Output Crushing (kg)</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      {isLoading ? (
        <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          Memuat visualisasi komparasi tahunan...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
          {/* Main Bars Grid (12 Months) */}
          <div
            style={{
              height: '300px',
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
              const gapNg = item.gap_ng_kg ?? Number((item.allowance_kg - inputVal).toFixed(2));
              const gapCrushing = item.gap_crushing_kg ?? Number((inputVal - item.actual_output_kg).toFixed(2));

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
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
                  {/* Tooltip Popup on Hover */}
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '105%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        zIndex: 30,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        pointerEvents: 'none',
                      }}
                    >
                      <div style={{ fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.35rem', marginBottom: '0.45rem' }}>
                        Bulan {item.month_name} {year}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ color: '#86efac' }}>
                          1. Allowance: <strong>{item.allowance_kg.toFixed(2)} kg</strong>
                        </div>
                        <div style={{ color: '#93c5fd' }}>
                          2. Input (NG+Runner): <strong>{inputVal.toFixed(2)} kg</strong>
                        </div>
                        <div style={{ color: '#fdba74' }}>
                          3. Output Crushing: <strong>{item.actual_output_kg.toFixed(2)} kg</strong>
                        </div>
                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                          <div style={{ color: gapNg >= 0 ? '#4ade80' : '#f87171', fontWeight: 800 }}>
                            Gap NG (Allw - In): {gapNg >= 0 ? `+${gapNg.toFixed(2)}` : gapNg.toFixed(2)} kg
                          </div>
                          <div style={{ color: '#e2e8f0', fontWeight: 700, marginTop: '0.15rem' }}>
                            Gap Crushing (In - Out): {gapCrushing.toFixed(2)} kg
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3-Bars Container */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', width: '100%', height: '100%', justifyContent: 'center' }}>
                    {/* Bar 1: Allowance */}
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
      )}
    </Card>
  );
};
