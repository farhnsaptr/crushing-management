import React from 'react';
import type { DepartmentParetoItem } from '../types/dashboard.types';

interface DepartmentParetoTableProps {
  data: DepartmentParetoItem[];
  isLoading?: boolean;
}

const RANK_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: 'var(--secondary-color, #e76114)',
  3: '#eab308',
};

const barColor = (rank: number) => RANK_COLORS[rank] && rank <= 2 ? RANK_COLORS[rank] : 'var(--primary-color, #008d51)';

export const DepartmentParetoTable: React.FC<DepartmentParetoTableProps> = ({ data, isLoading }) => (
  <div className="dash-table-card">
    <h3 className="dash-table-title">Pareto Departemen Pengirim Part NG Terbanyak</h3>
    <div className="dash-table-box">
      <table className="dash-table">
        <thead>
          <tr>
            <th className="ctr" style={{ width: '2.5em' }}>Rank</th>
            <th>Departemen</th>
            <th className="num col-sec">Trx</th>
            <th className="num col-sec">Part (Pcs)</th>
            <th className="num">Berat (kg)</th>
            <th style={{ width: '7.5em' }}>Proporsi</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr className="empty-row"><td colSpan={6}>Memuat data ranking departemen...</td></tr>
          ) : data.length === 0 ? (
            <tr className="empty-row"><td colSpan={6}>Belum ada data transaksi NG dari departemen pada periode ini.</td></tr>
          ) : (
            data.map((row) => (
              <tr key={row.department_id}>
                <td className="ctr">
                  {RANK_COLORS[row.rank] ? (
                    <span className="dash-rank" style={{ backgroundColor: RANK_COLORS[row.rank] }}>{row.rank}</span>
                  ) : (
                    <span style={{ fontWeight: 700, color: '#64748b' }}>{row.rank}</span>
                  )}
                </td>
                <td
                  className="cell-name"
                  title={`${row.department_name}${row.department_code ? ` (${row.department_code})` : ''} — ${row.total_transaksi} trx, ${row.total_pcs.toLocaleString('id-ID')} pcs`}
                >
                  {row.department_name}
                  <span className="cell-sub">
                    {row.total_transaksi} trx · {row.total_pcs.toLocaleString('id-ID')} pcs
                  </span>
                </td>
                <td className="num col-sec" style={{ color: '#64748b' }}>{row.total_transaksi}</td>
                <td className="num col-sec" style={{ fontWeight: 700 }}>{row.total_pcs.toLocaleString('id-ID')}</td>
                <td className="num" style={{ fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                  {Number(row.total_kg).toFixed(2)}
                </td>
                <td>
                  <div className="dash-bar-meter">
                    <div className="track">
                      <span style={{ width: `${Math.min(100, row.percentage)}%`, backgroundColor: barColor(row.rank) }} />
                    </div>
                    <span style={{ fontWeight: 800, minWidth: '3em', textAlign: 'right' }}>{row.percentage}%</span>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
