import React from 'react';
import { useCrushingRequests } from '../hooks/useCrushingRequests';
import { CreateRequestForm } from '../components/CreateRequestForm';
import { MyRequestsTable } from '../components/MyRequestsTable';
import { RequestDetailModal } from '../components/RequestDetailModal';
import { Toast } from '../../../components/common/Toast';
import { Send, History, PlusCircle } from 'lucide-react';

export const SenderRequestsPage: React.FC = () => {
  const {
    user,
    activeTab,
    setActiveTab,
    shift,
    setShift,
    requestDate,
    setRequestDate,
    notes,
    setNotes,
    items,
    itemType,
    setItemType,
    selectedPart,
    handleSelectPart,
    partQuantityPcs,
    setPartQuantityPcs,
    selectedMaterial,
    setSelectedMaterial,
    runnerWeightKg,
    setRunnerWeightKg,
    itemNotes,
    setItemNotes,
    filteredParts,
    jenisOptions,
    selectedJenis,
    setSelectedJenis,
    availableMaterials,
    isLoadingParts,
    partSearchQuery,
    setPartSearchQuery,
    handleAddItem,
    handleAddRunnerBatch,
    handleRemoveItem,
    handleClearDraft,
    isSubmitting,
    handleSubmitRequest,
    estimatedTotalWeightKg,
    estimatedTotalPcs,
    historyRequests,
    historyTotal,
    historyPage,
    setHistoryPage,
    historyLimit,
    historyStatusFilter,
    setHistoryStatusFilter,
    isLoadingHistory,
    selectedRequestDetail,
    isDetailModalOpen,
    setIsDetailModalOpen,
    isLoadingDetail,
    handleOpenDetailModal,
    toast,
    setToast,
  } = useCrushingRequests();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Notification */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Header Info Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '2px solid var(--border-color, #e2e8f0)',
          paddingBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'rgba(231, 97, 20, 0.12)',
              color: 'var(--secondary-color, #e76114)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main, #0f172a)' }}>
              Kirim Part NG
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
              Sistem tiket pengajuan pengiriman Part NG reject ke area crushing untuk validasi operator.
            </p>
          </div>
        </div>

        {/* Top Tab Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--card-bg, #ffffff)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-color, #cbd5e1)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'create' ? 800 : 600,
              backgroundColor: activeTab === 'create' ? 'var(--secondary-color, #e76114)' : 'transparent',
              color: activeTab === 'create' ? '#ffffff' : 'var(--text-muted, #64748b)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <PlusCircle size={16} />
            <span>Buat Tiket Baru</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'history' ? 800 : 600,
              backgroundColor: activeTab === 'history' ? 'var(--secondary-color, #e76114)' : 'transparent',
              color: activeTab === 'history' ? '#ffffff' : 'var(--text-muted, #64748b)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <History size={16} />
            <span>Riwayat Pengajuan</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FORM PENGAJUAN (Visual Grid Catalog + Form) */}
      {activeTab === 'create' && (
        <CreateRequestForm
          user={user}
          shift={shift}
          onShiftChange={setShift}
          requestDate={requestDate}
          onRequestDateChange={setRequestDate}
          notes={notes}
          onNotesChange={setNotes}
          items={items}
          itemType={itemType}
          onItemTypeChange={setItemType}
          selectedPart={selectedPart}
          onSelectPart={handleSelectPart}
          partQuantityPcs={partQuantityPcs}
          onPartQuantityChange={setPartQuantityPcs}
          selectedMaterial={selectedMaterial}
          onSelectMaterial={setSelectedMaterial}
          runnerWeightKg={runnerWeightKg}
          onRunnerWeightChange={setRunnerWeightKg}
          itemNotes={itemNotes}
          onItemNotesChange={setItemNotes}
          filteredParts={filteredParts}
          jenisOptions={jenisOptions}
          selectedJenis={selectedJenis}
          onSelectJenis={setSelectedJenis}
          availableMaterials={availableMaterials}
          isLoadingParts={isLoadingParts}
          partSearchQuery={partSearchQuery}
          onPartSearchQueryChange={setPartSearchQuery}
          onAddItem={handleAddItem}
          onAddRunnerBatch={handleAddRunnerBatch}
          onRemoveItem={handleRemoveItem}
          onClearDraft={handleClearDraft}
          isSubmitting={isSubmitting}
          onSubmitRequest={handleSubmitRequest}
          estimatedTotalWeightKg={estimatedTotalWeightKg}
          estimatedTotalPcs={estimatedTotalPcs}
        />
      )}

      {/* TAB 2: RIWAYAT PENGAJUAN PENGIRIM */}
      {activeTab === 'history' && (
        <MyRequestsTable
          requests={historyRequests}
          total={historyTotal}
          page={historyPage}
          limit={historyLimit}
          onPageChange={setHistoryPage}
          statusFilter={historyStatusFilter}
          onStatusFilterChange={setHistoryStatusFilter}
          isLoading={isLoadingHistory}
          onViewDetail={handleOpenDetailModal}
        />
      )}

      {/* Ticket Detail Modal */}
      <RequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        request={selectedRequestDetail}
        isLoading={isLoadingDetail}
        isOperatorOrAdmin={false}
      />
    </div>
  );
};
