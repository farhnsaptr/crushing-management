import React, { useState } from 'react';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Spinner } from '../../../components/common/Spinner';
import type { CreateRequestItemPayload } from '../types/crushingRequests.types';
import type { MasterPart } from '../../master-parts/types/masterParts.types';
import type { Material } from '../../materials/types/materials.types';
import type { UserProfile } from '../../../context/AuthContext';
import {
  PackagePlus,
  Plus,
  Minus,
  Trash2,
  Send,
  Calendar,
  Search,
  Scale,
  Package,
  Sun,
  Moon,
  X,
  RotateCcw,
  Check,
  LayoutGrid,
  List,
} from 'lucide-react';
import { formatIndonesianDate } from '../../../config/shift.config';

interface CreateRequestFormProps {
  user: UserProfile | null;
  shift: 'Pagi' | 'Malam';
  onShiftChange?: (shift: 'Pagi' | 'Malam') => void;
  requestDate: string;
  onRequestDateChange?: (date: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  items: CreateRequestItemPayload[];
  itemType?: 'part_ng' | 'runner_ng';
  onItemTypeChange?: (type: 'part_ng' | 'runner_ng') => void;
  selectedPart?: MasterPart | null;
  onSelectPart?: (part: MasterPart) => void;
  onQuickAddPart?: (part: MasterPart, delta?: number) => void;
  onStepItemQty?: (index: number, delta: number) => void;
  onUpdateItemQty?: (index: number, qty: number) => void;
  onUpdateItemNotes?: (index: number, notes: string) => void;
  getItemQuantityForPart?: (partId: string) => number;
  partQuantityPcs?: number | '';
  onPartQuantityChange?: (qty: number | '') => void;
  selectedMaterial?: Material | null;
  onSelectMaterial?: (mat: Material | null) => void;
  runnerWeightKg?: number | '';
  onRunnerWeightChange?: (weight: number | '') => void;
  itemNotes?: string;
  onItemNotesChange?: (notes: string) => void;
  filteredParts: MasterPart[];
  jenisOptions: string[];
  selectedJenis: string;
  onSelectJenis: (jenis: string) => void;
  availableMaterials?: Material[];
  isLoadingParts: boolean;
  partSearchQuery: string;
  onPartSearchQueryChange: (query: string) => void;
  onAddItem?: () => void;
  onAddRunnerBatch?: (items: Array<{ material_id?: string; material_name: string; runner_weight_kg: number; notes?: string }>) => void;
  onRemoveItem: (index: number) => void;
  onClearDraft?: () => void;
  isSubmitting: boolean;
  onSubmitRequest: () => void;
  estimatedTotalWeightKg: number;
  estimatedTotalPcs: number;
}

export const CreateRequestForm: React.FC<CreateRequestFormProps> = ({
  user,
  shift,
  requestDate,
  notes,
  onNotesChange,
  items,
  onQuickAddPart,
  onStepItemQty,
  onUpdateItemQty,
  getItemQuantityForPart,
  filteredParts,
  jenisOptions,
  selectedJenis,
  onSelectJenis,
  isLoadingParts,
  partSearchQuery,
  onPartSearchQueryChange,
  onRemoveItem,
  onClearDraft,
  isSubmitting,
  onSubmitRequest,
  estimatedTotalWeightKg,
  estimatedTotalPcs,
}) => {
  const [catalogViewMode, setCatalogViewMode] = useState<'grid' | 'list'>('grid');

  const hasDraftContent = items.length > 0 || notes.trim() !== '';

  const handleCardClick = (part: MasterPart) => {
    if (onQuickAddPart) {
      onQuickAddPart(part, 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Identity & Shift Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.15rem',
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'rgba(231, 97, 20, 0.12)',
              color: 'var(--secondary-color, #e76114)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PackagePlus size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main, #0f172a)' }}>
                Pengajuan Pengiriman Part NG
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                • Pengirim: <strong>{user?.full_name}</strong> (@{user?.username})
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '0.1rem' }}>
              Departemen: <strong>{user?.department_name || '-'}</strong> | Pabrik: <strong>{user?.factory_name || 'Semua Pabrik'}</strong>
            </div>
          </div>
        </div>

