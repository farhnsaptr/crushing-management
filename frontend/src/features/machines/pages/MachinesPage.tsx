import React from 'react';
import { useMachines } from '../hooks/useMachines';
import { MachineTable } from '../components/MachineTable';
import { MachineModal } from '../components/MachineModal';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Toast } from '../../../components/common/Toast';
import { useAuth } from '../../../context/AuthContext';
import { Search, Plus, RefreshCw, Cpu, CheckCircle2, XCircle, Filter, Trash2 } from 'lucide-react';

export const MachinesPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super-admin';

  const {
    machines,
    factories,
    rawCount,
    activeCount,
    inactiveCount,
    searchQuery,
    setSearchQuery,
    selectedFactoryId,
    setSelectedFactoryId,
    selectedStatus,
    setSelectedStatus,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingMachine,
    handleOpenCreateModal,
    handleOpenEditModal,
    toast,
    setToast,
    fetchInitialData,
    handleCreateMachine,
    handleUpdateMachine,
    handleDeleteMachine,
    handleDeleteAllMachines,
  } = useMachines();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {/* Total Machines */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Mesin
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-color)', marginTop: '0.25rem' }}>
                {rawCount}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mesin Injection Mold</span>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary-color)' }}>
              <Cpu size={24} />
            </div>
          </div>
        </Card>

        {/* Active Machines */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Mesin Aktif
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981', marginTop: '0.25rem' }}>
                {activeCount}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Siap Beroperasi Produksi</span>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', color: '#10b981' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
        </Card>

        {/* Inactive Machines */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Mesin Non-Aktif
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ef4444', marginTop: '0.25rem' }}>
                {inactiveCount}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Non-Aktif / Maintenance</span>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', color: '#ef4444' }}>
              <XCircle size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Action Header & Filtering Card */}
      <Card>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Filter Controls Group */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            {/* Search Input */}
            <div style={{ minWidth: '220px', flex: 1, maxWidth: '320px' }}>
              <Input
                placeholder="Cari kode, nama, atau tonase mesin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={18} />}
              />
            </div>

            {/* Factory Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="var(--text-muted)" />
              <select
                value={selectedFactoryId}
                onChange={(e) => setSelectedFactoryId(e.target.value)}
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
                <option value="all">Semua Pabrik</option>
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.code} - {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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
              <option value="all">Semua Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isSuperAdmin && (
              <Button
                variant="ghost"
                onClick={handleDeleteAllMachines}
                style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
                leftIcon={<Trash2 size={16} />}
                title="Hapus Seluruh Data Mesin dari Database"
              >
                Hapus Semua Mesin
              </Button>
            )}

            <Button
              variant="outline"
              onClick={fetchInitialData}
              isLoading={isLoading}
              leftIcon={<RefreshCw size={16} />}
              title="Refresh Data"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenCreateModal}
              leftIcon={<Plus size={18} />}
            >
              Tambah Mesin
            </Button>
          </div>
        </div>
      </Card>

      {/* Machines Table Card */}
      <Card
        title="Daftar Master Mesin Injection Molding"
        subtitle={`Menampilkan ${machines.length} dari ${rawCount} unit mesin injection molding`}
      >
        <MachineTable
          machines={machines}
          isLoading={isLoading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteMachine}
        />
      </Card>

      {/* Create / Edit Machine Modal */}
      <MachineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingMachine={editingMachine}
        factories={factories}
        onCreateSubmit={handleCreateMachine}
        onUpdateSubmit={handleUpdateMachine}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
