import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import type { Factory, CreateFactoryPayload, UpdateFactoryPayload } from '../types/factories.types';
import { Building2, Tag, MapPin } from 'lucide-react';

interface FactoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingFactory?: Factory | null;
  onCreateSubmit: (payload: CreateFactoryPayload) => Promise<void>;
  onUpdateSubmit: (id: string, payload: UpdateFactoryPayload) => Promise<void>;
}

export const FactoryModal: React.FC<FactoryModalProps> = ({
  isOpen,
  onClose,
  editingFactory,
  onCreateSubmit,
  onUpdateSubmit,
}) => {
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editingFactory;

  useEffect(() => {
    if (editingFactory) {
      setCode(editingFactory.code);
      setName(editingFactory.name);
      setLocation(editingFactory.location || '');
    } else {
      setCode('');
      setName('');
      setLocation('');
    }
    setError(null);
  }, [editingFactory, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim() || !name.trim()) {
      setError('Kode dan Nama Pabrik wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await onUpdateSubmit(editingFactory.id, {
          code: code.trim(),
          name: name.trim(),
          location: location.trim() || undefined,
        });
      } else {
        await onCreateSubmit({
          code: code.trim(),
          name: name.trim(),
          location: location.trim() || undefined,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data pabrik.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Data Pabrik' : 'Tambah Pabrik Baru'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Simpan Perubahan' : 'Simpan Pabrik'}
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
          label="Kode Pabrik"
          placeholder="misal FAC2, FAC3, FAC4"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          leftIcon={<Tag size={18} />}
          required
        />

        <Input
          label="Nama Pabrik"
          placeholder="misal FACTORY 2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<Building2 size={18} />}
          required
        />

        <Input
          label="Lokasi / Alamat Pabrik (Opsional)"
          placeholder="misal Kawasan Industri MM2100, Cikarang Barat"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          leftIcon={<MapPin size={18} />}
        />
      </form>
    </Modal>
  );
};
