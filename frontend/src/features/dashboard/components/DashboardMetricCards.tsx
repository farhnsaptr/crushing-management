import React from 'react';
import type { DashboardSummaryStats } from '../types/dashboard.types';

interface DashboardMetricCardsProps {
  summary: DashboardSummaryStats | null;
  isLoading: boolean;
}

interface MetricCardProps {
  label: string;
  badge: string;
  badgeColor: string;
  value: string;
  valueColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, badge, badgeColor, value, valueColor }) => (
  <div className="dash-kpi-card">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>{label}</span>
      <span
        style={{
          fontSize: '0.65rem',
          fontWeight: 800,
          color: badgeColor,
          backgroundColor: `color-mix(in srgb, ${badgeColor} 12%, transparent)`,
          padding: '0.1rem 0.35rem',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
        }}
      >
        {badge}
      </span>
    </div>
    <span className="dash-kpi-value" style={{ color: valueColor }}>
      {value}
    </span>
  </div>
);

export const DashboardMetricCards: React.FC<DashboardMetricCardsProps> = ({ summary, isLoading }) => {
  const scrapKg = summary?.scrap_kg ?? 0;
  const inputKg = summary?.input_kg ?? 0;
  const outputKg = summary?.output_kg ?? 0;
  const gapKg = summary?.gap_kg ?? 0;
  const fmt = (kg: number) => (isLoading ? '--' : `${kg.toLocaleString('id-ID')} kg`);

  return (
    <div className="dash-kpi">
      <MetricCard
        label="Material No-Reuse (Scrap) :"
        badge="No Reuse"
        badgeColor="#ef4444"
        value={fmt(scrapKg)}
        valueColor={scrapKg > 0 ? '#ef4444' : '#10b981'}
      />
      <MetricCard
        label="Input :"
        badge="Reuse NG + Runner"
        badgeColor="#10b981"
        value={fmt(inputKg)}
        valueColor="var(--primary-color, #0f172a)"
      />
      <MetricCard
        label="Output :"
        badge="Hasil Timbang"
        badgeColor="var(--secondary-color, #e76114)"
        value={fmt(outputKg)}
        valueColor="var(--secondary-color, #e76114)"
      />
      <MetricCard
        label="Gap :"
        badge="Selisih Timbang"
        badgeColor="#f59e0b"
        value={fmt(gapKg)}
        valueColor={gapKg === 0 ? '#10b981' : '#ef4444'}
      />
    </div>
  );
};