        {/* Right Shift & Reset Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Automatic Shift Indicator (Read-only for sender) */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.8rem',
              borderRadius: '8px',
              backgroundColor: shift === 'Pagi' ? 'rgba(0, 141, 81, 0.1)' : 'rgba(231, 97, 20, 0.1)',
              border: `1.5px solid ${shift === 'Pagi' ? 'rgba(0, 141, 81, 0.3)' : 'rgba(231, 97, 20, 0.3)'}`,
              color: shift === 'Pagi' ? '#008d51' : '#e76114',
              fontWeight: 800,
              fontSize: '0.8rem',
            }}
            title="Shift ditentukan otomatis berdasarkan jam operasional sistem saat ini"
          >
            {shift === 'Pagi' ? <Sun size={14} /> : <Moon size={14} />}
            <span>Shift {shift}</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.7rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-main, #f8fafc)',
              border: '1px solid var(--border-color, #cbd5e1)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-main, #0f172a)',
            }}
          >
            <Calendar size={14} color="var(--secondary-color, #e76114)" />
            <span>{formatIndonesianDate(requestDate)}</span>
          </div>

          {hasDraftContent && onClearDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearDraft}
              leftIcon={<RotateCcw size={14} />}
              style={{ fontSize: '0.775rem' }}
              title="Reset seluruh draf pengiriman"
            >
              Kosongkan Draf
            </Button>
          )}
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(380px, 1fr)',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* ================= COLUMN 1: KATALOG MASTER PART (LEFT) ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Catalog Filter & Search Row */}
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderRadius: 'var(--radius-lg, 12px)',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr auto',
              gap: '0.75rem',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Input
                placeholder="Cari nama part, part number, model..."
                value={partSearchQuery}
                onChange={(e) => onPartSearchQueryChange(e.target.value)}
                leftIcon={<Search size={16} />}
              />
              {partSearchQuery && (
                <button
                  type="button"
                  onClick={() => onPartSearchQueryChange('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedJenis}
              onChange={(e) => onSelectJenis(e.target.value)}
              style={{
                height: '40px',
                padding: '0 0.75rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-card, #ffffff)',
                color: 'var(--text-main, #0f172a)',
                fontSize: '0.85rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">-- Semua Jenis ({filteredParts.length}) --</option>
              {jenisOptions.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>

            {/* View Mode Switcher (Grid vs List) */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
              }}
            >
              <button
                type="button"
                onClick={() => setCatalogViewMode('grid')}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: catalogViewMode === 'grid' ? '#ffffff' : 'transparent',
                  color: catalogViewMode === 'grid' ? '#0f172a' : '#64748b',
                  boxShadow: catalogViewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Tampilan Grid Kartu"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setCatalogViewMode('list')}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: catalogViewMode === 'list' ? '#ffffff' : 'transparent',
                  color: catalogViewMode === 'list' ? '#0f172a' : '#64748b',
                  boxShadow: catalogViewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Tampilan List Baris"
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Catalog Content */}
          <div
            style={{
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderRadius: 'var(--radius-lg, 12px)',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                Katalog Master Part ({filteredParts.length} Item)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary-color, #e76114)', fontWeight: 700 }}>
                💡 Klik kartu part untuk langsung memasukkan ke rincian pengiriman
              </span>
            </div>

            {isLoadingParts ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Spinner size={36} />
              </div>
            ) : filteredParts.length === 0 ? (
              <div
                style={{
                  padding: '3.5rem 1rem',
                  textAlign: 'center',
                  color: 'var(--text-muted, #64748b)',
                  backgroundColor: 'var(--bg-main, #f8fafc)',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1.5px dashed var(--border-color, #cbd5e1)',
                }}
              >
                <Package size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, color: 'var(--text-main, #0f172a)' }}>
                  Tidak ada part ditemukan
                </p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
                  Coba ubah kata kunci pencarian atau kategori filter jenis part.
                </p>
              </div>
            ) : catalogViewMode === 'grid' ? (
              /* GRID VIEW */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                {filteredParts.map((part) => {
                  const currentQty = getItemQuantityForPart ? getItemQuantityForPart(part.id) : 0;
                  const isInTicket = currentQty > 0;

                  return (
                    <div
                      key={part.id}
                      onClick={() => handleCardClick(part)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '235px',
                        backgroundColor: isInTicket ? 'rgba(0, 141, 81, 0.04)' : 'var(--bg-card, #ffffff)',
                        border: isInTicket ? '2px solid #008d51' : '1.5px solid var(--border-color, #e2e8f0)',
                        borderRadius: 'var(--radius-lg, 12px)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        boxShadow: isInTicket ? '0 4px 12px rgba(0, 141, 81, 0.18)' : '0 2px 5px rgba(0,0,0,0.03)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isInTicket) {
                          e.currentTarget.style.borderColor = 'var(--secondary-color, #e76114)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isInTicket) {
                          e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)';
                        }
                      }}
                    >
                      {/* Active Quantity Badge in Top-Right */}
                      {isInTicket && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            zIndex: 3,
                            backgroundColor: '#008d51',
                            color: '#ffffff',
                            borderRadius: '12px',
                            padding: '0.2rem 0.55rem',
                            fontSize: '0.725rem',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            boxShadow: '0 2px 6px rgba(0, 141, 81, 0.35)',
                          }}
                        >
                          <Check size={12} strokeWidth={3} />
                          <span>{currentQty} pcs</span>
                        </div>
                      )}

                      {/* Part Image Container */}
                      <div
                        style={{
                          width: '100%',
                          height: '125px',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          borderBottom: '1px solid var(--border-color, #f1f5f9)',
                          padding: '6px',
                          position: 'relative',
                        }}
                      >
                        {part.image_url ? (
                          <img
                            src={part.image_url}
                            alt={part.part_name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/no-images.jpg';
                            }}
                          />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8', gap: '4px' }}>
                            <Package size={32} style={{ opacity: 0.4 }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Foto Part</span>
                          </div>
                        )}

                        {/* Model Badge */}
                        {part.model_code && (
                          <div style={{ position: 'absolute', bottom: '6px', left: '6px' }}>
                            <span
                              style={{
                                backgroundColor: 'rgba(15, 23, 42, 0.82)',
                                color: '#ffffff',
                                borderRadius: '4px',
                                padding: '0.15rem 0.4rem',
                                fontSize: '0.675rem',
                                fontWeight: 800,
                              }}
                            >
                              {part.model_code}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Part Details Info */}
                      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: 'var(--text-main, #0f172a)',
                            lineHeight: '1.25',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '2.15rem',
                          }}
                          title={part.part_name}
                        >
                          {part.part_name}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.35rem' }}>
                          <code
                            style={{
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              color: 'var(--text-main, #0f172a)',
                              backgroundColor: '#f1f5f9',
                              padding: '0.15rem 0.35rem',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {part.part_number}
                          </code>

                          <span style={{ fontSize: '0.775rem', color: 'var(--secondary-color, #e76114)', fontWeight: 900 }}>
                            {Number(part.berat_part_gr)} gr
                          </span>
                        </div>

                        {/* Quick Add Button / Counter */}
                        <div style={{ marginTop: '0.5rem' }}>
                          {isInTicket ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '6px',
                                padding: '2px 4px',
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const idx = items.findIndex((it) => it.item_type === 'part_ng' && it.master_part_id === part.id);
                                  if (idx >= 0 && onStepItemQty) onStepItemQty(idx, -1);
                                }}
                                style={{
                                  width: '26px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  border: '1px solid #86efac',
                                  backgroundColor: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  color: '#15803d',
                                }}
                              >
                                <Minus size={12} />
                              </button>
                              <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#15803d' }}>
                                {currentQty} pcs
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const idx = items.findIndex((it) => it.item_type === 'part_ng' && it.master_part_id === part.id);
                                  if (idx >= 0 && onStepItemQty) onStepItemQty(idx, 1);
                                  else handleCardClick(part);
                                }}
                                style={{
                                  width: '26px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  border: '1px solid #86efac',
                                  backgroundColor: '#16a34a',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  color: '#ffffff',
                                }}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick(part);
                              }}
                              style={{
                                width: '100%',
                                padding: '0.35rem',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#f8fafc',
                                color: '#334155',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.25rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <Plus size={13} color="var(--secondary-color, #e76114)" />
                              <span>+ Masukkan</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {filteredParts.map((part) => {
                  const currentQty = getItemQuantityForPart ? getItemQuantityForPart(part.id) : 0;
                  const isInTicket = currentQty > 0;

                  return (
                    <div
                      key={part.id}
                      onClick={() => handleCardClick(part)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.85rem',
                        backgroundColor: isInTicket ? 'rgba(0, 141, 81, 0.04)' : 'var(--bg-card, #ffffff)',
                        border: isInTicket ? '1.5px solid #008d51' : '1px solid var(--border-color, #e2e8f0)',
                        borderRadius: '8px',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Left: Thumbnail & Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '6px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            padding: '2px',
                          }}
                        >
                          {part.image_url ? (
                            <img
                              src={part.image_url}
                              alt={part.part_name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/no-images.jpg';
                              }}
                            />
                          ) : (
                            <Package size={20} color="#94a3b8" />
                          )}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {part.part_name}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                            <code>{part.part_number}</code>
                            {part.model_code && (
                              <span style={{ backgroundColor: '#f1f5f9', padding: '0.05rem 0.35rem', borderRadius: '4px', fontWeight: 700, color: '#334155' }}>
                                {part.model_code}
                              </span>
                            )}
                            <span>• {Number(part.berat_part_gr)} gr</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Add/Counter Button */}
                      <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
                        {isInTicket ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              backgroundColor: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              borderRadius: '6px',
                              padding: '2px 4px',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const idx = items.findIndex((it) => it.item_type === 'part_ng' && it.master_part_id === part.id);
                                if (idx >= 0 && onStepItemQty) onStepItemQty(idx, -1);
                              }}
                              style={{
                                width: '26px',
                                height: '24px',
                                borderRadius: '4px',
                                border: '1px solid #86efac',
                                backgroundColor: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifySelf: 'center',
                                cursor: 'pointer',
                                color: '#15803d',
                              }}
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#15803d', minWidth: '42px', textAlign: 'center' }}>
                              {currentQty} pcs
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const idx = items.findIndex((it) => it.item_type === 'part_ng' && it.master_part_id === part.id);
                                if (idx >= 0 && onStepItemQty) onStepItemQty(idx, 1);
                                else handleCardClick(part);
                              }}
                              style={{
                                width: '26px',
                                height: '24px',
                                borderRadius: '4px',
                                border: '1px solid #86efac',
                                backgroundColor: '#16a34a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#ffffff',
                              }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCardClick(part)}
                            style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#0f172a',
                              fontSize: '0.775rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Plus size={13} color="var(--secondary-color, #e76114)" />
                            <span>+ Masukkan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: RINCIAN ITEM TIKET (INTERACTIVE CART LIST) ================= */}
        <div
          style={{
            position: 'sticky',
            top: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Main Cart List Box */}
          <div
            style={{
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderRadius: 'var(--radius-lg, 12px)',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Cart Header */}
            <div
              style={{
                padding: '0.85rem 1.15rem',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: 'var(--bg-main, #f8fafc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main, #0f172a)' }}>
                  Rincian Pengiriman
                </span>
                <span
                  style={{
                    backgroundColor: items.length > 0 ? 'var(--secondary-color, #e76114)' : '#cbd5e1',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '12px',
                  }}
                >
                  {items.length}
                </span>
              </div>

              {items.length > 0 && (
                <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#008d51' }}>
                  {estimatedTotalPcs} Pcs • {estimatedTotalWeightKg.toFixed(2)} kg
                </span>
              )}
            </div>

            {/* Cart Items List */}
            <div
              style={{
                maxHeight: '440px',
                overflowY: 'auto',
                padding: items.length === 0 ? '0' : '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              {items.length === 0 ? (
                <div
                  style={{
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                    color: 'var(--text-muted, #64748b)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <PackagePlus size={36} style={{ color: 'var(--secondary-color, #e76114)', opacity: 0.6 }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                    Rincian Pengiriman Masih Kosong
                  </span>
                  <span style={{ fontSize: '0.775rem', color: '#94a3b8', maxWidth: '280px' }}>
                    Cukup klik kartu part pada katalog di sebelah kiri untuk langsung memasukkannya ke rincian ini.
                  </span>
                </div>
              ) : (
                items.map((it, idx) => {
                  const itemWeightKg = Number(it.runner_weight_kg || 0).toFixed(2);

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.45rem 0.75rem',
                        gap: '0.5rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Left: Index + Part Name + Model */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', minWidth: '16px' }}>
                          {idx + 1}.
                        </span>
                        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden' }}>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              color: 'var(--text-main, #0f172a)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={it.material_name}
                          >
                            {it.material_name}
                          </span>
                          {it.model_code && (
                            <span
                              style={{
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                padding: '0.1rem 0.35rem',
                                borderRadius: '4px',
                                fontWeight: 800,
                                fontSize: '0.675rem',
                                color: 'var(--secondary-color, #e76114)',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              {it.model_code}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Stepper [-] [Qty] [+] + Weight + Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                        {/* Stepper (+ / -) */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            backgroundColor: '#f8fafc',
                            padding: '2px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => onStepItemQty && onStepItemQty(idx, -1)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#0f172a',
                              fontWeight: 900,
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            }}
                            title="Kurangi 1 pcs"
                          >
                            <Minus size={12} />
                          </button>

                          <input
                            type="number"
                            min={1}
                            value={it.quantity_pcs}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (onUpdateItemQty) onUpdateItemQty(idx, isNaN(val) ? 1 : val);
                            }}
                            style={{
                              width: '42px',
                              height: '24px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              textAlign: 'center',
                              fontSize: '0.825rem',
                              fontWeight: 900,
                              color: '#0f172a',
                              outline: 'none',
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => onStepItemQty && onStepItemQty(idx, 1)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#0f172a',
                              fontWeight: 900,
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            }}
                            title="Tambah 1 pcs"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Weight (kg) */}
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 900,
                            color: 'var(--secondary-color, #e76114)',
                            minWidth: '52px',
                            textAlign: 'right',
                          }}
                        >
                          {itemWeightKg} <span style={{ fontSize: '0.675rem', fontWeight: 700 }}>kg</span>
                        </span>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '3px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#94a3b8';
                          }}
                          title="Hapus part dari daftar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Summary & Notes & Submit */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderTop: '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: 'var(--bg-main, #f8fafc)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {/* General Notes */}
              <div>
                <label style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', display: 'block', marginBottom: '0.25rem' }}>
                  Catatan Pengiriman (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan untuk operator crushing..."
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.8rem',
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Total Summary */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Scale size={20} color="var(--secondary-color, #e76114)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Total Akumulasi
                  </span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                  {estimatedTotalWeightKg.toFixed(2)} kg{' '}
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                    ({estimatedTotalPcs} pcs)
                  </span>
                </div>
              </div>

              {/* Final Submit Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={onSubmitRequest}
                disabled={items.length === 0 || isSubmitting}
                isLoading={isSubmitting}
                leftIcon={<Send size={18} />}
                style={{ width: '100%', fontWeight: 900, padding: '0.75rem', fontSize: '0.95rem' }}
              >
                Kirim Pengajuan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
