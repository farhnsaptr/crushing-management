import React, { useState, useEffect } from 'react';
import { Edit2, X } from 'lucide-react';
import type { DatabaseRequestItem } from '../types/databaseManagement.types';

interface EditRequestItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DatabaseRequestItem | null;
  isTicketApproved: boolean;
  onUpdate: (
    itemId: string,
    payload: {
      quantity_pcs?: number;
      weight_kg?: number;
      verified_quantity_pcs?: number;
      verified_weight_kg?: number;
      adjustment_notes?: string | null;
      waste_quantity_pcs?: number;
      notes?: string | null;
    }
  ) => Promise<void>;
}

export const EditRequestItemModal: React.FC<EditRequestItemModalProps> = ({
  isOpen,
  onClose,
  item,
  isTicketApproved,
  onUpdate,
}) => {
  const [quantityPcs, setQuantityPcs] = useState<number>(0);
  const [weightKg, setWeightKg] = useState<number>(0);
  const [verifiedQty, setVerifiedQty] = useState<number>(0);
  const [verifiedWeight, setVerifiedWeight] = useState<number>(0);
  const [wasteQty, setWasteQty] = useState<number>(0);
  const [adjustmentNotes, setAdjustmentNotes] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      setQuantityPcs(item.quantity_pcs || 0);
      setWeightKg(Number(item.weight_kg) || 0);
      setVerifiedQty(item.verified_quantity_pcs ?? item.quantity_pcs);
      setVerifiedWeight(Number(item.verified_weight_kg ?? item.weight_kg) || 0);
      setWasteQty(item.waste_quantity_pcs || 0);
      setAdjustmentNotes(item.adjustment_notes || '');
      setNotes(item.notes || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(item.id, {
        quantity_pcs: quantityPcs,
        weight_kg: weightKg,
        verified_quantity_pcs: isTicketApproved ? verifiedQty : undefined,
        verified_weight_kg: isTicketApproved ? verifiedWeight : undefined,
        waste_quantity_pcs: isTicketApproved ? wasteQty : 0,
        adjustment_notes: adjustmentNotes,
        notes,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPartNg = item.item_type === 'part_ng';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          padding: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1.5px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
            Edit Part Item
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Snapshot info */}
        <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
          <strong style={{ color: '#0f172a' }}>
            {isPartNg ? item.part_name_snapshot : item.material_name_snapshot}
          </strong>
          {isPartNg && (
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              No: {item.part_number_snapshot} | Berat: {item.berat_part_gr_snapshot} gr/pcs
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Input Pengirim Asli */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                Kuantitas Pengirim (Pcs):
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantityPcs}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0;
                  setQuantityPcs(val);
                  if (isPartNg && item.berat_part_gr_snapshot) {
                    setWeightKg(Number(((val * Number(item.berat_part_gr_snapshot)) / 1000).toFixed(2)));
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                Berat Pengirim (kg):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                }}
              />
            </div>
          </div>

          {/* Kolom Verifikasi Fisik (Hanya jika tiket approved) */}
          {isTicketApproved && (
            <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534' }}>
                ✓ Hasil Verifikasi Fisik (Aktif di Transaksi Dashboard):
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                    Verified Total Pcs:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={verifiedQty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setVerifiedQty(val);
                      if (isPartNg && item.berat_part_gr_snapshot) {
                        setVerifiedWeight(Number(((val * Number(item.berat_part_gr_snapshot)) / 1000).toFixed(2)));
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      border: '1.5px solid #86efac',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                    Verified Berat (kg):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={verifiedWeight}
                    onChange={(e) => setVerifiedWeight(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      border: '1.5px solid #86efac',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                    }}
                  />
                </div>
              </div>

              {isPartNg && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.25rem' }}>
                    Dari Total Pcs di atas, berapa pcs Waste (Tidak Direcycle):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={verifiedQty}
                    value={wasteQty}
                    onChange={(e) => setWasteQty(parseInt(e.target.value, 10) || 0)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      border: '1.5px solid #fecaca',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#b91c1c',
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem', display: 'block' }}>
                    Sisa Reuse: <strong>{Math.max(0, verifiedQty - wasteQty)} pcs</strong>
                  </span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                  Catatan Selisih / Penyesuaian Fisik:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Selisih 2 pcs rusak di jalan..."
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid #86efac',
                    fontSize: '0.8rem',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
              Catatan Item:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.82rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--secondary-color, #e76114)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              <Edit2 size={14} />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
