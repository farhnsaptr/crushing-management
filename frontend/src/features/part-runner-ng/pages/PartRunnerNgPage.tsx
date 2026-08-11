import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRunnerImport } from '../hooks/useRunnerImport';
import { useRunnerDetail } from '../hooks/useRunnerDetail';
import { RunnerCsvUploadCard } from '../components/RunnerCsvUploadCard';
import { RunnerManualFormCard } from '../components/RunnerManualFormCard';
import { RunnerImportPreviewModal } from '../components/RunnerImportPreviewModal';
import { RunnerMaterialEditModal } from '../components/RunnerMaterialEditModal';
import { RunnerDeleteAllModal } from '../components/RunnerDeleteAllModal';
import { RunnerMaterialSortedList } from '../components/RunnerMaterialSortedList';
import { RunnerMaterialDetailModal } from '../components/RunnerMaterialDetailModal';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Toast } from '../../../components/common/Toast';
import { Badge } from '../../../components/common/Badge';
import {
  History,
  Layers,
  FileSpreadsheet,
  PlusCircle,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

export const PartRunnerNgPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super-admin';
  const isAdminOrSuperAdmin = user?.role === 'super-admin' || user?.role === 'admin';

  // Main Page Tabs: 'catat' (Input / Record Form & History) vs 'detail' (Material Analytics & Monthly Charts)
  const [activeMainTab, setActiveMainTab] = useState<'catat' | 'detail'>('catat');

  // Hook for Input & History
  const {
    entryMode,
    setEntryMode,
    selectedFile,
    isLoading,
    isSaving,
    parseError,
    handleFileSelect,
    handleClearFile,
    handleProcessFile,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleConfirmSave,
    handleSaveManualBatch,
    historyRecords = [],
    isLoadingHistory,
    page,
    setPage,
    limit,
    setLimit,
    totalRecords,
    totalPages,
    editingRecord,
    setEditingRecord,
    isEditingModalOpen,
    setIsEditingModalOpen,
    isDeletingAllModalOpen,
    setIsDeletingAllModalOpen,
    isActionLoading,
    handleUpdateRecord,
    handleDeleteRecord,
    handleDeleteAllRecords,
    toast,
    setToast,
    fetchHistory,
  } = useRunnerImport();

  // Hook for Analytics Summary & Monthly Chart Detail Modal
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    summaryData,
    isLoadingSummary,
    fetchSummary,
    sortedMaterials,
    isModalOpen: isDetailModalOpen,
    openMaterialDetail,
    closeModal: closeDetailModal,
    materialDetailData,
    isLoadingDetail,
  } = useRunnerDetail();

  const safeRecords = Array.isArray(historyRecords) ? historyRecords : [];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleString('id-ID');
    } catch {
      return String(dateStr);
    }
  };

  const startRecordNumber = (page - 1) * limit + 1;
  const endRecordNumber = Math.min(page * limit, totalRecords);

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
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main, #0f172a)' }}>
              Input Part Runner NG
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
              Pencatatan data runner material (CSV & Manual) serta analisis rincian agregasi dan tren bulanan.
            </p>
          </div>
        </div>

        {/* Top Main Tab Navigation (Catat vs Detail) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-main, #f1f5f9)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-color, #cbd5e1)',
          }}
        >
          <button
            onClick={() => setActiveMainTab('catat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: '0.875rem',
              fontWeight: activeMainTab === 'catat' ? 800 : 600,
              backgroundColor: activeMainTab === 'catat' ? 'var(--secondary-color, #e76114)' : 'transparent',
              color: activeMainTab === 'catat' ? '#ffffff' : 'var(--text-muted, #64748b)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <PlusCircle size={16} />
            <span>Catat Part Runner NG</span>
          </button>

          <button
            onClick={() => {
              setActiveMainTab('detail');
              fetchSummary();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: '0.875rem',
              fontWeight: activeMainTab === 'detail' ? 800 : 600,
              backgroundColor: activeMainTab === 'detail' ? 'var(--secondary-color, #e76114)' : 'transparent',
              color: activeMainTab === 'detail' ? '#ffffff' : 'var(--text-muted, #64748b)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <BarChart3 size={16} />
            <span>Detail Input Runner</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CATAT PART RUNNER NG */}
      {activeMainTab === 'catat' && (
        <>
          {/* Mode Switcher Sub-Bar (CSV Import vs Manual Form) */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              borderBottom: '2px solid var(--border-color, #e2e8f0)',
              paddingBottom: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => setEntryMode('csv')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md, 8px)',
                fontSize: '0.9rem',
                fontWeight: entryMode === 'csv' ? 800 : 600,
                backgroundColor: entryMode === 'csv' ? 'var(--secondary-color, #e76114)' : 'transparent',
                color: entryMode === 'csv' ? '#ffffff' : 'var(--text-muted, #64748b)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <FileSpreadsheet size={18} />
              <span>Import CSV Produksi</span>
            </button>

            <button
              onClick={() => setEntryMode('manual')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md, 8px)',
                fontSize: '0.9rem',
                fontWeight: entryMode === 'manual' ? 800 : 600,
                backgroundColor: entryMode === 'manual' ? 'var(--secondary-color, #e76114)' : 'transparent',
                color: entryMode === 'manual' ? '#ffffff' : 'var(--text-muted, #64748b)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <PlusCircle size={18} />
              <span>Tambah Manual Runner</span>
            </button>
          </div>

          {/* Mode Content: CSV Upload vs Manual Form */}
          {entryMode === 'csv' ? (
            <RunnerCsvUploadCard
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onClearFile={handleClearFile}
              onProcessFile={handleProcessFile}
              isLoading={isLoading}
              parseError={parseError}
            />
          ) : (
            <RunnerManualFormCard
              onSubmitManualBatch={async (payload) => {
                await handleSaveManualBatch(payload);
                fetchSummary();
              }}
              isLoading={isSaving}
            />
          )}

          {/* Interactive Preview Modal (for CSV mode) */}
          <RunnerImportPreviewModal
            isOpen={previewModalOpen}
            onClose={() => setPreviewModalOpen(false)}
            previewData={previewData}
            onConfirmSave={async () => {
              await handleConfirmSave();
              fetchSummary();
            }}
            isSaving={isSaving}
          />

          {/* History of Material Runner Records */}
          <Card style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <History size={20} color="var(--primary-color, #008d51)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main, #1e293b)' }}>
                  Riwayat Pencatatan Runner Material
                </h3>
              </div>
              <Badge variant="info">Total {totalRecords} Record Data</Badge>
            </div>

            {isLoadingHistory ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
                Memuat riwayat pencatatan runner material...
              </div>
            ) : safeRecords.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  color: 'var(--text-muted, #64748b)',
                  backgroundColor: 'var(--bg-main, #f8fafc)',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px dashed var(--border-color, #cbd5e1)',
                }}
              >
                Belum ada riwayat pencatatan runner material. Silakan gunakan opsi import CSV atau tambah manual di atas.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
                        <th style={{ padding: '0.65rem 0.85rem' }}>No</th>
                        <th style={{ padding: '0.65rem 0.85rem' }}>Tanggal Produksi</th>
                        <th style={{ padding: '0.65rem 0.85rem' }}>Nama Material</th>
                        <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Total Runner (kg)</th>
                        <th style={{ padding: '0.65rem 0.85rem' }}>Batch / Sumber</th>
                        <th style={{ padding: '0.65rem 0.85rem' }}>Waktu Input</th>
                        {isAdminOrSuperAdmin && (
                          <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Aksi</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {safeRecords.map((rec, idx) => (
                        <tr key={rec.id || idx} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                          <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted, #64748b)' }}>
                            {(page - 1) * limit + idx + 1}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                            {rec.transaction_date || '-'}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: 'var(--primary-color, #008d51)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Layers size={15} />
                              <span>{rec.material_name_snapshot || 'Material'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                            {Number(rec.total_runner_weight_kg || 0).toFixed(3)} kg
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                            <code>{rec.import_batch_ref || '-'}</code>
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                            {formatDate(rec.created_at)}
                          </td>
                          {isAdminOrSuperAdmin && (
                            <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    setEditingRecord(rec);
                                    setIsEditingModalOpen(true);
                                  }}
                                  disabled={isActionLoading}
                                  title="Edit Data"
                                  leftIcon={<Edit2 size={13} />}
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={async () => {
                                    await handleDeleteRecord(rec.id);
                                    fetchSummary();
                                  }}
                                  disabled={isActionLoading}
                                  title="Hapus Data"
                                  leftIcon={<Trash2 size={13} />}
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                >
                                  Hapus
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.85rem',
                    borderTop: '1px solid var(--border-color, #e2e8f0)',
                    paddingTop: '0.85rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-muted, #64748b)' }}>
                    <span>
                      Menampilkan <strong>{startRecordNumber} - {endRecordNumber}</strong> dari <strong>{totalRecords}</strong> data
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>| Tampilkan per hal:</span>
                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1);
                        }}
                        style={{
                          padding: '0.25rem 0.4rem',
                          borderRadius: 'var(--radius-sm, 4px)',
                          border: '1px solid var(--border-color, #cbd5e1)',
                          backgroundColor: 'var(--bg-card, #ffffff)',
                          color: 'var(--text-main, #0f172a)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  {/* Page Navigator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page <= 1 || isLoadingHistory}
                      leftIcon={<ChevronLeft size={16} />}
                    >
                      Prev
                    </Button>

                    <span style={{ fontWeight: 800, color: 'var(--text-main, #0f172a)', padding: '0 0.4rem' }}>
                      Halaman {page} dari {totalPages}
                    </span>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page >= totalPages || isLoadingHistory}
                      rightIcon={<ChevronRight size={16} />}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                {/* Bottom Actions Area (Super-Admin Bulk Delete All Button) */}
                {isSuperAdmin && totalRecords > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.75rem',
                      padding: '0.85rem 1.15rem',
                      borderRadius: 'var(--radius-md, 8px)',
                      backgroundColor: 'rgba(239, 68, 68, 0.06)',
                      border: '1px dashed rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontSize: '0.825rem' }}>
                      <AlertTriangle size={18} />
                      <span>
                        <strong>Area Super-Admin:</strong> Hapus seluruh {totalRecords} data pencatatan runner material sekaligus.
                      </span>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setIsDeletingAllModalOpen(true)}
                      disabled={isActionLoading}
                      leftIcon={<Trash2 size={16} />}
                    >
                      Hapus Semua Data ({totalRecords})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </>
      )}

      {/* TAB 2: DETAIL INPUT RUNNER (Summary Sorted List & Monthly Trend Charts) */}
      {activeMainTab === 'detail' && (
        <RunnerMaterialSortedList
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          summaryData={summaryData}
          isLoading={isLoadingSummary}
          sortedMaterials={sortedMaterials}
          onSelectMaterial={openMaterialDetail}
        />
      )}

      {/* Detail Analytics Modal for Selected Material */}
      <RunnerMaterialDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        materialDetail={materialDetailData}
        isLoading={isLoadingDetail}
        isAdminOrSuperAdmin={isAdminOrSuperAdmin}
        onEditRecord={(rec) => {
          setEditingRecord(rec);
          setIsEditingModalOpen(true);
        }}
        onDeleteRecord={async (id) => {
          await handleDeleteRecord(id);
          if (materialDetailData?.materialName) {
            openMaterialDetail(materialDetailData.materialName);
          }
          fetchSummary();
        }}
      />

      {/* Edit Record Modal (Super-Admin & Admin) */}
      <RunnerMaterialEditModal
        isOpen={isEditingModalOpen}
        onClose={() => {
          setIsEditingModalOpen(false);
          setEditingRecord(null);
        }}
        record={editingRecord}
        onSave={async (id, payload) => {
          await handleUpdateRecord(id, payload);
          fetchSummary();
        }}
        isLoading={isActionLoading}
      />

      {/* Delete All Confirmation Modal (Super-Admin only) */}
      <RunnerDeleteAllModal
        isOpen={isDeletingAllModalOpen}
        onClose={() => setIsDeletingAllModalOpen(false)}
        onConfirmDeleteAll={async () => {
          await handleDeleteAllRecords();
          fetchSummary();
        }}
        totalRecordsCount={totalRecords}
        isLoading={isActionLoading}
      />
    </div>
  );
};
