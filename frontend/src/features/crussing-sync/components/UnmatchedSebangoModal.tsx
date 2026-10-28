import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Spinner } from '../../../components/common/Spinner';
import { CrussingSyncService } from '../services/crussingSync.service';
import type { UnmatchedSebangosResponse } from '../types/crussingSync.types';
import {
  AlertTriangle,
  Search,
  Copy,
  Check,
  Layers,
  FileSpreadsheet,
  Package,
  Info,
} from 'lucide-react';

interface UnmatchedSebangoModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  year: number;
  month?: number;
  dateFrom?: string;
  dateTo?: string;
}

export const UnmatchedSebangoModal: React.FC<UnmatchedSebangoModalProps> = ({
  isOpen,
  onClose,
  location,
  year,
  month,
  dateFrom,
  dateTo,
}) => {
  const [data, setData] = useState<UnmatchedSebangosResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reasonFilter, setReasonFilter] = useState<'all' | 'missing' | 'ambiguous'>('all');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setData(null);
      setError(null);
      setSearchQuery('');
      setReasonFilter('all');
      setCopied(false);
      return;
    }

    let isMounted = true;
    const fetchUnmatched = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await CrussingSyncService.getUnmatchedSebangos({
          location,
          year,
          month,
        });
        if (isMounted) {
          setData(res);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load unmatched sebangos:', err);
          setError(err?.response?.data?.message || err?.message || 'Gagal memuat daftar Sebango tidak cocok.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUnmatched();

    return () => {
      isMounted = false;
    };
  }, [isOpen, location, year, month]);

  const items = data?.items || [];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (reasonFilter === 'missing' && !item.reason.toLowerCase().includes('tidak terdaftar')) {
        return false;
      }
      if (reasonFilter === 'ambiguous' && !item.reason.toLowerCase().includes('duplikat')) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        item.raw.toLowerCase().includes(q) ||
        (item.part_no && item.part_no.toLowerCase().includes(q)) ||
        (item.material_name && item.material_name.toLowerCase().includes(q))
      );
    });
  }, [items, searchQuery, reasonFilter]);

  const handleCopyCodes = () => {
    if (items.length === 0) return;
    const text = items.map((i) => i.code).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatDateRange = () => {
    const from = data?.date_from || dateFrom;
    const to = data?.date_to || dateTo;
    if (from && to) {
      return `${from} s/d ${to}`;
    }
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return month ? `${monthNames[month - 1]} ${year}` : `Tahun ${year}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail SEBANGO Tidak Cocok (Unmatched)"
      size="xl"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Scope Context Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontWeight: 800, color: '#0f172a' }}>Plant:</span>
            <Badge variant="primary">{location}</Badge>
            <span style={{ color: '#94a3b8' }}>•</span>
            <span style={{ fontWeight: 800, color: '#0f172a' }}>Periode:</span>
            <span style={{ fontWeight: 600, color: '#334155' }}>{formatDateRange()}</span>
          </div>

          {items.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyCodes}
              leftIcon={copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              style={{ fontSize: '0.775rem' }}
            >
              {copied ? 'Tersalin!' : 'Salin Semua Kode'}
            </Button>
          )}
        </div>

        {/* Informative Warning Banner */}
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            color: '#b45309',
            fontSize: '0.825rem',
            lineHeight: 1.45,
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '0.2rem', color: '#92400e' }}>
              Peringatan Data di-Skip
            </strong>
            Kode Sebango di bawah ini ditemukan pada data laporan produksi Crusing API, namun{' '}
            <strong>belum terdaftar atau ambigu</strong> di katalog Master Parts sistem. Seluruh baris data
            terkait <strong>otomatis di-skip</strong> dari kalkulasi Analitik dan Runner agar tidak menimbulkan selisih.
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div
            style={{
              padding: '3rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              color: '#64748b',
            }}
          >
            <Spinner size={48} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Mengambil rincian kode Sebango...
            </span>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '0.85rem',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Main Content Area */}
        {!isLoading && !error && (
          <>
            {/* Stat Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.85rem',
              }}
            >
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Layers size={14} color="#dc2626" />
                  Total Sebango Unmatched
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#dc2626', marginTop: '0.25rem' }}>
                  {data?.total_unmatched_codes ?? items.length}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginLeft: '0.35rem' }}>Kode</span>
                </div>
              </div>

              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                  <FileSpreadsheet size={14} color="#e76114" />
                  Baris Terlewat (Skipped)
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#e76114', marginTop: '0.25rem' }}>
                  {(data?.total_unmatched_rows ?? 0).toLocaleString('id-ID')}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginLeft: '0.35rem' }}>Baris</span>
                </div>
              </div>

              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Package size={14} color="#2563eb" />
                  Total Akumulasi Pcs
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563eb', marginTop: '0.25rem' }}>
                  {(data?.total_unmatched_pcs ?? 0).toLocaleString('id-ID')}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginLeft: '0.35rem' }}>Pcs</span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="text"
                  placeholder="Cari kode sebango, part no, atau material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.825rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select
                  value={reasonFilter}
                  onChange={(e) => setReasonFilter(e.target.value as any)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">Semua Alasan ({items.length})</option>
                  <option value="missing">Tidak Terdaftar</option>
                  <option value="ambiguous">Duplikat di Master</option>
                </select>
              </div>
            </div>

            {/* Unmatched Sebangos Table */}
            {filteredItems.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b',
                  fontSize: '0.875rem',
                }}
              >
                {searchQuery || reasonFilter !== 'all'
                  ? 'Tidak ada kode Sebango yang cocok dengan kata kunci pencarian.'
                  : 'Tidak ada data Sebango yang tidak cocok untuk periode ini.'}
              </div>
            ) : (
              <div
                style={{
                  maxHeight: '380px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead
                    style={{
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#f8fafc',
                      zIndex: 2,
                      borderBottom: '1.5px solid #cbd5e1',
                    }}
                  >
                    <tr>
                      <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: '#475569', width: '45px' }}>No</th>
                      <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: '#475569' }}>Kode Sebango</th>
                      <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: '#475569' }}>Teks Raw (File/API)</th>
                      <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: '#475569' }}>Part Number</th>
                      <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: '#475569' }}>Material</th>
                      <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Kemunculan</th>
                      <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Total Pcs</th>
                      <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: '#475569' }}>Status / Alasan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, idx) => {
                      const isMissing = item.reason.toLowerCase().includes('tidak terdaftar');
                      return (
                        <tr
                          key={`${item.code}-${idx}`}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '0.6rem 0.75rem', color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                          <td style={{ padding: '0.6rem 0.75rem' }}>
                            <code
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: isMissing ? '#fee2e2' : '#fef3c7',
                                color: isMissing ? '#b91c1c' : '#b45309',
                                fontWeight: 800,
                                fontSize: '0.775rem',
                              }}
                            >
                              {item.code}
                            </code>
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#475569', fontSize: '0.75rem' }}>
                            {item.raw && item.raw !== item.code ? (
                              <span style={{ color: '#0369a1', fontWeight: 600 }}>{item.raw}</span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#0f172a', fontWeight: 700 }}>
                            {item.part_no || '-'}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#475569' }}>
                            {item.material_name || '-'}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            {item.count} baris
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 800, color: '#2563eb' }}>
                            {item.total_pcs.toLocaleString('id-ID')}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                backgroundColor: isMissing ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                color: isMissing ? '#dc2626' : '#d97706',
                              }}
                            >
                              {item.reason}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Recommendation Footer Box */}
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: '#15803d',
                fontSize: '0.8rem',
              }}
            >
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Solusi:</strong> Daftarkan kode-kode Sebango di atas ke menu{' '}
                <strong>Master Parts</strong>. Setelah didaftarkan, lakukan sinkronisasi ulang (Tarik Data) agar data baris
                tersebut otomatis terhitung ke dalam Analitik dan Transaksi Runner.
              </span>
            </div>
          </>
        )}

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1rem',
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};
