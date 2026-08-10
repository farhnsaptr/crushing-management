import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts';
import type { DailyRecycleChartItem } from '../types/dashboard.types';

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

  // Calculate maximum total_kg for yAxis domain scaling with top margin for bar labels
  const maxKg = data.length > 0 ? Math.max(...data.map((d) => d.total_kg || 0)) : 50;
  const yDomainMax = Math.ceil((maxKg || 50) * 1.35 + 10);

  // Custom Tooltip Popup Card
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pagiVal = payload.find((p: any) => p.dataKey === 'pagi_kg')?.value || 0;
      const malamVal = payload.find((p: any) => p.dataKey === 'malam_kg')?.value || 0;

      return (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '0.6rem 0.9rem',
            boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.18)',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
            fontSize: '0.8rem',
            minWidth: '135px',
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '0.25rem', color: '#0f172a' }}>
            {label}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              fontWeight: 800,
              color: 'var(--primary-color, #0f172a)',
              marginBottom: '0.15rem',
            }}
          >
            <span>Shift Pagi :</span>
            <span>{pagiVal}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              fontWeight: 800,
              color: 'var(--secondary-color, #e76114)',
            }}
          >
            <span>Shift Malam :</span>
            <span>{malamVal}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Bar Label Renderer to GUARANTEE 100% of bars display total_kg above bar
  const renderCustomBarLabel = (props: any) => {
    const { x, y, value } = props;
    if (value === undefined || value === null || Number(value) === 0) return null;
    return (
      <text
        x={x}
        y={y - 5}
        fill="#0f172a"
        textAnchor="middle"
        fontSize={10}
        fontWeight={900}
      >
        {value}
      </text>
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
          {monthLabel} {year} — kg per shift
        </span>
      </div>

      {/* Full-Width Edge-to-Edge Composed Stacked Bar Chart Container */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '0.65rem 0.5rem 0.2rem 0rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          width: '100%',
          height: '195px',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 8, left: -25, bottom: 0 }} barCategoryGap="14%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="day_num"
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />

            <YAxis
              domain={[0, yDomainMax]}
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="square"
              iconSize={10}
              wrapperStyle={{ paddingTop: '2px', fontSize: '0.75rem', fontWeight: 800 }}
            />

            {/* Bottom Bar: Shift Pagi (Site Config Primary Color) */}
            <Bar
              dataKey="pagi_kg"
              name="Shift Pagi"
              stackId="a"
              fill="var(--primary-color, #0f172a)"
              radius={[0, 0, 0, 0]}
            />

            {/* Top Bar: Shift Malam (Site Config Secondary Color) */}
            <Bar
              dataKey="malam_kg"
              name="Shift Malam"
              stackId="a"
              fill="var(--secondary-color, #e76114)"
              radius={[3, 3, 0, 0]}
            />

            {/* Invisible Line Overlay ensuring 100% of bars display total_kg above bar */}
            <Line
              type="monotone"
              dataKey="total_kg"
              stroke="none"
              legendType="none"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            >
              <LabelList dataKey="total_kg" content={renderCustomBarLabel} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
