import React from 'react';
import { Card } from '../../../components/common/Card';
import type { FilterMode, Factory } from '../types/ngInput.types';
import { JENIS_PART_OPTIONS } from '../hooks/useNgInput';
import { Layers, Building2 } from 'lucide-react';

interface NgFilterCardProps {
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  selectedJenis: string;
  onSelectJenis: (jenis: string) => void;
  jenisOptions?: string[];
  selectedFactoryId: string;
  onSelectFactoryId: (factoryId: string) => void;
  factories: Factory[];
}

export const NgFilterCard: React.FC<NgFilterCardProps> = ({
  filterMode,
  onFilterModeChange,
  selectedJenis,
  onSelectJenis,
  jenisOptions = JENIS_PART_OPTIONS,
  selectedFactoryId,
  onSelectFactoryId,
  factories,
}) => {
  const activeJenisList = jenisOptions.length > 0 ? jenisOptions : JENIS_PART_OPTIONS;

  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Top Segmented Toggle: Choose Filter Mode */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mode Pengelompokan (Pilih Salah Satu)
          </span>

          <div
            style={{
              display: 'inline-flex',
              padding: '0.25rem',
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => onFilterModeChange('jenis')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                fontSize: '0.8rem',
                fontWeight: filterMode === 'jenis' ? 800 : 500,
                color: filterMode === 'jenis' ? '#ffffff' : 'var(--text-muted)',
                backgroundColor: filterMode === 'jenis' ? 'var(--primary-color)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Layers size={14} />
              <span>Berdasarkan Jenis Part</span>
            </button>

            <button
              type="button"
              onClick={() => onFilterModeChange('factory')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                fontSize: '0.8rem',
                fontWeight: filterMode === 'factory' ? 800 : 500,
                color: filterMode === 'factory' ? '#ffffff' : 'var(--text-muted)',
                backgroundColor: filterMode === 'factory' ? 'var(--primary-color)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Building2 size={14} />
              <span>Berdasarkan Factory</span>
            </button>
          </div>
        </div>

        {/* Chips Filter Options Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', paddingTop: '0.25rem' }}>
          {filterMode === 'jenis' ? (
            activeJenisList.map((jenis) => {
              const isSelected = selectedJenis.toUpperCase() === jenis.toUpperCase();
              return (
                <button
                  key={jenis}
                  type="button"
                  onClick={() => onSelectJenis(jenis)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '2rem',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? '#ffffff' : 'var(--text-main)',
                    backgroundColor: isSelected ? 'var(--primary-color)' : 'var(--bg-main)',
                    border: isSelected ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(59, 130, 246, 0.25)' : 'none',
                  }}
                >
                  {jenis}
                </button>
              );
            })
          ) : (
            factories.map((fac) => {
              const isSelected = selectedFactoryId === fac.id;
              return (
                <button
                  key={fac.id}
                  type="button"
                  onClick={() => onSelectFactoryId(fac.id)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '2rem',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? '#ffffff' : 'var(--text-main)',
                    backgroundColor: isSelected ? 'var(--primary-color)' : 'var(--bg-main)',
                    border: isSelected ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(59, 130, 246, 0.25)' : 'none',
                  }}
                >
                  {fac.name} ({fac.code})
                </button>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
};
