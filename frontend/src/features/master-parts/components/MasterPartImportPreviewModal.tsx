import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import type { ImportPreviewResult, ParsedPartRow } from '../types/masterParts.types';
import { CheckCircle2, AlertTriangle, Database } from 'lucide-react';

interface MasterPartImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: ImportPreviewResult | null;
  onCommitImport: (rows: ParsedPartRow[]) => Promise<void>;
  isCommitting: boolean;
}

export const MasterPartImportPreviewModal: React.FC<MasterPartImportPreviewModalProps> = ({
  isOpen,
  onClose,
  previewData,
  onCommitImport,
  isCommitting,
}) => {
  if (!previewData) return null;

  const { summary, previewRows } = previewData;

  const handleConfirm = async () => {
    await onCommitImport(previewRows);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modal Viewer - Pratinjau Data Pra-Impor Excel"
      size="full"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isCommitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            isLoading={isCommitting}
            disabled={summary.validCount === 0}
            leftIcon={<Database size={16} />}
          >
            Konfirmasi & Simpan ke Database ({summary.validCount} Baris)
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Summary Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Baris Diproses
            </span>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.15rem' }}>
              {summary.totalRows}
            </h4>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#10b981' }}>
              <CheckCircle2 size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                Siap Di-Import
              </span>
            </div>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', marginTop: '0.15rem' }}>
              {summary.validCount}
            </h4>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(100, 116, 139, 0.08)',
              border: '1px solid rgba(100, 116, 139, 0.25)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b' }}>
              <AlertTriangle size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                Di-Skip (Sebango Kosong)
              </span>
            </div>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#64748b', marginTop: '0.15rem' }}>
              {summary.skippedCount}
            </h4>
          </div>
        </div>

        {/* Data Table Viewer */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflowX: 'auto', maxHeight: '420px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.04)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.625rem 0.75rem' }}>Status</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Baris#</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Sebango Code</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Lokasi / Pabrik</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Mesin</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Customer</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Model</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Part Number</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Part Name</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Jenis Part</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Material</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Shikake</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Berat Part (gr)</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Berat Runner (gr)</th>
                <th style={{ padding: '0.625rem 0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>STD QTY NG</th>
                <th style={{ padding: '0.625rem 0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>Allowance (kg)</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row) => (
                <tr
                  key={row.rowIndex}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: row.isValid ? 'transparent' : 'rgba(100, 116, 139, 0.05)',
                  }}
                >
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    {row.isValid ? (
                      <Badge variant="success" size="sm">
                        Siap Import
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        {row.skipReason || 'Skipped'}
                      </Badge>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>{row.rowIndex}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 800 }}>{row.sebango_code}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{row.location}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{row.machine_code}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{row.customer}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{row.model_code}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700 }}>{row.part_number}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{row.part_name}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{row.jenis_part}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{row.material}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{Number(row.shikake)}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{Number(row.berat_part_gr)}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{Number(row.berat_runner_gr)}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 800, color: '#2563eb', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                    {Number(row.std_qty_ng)}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 800, color: '#2563eb', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                    {Number(row.allowance_kg)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
