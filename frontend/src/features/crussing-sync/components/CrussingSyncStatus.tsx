import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import type { CrussingSyncStatus as CrussingSyncStatusData } from '../types/crussingSync.types';
import { UnmatchedSebangoModal } from './UnmatchedSebangoModal';

interface CrussingSyncStatusProps {
 status: CrussingSyncStatusData | null;
 isLoading?: boolean;
 isSyncing?: boolean;
 error?: string | null;
}

function formatDateTime(value?: string | null): string {
 if (!value) return '-';
 const date = new Date(String(value).replace(' ', 'T'));
 if (Number.isNaN(date.getTime())) return String(value);
 return date.toLocaleString('id-ID', {
 day: '2-digit',
 month: 'short',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 });
}

export const CrussingSyncStatus: React.FC<CrussingSyncStatusProps> = ({
 status,
 isLoading,
 isSyncing,
 error,
}) => {
 const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
 if (isLoading && !status) {
 return (
 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
 Memuat status sinkronisasi...
 </span>
 );
 }

 if (error && !status) {
 return (
 <span
 style={{
 display: 'inline-flex',
 alignItems: 'center',
 gap: '0.35rem',
 fontSize: '0.75rem',
 color: '#b91c1c',
 fontWeight: 700,
 }}
 title={error}
 >
 <AlertCircle size={14} />
 {error}
 </span>
 );
 }

 if (!status) return null;

 if (!status.mapped) {
 return (
 <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>
 <AlertTriangle size={14} />
 Lokasi {status.location} belum dipetakan ke Crusing API
 </span>
 );
 }

 const manualOverlap = status.manual_overlap.analytics_rows + status.manual_overlap.runner_rows;

 return (
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
 {isSyncing ? (
 <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#0369a1', fontWeight: 700 }}>
 <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
 Menarik data Crusing API...
 </span>
 ) : status.last_success_at ? (
 <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#047857', fontWeight: 700 }}>
 <CheckCircle2 size={14} />
 Terakhir masuk: {formatDateTime(status.last_success_at)}
 </span>
 ) : (
 <span style={{ color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Belum pernah sinkron</span>
 )}

 {error && (
 <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#b91c1c', fontWeight: 700 }} title={error}>
 <AlertCircle size={13} />
 Sinkron gagal
 </span>
 )}

 {status.last_status === 'failed' && (
 <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#b91c1c', fontWeight: 700 }} title={status.last_error || ''}>
 <AlertCircle size={13} />
 Percobaan terakhir gagal
 </span>
 )}

 {status.unmatched_sebangos > 0 && (() => {
  let syncYear = new Date().getFullYear();
  let syncMonth: number | undefined = undefined;
  if (status.date_from) {
   const parts = status.date_from.split('-');
   if (parts.length >= 2) {
    syncYear = parseInt(parts[0], 10) || syncYear;
    syncMonth = parseInt(parts[1], 10) || undefined;
   }
  }

  return (
   <>
    <button
     type="button"
     onClick={() => setIsModalOpen(true)}
     title="Klik untuk melihat rincian kode SEBANGO yang tidak cocok"
     style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      color: '#b45309',
      fontWeight: 700,
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid rgba(245, 158, 11, 0.35)',
      borderRadius: '12px',
      padding: '0.15rem 0.55rem',
      cursor: 'pointer',
      fontSize: '0.75rem',
      transition: 'all 0.15s ease',
     }}
     onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
      e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.55)';
     }}
     onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
      e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.35)';
     }}
    >
     <AlertTriangle size={13} />
     <span>{status.unmatched_sebangos} SEBANGO tidak cocok</span>
     <span style={{ fontSize: '0.675rem', textDecoration: 'underline', color: '#92400e', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      (Lihat Detail)
      <ExternalLink size={10} />
     </span>
    </button>

    <UnmatchedSebangoModal
     isOpen={isModalOpen}
     onClose={() => setIsModalOpen(false)}
     location={status.location}
     year={syncYear}
     month={syncMonth}
     dateFrom={status.date_from}
     dateTo={status.date_to}
    />
   </>
  );
 })()}

 {manualOverlap > 0 && (
 <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#b45309', fontWeight: 700 }}>
 <AlertTriangle size={13} />
 {manualOverlap} data manual pada periode ini
 </span>
 )}
 </div>
 );
};
