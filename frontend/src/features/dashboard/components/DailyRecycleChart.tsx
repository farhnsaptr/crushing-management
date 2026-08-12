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

  // Sanitize data array with robust fallback defaults so chart NEVER collapses or disappears
  const safeData = (data || []).map((item) => {
    const pagiRunner = Number(item.pagi_runner_kg || 0);
    const malamRunner = Number(item.malam_runner_kg || 0);

    // If pagi_ng_kg is not present, fall back to pagi_kg
    const pagiNg = Number(item.pagi_ng_kg ?? (item.pagi_runner_kg !== undefined ? (item.pagi_kg ? Math.max(0, item.pagi_kg - pagiRunner) : 0) : (item.pagi_kg || 0)));
    const malamNg = Number(item.malam_ng_kg ?? (item.malam_runner_kg !== undefined ? (item.malam_kg ? Math.max(0, item.malam_kg - malamRunner) : 0) : (item.malam_kg || 0)));

    const pagiTotal = Number(item.pagi_kg ?? (pagiNg + pagiRunner));
    const malamTotal = Number(item.malam_kg ?? (malamNg + malamRunner));
    const grandTotal = Number(item.total_kg ?? (pagiTotal + malamTotal));

    return {
      ...item,
      pagi_ng_kg: Number(pagiNg.toFixed(3)),
      pagi_runner_kg: Number(pagiRunner.toFixed(3)),
      malam_ng_kg: Number(malamNg.toFixed(3)),
      malam_runner_kg: Number(malamRunner.toFixed(3)),
      pagi_kg: Number(pagiTotal.toFixed(3)),
      malam_kg: Number(malamTotal.toFixed(3)),
      total_kg: Number(grandTotal.toFixed(3)),
    };
  });

  // Calculate maximum total_kg for yAxis domain scaling with top margin for bar labels
  const maxKg = safeData.length > 0 ? Math.max(...safeData.map((d) => d.total_kg || 0)) : 50;
  const yDomainMax = Math.ceil((maxKg > 0 ? maxKg : 50) * 1.35 + 10);

  // Custom Tooltip Popup Card
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const chartData: DailyRecycleChartItem = payload[0]?.payload || {};
      const pagiNg = Number(chartData.pagi_ng_kg || 0);
      const pagiRunner = Number(chartData.pagi_runner_kg || 0);
      const malamNg = Number(chartData.malam_ng_kg || 0);
      const malamRunner = Number(chartData.malam_runner_kg || 0);

      const pagiTotal = Number(chartData.pagi_kg || (pagiNg + pagiRunner));
      const malamTotal = Number(chartData.malam_kg || (malamNg + malamRunner));
      const grandTotal = Number(chartData.total_kg || (pagiTotal + malamTotal));

      return (
        <div
          style={{
            backgroundColor: '#ffffff',
            background: '#ffffff',
            opacity: 1,
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
            border: '1.5px solid #cbd5e1',
            color: '#0f172a',
            fontSize: '0.8rem',
            minWidth: '220px',
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '0.4rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>
            Tanggal {label} {monthLabel} {year}
          </div>

          {/* Shift Pagi Breakdown */}
          <div style={{ marginBottom: '0.4rem' }}>
            <div style={{ fontWeight: 800, color: '#008d51', marginBottom: '0.15rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Shift Pagi</span>
              <span>{pagiTotal.toFixed(3)} kg</span>
            </div>
            <div style={{ paddingLeft: '0.5rem', fontSize: '0.75rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• Part NG Pagi:</span>
                <strong>{pagiNg.toFixed(3)} kg</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• Part Runner Pagi:</span>
                <strong>{pagiRunner.toFixed(3)} kg</strong>
              </div>
            </div>
          </div>

          {/* Shift Malam Breakdown */}
          <div style={{ marginBottom: '0.4rem' }}>
            <div style={{ fontWeight: 800, color: '#e76114', marginBottom: '0.15rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Shift Malam</span>
              <span>{malamTotal.toFixed(3)} kg</span>
            </div>
            <div style={{ paddingLeft: '0.5rem', fontSize: '0.75rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• Part NG Malam:</span>
                <strong>{malamNg.toFixed(3)} kg</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• Part Runner Malam:</span>
                <strong>{malamRunner.toFixed(3)} kg</strong>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '0.35rem', borderTop: '1px solid #e2e8f0', fontWeight: 900, display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>
            <span>Total Akumulasi:</span>
            <span>{grandTotal.toFixed(3)} kg</span>
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
          {monthLabel} {year} — Part NG & Part Runner per Shift (kg)
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
          height: '210px',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={safeData} margin={{ top: 16, right: 8, left: -25, bottom: 0 }} barCategoryGap="14%">
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

            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ zIndex: 1000, opacity: 1, outline: 'none' }}
              contentStyle={{ backgroundColor: '#ffffff', background: '#ffffff', opacity: 1, border: 'none' }}
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="square"
              iconSize={10}
              wrapperStyle={{ paddingTop: '2px', fontSize: '0.725rem', fontWeight: 800 }}
            />

            {/* 1. NG Pagi (Bottom of Stack - Dark Green) */}
            <Bar
              dataKey="pagi_ng_kg"
              name="NG Pagi"
              stackId="a"
              fill="#008d51"
            />

            {/* 2. Runner Pagi (Light Green) */}
            <Bar
              dataKey="pagi_runner_kg"
              name="Runner Pagi"
              stackId="a"
              fill="#10b981"
            />

            {/* 3. NG Malam (Dark Orange) */}
            <Bar
              dataKey="malam_ng_kg"
              name="NG Malam"
              stackId="a"
              fill="#e76114"
            />

            {/* 4. Runner Malam (Top of Stack - Amber Orange) */}
            <Bar
              dataKey="malam_runner_kg"
              name="Runner Malam"
              stackId="a"
              fill="#f59e0b"
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
