import React, { useState } from 'react';
import { X, FileSpreadsheet, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import type { PlantLocation } from '../types/dashboard.types';

interface ExportDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation: PlantLocation;
  isExporting: boolean;
  onExport: (startDate: string, endDate: string, location: PlantLocation) => Promise<void>;
}

export const ExportDateModal: React.FC<ExportDateModalProps> = ({
  isOpen,
  onClose,
  defaultLocation,
  isExporting,
  onExport,
}) => {
  const now = new Date();
  const defaultStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const defaultEnd = now.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);
  const [location, setLocation] = useState<PlantLocation>(defaultLocation);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    await onExport(startDate, endDate, location);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '1.75rem 2rem',
          color: '#0f172a',
          position: 'relative',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                padding: '0.65rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '12px',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Export Data Transaksi NG
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0', fontWeight: 600 }}>
                Pilih rentang tanggal transaksi untuk diexport ke file Excel (.xlsx)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              color: '#0f172a',
              padding: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Plant Location Selector */}
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
              Lokasi Plant :
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                padding: '3px',
                borderRadius: '16px',
                border: '1px solid #cbd5e1',
              }}
            >
              {(['Cibitung', 'Karawang'] as PlantLocation[]).map((loc) => {
                const isSelected = location === loc;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.95rem',
                      borderRadius: '14px',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--secondary-color, #e76114)' : 'transparent',
                      color: isSelected ? '#ffffff' : '#64748b',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <MapPin size={14} />
                    <span>{loc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                Tanggal Mulai :
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                Tanggal Selesai :
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Export Columns Preview Box */}
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              fontSize: '0.775rem',
              color: '#475569',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              <CheckCircle2 size={14} color="#059669" />
              <span>Susunan Kolom File Excel :</span>
            </div>
            <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.75rem', color: '#0f172a', fontWeight: 700 }}>
              tanggal, shift, sebango, part name, part number, model, berat part, qty per pcs, berat output
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isExporting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.5rem',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: 'var(--secondary-color, #e76114)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                opacity: isExporting ? 0.7 : 1,
                boxShadow: '0 3px 8px rgba(231, 97, 20, 0.3)',
              }}
            >
              <FileSpreadsheet size={18} />
              <span>{isExporting ? 'Downloading...' : 'Download Excel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
