import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useDashboard, MONTH_OPTIONS } from '../hooks/useDashboard';
import { DashboardMetricCards } from '../components/DashboardMetricCards';
import { DailyRecycleChart } from '../components/DailyRecycleChart';
import { ParetoMaterialTable } from '../components/ParetoMaterialTable';
import { TopNgPartsTable } from '../components/TopNgPartsTable';
import { DepartmentParetoTable } from '../components/DepartmentParetoTable';
import { SenderDashboardView } from '../components/SenderDashboardView';
import { ExportDateModal } from '../components/ExportDateModal';
import { VerificationModal } from '../../verification/components/VerificationModal';
import type { PlantLocation } from '../types/dashboard.types';
import {
  PlusCircle,
  FileSpreadsheet,
  MapPin,
  Calendar,
  RefreshCw,
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  Info,
  ClipboardCheck,
  BarChart3,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);

  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedLocation,
    setSelectedLocation,
    summaryStats,
    dailyChart,
    paretoMaterials,
    topParts,
    departmentPareto,
    senderStats,
    verificationStatus,
    isLoading,
    isExporting,
    fetchDashboardData,
    handleExportExcel,
  } = useDashboard();

  // If logged-in user is 'pengirim', render personalized Sender Dashboard View
  if (user?.role === 'pengirim') {
    return (
      <SenderDashboardView
        user={user}
        stats={senderStats}
        isLoading={isLoading}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        monthOptions={MONTH_OPTIONS}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />
    );
  }

  // Formatted date text for top right header (e.g. "Jum'at, 31 Juli 2026")
  const formattedTodayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', minHeight: 'calc(100vh - 85px)' }}>
      {/* Mobile Responsive & Single Screen Style Block */}
      <style>{`
        .dashboard-header-container {
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
        .dashboard-title {
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: var(--text-main, #0f172a);
          margin: 0;
          text-transform: uppercase;
        }
        .dashboard-controls-bar {
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
        .dashboard-tables-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          align-items: start;
        }
        @media (max-width: 960px) {
          .dashboard-tables-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-header-container {
            padding: 0.75rem 1rem !important;
          }
          .dashboard-title {
            font-size: 1.15rem !important;
          }
        }
      `}</style>

      {/* Top Header: Title & Date User Info */}
      <div className="dashboard-header-container">
        <div>
          <h1 className="dashboard-title">MATERIAL MANAGEMENT</h1>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted, #64748b)', margin: '0.15rem 0 0 0', fontWeight: 600 }}>
            Executive Overview & Data Analytics Daur Ulang Plastik — PT Sugity Creatives
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
            {formattedTodayDate}
          </div>
          <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--secondary-color, #e76114)', marginTop: '0.1rem' }}>
            {user?.full_name || user?.username || 'User'} ({user?.role.toUpperCase()})
          </div>
        </div>
      </div>

      {/* Control & Action Bar: Location Toggle, Date Pickers, Verification Quick-Link & Export Buttons */}
      <div className="dashboard-controls-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Plant Location Pill Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              padding: '2px',
              borderRadius: '16px',
              border: '1px solid #cbd5e1',
            }}
          >
            {(['Cibitung', 'Karawang'] as PlantLocation[]).map((loc) => {
              const isSelected = selectedLocation === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setSelectedLocation(loc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '14px',
                    border: 'none',
                    backgroundColor: isSelected ? 'var(--secondary-color, #e76114)' : 'transparent',
                    color: isSelected ? '#ffffff' : '#64748b',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <MapPin size={13} />
                  <span>{loc}</span>
                </button>
              );
            })}
          </div>

          {/* Month Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={15} color="var(--secondary-color, #e76114)" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '14px',
                border: '1.5px solid var(--secondary-color, #e76114)',
                backgroundColor: 'var(--secondary-color, #e76114)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value} style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Year Input */}
            <input
              type="number"
              className="no-spinner"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              min={2020}
              max={2035}
              style={{
                width: '65px',
                padding: '0.35rem 0.55rem',
                borderRadius: '14px',
                border: '1.5px solid var(--secondary-color, #e76114)',
                backgroundColor: 'var(--secondary-color, #e76114)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.825rem',
                textAlign: 'center',
                outline: 'none',
                MozAppearance: 'textfield',
              }}
            />
          </div>

          <button
            onClick={fetchDashboardData}
            style={{
              padding: '0.35rem',
              borderRadius: '50%',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Refresh Data"
          >
            <RefreshCw size={15} color="#64748b" />
          </button>
        </div>

        {/* Action Buttons: Verifikasi Tiket, + Add Data & Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Verifikasi Tiket Masuk Button */}
          <button
            onClick={() => navigate('/approval-requests')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1.15rem',
              borderRadius: '14px',
              border: '1.5px solid var(--primary-color, #008d51)',
              backgroundColor: 'var(--primary-color, #008d51)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.825rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 141, 81, 0.2)',
              transition: 'all 0.2s ease',
            }}
          >
            <ClipboardCheck size={16} />
            <span>Verifikasi Tiket</span>
          </button>

          {/* + Add Runner Data Button */}
          <button
            onClick={() => navigate('/part-runner-ng')}
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
            <FileSpreadsheet size={16} />
            <span>Input Part Runner</span>
          </button>

          {/* Detail Part NG Button */}
          <button
            onClick={() => navigate('/ng-input')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1.15rem',
              borderRadius: '14px',
              border: '1.5px solid #2563eb',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.825rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.2s ease',
            }}
          >
            <BarChart3 size={16} />
            <span>Detail Part NG</span>
          </button>

          {/* Export Excel Button (Opens Date Range Modal) */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1.15rem',
              borderRadius: '14px',
              border: '1.5px solid #0f172a',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.825rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)',
              transition: 'all 0.2s ease',
            }}
          >
            <FileSpreadsheet size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Verification Status Reminder Banner */}
      {verificationStatus && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            backgroundColor:
              verificationStatus.status === 'no_input'
                ? '#f8fafc'
                : verificationStatus.status === 'validated'
                ? 'rgba(0, 141, 81, 0.08)'
                : 'rgba(231, 97, 20, 0.08)',
            border:
              verificationStatus.status === 'no_input'
                ? '1px solid #cbd5e1'
                : verificationStatus.status === 'validated'
                ? '1.5px solid #008d51'
                : '1.5px solid #e76114',
            padding: '0.75rem 1.15rem',
            borderRadius: '14px',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {verificationStatus.status === 'no_input' ? (
              <Info size={22} color="#64748b" style={{ flexShrink: 0 }} />
            ) : verificationStatus.status === 'validated' ? (
              <CheckCircle2 size={22} color="#008d51" style={{ flexShrink: 0 }} />
            ) : (
              <AlertTriangle size={22} color="#e76114" style={{ flexShrink: 0 }} />
            )}
            <span style={{ fontWeight: 800, color: verificationStatus.status === 'no_input' ? '#475569' : '#0f172a' }}>
              {verificationStatus.message}
            </span>
          </div>

          {verificationStatus.status !== 'no_input' && (
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.95rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: verificationStatus.status === 'validated' ? '#008d51' : '#e76114',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.15s ease',
              }}
            >
              <CheckSquare size={16} />
              <span>{verificationStatus.status === 'validated' ? 'Lihat / Edit Verifikasi' : 'Verifikasi Input Sekarang'}</span>
            </button>
          )}
        </div>
      )}

      {/* Metric Summary Cards: Total Input, Total Output, Waste */}
      <DashboardMetricCards summary={summaryStats} isLoading={isLoading} />

      {/* 1. Full-Width Daily Recycle Chart */}
      <DailyRecycleChart
        data={dailyChart}
        isLoading={isLoading}
        monthLabel={MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || 'Bulan'}
        year={selectedYear}
      />

      {/* 2. Department Pareto Table (Ranked NG Sources) */}
      <DepartmentParetoTable data={departmentPareto} isLoading={isLoading} />

      {/* 3. Side-by-Side Tables: Top NG Parts & Pareto Material */}
      <div className="dashboard-tables-grid">
        <TopNgPartsTable data={topParts} isLoading={isLoading} />
        <ParetoMaterialTable data={paretoMaterials} isLoading={isLoading} />
      </div>

      {/* Date Range Selection Export Modal */}
      <ExportDateModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultLocation={selectedLocation}
        isExporting={isExporting}
        onExport={handleExportExcel}
      />

      {/* Quick Input Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSuccessSave={fetchDashboardData}
      />
    </div>
  );
};
