import React from 'react';
import { useRequestApproval } from '../hooks/useRequestApproval';
import { PendingApprovalTable } from '../components/PendingApprovalTable';
import { RequestDetailModal } from '../components/RequestDetailModal';
import { RejectReasonModal } from '../components/RejectReasonModal';
import { Toast } from '../../../components/common/Toast';
import { ClipboardCheck } from 'lucide-react';

export const RequestApprovalPage: React.FC = () => {
  const {
    requests,
    departments,
    statusFilter,
    setStatusFilter,
    selectedDeptId,
    setSelectedDeptId,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    limit,
    totalRecords,
    isLoading,
    selectedRequest,
    isDetailModalOpen,
    setIsDetailModalOpen,
    isLoadingDetail,
    isActionLoading,
    handleOpenDetailModal,
    handleApprove,
    isRejectModalOpen,
    setIsRejectModalOpen,
    rejectionReason,
    setRejectionReason,
    handleOpenRejectModal,
    handleConfirmReject,
    fetchRequests,
    toast,
    setToast,
  } = useRequestApproval();

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
              backgroundColor: 'rgba(0, 141, 81, 0.12)',
              color: 'var(--primary-color, #008d51)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ClipboardCheck size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main, #0f172a)' }}>
              Verifikasi Permintaan Pengiriman
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
              Validasi fisik vs sistem dari tiket pengiriman part & runner NG oleh departemen pengirim.
            </p>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <PendingApprovalTable
        requests={requests}
        departments={departments}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedDeptId={selectedDeptId}
        onSelectDeptId={setSelectedDeptId}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        page={page}
        onPageChange={setPage}
        limit={limit}
        totalRecords={totalRecords}
        isLoading={isLoading}
        onViewDetail={handleOpenDetailModal}
        onQuickApprove={(id) => handleApprove(id)}
        onQuickReject={(req) => handleOpenRejectModal(req)}
        isActionLoading={isActionLoading}
        onRefresh={fetchRequests}
      />

      {/* Request Detail & Verification Modal */}
      <RequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        request={selectedRequest}
        isLoading={isLoadingDetail}
        isOperatorOrAdmin={true}
        onApprove={(id) => handleApprove(id)}
        onReject={(req) => handleOpenRejectModal(req)}
        isActionLoading={isActionLoading}
      />

      {/* Reject Reason Confirmation Modal */}
      <RejectReasonModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        request={selectedRequest}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        onConfirmReject={handleConfirmReject}
        isLoading={isActionLoading}
      />
    </div>
  );
};
