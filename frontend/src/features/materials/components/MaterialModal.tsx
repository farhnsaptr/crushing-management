import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import type { Material, CreateMaterialPayload } from '../types/materials.types';
import { Layers, FileText } from 'lucide-react';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMaterial?: Material | null;
  onCreateSubmit: (payload: CreateMaterialPayload) => Promise<void>;
  onUpdateSubmit: (id: string, payload: Partial<CreateMaterialPayload>) => Promise<void>;
}

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  editingMaterial,
  onCreateSubmit,
  onUpdateSubmit,
}) => {
  const [materialName, setMaterialName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [recycleType, setRecycleType] = useState<'reuse' | 'no_reuse'>('reuse');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editingMaterial;

  useEffect(() => {
    if (editingMaterial) {
      setMaterialName(editingMaterial.material_name);
      setDescription(editingMaterial.description || '');
      setRecycleType(editingMaterial.recycle_type || 'reuse');
    } else {
      setMaterialName('');
      setDescription('');
      setRecycleType('reuse');
    }
    setError(null);
  }, [editingMaterial, isOpen]);

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    if (!editingMaterial) {
      if (val.toLowerCase().includes('no reuse')) {
        setRecycleType('no_reuse');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!materialName.trim()) {
      setError('Nama material resin wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await onUpdateSubmit(editingMaterial.id, {
          material_name: materialName.trim(),
          description: description.trim() || undefined,
          recycle_type: recycleType,
        });
      } else {
        await onCreateSubmit({
          material_name: materialName.trim(),
          description: description.trim() || undefined,
          recycle_type: recycleType,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data master material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Master Material Resin' : 'Tambah Master Material Resin'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Simpan Perubahan' : 'Simpan Material'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        <Input
          label="Nama Material Resin"
          placeholder="misal PP2 EXXON AP03-202B, ABS BLAZE"
          value={materialName}
          onChange={(e) => setMaterialName(e.target.value)}
          leftIcon={<Layers size={18} />}
          required
        />

        {/* Jenis Recycle / Jenis Material ENUM Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
            Jenis Recycle Material
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <label
              style={{
                flex: 1,
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: `2px solid ${recycleType === 'reuse' ? '#10b981' : 'var(--border-color, #e2e8f0)'}`,
                backgroundColor: recycleType === 'reuse' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-main, #f8fafc)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: recycleType === 'reuse' ? '#047857' : 'var(--text-muted, #64748b)',
              }}
            >
              <input
                type="radio"
                name="recycleType"
                value="reuse"
                checked={recycleType === 'reuse'}
                onChange={() => setRecycleType('reuse')}
                style={{ accentColor: '#10b981' }}
              />
              <span>Part Reuse (Dapat Didaur Ulang)</span>
            </label>

            <label
              style={{
                flex: 1,
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: `2px solid ${recycleType === 'no_reuse' ? '#ef4444' : 'var(--border-color, #e2e8f0)'}`,
                backgroundColor: recycleType === 'no_reuse' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-main, #f8fafc)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: recycleType === 'no_reuse' ? '#b91c1c' : 'var(--text-muted, #64748b)',
              }}
            >
              <input
                type="radio"
                name="recycleType"
                value="no_reuse"
                checked={recycleType === 'no_reuse'}
                onChange={() => setRecycleType('no_reuse')}
                style={{ accentColor: '#ef4444' }}
              />
              <span>Part No Reuse (Menjadi Waste)</span>
            </label>
          </div>
        </div>

        <Input
          label="Deskripsi / Catatan"
          placeholder="misal Spesifikasi resin untuk part Quarter Trim (atau No Reuse)"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          leftIcon={<FileText size={18} />}
        />
      </form>
    </Modal>
  );
};
