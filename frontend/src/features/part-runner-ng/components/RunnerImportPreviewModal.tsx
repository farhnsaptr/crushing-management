import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import type { RunnerMaterialPreviewResponse } from '../types/runnerMaterial.types';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileCheck2,
} from 'lucide-react';

interface RunnerImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: RunnerMaterialPreviewResponse | null;
  onConfirmSave: () => void;
  isSaving: boolean;
}

export const RunnerImportPreviewModal: React.FC<RunnerImportPreviewModalProps> = ({
  isOpen,
  onClose,
  previewData,
  onConfirmSave,
  isSaving,
}) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'unmatched'>('materials');
  const [expandedMaterialIndex, setExpandedMaterialIndex] = useState<number | null>(null);

  if (!previewData) return null;

  const { summary, matched_materials = [], unmatched_sebangos = [], transaction_date } = previewData;

  const toggleExpand = (idx: number) => {
    setExpandedMaterialIndex(expandedMaterialIndex === idx ? null : idx);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preview Input Part Runner NG per Material"
      size="xl"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Top Header Information Banner */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'var(--bg-main, #f8fafc)',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Calendar size={18} color="var(--primary-color, #008d51)" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                Tanggal Produksi (CSV):
              </span>
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                {transaction_date}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileCheck2 size={18} color="var(--secondary-color, #e76114)" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                Batch Reference:
              </span>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                {previewData.batch_ref}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Grid Summary KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.85rem',
          }}
        >
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'rgba(0, 141, 81, 0.08)',
              border: '1px solid rgba(0, 141, 81, 0.2)',
            }}
          >
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--primary-color, #008d51)' }}>
              MATERIAL DICOCOKKAN
            </span>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary-color, #008d51)', marginTop: '0.2rem' }}>
              {summary.total_materials} Material
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'rgba(231, 97, 20, 0.08)',
              border: '1px solid rgba(231, 97, 20, 0.2)',
            }}
          >
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--secondary-color, #e76114)' }}>
              TOTAL SEBANGO COCOK
            </span>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)', marginTop: '0.2rem' }}>
              {summary.matched_sebangos} / {summary.unique_sebangos}
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#2563eb' }}>
              TOTAL WEIGHT RUNNER
            </span>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#2563eb', marginTop: '0.2rem' }}>
              {Number(summary.total_runner_weight_kg || 0).toFixed(3)} kg
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: summary.unmatched_sebangos > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(100, 116, 139, 0.08)',
              border: summary.unmatched_sebangos > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(100, 116, 139, 0.2)',
            }}
          >
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: summary.unmatched_sebangos > 0 ? '#dc2626' : 'var(--text-muted, #64748b)' }}>
              SEBANGO DIABAIKAN
            </span>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: summary.unmatched_sebangos > 0 ? '#dc2626' : 'var(--text-muted, #64748b)', marginTop: '0.2rem' }}>
              {summary.unmatched_sebangos} Sebango
            </div>
          </div>
        </div>

        {/* Tab Switcher inside Modal */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color, #cbd5e1)' }}>
          <button
            onClick={() => setActiveTab('materials')}
            style={{
              padding: '0.55rem 1rem',
              border: 'none',
              borderBottom: activeTab === 'materials' ? '3px solid var(--secondary-color, #e76114)' : '3px solid transparent',
              backgroundColor: 'transparent',
              fontWeight: activeTab === 'materials' ? 800 : 600,
              color: activeTab === 'materials' ? 'var(--secondary-color, #e76114)' : 'var(--text-muted, #64748b)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
            }}
          >
            <Layers size={16} />
            <span>Hasil Agregasi Per Material ({matched_materials.length})</span>
          </button>

          {unmatched_sebangos.length > 0 && (
            <button
              onClick={() => setActiveTab('unmatched')}
              style={{
                padding: '0.55rem 1rem',
                border: 'none',
                borderBottom: activeTab === 'unmatched' ? '3px solid #dc2626' : '3px solid transparent',
                backgroundColor: 'transparent',
                fontWeight: activeTab === 'unmatched' ? 800 : 600,
                color: activeTab === 'unmatched' ? '#dc2626' : 'var(--text-muted, #64748b)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.9rem',
              }}
            >
              <AlertTriangle size={16} />
              <span>Sebango Tidak Cocok ({unmatched_sebangos.length})</span>
            </button>
          )}
        </div>

        {/* TAB 1: PER-MATERIAL AGGREGATION TABLE */}
        {activeTab === 'materials' && (
          <div style={{ overflowX: 'auto', width: '100%', maxHeight: '450px', overflowY: 'auto' }}>
            {matched_materials.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
                Tidak ada material yang cocok.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
                    <th style={{ padding: '0.65rem 0.85rem' }}>No</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Nama Material</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Shift</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Jumlah Sebango</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Total Runner (kg)</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Rincian</th>
                  </tr>
                </thead>
                <tbody>
                  {matched_materials.map((mat, idx) => {
                    const isExpanded = expandedMaterialIndex === idx;
                    const details = mat.sebango_details || [];

                    return (
                      <React.Fragment key={(mat.material_name || '') + (mat.shift || '') + idx}>
                        {/* Main Material Summary Row */}
                        <tr
                          onClick={() => toggleExpand(idx)}
                          style={{
                            borderBottom: '1px solid var(--border-color, #e2e8f0)',
                            backgroundColor: isExpanded ? 'rgba(231, 97, 20, 0.08)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Layers size={16} color="var(--primary-color, #008d51)" />
                              <span>{mat.material_name || 'Unassigned Material'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem' }}>
                            <Badge variant={mat.shift === 'Malam' ? 'warning' : 'success'} size="sm">
                              {mat.shift === 'Malam' ? 'Shift Malam' : 'Shift Pagi'}
                            </Badge>
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                            <Badge variant="info" size="sm">
                              {mat.sebango_count || details.length} Sebango
                            </Badge>
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                            {Number(mat.total_runner_weight_kg || 0).toFixed(3)} kg
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
                            <button
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'inherit',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.775rem',
                                fontWeight: 700,
                              }}
                            >
                              <span>{isExpanded ? 'Tutup' : 'Detail'}</span>
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </td>
                        </tr>

                        {/* Sub-row for expanded sebango breakdown */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-main, #f8fafc)', borderBottom: '2px solid var(--border-color, #cbd5e1)' }}>
                              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md, 6px)', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', marginBottom: '0.5rem', display: 'block' }}>
                                  Rincian Sebango Kontributor untuk Material "{mat.material_name}":
                                </span>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                  <thead>
                                    <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
                                      <th style={{ padding: '0.4rem 0.6rem' }}>Kode Sebango</th>
                                      <th style={{ padding: '0.4rem 0.6rem' }}>Part Name</th>
                                      <th style={{ padding: '0.4rem 0.6rem' }}>Shift</th>
                                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>Berat Runner (gr)</th>
                                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>Subtotal (kg)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {details.map((detail, dIdx) => (
                                      <tr key={detail.sebango_code + dIdx} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                                        <td style={{ padding: '0.45rem 0.6rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                                          {detail.sebango_code}
                                        </td>
                                        <td style={{ padding: '0.45rem 0.6rem', color: 'var(--text-main, #334155)' }}>
                                          {detail.part_name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({detail.part_number})</span>
                                        </td>
                                        <td style={{ padding: '0.45rem 0.6rem' }}>
                                          <Badge variant={detail.shift === 'Malam' ? 'warning' : 'success'} size="sm">
                                            {detail.shift === 'Malam' ? 'Shift Malam' : 'Shift Pagi'}
                                          </Badge>
                                        </td>
                                        <td style={{ padding: '0.45rem 0.6rem', textAlign: 'right', color: 'var(--text-main)' }}>
                                          {Number(detail.berat_runner_gr || 0)} gr
                                        </td>
                                        <td style={{ padding: '0.45rem 0.6rem', textAlign: 'right', fontWeight: 800, color: 'var(--secondary-color, #e76114)' }}>
                                          {Number(detail.runner_weight_kg || 0).toFixed(3)} kg
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 2: UNMATCHED SEBANGOS WARNING TABLE */}
        {activeTab === 'unmatched' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '450px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: '0.825rem',
                color: '#dc2626',
              }}
            >
              <strong>Perhatian:</strong> {unmatched_sebangos.length} kode sebango berikut dari file CSV tidak ditemukan di katalog Master Parts sistem. Sebango ini <strong>TIDAK akan dihitung/dicatat</strong> ke dalam runner material.
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
                    <th style={{ padding: '0.55rem 0.75rem' }}>No</th>
                    <th style={{ padding: '0.55rem 0.75rem' }}>Kode Sebango (CSV)</th>
                    <th style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>ACT TOTAL (pcs)</th>
                    <th style={{ padding: '0.55rem 0.75rem' }}>Keterangan Status</th>
                  </tr>
                </thead>
                <tbody>
                  {unmatched_sebangos.map((u, uIdx) => (
                    <tr key={u.sebango_code + uIdx} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                      <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted, #64748b)' }}>{uIdx + 1}</td>
                      <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#dc2626' }}>
                        {u.sebango_code}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                        {Number(u.act_pcs || 0).toLocaleString()} pcs
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted, #64748b)', fontSize: '0.8rem' }}>
                        {u.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Action Buttons Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '1rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>

          <Button
            variant="primary"
            onClick={onConfirmSave}
            disabled={isSaving || matched_materials.length === 0}
            isLoading={isSaving}
            leftIcon={<CheckCircle2 size={18} />}
          >
            {isSaving ? 'Menyimpan Record...' : 'Catat Part Runner'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
