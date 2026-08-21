import React from 'react';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Spinner } from '../../../components/common/Spinner';
import type { CreateRequestItemPayload } from '../types/crushingRequests.types';
import type { MasterPart } from '../../master-parts/types/masterParts.types';
import type { Material } from '../../materials/types/materials.types';
import type { UserProfile } from '../../../context/AuthContext';
import {
  PackagePlus,
  Layers,
  Building2,
  Network,
  PlusCircle,
  Plus,
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
  Save,
  RotateCcw,
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
  onAddRunnerBatch,
  onRemoveItem,
  onClearDraft,
  isSubmitting,
  onSubmitRequest,
  estimatedTotalWeightKg,
  estimatedTotalPcs,
}) => {
  // Live calculated weight for currently selected part draft
  const currentPartLiveWeightKg = selectedPart
    ? Number(((Number(partQuantityPcs || 0) * Number(selectedPart.berat_part_gr)) / 1000).toFixed(2))
    : 0;

  const hasDraftContent = items.length > 0 || notes.trim() !== '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Sender Assigned Identity Header Card */}
      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'rgba(231, 97, 20, 0.12)',
                color: 'var(--secondary-color, #e76114)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PackagePlus size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                  Pengajuan Tiket Pengiriman Part NG
                </h3>
                {hasDraftContent && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(0, 141, 81, 0.1)',
                      color: 'var(--primary-color, #008d51)',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                    }}
                  >
                    <Save size={12} />
                    <span>Draf Tersimpan di Server (Cross-Device)</span>
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted, #64748b)', margin: '0.2rem 0 0 0' }}>
                Pengirim: <strong>{user?.full_name}</strong> (@{user?.username})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(231, 97, 20, 0.08)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid rgba(231, 97, 20, 0.3)',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: 'var(--secondary-color, #e76114)',
              }}
            >
              <Building2 size={16} />
              <span>Factory: {user?.factory_name || 'Semua Pabrik'}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(0, 141, 81, 0.08)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid rgba(0, 141, 81, 0.3)',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: 'var(--primary-color, #008d51)',
              }}
            >
              <Network size={16} />
              <span>Departemen: {user?.department_name || 'Umum'}</span>
            </div>

            {hasDraftContent && onClearDraft && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearDraft}
                leftIcon={<RotateCcw size={14} />}
                style={{ fontSize: '0.775rem' }}
                title="Kosongkan seluruh isian dan draf tiket"
              >
                Reset Draf
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* PART NG MODE VIEW (Grid Catalog + Form) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Visual Part Catalog (~62% width) */}
          <div style={{ flex: '1 1 62%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Filter Jenis Part Dropdown */}
            <Card style={{ padding: '0.85rem 1.15rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Kategori Jenis Part
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                    Pabrik: <strong>{user?.factory_name || 'Semua'}</strong>
                  </span>
                </div>

                <select
                  value={selectedJenis}
                  onChange={(e) => onSelectJenis(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1.5px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--bg-card, #ffffff)',
                    color: 'var(--text-main, #0f172a)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">-- Semua Kategori Jenis Part --</option>
                  {jenisOptions.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Instant Search Box */}
            <Card style={{ padding: '0.85rem 1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="Cari nama part, part number, model, sebango..."
                    value={partSearchQuery}
                    onChange={(e) => onPartSearchQueryChange(e.target.value)}
                    leftIcon={<Search size={18} />}
                  />
                </div>
                {partSearchQuery && (
                  <Button variant="secondary" size="sm" onClick={() => onPartSearchQueryChange('')} leftIcon={<X size={14} />}>
                    Clear
                  </Button>
                )}
              </div>
            </Card>

            {/* Visual Part Grid Card */}
            <Card
              title={`Daftar Master Part — ${selectedJenis === 'ALL' ? 'Semua Part' : selectedJenis}`}
              subtitle={`Menampilkan ${filteredParts.length} item part dari ${user?.factory_name || 'pabrik Anda'}`}
            >
              {isLoadingParts ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem' }}>
                  <Spinner size={36} />
                </div>
              ) : filteredParts.length === 0 ? (
                <div
                  style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted, #64748b)',
                    backgroundColor: 'var(--bg-main, #f8fafc)',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1px dashed var(--border-color, #cbd5e1)',
                  }}
                >
                  <Package size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    Tidak ada part ditemukan untuk kategori atau kata kunci pencarian ini.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                    gap: '1rem',
                    maxHeight: '620px',
                    overflowY: 'auto',
                    paddingRight: '0.25rem',
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
                          backgroundColor: isSelected ? 'rgba(231, 97, 20, 0.08)' : 'var(--bg-card, #ffffff)',
                          border: isSelected ? '2px solid var(--secondary-color, #e76114)' : '1px solid var(--border-color, #cbd5e1)',
                          borderRadius: 'var(--radius-md, 8px)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          boxShadow: isSelected ? '0 4px 12px rgba(231, 97, 20, 0.2)' : '0 1px 3px rgba(0,0,0,0.02)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'rgba(231, 97, 20, 0.6)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border-color, #cbd5e1)';
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
                              backgroundColor: 'var(--secondary-color, #e76114)',
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

                        {/* Part Image Thumbnail (16:9 Aspect Ratio) */}
                        <div
                          style={{
                            width: '100%',
                            aspectRatio: '16 / 9',
                            backgroundColor: 'var(--bg-main, #f1f5f9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            borderBottom: '1px solid var(--border-color, #e2e8f0)',
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
                                color: 'var(--text-muted, #94a3b8)',
                              }}
                            >
                              <Package size={28} style={{ opacity: 0.4 }} />
                              <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Foto Part</span>
                            </div>
                          )}
                        </div>

                        {/* Part Info Box */}
                        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: '0.875rem',
                              color: 'var(--text-main, #0f172a)',
                              lineHeight: '1.25',
                            }}
                          >
                            {part.part_name}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
                              {part.part_number}
                            </span>

                            {part.model_code && (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.4rem',
                                  backgroundColor: 'var(--bg-main, #f1f5f9)',
                                  border: '1px solid var(--border-color, #cbd5e1)',
                                  borderRadius: 'var(--radius-sm, 4px)',
                                  color: 'var(--text-muted, #475569)',
                                }}
                              >
                                Model {part.model_code}
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748b)', marginTop: '0.15rem' }}>
                            Berat: <strong>{part.berat_part_gr} gr</strong> | Mat: {part.material || '-'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Part Entry Form (~38% width) */}
          <div style={{ flex: '1 1 38%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Card title="Form Input Part NG ke Tiket">
              {!selectedPart ? (
                <div
                  style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted, #64748b)',
                    backgroundColor: 'var(--bg-main, #f8fafc)',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1px dashed var(--border-color, #cbd5e1)',
                  }}
                >
                  <AlertCircle size={36} style={{ marginBottom: '0.5rem', opacity: 0.5, color: 'var(--secondary-color, #e76114)' }} />
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main, #0f172a)' }}>
                    Pilih salah satu part pada katalog di sebelah kiri.
                  </p>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
                    Klik kartu part untuk memasukkan quantity reject ke tiket pengiriman.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Selected Part Summary Banner */}
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(231, 97, 20, 0.06)',
                      border: '1.5px solid rgba(231, 97, 20, 0.3)',
                      borderRadius: 'var(--radius-md, 8px)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary-color, #e76114)', textTransform: 'uppercase' }}>
                        Part Terpilih
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          backgroundColor: '#ffffff',
                          border: '1px solid rgba(231, 97, 20, 0.3)',
                          borderRadius: 'var(--radius-sm, 4px)',
                          color: 'var(--secondary-color, #e76114)',
                        }}
                      >
                        Model {selectedPart.model_code || '-'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                      {selectedPart.part_name}
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.775rem', color: 'var(--text-muted, #64748b)', paddingTop: '0.2rem' }}>
                      <div>
                        <strong>No. Part:</strong> {selectedPart.part_number}
                      </div>
                      <div>
                        <strong>Berat/pcs:</strong> {Number(selectedPart.berat_part_gr)} gr
                      </div>
                      <div>
                        <strong>Material:</strong> {selectedPart.material || '-'}
                      </div>
                      <div>
                        <strong>Factory:</strong> {selectedPart.factory_name || user?.factory_name || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Operational Time & Shift Auto-Info Card */}
                  <div
                    style={{
                      padding: '0.75rem 0.95rem',
                      backgroundColor: 'var(--bg-main, #f8fafc)',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      borderRadius: 'var(--radius-md, 8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={18} style={{ color: 'var(--secondary-color, #e76114)' }} />
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', display: 'block' }}>
                          Tanggal Pengiriman
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                          {formatIndonesianDate(requestDate)}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.3rem 0.65rem',
                        borderRadius: 'var(--radius-md, 8px)',
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
                  </div>

                  {/* Input Quantity NG (pcs) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                      Jumlah Quantity (pcs) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Masukkan jumlah pcs..."
                      value={partQuantityPcs}
                      onChange={(e) => {
                        const val = e.target.value;
                        onPartQuantityChange(val === '' ? '' : Math.max(1, parseInt(val, 10) || 1));
                      }}
                      leftIcon={<Package size={16} />}
                      required
                    />
                  </div>

                  {/* Computed Weight Highlight Display Box */}
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'rgba(231, 97, 20, 0.05)',
                      border: '1px solid rgba(231, 97, 20, 0.2)',
                      borderRadius: 'var(--radius-md, 8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted, #64748b)' }}>
                      <Scale size={18} style={{ color: 'var(--secondary-color, #e76114)' }} />
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', color: 'var(--text-main, #0f172a)' }}>
                          Estimasi Total Berat Part
                        </span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                          ({partQuantityPcs || 0} pcs × {Number(selectedPart.berat_part_gr)} gr / 1000)
                        </span>
                      </div>
                    </div>

                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                      {currentPartLiveWeightKg.toFixed(2)} <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>kg</span>
                    </span>
                  </div>

                  {/* Notes / Catatan Defect */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                      Catatan / Keterangan Defect (Opsional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Contoh: Bumper baret, Flash tebal, short shot..."
                      value={itemNotes}
                      onChange={(e) => onItemNotesChange(e.target.value)}
                    />
                  </div>

                  {/* Add to Draft Ticket Button */}
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={onAddItem}
                    leftIcon={<PlusCircle size={18} />}
                    style={{ width: '100%', marginTop: '0.25rem' }}
                  >
                    + Tambahkan ke Rincian Tiket
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

      {/* DRAFTED TICKET ITEMS SUMMARY & FINAL SUBMISSION CARD */}
      <Card
        title={`Rincian Item Tiket Pengiriman (${items.length} Item Ditambahkan)`}
        subtitle="Periksa seluruh item fisik yang akan diserahkan ke operator crushing sebelum mengirim tiket"
      >
        {items.length === 0 ? (
          <div
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              color: 'var(--text-muted, #64748b)',
              backgroundColor: 'var(--bg-main, #f8fafc)',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px dashed var(--border-color, #cbd5e1)',
            }}
          >
            <AlertCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main, #0f172a)' }}>
              Belum ada item ditambahkan ke tiket ini.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
              Silakan pilih part dari katalog di atas dan klik "+ Tambahkan ke Rincian Tiket".
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr
                    style={{
                      backgroundColor: 'var(--bg-main, #f1f5f9)',
                      textAlign: 'left',
                      color: 'var(--text-muted, #475569)',
                      borderBottom: '1px solid var(--border-color, #cbd5e1)',
                    }}
                  >
                    <th style={{ padding: '0.65rem 0.85rem' }}>Tipe</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Nama Part / Material</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Jumlah (Pcs)</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Total Berat</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Hapus</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <Badge variant={it.item_type === 'part_ng' ? 'primary' : 'warning'} size="sm">
                          {it.item_type === 'part_ng' ? 'Part NG' : 'Runner'}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                        <div>{it.material_name || 'Item'}</div>
                        {it.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic', fontWeight: 500 }}>
                            {it.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700 }}>
                        {it.item_type === 'part_ng' ? `${it.quantity_pcs} pcs` : '-'}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                        {Number(it.runner_weight_kg || 0).toFixed(2)} kg
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0.35rem',
                          }}
                          title="Hapus Item dari Tiket"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Summary Footer Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.15rem',
                backgroundColor: 'rgba(231, 97, 20, 0.06)',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid rgba(231, 97, 20, 0.2)',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                Total: <strong>{items.length} Item</strong> | <strong>{estimatedTotalPcs} Pcs Part</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Scale size={20} color="var(--secondary-color, #e76114)" />
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                  {estimatedTotalWeightKg.toFixed(2)} kg
                </span>
              </div>
            </div>

            {/* Final Submit Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={onSubmitRequest}
              isLoading={isSubmitting}
              leftIcon={<Send size={20} />}
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 800 }}
            >
              Kirim Tiket Permintaan ke Operator Crushing
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
