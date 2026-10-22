import React from 'react';
import { Database, ShieldAlert, FileText, PackageX, Layers } from 'lucide-react';
import { useDatabaseManagement } from '../hooks/useDatabaseManagement';
import { DatabaseToolbar } from '../components/DatabaseToolbar';
import { RequestManagementTable } from '../components/RequestManagementTable';
import { RequestDetailModal } from '../components/RequestDetailModal';
import { EditRequestHeaderModal } from '../components/EditRequestHeaderModal';
import { AddPartModal } from '../components/AddPartModal';
import { EditRequestItemModal } from '../components/EditRequestItemModal';
import { UnapproveConfirmDialog } from '../components/UnapproveConfirmDialog';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { NgTransactionsTable } from '../components/NgTransactionsTable';
import { EditNgTransactionModal } from '../components/EditNgTransactionModal';
import { RunnerTransactionsTable } from '../components/RunnerTransactionsTable';
import { EditRunnerTransactionModal } from '../components/EditRunnerTransactionModal';
import { Toast } from '../../../components/common/Toast';

export const DatabaseManagementPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    departments,
    factories,
    masterParts,
    materials,
    notification,

    // Requests
    requests,
    requestsPagination,
    requestsFilter,
    setRequestsFilter,
    isLoadingRequests,
    fetchRequests,

    // Detail & Modals
    requestDetail,
    isLoadingDetail,
    isDetailModalOpen,
    setIsDetailModalOpen,
    handleOpenDetail,
    isEditHeaderModalOpen,
    setIsEditHeaderModalOpen,
    handleUpdateHeader,
    isAddPartModalOpen,
    setIsAddPartModalOpen,
    handleAddBatchParts,
    editingItem,
    setEditingItem,
    handleUpdateItem,
    handleDeleteItem,

    // Unapprove & Delete Request
    unapproveTarget,
    setUnapproveTarget,
    handleConfirmUnapprove,
    deleteRequestTarget,
    setDeleteRequestTarget,
    handleConfirmDeleteRequest,

    // NG Transactions
    ngTransactions,
    ngPagination,
    ngFilter,
    setNgFilter,
    isLoadingNg,
    fetchNgTransactions,
    editingNgTrx,
    setEditingNgTrx,
    handleUpdateNgTrx,
    deleteNgTrxTarget,
    setDeleteNgTrxTarget,
    handleDeleteNgTrx,

    // Runner Transactions
    runnerTransactions,
    runnerPagination,
    runnerFilter,
    setRunnerFilter,
    isLoadingRunner,
    fetchRunnerTransactions,
    editingRunnerTrx,
    setEditingRunnerTrx,
    handleUpdateRunnerTrx,
    deleteRunnerTrxTarget,
    setDeleteRunnerTrxTarget,
    handleDeleteRunnerTrx,
  } = useDatabaseManagement();

  // Helper for refresh based on active tab
  const handleRefresh = () => {
    if (activeTab === 'requests') {
      fetchRequests();
    } else if (activeTab === 'ng_transactions') {
      fetchNgTransactions();
    } else {
      fetchRunnerTransactions();
    }
  };

  const isCurrentLoading =
    activeTab === 'requests'
      ? isLoadingRequests
      : activeTab === 'ng_transactions'
      ? isLoadingNg
      : isLoadingRunner;

  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '3rem' }}>
      <div style={{ minWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header Card (Clean White) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.75rem',
            color: '#0f172a',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <Database size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  Database Management
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    backgroundColor: '#fef2f2',
                    color: '#ef4444',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                    border: '1px solid #fecaca',
                  }}
                >
                  <ShieldAlert size={12} />
                  Super Admin Only
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#64748b', lineHeight: 1.4 }}>
                Pusat kendali koreksi basis data: edit header & item permintaan, batalkan approval, dan modifikasi transaksi penimbangan.
              </p>
            </div>
          </div>

          {/* Quick Stat Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.45rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 700 }}>Total Tiket</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                  {requestsPagination?.total ?? 0}
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.45rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(236, 72, 153, 0.1)',
                  color: '#db2777',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PackageX size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 700 }}>Part NG Trx</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                  {ngPagination?.total ?? 0}
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.45rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 700 }}>Runner Trx</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                  {runnerPagination?.total ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Main Filter & Tab Toolbar */}
      <DatabaseToolbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        search={
          activeTab === 'requests'
            ? requestsFilter.search || ''
            : activeTab === 'ng_transactions'
            ? ngFilter.search
            : runnerFilter.search
        }
        onSearchChange={(search) => {
          if (activeTab === 'requests') {
            setRequestsFilter((prev) => ({ ...prev, search, page: 1 }));
          } else if (activeTab === 'ng_transactions') {
            setNgFilter((prev) => ({ ...prev, search, page: 1 }));
          } else {
            setRunnerFilter((prev) => ({ ...prev, search, page: 1 }));
          }
        }}
        status={activeTab === 'requests' ? requestsFilter.status : undefined}
        onStatusChange={
          activeTab === 'requests'
            ? (status) => setRequestsFilter((prev) => ({ ...prev, status, page: 1 }))
            : undefined
        }
        shift={
          activeTab === 'requests'
            ? requestsFilter.shift || ''
            : activeTab === 'ng_transactions'
            ? ngFilter.shift
            : runnerFilter.shift
        }
        onShiftChange={(shift) => {
          if (activeTab === 'requests') {
            setRequestsFilter((prev) => ({ ...prev, shift, page: 1 }));
          } else if (activeTab === 'ng_transactions') {
            setNgFilter((prev) => ({ ...prev, shift, page: 1 }));
          } else {
            setRunnerFilter((prev) => ({ ...prev, shift, page: 1 }));
          }
        }}
        startDate={
          activeTab === 'requests'
            ? requestsFilter.startDate || ''
            : activeTab === 'ng_transactions'
            ? ngFilter.startDate
            : runnerFilter.startDate
        }
        onStartDateChange={(startDate) => {
          if (activeTab === 'requests') {
            setRequestsFilter((prev) => ({ ...prev, startDate, page: 1 }));
          } else if (activeTab === 'ng_transactions') {
            setNgFilter((prev) => ({ ...prev, startDate, page: 1 }));
          } else {
            setRunnerFilter((prev) => ({ ...prev, startDate, page: 1 }));
          }
        }}
        endDate={
          activeTab === 'requests'
            ? requestsFilter.endDate || ''
            : activeTab === 'ng_transactions'
            ? ngFilter.endDate
            : runnerFilter.endDate
        }
        onEndDateChange={(endDate) => {
          if (activeTab === 'requests') {
            setRequestsFilter((prev) => ({ ...prev, endDate, page: 1 }));
          } else if (activeTab === 'ng_transactions') {
            setNgFilter((prev) => ({ ...prev, endDate, page: 1 }));
          } else {
            setRunnerFilter((prev) => ({ ...prev, endDate, page: 1 }));
          }
        }}
        departmentId={
          activeTab === 'requests'
            ? requestsFilter.departmentId || ''
            : activeTab === 'ng_transactions'
            ? ngFilter.departmentId
            : runnerFilter.departmentId
        }
        onDepartmentChange={(departmentId) => {
          if (activeTab === 'requests') {
            setRequestsFilter((prev) => ({ ...prev, departmentId, page: 1 }));
          } else if (activeTab === 'ng_transactions') {
            setNgFilter((prev) => ({ ...prev, departmentId, page: 1 }));
          } else {
            setRunnerFilter((prev) => ({ ...prev, departmentId, page: 1 }));
          }
        }}
        factoryId={activeTab === 'requests' ? requestsFilter.factoryId || '' : undefined}
        onFactoryChange={
          activeTab === 'requests'
            ? (factoryId) => setRequestsFilter((prev) => ({ ...prev, factoryId, page: 1 }))
            : undefined
        }
        departments={departments}
        factories={factories}
        onRefresh={handleRefresh}
        isLoading={isCurrentLoading}
      />

      {/* Tab Content Tables */}
      {activeTab === 'requests' && (
        <RequestManagementTable
          requests={requests}
          pagination={requestsPagination}
          onPageChange={(page) => setRequestsFilter((prev) => ({ ...prev, page }))}
          onOpenDetail={handleOpenDetail}
          onOpenUnapprove={(req) => setUnapproveTarget(req)}
          onOpenDelete={(req) => setDeleteRequestTarget(req)}
          isLoading={isLoadingRequests}
        />
      )}

      {activeTab === 'ng_transactions' && (
        <NgTransactionsTable
          transactions={ngTransactions}
          pagination={ngPagination}
          onPageChange={(page) => setNgFilter((prev) => ({ ...prev, page }))}
          onEdit={(trx) => setEditingNgTrx(trx)}
          onDelete={(trx) => setDeleteNgTrxTarget(trx)}
          isLoading={isLoadingNg}
        />
      )}

      {activeTab === 'runner_transactions' && (
        <RunnerTransactionsTable
          transactions={runnerTransactions}
          pagination={runnerPagination}
          onPageChange={(page) => setRunnerFilter((prev) => ({ ...prev, page }))}
          onEdit={(trx) => setEditingRunnerTrx(trx)}
          onDelete={(trx) => setDeleteRunnerTrxTarget(trx)}
          isLoading={isLoadingRunner}
        />
      )}

      {/* Detail Modal for Requests */}
      <RequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        detail={requestDetail}
        isLoading={isLoadingDetail}
        onOpenEditHeader={() => setIsEditHeaderModalOpen(true)}
        onOpenAddPart={() => setIsAddPartModalOpen(true)}
        onOpenEditItem={(item) => setEditingItem(item)}
        onDeleteItem={handleDeleteItem}
        onOpenUnapprove={(req) => setUnapproveTarget(req)}
        onOpenDeleteRequest={(req) => setDeleteRequestTarget(req)}
      />

      {/* Edit Request Header Modal */}
      <EditRequestHeaderModal
        isOpen={isEditHeaderModalOpen}
        onClose={() => setIsEditHeaderModalOpen(false)}
        request={requestDetail?.request || null}
        departments={departments}
        factories={factories}
        onUpdate={handleUpdateHeader}
      />

      {/* Add Part to Request Fullscreen Modal */}
      <AddPartModal
        isOpen={isAddPartModalOpen}
        onClose={() => setIsAddPartModalOpen(false)}
        request={requestDetail?.request || null}
        masterParts={masterParts}
        materials={materials}
        factories={factories}
        onAddBatch={handleAddBatchParts}
      />

      {/* Edit Request Item Modal */}
      <EditRequestItemModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        isTicketApproved={requestDetail?.request.status === 'approved'}
        onUpdate={handleUpdateItem}
      />

      {/* Unapprove Confirmation Dialog */}
      <UnapproveConfirmDialog
        isOpen={!!unapproveTarget}
        onClose={() => setUnapproveTarget(null)}
        request={unapproveTarget}
        onConfirm={handleConfirmUnapprove}
      />

      {/* Delete Request Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deleteRequestTarget}
        onClose={() => setDeleteRequestTarget(null)}
        title="Hapus Tiket Permintaan Secara Permanen"
        message="Tindakan ini akan menghapus tiket dan seluruh item part terkait. Jika tiket sudah pernah di-approve, transaksi penimbangan yang dihasilkan juga akan dibersihkan agar dashboard tetap konsisten."
        targetName={deleteRequestTarget?.request_number}
        onConfirm={handleConfirmDeleteRequest}
      />

      {/* Edit NG Transaction Modal */}
      <EditNgTransactionModal
        isOpen={!!editingNgTrx}
        onClose={() => setEditingNgTrx(null)}
        transaction={editingNgTrx}
        onUpdate={handleUpdateNgTrx}
      />

      {/* Delete NG Transaction Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deleteNgTrxTarget}
        onClose={() => setDeleteNgTrxTarget(null)}
        title="Hapus Transaksi Part NG"
        message="Apakah Anda yakin ingin menghapus transaksi Part NG ini? Rekaman penimbangan ini akan dihapus permanen dari sistem dan tidak lagi diperhitungkan di dashboard."
        targetName={
          deleteNgTrxTarget
            ? `${deleteNgTrxTarget.part_name_snapshot} (${deleteNgTrxTarget.part_number_snapshot}) - ${deleteNgTrxTarget.weight_kg} kg`
            : ''
        }
        onConfirm={handleDeleteNgTrx}
      />

      {/* Edit Runner Transaction Modal */}
      <EditRunnerTransactionModal
        isOpen={!!editingRunnerTrx}
        onClose={() => setEditingRunnerTrx(null)}
        transaction={editingRunnerTrx}
        onUpdate={handleUpdateRunnerTrx}
      />

      {/* Delete Runner Transaction Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deleteRunnerTrxTarget}
        onClose={() => setDeleteRunnerTrxTarget(null)}
        title="Hapus Transaksi Runner"
        message="Apakah Anda yakin ingin menghapus transaksi Runner ini? Rekaman penimbangan runner ini akan dihapus permanen dari sistem dan tidak lagi diperhitungkan di dashboard."
        targetName={
          deleteRunnerTrxTarget
            ? `${deleteRunnerTrxTarget.material_name_snapshot} - ${deleteRunnerTrxTarget.total_runner_weight_kg} kg`
            : ''
        }
        onConfirm={handleDeleteRunnerTrx}
      />

      {/* Toast Notification */}
      {notification && (
        <Toast
          toast={notification}
          onClose={() => {
            /* toast auto-dismisses via useDatabaseManagement or duration */
          }}
        />
      )}
      </div>
    </div>
  );
};

export default DatabaseManagementPage;
