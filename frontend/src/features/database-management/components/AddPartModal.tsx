import React, { useState, useMemo } from 'react';
import {
  X,
  PackagePlus,
  Plus,
  Minus,
  Trash2,
  Search,
  Scale,
  Package,
  LayoutGrid,
  List,
  RotateCcw,
  Check,
  Send,
  Calendar,
  Sun,
  Moon,
  ArrowLeft,
} from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';
import { formatIndonesianDate } from '../../../config/shift.config';
import type { DatabaseRequestHeader } from '../types/databaseManagement.types';

export interface StagedItem {
  tempId: string;
  item_type: 'part_ng' | 'runner_ng';
  master_part_id?: string;
  material_id?: string;
  part_name: string;
  part_number?: string;
  sebango_code?: string;
  model_code?: string;
  berat_part_gr?: number;
  quantity_pcs: number;
  weight_kg: number;
  notes: string;
  image_url?: string;
}

interface AddPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DatabaseRequestHeader | null;
  masterParts: Array<{
    id: string;
    part_number: string;
    part_name: string;
    sebango_code?: string;
    berat_part_gr: number;
    material: string;
    model_code?: string;
    model_name?: string;
    jenis_part?: string;
    image_url?: string;
    factory_id?: string;
    factory_name?: string;
  }>;
  materials?: Array<{ id: string; material_name: string }>;
  factories?: Array<{ id: string; name: string }>;
  onAddBatch: (
    items: Array<{
      item_type: 'part_ng' | 'runner_ng';
      master_part_id?: string;
      material_id?: string;
      quantity_pcs?: number;
      weight_kg?: number;
      notes?: string;
    }>
  ) => Promise<void>;
}

