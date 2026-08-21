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
import type { SenderDailyChartItem } from '../types/dashboard.types';

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

  const safeData = (data || []).map((item) => {
    const pagiKg = Number(item.pagi_kg || 0);
    const malamKg = Number(item.malam_kg || 0);
    const grandTotal = Number(item.total_kg ?? (pagiKg + malamKg));

    return {
      ...item,
      pagi_kg: Number(pagiKg.toFixed(2)),
      malam_kg: Number(malamKg.toFixed(2)),
      total_kg: Number(grandTotal.toFixed(2)),
      pagi_pcs: Number(item.pagi_pcs || 0),
      malam_pcs: Number(item.malam_pcs || 0),
      total_pcs: Number(item.total_pcs || 0),
    };
  });

  const maxKg = safeData.length > 0 ? Math.max(...safeData.map((d) => d.total_kg || 0)) : 30;
  const yDomainMax = Math.ceil((maxKg > 0 ? maxKg : 30) * 1.35 + 5);

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#008d51', fontWeight: 800, marginBottom: '0.25rem' }}>
            <span>• Shift Pagi:</span>
            <span>{pagiKg.toFixed(2)} kg <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>({pagiPcs} pcs)</span></span>
          </div>

          {/* Shift Malam */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#e76114', fontWeight: 800, marginBottom: '0.35rem' }}>
            <span>• Shift Malam:</span>
            <span>{malamKg.toFixed(2)} kg <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>({malamPcs} pcs)</span></span>
          </div>

          {/* Grand Total */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.35rem', fontWeight: 900, display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>
            <span>Total Diterima:</span>
            <span style={{ color: 'var(--secondary-color, #e76114)' }}>{grandTotal.toFixed(2)} kg <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>({grandTotalPcs} pcs)</span></span>
          </div>
        </div>
      );
    }
    return null;
  };

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

      {/* Bar Chart Container */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '0.75rem 0.65rem 0.25rem 0rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          width: '100%',
          height: '220px',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={safeData} margin={{ top: 16, right: 8, left: -25, bottom: 0 }} barCategoryGap="16%">
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
              wrapperStyle={{ paddingTop: '4px', fontSize: '0.75rem', fontWeight: 800 }}
            />

            {/* 1. Shift Pagi (Green) */}
            <Bar
              dataKey="pagi_kg"
              name="Shift Pagi (kg)"
              stackId="senderStack"
              fill="#008d51"
            />

            {/* 2. Shift Malam (Orange) */}
            <Bar
              dataKey="malam_kg"
              name="Shift Malam (kg)"
              stackId="senderStack"
              fill="#e76114"
              radius={[3, 3, 0, 0]}
            />

            {/* Total Label List */}
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
