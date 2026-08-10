import React from 'react';
import { Card } from '../../../components/common/Card';
import { Spinner } from '../../../components/common/Spinner';
import type { MasterPart } from '../types/ngInput.types';
import { Package, CheckCircle2 } from 'lucide-react';

interface NgPartGridCardProps {
  parts: MasterPart[];
  isLoading: boolean;
  selectedPartId: string | null;
  onSelectPart: (part: MasterPart) => void;
  title: string;
}

export const NgPartGridCard: React.FC<NgPartGridCardProps> = ({
  parts,
  isLoading,
  selectedPartId,
  onSelectPart,
  title,
}) => {
  return (
    <Card title={title} subtitle={`Menampilkan ${parts.length} item part`}>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Spinner size={36} />
        </div>
      ) : parts.length === 0 ? (
        <div
          style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)',
          }}
        >
          <Package size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Tidak ada part terdaftar pada kategori ini.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
            maxHeight: '620px',
            overflowY: 'auto',
            paddingRight: '0.25rem',
          }}
        >
          {parts.map((part) => {
            const isSelected = selectedPartId === part.id;
            return (
              <div
                key={part.id}
                onClick={() => onSelectPart(part)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.06)' : 'var(--bg-card)',
                  border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Selected Indicator Badge */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      zIndex: 2,
                      backgroundColor: 'var(--primary-color)',
                      color: '#ffffff',
                      borderRadius: '50%',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                )}

                {/* Part Image Thumbnail Container (16:9) */}
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    backgroundColor: 'var(--bg-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  {part.image_url ? (
                    <img
                      src={part.image_url}
                      alt={part.part_name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Package size={28} style={{ opacity: 0.4 }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Foto Part</span>
                    </div>
                  )}
                </div>

                {/* Part Details Info */}
                <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: '0.875rem',
                      color: 'var(--text-main)',
                      lineHeight: '1.25',
                    }}
                  >
                    {part.part_name}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {part.part_number}
                    </span>

                    {part.model_code && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.4rem',
                          backgroundColor: 'var(--bg-main)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        Model {part.model_code}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
