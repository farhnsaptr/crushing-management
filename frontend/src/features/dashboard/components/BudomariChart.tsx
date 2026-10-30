import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts';
import type { BudomariBreakdown, BudomariDailyItem, BudomariPartDetail } from '../types/dashboard.types';
import { BudomariDetailModal } from './BudomariDetailModal';

interface BudomariChartProps {
 data: BudomariDailyItem[];
 monthlyBreakdown: BudomariBreakdown | null;
 partDetails?: BudomariPartDetail[];
 isLoading: boolean;
 monthLabel?: string;
 month: number;
 year?: number;
}

const SERIES = [
 { key: 'ok_use_pct', name: 'OK Use', color: '#059669' },
 { key: 'ng_loss_pct', name: 'NG Loss', color: '#dc2626' },
 { key: 'runner_pct', name: 'Runner', color: '#2563eb' },
 { key: 'dango_pct', name: 'Dango', color: '#d97706' },
 { key: 'dango_part_pct', name: 'Dango Part', color: '#7c3aed' },
] as const;

interface BudomariTooltipProps {
 active?: boolean;
 payload?: Array<{ payload: BudomariDailyItem }>;
 monthLabel: string;
 year: number;
}

const BudomariTooltip: React.FC<BudomariTooltipProps> = ({ active, payload, monthLabel, year }) => {
 if (!active || !payload || !payload.length) return null;

 const d = payload[0].payload;
 if (d.ok_use_pct == null) return null;

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
 Tanggal {d.day} {monthLabel} {year}
 </div>

 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
 {SERIES.map((series) => (
 <div key={series.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontWeight: 600 }}>
 <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: series.color }} />
 {series.name}
 </span>
 <strong style={{ color: '#0f172a' }}>{Number(d[series.key] ?? 0).toFixed(2)}%</strong>
 </div>
 ))}

 <div style={{ marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
 <span>Total</span>
 <strong style={{ color: '#0f172a' }}>100%</strong>
 </div>

 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
 <span>Jumlah Part</span>
 <strong style={{ color: '#0f172a' }}>{d.total_parts} part</strong>
 </div>
 </div>
 </div>
 );
};

const renderBarLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value == null) return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;

  // Hanya tampilkan jika irisan bar cukup tinggi agar tidak tumpang tindih
  if (height < 9 || num < 0.8) return null;

  const text = `${num.toFixed(1)}%`;
  const isCompact = height < 14;

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#ffffff"
      fontSize={isCompact ? 7.5 : 9}
      fontWeight={800}
      style={{
        pointerEvents: 'none',
        textShadow: '0 1px 2px rgba(0,0,0,0.85), 0 0 1px rgba(0,0,0,0.85)',
      }}
    >
      {text}
    </text>
  );
};

export const BudomariChart: React.FC<BudomariChartProps> = ({
 data,
 monthlyBreakdown,
 partDetails = [],
 isLoading,
 monthLabel = 'Bulan',
 month,
 year = 2026,
}) => {
 const [isDetailOpen, setIsDetailOpen] = useState(false);

 if (isLoading) {
 return (
 <div className="dash-chart dash-chart-budomari">
 <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
 <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
 KPI Budomari Material
 </h3>
 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>
 {monthLabel} {year} — Komposisi 100%
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

 const hasData = data && data.some((d) => d.ok_use_pct != null);

 return (
 <div className="dash-chart dash-chart-budomari">
 <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
 <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
 KPI Budomari Material
 </h3>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>
 {monthLabel} {year} — Komposisi 100%
 </span>
 <button
 type="button"
 onClick={() => setIsDetailOpen(true)}
 style={{
 background: 'none',
 border: 'none',
 padding: 0,
 font: 'inherit',
 fontSize: '0.75rem',
 fontWeight: 800,
 color: 'var(--secondary-color, #e76114)',
 cursor: 'pointer',
 textDecoration: 'underline',
 }}
 >
 Detail
 </button>
 </div>
 </div>

 {monthlyBreakdown && (
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.72rem', color: '#475569', fontWeight: 700 }}>
 <span style={{ color: '#64748b' }}>Rata-rata bulan:</span>
 {SERIES.map((series) => (
 <span key={series.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
 <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: series.color }} />
 {series.name} {Number(monthlyBreakdown[series.key]).toFixed(1)}%
 </span>
 ))}
 </div>
 )}

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
 Data terisi otomatis saat sinkronisasi Crusing API.
 </span>
 </div>
 ) : (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={data} margin={{ top: 14, right: 10, left: -10, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

 <XAxis
 dataKey="day_num"
 tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
 axisLine={{ stroke: '#cbd5e1' }}
 tickLine={false}
 />

 <YAxis
 domain={[50, 100]}
 allowDataOverflow={true}
 ticks={[50, 60, 70, 80, 90, 100]}
 width={42}
 tick={{ fontSize: 10.5, fill: '#64748b', fontWeight: 700 }}
 axisLine={{ stroke: '#cbd5e1' }}
 tickLine={false}
 tickFormatter={(val: number) => `${val}%`}
 />

 <Tooltip content={<BudomariTooltip monthLabel={monthLabel} year={year} />} wrapperStyle={{ zIndex: 1000, outline: 'none' }} />

 <Legend
 verticalAlign="bottom"
 align="center"
 iconType="rect"
 iconSize={12}
 wrapperStyle={{ paddingTop: '8px', fontSize: '0.75rem', fontWeight: 800 }}
 />

 {SERIES.map((series, index) => (
 <Bar
 key={series.key}
 dataKey={series.key}
 name={series.name}
 stackId="budomari"
 fill={series.color}
 maxBarSize={28}
 radius={index === SERIES.length - 1 ? [4, 4, 0, 0] : undefined}
 >
 <LabelList
 dataKey={series.key}
 content={renderBarLabel}
 />
 </Bar>
 ))}
 </BarChart>
 </ResponsiveContainer>
 )}
 </div>
 </div>

 <BudomariDetailModal
 isOpen={isDetailOpen}
 onClose={() => setIsDetailOpen(false)}
 data={data}
 monthlyBreakdown={monthlyBreakdown}
 partDetails={partDetails}
 monthLabel={monthLabel}
 month={month}
 year={year}
 />
 </div>
 );
};
