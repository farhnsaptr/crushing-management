import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { ShiftChartPoint } from '../types/dashboard.types';

const PLANNING_COLOR = '#2563eb';

interface ShiftLineChartProps {
  data: ShiftChartPoint[];
  /** Tinggi px; kosong = mengisi tinggi induk (induk harus punya tinggi: lihat .dash-chart-box). */
  height?: number;
  tooltip: React.ReactElement;
}

/**
 * Grafik garis harian (dengan shading gradasi): 2 garis (warna dari Site Configuration: --chart-shift-pagi / --chart-shift-malam).
 * Garis putus-putus "Planning Harian" hanya muncul jika data punya `planning_kg` (hari tanpa upload = null → garis terputus).
 */
export const ShiftLineChart: React.FC<ShiftLineChartProps> = ({ data, height, tooltip }) => (
  <div
    style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '0.75rem 0.65rem 0.25rem 0rem',
      border: '1.5px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
      width: '100%',
      height: height ? `${height}px` : '100%',
    }}
  >
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 16, right: 8, left: -25, bottom: 0 }}>
        <defs>
          {[['shiftPagi', 'var(--chart-shift-pagi)'], ['shiftMalam', 'var(--chart-shift-malam)']].map(([id, color]) => (
            <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

        <XAxis
          dataKey="day_num"
          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
          axisLine={{ stroke: '#cbd5e1' }}
          tickLine={false}
        />

        <YAxis
          domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2) || 10]}
          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
          axisLine={{ stroke: '#cbd5e1' }}
          tickLine={false}
        />

        <Tooltip content={tooltip} wrapperStyle={{ zIndex: 1000, outline: 'none' }} />

        <Legend
          verticalAlign="bottom"
          align="center"
          iconType="plainline"
          iconSize={14}
          wrapperStyle={{ paddingTop: '4px', fontSize: '0.75rem', fontWeight: 800 }}
        />

        <Area
          type="linear"
          dataKey="pagi_kg"
          name="Shift Pagi"
          stroke="var(--chart-shift-pagi)"
          fill="url(#shiftPagi)"
          strokeWidth={2.5}
          dot={{ r: 4.5, fill: 'var(--chart-shift-pagi)', stroke: '#ffffff', strokeWidth: 1.5 }}
          activeDot={{ r: 7 }}
        />

        <Area
          type="linear"
          dataKey="malam_kg"
          name="Shift Malam"
          stroke="var(--chart-shift-malam)"
          fill="url(#shiftMalam)"
          strokeWidth={2.5}
          dot={{ r: 4.5, fill: 'var(--chart-shift-malam)', stroke: '#ffffff', strokeWidth: 1.5 }}
          activeDot={{ r: 7 }}
        />

        {data.some((d) => d.planning_kg != null) && (
          <Area
            type="linear"
            dataKey="planning_kg"
            name="Planning Harian"
            stroke={PLANNING_COLOR}
            fill="none"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 2.5, fill: PLANNING_COLOR, stroke: PLANNING_COLOR }}
            activeDot={{ r: 5 }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
