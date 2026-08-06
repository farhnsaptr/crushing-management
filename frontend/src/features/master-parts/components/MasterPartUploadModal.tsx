import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Upload, Download, FileSpreadsheet, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface MasterPartUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile: (file: File) => Promise<void>;
  onDownloadTemplate: () => void;
  isUploading: boolean;
}

export const MasterPartUploadModal: React.FC<MasterPartUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadFile,
  onDownloadTemplate,
  isUploading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    setError(null);
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
      setError('Format file tidak didukung. Harap pilih file berformat .xlsx, .xls, atau .csv');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Harap pilih file Excel terlebih dahulu.');
      return;
    }

    try {
      await onUploadFile(selectedFile);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses file Excel.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Master Parts via Excel / CSV"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isUploading}
            disabled={!selectedFile}
            leftIcon={<Upload size={16} />}
          >
            Pratinjau Data Impor
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Disclaimer Alert Box */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', fontWeight: 800 }}>
            <Info size={18} />
            <span>Aturan Format Import File Excel</span>
          </div>

          <ul style={{ fontSize: '0.8rem', color: 'var(--text-main)', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.5 }}>
            <li>
              <strong>Sebango Code Kosong:</strong> Baris data yang tidak memiliki <em>Sebango Code</em> akan otomatis <strong>DI-SKIP</strong> (diabaikan).
            </li>
            <li>
              <strong>Nilai Kosong (Default Values):</strong> Field angka yang kosong diisi <strong>0</strong>, dan field teks/nama yang kosong diisi <strong>'-'</strong>.
            </li>
            <li>
              <strong>Bebas Formula:</strong> File Excel harus berisi nilai murni (<em>values / paste values</em>), bukan rumus/formula.
            </li>
            <li>
              <strong>Kalkulasi Rumus Otomatis:</strong> Kolom <code>STD QTY NG</code> (<code>shikake * 2</code>) dan <code>Allowance (kg)</code> dihitung secara otomatis oleh sistem backend.
            </li>
          </ul>
        </div>

        {/* Diagnostic Error Alert */}
        {error && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>{error}</div>
          </div>
        )}

        {/* Template Download Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
              Unduh Template Format Excel
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Format susunan kolom standar (sampah/master_parts_crushing.xlsx)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDownloadTemplate}
            leftIcon={<Download size={15} />}
          >
            Unduh Template
          </Button>
        </div>

        {/* Dropzone File Upload */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: dragOver ? '2px dashed var(--accent-color)' : '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            backgroundColor: dragOver ? 'rgba(3, 114, 51, 0.05)' : 'var(--bg-card)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            type="file"
            id="excel-file-input"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
          />

          <label htmlFor="excel-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: selectedFile ? 'rgba(16, 185, 129, 0.1)' : 'var(--primary-light)',
                color: selectedFile ? '#10b981' : 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedFile ? <CheckCircle size={28} /> : <FileSpreadsheet size={28} />}
            </div>

            {selectedFile ? (
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  {selectedFile.name}
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB — Klik untuk mengganti file
                </p>
              </div>
            ) : (
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Tarik & lepas file Excel (.xlsx / .csv) di sini
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  atau klik untuk memilih file dari komputer Anda
                </p>
              </div>
            )}
          </label>
        </div>
      </div>
    </Modal>
  );
};
