import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Search } from 'lucide-react';
import type { BudomariBreakdown, BudomariDailyItem, BudomariPartDetail } from '../types/dashboard.types';

interface BudomariDetailModalProps {
 isOpen: boolean;
 onClose: () => void;
 data: BudomariDailyItem[];
 monthlyBreakdown: BudomariBreakdown | null;
 partDetails?: BudomariPartDetail[];
 monthLabel: string;
 month: number;
 year: number;
}

const SERIES = [
 { key: 'ok_use_pct', name: 'OK Use', color: '#059669' },
 { key: 'ng_loss_pct', name: 'NG Loss', color: '#dc2626' },
 { key: 'runner_pct', name: 'Runner', color: '#2563eb' },
 { key: 'dango_pct', name: 'Dango', color: '#d97706' },
 { key: 'dango_part_pct', name: 'Dango Part', color: '#7c3aed' },
] as const;

const PAGE_SIZE = 10;

export const BudomariDetailModal: React.FC<BudomariDetailModalProps> = ({
 isOpen,
 onClose,
 data,
 monthlyBreakdown,
 partDetails = [],
 monthLabel,
 month,
 year,
}) => {
 const [search, setSearch] = useState('');
 const [dateFilter, setDateFilter] = useState('');
 const [page, setPage] = useState(1);

 const rows = data.filter((d) => d.ok_use_pct != null);
 const monthStr = String(month).padStart(2, '0');
 const lastDay = new Date(year, month, 0).getDate();
 const minDate = `${year}-${monthStr}-01`;
 const maxDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
 const searchTerm = search.trim().toLowerCase();

 const filteredParts = partDetails.filter((part) => {
 const partDate = `${year}-${monthStr}-${part.day}`;
 if (dateFilter && partDate !== dateFilter) return false;
 if (!searchTerm) return true;
 return [part.sebango_code, part.part_number, part.part_name, part.shift]
 .some((value) => String(value).toLowerCase().includes(searchTerm));
 });

 const totalPages = Math.max(1, Math.ceil(filteredParts.length / PAGE_SIZE));
 const safePage = Math.min(page, totalPages);
 const pageRows = filteredParts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

 const updateSearch = (value: string) => {
 setSearch(value);
 setPage(1);
 };

 const updateDateFilter = (value: string) => {
 setDateFilter(value);
 setPage(1);
 };

 return (
 <Modal isOpen={isOpen} onClose={onClose} title={`Detail KPI Budomari — ${monthLabel} ${year}`} size="xl">
 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
 <div>
 <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem' }}>
 Rata-rata Bulanan
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
 {SERIES.map((series) => (
 <div
 key={series.key}
 style={{
 padding: '0.6rem 0.75rem',
 borderRadius: '10px',
 border: '1px solid #e2e8f0',
 backgroundColor: '#f8fafc',
 }}
 >
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
 <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: series.color }} />
 {series.name}
 </div>
 <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginTop: '0.15rem' }}>
 {monthlyBreakdown ? `${Number(monthlyBreakdown[series.key]).toFixed(2)}%` : '-'}
 </div>
 </div>
 ))}
 </div>
 </div>

 <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
 Data Harian ({rows.length} hari)
 </div>

 {rows.length === 0 ? (
 <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
 Belum ada data Budomari untuk periode ini.
 </div>
 ) : (
 <div style={{ overflowX: 'auto', maxHeight: '40vh', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
 <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9' }}>
 <tr>
 <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#475569' }}>Tanggal</th>
 {SERIES.map((series) => (
 <th key={series.key} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#475569' }}>
 {series.name}
 </th>
 ))}
 <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#475569' }}>Part</th>
 </tr>
 </thead>
 <tbody>
 {rows.map((row) => (
 <tr key={row.day} style={{ borderTop: '1px solid #e2e8f0' }}>
 <td style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: '#0f172a' }}>
 {row.day} {monthLabel} {year}
 </td>
 {SERIES.map((series) => (
 <td key={series.key} style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: series.color }}>
 {Number(row[series.key] ?? 0).toFixed(2)}%
 </td>
 ))}
 <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>
 {row.total_parts}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
 <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
 Detail Part ({filteredParts.length})
 </div>
 <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
 <div style={{ position: 'relative' }}>
 <Search size={14} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
 <input
 type="text"
 value={search}
 onChange={(e) => updateSearch(e.target.value)}
 placeholder="Cari part / sebango..."
 style={{ padding: '0.4rem 0.6rem 0.4rem 1.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.75rem', minWidth: '180px' }}
 />
 </div>
 <input
 type="date"
 value={dateFilter}
 min={minDate}
 max={maxDate}
 onChange={(e) => updateDateFilter(e.target.value)}
 style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
 />
 {(search || dateFilter) && (
 <button
 type="button"
 onClick={() => {
 updateSearch('');
 updateDateFilter('');
 }}
 style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-color, #e76114)', cursor: 'pointer', textDecoration: 'underline' }}
 >
 Reset
 </button>
 )}
 </div>
 </div>

 {partDetails.length === 0 ? (
 <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>
 Belum ada detail part untuk periode ini.
 </div>
 ) : filteredParts.length === 0 ? (
 <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>
 Tidak ada part yang cocok dengan filter.
 </div>
 ) : (
 <>
 <div style={{ overflowX: 'auto', maxHeight: '40vh', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
 <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9' }}>
 <tr>
 <th style={{ padding: '0.55rem 0.65rem', textAlign: 'left', color: '#475569' }}>Tanggal</th>
 <th style={{ padding: '0.55rem 0.65rem', textAlign: 'left', color: '#475569' }}>Shift</th>
 <th style={{ padding: '0.55rem 0.65rem', textAlign: 'left', color: '#475569' }}>Sebango</th>
 <th style={{ padding: '0.55rem 0.65rem', textAlign: 'left', color: '#475569' }}>Part Number</th>
 <th style={{ padding: '0.55rem 0.65rem', textAlign: 'left', color: '#475569' }}>Part Name</th>
 <th style={{ padding: '0.55rem 0.65rem', textAlign: 'right', color: '#475569' }}>Pcs</th>
 {SERIES.map((series) => (
 <th key={series.key} style={{ padding: '0.55rem 0.65rem', textAlign: 'right', color: '#475569' }}>
 {series.name}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {pageRows.map((part, index) => (
 <tr key={`${part.day}-${part.shift}-${part.sebango_code}-${index}`} style={{ borderTop: '1px solid #e2e8f0' }}>
 <td style={{ padding: '0.5rem 0.65rem', fontWeight: 800, color: '#0f172a' }}>
 {part.day} {monthLabel} {year}
 </td>
 <td style={{ padding: '0.5rem 0.65rem', color: '#475569' }}>{part.shift}</td>
 <td style={{ padding: '0.5rem 0.65rem', fontWeight: 700, color: '#0f172a' }}>{part.sebango_code}</td>
 <td style={{ padding: '0.5rem 0.65rem', color: '#475569' }}>{part.part_number}</td>
 <td style={{ padding: '0.5rem 0.65rem', fontWeight: 700, color: 'var(--primary-color, #008d51)' }}>{part.part_name}</td>
 <td style={{ padding: '0.5rem 0.65rem', textAlign: 'right', fontWeight: 700, color: '#475569' }}>{part.total_pcs.toLocaleString('id-ID')}</td>
 {SERIES.map((series) => (
 <td key={series.key} style={{ padding: '0.5rem 0.65rem', textAlign: 'right', fontWeight: 700, color: series.color }}>
 {Number(part[series.key] ?? 0).toFixed(2)}%
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.75rem', color: '#475569', fontWeight: 700 }}>
 <span>
 Halaman {safePage} dari {totalPages}
 </span>
 <div style={{ display: 'flex', gap: '0.4rem' }}>
 <button
 type="button"
 disabled={safePage <= 1}
 onClick={() => setPage(safePage - 1)}
 style={{ padding: '0.3rem 0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: safePage <= 1 ? '#f8fafc' : '#ffffff', color: safePage <= 1 ? '#94a3b8' : '#334155', cursor: safePage <= 1 ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
 >
 Sebelumnya
 </button>
 <button
 type="button"
 disabled={safePage >= totalPages}
 onClick={() => setPage(safePage + 1)}
 style={{ padding: '0.3rem 0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: safePage >= totalPages ? '#f8fafc' : '#ffffff', color: safePage >= totalPages ? '#94a3b8' : '#334155', cursor: safePage >= totalPages ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
 >
 Selanjutnya
 </button>
 </div>
 </div>
 </>
 )}
 </div>
 </Modal>
 );
};
