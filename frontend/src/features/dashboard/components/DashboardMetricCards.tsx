import React from 'react';
import type { DashboardSummaryStats } from '../types/dashboard.types';

interface DashboardMetricCardsProps {
  summary: DashboardSummaryStats | null;
  isLoading: boolean;
}

export const DashboardMetricCards: React.FC<DashboardMetricCardsProps> = ({ summary, isLoading }) => {
  const inputKg = summary?.input_kg ?? 0;
  const outputKg = summary?.output_kg ?? 0;
  const wasteKg = summary?.waste_kg ?? 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '0.85rem',
      }}
    >
      {/* Metric Card 1: Total Input */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '0.75rem 1.15rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block' }}>
          Total Input :
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginTop: '0.2rem' }}>
          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--primary-color, #0f172a)', lineHeight: 1 }}>
            {isLoading ? '--' : `${inputKg.toLocaleString('id-ID')} kg`}
          </span>
        </div>
      </div>

      {/* Metric Card 2: Total Output (Part Reuse) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '0.75rem 1.15rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block' }}>
            Total Output :
          </span>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
            Part Reuse
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginTop: '0.2rem' }}>
          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)', lineHeight: 1 }}>
            {isLoading ? '--' : `${outputKg.toLocaleString('id-ID')} kg`}
          </span>
        </div>
      </div>

      {/* Metric Card 3: Waste (Part No Reuse) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '0.75rem 1.15rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block' }}>
            Waste :
          </span>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
            Part No Reuse
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginTop: '0.2rem' }}>
          <span
            style={{
              fontSize: '1.45rem',
              fontWeight: 900,
              color: wasteKg > 0 ? '#ef4444' : '#10b981',
              lineHeight: 1,
            }}
          >
            {isLoading ? '--' : `${wasteKg.toLocaleString('id-ID')} kg`}
          </span>
        </div>
      </div>
    </div>
  );
};
