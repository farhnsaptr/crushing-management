import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { MaterialSearchInput } from './MaterialSearchInput';
import { apiClient } from '../../../services/api.client';
import { PlusCircle, Calendar, Scale, Save, Trash2, Plus, Sun, Moon, Layers } from 'lucide-react';

export interface MasterMaterialOption {
  id: string;
  material_name: string;
  material_code?: string;
}

export interface ManualRunnerRowItem {
  id: string;
  selectedMaterialId: string;
  customMaterialName: string;
  totalRunnerWeightKg: number | '';
}

export interface ManualRunnerBatchPayload {
  transaction_date: string;
  shift: 'Pagi' | 'Malam';
  batch_ref: string;
  items: Array<{
    material_id?: string | null;
    material_name: string;
    shift: 'Pagi' | 'Malam';
    total_pcs: number;
    total_runner_weight_kg: number;
  }>;
}

interface RunnerManualFormCardProps {
  onSubmitManualBatch: (payload: ManualRunnerBatchPayload) => Promise<void>;
  isLoading: boolean;
}

export const RunnerManualFormCard: React.FC<RunnerManualFormCardProps> = ({
  onSubmitManualBatch,
  isLoading,
}) => {
  const [materials, setMaterials] = useState<MasterMaterialOption[]>([]);

  const getTodayDate = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const [transactionDate, setTransactionDate] = useState<string>(getTodayDate());
  const [shift, setShift] = useState<'Pagi' | 'Malam'>('Pagi');

  // Initial row with unique ID
  const [rows, setRows] = useState<ManualRunnerRowItem[]>([
    {
      id: String(Date.now()),
      selectedMaterialId: '',
      customMaterialName: '',
      totalRunnerWeightKg: '',
    },
  ]);

  // Load master materials list for dropdown select
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await apiClient.get('/api/materials', { params: { page: 1, limit: 100 } });
        if (response.data && response.data.data && Array.isArray(response.data.data.materials)) {
          const matList = response.data.data.materials;
          setMaterials(matList);

          // Set initial default material for the first row if available
          setRows((prevRows) =>
            prevRows.map((r, idx) =>
              idx === 0 && !r.selectedMaterialId && matList.length > 0
                ? { ...r, selectedMaterialId: matList[0].id }
                : r
            )
          );
        }
      } catch (err) {
        console.warn('Failed to load master materials for manual form:', err);
      }
    };
    fetchMaterials();
  }, []);

  const handleAddRow = () => {
    const defaultMatId = materials.length > 0 ? materials[0].id : 'CUSTOM';
    setRows((prev) => [
      ...prev,
      {
        id: String(Date.now()) + Math.random().toString(36).substring(2, 5),
        selectedMaterialId: defaultMatId,
        customMaterialName: '',
        totalRunnerWeightKg: '',
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRow = (id: string, field: keyof ManualRunnerRowItem, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const calculateTotalWeight = () => {
    return rows.reduce((sum, r) => sum + (typeof r.totalRunnerWeightKg === 'number' ? r.totalRunnerWeightKg : 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionDate) {
      alert('Harap pilih tanggal produksi.');
      return;
    }

    const payloadItems: Array<{
      material_id?: string | null;
      material_name: string;
      shift: 'Pagi' | 'Malam';
      total_pcs: number;
      total_runner_weight_kg: number;
    }> = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      let finalMatName = '';
      let finalMatId: string | null = null;

      if (r.selectedMaterialId === 'CUSTOM' || !r.selectedMaterialId) {
        finalMatName = r.customMaterialName.trim();
      } else {
        const foundMat = materials.find((m) => m.id === r.selectedMaterialId);
        if (foundMat) {
          finalMatName = foundMat.material_name;
          finalMatId = foundMat.id;
        } else {
          finalMatName = r.customMaterialName.trim();
        }
      }

      if (!finalMatName) {
        alert(`Baris #${i + 1}: Harap pilih atau ketik nama material.`);
        return;
      }

      if (typeof r.totalRunnerWeightKg !== 'number' || r.totalRunnerWeightKg <= 0) {
        alert(`Baris #${i + 1} (${finalMatName}): Masukkan Total Berat Runner (kg) yang valid.`);
        return;
      }

      payloadItems.push({
        material_id: finalMatId,
        material_name: finalMatName,
        shift,
        total_pcs: 0,
        total_runner_weight_kg: r.totalRunnerWeightKg,
      });
    }

    // Auto-generate Batch Ref
    const cleanDateStr = transactionDate.replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const autoBatchRef = `MANUAL-${cleanDateStr}-${randomSuffix}`;

    await onSubmitManualBatch({
      transaction_date: transactionDate,
      shift,
      batch_ref: autoBatchRef,
      items: payloadItems,
    });

    // Reset rows after submission
    setRows([
      {
        id: String(Date.now()),
        selectedMaterialId: materials.length > 0 ? materials[0].id : 'CUSTOM',
        customMaterialName: '',
        totalRunnerWeightKg: '',
      },
    ]);
  };

  return (
    <Card
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Header Area */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(231, 97, 20, 0.12)',
              color: 'var(--secondary-color, #e76114)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(231, 97, 20, 0.15)',
            }}
          >
            <PlusCircle size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
              Form Input Manual Part Runner NG
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted, #64748b)', margin: '0.2rem 0 0 0' }}>
              Masukkan akumulasi berat runner per jenis material dan shift produksi.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(231, 97, 20, 0.1)',
            color: 'var(--secondary-color, #e76114)',
            fontSize: '0.8rem',
            fontWeight: 800,
            border: '1px solid rgba(231, 97, 20, 0.25)',
          }}
        >
          <Layers size={14} />
          <span>Multi-Material Batch ({rows.length} Material) — {calculateTotalWeight().toFixed(2)} kg</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Top Controls: Transaction Date & Shift Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Production Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
              Tanggal Produksi <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <Input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              leftIcon={<Calendar size={18} />}
              required
            />
          </div>

          {/* Shift Selector Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
              Shift Produksi <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setShift('Pagi')}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.85rem',
                  borderRadius: '10px',
                  border: `2px solid ${shift === 'Pagi' ? '#008d51' : '#cbd5e1'}`,
                  backgroundColor: shift === 'Pagi' ? 'rgba(0, 141, 81, 0.12)' : '#f8fafc',
                  color: shift === 'Pagi' ? '#008d51' : '#64748b',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  boxShadow: shift === 'Pagi' ? '0 2px 8px rgba(0, 141, 81, 0.18)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <Sun size={17} color={shift === 'Pagi' ? '#008d51' : '#64748b'} />
                <span>Shift Pagi (D)</span>
              </button>

              <button
                type="button"
                onClick={() => setShift('Malam')}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.85rem',
                  borderRadius: '10px',
                  border: `2px solid ${shift === 'Malam' ? '#e76114' : '#cbd5e1'}`,
                  backgroundColor: shift === 'Malam' ? 'rgba(231, 97, 20, 0.12)' : '#f8fafc',
                  color: shift === 'Malam' ? '#e76114' : '#64748b',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  boxShadow: shift === 'Malam' ? '0 2px 8px rgba(231, 97, 20, 0.18)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <Moon size={17} color={shift === 'Malam' ? '#e76114' : '#64748b'} />
                <span>Shift Malam (N)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Material Rows Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
              Daftar Material Runner
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              leftIcon={<Plus size={15} />}
              style={{ fontWeight: 700, fontSize: '0.8rem' }}
            >
              + Tambah Runner Material
            </Button>
          </div>

          {rows.map((rowItem, idx) => (
            <div
              key={rowItem.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(240px, 2fr) minmax(180px, 1fr) auto',
                gap: '0.85rem',
                alignItems: 'end',
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
              }}
            >
              {/* Searchable Material Autocomplete Input */}
              <MaterialSearchInput
                materials={materials}
                selectedMaterialId={rowItem.selectedMaterialId}
                customMaterialName={rowItem.customMaterialName}
                onSelectMaterialId={(val) => handleUpdateRow(rowItem.id, 'selectedMaterialId', val)}
                onChangeCustomName={(val) => handleUpdateRow(rowItem.id, 'customMaterialName', val)}
                rowLabel={`Baris #${idx + 1}`}
              />

              {/* Total Runner Weight (kg) Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Total Runner (kg) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={rowItem.totalRunnerWeightKg}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleUpdateRow(
                      rowItem.id,
                      'totalRunnerWeightKg',
                      val === '' ? '' : parseFloat(val)
                    );
                  }}
                  leftIcon={<Scale size={16} />}
                  required
                />
              </div>

              {/* Remove Row Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveRow(rowItem.id)}
                disabled={rows.length <= 1}
                style={{ color: rows.length <= 1 ? '#cbd5e1' : '#ef4444', marginBottom: '0.15rem' }}
                title="Hapus baris ini"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
        </div>

        {/* Submit Actions Area */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
            Batch Reference akan ter-generate otomatis saat disimpan.
          </div>

          <Button
            type="submit"
            variant="secondary"
            isLoading={isLoading}
            leftIcon={<Save size={18} />}
            style={{ fontWeight: 800, padding: '0.65rem 1.75rem', backgroundColor: '#e76114', color: '#ffffff' }}
          >
            Simpan Data Runner ({rows.length} Material)
          </Button>
        </div>
      </form>
    </Card>
  );
};
