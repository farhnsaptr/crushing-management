import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { BudomariDailyItem } from '../types/dashboard.types';

interface BudomariChartProps {
  data: BudomariDailyItem[];
  monthlyAvg: number | null;
  monthlyMin?: number | null;
  monthlyMax?: number | null;
  isLoading: boolean;
  monthLabel?: string;
  year?: number;
}

const BUDOMARI_COLOR = '#059669';
const REF_LINE_COLOR = '#d97706';

export const BudomariChart: React.FC<BudomariChartProps> = ({
  data,
  monthlyAvg,
  monthlyMin,
  monthlyMax,
  isLoading,
  monthLabel = 'Bulan',
  year = 2026,
}) => {
  if (isLoading) {
    return (
      <div className="dash-chart">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
            KPI Budomari Material
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>
            {monthLabel} {year} — Efisiensi Material (%)
          </span>
        </div>
        <div className="dash-chart-box">
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.85rem',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Memuat grafik KPI Budomari Material...
          </div>
        </div>
      </div>
    );
  }

  const hasData = data && data.some((d) => d.avg_budomari_pct != null);

  // Custom Tooltip Popup Card
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const d: BudomariDailyItem = payload[0].payload;
    if (d.avg_budomari_pct == null) return null;

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
          minWidth: '220px',
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
          Tanggal {label} {monthLabel} {year}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#475569', fontWeight: 600 }}>Rata-rata:</span>
            <strong style={{ color: BUDOMARI_COLOR, fontSize: '0.95rem' }}>
              {Number(d.avg_budomari_pct).toFixed(1)}%
            </strong>
          </div>

          {d.min_budomari_pct != null && d.max_budomari_pct != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
              <span style={{ color: '#64748b' }}>Rentang Min - Max:</span>
              <span style={{ fontWeight: 700, color: '#334155' }}>
                {Number(d.min_budomari_pct).toFixed(1)}% - {Number(d.max_budomari_pct).toFixed(1)}%
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
            <span style={{ color: '#64748b' }}>Total Part:</span>
            <span style={{ fontWeight: 700, color: '#334155' }}>{d.total_parts} part</span>
          </div>

          {monthlyAvg != null && (
            <div
              style={{
                marginTop: '0.25rem',
                paddingTop: '0.25rem',
                borderTop: '1px dashed #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                color: '#64748b',
              }}
            >
              <span>Ref. Rata-rata Bulan:</span>
              <strong style={{ color: REF_LINE_COLOR }}>{monthlyAvg.toFixed(1)}%</strong>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dash-chart">
      {/* Header & Sub-header di luar card */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
          KPI Budomari Material
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>
          {monthLabel} {year} — Efisiensi Material (%)
          {monthlyAvg != null ? ` • Rata-rata: ${monthlyAvg.toFixed(1)}%` : ''}
          {monthlyMin != null && monthlyMax != null ? ` (Min: ${monthlyMin.toFixed(1)}% | Max: ${monthlyMax.toFixed(1)}%)` : ''}
        </span>
      </div>

      {/* Box kartu chart */}
      <div className="dash-chart-box">
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '0.75rem 0.65rem 0.25rem 0rem',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            width: '100%',
            height: '100%',
          }}
        >
          {!hasData ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '1rem',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.4rem',
                  color: '#64748b',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.8rem', color: '#334155' }}>
                Belum ada data Budomari Material untuk {monthLabel} {year}
              </p>
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                Data terisi otomatis saat mengupload file laporan produksi (MIS) di menu Data Analitik.
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 16, right: 8, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

                <XAxis
                  dataKey="day_num"
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />

                <YAxis
                  domain={[
                    (dataMin: number) => {
                      if (!dataMin || isNaN(dataMin)) return 60;
                      return Math.max(0, Math.floor((dataMin - 2) / 5) * 5);
                    },
                    100,
                  ]}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  tickFormatter={(val: number) => `${val}%`}
                />

                <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000, outline: 'none' }} />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="rect"
                  iconSize={12}
                  wrapperStyle={{ paddingTop: '4px', fontSize: '0.75rem', fontWeight: 800 }}
                />

                {monthlyAvg != null && (
                  <ReferenceLine
                    y={monthlyAvg}
                    stroke={REF_LINE_COLOR}
                    strokeDasharray="6 4"
                    strokeWidth={1.8}
                    label={{
                      value: `Rata-rata: ${monthlyAvg.toFixed(1)}%`,
                      position: 'insideTopRight',
                      fill: REF_LINE_COLOR,
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  />
                )}

                <Bar
                  dataKey="avg_budomari_pct"
                  name="Budomari Material (%)"
                  fill={BUDOMARI_COLOR}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
