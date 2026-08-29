import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Badge } from '../../../components/common/Badge';
import type { MaterialPartsResponse } from '../types/materials.types';
import { Layers, Package, Cpu } from 'lucide-react';

interface MaterialPartListModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MaterialPartsResponse | null;
  isLoading: boolean;
}

export const MaterialPartListModal: React.FC<MaterialPartListModalProps> = ({
  isOpen,
  onClose,
  data,
  isLoading,
}) => {
  if (!isOpen) return null;

  const material = data?.material;
  const parts = data?.parts || [];
  const isNoReuse = material?.recycle_type === 'no_reuse';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Part yang Menggunakan Material: ${material?.material_name || 'Material'}`}
      size="lg"
    >
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
          Memuat daftar part yang menggunakan material ini...
        </div>
      ) : !data ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
          Data part tidak ditemukan.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Material Summary Bar */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: isNoReuse ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              border: `1px solid ${isNoReuse ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: isNoReuse ? '#ef4444' : '#10b981',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main, #0f172a)' }}>
                  {material?.material_name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                  {material?.description || 'Tanpa Deskripsi'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontWeight: 800, color: isNoReuse ? '#b91c1c' : '#047857', fontSize: '0.85rem' }}>
                {isNoReuse ? 'Part No Reuse (Waste)' : 'Part Reuse (Recycle)'}
              </span>
              <Badge variant="info">{parts.length} Part Digunakan</Badge>
            </div>
          </div>

          {/* Parts List Table */}
          {parts.length === 0 ? (
            <div
              style={{
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                color: 'var(--text-muted, #64748b)',
                backgroundColor: 'var(--bg-main, #f8fafc)',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px dashed var(--border-color, #cbd5e1)',
              }}
            >
              Belum ada part di database Master Parts yang menggunakan material ini.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '380px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
                    <th style={{ padding: '0.65rem 0.75rem' }}>No</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Part Number</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Nama Part</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Model</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Berat Part (gr)</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Mesin & Lokasi</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((part, idx) => (
                    <tr key={part.id || idx} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                      <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted, #64748b)' }}>{idx + 1}</td>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                        {part.part_number}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: 'var(--primary-color, #008d51)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Package size={15} />
                          <span>{part.part_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>{part.model_code || '-'}</span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 800 }}>
                        {Number(part.berat_part_gr || 0).toLocaleString('id-ID')} gr
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Cpu size={14} />
                          <span>{part.machine_code || '-'} ({part.factory_name || 'FAC'})</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
