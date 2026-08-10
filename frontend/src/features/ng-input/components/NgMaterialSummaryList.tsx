import React from 'react';
import { ChevronDown, ChevronUp, Search, Calendar, Layers, ExternalLink, MapPin } from 'lucide-react';
import { MONTH_NAMES } from '../hooks/useNgDetail';
import type { MaterialSummaryResponse, PartSummaryItem, PlantLocation } from '../types/ngInput.types';

interface NgMaterialSummaryListProps {
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
  selectedLocation: PlantLocation;
  onLocationChange: (location: PlantLocation) => void;
  onSearch: () => void;
  summaryData: MaterialSummaryResponse | null;
  isLoading: boolean;
  expandedMaterials: Record<string, boolean>;
  onToggleExpand: (materialName: string) => void;
  onOpenPartDetail: (part: PartSummaryItem) => void;
}

export const NgMaterialSummaryList: React.FC<NgMaterialSummaryListProps> = ({
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  selectedLocation,
  onLocationChange,
  onSearch,
  summaryData,
  isLoading,
  expandedMaterials,
  onToggleExpand,
  onOpenPartDetail,
}) => {
  const materials = summaryData?.materials || [];
  const maxWeightKg = summaryData?.max_material_weight_kg || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Mobile Responsive Style Block */}
      <style>{`
        .ng-summary-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          background-color: var(--card-bg, #ffffff);
          padding: 1rem 1.25rem;
          border-radius: var(--radius-lg, 16px);
          border: 1px solid var(--border-color, #e2e8f0);
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .ng-summary-controls {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }
        .ng-material-row {
          border: 1.5px solid #0f172a;
          border-radius: 20px;
          padding: 0.75rem 1.25rem;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
          transition: all 0.2s ease;
          flex-wrap: wrap;
        }
        .ng-material-name {
          flex: 1 1 280px;
          min-width: 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          word-break: break-word;
        }
        .ng-progress-track-mat {
          flex: 1 1 160px;
          min-width: 120px;
          display: flex;
          align-items: center;
          height: 14px;
          background-color: rgba(16, 185, 129, 0.08);
          border-radius: 7px;
          padding: 2px;
          border: 1px solid rgba(16, 185, 129, 0.15);
        }
        .ng-part-row {
          border: 1.5px solid #0f172a;
          border-radius: 16px;
          padding: 0.55rem 1.15rem;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.02);
          flex-wrap: wrap;
        }
        .ng-part-name {
          flex: 1 1 240px;
          min-width: 0;
          font-size: 0.925rem;
          font-weight: 800;
          color: #0f172a;
          word-break: break-word;
        }
        .ng-progress-track-part {
          flex: 1 1 140px;
          min-width: 100px;
          display: flex;
          align-items: center;
          height: 12px;
          background-color: rgba(16, 185, 129, 0.08);
          border-radius: 6px;
          padding: 2px;
          border: 1px solid rgba(16, 185, 129, 0.12);
        }
        .ng-subparts-container {
          padding-left: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-left: 2.5px solid rgba(16, 185, 129, 0.3);
          margin-left: 0.75rem;
          margin-top: 0.25rem;
          margin-bottom: 0.5rem;
        }
        @media (max-width: 640px) {
          .ng-summary-header {
            padding: 0.85rem 1rem !important;
          }
          .ng-summary-controls {
            width: 100%;
            justify-content: flex-start;
          }
          .ng-summary-controls select, .ng-summary-controls input {
            flex: 1;
          }
          .ng-summary-controls button {
            width: 100%;
            justify-content: center;
          }
          .ng-material-row {
            padding: 0.85rem 1rem !important;
            gap: 0.75rem !important;
          }
          .ng-material-name {
            flex: 1 1 100% !important;
            font-size: 1rem !important;
          }
          .ng-progress-track-mat {
            flex: 1 1 100% !important;
            order: 2;
          }
          .ng-part-row {
            padding: 0.75rem 0.85rem !important;
            gap: 0.65rem !important;
          }
          .ng-part-name {
            flex: 1 1 100% !important;
            font-size: 0.875rem !important;
          }
          .ng-progress-track-part {
            flex: 1 1 100% !important;
            order: 2;
          }
          .ng-subparts-container {
            padding-left: 0.75rem !important;
            margin-left: 0.25rem !important;
          }
        }
      `}</style>

      {/* Month / Year / Plant Location Filter Header Bar */}
      <div className="ng-summary-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(231, 97, 20, 0.1)',
              borderRadius: '10px',
              color: 'var(--secondary-color, #e76114)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: 0 }}>
              Filter Periode & Lokasi Plant
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
              Tampilkan data pareto material & part berdasar lokasi plant (Cibitung vs Karawang)
            </p>
          </div>
        </div>

        <div className="ng-summary-controls">
          {/* Plant Location Pill Toggle Group */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              padding: '3px',
              borderRadius: '20px',
              border: '1px solid #cbd5e1',
            }}
          >
            {(['Cibitung', 'Karawang'] as PlantLocation[]).map((loc) => {
              const isSelected = selectedLocation === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => onLocationChange(loc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '18px',
                    border: 'none',
                    backgroundColor: isSelected ? 'var(--secondary-color, #e76114)' : 'transparent',
                    color: isSelected ? '#ffffff' : '#64748b',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.825rem',
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

          {/* Month Select Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '20px',
              border: '1.5px solid var(--secondary-color, #e76114)',
              backgroundColor: 'var(--secondary-color, #e76114)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 2px 6px rgba(231, 97, 20, 0.2)',
            }}
          >
            {MONTH_NAMES.map((m) => (
              <option key={m.value} value={m.value} style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Year Select Input */}
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            min={2020}
            max={2035}
            style={{
              width: '85px',
              padding: '0.55rem 0.75rem',
              borderRadius: '20px',
              border: '1.5px solid var(--secondary-color, #e76114)',
              backgroundColor: 'var(--secondary-color, #e76114)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              textAlign: 'center',
              outline: 'none',
              boxShadow: '0 2px 6px rgba(231, 97, 20, 0.2)',
            }}
          />

          {/* Search Button */}
          <button
            onClick={onSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.35rem',
              borderRadius: '20px',
              border: '1.5px solid #0f172a',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)',
            }}
          >
            <Search size={16} />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Main Material Outer Card Container matching Image 1 */}
      <div
        style={{
          border: '1.5px solid var(--border-color, #cbd5e1)',
          borderRadius: '24px',
          padding: '1.25rem',
          backgroundColor: 'var(--card-bg, #ffffff)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
        }}
      >
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
            Memuat data pareto material NG...
          </div>
        ) : materials.length === 0 ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Layers size={36} strokeWidth={1.5} color="#94a3b8" />
            <span>Tidak ada transaksi NG yang terdeteksi untuk periode ini.</span>
          </div>
        ) : (
          materials.map((mat) => {
            const isExpanded = !!expandedMaterials[mat.material_name];
            const matPercentage = maxWeightKg > 0 ? Math.min(100, Math.max(6, (mat.total_weight_kg / maxWeightKg) * 100)) : 0;
            const maxPartWeightInMat = mat.parts.length > 0 ? mat.parts[0].total_weight_kg : 1;

            return (
              <div key={mat.material_name} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {/* Material Row Card */}
                <div className="ng-material-row">
                  {/* Material Name */}
                  <span className="ng-material-name" title={mat.material_name}>
                    {mat.material_name}
                  </span>

                  {/* Horizontal Progress Bar Track */}
                  <div className="ng-progress-track-mat">
                    <div
                      style={{
                        height: '10px',
                        width: `${matPercentage}%`,
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                        borderRadius: '5px',
                        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 1px 3px rgba(16, 185, 129, 0.3)',
                      }}
                    />
                  </div>

                  {/* Total Weight Label Badge */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        color: '#047857',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: 800,
                      }}
                    >
                      {mat.total_weight_kg} Kg
                    </span>
                  </div>

                  {/* Selengkapnya Button */}
                  <button
                    onClick={() => onToggleExpand(mat.material_name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 1rem',
                      borderRadius: '18px',
                      border: '1.8px solid #0f172a',
                      backgroundColor: isExpanded ? '#0f172a' : '#ffffff',
                      color: isExpanded ? '#ffffff' : '#0f172a',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <span>Selengkapnya</span>
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>

                {/* Sub-parts accordion list under expanded Material */}
                {isExpanded && mat.parts && mat.parts.length > 0 && (
                  <div className="ng-subparts-container">
                    {mat.parts.map((part) => {
                      const partPercentage = maxPartWeightInMat > 0 ? Math.min(100, Math.max(6, (part.total_weight_kg / maxPartWeightInMat) * 100)) : 0;

                      return (
                        <div key={part.master_part_id} className="ng-part-row">
                          {/* Part Name */}
                          <span className="ng-part-name" title={part.part_name}>
                            {part.part_name}
                          </span>

                          {/* Horizontal Progress Bar Track */}
                          <div className="ng-progress-track-part">
                            <div
                              style={{
                                height: '8px',
                                width: `${partPercentage}%`,
                                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                borderRadius: '4px',
                                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                              }}
                            />
                          </div>

                          {/* Weight Label Badge */}
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.6rem',
                                backgroundColor: 'rgba(15, 23, 42, 0.06)',
                                color: '#0f172a',
                                borderRadius: '10px',
                                fontSize: '0.825rem',
                                fontWeight: 700,
                              }}
                            >
                              {part.total_weight_kg} kg
                            </span>
                          </div>

                          {/* Detail Button */}
                          <button
                            onClick={() => onOpenPartDetail(part)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.35rem 0.95rem',
                              borderRadius: '14px',
                              border: '1.5px solid #0f172a',
                              backgroundColor: '#ffffff',
                              color: '#0f172a',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              flexShrink: 0,
                            }}
                          >
                            <span>Detail</span>
                            <ExternalLink size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
