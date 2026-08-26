import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Spinner } from '../../../components/common/Spinner';
import { SubmitConfirmModal } from './SubmitConfirmModal';
import type { CreateRequestItemPayload } from '../types/crushingRequests.types';
import type { MasterPart } from '../../master-parts/types/masterParts.types';
import type { Material } from '../../materials/types/materials.types';
import type { UserProfile } from '../../../context/AuthContext';
import {
  PackagePlus,
  Building2,
  Network,
  PlusCircle,
  Plus,
  Minus,
  Trash2,
  Send,
  Calendar,
  Search,
  Scale,
  Package,
  CheckCircle2,
  Sun,
  Moon,
  AlertCircle,
  X,
  RotateCcw,
  Check,
} from 'lucide-react';
import { formatIndonesianDate } from '../../../config/shift.config';

interface CreateRequestFormProps {
  user: UserProfile | null;
  shift: 'Pagi' | 'Malam';
  onShiftChange: (shift: 'Pagi' | 'Malam') => void;
  requestDate: string;
  onRequestDateChange: (date: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  items: CreateRequestItemPayload[];
  itemType: 'part_ng' | 'runner_ng';
  onItemTypeChange: (type: 'part_ng' | 'runner_ng') => void;
  selectedPart: MasterPart | null;
  onSelectPart: (part: MasterPart) => void;
  partQuantityPcs: number | '';
  onPartQuantityChange: (qty: number | '') => void;
  selectedMaterial: Material | null;
  onSelectMaterial: (mat: Material | null) => void;
  runnerWeightKg: number | '';
  onRunnerWeightChange: (weight: number | '') => void;
  itemNotes: string;
  onItemNotesChange: (notes: string) => void;
  filteredParts: MasterPart[];
  jenisOptions: string[];
  selectedJenis: string;
  onSelectJenis: (jenis: string) => void;
  availableMaterials: Material[];
  isLoadingParts: boolean;
  partSearchQuery: string;
  onPartSearchQueryChange: (query: string) => void;
  onAddItem: () => void;
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
  onShiftChange,
  requestDate,
  onRequestDateChange,
  notes,
  onNotesChange,
  items,
  itemType,
  onItemTypeChange,
  selectedPart,
  onSelectPart,
  partQuantityPcs,
  onPartQuantityChange,
  selectedMaterial,
  onSelectMaterial,
  runnerWeightKg,
  onRunnerWeightChange,
  itemNotes,
  onItemNotesChange,
  filteredParts,
  jenisOptions,
  selectedJenis,
  onSelectJenis,
  availableMaterials,
  isLoadingParts,
  partSearchQuery,
  onPartSearchQueryChange,
  onAddItem,
  onRemoveItem,
  onClearDraft,
  isSubmitting,
  onSubmitRequest,
  estimatedTotalWeightKg,
  estimatedTotalPcs,
}) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Live calculated weight for currently selected part draft
  const currentPartLiveWeightKg = selectedPart
    ? Number(((Number(partQuantityPcs || 0) * Number(selectedPart.berat_part_gr)) / 1000).toFixed(2))
    : 0;

  const hasDraftContent = items.length > 0 || notes.trim() !== '';

  const handleStepQty = (delta: number) => {
    const current = typeof partQuantityPcs === 'number' ? partQuantityPcs : 0;
    const nextVal = Math.max(1, current + delta);
    onPartQuantityChange(nextVal);
  };

  const handleAddPresetQty = (amount: number) => {
    const current = typeof partQuantityPcs === 'number' ? partQuantityPcs : 0;
    onPartQuantityChange(current + amount);
  };

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false);
    onSubmitRequest();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Tablet Info Bar (Sender Identity, Shift, Date, Reset) */}
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
                Pengajuan Tiket Part NG
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

        {/* Right Badges & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.7rem',
              borderRadius: '8px',
              backgroundColor: shift === 'Pagi' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(79, 70, 229, 0.12)',
              border: `1px solid ${shift === 'Pagi' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(79, 70, 229, 0.3)'}`,
              color: shift === 'Pagi' ? '#d97706' : '#4338ca',
              fontSize: '0.8rem',
              fontWeight: 800,
            }}
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
              title="Reset seluruh draf tiket"
            >
              Reset Draf
            </Button>
          )}
        </div>
      </div>

      {/* Main 2-Column Responsive Layout (Left: Catalog, Right: Sticky Input & Draft) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(360px, 1fr)',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* ================= COLUMN 1: VISUAL CATALOG (LEFT) ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Catalog Top Filter Row */}
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderRadius: 'var(--radius-lg, 12px)',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'grid',
              gridTemplateColumns: '1.3fr 1fr',
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
          </div>

          {/* Catalog Grid Cards List */}
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                Klik kartu part untuk memilih
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
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                  gap: '1rem',
                }}
              >
                {filteredParts.map((part) => {
                  const isSelected = selectedPart?.id === part.id;
                  return (
                    <div
                      key={part.id}
                      onClick={() => onSelectPart(part)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '240px',
                        backgroundColor: isSelected ? 'rgba(231, 97, 20, 0.08)' : 'var(--bg-card, #ffffff)',
                        border: isSelected ? '2.5px solid var(--secondary-color, #e76114)' : '1.5px solid var(--border-color, #e2e8f0)',
                        borderRadius: 'var(--radius-lg, 12px)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                        position: 'relative',
                        boxShadow: isSelected ? '0 6px 16px rgba(231, 97, 20, 0.25)' : '0 2px 6px rgba(0,0,0,0.04)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--secondary-color, #e76114)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
                        }
                      }}
                    >
                      {/* Selected Indicator Badge */}
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            zIndex: 3,
                            backgroundColor: 'var(--secondary-color, #e76114)',
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                          }}
                        >
                          <Check size={15} strokeWidth={3} />
                        </div>
                      )}

                      {/* Large Part Image Container (140px height) */}
                      <div
                        style={{
                          width: '100%',
                          height: '140px',
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
                            <Package size={36} style={{ opacity: 0.4 }} />
                            <span style={{ fontSize: '0.725rem', fontWeight: 600 }}>Foto Part</span>
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
                                padding: '0.15rem 0.45rem',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                              }}
                            >
                              {part.model_code}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Part Details Info */}
                      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: '0.875rem',
                            color: 'var(--text-main, #0f172a)',
                            lineHeight: '1.3',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '2.3rem',
                          }}
                          title={part.part_name}
                        >
                          {part.part_name}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.35rem' }}>
                          <code
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: 'var(--text-main, #0f172a)',
                              backgroundColor: '#f1f5f9',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {part.part_number}
                          </code>

                          <span style={{ fontSize: '0.8rem', color: 'var(--secondary-color, #e76114)', fontWeight: 900 }}>
                            {Number(part.berat_part_gr)} gr
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: INPUT CONTROLLER & DRAFT (RIGHT) ================= */}
        <div
          style={{
            position: 'sticky',
            top: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Card 1: Active Selected Part Input Box */}
          <div
            style={{
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderRadius: 'var(--radius-lg, 12px)',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              padding: '1rem 1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                Input Kuantitas Reject
              </h4>
              {selectedPart && (
                <Badge variant="primary" size="sm">
                  Part Dipilih
                </Badge>
              )}
            </div>

            {!selectedPart ? (
              <div
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: 'var(--text-muted, #64748b)',
                  backgroundColor: 'var(--bg-main, #f8fafc)',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1.5px dashed var(--border-color, #cbd5e1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <AlertCircle size={28} style={{ color: 'var(--secondary-color, #e76114)', opacity: 0.7 }} />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main, #0f172a)' }}>
                  Pilih Part pada Katalog di Sebelah Kiri
                </span>
                <span style={{ fontSize: '0.775rem', color: '#64748b' }}>
                  Klik salah satu kartu part untuk memasukkan quantity reject ke tiket pengiriman.
                </span>
              </div>
            ) : (
              <>
                {/* Selected Part Mini Header Banner with 64px Photo Preview */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(231, 97, 20, 0.06)',
                    border: '1.5px solid rgba(231, 97, 20, 0.25)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    gap: '0.75rem',
                  }}
                >
                  {/* Photo Preview */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(231, 97, 20, 0.3)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      padding: '2px',
                    }}
                  >
                    {selectedPart.image_url ? (
                      <img
                        src={selectedPart.image_url}
                        alt={selectedPart.part_name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/no-images.jpg';
                        }}
                      />
                    ) : (
                      <Package size={24} color="#94a3b8" />
                    )}
                  </div>

                  {/* Info Details */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.925rem', fontWeight: 900, color: 'var(--text-main, #0f172a)' }}>
                        {selectedPart.part_name}
                      </span>
                      {selectedPart.model_code && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#ffffff', border: '1px solid rgba(231, 97, 20, 0.3)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--secondary-color, #e76114)' }}>
                          {selectedPart.model_code}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '0.15rem' }}>
                      No: <code>{selectedPart.part_number}</code> • {Number(selectedPart.berat_part_gr)} gr/pcs
                    </div>
                  </div>

                  {/* Live Weight Calculation */}
                  <div style={{ textAlign: 'right', flexShrink: 0, backgroundColor: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(231, 97, 20, 0.2)' }}>
                    <span style={{ fontSize: '0.675rem', color: 'var(--text-muted, #64748b)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                      Estimasi Berat
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                      {currentPartLiveWeightKg.toFixed(2)} <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>kg</span>
                    </span>
                  </div>
                </div>

                {/* Touch Stepper & Quantity Controller */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                    Jumlah Reject (Pcs) <span style={{ color: '#ef4444' }}>*</span>
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Decrement Stepper Button */}
                    <button
                      type="button"
                      onClick={() => handleStepQty(-1)}
                      style={{
                        width: '46px',
                        height: '42px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#0f172a',
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                      title="Kurangi 1 pcs"
                    >
                      <Minus size={18} />
                    </button>

                    {/* Numeric Quantity Input */}
                    <div style={{ flex: 1 }}>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Jumlah pcs..."
                        value={partQuantityPcs}
                        onChange={(e) => {
                          const val = e.target.value;
                          onPartQuantityChange(val === '' ? '' : Math.max(1, parseInt(val, 10) || 1));
                        }}
                        style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 900, height: '42px' }}
                      />
                    </div>

                    {/* Increment Stepper Button */}
                    <button
                      type="button"
                      onClick={() => handleStepQty(1)}
                      style={{
                        width: '46px',
                        height: '42px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#0f172a',
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                      title="Tambah 1 pcs"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Touch Fast Presets (Quick Chips) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                      Quick Add:
                    </span>
                    {[1, 5, 10, 25, 50, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddPresetQty(preset)}
                        style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(231, 97, 20, 0.3)',
                          backgroundColor: 'rgba(231, 97, 20, 0.06)',
                          color: 'var(--secondary-color, #e76114)',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Defect Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                    Catatan Defect (Opsional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Contoh: Bumper baret, flash tebal, short shot..."
                    value={itemNotes}
                    onChange={(e) => onItemNotesChange(e.target.value)}
                  />
                </div>

                {/* Add to Ticket Button */}
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={onAddItem}
                  leftIcon={<PlusCircle size={18} />}
                  style={{ width: '100%', fontWeight: 800, padding: '0.7rem' }}
                >
                  + Tambahkan ke Rincian Tiket
                </Button>
              </>
            )}
          </div>

          {/* Card 2: Draft Ticket Items & Final Submit Action */}
          <div
            style={{
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderRadius: 'var(--radius-lg, 12px)',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Draft Header */}
            <div
              style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: 'var(--bg-main, #f8fafc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                Rincian Item Tiket ({items.length} Item)
              </span>

              {items.length > 0 && (
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-color, #008d51)' }}>
                  {estimatedTotalPcs} Pcs • {estimatedTotalWeightKg.toFixed(2)} kg
                </span>
              )}
            </div>

            {/* Draft Items Table / List */}
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {items.length === 0 ? (
                <div
                  style={{
                    padding: '2.5rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted, #64748b)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <PackagePlus size={32} style={{ opacity: 0.4 }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                    Belum ada item ditambahkan
                  </span>
                  <span style={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                    Pilih part pada katalog lalu klik '+ Tambahkan ke Rincian Tiket'
                  </span>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '0.5rem 0.75rem', width: '30px' }}>No</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Nama Part</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Qty</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Berat</th>
                      <th style={{ padding: '0.5rem 0.75rem', width: '40px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 0.75rem', color: '#94a3b8' }}>{idx + 1}</td>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                          <div>{it.material_name}</div>
                          {it.notes && (
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic', fontWeight: 500 }}>
                              {it.notes}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                          {it.quantity_pcs > 0 ? `${it.quantity_pcs} pcs` : '-'}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                          {Number(it.runner_weight_kg || 0).toFixed(2)} kg
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(idx)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            title="Hapus Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Bottom Summary Bar & Big Submit Button */}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Scale size={22} color="var(--secondary-color, #e76114)" />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Total Akumulasi
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                      {estimatedTotalWeightKg.toFixed(2)} kg <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>({estimatedTotalPcs} pcs)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button (Opens Confirmation Modal) */}
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={items.length === 0 || isSubmitting}
                isLoading={isSubmitting}
                leftIcon={<Send size={18} />}
                style={{ width: '100%', fontWeight: 800, padding: '0.75rem', fontSize: '0.95rem' }}
              >
                Kirim Tiket ({items.length} Item Ditambahkan)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Final Submit */}
      <SubmitConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        isLoading={isSubmitting}
        user={user}
        shift={shift}
        requestDate={requestDate}
        notes={notes}
        items={items}
        totalWeightKg={estimatedTotalWeightKg}
        totalPcs={estimatedTotalPcs}
      />
    </div>
  );
};
