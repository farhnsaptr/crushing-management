import React from 'react';
import type { ParetoMaterialItem } from '../types/dashboard.types';

interface ParetoMaterialTableProps {
  data: ParetoMaterialItem[];
  isLoading: boolean;
}

export const ParetoMaterialTable: React.FC<ParetoMaterialTableProps> = ({ data, isLoading }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', width: '100%', height: '100%' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
        Pareto Mat'l Recycle
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
              <th style={{ padding: '0.55rem 0.85rem' }}>Nama Mat'l</th>
              <th style={{ padding: '0.55rem 0.85rem', textAlign: 'right' }}>Qty (kg)</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                  Memuat data pareto material...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                  Belum ada data recycle material.
                </td>
              </tr>
            ) : (
              data.map((item, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <tr
                    key={item.material + idx}
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
                      title={item.material}
                    >
                      {item.material}
                    </td>
                    <td
                      style={{
                        padding: '0.45rem 0.85rem',
                        textAlign: 'right',
                        fontWeight: 900,
                        color: 'var(--secondary-color, #e76114)',
                      }}
                    >
                      {item.total_kg.toLocaleString('id-ID', { minimumFractionDigits: 1 })}
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
