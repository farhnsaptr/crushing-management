import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '../../../context/AuthContext';
import { AnalyticsYearlyChart } from '../components/AnalyticsYearlyChart';
import { AnalyticsMonthlyGapTable } from '../components/AnalyticsMonthlyGapTable';
import { AnalyticsParetoMaterial } from '../components/AnalyticsParetoMaterial';
import { AnalyticsParetoPartNg } from '../components/AnalyticsParetoPartNg';
import { AnalyticsDataTable } from '../components/AnalyticsDataTable';
import { AnalyticsUploadModal } from '../components/AnalyticsUploadModal';
import { Button } from '../../../components/common/Button';
import {
  BarChart3,
  UploadCloud,
  Calendar,
  RefreshCw,
 Layers,
 AlertCircle,
 RotateCcw,
 MapPin,
} from 'lucide-react';
import { canManageData } from '../../../config/permissions.config';
import { AnalyticsRollbackModal } from '../components/AnalyticsRollbackModal';
import { CrussingSyncStatus } from '../../crussing-sync/components/CrussingSyncStatus';
import { useIsNarrow } from '../../../hooks';

export const AnalyticsPage: React.FC = () => {
  const [containerRef, isNarrow] = useIsNarrow<HTMLDivElement>(768);
  const { user } = useAuth();
  const canManage = canManageData(user?.role);

  const {
    activeTab,
    setActiveTab,
    year,
    setYear,
    factory,
    setFactory,
    search,
    setSearch,
    page,
    setPage,
 monthFilter,
 setMonthFilter,
 locations,
 location,
 setLocation,
 factoryOptions,
 syncMonth,
 syncStatus,
 isLoadingSyncStatus,
 isSyncing,
 syncError,
 yearlyData,
 records,
 pagination,
    batches,
    paretoMaterialsData,
    paretoPartsNgData,
    isLoadingChart,
    isLoadingRecords,
    isLoadingParetoMaterials,
    isLoadingParetoPartsNg,
    isLoadingBatches,
    isUploading,
    isRollbacking,
    toast,
    setToast,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isRollbackModalOpen,
    setIsRollbackModalOpen,
 fetchBatches,
 refreshAll,
 handleSync,
 handleUploadReport,
 handleRollbackLatestBatch,
 handleDeleteBatch,
 } = useAnalytics();

 const currentYear = new Date().getFullYear();
 const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

 const handleRefreshAll = () => {
 if (canManage) {
 handleSync();
 } else {
 refreshAll();
 }
 };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: isNarrow ? '1.15rem' : '1.5rem', paddingBottom: '3rem' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
            padding: '0.85rem 1.35rem',
            borderRadius: '12px',
            backgroundColor: toast.type === 'error' ? '#ef4444' : '#008d51',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.9rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 900 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: isNarrow ? 'flex-start' : 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: isNarrow ? '36px' : '42px', height: isNarrow ? '36px' : '42px', borderRadius: '10px', backgroundColor: 'rgba(0, 141, 81, 0.1)', color: '#008d51', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BarChart3 size={isNarrow ? 20 : 24} />
            </div>
            <div>
              <h1 style={{ fontSize: isNarrow ? '1.2rem' : '1.5rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                Data Analitik & Allowance
              </h1>
              <p style={{ fontSize: isNarrow ? '0.75rem' : '0.85rem', color: 'var(--text-muted, #64748b)', margin: '0.15rem 0 0 0' }}>
                Komparasi Allowance, Input, Output, Gap, dan Analisis Pareto.
              </p>
            </div>
          </div>
        </div>

 {/* Action Controls Header */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', width: isNarrow ? '100%' : 'auto' }}>
 {/* Location Selector */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', flex: isNarrow ? 1 : 'none' }}>
 <MapPin size={16} color="#64748b" style={{ flexShrink: 0 }} />
 <select
 value={location}
 onChange={(e) => setLocation(e.target.value)}
 style={{
 width: '100%',
 border: 'none',
 backgroundColor: 'transparent',
 fontSize: '0.85rem',
 fontWeight: 800,
 color: '#0f172a',
 outline: 'none',
 cursor: 'pointer',
 }}
 >
 {locations.map((loc) => (
 <option key={loc} value={loc}>
 {loc}
 </option>
 ))}
 </select>
 </div>

 {/* Year Selector */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', flex: isNarrow ? 1 : 'none' }}>
 <Calendar size={16} color="#64748b" style={{ flexShrink: 0 }} />
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <Button
            type="button"
            variant="secondary"
 onClick={handleRefreshAll}
 isLoading={isLoadingChart || isLoadingRecords || isLoadingParetoMaterials || isLoadingParetoPartsNg || isSyncing}
 leftIcon={<RefreshCw size={15} />}
 style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem' }}
 title={canManage
 ? `Tarik data Crusing API ${new Date(year, syncMonth - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} lalu refresh`
 : 'Refresh data'}
 >
 Segarkan
 </Button>

          {/* Rollback Data Button (Operator up to Super Admin only) */}
          {canManage && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                fetchBatches();
                setIsRollbackModalOpen(true);
              }}
              leftIcon={<RotateCcw size={15} />}
              style={{
                padding: '0.5rem 0.95rem',
                fontWeight: 800,
                backgroundColor: '#ef4444',
                fontSize: '0.825rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
              }}
            >
              Rollback
            </Button>
          )}

          {/* Upload Data Produksi Modal Button (Operator up to Super Admin only) */}
          {canManage && (
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsUploadModalOpen(true)}
              leftIcon={<UploadCloud size={16} />}
              style={{
                padding: '0.5rem 1rem',
                fontWeight: 800,
                backgroundColor: '#008d51',
                fontSize: '0.825rem',
                boxShadow: '0 4px 12px rgba(0, 141, 81, 0.25)',
                width: isNarrow ? '100%' : 'auto',
              }}
            >
              Upload Data Produksi
            </Button>
          )}
 </div>
 </div>

 <CrussingSyncStatus
 status={syncStatus}
 isLoading={isLoadingSyncStatus}
 isSyncing={isSyncing}
 error={syncError}
 />

 {/* Navigation Tabs Bar - Horizontal Scrollable on Mobile */}
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '0.5rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.15rem',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeTab === 'overview' ? '#008d51' : 'transparent',
            color: activeTab === 'overview' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'overview' ? '0 4px 12px rgba(0, 141, 81, 0.25)' : 'none',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <BarChart3 size={16} />
          <span>Komparasi & Gap Bulanan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pareto-material')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.15rem',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeTab === 'pareto-material' ? '#008d51' : 'transparent',
            color: activeTab === 'pareto-material' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'pareto-material' ? '0 4px 12px rgba(0, 141, 81, 0.25)' : 'none',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Layers size={16} />
          <span>Pareto Material</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pareto-part-ng')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.15rem',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeTab === 'pareto-part-ng' ? '#008d51' : 'transparent',
            color: activeTab === 'pareto-part-ng' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'pareto-part-ng' ? '0 4px 12px rgba(0, 141, 81, 0.25)' : 'none',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <AlertCircle size={16} />
          <span>Pareto Part NG</span>
        </button>
      </div>

      {/* Tab 1: Overview & Gap Bulanan */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Yearly 3-Bar Comparison Chart */}
          <AnalyticsYearlyChart
            monthlyData={yearlyData?.monthly_comparison || []}
            year={year}
            isLoading={isLoadingChart}
          />

          {/* Monthly Gap Matrix Table (Sumbu X: Bulan, Sumbu Y: Gap NG & Gap Crushing) */}
          <AnalyticsMonthlyGapTable
            monthlyData={yearlyData?.monthly_comparison || []}
            year={year}
            isLoading={isLoadingChart}
          />

          {/* Raw Production Records Table */}
          <AnalyticsDataTable
            canManage={canManage}
            records={records}
            pagination={pagination}
            search={search}
            setSearch={setSearch}
            page={page}
            setPage={setPage}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
 factory={factory}
 setFactory={setFactory}
 factoryOptions={factoryOptions}
 isLoading={isLoadingRecords}
 />
        </div>
      )}

      {/* Tab 2: Pareto Material */}
      {activeTab === 'pareto-material' && (
        <AnalyticsParetoMaterial
          data={paretoMaterialsData}
          year={year}
          isLoading={isLoadingParetoMaterials}
        />
      )}

      {/* Tab 3: Pareto Part NG */}
      {activeTab === 'pareto-part-ng' && (
        <AnalyticsParetoPartNg
          data={paretoPartsNgData}
          year={year}
          isLoading={isLoadingParetoPartsNg}
        />
      )}

      {/* Upload Modal (Operator up to Super Admin only) */}
      {canManage && (
        <AnalyticsUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUploadReport}
          isUploading={isUploading}
        />
      )}

      {/* Rollback Batch Modal (Operator up to Super Admin only) */}
      {canManage && (
        <AnalyticsRollbackModal
          isOpen={isRollbackModalOpen}
          onClose={() => setIsRollbackModalOpen(false)}
          batches={batches}
          onRollbackLatest={handleRollbackLatestBatch}
          onDeleteBatch={handleDeleteBatch}
          onRefreshBatches={fetchBatches}
          isRollbacking={isRollbacking}
          isLoadingBatches={isLoadingBatches}
        />
      )}
    </div>
  );
};
export default AnalyticsPage;
