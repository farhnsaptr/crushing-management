import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { MaterialSearchInput } from './MaterialSearchInput';
import { apiClient } from '../../../services/api.client';
import { PlusCircle, Calendar, Scale, Save, Trash2, Plus, Hash } from 'lucide-react';

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
  batch_ref: string;
  items: Array<{
    material_id?: string | null;
    material_name: string;
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
      batch_ref: autoBatchRef,
      items: payloadItems,
    });

    // Reset Form to single row
    const defaultMatId = materials.length > 0 ? materials[0].id : 'CUSTOM';
    setRows([
      {
        id: String(Date.now()),
        selectedMaterialId: defaultMatId,
        customMaterialName: '',
        totalRunnerWeightKg: '',
      },
    ]);
  };

  return (
    <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Form Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
            Input Manual Part Runner NG
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
            Tambah satu atau beberapa transaksi runner material sekaligus tanpa mengunggah file CSV.
          </p>
        </div>


      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Transaction Date Section */}
        <div style={{ maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Tanggal Produksi <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <Input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            leftIcon={<Calendar size={16} />}
            required
          />
        </div>

        {/* Dynamic Material Rows List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Daftar Runner Material ({rows.length} Material)
          </label>

          {rows.map((row, idx) => {
            const isCustomMat = row.selectedMaterialId === 'CUSTOM' || materials.length === 0;

            return (
              <div
                key={row.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'var(--bg-main, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ paddingTop: '0.5rem', fontWeight: 800, color: 'var(--text-muted, #64748b)', fontSize: '0.85rem', width: '24px' }}>
                  #{idx + 1}
                </div>

                {/* Material Selection via Search Autocomplete */}
                <div style={{ flex: '2', minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Material <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <MaterialSearchInput
                    materials={materials}
                    value={{
                      selectedMaterialId: row.selectedMaterialId,
                      customMaterialName: row.customMaterialName,
                    }}
                    onChange={(val) => {
                      handleUpdateRow(row.id, 'selectedMaterialId', val.selectedMaterialId);
                      handleUpdateRow(row.id, 'customMaterialName', val.customMaterialName);
                    }}
                    required
                  />
                </div>

                {/* Runner Weight Input */}
                <div style={{ flex: '1.5', minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Total Berat Runner (kg) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.001"
                    min={0.001}
                    value={row.totalRunnerWeightKg}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleUpdateRow(row.id, 'totalRunnerWeightKg', val === '' ? '' : parseFloat(val) || '');
                    }}
                    placeholder="Total berat kg..."
                    leftIcon={<Scale size={15} />}
                    required
                  />
                </div>

                {/* Remove Row Button */}
                <div style={{ paddingTop: '1.5rem' }}>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveRow(row.id)}
                    disabled={rows.length <= 1}
                    title="Hapus baris ini"
                    style={{ padding: '0.55rem', opacity: rows.length <= 1 ? 0.4 : 1 }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Row Button & Batch Summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddRow}
            leftIcon={<Plus size={18} />}
            style={{ fontWeight: 700 }}
          >
            Tambah Runner
          </Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-main, #0f172a)' }}>
              Total Akumulasi: <strong style={{ color: 'var(--secondary-color, #e76114)', fontSize: '1rem' }}>{calculateTotalWeight().toFixed(3)} kg</strong>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              style={{ minWidth: '200px', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
              leftIcon={<Save size={18} />}
            >
              {isLoading ? 'Menyimpan...' : `Simpan (${rows.length}) Data Runner`}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
