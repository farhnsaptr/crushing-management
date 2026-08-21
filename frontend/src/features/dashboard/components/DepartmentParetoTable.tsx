import React from 'react';
import type { DepartmentParetoItem } from '../types/dashboard.types';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Network, Scale, Flame, ArrowUpRight } from 'lucide-react';

interface DepartmentParetoTableProps {
  data: DepartmentParetoItem[];
  isLoading?: boolean;
}

export const DepartmentParetoTable: React.FC<DepartmentParetoTableProps> = ({ data, isLoading }) => {
  return (
    <Card
      title="Pareto Departemen Pengirim Part NG Terbanyak"
      subtitle="Analisis peringkat departemen yang menyumbang volume NG part terbesar bulan ini"
    >
      {isLoading ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
          Memuat data ranking departemen...
        </div>
      ) : data.length === 0 ? (
        <div
          style={{
            padding: '2.5rem 1rem',
            textAlign: 'center',
            color: 'var(--text-muted, #64748b)',
            backgroundColor: 'var(--bg-main, #f8fafc)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px dashed var(--border-color, #cbd5e1)',
            fontSize: '0.85rem',
          }}
        >
          Belum ada data transaksi NG dari departemen pada periode ini.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--bg-main, #f1f5f9)',
                    textAlign: 'left',
                    color: 'var(--text-muted, #475569)',
                    borderBottom: '1px solid var(--border-color, #cbd5e1)',
                  }}
                >
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', width: '50px' }}>Rank</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Departemen</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Total Transaksi</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Jumlah Part (Pcs)</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Total Berat (kg)</th>
                  <th style={{ padding: '0.65rem 0.85rem', width: '180px' }}>Proporsi (%)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr
                    key={row.department_id}
                    style={{
                      borderBottom: '1px solid var(--border-color, #e2e8f0)',
                      backgroundColor: row.rank === 1 ? 'rgba(231, 97, 20, 0.03)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                      {row.rank === 1 ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            fontWeight: 900,
                            fontSize: '0.75rem',
                          }}
                        >
                          1
                        </span>
                      ) : row.rank === 2 ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--secondary-color, #e76114)',
                            color: '#ffffff',
                            fontWeight: 900,
                            fontSize: '0.75rem',
                          }}
                        >
                          2
                        </span>
                      ) : row.rank === 3 ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#eab308',
                            color: '#ffffff',
                            fontWeight: 900,
                            fontSize: '0.75rem',
                          }}
                        >
                          3
                        </span>
                      ) : (
                        <span style={{ fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>{row.rank}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Network size={16} color="var(--primary-color, #008d51)" />
                        <span style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                          {row.department_name}
                        </span>
                        <Badge variant="neutral" size="sm">
                          {row.department_code}
                        </Badge>
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: 'var(--text-muted, #64748b)' }}>
                      {row.total_transaksi} trx
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700 }}>
                      {row.total_pcs.toLocaleString('id-ID')} pcs
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                      {Number(row.total_kg).toFixed(2)} kg
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            flex: 1,
                            height: '8px',
                            backgroundColor: 'var(--bg-main, #e2e8f0)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, row.percentage)}%`,
                              height: '100%',
                              backgroundColor:
                                row.rank === 1
                                  ? '#ef4444'
                                  : row.rank === 2
                                  ? 'var(--secondary-color, #e76114)'
                                  : 'var(--primary-color, #008d51)',
                              borderRadius: '4px',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.775rem', fontWeight: 800, minWidth: '42px', textAlign: 'right' }}>
                          {row.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
};
