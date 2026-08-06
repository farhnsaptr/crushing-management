import React from 'react';
import { useMasterParts } from '../hooks/useMasterParts';
import { MasterPartsTable } from '../components/MasterPartsTable';
import { MasterPartUploadModal } from '../components/MasterPartUploadModal';
import { MasterPartImportPreviewModal } from '../components/MasterPartImportPreviewModal';
import { MasterPartModal } from '../components/MasterPartModal';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Toast } from '../../../components/common/Toast';
import { useAuth } from '../../../context/AuthContext';
import { Search, Plus, RefreshCw, Upload, Download, FileSpreadsheet, Package, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

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
    isLoading,
    isUploading,
    isCommitting,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingPart,
    previewData,
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
  const getPageNumbers = (current: number, total: number) => {
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metric Overview Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Master Parts Terdaftar
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-color)', marginTop: '0.25rem' }}>
                {total}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sebango & Mold Items Active</span>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary-color)' }}>
              <Package size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Action Header & Filtering Bar */}
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
                  placeholder="Cari part number, name, sebango..."
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
                <option value="all">Semua Jenis Part</option>
                <option value="BUMPER">BUMPER</option>
                <option value="GRILLE">GRILLE</option>
                <option value="DOOR TRIM">DOOR TRIM</option>
                <option value="QUARTER TRIM">QUARTER TRIM</option>
                <option value="GARNISH">GARNISH</option>
                <option value="SPOILER">SPOILER</option>
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

      {/* Master Parts Table Card */}
      <Card
        title="Daftar Master Data Parts & Mould"
        subtitle={`Menampilkan Halaman ${page} dari ${totalPages} (Total ${total} item)`}
      >
        {/* Pagination Navigation Bar Above Table */}
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

        <MasterPartsTable
          parts={parts}
          isLoading={isLoading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeletePart}
        />
      </Card>

      {/* 1. Upload File Excel Modal */}
      <MasterPartUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadFile={handlePreviewImportFile}
        onDownloadTemplate={handleDownloadTemplate}
        isUploading={isUploading}
      />

      {/* 2. Modal Data Viewer / Preview Table Pra-Impor */}
      <MasterPartImportPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        previewData={previewData}
        onCommitImport={handleCommitImport}
        isCommitting={isCommitting}
      />

      {/* 3. Create / Edit Master Part Single Entry Modal */}
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
