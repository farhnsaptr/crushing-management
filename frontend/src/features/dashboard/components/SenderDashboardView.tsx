import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { SenderDashboardStats } from '../types/dashboard.types';
import type { UserProfile } from '../../../context/AuthContext';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { SenderDailyChart } from './SenderDailyChart';
import {
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Scale,
  Package,
  PlusCircle,
  Layers,
} from 'lucide-react';

interface SenderDashboardViewProps {
  user: UserProfile | null;
  stats: SenderDashboardStats | null;
  isLoading: boolean;
  selectedMonth: number;
  selectedYear: number;
  monthOptions: { value: number; label: string }[];
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export const SenderDashboardView: React.FC<SenderDashboardViewProps> = ({
  user,
  stats,
  isLoading,
  selectedMonth,
  selectedYear,
  monthOptions,
  onMonthChange,
  onYearChange,
}) => {
  const navigate = useNavigate();

  const currentMonthLabel = monthOptions.find((m) => m.value === selectedMonth)?.label || 'Bulan Ini';

  const formattedTodayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success" size="sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={12} />
              <span>Disetujui</span>
            </div>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="danger" size="sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <XCircle size={12} />
              <span>Ditolak</span>
            </div>
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="warning" size="sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} />
              <span>Menunggu</span>
            </div>
          </Badge>
        );
    }
  };

  const departmentTitle = stats?.department_name || user?.department_name || 'Departemen Pengirim';
  const factoryTitle = stats?.factory_name || user?.factory_name || 'Semua Pabrik';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', minHeight: 'calc(100vh - 85px)' }}>
      {/* CSS Styles for responsive tables grid matching operator dashboard */}
      <style>{`
        .sender-header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          background-color: var(--card-bg, #ffffff);
          padding: 0.75rem 1.15rem;
          border-radius: 16px;
          border: 1px solid var(--border-color, #e2e8f0);
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .sender-title {
          font-size: 1.3rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: var(--text-main, #0f172a);
          margin: 0;
          text-transform: uppercase;
        }
        .sender-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          background-color: var(--card-bg, #ffffff);
          padding: 0.55rem 1rem;
          border-radius: 14px;
          border: 1px solid var(--border-color, #e2e8f0);
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .sender-tables-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          align-items: start;
        }
        @media (max-width: 960px) {
          .sender-tables-grid {
            grid-template-columns: 1fr !important;
          }
          .sender-header-container {
            padding: 0.75rem 1rem !important;
          }
          .sender-title {
            font-size: 1.15rem !important;
          }
        }
      `}</style>

      {/* 1. Header Banner */}
      <div className="sender-header-container">
        <div>
          <h1 className="sender-title">
            DASHBOARD {departmentTitle} — {factoryTitle}
          </h1>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted, #64748b)', margin: '0.15rem 0 0 0', fontWeight: 600 }}>
            Akumulasi & Monitoring Pengiriman Part NG Reject Departemen ke Area Crushing
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
            {formattedTodayDate}
          </div>
          <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--secondary-color, #e76114)', marginTop: '0.1rem' }}>
            {user?.full_name} (@{user?.username})
          </div>
        </div>
      </div>

      {/* 2. Controls Bar: Month / Year Filter & Action Button */}
      <div className="sender-controls-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Month Select */}
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: '#f8fafc',
              color: 'var(--text-main, #0f172a)',
              fontSize: '0.825rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Year Select */}
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: '#f8fafc',
              color: 'var(--text-main, #0f172a)',
              fontSize: '0.825rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
            Periode: <strong>{currentMonthLabel} {selectedYear}</strong>
          </span>
        </div>

        <div>
          {/* Action Button: Send New Part NG */}
          <button
            onClick={() => navigate('/requests')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1.15rem',
              borderRadius: '14px',
              border: '1.5px solid var(--secondary-color, #e76114)',
              backgroundColor: 'var(--secondary-color, #e76114)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.825rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(231, 97, 20, 0.2)',
              transition: 'all 0.2s ease',
            }}
          >
            <PlusCircle size={16} />
            <span>Kirim Part NG Baru</span>
          </button>
        </div>
      </div>

      {/* 3. Executive KPI Metric Cards (Department-Scoped) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
        {/* Card 1: Total Part Weight */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 141, 81, 0.1)',
                color: '#008d51',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Scale size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Part Terkirim Departemen
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#008d51', marginTop: '0.1rem' }}>
                {isLoading ? '...' : `${Number(stats?.total_submitted_weight_kg ?? stats?.approved_weight_kg ?? 0).toFixed(2)} kg`}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                {Number(stats?.approved_weight_kg || 0).toFixed(2)} kg telah disetujui crushing
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Total Pcs Part NG */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Package size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Kuantitas Part NG
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#2563eb', marginTop: '0.1rem' }}>
                {isLoading ? '...' : `${Number(stats?.total_pcs ?? stats?.approved_pcs ?? 0).toLocaleString('id-ID')} pcs`}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                {Number(stats?.approved_pcs || 0).toLocaleString('id-ID')} pcs telah disetujui
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Total Tickets Summary */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(231, 97, 20, 0.1)',
                color: 'var(--secondary-color, #e76114)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Send size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Pengajuan Tiket
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', marginTop: '0.1rem' }}>
                {isLoading ? '...' : `${Number(stats?.total_requests || 0)} Tiket`}
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#008d51', backgroundColor: 'rgba(0, 141, 81, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                  {stats?.approved_count || 0} Disetujui
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                  {stats?.pending_count || 0} Menunggu
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Daily Trend Chart for Department Part NG */}
      <SenderDailyChart
        data={stats?.daily_chart || []}
        isLoading={isLoading}
        departmentName={departmentTitle}
        monthLabel={currentMonthLabel}
        year={selectedYear}
      />

      {/* 5. Two-Column Grid: Top Part NG & Material Summary */}
      <div className="sender-tables-grid">
        {/* Left Column: Top Part NG Terkirim */}
        <Card
          title={`Ranking Part NG Terkirim (${stats?.top_parts?.length || 0} Part)`}
          subtitle={`Daftar part reject tertinggi yang dikirim ${departmentTitle} pada ${currentMonthLabel} ${selectedYear}`}
        >
          {(!stats?.top_parts || stats.top_parts.length === 0) ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '0.825rem' }}>
              Belum ada data pengiriman part yang disetujui pada periode ini.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
                    <th style={{ padding: '0.5rem 0.65rem', width: '40px', textAlign: 'center' }}>No</th>
                    <th style={{ padding: '0.5rem 0.65rem' }}>Part Name & Model</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'right' }}>Berat (kg)</th>
                    <th style={{ padding: '0.5rem 0.65rem', width: '110px' }}>Kontribusi</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_parts.map((part) => (
                    <tr key={part.no} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                      <td style={{ padding: '0.55rem 0.65rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-muted, #64748b)' }}>
                        #{part.no}
                      </td>
                      <td style={{ padding: '0.55rem 0.65rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                          {part.part_name}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748b)' }}>
                          {part.part_number} • {part.model}
                        </div>
                      </td>
                      <td style={{ padding: '0.55rem 0.65rem', textAlign: 'right', fontWeight: 700 }}>
                        {part.total_pcs.toLocaleString('id-ID')} pcs
                      </td>
                      <td style={{ padding: '0.55rem 0.65rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                        {part.total_kg.toFixed(2)} kg
                      </td>
                      <td style={{ padding: '0.55rem 0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, Math.max(0, part.percentage))}%`,
                                height: '100%',
                                backgroundColor: 'var(--secondary-color, #e76114)',
                                borderRadius: '4px',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--text-muted, #475569)', width: '38px', textAlign: 'right' }}>
                            {part.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Right Column: Akumulasi Jenis Material Terkirim */}
        <Card
          title={`Akumulasi Jenis Material (${stats?.top_materials?.length || 0} Material)`}
          subtitle={`Rekapitulasi berat per jenis resin plastik dari seluruh part yang dikirim pada ${currentMonthLabel} ${selectedYear}`}
        >
          {(!stats?.top_materials || stats.top_materials.length === 0) ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '0.825rem' }}>
              Belum ada data material pada periode ini.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
                    <th style={{ padding: '0.5rem 0.65rem', width: '40px', textAlign: 'center' }}>No</th>
                    <th style={{ padding: '0.5rem 0.65rem' }}>Jenis Material</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '0.5rem 0.65rem', textAlign: 'right' }}>Berat (kg)</th>
                    <th style={{ padding: '0.5rem 0.65rem', width: '110px' }}>Kontribusi</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_materials.map((mat) => (
                    <tr key={mat.no} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                      <td style={{ padding: '0.55rem 0.65rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-muted, #64748b)' }}>
                        #{mat.no}
                      </td>
                      <td style={{ padding: '0.55rem 0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                          <Layers size={14} color="var(--primary-color, #008d51)" />
                          <span>{mat.material}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.55rem 0.65rem', textAlign: 'right', fontWeight: 700 }}>
                        {mat.total_pcs.toLocaleString('id-ID')} pcs
                      </td>
                      <td style={{ padding: '0.55rem 0.65rem', textAlign: 'right', fontWeight: 900, color: 'var(--primary-color, #008d51)' }}>
                        {mat.total_kg.toFixed(2)} kg
                      </td>
                      <td style={{ padding: '0.55rem 0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, Math.max(0, mat.percentage))}%`,
                                height: '100%',
                                backgroundColor: 'var(--primary-color, #008d51)',
                                borderRadius: '4px',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--text-muted, #475569)', width: '38px', textAlign: 'right' }}>
                            {mat.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* 6. Recent Department Submissions Table */}
      <Card
        title={`Pengajuan Tiket Terkini ${departmentTitle}`}
        subtitle="5 permohonan pengiriman reject terakhir yang diajukan oleh seluruh pengguna dalam departemen ini"
      >
        {(!stats?.recent_requests || stats.recent_requests.length === 0) ? (
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '0.85rem' }}>
            Belum ada tiket pengajuan yang dibuat dari departemen ini.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)', borderBottom: '1px solid var(--border-color, #cbd5e1)' }}>
                  <th style={{ padding: '0.65rem 0.85rem' }}>No. Tiket</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Pengirim</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Tanggal & Shift</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Total (Pcs)</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Total Berat</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_requests.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                      <code>{r.request_number}</code>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                        {r.sender_name || 'Pengirim'}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748b)' }}>
                        @{r.sender_username || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ fontWeight: 700 }}>{r.request_date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Shift {r.shift}</div>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700 }}>
                      {r.total_pcs > 0 ? `${r.total_pcs} pcs` : '-'}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                      {Number(r.total_weight_kg || 0).toFixed(2)} kg
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                      {getStatusBadge(r.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
