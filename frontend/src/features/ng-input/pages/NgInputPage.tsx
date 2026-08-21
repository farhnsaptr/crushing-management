import React from 'react';
import { useNgDetail } from '../hooks/useNgDetail';
import { NgMaterialSummaryList } from '../components/NgMaterialSummaryList';
import { NgPartDetailModal } from '../components/NgPartDetailModal';

export const NgInputPage: React.FC = () => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* DETAIL INPUT NG VIEW (Material Summary & Part Detail Analytics) */}
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
    </div>
  );
};
