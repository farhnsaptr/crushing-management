import React, { useState } from 'react';
import { useNgInput } from '../hooks/useNgInput';
import { useNgDetail } from '../hooks/useNgDetail';
import { NgFilterCard } from '../components/NgFilterCard';
import { NgPartGridCard } from '../components/NgPartGridCard';
import { NgInputFormCard } from '../components/NgInputFormCard';
import { NgMaterialSummaryList } from '../components/NgMaterialSummaryList';
import { NgPartDetailModal } from '../components/NgPartDetailModal';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Toast } from '../../../components/common/Toast';
import { Search, X, BarChart3, PlusCircle } from 'lucide-react';

export const NgInputPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'detail' | 'form'>('form');

  // Hook for Detail Input NG analytics view
  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedLocation,
    setSelectedLocation,
    summaryData,
    isLoadingSummary,
    fetchSummary,
    expandedMaterials,
    toggleExpandMaterial,
    isModalOpen,
    openPartModal,
    closeModal,
    selectedPartSummary,
    partDetail,
    isLoadingDetail,
    monthLabel,
  } = useNgDetail();

  // Hook for Input NG Form entry view
  const {
    filterMode,
    setFilterMode,
    selectedJenis,
    setSelectedJenis,
    jenisOptions,
    selectedFactoryId,
    setSelectedFactoryId,
    searchQuery,
    setSearchQuery,
    factories,
    filteredParts,
    isLoadingParts,
    selectedPart,
    handleSelectPart,
    quantityPcs,
    setQuantityPcs,
    shift,
    setShift,
    transactionDate,
    setTransactionDate,
    notes,
    setNotes,
    estimatedWeightKg,
    isSubmitting,
    handleSubmit,
    toast,
    setToast,
  } = useNgInput();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Top Tab Switcher Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '2px solid var(--border-color, #e2e8f0)',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setActiveTab('form')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'form' ? 800 : 600,
            backgroundColor: activeTab === 'form' ? 'var(--secondary-color, #e76114)' : 'transparent',
            color: activeTab === 'form' ? '#ffffff' : 'var(--text-muted, #64748b)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flex: '1 1 180px',
          }}
        >
          <PlusCircle size={18} />
          <span>Input Part NG Baru</span>
        </button>

        <button
          onClick={() => setActiveTab('detail')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'detail' ? 800 : 600,
            backgroundColor: activeTab === 'detail' ? 'var(--secondary-color, #e76114)' : 'transparent',
            color: activeTab === 'detail' ? '#ffffff' : 'var(--text-muted, #64748b)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flex: '1 1 180px',
          }}
        >
          <BarChart3 size={18} />
          <span>Detail Input NG</span>
        </button>
      </div>

      {/* TAB 1: DETAIL INPUT NG (Pareto Material & Modal Analytics) */}
      {activeTab === 'detail' && (
        <>
          <NgMaterialSummaryList
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            onSearch={fetchSummary}
            summaryData={summaryData}
            isLoading={isLoadingSummary}
            expandedMaterials={expandedMaterials}
            onToggleExpand={toggleExpandMaterial}
            onOpenPartDetail={openPartModal}
          />

          <NgPartDetailModal
            isOpen={isModalOpen}
            onClose={closeModal}
            partSummary={selectedPartSummary}
            partDetail={partDetail}
            isLoading={isLoadingDetail}
            monthLabel={monthLabel}
            year={selectedYear}
          />
        </>
      )}

      {/* TAB 2: INPUT PART NG BARU (Transaction Entry Form) */}
      {activeTab === 'form' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
            alignItems: 'start',
          }}
        >
          {/* Left Side: Filter & Grid Selection (~65% width) */}
          <div style={{ flex: '1 1 62%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <NgFilterCard
              filterMode={filterMode}
              onFilterModeChange={setFilterMode}
              selectedJenis={selectedJenis}
              onSelectJenis={setSelectedJenis}
              jenisOptions={jenisOptions}
              selectedFactoryId={selectedFactoryId}
              onSelectFactoryId={setSelectedFactoryId}
              factories={factories}
            />

            {/* Search Card below Mode Pengelompokan */}
            <Card style={{ padding: '0.85rem 1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="Cari nama part, part number, model, kode sebango..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search size={18} />}
                  />
                </div>
                {searchQuery && (
                  <Button variant="secondary" size="sm" onClick={() => setSearchQuery('')} leftIcon={<X size={14} />}>
                    Clear
                  </Button>
                )}
              </div>
            </Card>

            <NgPartGridCard
              title={
                filterMode === 'jenis'
                  ? `Daftar Part — ${selectedJenis}`
                  : `Daftar Part — ${factories.find((f) => f.id === selectedFactoryId)?.name || 'Factory'}`
              }
              parts={filteredParts}
              isLoading={isLoadingParts}
              selectedPartId={selectedPart?.id || null}
              onSelectPart={handleSelectPart}
            />
          </div>

          {/* Right Side: Entry Form (~35% width) */}
          <div style={{ flex: '1 1 35%' }}>
            <NgInputFormCard
              selectedPart={selectedPart}
              quantityPcs={quantityPcs}
              onQuantityChange={setQuantityPcs}
              shift={shift}
              onShiftChange={setShift}
              transactionDate={transactionDate}
              onTransactionDateChange={setTransactionDate}
              notes={notes}
              onNotesChange={setNotes}
              estimatedWeightKg={estimatedWeightKg}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};
