import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { useIsNarrow } from '../../../hooks';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Layers,
  Cpu,
  Calendar,
} from 'lucide-react';
import type { ProductionAnalyticsItem } from '../types/analytics.types';

interface AnalyticsDataTableProps {
  canManage?: boolean;
  records: ProductionAnalyticsItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  search: string;
  setSearch: (search: string) => void;
  page: number;
  setPage: (page: number) => void;
  monthFilter: number | '';
  setMonthFilter: (m: number | '') => void;
  factory: string;
  setFactory: (f: string) => void;
  isLoading: boolean;
}

export const AnalyticsDataTable: React.FC<AnalyticsDataTableProps> = ({
  canManage = false,
  records,
  pagination,
  search,
  setSearch,
  page,
  setPage,
  monthFilter,
  setMonthFilter,
  factory,
  setFactory,
  isLoading,
}) => {
  const [containerRef, isNarrow] = useIsNarrow<HTMLDivElement>(768);

  const monthNames = [
    { value: '', label: 'Semua Bulan' },
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const startNumber = (pagination.page - 1) * pagination.limit + 1;

  return (
    <Card ref={containerRef} style={{ padding: isNarrow ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', alignItems: isNarrow ? 'flex-start' : 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div>
          <h3 style={{ fontSize: isNarrow ? '1rem' : '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="#008d51" /> Rincian Data Produksi & Allowance
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Daftar seluruh item produksi yang diunggah beserta perhitungan allowance per Sebango.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', width: isNarrow ? '100%' : 'auto' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: isNarrow ? '100%' : '220px' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari Sebango / Part / Mesin..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.8rem',
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', width: isNarrow ? '100%' : 'auto' }}>
            {/* Month Filter */}
            <select
              value={monthFilter}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                setMonthFilter(val);
                setPage(1);
              }}
              style={{
                flex: isNarrow ? 1 : 'none',
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#0f172a',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            >
              {monthNames.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Factory Filter */}
            <select
              value={factory}
              onChange={(e) => {
                setFactory(e.target.value);
                setPage(1);
              }}
              style={{
                flex: isNarrow ? 1 : 'none',
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#0f172a',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="all">Semua Pabrik</option>
              <option value="F2">Pabrik F2</option>
              <option value="F3">Pabrik F3</option>
              <option value="F4">Pabrik F4</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Records View */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Memuat rincian data analitik...
        </div>
      ) : records.length === 0 ? (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <Layers size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
          <p style={{ fontWeight: 700, margin: 0, color: '#475569' }}>
            {canManage ? 'Belum ada data laporan produksi yang diunggah.' : 'Belum ada data laporan produksi.'}
          </p>
          {canManage && (
            <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
              Silakan klik tombol "Upload Data Produksi" di atas untuk mengunggah file Excel / CSV.
            </p>
          )}
        </div>
      ) : isNarrow ? (
        /* Mobile Card View (< 768px) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {records.map((r, idx) => {
            const isMatched = !!r.master_part_id;

            return (
              <div
                key={r.id}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                {/* Card Header: Sebango & Factory */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>#{startNumber + idx}</span>
                    <strong style={{ fontSize: '1.05rem', fontWeight: 900, color: '#008d51' }}>
                      {r.sebango_code}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Badge variant="neutral" size="sm">
                      {r.factory_raw || '-'} {r.tonase_raw ? `(${r.tonase_raw})` : ''}
                    </Badge>
                  </div>
                </div>

                {/* Part Name & Machine */}
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                    {isMatched ? r.part_name_snapshot : 'Item Tanpa Master Part'}
                  </div>
                  {isMatched && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {r.part_number_snapshot}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                    <Cpu size={12} />
                    <span>Mesin {r.mesin_raw || '-'}</span>
                    <span>•</span>
                    <Calendar size={12} />
                    <span>{r.production_date} (Shift {r.shift})</span>
                  </div>
                </div>

                {/* Metrics 2x2 Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    backgroundColor: '#f8fafc',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.775rem',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Allowance:</span>
                    <strong style={{ color: r.allowance_kg > 0 ? '#008d51' : '#64748b', fontSize: '0.9rem' }}>
                      {Number(r.allowance_kg).toFixed(3)} kg
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Berat Part:</span>
                    <strong>{r.berat_part_gr_snapshot > 0 ? `${Number(r.berat_part_gr_snapshot).toFixed(0)} gr` : '-'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Output Produksi:</span>
                    <strong>Total {r.act_total_pcs} pcs</strong>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      OK: {r.act_ok_pcs} | NG: <span style={{ color: r.ng_total_pcs > 0 ? '#ef4444' : '#64748b' }}>{r.ng_total_pcs}</span>
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Shikake:</span>
                    <Badge variant="secondary" size="sm">
                      {r.calculated_shikake} Run
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop Table View (>= 768px) */
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 0.85rem', width: '50px' }}>No</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Tanggal & Shift</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Pabrik / Mesin</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Kode Sebango</th>
                <th style={{ padding: '0.75rem 0.85rem' }}>Nama Part</th>
                <th style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>Shikake</th>
                <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>Berat Part</th>
                <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>Allowance (kg)</th>
                <th style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>Output Produksi</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => {
                const isMatched = !!r.master_part_id;

                return (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '0.75rem 0.85rem', color: '#64748b' }}>
                      {startNumber + idx}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{r.production_date}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>Shift {r.shift}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {r.factory_raw || '-'} {r.tonase_raw ? `(${r.tonase_raw})` : ''}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Cpu size={12} />
                        <span>Mesin {r.mesin_raw || '-'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem' }}>
                      <div style={{ fontWeight: 900, color: '#008d51' }}>{r.sebango_code}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem' }}>
                      {isMatched ? (
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>
                            {r.part_name_snapshot}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                            {r.part_number_snapshot}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Badge variant="neutral" size="sm">
                            Tidak di Master Part
                          </Badge>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                      <Badge variant="secondary" size="sm">
                        {r.calculated_shikake} Run
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 700 }}>
                      {r.berat_part_gr_snapshot > 0 ? `${Number(r.berat_part_gr_snapshot).toFixed(0)} gr` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 900, color: r.allowance_kg > 0 ? '#008d51' : '#64748b' }}>
                      {r.allowance_kg > 0 ? `${Number(r.allowance_kg).toFixed(3)} kg` : '0.000 kg'}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        Total: <strong>{r.act_total_pcs}</strong> pcs
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                        OK: {r.act_ok_pcs} | NG: <span style={{ color: r.ng_total_pcs > 0 ? '#ef4444' : '#64748b', fontWeight: 700 }}>{r.ng_total_pcs}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Menampilkan <strong>{records.length}</strong> dari <strong>{pagination.total}</strong> total data
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: isNarrow ? '100%' : 'auto', justifyContent: isNarrow ? 'space-between' : 'flex-end' }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              leftIcon={<ChevronLeft size={14} />}
            >
              Prev
            </Button>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', padding: '0 0.5rem' }}>
              {page} / {pagination.totalPages}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page >= pagination.totalPages}
              rightIcon={<ChevronRight size={14} />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
