import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import type { Machine, CreateMachinePayload, UpdateMachinePayload } from '../types/machines.types';
import type { Factory } from '../../factories/types/factories.types';
import { Cpu, Tag, Building2, Layers, Gauge, Activity } from 'lucide-react';

interface MachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMachine?: Machine | null;
  factories: Factory[];
  onCreateSubmit: (payload: CreateMachinePayload) => Promise<void>;
  onUpdateSubmit: (id: string, payload: UpdateMachinePayload) => Promise<void>;
}

export const MachineModal: React.FC<MachineModalProps> = ({
  isOpen,
  onClose,
  editingMachine,
  factories,
  onCreateSubmit,
  onUpdateSubmit,
}) => {
  const [factoryId, setFactoryId] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<string>('Injection Mold');
  const [tonnage, setTonnage] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editingMachine;

  useEffect(() => {
    if (editingMachine) {
      setFactoryId(editingMachine.factory_id);
      setCode(editingMachine.code);
      setName(editingMachine.name);
      setType(editingMachine.type || 'Injection Mold');
      setTonnage(editingMachine.tonnage || '');
      setStatus(editingMachine.status || 'active');
    } else {
      setFactoryId(factories.length > 0 ? factories[0].id : '');
      setCode('');
      setName('');
      setType('Injection Mold');
      setTonnage('');
      setStatus('active');
    }
    setError(null);
  }, [editingMachine, isOpen, factories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!factoryId || !code.trim() || !name.trim()) {
      setError('Pabrik, Kode Mesin, dan Nama Mesin wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await onUpdateSubmit(editingMachine.id, {
          factory_id: factoryId,
          code: code.trim(),
          name: name.trim(),
          type: type.trim() || 'Injection Mold',
          tonnage: tonnage.trim() || undefined,
          status,
        });
      } else {
        await onCreateSubmit({
          factory_id: factoryId,
          code: code.trim(),
          name: name.trim(),
          type: type.trim() || 'Injection Mold',
          tonnage: tonnage.trim() || undefined,
          status,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data mesin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Data Mesin' : 'Tambah Mesin Baru'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Simpan Perubahan' : 'Simpan Mesin'}
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

        {/* Factory Dropdown Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Pabrik (Factory Location)
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Building2
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <select
              value={factoryId}
              onChange={(e) => setFactoryId(e.target.value)}
              style={{
                width: '100%',
                paddingTop: '0.625rem',
                paddingBottom: '0.625rem',
                paddingLeft: '2.5rem',
                paddingRight: '0.75rem',
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
              }}
              required
            >
              {factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.code} - {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Kode Mesin"
          placeholder="misal MC-01, MC-02"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          leftIcon={<Tag size={18} />}
          required
        />

        <Input
          label="Nama Mesin"
          placeholder="misal Injection Mold 850T"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<Cpu size={18} />}
          required
        />

        <Input
          label="Tipe Mesin"
          placeholder="misal Injection Mold"
          value={type}
          onChange={(e) => setType(e.target.value)}
          leftIcon={<Layers size={18} />}
        />

        <Input
          label="Kapasitas Tonase (Opsional)"
          placeholder="misal 850 Ton"
          value={tonnage}
          onChange={(e) => setTonnage(e.target.value)}
          leftIcon={<Gauge size={18} />}
        />

        {/* Status Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Status Operasional Mesin
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Activity
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              style={{
                width: '100%',
                paddingTop: '0.625rem',
                paddingBottom: '0.625rem',
                paddingLeft: '2.5rem',
                paddingRight: '0.75rem',
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
              }}
            >
              <option value="active">Active (Siap Beroperasi)</option>
              <option value="inactive">Inactive (Non-Aktif / Maintenance)</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};
