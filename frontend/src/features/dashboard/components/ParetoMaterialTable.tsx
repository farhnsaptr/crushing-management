import React from 'react';
import type { ParetoMaterialItem } from '../types/dashboard.types';

interface ParetoMaterialTableProps {
  data: ParetoMaterialItem[];
  isLoading: boolean;
}

export const ParetoMaterialTable: React.FC<ParetoMaterialTableProps> = ({ data, isLoading }) => (
  <div className="dash-table-card">
    <h3 className="dash-table-title">Pareto Material Recycle</h3>
    <div className="dash-table-box">
      <table className="dash-table">
        <thead>
          <tr>
            <th className="ctr" style={{ width: '2.5em' }}>No</th>
            <th>Nama Mat'l</th>
            <th className="num">Qty (kg)</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr className="empty-row"><td colSpan={3}>Memuat data pareto material...</td></tr>
          ) : data.length === 0 ? (
            <tr className="empty-row"><td colSpan={3}>Belum ada data recycle material.</td></tr>
          ) : (
            data.map((item, idx) => (
              <tr key={item.material + idx}>
                <td className="ctr" style={{ fontWeight: 700, color: '#64748b' }}>{item.no}</td>
                <td className="cell-name" title={item.material}>{item.material}</td>
                <td className="num" style={{ fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                  {item.total_kg.toLocaleString('id-ID', { minimumFractionDigits: 1 })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
