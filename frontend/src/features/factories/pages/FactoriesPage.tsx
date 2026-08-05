import React from 'react';
import { useFactories } from '../hooks/useFactories';
import { FactoryTable } from '../components/FactoryTable';
import { FactoryModal } from '../components/FactoryModal';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Toast } from '../../../components/common/Toast';
import { Search, Plus, RefreshCw, Building2 } from 'lucide-react';

export const FactoriesPage: React.FC = () => {
  const {
    factories,
    rawCount,
    searchQuery,
    setSearchQuery,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingFactory,
    handleOpenCreateModal,
    handleOpenEditModal,
    toast,
    setToast,
    fetchFactories,
    handleCreateFactory,
    handleUpdateFactory,
    handleDeleteFactory,
  } = useFactories();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Pabrik Terdaftar
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-color)', marginTop: '0.25rem' }}>
                {rawCount}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lokasi Operasional PT Sugity</span>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary-color)' }}>
              <Building2 size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Action Header Card */}
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
          <div style={{ flex: 1, minWidth: '260px', maxWidth: '400px' }}>
            <Input
              placeholder="Cari kode, nama, atau lokasi pabrik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button
              variant="outline"
              onClick={fetchFactories}
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
              Tambah Pabrik
            </Button>
          </div>
        </div>
      </Card>

      {/* Factories Table Card */}
      <Card
        title="Daftar Master Pabrik (Factory Locations)"
        subtitle={`Menampilkan ${factories.length} dari ${rawCount} lokasi pabrik PT Sugity Creatives`}
      >
        <FactoryTable
          factories={factories}
          isLoading={isLoading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteFactory}
        />
      </Card>

      {/* Create / Edit Factory Modal */}
      <FactoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingFactory={editingFactory}
        onCreateSubmit={handleCreateFactory}
        onUpdateSubmit={handleUpdateFactory}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
