import React from 'react';
import type { TopNgPartItem } from '../types/dashboard.types';

interface TopNgPartsTableProps {
  data: TopNgPartItem[];
  isLoading: boolean;
}

export const TopNgPartsTable: React.FC<TopNgPartsTableProps> = ({ data, isLoading }) => (
  <div className="dash-table-card">
    <h3 className="dash-table-title">Part NG Terbanyak</h3>
    <div className="dash-table-box">
      <table className="dash-table">
        <thead>
          <tr>
            <th className="ctr" style={{ width: '2.5em' }}>No</th>
            <th>Part Name</th>
            <th className="ctr col-sec">Model</th>
            <th className="num">Qty (pcs)</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr className="empty-row"><td colSpan={4}>Memuat data part NG terbanyak...</td></tr>
          ) : data.length === 0 ? (
            <tr className="empty-row"><td colSpan={4}>Belum ada data part NG yang tercatat.</td></tr>
          ) : (
            data.map((item, idx) => (
              <tr key={item.part_name + idx}>
                <td className="ctr" style={{ fontWeight: 700, color: '#64748b' }}>{item.no}</td>
                <td className="cell-name" title={`${item.part_name} (${item.model})`}>
                  {item.part_name}
                  <span className="cell-sub">Model {item.model}</span>
                </td>
                <td className="ctr col-sec">
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.1em 0.45em',
                      backgroundColor: 'rgba(231, 97, 20, 0.12)',
                      color: 'var(--secondary-color, #e76114)',
                      borderRadius: '6px',
                      fontSize: '0.92em',
                      fontWeight: 800,
                    }}
                  >
                    {item.model}
                  </span>
                </td>
                <td className="num" style={{ fontWeight: 900, color: '#059669' }}>
                  {item.total_pcs.toLocaleString('id-ID')}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
