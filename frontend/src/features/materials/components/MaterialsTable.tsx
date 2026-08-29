import React from 'react';
import type { Material } from '../types/materials.types';
import { Table, type Column } from '../../../components/common/Table';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Pencil, Trash2, Eye } from 'lucide-react';

interface MaterialsTableProps {
  materials: Material[];
  isLoading: boolean;
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
  onViewParts: (material: Material) => void;
}

export const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materials,
  isLoading,
  onEdit,
  onDelete,
  onViewParts,
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
      width: '220px',
    },
    {
      header: 'Jenis Recycle',
      accessorKey: 'recycle_type',
      cell: (m) => {
        const isNoReuse = m.recycle_type === 'no_reuse';
        return (
          <span style={{ fontWeight: 800, color: isNoReuse ? '#ef4444' : '#10b981', fontSize: '0.85rem' }}>
            {isNoReuse ? 'Part No Reuse (Waste)' : 'Part Reuse (Recycle)'}
          </span>
        );
      },
      width: '180px',
    },
    {
      header: 'Part yang Digunakan',
      cell: (m) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant={m.used_parts_count && m.used_parts_count > 0 ? 'info' : 'secondary'}>
            {m.used_parts_count || 0} Part
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewParts(m)}
            leftIcon={<Eye size={13} />}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}
            title="Lihat rincian part yang menggunakan material ini"
          >
            Detail Part
          </Button>
        </div>
      ),
      width: '210px',
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
      header: 'Aksi',
      cell: (m) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(m)}
            leftIcon={<Pencil size={14} />}
            title="Edit Material"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(m.id)}
            style={{ color: '#ef4444', padding: '0.25rem 0.4rem' }}
            title="Hapus Material"
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
      data={materials}
      isLoading={isLoading}
      emptyMessage="Belum ada data master material terdaftar."
      keyExtractor={(row) => row.id}
    />
  );
};
