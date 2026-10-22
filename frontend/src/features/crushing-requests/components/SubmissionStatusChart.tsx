import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { BarChart3, Building2, Factory } from 'lucide-react';
import type { EvaluationGroupStat } from '../types/crushingRequests.types';

interface SubmissionStatusChartProps {
  departmentStats: EvaluationGroupStat[];
  factoryStats: EvaluationGroupStat[];
  isLoading?: boolean;
}

export const SubmissionStatusChart: React.FC<SubmissionStatusChartProps> = ({
  departmentStats = [],
  factoryStats = [],
  isLoading = false,
}) => {
  const [viewMode, setViewMode] = useState<'department' | 'factory'>('department');

  // Exclude 'Semua Factory' agar grafik per pabrik hanya menampilkan pabrik fisik aktual
  const filteredFactoryStats = factoryStats.filter(
    (f) => f.id !== 'all_factory' && !f.name.toLowerCase().includes('semua factory')
  );
  const currentData = viewMode === 'department' ? departmentStats : filteredFactoryStats;

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload as EvaluationGroupStat;
      return (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            padding: '0.75rem 0.95rem',
            boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.15)',
            fontSize: '0.8rem',
            minWidth: '200px',
          }}
        >
          <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.3rem' }}>
            {dataItem.name} {dataItem.code ? `(${dataItem.code})` : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d', fontWeight: 700 }}>
              <span>Sudah Mengirim:</span>
              <span>{dataItem.sudah_kirim} user</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c2410c', fontWeight: 700 }}>
              <span>Belum Mengirim:</span>
              <span>{dataItem.belum_kirim} user</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: 600, borderTop: '1px dashed #e2e8f0', paddingTop: '0.3rem', marginTop: '0.2rem' }}>
              <span>Total Pengirim:</span>
              <span>{dataItem.total_pengirim} user</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Top Header & View Filter Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Status Pengiriman: Sudah vs Belum Mengirim
            </h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
              Pantau status pengiriman pengajuan berdasarkan {viewMode === 'department' ? 'departemen' : 'pabrik'}
            </p>
          </div>
        </div>

        {/* View Switcher: Per Departemen vs Per Factory */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('department')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: viewMode === 'department' ? '#ffffff' : 'transparent',
              color: viewMode === 'department' ? '#0f172a' : '#64748b',
              fontWeight: viewMode === 'department' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: viewMode === 'department' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Building2 size={14} color={viewMode === 'department' ? '#2563eb' : '#64748b'} />
            <span>Per Departemen</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('factory')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: viewMode === 'factory' ? '#ffffff' : 'transparent',
              color: viewMode === 'factory' ? '#0f172a' : '#64748b',
              fontWeight: viewMode === 'factory' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: viewMode === 'factory' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Factory size={14} color={viewMode === 'factory' ? '#e76114' : '#64748b'} />
            <span>Per Factory</span>
          </button>
        </div>
      </div>

      {/* Chart Body */}
      {isLoading ? (
        <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
          Memuat grafik kepatuhan pengiriman...
        </div>
      ) : currentData.length === 0 ? (
        <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.85rem', flexDirection: 'column', gap: '0.35rem' }}>
          <span>Belum ada data {viewMode === 'department' ? 'departemen' : 'pabrik'} pada filter yang dipilih.</span>
        </div>
      ) : (
        <div style={{ width: '100%', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentData}
              margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                interval={0}
                tickFormatter={(val: string) => (val.length > 14 ? `${val.slice(0, 12)}…` : val)}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '0.75rem', fontWeight: 700 }}
              />
              <Bar
                dataKey="sudah_kirim"
                name="Sudah Mengirim"
                fill="#16a34a"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="belum_kirim"
                name="Belum Mengirim"
                fill="#e76114"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