export const AddPartModal: React.FC<AddPartModalProps> = ({
  isOpen,
  onClose,
  request,
  masterParts,
  factories = [],
  onAddBatch,
}) => {
  // 1. All hooks called unconditionally at top level (prevents React hook count errors)
  const [searchInput, setSearchInput] = useState<string>('');
  // 300ms debounce for high performance searching
  const debouncedSearch = useDebounce(searchInput, 300);

  const [selectedJenis, setSelectedJenis] = useState<string>('ALL');
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('');
  const [catalogViewMode, setCatalogViewMode] = useState<'grid' | 'list'>('grid');

  // Staged cart items
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const safeParts = useMemo(() => (Array.isArray(masterParts) ? masterParts : []), [masterParts]);

  // Extract unique jenis_part options
  const jenisOptions = useMemo(() => {
    const set = new Set<string>();
    safeParts.forEach((p) => {
      if (p && p.jenis_part) set.add(p.jenis_part);
    });
    return Array.from(set).sort();
  }, [safeParts]);

  // Filter master parts using debouncedSearch
  const filteredParts = useMemo(() => {
    return safeParts.filter((p) => {
      if (!p) return false;
      if (selectedJenis !== 'ALL' && p.jenis_part !== selectedJenis) return false;
      if (selectedFactoryId && p.factory_id !== selectedFactoryId) return false;

      if (!debouncedSearch.trim()) return true;
      const q = debouncedSearch.toLowerCase().trim();
      const name = String(p.part_name || '').toLowerCase();
      const num = String(p.part_number || '').toLowerCase();
      const sebango = String(p.sebango_code || '').toLowerCase();
      const model = String(p.model_code || p.model_name || '').toLowerCase();
      return name.includes(q) || num.includes(q) || sebango.includes(q) || model.includes(q);
    });
  }, [safeParts, selectedJenis, selectedFactoryId, debouncedSearch]);

  // 2. Early return AFTER all hooks
  if (!isOpen) return null;

  // Totals of staged items
  const totalStagedPcs = stagedItems.reduce((acc, it) => acc + (it.quantity_pcs || 0), 0);
  const totalStagedWeightKg = stagedItems.reduce((acc, it) => acc + (Number(it.weight_kg) || 0), 0);

  // Helper to find staged quantity for a specific part
  const getStagedQtyForPart = (partId: string): number => {
    const item = stagedItems.find((it) => it.item_type === 'part_ng' && it.master_part_id === partId);
    return item ? item.quantity_pcs : 0;
  };

  // Add or increment part in staging cart
  const handleAddOrStepPart = (part: (typeof safeParts)[0], delta: number = 1) => {
    setStagedItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.item_type === 'part_ng' && it.master_part_id === part.id
      );

      const beratGr = Number(part.berat_part_gr) || 0;

      if (existingIdx >= 0) {
        const item = prev[existingIdx];
        const newQty = item.quantity_pcs + delta;
        if (newQty <= 0) {
          return prev.filter((_, idx) => idx !== existingIdx);
        }
        const updated = [...prev];
        const newWeight = beratGr > 0 ? Number(((newQty * beratGr) / 1000).toFixed(2)) : 0;
        updated[existingIdx] = {
          ...item,
          quantity_pcs: newQty,
          weight_kg: newWeight,
        };
        return updated;
      } else {
        if (delta <= 0) return prev;
        const newWeight = beratGr > 0 ? Number(((delta * beratGr) / 1000).toFixed(2)) : 0;
        const newItem: StagedItem = {
          tempId: `${Date.now()}-${Math.random()}`,
          item_type: 'part_ng',
          master_part_id: part.id,
          part_name: part.part_name,
          part_number: part.part_number,
          sebango_code: part.sebango_code,
          model_code: part.model_code || part.model_name,
          berat_part_gr: beratGr,
          quantity_pcs: delta,
          weight_kg: newWeight,
          notes: '',
          image_url: part.image_url,
        };
        return [...prev, newItem];
      }
    });
  };

  // Update item quantity directly via input
  const handleUpdateItemQty = (tempId: string, qty: number) => {
    const validQty = Math.max(1, qty);
    setStagedItems((prev) =>
      prev.map((it) => {
        if (it.tempId !== tempId) return it;
        const beratGr = Number(it.berat_part_gr) || 0;
        const newWeight = beratGr > 0 ? Number(((validQty * beratGr) / 1000).toFixed(2)) : it.weight_kg;
        return {
          ...it,
          quantity_pcs: validQty,
          weight_kg: newWeight,
        };
      })
    );
  };

  // Remove single staged item
  const handleRemoveStagedItem = (tempId: string) => {
    setStagedItems((prev) => prev.filter((it) => it.tempId !== tempId));
  };

  // Clear all staged items
  const handleClearStaged = () => {
    setStagedItems([]);
  };

  // Submit all staged items to backend
  const handleSubmitBatch = async () => {
    if (stagedItems.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload = stagedItems.map((it) => ({
        item_type: it.item_type,
        master_part_id: it.master_part_id,
        material_id: it.material_id,
        quantity_pcs: it.quantity_pcs,
        weight_kg: it.weight_kg,
        notes: it.notes || generalNotes || undefined,
      }));

      await onAddBatch(payload);
      setStagedItems([]);
      setGeneralNotes('');
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
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f8fafc',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto', // Memungkinkan scroll horizontal & vertikal jika resolusi layar kecil (misal 770x670px)
      }}
    >
      <div
        style={{
          minWidth: '940px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
        }}
      >
        {/* ================= 1. TOP HEADER BAR ================= */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            flexShrink: 0,
          }}
        >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(231, 97, 20, 0.12)',
              color: '#e76114',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(-25deg)',
            }}
          >
            <Send size={16} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '1.05rem',
                fontWeight: 900,
                color: '#0f172a',
                margin: 0,
                lineHeight: 1.2,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>Pengiriman Part NG</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#4f46e5',
                  backgroundColor: '#eef2ff',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #e0e7ff',
                }}
              >
                Tiket: {request?.request_number || '-'}
              </span>
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
            title="Tutup Modal dan Kembali"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Database</span>
          </button>
        </div>
      </div>

      {/* ================= MODAL MAIN SCROLL CONTAINER ================= */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* ================= 2. IDENTITY & SHIFT CARD (MATCHING USER SCREENSHOT) ================= */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Left: Sender Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(231, 97, 20, 0.1)',
                color: '#e76114',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PackagePlus size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                  Pengajuan Pengiriman Part NG
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  • Pengirim: <strong>{request?.sender_name || request?.sender_username || '-'}</strong> (@{request?.sender_username || '-'})
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                Departemen: <strong>{request?.department_name || '-'}</strong> | Pabrik: <strong>{request?.factory_name || 'Semua Factory (ALL)'}</strong>
              </div>
            </div>
          </div>

          {/* Right: Shift Pill & Date Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Shift Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: (request?.shift || 'Pagi') === 'Pagi' ? 'rgba(0, 141, 81, 0.1)' : 'rgba(231, 97, 20, 0.1)',
                border: `1.5px solid ${(request?.shift || 'Pagi') === 'Pagi' ? 'rgba(0, 141, 81, 0.3)' : 'rgba(231, 97, 20, 0.3)'}`,
                color: (request?.shift || 'Pagi') === 'Pagi' ? '#008d51' : '#e76114',
                fontWeight: 800,
                fontSize: '0.8rem',
              }}
            >
              {(request?.shift || 'Pagi') === 'Pagi' ? <Sun size={14} /> : <Moon size={14} />}
              <span>Shift {request?.shift || 'Pagi'}</span>
            </div>

            {/* Date Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              <Calendar size={14} color="#e76114" />
              <span>{formatIndonesianDate(request?.request_date || new Date().toISOString())}</span>
            </div>

            {stagedItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearStaged}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  color: '#dc2626',
                  cursor: 'pointer',
                }}
                title="Reset draf part yang ditambahkan"
              >
                <RotateCcw size={13} />
                <span>Kosongkan Draf</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= 3. FILTER & SEARCH BAR (EXACT MATCH TO SCREENSHOT) ================= */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            gap: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            flexWrap: 'wrap',
          }}
        >
          {/* Search Input with 300ms Debounce */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              size={16}
              color="#94a3b8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Cari nama part, part number, model..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 2rem 0.55rem 2.25rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                color: '#0f172a',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '2px',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Factory Dropdown */}
          <select
            value={selectedFactoryId}
            onChange={(e) => setSelectedFactoryId(e.target.value)}
            style={{
              height: '40px',
              padding: '0 0.75rem',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '0.85rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
              minWidth: '160px',
            }}
          >
            <option value="">-- Semua Pabrik --</option>
            {factories.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Category Dropdown */}
          <select
            value={selectedJenis}
            onChange={(e) => setSelectedJenis(e.target.value)}
            style={{
              height: '40px',
              padding: '0 0.75rem',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '0.85rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
              minWidth: '180px',
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
                padding: '6px 8px',
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
                padding: '6px 8px',
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

        {/* ================= 4. MAIN 2-COLUMN SECTION (MATCHING SCREENSHOT) ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 390px', gap: '1.25rem', alignItems: 'start' }}>
          {/* ================= COLUMN 1: KATALOG MASTER PART (LEFT) ================= */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '1.15rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '520px',
            }}
          >
            {/* Header: Katalog Master Part (X Item) + Hint */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.925rem', fontWeight: 800, color: '#0f172a' }}>
                Katalog Master Part ({filteredParts.length} Item)
              </span>
              <span style={{ fontSize: '0.75rem', color: '#e76114', fontWeight: 700 }}>
                💡 Klik kartu part untuk langsung memasukkan ke rincian pengiriman
              </span>
            </div>

            {/* Catalog Items Container */}
            {filteredParts.length === 0 ? (
              <div
                style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1.5px dashed #cbd5e1',
                  color: '#64748b',
                  margin: 'auto 0',
                }}
              >
                <Package size={38} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ fontWeight: 800, fontSize: '0.925rem', margin: 0, color: '#0f172a' }}>
                  Tidak ada part ditemukan
                </p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
                  Coba ubah kata kunci pencarian atau kategori filter jenis part.
                </p>
              </div>
            ) : catalogViewMode === 'grid' ? (
              /* ================= GRID VIEW (MATCHING USER SCREENSHOT) ================= */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                {filteredParts.map((part) => {
                  const currentQty = getStagedQtyForPart(part.id);
                  const isInCart = currentQty > 0;

                  return (
                    <div
                      key={part.id}
                      onClick={() => handleAddOrStepPart(part, 1)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '235px',
                        backgroundColor: isInCart ? 'rgba(0, 141, 81, 0.04)' : '#ffffff',
                        border: isInCart ? '2px solid #008d51' : '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        boxShadow: isInCart ? '0 4px 12px rgba(0, 141, 81, 0.18)' : '0 2px 5px rgba(0,0,0,0.03)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isInCart) {
                          e.currentTarget.style.borderColor = '#e76114';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isInCart) {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)';
                        }
                      }}
                    >
                      {/* Active Quantity Badge in Top-Right */}
                      {isInCart && (
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
                          borderBottom: '1px solid #f1f5f9',
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

                        {/* Model Badge on bottom left of photo */}
                        {(part.model_code || part.model_name) && (
                          <div style={{ position: 'absolute', bottom: '6px', left: '6px' }}>
                            <span
                              style={{
                                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                                color: '#ffffff',
                                borderRadius: '4px',
                                padding: '0.15rem 0.4rem',
                                fontSize: '0.675rem',
                                fontWeight: 800,
                              }}
                            >
                              {part.model_code || part.model_name}
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
                            color: '#0f172a',
                            lineHeight: '1.25',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '2.15rem',
                            textTransform: 'uppercase',
                          }}
                          title={part.part_name}
                        >
                          {part.part_name}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: 'auto', paddingTop: '0.35rem' }}>
                          <span
                            style={{
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              color: '#0f172a',
                              backgroundColor: '#f1f5f9',
                              padding: '0.15rem 0.35rem',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {part.material || '-'}
                          </span>
                        </div>

                        {/* Bottom Action: + + Masukkan or Stepper */}
                        <div style={{ marginTop: '0.5rem' }}>
                          {isInCart ? (
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
                                onClick={() => handleAddOrStepPart(part, -1)}
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
                                onClick={() => handleAddOrStepPart(part, 1)}
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
                                handleAddOrStepPart(part, 1);
                              }}
                              style={{
                                width: '100%',
                                padding: '0.4rem',
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
                              <Plus size={13} color="#e76114" />
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
              /* ================= LIST TABLE VIEW ================= */
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Part Info</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Nomor / Sebango</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Model</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Material</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParts.map((part) => {
                      const currentQty = getStagedQtyForPart(part.id);
                      const isInCart = currentQty > 0;

                      return (
                        <tr
                          key={part.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: isInCart ? 'rgba(0, 141, 81, 0.04)' : '#ffffff',
                          }}
                        >
                          <td style={{ padding: '0.65rem 0.75rem' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{part.part_name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              Berat standar: {part.berat_part_gr ? `${part.berat_part_gr} gr` : '-'}
                            </div>
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', color: '#334155', fontWeight: 700 }}>
                            <div>{part.part_number}</div>
                            {part.sebango_code && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Sebango: {part.sebango_code}</div>}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem' }}>
                            <span style={{ backgroundColor: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.72rem', color: '#e76114' }}>
                              {part.model_code || part.model_name || '-'}
                            </span>
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', color: '#64748b', fontWeight: 700 }}>
                            {part.material || '-'}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                            {isInCart ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#f0fdf4', padding: '2px 6px', borderRadius: '6px', border: '1px solid #86efac' }}>
                                <button
                                  type="button"
                                  onClick={() => handleAddOrStepPart(part, -1)}
                                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#15803d' }}
                                >
                                  <Minus size={13} />
                                </button>
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#15803d' }}>{currentQty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleAddOrStepPart(part, 1)}
                                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#15803d' }}
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddOrStepPart(part, 1)}
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: '#ffffff',
                                  color: '#0f172a',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                + Masukkan
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ================= COLUMN 2: RINCIAN PENGIRIMAN (RIGHT CART PANEL) ================= */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'sticky',
              top: '1rem',
            }}
          >
            {/* Cart Header */}
            <div
              style={{
                padding: '0.85rem 1.15rem',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                  Rincian Pengiriman
                </span>
                <span
                  style={{
                    backgroundColor: stagedItems.length > 0 ? '#e76114' : '#cbd5e1',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '12px',
                  }}
                >
                  {stagedItems.length}
                </span>
              </div>

              {stagedItems.length > 0 && (
                <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#008d51' }}>
                  {totalStagedPcs} Pcs • {totalStagedWeightKg.toFixed(2)} kg
                </span>
              )}
            </div>

            {/* Cart Items List */}
            <div
              style={{
                maxHeight: '420px',
                minHeight: '180px',
                overflowY: 'auto',
                padding: stagedItems.length === 0 ? '0' : '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              {stagedItems.length === 0 ? (
                /* Empty state matching user screenshot */
                <div
                  style={{
                    padding: '3.5rem 1.5rem',
                    textAlign: 'center',
                    color: '#64748b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    height: '100%',
                  }}
                >
                  <PackagePlus size={44} style={{ color: '#e76114', opacity: 0.8 }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Rincian Pengiriman Masih Kosong
                  </span>
                  <span style={{ fontSize: '0.775rem', color: '#94a3b8', maxWidth: '280px' }}>
                    Cukup klik kartu part pada katalog untuk langsung memasukkannya ke rincian ini.
                  </span>
                </div>
              ) : (
                stagedItems.map((it, idx) => (
                  <div
                    key={it.tempId}
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
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={it.part_name}
                        >
                          {it.part_name}
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
                              color: '#e76114',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                          >
                            {it.model_code}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Stepper + Weight + Delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
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
                          onClick={() => {
                            const found = safeParts.find((p) => p.id === it.master_part_id);
                            if (found) handleAddOrStepPart(found, -1);
                          }}
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
                            handleUpdateItemQty(it.tempId, isNaN(val) ? 1 : val);
                          }}
                          style={{
                            width: '40px',
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
                          onClick={() => {
                            const found = safeParts.find((p) => p.id === it.master_part_id);
                            if (found) handleAddOrStepPart(found, 1);
                          }}
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

                      {/* Weight in kg */}
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 900,
                          color: '#e76114',
                          minWidth: '50px',
                          textAlign: 'right',
                        }}
                      >
                        {it.weight_kg.toFixed(2)} <span style={{ fontSize: '0.675rem', fontWeight: 700 }}>kg</span>
                      </span>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveStagedItem(it.tempId)}
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
                        }}
                        title="Hapus part dari daftar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Summary & Notes & Submit */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {/* Catatan Pengiriman (Opsional) */}
              <div>
                <label style={{ fontSize: '0.775rem', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>
                  Catatan Pengiriman (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan untuk operator crushing..."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
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

              {/* TOTAL AKUMULASI */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Scale size={20} color="#e76114" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    TOTAL AKUMULASI
                  </span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#e76114' }}>
                  {totalStagedWeightKg.toFixed(2)} kg{' '}
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                    ({totalStagedPcs} pcs)
                  </span>
                </div>
              </div>

              {/* Big CTA Button */}
              <button
                type="button"
                onClick={handleSubmitBatch}
                disabled={stagedItems.length === 0 || isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: stagedItems.length === 0 || isSubmitting ? '#94a3b8' : '#4f46e5',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: stagedItems.length === 0 || isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: stagedItems.length > 0 ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Send size={18} />
                <span>
                  {isSubmitting
                    ? 'Menyimpan...'
                    : `Simpan ${stagedItems.length > 0 ? `${stagedItems.length} Part ` : ''}ke Tiket`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
