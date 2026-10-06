import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Badge } from '../../../components/common/Badge';
import type { MixedMaterialMembersResponse } from '../types/mixedMaterials.types';
import { Layers } from 'lucide-react';

interface MixedMaterialMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MixedMaterialMembersResponse | null;
  isLoading: boolean;
}

export const MixedMaterialMembersModal: React.FC<MixedMaterialMembersModalProps> = ({ isOpen, onClose, data, isLoading }) => {
  if (!isOpen) return null;
  const members = data?.members || [];
  const muted = { padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' } as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Anggota Campuran: ${data?.mixed.mixed_name || ''}`} size="lg">
      {isLoading ? (
        <div style={muted}>Memuat anggota material campuran...</div>
      ) : !data ? (
        <div style={muted}>Data anggota tidak ditemukan.</div>
      ) : members.length === 0 ? (
        <div style={muted}>Belum ada material yang dicampur ke sini. Atur dari menu edit Master Material.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
              <th style={{ padding: '0.65rem 0.75rem' }}>No</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Material Asli</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Jenis Recycle Asli</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Part yang Memakai</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, idx) => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted, #64748b)' }}>{idx + 1}</td>
                <td style={{ padding: '0.65rem 0.75rem', fontWeight: 800 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={15} />
                    {m.material_name}
                  </span>
                </td>
                <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: m.recycle_type === 'no_reuse' ? '#ef4444' : '#10b981' }}>
                  {m.recycle_type === 'no_reuse' ? 'No Reuse' : 'Reuse'}
                </td>
                <td style={{ padding: '0.65rem 0.75rem' }}>
                  <Badge variant={m.used_parts_count > 0 ? 'info' : 'secondary'}>{m.used_parts_count} Part</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
};
