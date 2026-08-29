import React from 'react';
import { Card } from '../../../components/common/Card';
import { Table, TableProperties } from 'lucide-react';
import type { MonthlyComparisonItem } from '../types/analytics.types';

interface AnalyticsMonthlyGapTableProps {
  monthlyData: MonthlyComparisonItem[];
  year: number;
  isLoading?: boolean;
}

export const AnalyticsMonthlyGapTable: React.FC<AnalyticsMonthlyGapTableProps> = ({
  monthlyData,
  year,
  isLoading,
}) => {
  const monthHeaders = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  // Calculate annual totals
  const totalAllowance = monthlyData.reduce((acc, m) => acc + (m.allowance_kg || 0), 0);
  const totalInput = monthlyData.reduce((acc, m) => acc + (m.input_kg ?? (m.system_ng_kg + m.system_runner_kg) ?? 0), 0);
  const totalOutput = monthlyData.reduce((acc, m) => acc + (m.actual_output_kg || 0), 0);

  const totalGapNg = Number((totalAllowance - totalInput).toFixed(2));
  const totalGapCrushing = Number((totalInput - totalOutput).toFixed(2));

  return (
    <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Table size={20} color="#008d51" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Matriks Selisih Bulanan (Gap NG & Gap Crushing) - Tahun {year}
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Tabel rekapitulasi selisih Allowance vs Input (Gap NG) dan selisih Input vs Output (Gap Crushing) sepanjang 12 bulan.
          </p>
        </div>
      </div>

      {/* Matrix Table */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
          Memuat data matriks bulanan...
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th
                  style={{
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    fontWeight: 800,
                    color: '#1e293b',
                    minWidth: '220px',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#f8fafc',
                    zIndex: 10,
                    boxShadow: '2px 0 5px rgba(0,0,0,0.03)',
                  }}
                >
                  Indikator / Parameter
                </th>
                {monthHeaders.map((m, idx) => (
                  <th
                    key={idx}
                    style={{
                      padding: '0.85rem 0.65rem',
                      fontWeight: 800,
                      color: '#475569',
                      minWidth: '78px',
                    }}
                  >
                    {m}
                  </th>
                ))}
                <th
                  style={{
                    padding: '0.85rem 1rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    minWidth: '110px',
                    backgroundColor: '#f1f5f9',
                  }}
                >
                  Total Tahun
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Gap NG (Allowance - Input) */}
              <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}>
                <td
                  style={{
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    fontWeight: 800,
                    color: '#0f172a',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#ffffff',
                    zIndex: 5,
                    boxShadow: '2px 0 5px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 800 }}>Gap NG (Allowance - Input)</span>
                    <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 500 }}>
                      Allowance Produksi dikurangi Input NG & Runner Sistem
                    </span>
                  </div>
                </td>
                {monthlyData.map((item, idx) => {
                  const inputVal = item.input_kg ?? (item.system_ng_kg + item.system_runner_kg) ?? 0;
                  const gapNg = item.gap_ng_kg ?? Number((item.allowance_kg - inputVal).toFixed(2));
                  const isPlus = gapNg >= 0;
                  const isEmpty = item.allowance_kg === 0 && inputVal === 0;

                  return (
                    <td
                      key={idx}
                      style={{
                        padding: '0.85rem 0.65rem',
                        fontWeight: 800,
                        color: isEmpty ? '#94a3b8' : isPlus ? '#16a34a' : '#dc2626',
                        backgroundColor: isEmpty
                          ? 'transparent'
                          : isPlus
                          ? 'rgba(22, 163, 74, 0.04)'
                          : 'rgba(220, 38, 38, 0.04)',
                      }}
                    >
                      {isEmpty ? '-' : `${isPlus ? '+' : ''}${gapNg.toFixed(2)}`}
                    </td>
                  );
                })}
                <td
                  style={{
                    padding: '0.85rem 1rem',
                    fontWeight: 900,
                    backgroundColor: totalGapNg >= 0 ? 'rgba(22, 163, 74, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                    color: totalGapNg >= 0 ? '#16a34a' : '#dc2626',
                  }}
                >
                  {totalGapNg >= 0 ? `+${totalGapNg.toFixed(2)}` : totalGapNg.toFixed(2)} kg
                </td>
              </tr>

              {/* Row 2: Gap Crushing (Input - Output) */}
              <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}>
                <td
                  style={{
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    fontWeight: 800,
                    color: '#0f172a',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#ffffff',
                    zIndex: 5,
                    boxShadow: '2px 0 5px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 800 }}>Gap Crushing (Input - Output)</span>
                    <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 500 }}>
                      Input NG & Runner Sistem dikurangi Hasil Output Crushing
                    </span>
                  </div>
                </td>
                {monthlyData.map((item, idx) => {
                  const inputVal = item.input_kg ?? (item.system_ng_kg + item.system_runner_kg) ?? 0;
                  const gapCrushing = item.gap_crushing_kg ?? Number((inputVal - item.actual_output_kg).toFixed(2));
                  const isEmpty = inputVal === 0 && item.actual_output_kg === 0;

                  return (
                    <td
                      key={idx}
                      style={{
                        padding: '0.85rem 0.65rem',
                        fontWeight: 700,
                        color: isEmpty ? '#94a3b8' : '#334155', // Standard / neutral color as requested
                      }}
                    >
                      {isEmpty ? '-' : `${gapCrushing.toFixed(2)}`}
                    </td>
                  );
                })}
                <td
                  style={{
                    padding: '0.85rem 1rem',
                    fontWeight: 800,
                    color: '#1e293b',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  {totalGapCrushing.toFixed(2)} kg
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
