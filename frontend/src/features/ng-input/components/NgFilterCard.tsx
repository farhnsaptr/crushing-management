import React from 'react';
import { Card } from '../../../components/common/Card';
import type { FilterMode, Factory } from '../types/ngInput.types';
import { JENIS_PART_OPTIONS } from '../hooks/useNgInput';
import { Layers, Building2, Filter } from 'lucide-react';

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={16} style={{ color: 'var(--primary-color)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Filter Kategori Part
            </span>
          </div>

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
              <span>Jenis Part</span>
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
              <span>Factory</span>
            </button>
          </div>
        </div>

        {/* Dropdown Selection Bar */}
        <div>
          {filterMode === 'jenis' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Pilih Kategori Jenis Part
              </label>
              <select
                value={selectedJenis}
                onChange={(e) => onSelectJenis(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {activeJenisList.map((jenis) => (
                  <option key={jenis} value={jenis}>
                    {jenis}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Pilih Factory / Lokasi Pabrik
              </label>
              <select
                value={selectedFactoryId}
                onChange={(e) => onSelectFactoryId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {factories.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
