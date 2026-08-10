import React from 'react';
import type { TopNgPartItem } from '../types/dashboard.types';

interface TopNgPartsTableProps {
  data: TopNgPartItem[];
  isLoading: boolean;
}

export const TopNgPartsTable: React.FC<TopNgPartsTableProps> = ({ data, isLoading }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', width: '100%', height: '100%' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
        Part NG Terbanyak
      </h3>

      <div
        className="no-scrollbar"
        style={{
          overflowY: 'auto',
          maxHeight: '195px',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          backgroundColor: '#ffffff',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <tr
              style={{
                backgroundColor: 'var(--primary-color, #0f172a)',
                color: '#ffffff',
                fontWeight: 800,
                textAlign: 'left',
              }}
            >
              <th style={{ padding: '0.55rem 0.65rem', textAlign: 'center', width: '40px' }}>No</th>
              <th style={{ padding: '0.55rem 0.85rem' }}>Part Name</th>
              <th style={{ padding: '0.55rem 0.85rem', textAlign: 'center' }}>Model</th>
              <th style={{ padding: '0.55rem 0.85rem', textAlign: 'right' }}>Qty (pcs)</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                  Memuat data part NG terbanyak...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                  Belum ada data part NG yang tercatat.
                </td>
              </tr>
            ) : (
              data.map((item, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <tr
                    key={item.part_name + idx}
                    style={{
                      backgroundColor: isEven ? '#ffffff' : '#f8fafc',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                      {item.no}
                    </td>
                    <td
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        wordBreak: 'break-word',
                      }}
                      title={item.part_name}
                    >
                      {item.part_name}
                    </td>
                    <td style={{ padding: '0.45rem 0.85rem', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.45rem',
                          backgroundColor: 'rgba(231, 97, 20, 0.12)',
                          color: 'var(--secondary-color, #e76114)',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                        }}
                      >
                        {item.model}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '0.45rem 0.85rem',
                        textAlign: 'right',
                        fontWeight: 900,
                        color: '#059669',
                      }}
                    >
                      {item.total_pcs.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
