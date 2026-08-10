import React from 'react';
import type { NgTransactionResult } from '../types/ngInput.types';
import { Badge } from '../../../components/common/Badge';

interface NgTransactionLogTableProps {
  transactions: NgTransactionResult[];
}

export const NgTransactionLogTable: React.FC<NgTransactionLogTableProps> = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div
        style={{
          padding: '2.5rem',
          textAlign: 'center',
          color: '#64748b',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px dashed #cbd5e1',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        Tidak ada data log transaksi NG yang tersimpan untuk periode ini.
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: 'auto',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        backgroundColor: '#ffffff',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: '#f8fafc',
              borderBottom: '2px solid #e2e8f0',
              color: '#334155',
              fontWeight: 800,
            }}
          >
            <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Tanggal</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Shift</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Jumlah / Berat</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Operator Input</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Catatan</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, idx) => {
            const formattedDate = new Date(tx.transaction_date).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const isEven = idx % 2 === 0;

            return (
              <tr
                key={tx.id}
                style={{
                  backgroundColor: isEven ? '#ffffff' : '#f8fafc',
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                  {formattedDate}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  <Badge variant={tx.shift === 'Pagi' ? 'primary' : 'secondary'} size="sm">
                    {tx.shift}
                  </Badge>
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 800, color: '#059669' }}>
                  {Number(tx.weight_kg).toFixed(2)} Kg <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 600 }}>({tx.quantity_pcs} pcs)</span>
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                  {tx.input_by_name || 'Operator'}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#64748b' }}>
                  {tx.notes || '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
