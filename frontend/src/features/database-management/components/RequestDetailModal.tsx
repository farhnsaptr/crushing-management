import React from 'react';
import {
  X,
  Edit2,
  Plus,
  Trash2,
  Undo2,
  Calendar,
  Clock,
  Building2,
  User,
  Package,
  Layers,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import type {
  DatabaseRequestDetailResponse,
  DatabaseRequestItem,
  DatabaseRequestHeader,
} from '../types/databaseManagement.types';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: DatabaseRequestDetailResponse | null;
  isLoading: boolean;
  onOpenEditHeader: () => void;
  onOpenAddPart: () => void;
  onOpenEditItem: (item: DatabaseRequestItem) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenUnapprove: (request: DatabaseRequestHeader) => void;
  onOpenDeleteRequest: (request: DatabaseRequestHeader) => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  detail,
  isLoading,
  onOpenEditHeader,
  onOpenAddPart,
  onOpenEditItem,
  onDeleteItem,
  onOpenUnapprove,
  onOpenDeleteRequest,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1.5px solid #cbd5e1',
          overflow: 'hidden',
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Tiket: {detail?.request.request_number || 'Loading...'}
            </h2>
            {detail?.request && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: detail.request.status === 'approved' ? '#ecfdf5' : '#fffbeb',
                  color: detail.request.status === 'approved' ? '#059669' : '#d97706',
                  border: detail.request.status === 'approved' ? '1px solid #a7f3d0' : '1px solid #fde68a',
                }}
              >
                {detail.request.status === 'approved' ? 'Approved (Tervalidasi)' : 'Pending (Menunggu Verifikasi)'}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {detail?.request && (
              <>
                <button
                  type="button"
                  onClick={onOpenEditHeader}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Edit2 size={13} />
                  <span>Edit Info Tiket</span>
                </button>

                {detail.request.status === 'approved' && (
                  <button
                    type="button"
                    onClick={() => onOpenUnapprove(detail.request)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #fde68a',
                      backgroundColor: '#fffbeb',
                      color: '#d97706',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    <Undo2 size={13} />
                    <span>Hapus Approve</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenDeleteRequest(detail.request)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={13} />
                  <span>Hapus Tiket</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isLoading || !detail ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontWeight: 600 }}>
              Memuat detail tiket...
            </div>
          ) : (
            <>
              {/* Info Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Jadwal & Shift</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem', fontWeight: 800, color: '#0f172a' }}>
                    <Calendar size={14} color="#64748b" />
                    <span>{detail.request.request_date}</span>
                    <span>•</span>
                    <Clock size={14} color="#64748b" />
                    <span>Shift {detail.request.shift}</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Departemen & Pabrik</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem', fontWeight: 800, color: '#0f172a' }}>
                    <Building2 size={14} color="#64748b" />
                    <span>{detail.request.department_name}</span>
                    <span style={{ color: '#94a3b8' }}>({detail.request.factory_name})</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Pengirim & Validator</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem', fontWeight: 800, color: '#0f172a' }}>
                    <User size={14} color="#64748b" />
                    <span>{detail.request.sender_name || detail.request.sender_username}</span>
                    {detail.request.validator_name && (
                      <span style={{ color: '#059669', fontSize: '0.75rem' }}>✓ {detail.request.validator_name}</span>
                    )}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Total Fisik Tiket</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--secondary-color, #e76114)', fontWeight: 900 }}>
                      {Number(detail.request.total_weight_kg || 0).toFixed(2)} kg
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                      {detail.request.total_pcs || 0} pcs
                    </span>
                  </div>
                </div>
              </div>

              {/* Catatan tiket jika ada */}
              {detail.request.notes && (
                <div style={{ padding: '0.65rem 0.9rem', backgroundColor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', fontSize: '0.78rem', color: '#92400e' }}>
                  <strong>Catatan Tiket:</strong> {detail.request.notes}
                </div>
              )}

              {/* Items Section Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                    Rincian Part / Runner dalam Tiket ({detail.items.length} item)
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Anda dapat menambah part, mengurangi/menghapus part, atau mengoreksi kuantitas
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onOpenAddPart}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '8px',
                    border: '1px solid #d2530c',
                    backgroundColor: '#e76114',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(231, 97, 20, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#d2530c';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e76114';
                  }}
                >
                  <Plus size={15} color="#ffffff" strokeWidth={2.5} />
                  <span style={{ color: '#ffffff', fontWeight: 800 }}>+ Tambah Part ke Tiket</span>
                </button>
              </div>

              {/* Items Table */}
              <div
                style={{
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.65rem 0.75rem' }}>No</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Tipe</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Part Info / Material</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Input Pengirim</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Hasil Verifikasi</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Catatan</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.items.map((it, idx) => {
                      const isPartNg = it.item_type === 'part_ng';

                      return (
                        <tr
                          key={it.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                          }}
                        >
                          <td style={{ padding: '0.65rem 0.75rem', color: '#64748b', fontWeight: 700 }}>
                            {idx + 1}
                          </td>

                          <td style={{ padding: '0.65rem 0.75rem' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                backgroundColor: isPartNg ? '#eff6ff' : '#fdf4ff',
                                color: isPartNg ? '#2563eb' : '#9333ea',
                              }}
                            >
                              {isPartNg ? <Package size={11} /> : <Layers size={11} />}
                              <span>{isPartNg ? 'Part NG' : 'Runner'}</span>
                            </span>
                          </td>

                          <td style={{ padding: '0.65rem 0.75rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                              <strong style={{ color: '#0f172a' }}>
                                {isPartNg ? it.part_name_snapshot || 'Part Tanpa Nama' : it.material_name_snapshot || 'Runner Material'}
                              </strong>
                              {isPartNg && (
                                <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', gap: '0.4rem' }}>
                                  <span>No: <strong>{it.part_number_snapshot}</strong></span>
                                  {it.sebango_code && <span>Sebango: <strong>{it.sebango_code}</strong></span>}
                                  <span>Berat: <strong>{it.berat_part_gr_snapshot} gr</strong></span>
                                </div>
                              )}
                              <span style={{ fontSize: '0.7rem', color: '#475569' }}>
                                Material: {it.material_name_snapshot || '-'}
                              </span>
                            </div>
                          </td>

                          {/* Kuantitas Pengirim */}
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                            <strong style={{ color: '#0f172a' }}>{Number(it.weight_kg).toFixed(2)} kg</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{it.quantity_pcs} pcs</div>
                          </td>

                          {/* Kuantitas Verifikasi */}
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                            {it.verified_quantity_pcs != null || it.verified_weight_kg != null ? (
                              <div>
                                <strong style={{ color: '#059669' }}>
                                  {Number(it.verified_weight_kg ?? it.weight_kg).toFixed(2)} kg
                                </strong>
                                <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                                  {it.verified_quantity_pcs ?? it.quantity_pcs} pcs
                                  {it.waste_quantity_pcs > 0 && (
                                    <span style={{ color: '#dc2626', marginLeft: '0.2rem' }}>
                                      ({it.waste_quantity_pcs} waste)
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>- (Pending)</span>
                            )}
                          </td>

                          <td style={{ padding: '0.65rem 0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                            {it.adjustment_notes ? (
                              <span style={{ color: '#d97706', fontWeight: 600 }}>{it.adjustment_notes}</span>
                            ) : (
                              it.notes || '-'
                            )}
                          </td>

                          {/* Aksi Per Item */}
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                              <button
                                type="button"
                                onClick={() => onOpenEditItem(it)}
                                title="Edit kuantitas item"
                                style={{
                                  padding: '0.3rem 0.5rem',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: '#ffffff',
                                  color: '#334155',
                                  cursor: 'pointer',
                                }}
                              >
                                <Edit2 size={12} />
                              </button>

                              <button
                                type="button"
                                onClick={() => onDeleteItem(it.id)}
                                title="Hapus part ini dari tiket"
                                style={{
                                  padding: '0.3rem 0.5rem',
                                  borderRadius: '6px',
                                  border: '1px solid #fecaca',
                                  backgroundColor: '#fef2f2',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Linked Transactions Section */}
              <div style={{ marginTop: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>
                  Status Transaksi Database Terkait
                </h4>

                {detail.request.status === 'approved' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div
                      style={{
                        padding: '0.65rem 0.9rem',
                        borderRadius: '10px',
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#065f46' }}>
                        <CheckCircle size={15} />
                        <span>
                          <strong>{detail.linked_transactions.ng_transactions.length}</strong> transaksi Part NG &{' '}
                          <strong>{detail.linked_transactions.runner_transactions.length}</strong> transaksi Runner aktif
                          di database dashboard.
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>Tersinkronisasi</span>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '0.65rem 0.9rem',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.78rem',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <AlertTriangle size={14} color="#d97706" />
                    <span>Tiket berstatus Pending. Transaksi akan otomatis terbuat di database saat tiket disetujui (approved).</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
