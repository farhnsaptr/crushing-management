import React from 'react';
import { Table } from '../../../components/common/Table';
import type { Column } from '../../../components/common/Table';
import { Button } from '../../../components/common/Button';
import { Pencil, Trash2, Layers } from 'lucide-react';
import type { MixedMaterial } from '../types/mixedMaterials.types';

interface MixedMaterialsTableProps {
  items: MixedMaterial[];
  isLoading: boolean;
  onEdit: (item: MixedMaterial) => void;
  onDelete: (item: MixedMaterial) => void;
  onViewMembers: (item: MixedMaterial) => void;
}

export const MixedMaterialsTable: React.FC<MixedMaterialsTableProps> = ({
  items,
  isLoading,
  onEdit,
  onDelete,
  onViewMembers,
}) => {
  const columns: Column<MixedMaterial>[] = [
    {
      header: 'Nama Material Campuran',
      accessorKey: 'mixed_name',
      cell: (m) => <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{m.mixed_name}</span>,
      width: '240px',
    },
    {
      header: 'Jenis Recycle',
      accessorKey: 'recycle_type',
      cell: (m) => {
        const isNoReuse = m.recycle_type === 'no_reuse';
        return (
          <span style={{ fontWeight: 800, color: isNoReuse ? '#ef4444' : '#10b981', fontSize: '0.85rem' }}>
            {isNoReuse ? 'No Reuse (Waste)' : 'Reuse (Recycle)'}
          </span>
        );
      },
      width: '170px',
    },
    {
      header: 'Anggota',
      cell: (m) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewMembers(m)}
          leftIcon={<Layers size={13} />}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}
          title="Lihat material yang dicampur ke material ini"
        >
          {m.members_count} Material
        </Button>
      ),
      width: '150px',
    },
    {
      header: 'Deskripsi / Catatan',
      accessorKey: 'description',
      cell: (m) => <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.description || '-'}</span>,
    },
    {
      header: 'Aksi',
      cell: (m) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(m)}
            leftIcon={<Pencil size={14} />}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(m)}
            style={{ color: '#ef4444', padding: '0.25rem 0.4rem' }}
            title="Hapus Material Campuran"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      ),
      width: '130px',
    },
  ];

  return (
    <Table
      columns={columns}
      data={items}
      isLoading={isLoading}
      emptyMessage="Belum ada material campuran. Klik 'Tambah Material Campuran' untuk membuat."
      keyExtractor={(row) => row.id}
    />
  );
};
