import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import type { StorageImpactResult } from '../types/siteConfig.types';
import { AlertTriangle, FolderTree, ArrowRight, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

interface StorageMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  impactData: StorageImpactResult | null;
  isSubmitting: boolean;
  onConfirmMigration: (action: 'migrate_all' | 'config_only') => void;
}

export const StorageMigrationModal: React.FC<StorageMigrationModalProps> = ({
  isOpen,
  onClose,
  impactData,
  isSubmitting,
  onConfirmMigration,
}) => {
  if (!impactData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Perubahan Lokasi MinIO Storage"
      size="lg"
      footer={
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem' }}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            leftIcon={<RotateCcw size={16} />}
          >
            Batal
          </Button>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <Button
              variant="outline"
              onClick={() => onConfirmMigration('config_only')}
              disabled={isSubmitting}
              title="Hanya simpan konfigurasi baru untuk upload part ke depannya (part lama dibiarkan)"
            >
              Hanya Simpan Konfigurasi
            </Button>

            <Button
              variant="primary"
              onClick={() => onConfirmMigration('migrate_all')}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 size={17} />}
              title="Perbarui seluruh database master part & migrasikan file objek di MinIO S3"
            >
              Ganti Seluruh Master Part ({impactData.affectedCount} item)
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Warning Alert Banner */}
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
          }}
        >
          <AlertTriangle size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#b45309' }}>
                Perhatian: Terdapat Data Master Part yang Terpengaruh
              </span>
              <Badge variant="warning" size="sm">
                {impactData.affectedCount} Part Menggunakan Lokasi Lama
              </Badge>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
              Anda mengubah konfigurasi MinIO Storage. Terdapat <strong>{impactData.affectedCount} master part</strong> di database yang saat ini menyimpan foto pada lokasi lama. Tentukan apakah Anda ingin memigrasikan path foto seluruh master part tersebut ke lokasi baru atau membiarkannya.
            </p>
          </div>
        </div>

        {/* Change Comparison Summary */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(59, 130, 246, 0.06)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderTree size={20} color="#2563eb" />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                PREFIX FOLDER MASTER PARTS
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.15rem' }}>
                <code style={{ fontSize: '0.9rem', color: '#ef4444', backgroundColor: 'var(--bg-card)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  {impactData.oldFolder}
                </code>
                <ArrowRight size={16} color="#3b82f6" />
                <code style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 800, backgroundColor: 'var(--bg-card)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  {impactData.newFolder}
                </code>
              </div>
            </div>
          </div>

          <Badge variant="primary" size="md">
            Perubahan Prefix Folder
          </Badge>
        </div>

        {/* Affected Master Parts Table List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Daftar Master Part yang Terpengaruh ({impactData.affectedCount} Item):
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Scroll ke bawah untuk melihat seluruh item
            </span>
          </div>

          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(100, 116, 139, 0.08)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>Part Number</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>Part Name</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>Model</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>Path Key Foto Saat Ini</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>Path Key Baru (Jika Dimigrasi)</th>
                </tr>
              </thead>
              <tbody>
                {impactData.affectedParts.map((p, idx) => (
                  <tr
                    key={p.id || idx}
                    style={{
                      borderBottom: idx === impactData.affectedParts.length - 1 ? 'none' : '1px solid var(--border-color)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(100, 116, 139, 0.02)',
                    }}
                  >
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {p.part_number}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-main)' }}>
                      {p.part_name}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <Badge variant="neutral" size="sm">
                        {p.model_code || '-'}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <code style={{ fontSize: '0.75rem', color: '#ef4444' }}>
                        {p.current_image_key}
                      </code>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <code style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                        {p.new_image_key}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Explanation Box */}
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.775rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.25rem' }}>
            <AlertCircle size={14} />
            <span>Pilihan Tindakan:</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>Ganti Seluruh Master Part:</strong> Backend akan menyalin objek foto di MinIO S3 ke folder/bucket baru dan mengupdate kolom <code>image_url</code> seluruh part di database MySQL.
            </li>
            <li>
              <strong>Hanya Simpan Konfigurasi:</strong> Hanya memperbarui setting site config untuk part baru yang akan diunggah kedepannya. Data part lama tetap apa adanya.
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
