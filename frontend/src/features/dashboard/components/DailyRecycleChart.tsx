import React from 'react';
import type { DailyRecycleChartItem } from '../types/dashboard.types';
import { ShiftLineChart } from './ShiftLineChart';

interface DailyRecycleChartProps {
  data: DailyRecycleChartItem[];
  isLoading: boolean;
  monthLabel?: string;
  year?: number;
}

export const DailyRecycleChart: React.FC<DailyRecycleChartProps> = ({
  data,
  isLoading,
  monthLabel = 'Juli',
  year = 2026,
}) => {
  if (isLoading) {
    return (
      <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
        Memuat grafik tren daur ulang harian...
      </div>
    );
  }

  // Custom Tooltip Popup Card (semua angka sudah dihitung backend)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const d: DailyRecycleChartItem = payload[0].payload;

    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
          border: '1.5px solid #cbd5e1',
          color: '#0f172a',
          fontSize: '0.8rem',
          minWidth: '230px',
        }}
      >
        <div style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '0.4rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>
          Tanggal {label} {monthLabel} {year}
        </div>

        {/* Shift Pagi Breakdown */}
        <div style={{ marginBottom: '0.4rem' }}>
          <div style={{ fontWeight: 800, color: 'var(--primary-color)', marginBottom: '0.15rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Shift Pagi</span>
            <span>{Number(d.pagi_kg).toFixed(2)} kg</span>
          </div>
          <div style={{ paddingLeft: '0.5rem', fontSize: '0.75rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>• Part NG Pagi:</span>
              <strong>{Number(d.pagi_ng_kg ?? 0).toFixed(2)} kg</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>• Part Runner Pagi:</span>
              <strong>{Number(d.pagi_runner_kg ?? 0).toFixed(2)} kg</strong>
            </div>
          </div>
        </div>

        {/* Shift Malam Breakdown */}
        <div style={{ marginBottom: '0.4rem' }}>
          <div style={{ fontWeight: 800, color: 'var(--secondary-color)', marginBottom: '0.15rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Shift Malam</span>
            <span>{Number(d.malam_kg).toFixed(2)} kg</span>
          </div>
          <div style={{ paddingLeft: '0.5rem', fontSize: '0.75rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>• Part NG Malam:</span>
              <strong>{Number(d.malam_ng_kg ?? 0).toFixed(2)} kg</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>• Part Runner Malam:</span>
              <strong>{Number(d.malam_runner_kg ?? 0).toFixed(2)} kg</strong>
            </div>
          </div>
        </div>

        {/* Summary Section: Total Input, Total Output, Total Waste */}
        <div
          style={{
            paddingTop: '0.45rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>
            <span>Total Input:</span>
            <span style={{ fontWeight: 900 }}>{Number(d.total_kg).toFixed(2)} kg</span>
          </div>
          <div style={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
            <span>Total Output:</span>
            <span style={{ fontWeight: 900 }}>{Number(d.total_output_kg ?? 0).toFixed(2)} kg</span>
          </div>
          <div style={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
            <span>Total Waste:</span>
            <span style={{ fontWeight: 900 }}>{Number(d.total_waste_kg ?? 0).toFixed(2)} kg</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', width: '100%' }}>
      {/* Header & Sub-header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
          Daily Data Recycle Material
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>
          {monthLabel} {year} — Total Part NG & Runner per Shift (kg)
        </span>
      </div>

      <ShiftLineChart data={data || []} height={210} tooltip={<CustomTooltip />} />
    </div>
  );
};
