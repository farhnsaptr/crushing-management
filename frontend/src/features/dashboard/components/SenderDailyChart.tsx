import React from 'react';
import type { SenderDailyChartItem } from '../types/dashboard.types';
import { ShiftLineChart } from './ShiftLineChart';

interface SenderDailyChartProps {
  data: SenderDailyChartItem[];
  isLoading: boolean;
  departmentName?: string;
  monthLabel?: string;
  year?: number;
}

export const SenderDailyChart: React.FC<SenderDailyChartProps> = ({
  data,
  isLoading,
  departmentName = 'Departemen',
  monthLabel = 'Bulan Ini',
  year = new Date().getFullYear(),
}) => {
  if (isLoading) {
    return (
      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontWeight: 600, fontSize: '0.85rem' }}>
        Memuat grafik tren pengiriman harian departemen...
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const chartData: SenderDailyChartItem = payload[0]?.payload || {};
      const pagiKg = Number(chartData.pagi_kg || 0);
      const malamKg = Number(chartData.malam_kg || 0);
      const grandTotal = Number(chartData.total_kg || (pagiKg + malamKg));
      const pagiPcs = Number(chartData.pagi_pcs || 0);
      const malamPcs = Number(chartData.malam_pcs || 0);
      const grandTotalPcs = Number(chartData.total_pcs || (pagiPcs + malamPcs));

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
          <div style={{ fontSize: '0.875rem', fontWeight: 900, marginBottom: '0.4rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>
            Tanggal {label} {monthLabel} {year}
          </div>

          {/* Shift Pagi */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--primary-color)', fontWeight: 800, marginBottom: '0.25rem' }}>
            <span>• Shift Pagi:</span>
            <span>{pagiKg.toFixed(2)} kg <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>({pagiPcs} pcs)</span></span>
          </div>

          {/* Shift Malam */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--secondary-color)', fontWeight: 800, marginBottom: '0.35rem' }}>
            <span>• Shift Malam:</span>
            <span>{malamKg.toFixed(2)} kg <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>({malamPcs} pcs)</span></span>
          </div>

          {/* Grand Total */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.35rem', fontWeight: 900, display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>
            <span>Total Diterima:</span>
            <span style={{ color: 'var(--secondary-color)' }}>{grandTotal.toFixed(2)} kg <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>({grandTotalPcs} pcs)</span></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      {/* Header & Sub-header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
          Daily Part NG — {departmentName}
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>
          {monthLabel} {year} — Akumulasi Part NG per Shift (kg)
        </span>
      </div>

      <ShiftLineChart data={data || []} height={220} tooltip={<CustomTooltip />} />
    </div>
  );
};
