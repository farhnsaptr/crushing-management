import React, { useState, useRef, useEffect } from 'react';
import { Search, Layers, Check, Plus, X } from 'lucide-react';
import type { MasterMaterialOption } from './RunnerManualFormCard';

export interface MaterialSearchInputValue {
  selectedMaterialId: string;
  customMaterialName: string;
}

export interface MaterialSearchInputProps {
  materials: MasterMaterialOption[];
  value?: MaterialSearchInputValue;
  onChange?: (val: MaterialSearchInputValue) => void;
  selectedMaterialId?: string;
  customMaterialName?: string;
  onSelectMaterialId?: (val: string) => void;
  onChangeCustomName?: (val: string) => void;
  rowLabel?: string;
  placeholder?: string;
  required?: boolean;
}

export const MaterialSearchInput: React.FC<MaterialSearchInputProps> = ({
  materials,
  value,
  onChange,
  selectedMaterialId,
  customMaterialName,
  onSelectMaterialId,
  onChangeCustomName,
  rowLabel,
  placeholder = 'Cari atau ketik nama material (misal: ABS, PP...)...',
  required = false,
}) => {
  const currentSelectedId = selectedMaterialId ?? value?.selectedMaterialId ?? '';
  const currentCustomName = customMaterialName ?? value?.customMaterialName ?? '';

  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const emitChange = (newId: string, newCustomName: string) => {
    if (onSelectMaterialId) onSelectMaterialId(newId);
    if (onChangeCustomName) onChangeCustomName(newCustomName);
    if (onChange) onChange({ selectedMaterialId: newId, customMaterialName: newCustomName });
  };

  // Sync displayed query with current selected material or custom name
  useEffect(() => {
    if (currentSelectedId && currentSelectedId !== 'CUSTOM') {
      const found = materials.find((m) => m.id === currentSelectedId);
      if (found) {
        setQuery(found.material_name);
        return;
      }
    }
    if (currentCustomName) {
      setQuery(currentCustomName);
    }
  }, [currentSelectedId, currentCustomName, materials]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter materials list based on search query
  const filteredMaterials = materials.filter((m) =>
    m.material_name.toLowerCase().includes(query.trim().toLowerCase()) ||
    (m.material_code && m.material_code.toLowerCase().includes(query.trim().toLowerCase()))
  );

  const handleSelectMaterial = (mat: MasterMaterialOption) => {
    setQuery(mat.material_name);
    emitChange(mat.id, '');
    setIsOpen(false);
  };

  const handleSelectCustom = (customName: string) => {
    const trimmed = customName.trim();
    setQuery(trimmed);
    emitChange('CUSTOM', trimmed);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);

    // Try exact match with existing materials
    const exactMatch = materials.find((m) => m.material_name.toLowerCase() === newQuery.trim().toLowerCase());
    if (exactMatch) {
      emitChange(exactMatch.id, '');
    } else {
      emitChange('CUSTOM', newQuery);
    }
  };

  const handleClear = () => {
    setQuery('');
    emitChange('', '');
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {rowLabel && (
        <label style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '0.3rem', display: 'block' }}>
          Nama Material ({rowLabel}) <span style={{ color: '#ef4444' }}>*</span>
        </label>
      )}

      {/* Input Field with Search Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-md, 8px)',
          border: isOpen ? '1px solid var(--primary-color, #008d51)' : '1px solid var(--border-color, #cbd5e1)',
          backgroundColor: 'var(--bg-card, #ffffff)',
          boxShadow: isOpen ? '0 0 0 3px rgba(0, 141, 81, 0.15)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <Search size={16} color="var(--text-muted, #64748b)" style={{ flexShrink: 0 }} />
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required && !query.trim()}
          style={{
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-main, #0f172a)',
            fontSize: '0.875rem',
            fontWeight: 600,
            width: '100%',
          }}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #94a3b8)',
              padding: '0.1rem',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Bersihkan pencarian"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Searchable Dropdown Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 99,
            maxHeight: '220px',
            overflowY: 'auto',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-color, #cbd5e1)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '0.35rem 0',
          }}
        >
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((mat) => {
              const isSelected = currentSelectedId === mat.id;

              return (
                <div
                  key={mat.id}
                  onClick={() => handleSelectMaterial(mat)}
                  style={{
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? 'var(--primary-color, #008d51)' : 'var(--text-main, #0f172a)',
                    backgroundColor: isSelected ? 'rgba(0, 141, 81, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-main, #f1f5f9)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={15} color="var(--primary-color, #008d51)" />
                    <span>{mat.material_name}</span>
                    {mat.material_code && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                        ({mat.material_code})
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={16} color="var(--primary-color, #008d51)" />}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '0.65rem 0.85rem', fontSize: '0.825rem', color: 'var(--text-muted, #64748b)' }}>
              Tidak ada material master yang cocok.
            </div>
          )}

          {/* Option to use custom input if typed query is not empty */}
          {query.trim() && !filteredMaterials.some((m) => m.material_name.toLowerCase() === query.trim().toLowerCase()) && (
            <div
              onClick={() => handleSelectCustom(query)}
              style={{
                padding: '0.65rem 0.85rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: 'var(--secondary-color, #e76114)',
                backgroundColor: 'rgba(231, 97, 20, 0.06)',
                borderTop: '1px solid var(--border-color, #e2e8f0)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Plus size={15} />
              <span>Gunakan "<strong>{query.trim()}</strong>" sebagai Nama Material Baru</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
