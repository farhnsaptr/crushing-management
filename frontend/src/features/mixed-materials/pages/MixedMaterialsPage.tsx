import React from 'react';
import { useMixedMaterials } from '../hooks/useMixedMaterials';
import { MixedMaterialsTable } from '../components/MixedMaterialsTable';
import { MixedMaterialModal } from '../components/MixedMaterialModal';
import { MixedMaterialMembersModal } from '../components/MixedMaterialMembersModal';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Toast } from '../../../components/common/Toast';
import { Search, Plus, RefreshCw } from 'lucide-react';

export const MixedMaterialsPage: React.FC = () => {
  const m = useMixedMaterials();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ minWidth: '240px', flex: 1, maxWidth: '360px' }}>
            <Input
              placeholder="Cari nama material campuran..."
              value={m.searchQuery}
              onChange={(e) => m.setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
            <Button variant="outline" size="sm" onClick={m.fetchItems} isLoading={m.isLoading} leftIcon={<RefreshCw size={15} />}>
              Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={m.openCreate} leftIcon={<Plus size={16} />}>
              Tambah Material Campuran
            </Button>
          </div>
        </div>
      </Card>

      <Card
        title="Daftar Material Campuran"
        subtitle="Material asli dimasukkan ke campuran lewat menu edit Master Material. Transaksi baru material tersebut dicatat atas nama campuran."
      >
        <MixedMaterialsTable
          items={m.items}
          isLoading={m.isLoading}
          onEdit={m.openEdit}
          onDelete={m.handleDelete}
          onViewMembers={m.viewMembers}
        />
      </Card>

      <MixedMaterialModal
        isOpen={m.isModalOpen}
        onClose={() => m.setIsModalOpen(false)}
        editing={m.editing}
        onSubmit={m.handleSubmit}
      />
      <MixedMaterialMembersModal
        isOpen={m.isMembersOpen}
        onClose={m.closeMembers}
        data={m.membersData}
        isLoading={m.isLoadingMembers}
      />
      {m.toast && <Toast toast={m.toast} onClose={() => m.setToast(null)} />}
    </div>
  );
};
