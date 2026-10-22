import React, { useState, useEffect } from 'react';
import { Edit2, X } from 'lucide-react';
import type { DatabaseRequestHeader } from '../types/databaseManagement.types';

interface EditRequestHeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DatabaseRequestHeader | null;
  departments: Array<{ id: string; name: string }>;
  factories: Array<{ id: string; name: string }>;
  onUpdate: (payload: {
    request_date?: string;
    shift?: 'Pagi' | 'Malam';
    department_id?: string;
    factory_id?: string | null;
    notes?: string | null;
  }) => Promise<void>;
}

export const EditRequestHeaderModal: React.FC<EditRequestHeaderModalProps> = ({
  isOpen,
  onClose,
  request,
  departments,
  factories,
  onUpdate,
}) => {
  const [requestDate, setRequestDate] = useState<string>('');
  const [shift, setShift] = useState<'Pagi' | 'Malam'>('Pagi');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [factoryId, setFactoryId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (request) {
      setRequestDate(request.request_date || '');
      setShift(request.shift || 'Pagi');
      setDepartmentId(request.department_id || '');
      setFactoryId(request.factory_id || '');
      setNotes(request.notes || '');
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate({
        request_date: requestDate,
        shift,
        department_id: departmentId,
        factory_id: factoryId || null,
        notes,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Edit Informasi Tiket ({request.request_number})
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
              Tanggal Pengiriman:
            </label>
            <input
              type="date"
              required
              value={requestDate}
              onChange={(e) => setRequestDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.82rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
              Shift Kerja:
            </label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as 'Pagi' | 'Malam')}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.82rem',
                backgroundColor: '#ffffff',
                fontWeight: 700,
              }}
            >
              <option value="Pagi">Shift Pagi</option>
              <option value="Malam">Shift Malam</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
              Departemen Pengirim:
            </label>
            <select
              required
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.82rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">-- Pilih Departemen --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
              Pabrik:
            </label>
            <select
              value={factoryId}
              onChange={(e) => setFactoryId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.82rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">-- Pilih Pabrik --</option>
              {factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
              Catatan Tiket:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.82rem',
                fontFamily: 'inherit',
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
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Header'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
