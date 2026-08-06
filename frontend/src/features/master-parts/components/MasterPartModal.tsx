import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import type { MasterPart, CreateMasterPartPayload } from '../types/masterParts.types';
import type { Machine } from '../../machines/types/machines.types';
import { Tag, Cpu, UserCheck, Layers, Scale, Code } from 'lucide-react';

interface MasterPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPart?: MasterPart | null;
  machines: Machine[];
  onCreateSubmit: (payload: CreateMasterPartPayload) => Promise<void>;
  onUpdateSubmit: (id: string, payload: Partial<CreateMasterPartPayload>) => Promise<void>;
}

export const MasterPartModal: React.FC<MasterPartModalProps> = ({
  isOpen,
  onClose,
  editingPart,
  machines,
  onCreateSubmit,
  onUpdateSubmit,
}) => {
  const [sebangoCode, setSebangoCode] = useState<string>('');
  const [machineId, setMachineId] = useState<string>('');
  const [customer, setCustomer] = useState<string>('');
  const [modelCode, setModelCode] = useState<string>('');
  const [partNumber, setPartNumber] = useState<string>('');
  const [partName, setPartName] = useState<string>('');
  const [jenisPart, setJenisPart] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [shikake, setShikake] = useState<number>(1);
  const [beratPartGr, setBeratPartGr] = useState<number>(0);
  const [beratRunnerGr, setBeratRunnerGr] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editingPart;

  useEffect(() => {
    if (editingPart) {
      setSebangoCode(editingPart.sebango_code);
      setMachineId(editingPart.machine_id);
      setCustomer(editingPart.customer || '');
      setModelCode(editingPart.model_code || '');
      setPartNumber(editingPart.part_number);
      setPartName(editingPart.part_name);
      setJenisPart(editingPart.jenis_part || '');
      setMaterial(editingPart.material || '');
      setShikake(editingPart.shikake || 1);
      setBeratPartGr(editingPart.berat_part_gr || 0);
      setBeratRunnerGr(editingPart.berat_runner_gr || 0);
    } else {
      setSebangoCode('');
      setMachineId(machines.length > 0 ? machines[0].id : '');
      setCustomer('');
      setModelCode('');
      setPartNumber('');
      setPartName('');
      setJenisPart('');
      setMaterial('');
      setShikake(1);
      setBeratPartGr(0);
      setBeratRunnerGr(0);
    }
    setError(null);
  }, [editingPart, isOpen, machines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sebangoCode.trim() || !machineId || !partNumber.trim() || !partName.trim() || !beratPartGr) {
      setError('Sebango Code, Mesin, Part Number, Part Name, dan Berat Part wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await onUpdateSubmit(editingPart.id, {
          sebango_code: sebangoCode.trim(),
          machine_id: machineId,
          customer: customer.trim() || '-',
          model_id: editingPart.model_id,
          part_number: partNumber.trim(),
          part_name: partName.trim(),
          jenis_part: jenisPart.trim() || '-',
          material: material.trim() || '-',
          shikake: Number(shikake) || 1,
          berat_part_gr: Number(beratPartGr) || 0,
          berat_runner_gr: Number(beratRunnerGr) || 0,
        });
      } else {
        await onCreateSubmit({
          sebango_code: sebangoCode.trim(),
          machine_id: machineId,
          customer: customer.trim() || '-',
          model_id: 'default',
          part_number: partNumber.trim(),
          part_name: partName.trim(),
          jenis_part: jenisPart.trim() || '-',
          material: material.trim() || '-',
          shikake: Number(shikake) || 1,
          berat_part_gr: Number(beratPartGr) || 0,
          berat_runner_gr: Number(beratRunnerGr) || 0,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan master part.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Master Part' : 'Tambah Master Part Manual'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Simpan Perubahan' : 'Simpan Part'}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Input
            label="Sebango Code"
            placeholder="misal U0-5604-BLCK"
            value={sebangoCode}
            onChange={(e) => setSebangoCode(e.target.value.toUpperCase())}
            leftIcon={<Tag size={18} />}
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Mesin Injection
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Cpu
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
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
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name} ({m.factory_code || ''})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Input
            label="Customer"
            placeholder="misal ADM, TMMIN"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            leftIcon={<UserCheck size={18} />}
          />

          <Input
            label="Model Kendaraan"
            placeholder="misal D74A, D55L"
            value={modelCode}
            onChange={(e) => setModelCode(e.target.value)}
            leftIcon={<Tag size={18} />}
          />

          <Input
            label="Part Number"
            placeholder="misal 62631/2-BZ030"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            leftIcon={<Code size={18} />}
            required
          />
        </div>

        <Input
          label="Part Name"
          placeholder="misal BOARD, QUARTER TRIM, RR RH/LH"
          value={partName}
          onChange={(e) => setPartName(e.target.value)}
          leftIcon={<Tag size={18} />}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Input
            label="Jenis Part"
            placeholder="misal QUARTER TRIM, BUMPER"
            value={jenisPart}
            onChange={(e) => setJenisPart(e.target.value)}
            leftIcon={<Layers size={18} />}
          />

          <Input
            label="Material Resin"
            placeholder="misal PP2 EXXON AP03-202B"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            leftIcon={<Layers size={18} />}
            list="material-suggestions"
          />
          <datalist id="material-suggestions">
            <option value="PP2 EXXON AP03-202B" />
            <option value="PP2 EXXON" />
            <option value="ABS BLAZE" />
            <option value="POM" />
            <option value="PC/ABS" />
          </datalist>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          <Input
            label="Shikake (Cavity)"
            type="number"
            value={shikake}
            onChange={(e) => setShikake(parseInt(e.target.value, 10) || 1)}
          />

          <Input
            label="Berat Part (gr)"
            type="number"
            value={beratPartGr}
            onChange={(e) => setBeratPartGr(parseFloat(e.target.value) || 0)}
            leftIcon={<Scale size={18} />}
            required
          />

          <Input
            label="Berat Runner (gr)"
            type="number"
            value={beratRunnerGr}
            onChange={(e) => setBeratRunnerGr(parseFloat(e.target.value) || 0)}
            leftIcon={<Scale size={18} />}
          />
        </div>
      </form>
    </Modal>
  );
};
