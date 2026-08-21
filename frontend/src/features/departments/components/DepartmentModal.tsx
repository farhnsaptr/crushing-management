import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import type { Department, CreateDepartmentPayload, UpdateDepartmentPayload } from '../types/departments.types';
import { Network, Tag, FileText } from 'lucide-react';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDepartment?: Department | null;
  onCreateSubmit: (payload: CreateDepartmentPayload) => Promise<void>;
  onUpdateSubmit: (id: string, payload: UpdateDepartmentPayload) => Promise<void>;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  editingDepartment,
  onCreateSubmit,
  onUpdateSubmit,
}) => {
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editingDepartment;

  useEffect(() => {
    if (editingDepartment) {
      setCode(editingDepartment.code);
      setName(editingDepartment.name);
      setDescription(editingDepartment.description || '');
    } else {
      setCode('');
      setName('');
      setDescription('');
    }
    setError(null);
  }, [editingDepartment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim() || !name.trim()) {
      setError('Kode dan nama departemen wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await onUpdateSubmit(editingDepartment.id, {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else {
        await onCreateSubmit({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim() || undefined,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data departemen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Departemen' : 'Tambah Departemen Baru'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Simpan Perubahan' : 'Simpan Departemen'}
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
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        <Input
          label="Kode Departemen"
          placeholder="contoh: INJ-F3, ASSY, PAINT, QC"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          leftIcon={<Tag size={18} />}
          required
        />

        <Input
          label="Nama Departemen"
          placeholder="contoh: Injection Molding Factory 3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<Network size={18} />}
          required
        />

        <Input
          label="Deskripsi / Catatan (Opsional)"
          placeholder="Keterangan singkat fungsi departemen"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          leftIcon={<FileText size={18} />}
        />
      </form>
    </Modal>
  );
};
