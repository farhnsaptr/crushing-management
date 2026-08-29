import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import type { MasterPart, CreateMasterPartPayload, MasterModel } from '../types/masterParts.types';
import type { Machine } from '../../machines/types/machines.types';
import { MasterPartsService } from '../services/masterParts.service';
import { MaterialsService } from '../../materials/services/materials.service';
import type { Material } from '../../materials/types/materials.types';
import { Tag, Cpu, UserCheck, Layers, Scale, Code, Search, Check, Box, Car } from 'lucide-react';

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
  const [modelId, setModelId] = useState<string>('');
  const [partNumber, setPartNumber] = useState<string>('');
  const [partName, setPartName] = useState<string>('');
  const [jenisPart, setJenisPart] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [materialId, setMaterialId] = useState<string>('');
  const [shikake, setShikake] = useState<number>(1);
  const [beratPartGr, setBeratPartGr] = useState<number>(0);
  const [beratRunnerGr, setBeratRunnerGr] = useState<number>(0);

  const [modelsList, setModelsList] = useState<MasterModel[]>([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState<boolean>(false);
  const materialDropdownRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editingPart;

  // Fetch materials & models dynamically from backend
  useEffect(() => {
    if (isOpen) {
      MaterialsService.listMaterials(1, 300)
        .then((res) => {
          setMaterialsList(res || []);
        })
        .catch((err) => {
          console.error('Failed to load materials for master parts modal:', err);
        });

      MasterPartsService.getAllModels()
        .then((res) => {
          setModelsList(res || []);
        })
        .catch((err) => {
          console.error('Failed to load models for master parts modal:', err);
        });
    }
  }, [isOpen]);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        materialDropdownRef.current &&
        !materialDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMaterialDropdownOpen(false);
      }
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (editingPart) {
      setSebangoCode(editingPart.sebango_code);
      setMachineId(editingPart.machine_id);
      setCustomer(editingPart.customer || '');
      setModelCode(editingPart.model_code || '');
      setModelId(editingPart.model_id || '');
      setPartNumber(editingPart.part_number);
      setPartName(editingPart.part_name);
      setJenisPart(editingPart.jenis_part || '');
      setMaterial(editingPart.material || '');
      setMaterialId('');
      setShikake(editingPart.shikake || 1);
      setBeratPartGr(editingPart.berat_part_gr || 0);
      setBeratRunnerGr(editingPart.berat_runner_gr || 0);
    } else {
      setSebangoCode('');
      setMachineId(machines.length > 0 ? machines[0].id : '');
      setCustomer('');
      setModelCode('');
      setModelId('');
      setPartNumber('');
      setPartName('');
      setJenisPart('');
      setMaterial('');
      setMaterialId('');
      setShikake(1);
      setBeratPartGr(0);
      setBeratRunnerGr(0);
    }
    setError(null);
    setIsMaterialDropdownOpen(false);
    setIsModelDropdownOpen(false);
  }, [editingPart, isOpen, machines]);

  const filteredMaterials = materialsList.filter((m) =>
    m.material_name.toLowerCase().includes(material.toLowerCase())
  );

  const filteredModels = modelsList.filter((m) =>
    m.model_code.toLowerCase().includes(modelCode.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(modelCode.toLowerCase()))
  );

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
          model_id: modelId || undefined,
          model_code: modelCode.trim() || undefined,
          material_id: materialId || undefined,
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
          model_id: modelId || undefined,
          model_code: modelCode.trim() || undefined,
          material_id: materialId || undefined,
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
            label="Kode Sebango"
            placeholder="misal U0-5036/7-202B"
            value={sebangoCode}
            onChange={(e) => setSebangoCode(e.target.value)}
            leftIcon={<Tag size={18} />}
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Mesin & Pabrik <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 0.75rem 0 2.5rem',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
                required
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code}) - {m.factory_name}
                  </option>
                ))}
              </select>
              <Cpu
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Searchable Model Selector */}
          <div ref={modelDropdownRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Model Kendaraan <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>(Cari / Pilih Model)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="misal 660A, D74A, D26A..."
                value={modelCode}
                onFocus={() => setIsModelDropdownOpen(true)}
                onChange={(e) => {
                  setModelCode(e.target.value);
                  setModelId('');
                  setIsModelDropdownOpen(true);
                }}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 0.75rem 0 2.5rem',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <Car
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Dynamic Searchable Model Dropdown */}
            {isModelDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  marginTop: '4px',
                }}
              >
                {filteredModels.length === 0 ? (
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                    Model "{modelCode}" tidak ditemukan di database.
                    <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#008d51', fontWeight: 700 }}>
                      *Akan otomatis didaftarkan sebagai model baru saat disimpan.
                    </div>
                  </div>
                ) : (
                  filteredModels.map((m) => {
                    const isSelected = modelCode.toUpperCase() === m.model_code.toUpperCase();
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setModelCode(m.model_code);
                          setModelId(m.id);
                          setIsModelDropdownOpen(false);
                        }}
                        style={{
                          padding: '0.65rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(0, 141, 81, 0.08)' : 'transparent',
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isSelected ? 'rgba(0, 141, 81, 0.12)' : '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isSelected ? 'rgba(0, 141, 81, 0.08)' : 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Car size={16} color="#2563eb" />
                          <span style={{ fontWeight: isSelected ? 800 : 600, fontSize: '0.85rem', color: '#0f172a' }}>
                            {m.model_code}
                          </span>
                          {m.description && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              - {m.description}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check size={14} color="#008d51" />}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <Input
            label="Customer"
            placeholder="misal ADM, TMMIN, HPM"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            leftIcon={<UserCheck size={18} />}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Input
            label="Part Number"
            placeholder="misal 62631/2-BZ030"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            leftIcon={<Code size={18} />}
            required
          />

          <Input
            label="Part Name"
            placeholder="misal BOARD, QUARTER TRIM, RR RH/LH"
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            leftIcon={<Tag size={18} />}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Input
            label="Jenis Part"
            placeholder="misal QUARTER TRIM, BUMPER"
            value={jenisPart}
            onChange={(e) => setJenisPart(e.target.value)}
            leftIcon={<Layers size={18} />}
          />

          {/* Searchable Material Input with Dynamic Dropdown */}
          <div ref={materialDropdownRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Material Resin <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>(Cari dari Master Material)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Ketik untuk mencari material..."
                value={material}
                onFocus={() => setIsMaterialDropdownOpen(true)}
                onChange={(e) => {
                  setMaterial(e.target.value);
                  setMaterialId('');
                  setIsMaterialDropdownOpen(true);
                }}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 0.75rem 0 2.5rem',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Dynamic Searchable Material Dropdown */}
            {isMaterialDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  marginTop: '4px',
                }}
              >
                {filteredMaterials.length === 0 ? (
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                    Material "{material}" tidak ditemukan di database.
                    <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#008d51', fontWeight: 700 }}>
                      *Akan otomatis didaftarkan sebagai material baru saat disimpan.
                    </div>
                  </div>
                ) : (
                  filteredMaterials.map((m) => {
                    const isSelected = material.toLowerCase() === m.material_name.toLowerCase();
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setMaterial(m.material_name);
                          setMaterialId(m.id);
                          setIsMaterialDropdownOpen(false);
                        }}
                        style={{
                          padding: '0.65rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(0, 141, 81, 0.08)' : 'transparent',
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isSelected ? 'rgba(0, 141, 81, 0.12)' : '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isSelected ? 'rgba(0, 141, 81, 0.08)' : 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Box size={16} color="#008d51" />
                          <span style={{ fontWeight: isSelected ? 800 : 600, fontSize: '0.85rem', color: '#0f172a' }}>
                            {m.material_name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Badge variant={m.recycle_type === 'reuse' ? 'success' : 'neutral'} size="sm">
                            {m.recycle_type === 'reuse' ? 'Reuse' : 'No Reuse'}
                          </Badge>
                          {isSelected && <Check size={14} color="#008d51" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          <Input
            label="Shikake"
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
