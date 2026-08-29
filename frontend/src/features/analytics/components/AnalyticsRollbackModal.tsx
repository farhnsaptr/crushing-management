import React, { useEffect } from 'react';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import {
  RotateCcw,
  AlertTriangle,
  FileText,
  Trash2,
  Calendar,
  Layers,
  X,
  History,
  RefreshCw,
} from 'lucide-react';
import type { ProductionAnalyticsBatch } from '../types/analytics.types';

interface AnalyticsRollbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: ProductionAnalyticsBatch[];
  onRollbackLatest: () => Promise<void>;
  onDeleteBatch: (batchId: string) => Promise<void>;
  onRefreshBatches?: () => Promise<void>;
  isRollbacking: boolean;
  isLoadingBatches?: boolean;
}

export const AnalyticsRollbackModal: React.FC<AnalyticsRollbackModalProps> = ({
  isOpen,
  onClose,
  batches,
  onRollbackLatest,
  onDeleteBatch,
  onRefreshBatches,
  isRollbacking,
  isLoadingBatches,
}) => {
  // Re-fetch batches whenever modal is opened
  useEffect(() => {
    if (isOpen && onRefreshBatches) {
      onRefreshBatches();
    }
  }, [isOpen, onRefreshBatches]);

  if (!isOpen) return null;

  const latestBatch = batches && batches.length > 0 ? batches[0] : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RotateCcw size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Rollback Data Produksi
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
                Batalkan atau hapus 1 batch data laporan produksi yang salah dimasukkan.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {onRefreshBatches && (
              <button
                type="button"
                onClick={onRefreshBatches}
                title="Segarkan Riwayat Batch"
                disabled={isLoadingBatches || isRollbacking}
                style={{
                  background: 'none',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  cursor: 'pointer',
                  padding: '0.35rem 0.55rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <RefreshCw size={13} className={isLoadingBatches ? 'spin' : ''} />
                <span>Segarkan</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '8px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Loading State */}
          {isLoadingBatches ? (
            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <RefreshCw size={24} color="#008d51" className="spin" />
              <span>Memeriksa riwayat batch data produksi di database...</span>
            </div>
          ) : latestBatch ? (
            /* Latest Batch Action Card */
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                backgroundColor: 'rgba(220, 38, 38, 0.04)',
                border: '1.5px solid rgba(220, 38, 38, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                        Batch Terakhir: {latestBatch.filename || latestBatch.batch_name}
                      </span>
                      <Badge variant="danger" size="sm">
                        Terbaru
                      </Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '0.775rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} /> Diupload: {new Date(latestBatch.created_at).toLocaleString('id-ID')}
                      </span>
                      <span>Total: <strong>{latestBatch.total_rows} baris</strong> ({latestBatch.matched_rows} cocok)</span>
                      <span>Allowance: <strong>{Number(latestBatch.total_allowance_kg).toFixed(2)} kg</strong></span>
                    </div>
                  </div>
                </div>

                {/* Rollback 1 Batch Button */}
                <Button
                  type="button"
                  variant="danger"
                  onClick={onRollbackLatest}
                  isLoading={isRollbacking}
                  leftIcon={<RotateCcw size={16} />}
                  style={{
                    backgroundColor: '#dc2626',
                    fontWeight: 800,
                    padding: '0.55rem 1.15rem',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                  }}
                >
                  Rollback Batch Ini
                </Button>
              </div>

              {/* Notice Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #fed7aa',
                  fontSize: '0.775rem',
                  color: '#9a3412',
                }}
              >
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Rollback akan menghapus seluruh data baris produksi dan nilai allowance yang tercatat pada batch ini dari sistem.
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1',
                color: '#64748b',
                fontSize: '0.875rem',
              }}
            >
              Belum ada riwayat batch data produksi yang tersimpan untuk di-rollback.
            </div>
          )}

          {/* Batches History List */}
          {!isLoadingBatches && batches && batches.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <History size={16} color="#475569" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Riwayat Seluruh Batch Upload ({batches.length} Batch)
                </h4>
              </div>

              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem 0.85rem', fontWeight: 800, color: '#475569' }}>Nama File</th>
                      <th style={{ padding: '0.6rem 0.85rem', fontWeight: 800, color: '#475569' }}>Waktu Upload</th>
                      <th style={{ padding: '0.6rem 0.85rem', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Baris</th>
                      <th style={{ padding: '0.6rem 0.85rem', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Allowance</th>
                      <th style={{ padding: '0.6rem 0.85rem', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b, idx) => (
                      <tr
                        key={b.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: idx === 0 ? 'rgba(220, 38, 38, 0.02)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 700, color: '#0f172a' }}>
                          {b.filename || b.batch_name}
                        </td>
                        <td style={{ padding: '0.6rem 0.85rem', color: '#64748b' }}>
                          {new Date(b.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td style={{ padding: '0.6rem 0.85rem', textAlign: 'right', fontWeight: 700, color: '#334155' }}>
                          {b.total_rows}
                        </td>
                        <td style={{ padding: '0.6rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#008d51' }}>
                          {Number(b.total_allowance_kg).toFixed(2)} kg
                        </td>
                        <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            disabled={isRollbacking}
                            onClick={() => {
                              if (window.confirm(`Hapus batch "${b.filename || b.batch_name}"?`)) {
                                onDeleteBatch(b.id);
                              }
                            }}
                            title="Hapus / Rollback batch ini"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc2626',
                              cursor: isRollbacking ? 'not-allowed' : 'pointer',
                              padding: '0.25rem 0.45rem',
                              borderRadius: '6px',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: '#f8fafc',
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
