import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequestEvaluation } from '../hooks/useRequestEvaluation';
import { SenderRequestsModal } from '../components/SenderRequestsModal';
import { RequestDetailModal } from '../components/RequestDetailModal';
import { SubmissionStatusChart } from '../components/SubmissionStatusChart';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Toast } from '../../../components/common/Toast';
import { Spinner } from '../../../components/common/Spinner';
import { formatIndonesianDate } from '../../../config/shift.config';
import { useIsNarrow } from '../../../hooks';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  AlertTriangle,
  Filter,
  RefreshCw,
  Building2,
  Activity,
} from 'lucide-react';

export const RequestEvaluationPage: React.FC = () => {
  const navigate = useNavigate();
  const [containerRef, isMobile] = useIsNarrow<HTMLDivElement>(768);

  const {
    date,
    setDate,
    shift,
    setShift,
    departmentId,
    setDepartmentId,
    factoryId,
    setFactoryId,
    searchQuery,
    setSearchQuery,
    departments,
    factories,
    evaluationData,
    isLoading,
    toast,
    setToast,
    fetchEvaluation,
    // Level 2
    selectedSender,
    isSenderModalOpen,
    senderRequests,
    isLoadingSenderRequests,
    handleOpenSenderModal,
    handleCloseSenderModal,
    // Heatmap
    senderHeatmap,
    isLoadingSenderHeatmap,
    heatmapMonths,
    handleMonthsChange,
    // Level 3
    selectedRequest,
    isDetailModalOpen,
    isLoadingDetail,
    handleOpenDetailModal,
    handleCloseDetailModal,
  } = useRequestEvaluation();

  const summary = evaluationData?.summary || {
    total_pengirim: 0,
    sudah_kirim_count: 0,
    belum_kirim_count: 0,
  };

  const senders = evaluationData?.senders || [];

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          paddingBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/approval-requests')}
            title="Kembali ke Verifikasi Permintaan"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ArrowLeft size={16} />
              <span>Kembali</span>
            </div>
          </Button>

          <h1
            style={{
              fontSize: isMobile ? '1.1rem' : '1.35rem',
              fontWeight: 800,
              color: 'var(--text-main, #0f172a)',
              margin: 0,
            }}
          >
            Evaluasi Pengiriman Permintaan
          </h1>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchEvaluation}
          disabled={isLoading}
          title="Refresh data evaluasi"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {!isMobile && <span>Refresh</span>}
          </div>
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {/* Total Pengirim */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-lg, 10px)',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                Total Pengirim Terdaftar
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main, #0f172a)' }}>
                {summary.total_pengirim} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>user</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Sudah Mengirimkan */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-lg, 10px)',
                backgroundColor: 'rgba(0, 141, 81, 0.12)',
                color: 'var(--primary-color, #008d51)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                Sudah Mengirimkan Hari Ini
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary-color, #008d51)' }}>
                {summary.sudah_kirim_count}{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>user</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Belum Mengirimkan (Kuning) */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-lg, 10px)',
                backgroundColor: 'rgba(234, 179, 8, 0.18)',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>
                Belum Mengirimkan
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ca8a04' }}>
                {summary.belum_kirim_count}{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#854d0e' }}>user</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Submission Status Chart (Per Departemen / Per Factory) */}
      <SubmissionStatusChart
        departmentStats={evaluationData?.department_stats || []}
        factoryStats={evaluationData?.factory_stats || []}
        isLoading={isLoading}
      />

      {/* Filter Controls Card */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              paddingBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
              <Filter size={15} />
              <span>Filter Evaluasi</span>
            </div>

            {/* Shift Tabs - Full-width segmented buttons on mobile */}
            <div
              style={{
                display: 'flex',
                gap: '0.35rem',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              {[
                { id: 'all', label: 'Semua Shift' },
                { id: 'Pagi', label: 'Shift Pagi' },
                { id: 'Malam', label: 'Shift Malam' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShift(s.id as any)}
                  style={{
                    flex: isMobile ? 1 : 'initial',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1.5px solid',
                    borderColor: shift === s.id ? 'var(--secondary-color, #e76114)' : 'var(--border-color, #cbd5e1)',
                    backgroundColor: shift === s.id ? 'var(--secondary-color, #e76114)' : 'transparent',
                    color: shift === s.id ? '#ffffff' : 'var(--text-main, #334155)',
                    fontWeight: shift === s.id ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            {/* Tanggal */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '0.2rem' }}>
                Tanggal
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Departemen */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '0.2rem' }}>
                Departemen
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  color: 'var(--text-main, #0f172a)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="">Semua Departemen</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.code ? `(${d.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Factory */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '0.2rem' }}>
                Pabrik / Factory
              </label>
              <select
                value={factoryId}
                onChange={(e) => setFactoryId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  color: 'var(--text-main, #0f172a)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="">Semua Factory</option>
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.code ? `(${f.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '0.2rem' }}>
                Cari Pengirim
              </label>
              <Input
                placeholder="Username atau nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Main Senders Evaluation List / Table */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              gap: '0.35rem',
            }}
          >
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
              Daftar Pengirim ({senders.length} pengirim ditemukan)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
              Periode: <strong>{formatIndonesianDate(date)}</strong> • Shift: <strong>{shift === 'all' ? 'Semua Shift' : shift}</strong>
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3.5rem' }}>
              <Spinner size={36} />
            </div>
          ) : senders.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
              Tidak ada data pengirim yang cocok dengan filter yang dipilih.
            </div>
          ) : isMobile ? (
            /* ==================== MOBILE CARD VIEW ==================== */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {senders.map((sender, idx) => {
                const isZero = sender.request_count === 0;
                return (
                  <div
                    key={sender.user_id}
                    style={{
                      borderRadius: 'var(--radius-lg, 12px)',
                      border: isZero ? '1.5px solid #facc15' : '1px solid var(--border-color, #e2e8f0)',
                      borderLeft: isZero ? '6px solid #eab308' : '6px solid var(--primary-color, #008d51)',
                      backgroundColor: isZero ? 'rgba(254, 240, 138, 0.32)' : 'var(--bg-card, #ffffff)',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
                    }}
                  >
                    {/* Top Header: Username & Full Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: isZero ? '#fef08a' : 'rgba(0, 141, 81, 0.12)',
                          color: isZero ? '#854d0e' : 'var(--primary-color, #008d51)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main, #0f172a)' }}>
                          @{sender.username}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
                          {sender.full_name}
                        </div>
                      </div>
                    </div>

                    {/* Department & Factory info */}
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted, #64748b)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.5rem',
                        backgroundColor: isZero ? 'rgba(254, 240, 138, 0.45)' : 'var(--bg-main, #f8fafc)',
                        borderRadius: 'var(--radius-sm, 6px)',
                      }}
                    >
                      <Building2 size={13} style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{sender.department_name}</span>
                      <span>•</span>
                      <span>{sender.factory_name}</span>
                    </div>

                    {/* Metrics 3-box mini grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          padding: '0.4rem',
                          borderRadius: 'var(--radius-sm, 6px)',
                          backgroundColor: isZero ? 'rgba(254, 240, 138, 0.45)' : 'var(--bg-main, #f8fafc)',
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #64748b)' }}>Tiket Diajukan</div>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main, #0f172a)' }}>
                          {sender.request_count}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '0.4rem',
                          borderRadius: 'var(--radius-sm, 6px)',
                          backgroundColor: isZero ? 'rgba(254, 240, 138, 0.45)' : 'var(--bg-main, #f8fafc)',
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #64748b)' }}>Total Berat</div>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main, #0f172a)' }}>
                          {sender.total_weight_kg > 0 ? `${sender.total_weight_kg.toFixed(1)} kg` : '-'}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '0.4rem',
                          borderRadius: 'var(--radius-sm, 6px)',
                          backgroundColor: isZero ? 'rgba(254, 240, 138, 0.45)' : 'var(--bg-main, #f8fafc)',
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #64748b)' }}>Total Pcs</div>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main, #0f172a)' }}>
                          {sender.total_pcs > 0 ? sender.total_pcs.toLocaleString() : '-'}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      size="sm"
                      variant={isZero ? 'outline' : 'primary'}
                      onClick={() => handleOpenSenderModal(sender)}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Activity size={14} />
                        <span>Rincian & Aktivitas</span>
                      </div>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ==================== DESKTOP TABLE VIEW ==================== */
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: 'var(--radius-lg, 10px)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', width: '50px' }}>No</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>Username</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>Nama Lengkap</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>Departemen</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>Factory</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', textAlign: 'center' }}>Tiket Diajukan</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', textAlign: 'right' }}>Total Berat</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {senders.map((sender, idx) => {
                    const isZero = sender.request_count === 0;
                    return (
                      <tr
                        key={sender.user_id}
                        style={{
                          borderBottom: '1px solid var(--border-color, #e2e8f0)',
                          backgroundColor: isZero ? 'rgba(254, 240, 138, 0.35)' : 'transparent',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted, #64748b)' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                          @{sender.username}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main, #0f172a)' }}>
                          {sender.full_name}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 500 }}>{sender.department_name}</span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted, #64748b)' }}>
                          {sender.factory_name}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700 }}>
                          {sender.request_count} tiket
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                          {sender.total_weight_kg > 0 ? `${sender.total_weight_kg.toFixed(2)} kg` : '-'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <Button
                            size="sm"
                            variant={isZero ? 'outline' : 'primary'}
                            onClick={() => handleOpenSenderModal(sender)}
                            title="Lihat riwayat aktivitas & seluruh pengajuan pengirim ini"
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Activity size={14} />
                              <span>Rincian & Aktivitas</span>
                            </div>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Level 2: Sender Requests Modal */}
      <SenderRequestsModal
        isOpen={isSenderModalOpen}
        onClose={handleCloseSenderModal}
        sender={selectedSender}
        date={date}
        shift={shift}
        requests={senderRequests}
        isLoading={isLoadingSenderRequests}
        onViewRequestDetail={handleOpenDetailModal}
        heatmap={senderHeatmap}
        isLoadingHeatmap={isLoadingSenderHeatmap}
        heatmapMonths={heatmapMonths}
        onMonthsChange={handleMonthsChange}
      />

      {/* Level 3: Request Detail & Physical Verification Modal */}
      <RequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        request={selectedRequest}
        isLoading={isLoadingDetail}
        isOperatorOrAdmin={true}
      />
    </div>
  );
};
