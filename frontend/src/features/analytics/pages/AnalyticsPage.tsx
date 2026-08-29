import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
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
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { AnalyticsRollbackModal } from '../components/AnalyticsRollbackModal';

export const AnalyticsPage: React.FC = () => {
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
    fetchYearlyData,
    fetchRecords,
    fetchParetoMaterials,
    fetchParetoPartsNg,
    fetchBatches,
    refreshAll,
    handleUploadReport,
    handleRollbackLatestBatch,
    handleDeleteBatch,
  } = useAnalytics();

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  const handleRefreshAll = () => {
    refreshAll();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(0, 141, 81, 0.1)', color: '#008d51', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                Data Analitik & Allowance Produksi
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', margin: '0.2rem 0 0 0' }}>
                Monitoring komparasi 3-komponen (Allowance, Input, Output), Gap Bulanan, dan Analisis Pareto Material & Part NG.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Year Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
            <Calendar size={16} color="#64748b" />
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              style={{
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
            isLoading={isLoadingChart || isLoadingRecords || isLoadingParetoMaterials || isLoadingParetoPartsNg}
            leftIcon={<RefreshCw size={15} />}
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          >
            Segarkan
          </Button>

          {/* Rollback Data Button */}
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              fetchBatches();
              setIsRollbackModalOpen(true);
            }}
            leftIcon={<RotateCcw size={16} />}
            style={{
              padding: '0.55rem 1.15rem',
              fontWeight: 800,
              backgroundColor: '#ef4444',
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
            }}
          >
            Rollback Data
          </Button>

          {/* Upload CSV Modal Button */}
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<UploadCloud size={18} />}
            style={{
              padding: '0.55rem 1.35rem',
              fontWeight: 800,
              backgroundColor: '#008d51',
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(0, 141, 81, 0.25)',
            }}
          >
            Upload Data Produksi
          </Button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeTab === 'overview' ? '#008d51' : 'transparent',
            color: activeTab === 'overview' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'overview' ? '0 4px 12px rgba(0, 141, 81, 0.25)' : 'none',
          }}
        >
          <BarChart3 size={17} />
          <span>Komparasi & Gap Bulanan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pareto-material')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeTab === 'pareto-material' ? '#008d51' : 'transparent',
            color: activeTab === 'pareto-material' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'pareto-material' ? '0 4px 12px rgba(0, 141, 81, 0.25)' : 'none',
          }}
        >
          <Layers size={17} />
          <span>Pareto Material</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pareto-part-ng')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeTab === 'pareto-part-ng' ? '#008d51' : 'transparent',
            color: activeTab === 'pareto-part-ng' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'pareto-part-ng' ? '0 4px 12px rgba(0, 141, 81, 0.25)' : 'none',
          }}
        >
          <AlertCircle size={17} />
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

      {/* Upload CSV Modal */}
      <AnalyticsUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadReport}
        isUploading={isUploading}
      />

      {/* Rollback Batch Modal */}
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
    </div>
  );
};
export default AnalyticsPage;
