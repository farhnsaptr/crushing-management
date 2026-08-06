import React from 'react';
import { useMaterials } from '../hooks/useMaterials';
import { MaterialsTable } from '../components/MaterialsTable';
import { MaterialModal } from '../components/MaterialModal';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Toast } from '../../../components/common/Toast';
import { useAuth } from '../../../context/AuthContext';
import { Search, Plus, RefreshCw, Layers, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

export const MaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super-admin';

  const {
    materials,
    page,
    setPage,
    total,
    totalPages,
    searchQuery,
    setSearchQuery,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingMaterial,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCreateMaterial,
    handleUpdateMaterial,
    handleDeleteMaterial,
    handleDeleteAllMaterials,
    fetchMaterials,
    toast,
    setToast,
  } = useMaterials();

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metric Overview Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Master Material Resin
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-color)', marginTop: '0.25rem' }}>
                {total}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bahan Baku Injection Plastics</span>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary-color)' }}>
              <Layers size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Action Header & Search Bar */}
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
            {/* Search Input */}
            <div style={{ minWidth: '240px', flex: 1, maxWidth: '360px' }}>
              <Input
                placeholder="Cari nama material..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                leftIcon={<Search size={18} />}
              />
            </div>

            {/* Action Buttons Group */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
              {isSuperAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteAllMaterials}
                  style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
                  leftIcon={<Trash2 size={15} />}
                  title="Hapus Seluruh Data Material dari Database"
                >
                  Hapus Semua Material
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={fetchMaterials}
                isLoading={isLoading}
                leftIcon={<RefreshCw size={15} />}
                title="Refresh Data"
              >
                Refresh
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreateModal}
                leftIcon={<Plus size={16} />}
              >
                Tambah Material
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Materials Table Card */}
      <Card
        title="Daftar Master Material Resin"
        subtitle={`Menampilkan Halaman ${page} dari ${totalPages} (Total ${total} item)`}
      >
        {/* Pagination Controls Above Table */}
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

        <MaterialsTable
          materials={materials}
          isLoading={isLoading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteMaterial}
        />
      </Card>

      {/* Material Modal */}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingMaterial={editingMaterial}
        onCreateSubmit={handleCreateMaterial}
        onUpdateSubmit={handleUpdateMaterial}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
