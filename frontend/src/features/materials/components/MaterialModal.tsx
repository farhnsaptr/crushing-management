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

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editingMaterial;

  useEffect(() => {
    if (editingMaterial) {
      setMaterialName(editingMaterial.material_name);
      setDescription(editingMaterial.description || '');
    } else {
      setMaterialName('');
      setDescription('');
    }
    setError(null);
  }, [editingMaterial, isOpen]);

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
        });
      } else {
        await onCreateSubmit({
          material_name: materialName.trim(),
          description: description.trim() || undefined,
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

        <Input
          label="Deskripsi / Catatan"
          placeholder="misal Spesifikasi resin untuk part Quarter Trim"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          leftIcon={<FileText size={18} />}
        />
      </form>
    </Modal>
  );
};
