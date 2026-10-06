import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Layers, FileText } from 'lucide-react';
import { extractErrorMessage } from '../../../services/api.client';
import type { MixedMaterial, MixedMaterialPayload, RecycleType } from '../types/mixedMaterials.types';

interface MixedMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: MixedMaterial | null;
  onSubmit: (payload: MixedMaterialPayload) => Promise<void>;
}

export const MixedMaterialModal: React.FC<MixedMaterialModalProps> = ({ isOpen, onClose, editing, onSubmit }) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [recycleType, setRecycleType] = useState<RecycleType>('reuse');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(editing?.mixed_name || '');
    setDescription(editing?.description || '');
    setRecycleType(editing?.recycle_type || 'reuse');
    setError(null);
  }, [editing, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Nama material campuran wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ mixed_name: name.trim(), description: description.trim() || undefined, recycle_type: recycleType });
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Gagal menyimpan material campuran.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const radioStyle = (active: boolean, color: string): React.CSSProperties => ({
    flex: 1,
    padding: '0.65rem 0.85rem',
    borderRadius: 'var(--radius-md, 8px)',
    border: `2px solid ${active ? color : 'var(--border-color, #e2e8f0)'}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: 700,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? 'Edit Material Campuran' : 'Tambah Material Campuran'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {editing ? 'Simpan Perubahan' : 'Simpan Material Campuran'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <Input
          label="Nama Material Campuran"
          placeholder="misal MAT-CAMPUR A"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<Layers size={18} />}
          required
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
            Jenis Recycle Campuran
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <label style={radioStyle(recycleType === 'reuse', '#10b981')}>
              <input type="radio" name="mixedRecycle" checked={recycleType === 'reuse'} onChange={() => setRecycleType('reuse')} />
              <span>Reuse (Dapat Didaur Ulang)</span>
            </label>
            <label style={radioStyle(recycleType === 'no_reuse', '#ef4444')}>
              <input type="radio" name="mixedRecycle" checked={recycleType === 'no_reuse'} onChange={() => setRecycleType('no_reuse')} />
              <span>No Reuse (Menjadi Waste)</span>
            </label>
          </div>
        </div>

        <Input
          label="Deskripsi / Catatan"
          placeholder="misal Campuran A + B + C untuk Quarter Trim"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          leftIcon={<FileText size={18} />}
        />
      </form>
    </Modal>
  );
};
