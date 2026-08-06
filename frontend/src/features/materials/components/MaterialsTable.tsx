import React from 'react';
import type { Material } from '../types/materials.types';
import { Table, type Column } from '../../../components/common/Table';
import { Button } from '../../../components/common/Button';
import { Pencil, Trash2 } from 'lucide-react';

interface MaterialsTableProps {
  materials: Material[];
  isLoading: boolean;
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
}

export const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materials,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const columns: Column<Material>[] = [
    {
      header: 'Nama Material Resin',
      accessorKey: 'material_name',
      cell: (m) => (
        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
          {m.material_name}
        </span>
      ),
      width: '240px',
    },
    {
      header: 'Deskripsi / Catatan',
      accessorKey: 'description',
      cell: (m) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {m.description || '-'}
        </span>
      ),
    },
    {
      header: 'Tanggal Didaftarkan',
      accessorKey: 'created_at',
      cell: (m) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {m.created_at ? new Date(m.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
        </span>
      ),
      width: '160px',
    },
    {
      header: 'Aksi',
      cell: (m) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(m)}
            leftIcon={<Pencil size={15} />}
            title="Edit Material"
          >
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(m.id)}
            style={{ color: '#ef4444' }}
            title="Hapus Material"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
      width: '140px',
    },
  ];

  return (
    <Table
      columns={columns}
      data={materials}
      isLoading={isLoading}
      emptyMessage="Belum ada data master material terdaftar."
      keyExtractor={(row) => row.id}
    />
  );
};
