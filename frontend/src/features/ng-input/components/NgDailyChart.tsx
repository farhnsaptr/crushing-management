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
import type { DailyShiftChartItem } from '../types/ngInput.types';

interface NgDailyChartProps {
  data: DailyShiftChartItem[];
  allowanceKg: number;
}

export const NgDailyChart: React.FC<NgDailyChartProps> = ({ data, allowanceKg }) => {
  // Calculate max values to ensure Y-axis domain always includes the allowance line cleanly
  const maxDataKg = data.length > 0
    ? Math.max(...data.map((d) => (Number(d.pagi_kg) || 0) + (Number(d.malam_kg) || 0)), 0)
    : 0;
  const targetMax = Math.max(maxDataKg, allowanceKg > 0 ? allowanceKg : 0);
  const yDomainMax = Math.ceil(targetMax > 0 ? targetMax * 1.2 : 10);

  return (
    <div style={{ width: '100%', height: '300px', marginTop: '0.75rem', marginBottom: '1.25rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #e2e8f0)" />
          <XAxis
            dataKey="day"
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--text-muted, #64748b)' }}
            dy={6}
          />
          <YAxis
            domain={[0, yDomainMax]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--text-muted, #64748b)' }}
            unit=" kg"
          />
          <Tooltip
            formatter={(value: any, name: any, item: any) => {
              const dataKey = item?.dataKey || '';
              const isPagi = dataKey === 'pagi_kg' || name === 'Pagi';
              return [`${Number(value).toFixed(2)} Kg`, isPagi ? 'Shift Pagi' : 'Shift Malam'];
            }}
            labelFormatter={(label: any) => `Tanggal ${label}`}
            contentStyle={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderColor: 'var(--border-color, #cbd5e1)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: '0.85rem',
            }}
          />
          <Legend
            verticalAlign="top"
            align="center"
            wrapperStyle={{ paddingBottom: '12px' }}
            formatter={(value: any) => {
              const label = value === 'pagi_kg' || value === 'Pagi' ? 'Pagi' : value === 'malam_kg' || value === 'Malam' ? 'Malam' : value;
              return <span style={{ color: 'var(--text-main, #1e293b)', fontWeight: 600, fontSize: '0.85rem' }}>{label}</span>;
            }}
          />

          {/* Stacked Bars for Shift Pagi (Blue) & Shift Malam (Purple) */}
          <Bar dataKey="pagi_kg" name="Pagi" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
          <Bar dataKey="malam_kg" name="Malam" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />

          {/* Red Dashed Allowance Threshold Line (Always shown if allowanceKg > 0) */}
          {allowanceKg > 0 && (
            <ReferenceLine
              y={allowanceKg}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: `Allowance (${allowanceKg} Kg)`,
                position: 'top',
                fill: '#ef4444',
                fontSize: 11,
                fontWeight: 700,
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
