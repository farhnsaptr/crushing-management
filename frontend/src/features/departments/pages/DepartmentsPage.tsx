import React from 'react';
import { useDepartments } from '../hooks/useDepartments';
import { DepartmentTable } from '../components/DepartmentTable';
import { DepartmentModal } from '../components/DepartmentModal';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Toast } from '../../../components/common/Toast';
import { Search, PlusCircle, RefreshCw, Network } from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const {
    departments,
    rawCount,
    isLoading,
    searchQuery,
    setSearchQuery,
    isModalOpen,
    setIsModalOpen,
    editingDepartment,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCreateDepartment,
    handleUpdateDepartment,
    handleDeleteDepartment,
    fetchDepartments,
    toast,
    setToast,
  } = useDepartments();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
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
            <Network size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main, #0f172a)' }}>
              Department Management
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
              Kelola master data departemen asal pengiriman part NG dan runner material.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="outline"
            onClick={fetchDepartments}
            isLoading={isLoading}
            leftIcon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            leftIcon={<PlusCircle size={18} />}
          >
            Tambah Departemen
          </Button>
        </div>
      </div>

      {/* Filter / Search Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px', maxWidth: '400px' }}>
            <Input
              placeholder="Cari kode, nama, atau deskripsi departemen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
        </div>
      </Card>

      {/* Departments Table Card */}
      <Card
        title="Daftar Departemen"
        subtitle={`Menampilkan ${departments.length} dari ${rawCount} total departemen terdaftar`}
      >
        <DepartmentTable
          departments={departments}
          isLoading={isLoading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteDepartment}
        />
      </Card>

      {/* Create / Edit Department Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingDepartment={editingDepartment}
        onCreateSubmit={handleCreateDepartment}
        onUpdateSubmit={handleUpdateDepartment}
      />

      {/* Toast Notification */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
};
