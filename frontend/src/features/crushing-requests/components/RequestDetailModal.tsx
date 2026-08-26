import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import type { CrushingRequest } from '../types/crushingRequests.types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Network,
  User,
  Calendar,
  Layers,
  Scale,
  Check,
  X,
  AlertTriangle,
  Package,
  ZoomIn,
  Maximize2,
  LayoutGrid,
  List,
} from 'lucide-react';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CrushingRequest | null;
  isLoading: boolean;
  isOperatorOrAdmin?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (req: CrushingRequest) => void;
  isActionLoading?: boolean;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  isLoading,
  isOperatorOrAdmin,
  onApprove,
  onReject,
  isActionLoading,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
    partNumber?: string;
    model?: string;
    weightKg?: number;
    qtyPcs?: number;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!request && !isLoading) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success" size="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} />
              <span>Disetujui</span>
            </div>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="danger" size="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <XCircle size={13} />
              <span>Ditolak</span>
            </div>
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="warning" size="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={13} />
              <span>Menunggu Validasi</span>
            </div>
          </Badge>
        );
    }
  };

  const handleOpenPreview = (item: any) => {
    if (!item.image_url) return;
    setZoomLevel(1);
    setPreviewImage({
      url: item.image_url,
      title: item.part_name_snapshot || item.material_name_snapshot || 'Foto Part',
      partNumber: item.part_number_snapshot || undefined,
      model: item.model_snapshot || undefined,
      weightKg: Number(item.weight_kg || 0),
      qtyPcs: item.quantity_pcs,
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        title={`Rincian Tiket: ${request?.request_number || 'Loading...'}`}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Button variant="outline" onClick={onClose} disabled={isActionLoading}>
                Tutup
              </Button>
            </div>

            {isOperatorOrAdmin && request?.status === 'pending' && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button
                  variant="danger"
                  onClick={() => onReject && onReject(request)}
                  disabled={isActionLoading}
                  leftIcon={<X size={16} />}
                >
                  Tolak Tiket
                </Button>
                <Button
                  variant="primary"
                  onClick={() => onApprove && onApprove(request.id)}
                  isLoading={isActionLoading}
                  leftIcon={<Check size={16} />}
                >
                  Setujui & Validasi Tiket
                </Button>
              </div>
            )}
          </div>
        }
      >
        {isLoading || !request ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
            Memuat rincian tiket...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header Status & Rejection Banner if rejected */}
            {request.status === 'rejected' && (
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md, 8px)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  color: '#b91c1c',
                  fontSize: '0.875rem',
                }}
              >
                <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 800 }}>Tiket Permintaan Ditolak</div>
                  <div style={{ marginTop: '0.2rem' }}>
                    <strong>Alasan Penolakan:</strong> {request.rejection_reason || 'Tidak ada alasan khusus.'}
                  </div>
                </div>
              </div>
            )}

            {/* Ticket Metadata Banner Grid */}
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
                <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem', fontWeight: 600 }}>Status Tiket:</div>
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

            {/* Section Header with View Mode Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                  Rincian Item Permintaan ({request.items?.length || 0} Item)
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: '0.15rem 0 0 0' }}>
                  Periksa visual part dan cocokkan dengan fisik sebelum melakukan persetujuan.
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
                  <span>Detail</span>
                </button>
              </div>
            </div>

            {/* 1. VISUAL GRID VIEW (Large Prominent Part Photos) */}
            {viewMode === 'grid' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {request.items && request.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      border: '1.5px solid var(--border-color, #e2e8f0)',
                      borderRadius: 'var(--radius-lg, 12px)',
                      backgroundColor: 'var(--bg-card, #ffffff)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = 'var(--primary-color, #008d51)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                      e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
                    }}
                  >
                    {/* Big Image Header Box */}
                    <div
                      style={{
                        position: 'relative',
                        height: '180px',
                        backgroundColor: '#f8fafc',
                        borderBottom: '1px solid var(--border-color, #e2e8f0)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.item_type === 'part_ng' ? (
                        item.image_url ? (
                          <div
                            onClick={() => handleOpenPreview(item)}
                            style={{
                              width: '100%',
                              height: '100%',
                              cursor: 'pointer',
                              position: 'relative',
                            }}
                            title="Klik untuk memperbesar gambar part"
                          >
                            <img
                              src={item.image_url}
                              alt={item.part_name_snapshot || 'Part'}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                padding: '0.5rem',
                                transition: 'transform 0.2s ease',
                              }}
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
                                padding: '0.3rem 0.65rem',
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                backdropFilter: 'blur(4px)',
                              }}
                            >
                              <ZoomIn size={13} />
                              <span>Klik Perbesar</span>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              color: '#94a3b8',
                            }}
                          >
                            <Package size={48} style={{ opacity: 0.4 }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Foto Part Tidak Tersedia</span>
                          </div>
                        )
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            color: 'var(--secondary-color, #e76114)',
                          }}
                        >
                          <div
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(231, 97, 20, 0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Layers size={34} />
                          </div>
                          <span style={{ fontSize: '0.825rem', fontWeight: 800 }}>Runner Material</span>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                        <Badge variant={item.item_type === 'part_ng' ? 'primary' : 'warning'} size="sm">
                          {item.item_type === 'part_ng' ? 'Part NG' : 'Runner NG'}
                        </Badge>
                      </div>

                      {item.model_snapshot && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                          <span
                            style={{
                              backgroundColor: 'rgba(15, 23, 42, 0.8)',
                              color: '#ffffff',
                              borderRadius: '6px',
                              padding: '0.2rem 0.55rem',
                              fontSize: '0.725rem',
                              fontWeight: 800,
                            }}
                          >
                            {item.model_snapshot}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                      <div>
                        <h5
                          style={{
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: 'var(--text-main, #0f172a)',
                            margin: 0,
                            lineHeight: 1.35,
                          }}
                        >
                          {item.part_name_snapshot || item.material_name_snapshot || 'Material'}
                        </h5>

                        {item.part_number_snapshot && (
                          <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <code
                              style={{
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                fontSize: '0.775rem',
                                fontWeight: 700,
                                color: '#1e293b',
                              }}
                            >
                              {item.part_number_snapshot}
                            </code>
                          </div>
                        )}
                      </div>

                      {item.notes && (
                        <p
                          style={{
                            fontSize: '0.775rem',
                            color: 'var(--text-muted, #64748b)',
                            fontStyle: 'italic',
                            margin: 0,
                            backgroundColor: '#f8fafc',
                            padding: '0.35rem 0.5rem',
                            borderRadius: '6px',
                            borderLeft: '3px solid #cbd5e1',
                          }}
                        >
                          {item.notes}
                        </p>
                      )}

                      {/* Weight & Qty Metrics Box */}
                      <div
                        style={{
                          marginTop: 'auto',
                          padding: '0.75rem',
                          backgroundColor: 'var(--bg-main, #f8fafc)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color, #e2e8f0)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                            Jumlah Input
                          </div>
                          <div style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                            {item.quantity_pcs > 0 ? `${item.quantity_pcs} pcs` : '-'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                            Total Berat
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                            {Number(item.weight_kg || 0).toFixed(2)} kg
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. DETAILED TABLE VIEW (With 72px Photos) */}
            {viewMode === 'table' && (
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: 'var(--radius-lg, 12px)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
                      <th style={{ padding: '0.75rem 1rem', width: '90px', textAlign: 'center' }}>Foto Part</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Tipe</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Nama Part / Material</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Part Number & Model</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Jumlah (Pcs)</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Berat (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.items && request.items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                        {/* Generous 72px Thumbnail */}
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                          {item.item_type === 'part_ng' ? (
                            item.image_url ? (
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(item)}
                                style={{
                                  width: '72px',
                                  height: '72px',
                                  borderRadius: '10px',
                                  overflow: 'hidden',
                                  border: '1.5px solid #cbd5e1',
                                  padding: 0,
                                  backgroundColor: '#ffffff',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                                  position: 'relative',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.06)';
                                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
                                }}
                                title="Klik untuk memperbesar gambar part"
                              >
                                <img
                                  src={item.image_url}
                                  alt={item.part_name_snapshot || 'Part'}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/no-images.jpg';
                                  }}
                                />
                              </button>
                            ) : (
                              <div
                                style={{
                                  width: '72px',
                                  height: '72px',
                                  borderRadius: '10px',
                                  border: '1px dashed #cbd5e1',
                                  backgroundColor: '#f8fafc',
                                  display: 'inline-flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#94a3b8',
                                  gap: '3px',
                                  margin: '0 auto',
                                }}
                                title="Tidak ada foto part"
                              >
                                <Package size={22} style={{ opacity: 0.5 }} />
                                <span style={{ fontSize: '0.625rem', fontWeight: 600 }}>No Pic</span>
                              </div>
                            )
                          ) : (
                            <div
                              style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: '10px',
                                border: '1px solid rgba(231, 97, 20, 0.25)',
                                backgroundColor: 'rgba(231, 97, 20, 0.08)',
                                display: 'inline-flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--secondary-color, #e76114)',
                                gap: '3px',
                                margin: '0 auto',
                              }}
                              title="Runner Material"
                            >
                              <Layers size={22} />
                              <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>Runner</span>
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem 1rem' }}>
                          <Badge variant={item.item_type === 'part_ng' ? 'primary' : 'warning'} size="sm">
                            {item.item_type === 'part_ng' ? 'Part NG' : 'Runner NG'}
                          </Badge>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                          <div style={{ fontSize: '0.95rem' }}>{item.part_name_snapshot || item.material_name_snapshot || 'Material'}</div>
                          {item.notes && (
                            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic', marginTop: '0.2rem' }}>
                              {item.notes}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                          {item.part_number_snapshot ? (
                            <div>
                              <code>{item.part_number_snapshot}</code> {item.model_snapshot && <span>({item.model_snapshot})</span>}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                          {item.quantity_pcs > 0 ? `${item.quantity_pcs} pcs` : '-'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)', fontSize: '0.95rem' }}>
                          {Number(item.weight_kg || 0).toFixed(2)} kg
                        </td>
                      </tr>
                    ))}
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
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)', fontSize: '0.95rem' }}>
                  Total Akumulasi Pengiriman :
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted, #64748b)', marginTop: '0.15rem' }}>
                  {request.total_pcs > 0 && <span>{request.total_pcs} Pcs Part | </span>}
                  <span>{request.items?.length || 0} Item Terdaftar</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Scale size={24} color="var(--secondary-color, #e76114)" />
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                  {Number(request.total_weight_kg || 0).toFixed(2)} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>kg</span>
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
          {/* Lightbox Top Navigation Bar */}
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5))}
              >
                Zoom +
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75))}
              >
                Zoom -
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(1)}
              >
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
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                title="Tutup (ESC)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Viewport */}
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
