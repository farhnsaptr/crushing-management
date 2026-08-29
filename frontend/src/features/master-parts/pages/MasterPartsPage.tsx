import React from 'react';
import { useMasterParts } from '../hooks/useMasterParts';
import { MasterPartsTable } from '../components/MasterPartsTable';
import { MasterPartImageViewerCard } from '../components/MasterPartImageViewerCard';
import { MasterPartDetailModal } from '../components/MasterPartDetailModal';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { MasterPartUploadModal } from '../components/MasterPartUploadModal';
import { MasterPartImportPreviewModal } from '../components/MasterPartImportPreviewModal';
import { MasterPartModal } from '../components/MasterPartModal';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Toast } from '../../../components/common/Toast';
import { useAuth } from '../../../context/AuthContext';
import { Search, Plus, RefreshCw, Upload, Download, FileSpreadsheet, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

export const MasterPartsPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super-admin';

  const {
    parts,
    machines,
    page,
    setPage,
    total,
    totalPages,
    searchQuery,
    setSearchQuery,
    selectedJenis,
    setSelectedJenis,
    jenisList,
    sortBy,
    sortOrder,
    handleSort,
    isLoading,
    isUploading,
    isCommitting,
    selectedPart,
    draftImagePreview,
    isSubmittingImage,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    isCameraModalOpen,
    setIsCameraModalOpen,
    editingPart,
    detailPart,
    previewData,
    handleSelectPart,
    handleOpenDetailModal,
    handleCaptureImage,
    handleSelectImageFile,
    handleSubmitDraftImage,
    handleCancelDraftImage,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCreatePart,
    handleUpdatePart,
    handleDeletePart,
    handleDeleteAllParts,
    handlePreviewImportFile,
    handleCommitImport,
    handleDownloadTemplate,
    handleExportExcel,
    fetchParts,
    toast,
    setToast,
  } = useMasterParts();

  // Helper to generate page numbers with ellipsis
  const getPageNumbers = (current: number, totalPagesCount: number) => {
    const pages: (number | string)[] = [];
    if (totalPagesCount <= 7) {
      for (let i = 1; i <= totalPagesCount; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(totalPagesCount - 1, current + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (current < totalPagesCount - 2) pages.push('...');
      pages.push(totalPagesCount);
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Metric Overview & Quick Actions Header Bar */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            {/* Search Input & Jenis Filter */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <div style={{ minWidth: '220px', flex: 1, maxWidth: '320px' }}>
                <Input
                  placeholder="Cari model, part number, nama, sebango..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  leftIcon={<Search size={18} />}
                />
              </div>

              <select
                value={selectedJenis}
                onChange={(e) => {
                  setSelectedJenis(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '0.625rem 0.75rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              >
                <option value="all">Semua Jenis Part ({jenisList.length})</option>
                {jenisList.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons Group */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
              {isSuperAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteAllParts}
                  style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
                  leftIcon={<Trash2 size={15} />}
                  title="Hapus Seluruh Data Master Parts dari Database"
                >
                  Hapus Semua Part
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={fetchParts}
                isLoading={isLoading}
                leftIcon={<RefreshCw size={15} />}
                title="Refresh Data"
              >
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                leftIcon={<Download size={15} />}
                title="Export Seluruh Data Master Parts ke Excel"
              >
                Export Excel
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                leftIcon={<FileSpreadsheet size={15} />}
                title="Unduh Format Template Excel"
              >
                Unduh Template
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                leftIcon={<Upload size={15} />}
              >
                Import Excel
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreateModal}
                leftIcon={<Plus size={16} />}
              >
                Tambah Manual
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Split Layout: Left Table (~60-65%), Right 16:9 Image Card (~35-40%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left Side: Master Parts Table Card */}
        <div style={{ flex: '1 1 60%' }}>
          <Card
            title="Daftar Master Data Parts"
            subtitle={`Menampilkan Halaman ${page} dari ${totalPages} (Total ${total} item)`}
          >
            {/* Top Numbered Pagination Bar */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  paddingBottom: '0.85rem',
                  borderBottom: '1px solid var(--border-color)',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Halaman {page} dari {totalPages}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    leftIcon={<ChevronLeft size={16} />}
                  >
                    Sebelumnya
                  </Button>

                  {getPageNumbers(page, totalPages).map((pNum, idx) => {
                    if (pNum === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} style={{ padding: '0 0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          ...
                        </span>
                      );
                    }
                    const isCurrent = pNum === page;
                    return (
                      <Button
                        key={`page-${pNum}`}
                        variant={isCurrent ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pNum as number)}
                        style={{
                          minWidth: '34px',
                          padding: '0.35rem 0.5rem',
                          fontWeight: isCurrent ? 800 : 500,
                        }}
                      >
                        {pNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    rightIcon={<ChevronRight size={16} />}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}

            <MasterPartsTable
              parts={parts}
              isLoading={isLoading}
              selectedPartId={selectedPart?.id || null}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onSelectPart={handleSelectPart}
              onOpenDetailModal={handleOpenDetailModal}
              onEdit={handleOpenEditModal}
              onDelete={handleDeletePart}
            />
          </Card>
        </div>

        {/* Right Side: 16:9 Image Viewer & Camera Capture Card */}
        <div style={{ flex: '1 1 38%', position: 'sticky', top: '1.5rem' }}>
          <MasterPartImageViewerCard
            selectedPart={selectedPart}
            draftImagePreview={draftImagePreview}
            isSubmittingImage={isSubmittingImage}
            onSubmitDraftPhoto={handleSubmitDraftImage}
            onCancelDraftPhoto={handleCancelDraftImage}
            onLaunchDesktopCamera={() => setIsCameraModalOpen(true)}
            onCaptureImage={handleCaptureImage}
            onSelectImageFile={handleSelectImageFile}
            onOpenDetailModal={handleOpenDetailModal}
          />
        </div>
      </div>

      {/* Modals */}
      {/* 1. Technical Detail Viewer Modal */}
      <MasterPartDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        part={detailPart}
        onEdit={handleOpenEditModal}
      />

      {/* 2. WebRTC Desktop Camera Live Stream Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCaptureImage}
      />

      {/* 3. Upload File Excel Modal */}
      <MasterPartUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadFile={handlePreviewImportFile}
        onDownloadTemplate={handleDownloadTemplate}
        isUploading={isUploading}
      />

      {/* 4. Modal Data Viewer / Preview Table Pra-Impor */}
      <MasterPartImportPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        previewData={previewData}
        onCommitImport={handleCommitImport}
        isCommitting={isCommitting}
      />

      {/* 5. Create / Edit Master Part Single Entry Modal */}
      <MasterPartModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        editingPart={editingPart}
        machines={machines}
        onCreateSubmit={handleCreatePart}
        onUpdateSubmit={handleUpdatePart}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
