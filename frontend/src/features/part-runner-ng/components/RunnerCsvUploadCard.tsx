import React, { useRef } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface RunnerCsvUploadCardProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
  onProcessFile: () => void;
  isLoading: boolean;
  parseError: string | null;
}

export const RunnerCsvUploadCard: React.FC<RunnerCsvUploadCardProps> = ({
  selectedFile,
  onFileSelect,
  onClearFile,
  onProcessFile,
  isLoading,
  parseError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        onFileSelect(file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
            Import Data Part Runner NG (CSV Produksi)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
            Unggah file CSV Laporan Produksi untuk menghitung dan mencatat berat runner per jenis material ke sistem.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              backgroundColor: 'rgba(0, 141, 81, 0.1)',
              color: 'var(--primary-color, #008d51)',
            }}
          >
            <FileSpreadsheet size={14} />
            <span>Format: .CSV</span>
          </span>
        </div>
      </div>

      {/* Info Rules Box */}
      <div
        style={{
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md, 8px)',
          backgroundColor: 'rgba(231, 97, 20, 0.06)',
          borderLeft: '4px solid var(--secondary-color, #e76114)',
          fontSize: '0.825rem',
          color: 'var(--text-main, #334155)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}
      >
        <span style={{ fontWeight: 800, color: 'var(--secondary-color, #e76114)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileText size={15} /> Aturan & Kolom Wajib CSV Produksi:
        </span>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <li>
            Silahkan upload data produksi dari <strong>apps.sugity.co.id</strong> pada sistem <strong>Production</strong>
          </li>
          <li>
            Format yang hanya diterima adalah <strong>.csv</strong>
          </li>
        </ul>
      </div>

      {/* File Drag and Drop Zone */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border-color, #cbd5e1)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-main, rgba(0, 0, 0, 0.02))',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(231, 97, 20, 0.1)',
              color: 'var(--secondary-color, #e76114)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UploadCloud size={28} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main, #0f172a)' }}>
              Klik di sini atau tarik file CSV Produksi Anda
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', marginTop: '0.2rem' }}>
              Mendukung file <code>Report Production.csv</code> (Maksimal 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'rgba(0, 141, 81, 0.06)',
            border: '1px solid rgba(0, 141, 81, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileSpreadsheet size={32} color="var(--primary-color, #008d51)" />
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main, #0f172a)' }}>
                {selectedFile.name}
              </span>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted, #64748b)' }}>
                Ukuran: {(selectedFile.size / 1024).toFixed(1)} KB — Terpilih & Siap Dihitung
              </p>
            </div>
          </div>

          <Button variant="danger" size="sm" onClick={onClearFile} disabled={isLoading}>
            Ganti File
          </Button>
        </div>
      )}

      {/* Parse Error Notification */}
      {parseError && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#dc2626',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{parseError}</span>
        </div>
      )}

      {/* Submit Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Button
          variant="primary"
          onClick={onProcessFile}
          disabled={!selectedFile || isLoading}
          isLoading={isLoading}
          style={{ minWidth: '220px', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          leftIcon={<CheckCircle2 size={18} />}
        >
          {isLoading ? 'Mengkalkulasi...' : 'Preview Data Runner'}
        </Button>
      </div>
    </Card>
  );
};
