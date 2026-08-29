import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import type { CrushingRequest, ApproveCrushingRequestPayload } from '../types/crushingRequests.types';
import {
  CheckCircle2,
  Clock,
  Network,
  User,
  Calendar,
  Layers,
  Scale,
  Check,
  Package,
  ZoomIn,
  LayoutGrid,
  List,
  Plus,
  Minus,
  AlertTriangle,
  X,
} from 'lucide-react';

interface ItemAdjustmentState {
  verifiedQty: number;
  verifiedWeight: number;
  adjustmentNotes: string;
}

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CrushingRequest | null;
  isLoading: boolean;
  isOperatorOrAdmin?: boolean;
  onApprove?: (id: string, payload?: ApproveCrushingRequestPayload) => void;
  isActionLoading?: boolean;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  isLoading,
  isOperatorOrAdmin,
  onApprove,
  isActionLoading,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [operatorNotes, setOperatorNotes] = useState<string>('');
  const [itemAdjustments, setItemAdjustments] = useState<Record<string, ItemAdjustmentState>>({});

  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
    partNumber?: string;
    model?: string;
    weightKg?: number;
    qtyPcs?: number;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Initialize or reset adjustment state when request changes
  useEffect(() => {
    if (request && request.items) {
      const initial: Record<string, ItemAdjustmentState> = {};
      for (const item of request.items) {
        initial[item.id] = {
          verifiedQty: item.verified_quantity_pcs !== null && item.verified_quantity_pcs !== undefined ? item.verified_quantity_pcs : item.quantity_pcs,
          verifiedWeight: item.verified_weight_kg !== null && item.verified_weight_kg !== undefined ? Number(item.verified_weight_kg) : Number(item.weight_kg || 0),
          adjustmentNotes: item.adjustment_notes || '',
        };
      }
      setItemAdjustments(initial);
      setOperatorNotes(request.notes || '');
    }
  }, [request]);

  // Handlers for adjusting physical item quantities & weights
  const handleStepQty = (itemId: string, beratGr: number, delta: number) => {
    setItemAdjustments((prev) => {
      const current = prev[itemId] || { verifiedQty: 0, verifiedWeight: 0, adjustmentNotes: '' };
      const nextQty = Math.max(0, current.verifiedQty + delta);
      const nextWeight = beratGr > 0 ? Number(((nextQty * beratGr) / 1000).toFixed(2)) : current.verifiedWeight;
      return {
        ...prev,
        [itemId]: {
          ...current,
          verifiedQty: nextQty,
          verifiedWeight: nextWeight,
        },
      };
    });
  };

  const handleUpdateQtyDirect = (itemId: string, beratGr: number, val: number) => {
    const nextQty = Math.max(0, isNaN(val) ? 0 : val);
    const nextWeight = beratGr > 0 ? Number(((nextQty * beratGr) / 1000).toFixed(2)) : 0;
    setItemAdjustments((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { verifiedQty: 0, verifiedWeight: 0, adjustmentNotes: '' }),
        verifiedQty: nextQty,
        verifiedWeight: nextWeight,
      },
    }));
  };

  const handleUpdateWeightDirect = (itemId: string, val: number) => {
    const nextWeight = Math.max(0, isNaN(val) ? 0 : Number(val.toFixed(2)));
    setItemAdjustments((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { verifiedQty: 0, verifiedWeight: 0, adjustmentNotes: '' }),
        verifiedWeight: nextWeight,
      },
    }));
  };

  const handleUpdateNotes = (itemId: string, notesVal: string) => {
    setItemAdjustments((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { verifiedQty: 0, verifiedWeight: 0, adjustmentNotes: '' }),
        adjustmentNotes: notesVal,
      },
    }));
  };

  // Live calculation of verified totals
  const { totalVerifiedWeight, totalVerifiedPcs, hasDiscrepancies } = useMemo(() => {
    if (!request || !request.items) return { totalVerifiedWeight: 0, totalVerifiedPcs: 0, hasDiscrepancies: false };
    let totalWeight = 0;
    let totalPcs = 0;
    let hasDiff = false;

    for (const item of request.items) {
      const adj = itemAdjustments[item.id];
      const verifiedQty = adj ? adj.verifiedQty : item.quantity_pcs;
      const verifiedWeight = adj ? adj.verifiedWeight : Number(item.weight_kg || 0);

      totalWeight += verifiedWeight;
      totalPcs += verifiedQty;

      if (verifiedQty !== item.quantity_pcs || Math.abs(verifiedWeight - Number(item.weight_kg || 0)) > 0.001) {
        hasDiff = true;
      }
    }

    return {
      totalVerifiedWeight: Number(totalWeight.toFixed(2)),
      totalVerifiedPcs: totalPcs,
      hasDiscrepancies: hasDiff,
    };
  }, [request, itemAdjustments]);

  if (!request && !isLoading) return null;

  const handleApproveSubmit = () => {
    if (!request || !onApprove) return;

    const payloadItems = request.items?.map((item) => {
      const adj = itemAdjustments[item.id];
      return {
        id: item.id,
        verified_quantity_pcs: adj ? adj.verifiedQty : item.quantity_pcs,
        verified_weight_kg: adj ? adj.verifiedWeight : Number(item.weight_kg || 0),
        adjustment_notes: adj?.adjustmentNotes?.trim() || undefined,
      };
    });

    onApprove(request.id, {
      notes: operatorNotes.trim() || undefined,
      items: payloadItems,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success" size="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} />
              <span>Sudah Disetujui & Divalidasi</span>
            </div>
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="warning" size="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={13} />
              <span>Menunggu Verifikasi Fisik</span>
            </div>
          </Badge>
        );
    }
  };

  const handleOpenPreview = (item: any) => {
    if (!item.image_url) return;
    const adj = itemAdjustments[item.id];
    setZoomLevel(1);
    setPreviewImage({
      url: item.image_url,
      title: item.part_name_snapshot || item.material_name_snapshot || 'Foto Part',
      partNumber: item.part_number_snapshot || undefined,
      model: item.model_snapshot || undefined,
      weightKg: adj ? adj.verifiedWeight : Number(item.weight_kg || 0),
      qtyPcs: adj ? adj.verifiedQty : item.quantity_pcs,
    });
  };

  const isPendingMode = isOperatorOrAdmin && request?.status === 'pending';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        title={`Verifikasi & Detail Pengiriman: ${request?.request_number || 'Loading...'}`}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Button variant="outline" onClick={onClose} disabled={isActionLoading}>
                Tutup
              </Button>
            </div>

            {isPendingMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Button
                  variant="primary"
                  onClick={handleApproveSubmit}
                  isLoading={isActionLoading}
                  leftIcon={<Check size={16} />}
                  style={{
                    backgroundColor: 'var(--primary-color, #008d51)',
                    borderColor: 'var(--primary-color, #008d51)',
                    fontWeight: 900,
                    padding: '0.6rem 1.5rem',
                  }}
                >
                  Setujui & Validasi Pengiriman
                </Button>
              </div>
            )}
          </div>
        }
      >
        {isLoading || !request ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
            Memuat detail pengiriman...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Metadata Banner Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                backgroundColor: 'var(--bg-main, #f8fafc)',
                padding: '1.15rem 1.25rem',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--border-color, #e2e8f0)',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem', fontWeight: 600 }}>Status Pengiriman:</div>
                <div style={{ marginTop: '0.3rem' }}>{getStatusBadge(request.status)}</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem', fontWeight: 600 }}>Pengirim:</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <User size={15} color="var(--primary-color, #008d51)" />
                  <span>{request.sender_name} <span style={{ color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>(@{request.sender_username})</span></span>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem', fontWeight: 600 }}>Departemen & Pabrik:</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <Network size={15} color="var(--primary-color, #008d51)" />
                  <span>{request.department_name} ({request.factory_name})</span>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem', fontWeight: 600 }}>Tanggal & Shift:</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <Calendar size={15} color="var(--secondary-color, #e76114)" />
                  <span>{request.request_date} (Shift {request.shift})</span>
                </div>
              </div>

              {request.validated_by && (
                <div>
                  <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem', fontWeight: 600 }}>Divalidasi Oleh:</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)', marginTop: '0.2rem' }}>
                    {request.validator_name || 'Operator'}{' '}
                    {request.validated_at && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 'normal' }}>
                        ({new Date(request.validated_at).toLocaleString('id-ID')})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sender Notes Banner */}
            {request.notes && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontSize: '0.85rem',
                }}
              >
                <strong style={{ color: '#92400e' }}>Catatan Pengirim: </strong>
                <span style={{ color: '#78350f' }}>{request.notes}</span>
              </div>
            )}

            {/* Operator Discrepancy Notice for Verification Mode */}
            {isPendingMode && (
              <div
                style={{
                  padding: '0.85rem 1.15rem',
                  backgroundColor: hasDiscrepancies ? 'rgba(231, 97, 20, 0.08)' : 'rgba(0, 141, 81, 0.06)',
                  border: `1.5px solid ${hasDiscrepancies ? 'rgba(231, 97, 20, 0.3)' : 'rgba(0, 141, 81, 0.2)'}`,
                  borderRadius: 'var(--radius-md, 8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.85rem',
                  color: hasDiscrepancies ? '#9a3412' : '#065f46',
                }}
              >
                {hasDiscrepancies ? (
                  <AlertTriangle size={20} color="#e76114" style={{ flexShrink: 0 }} />
                ) : (
                  <CheckCircle2 size={20} color="#008d51" style={{ flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  {hasDiscrepancies ? (
                    <span>
                      <strong>Terdapat penyesuaian kuantitas fisik.</strong> Data asli pengajuan pengirim tetap tersimpan utuh sebagai riwayat audit.
                    </span>
                  ) : (
                    <span>
                      <strong>Verifikasi Fisik Lapangan:</strong> Sesuaikan kuantitas di bawah ini jika fisik barang yang tiba kurang/lebih, lalu klik <em>Setujui & Validasi</em>.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Section Header with View Mode Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.25rem' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                  Rincian Item Pengiriman ({request.items?.length || 0} Item)
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: '0.15rem 0 0 0' }}>
                  {isPendingMode
                    ? 'Periksa visual part dan sesuaikan kuantitas fisik aktual sebelum menyetujui.'
                    : 'Riwayat data pengajuan asli vs data fisik yang telah divalidasi operator.'}
                </p>
              </div>

              {/* View Mode Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-main, #f1f5f9)',
                  padding: '3px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: viewMode === 'grid' ? 'var(--primary-color, #008d51)' : 'transparent',
                    color: viewMode === 'grid' ? '#ffffff' : 'var(--text-muted, #64748b)',
                    fontWeight: viewMode === 'grid' ? 800 : 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <LayoutGrid size={14} />
                  <span>Grid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: viewMode === 'table' ? 'var(--primary-color, #008d51)' : 'transparent',
                    color: viewMode === 'table' ? '#ffffff' : 'var(--text-muted, #64748b)',
                    fontWeight: viewMode === 'table' ? 800 : 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <List size={14} />
                  <span>Tabel</span>
                </button>
              </div>
            </div>

            {/* 1. GRID VIEW WITH INLINE ADJUSTMENT STEPPERS */}
            {viewMode === 'grid' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {request.items && request.items.map((item, idx) => {
                  const adj = itemAdjustments[item.id] || {
                    verifiedQty: item.verified_quantity_pcs ?? item.quantity_pcs,
                    verifiedWeight: item.verified_weight_kg ?? Number(item.weight_kg || 0),
                    adjustmentNotes: item.adjustment_notes || '',
                  };
                  const beratGr = Number(item.berat_part_gr_snapshot) || 0;
                  const isPart = item.item_type === 'part_ng';
                  const isModified = isPendingMode
                    ? (isPart ? adj.verifiedQty !== item.quantity_pcs : Math.abs(adj.verifiedWeight - Number(item.weight_kg || 0)) > 0.001)
                    : (item.verified_quantity_pcs !== null && item.verified_quantity_pcs !== undefined && item.verified_quantity_pcs !== item.quantity_pcs);

                  return (
                    <div
                      key={item.id || idx}
                      style={{
                        border: isModified ? '1.5px solid #e76114' : '1.5px solid var(--border-color, #e2e8f0)',
                        borderRadius: 'var(--radius-lg, 12px)',
                        backgroundColor: 'var(--bg-card, #ffffff)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: isModified ? '0 4px 12px rgba(231, 97, 20, 0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Image Header Box */}
                      <div
                        style={{
                          position: 'relative',
                          height: '170px',
                          backgroundColor: '#f8fafc',
                          borderBottom: '1px solid var(--border-color, #e2e8f0)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isPart ? (
                          item.image_url ? (
                            <div
                              onClick={() => handleOpenPreview(item)}
                              style={{ width: '100%', height: '100%', cursor: 'pointer', position: 'relative' }}
                              title="Klik untuk memperbesar gambar part"
                            >
                              <img
                                src={item.image_url}
                                alt={item.part_name_snapshot || 'Part'}
                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.5rem' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/no-images.jpg';
                                }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  right: '10px',
                                  bottom: '10px',
                                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                                  color: '#ffffff',
                                  borderRadius: '20px',
                                  padding: '0.25rem 0.55rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  backdropFilter: 'blur(4px)',
                                }}
                              >
                                <ZoomIn size={12} />
                                <span>Perbesar</span>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
                              <Package size={40} style={{ opacity: 0.4 }} />
                              <span style={{ fontSize: '0.725rem', fontWeight: 700 }}>Foto Tidak Tersedia</span>
                            </div>
                          )
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: 'var(--secondary-color, #e76114)' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(231, 97, 20, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Layers size={28} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Runner Material</span>
                          </div>
                        )}

                        {/* Badges */}
                        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                          <Badge variant={isPart ? 'primary' : 'warning'} size="sm">
                            {isPart ? 'Part NG' : 'Runner NG'}
                          </Badge>
                        </div>

                        {item.model_snapshot && (
                          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                            <span style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#ffffff', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 800 }}>
                              {item.model_snapshot}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                        <div>
                          <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: 0, lineHeight: 1.35 }}>
                            {item.part_name_snapshot || item.material_name_snapshot || 'Material'}
                          </h5>
                          {item.part_number_snapshot && (
                            <div style={{ marginTop: '0.25rem' }}>
                              <code style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                {item.part_number_snapshot}
                              </code>
                            </div>
                          )}
                        </div>

                        {item.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: '0.35rem 0.5rem', borderRadius: '6px', borderLeft: '3px solid #cbd5e1' }}>
                            {item.notes}
                          </div>
                        )}

                        {/* Original Submitted Values Reference */}
                        <div style={{ padding: '0.5rem 0.65rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.775rem', color: 'var(--text-muted, #64748b)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Pengajuan Pengirim:</span>
                          <strong>
                            {item.quantity_pcs > 0 ? `${item.quantity_pcs} pcs` : ''} ({Number(item.weight_kg || 0).toFixed(2)} kg)
                          </strong>
                        </div>

                        {/* OPERATOR INTERACTIVE PHYSICAL VERIFICATION CONTROLS */}
                        {isPendingMode ? (
                          <div
                            style={{
                              marginTop: 'auto',
                              padding: '0.75rem',
                              backgroundColor: isModified ? 'rgba(231, 97, 20, 0.05)' : 'rgba(0, 141, 81, 0.04)',
                              borderRadius: '8px',
                              border: `1.5px solid ${isModified ? 'rgba(231, 97, 20, 0.3)' : 'rgba(0, 141, 81, 0.2)'}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.775rem', fontWeight: 800, color: isModified ? '#c2410c' : '#047857' }}>
                                Fisik Diterima ({isPart ? 'Pcs' : 'Kg'}):
                              </span>
                              <span style={{ fontSize: '0.825rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                                {Number(adj.verifiedWeight || 0).toFixed(2)} kg
                              </span>
                            </div>

                            {/* Stepper for Part NG */}
                            {isPart ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleStepQty(item.id, beratGr, -1)}
                                  disabled={adj.verifiedQty <= 0}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: '#ffffff',
                                    color: '#0f172a',
                                    cursor: adj.verifiedQty <= 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Minus size={14} />
                                </button>

                                <input
                                  type="number"
                                  min={0}
                                  value={adj.verifiedQty}
                                  onChange={(e) => handleUpdateQtyDirect(item.id, beratGr, parseInt(e.target.value, 10))}
                                  style={{
                                    flex: 1,
                                    height: '32px',
                                    textAlign: 'center',
                                    fontWeight: 900,
                                    fontSize: '0.95rem',
                                    borderRadius: '6px',
                                    border: '1.5px solid var(--primary-color, #008d51)',
                                    outline: 'none',
                                  }}
                                />

                                <button
                                  type="button"
                                  onClick={() => handleStepQty(item.id, beratGr, 1)}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: '#ffffff',
                                    color: '#0f172a',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            ) : (
                              /* Input Weight for Runner */
                              <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={adj.verifiedWeight}
                                onChange={(e) => handleUpdateWeightDirect(item.id, parseFloat(e.target.value))}
                                style={{
                                  width: '100%',
                                  height: '32px',
                                  padding: '0 0.5rem',
                                  fontWeight: 900,
                                  fontSize: '0.9rem',
                                  borderRadius: '6px',
                                  border: '1.5px solid var(--secondary-color, #e76114)',
                                  outline: 'none',
                                }}
                              />
                            )}

                            {/* Discrepancy Alert & Note Field */}
                            {isModified && (
                              <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <div style={{ fontSize: '0.725rem', color: '#c2410c', fontWeight: 800 }}>
                                  ⚠️ Selisih: {isPart ? `${adj.verifiedQty - item.quantity_pcs} pcs` : `${(adj.verifiedWeight - Number(item.weight_kg || 0)).toFixed(2)} kg`}
                                </div>
                                <input
                                  type="text"
                                  placeholder="Alasan selisih (contoh: kurang 1 pcs)..."
                                  value={adj.adjustmentNotes}
                                  onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '0.3rem 0.5rem',
                                    fontSize: '0.75rem',
                                    borderRadius: '4px',
                                    border: '1px solid #fdba74',
                                    outline: 'none',
                                    backgroundColor: '#ffffff',
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Approved / Read-only View */
                          <div
                            style={{
                              marginTop: 'auto',
                              padding: '0.65rem 0.75rem',
                              backgroundColor: item.verified_quantity_pcs !== null && item.verified_quantity_pcs !== item.quantity_pcs
                                ? 'rgba(231, 97, 20, 0.08)'
                                : 'var(--bg-main, #f8fafc)',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color, #e2e8f0)',
                              fontSize: '0.8rem',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Fisik Terverifikasi:</span>
                              <strong style={{ color: 'var(--primary-color, #008d51)', fontWeight: 800 }}>
                                {item.verified_quantity_pcs !== null && item.verified_quantity_pcs !== undefined
                                  ? `${item.verified_quantity_pcs} pcs (${Number(item.verified_weight_kg || 0).toFixed(2)} kg)`
                                  : `${item.quantity_pcs} pcs (${Number(item.weight_kg || 0).toFixed(2)} kg)`}
                              </strong>
                            </div>
                            {item.adjustment_notes && (
                              <div style={{ fontSize: '0.725rem', color: '#c2410c', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                Catatan: {item.adjustment_notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. TABLE VIEW WITH COMPARISON AND INLINE INPUT */}
            {viewMode === 'table' && (
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: 'var(--radius-lg, 12px)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
                      <th style={{ padding: '0.75rem 1rem', width: '80px', textAlign: 'center' }}>Foto</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Part / Material</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Pengajuan Pengirim</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: isPendingMode ? '220px' : 'auto' }}>
                        {isPendingMode ? 'Verifikasi Fisik Aktual' : 'Hasil Verifikasi Operator'}
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Berat Terverifikasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.items && request.items.map((item) => {
                      const adj = itemAdjustments[item.id] || {
                        verifiedQty: item.verified_quantity_pcs ?? item.quantity_pcs,
                        verifiedWeight: item.verified_weight_kg ?? Number(item.weight_kg || 0),
                        adjustmentNotes: item.adjustment_notes || '',
                      };
                      const beratGr = Number(item.berat_part_gr_snapshot) || 0;
                      const isPart = item.item_type === 'part_ng';

                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                          <td style={{ padding: '0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                            {isPart && item.image_url ? (
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(item)}
                                style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', padding: 0, backgroundColor: '#ffffff', cursor: 'pointer' }}
                              >
                                <img src={item.image_url} alt="Part" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              </button>
                            ) : (
                              <div style={{ width: '56px', height: '56px', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                <Package size={20} />
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                              {item.part_name_snapshot || item.material_name_snapshot}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                              {item.part_number_snapshot && <code>{item.part_number_snapshot}</code>}
                              {item.model_snapshot && <span> ({item.model_snapshot})</span>}
                            </div>
                            {item.notes && <div style={{ fontSize: '0.725rem', color: '#64748b', fontStyle: 'italic' }}>{item.notes}</div>}
                          </td>

                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#64748b' }}>
                            <div><strong>{item.quantity_pcs > 0 ? `${item.quantity_pcs} pcs` : '-'}</strong></div>
                            <div style={{ fontSize: '0.75rem' }}>{Number(item.weight_kg || 0).toFixed(2)} kg</div>
                          </td>

                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            {isPendingMode ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'center' }}>
                                {isPart ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleStepQty(item.id, beratGr, -1)}
                                      style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min={0}
                                      value={adj.verifiedQty}
                                      onChange={(e) => handleUpdateQtyDirect(item.id, beratGr, parseInt(e.target.value, 10))}
                                      style={{ width: '60px', height: '28px', textAlign: 'center', fontWeight: 800 }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleStepQty(item.id, beratGr, 1)}
                                      style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={adj.verifiedWeight}
                                    onChange={(e) => handleUpdateWeightDirect(item.id, parseFloat(e.target.value))}
                                    style={{ width: '80px', height: '28px', textAlign: 'center', fontWeight: 800 }}
                                  />
                                )}
                                {adj.verifiedQty !== item.quantity_pcs && (
                                  <input
                                    type="text"
                                    placeholder="Catatan selisih..."
                                    value={adj.adjustmentNotes}
                                    onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid #fdba74' }}
                                  />
                                )}
                              </div>
                            ) : (
                              <div>
                                <strong style={{ color: 'var(--primary-color, #008d51)' }}>
                                  {item.verified_quantity_pcs !== null && item.verified_quantity_pcs !== undefined ? `${item.verified_quantity_pcs} pcs` : `${item.quantity_pcs} pcs`}
                                </strong>
                                {item.adjustment_notes && (
                                  <div style={{ fontSize: '0.725rem', color: '#c2410c' }}>{item.adjustment_notes}</div>
                                )}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                            {Number(adj.verifiedWeight || 0).toFixed(2)} kg
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total Summary Footer Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.15rem 1.5rem',
                backgroundColor: 'rgba(231, 97, 20, 0.06)',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1.5px solid rgba(231, 97, 20, 0.25)',
                marginTop: '0.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)', fontSize: '0.95rem' }}>
                  {isPendingMode ? 'Ringkasan Verifikasi Fisik Akhir :' : 'Total Akumulasi Terverifikasi :'}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted, #64748b)', marginTop: '0.15rem' }}>
                  <span>{isPendingMode ? totalVerifiedPcs : request.total_pcs} Pcs Part | </span>
                  <span>{request.items?.length || 0} Item Terdaftar</span>
                  {hasDiscrepancies && (
                    <span style={{ color: '#c2410c', fontWeight: 700, marginLeft: '0.5rem' }}>
                      (Semula Pengajuan: {request.submitted_total_pcs || request.total_pcs} pcs)
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Scale size={24} color="var(--secondary-color, #e76114)" />
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                  {isPendingMode ? totalVerifiedWeight : Number(request.total_weight_kg || 0).toFixed(2)}{' '}
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>kg</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* FULLSCREEN LIGHTBOX IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              marginBottom: '1rem',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>
                {previewImage.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                {previewImage.partNumber && (
                  <span>Part No: <code style={{ color: '#38bdf8', fontWeight: 700 }}>{previewImage.partNumber}</code></span>
                )}
                {previewImage.model && <span>• Model: <strong style={{ color: '#facc15' }}>{previewImage.model}</strong></span>}
                {previewImage.qtyPcs ? <span>• Qty: <strong>{previewImage.qtyPcs} pcs</strong></span> : null}
                {previewImage.weightKg ? <span>• Berat: <strong style={{ color: '#fb923c' }}>{previewImage.weightKg} kg</strong></span> : null}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Button variant="secondary" size="sm" onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5))}>
                Zoom +
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75))}>
                Zoom -
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(1)}>
                Reset
              </Button>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  marginLeft: '0.5rem',
                }}
                title="Tutup (ESC)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              padding: '1rem',
            }}
            onClick={() => setPreviewImage(null)}
          >
            <img
              src={previewImage.url}
              alt={previewImage.title}
              style={{
                maxWidth: '92vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75)',
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.2s ease',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: '#0f172a',
              }}
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/no-images.jpg';
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
