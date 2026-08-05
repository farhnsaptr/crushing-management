import React from 'react';
import type { Factory } from '../types/factories.types';
import { Table, type Column } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Pencil, Trash2, MapPin } from 'lucide-react';

interface FactoryTableProps {
  factories: Factory[];
  isLoading: boolean;
  onEdit: (factory: Factory) => void;
  onDelete: (id: string) => void;
}

export const FactoryTable: React.FC<FactoryTableProps> = ({
  factories,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const columns: Column<Factory>[] = [
    {
      header: 'Kode Pabrik',
      accessorKey: 'code',
      cell: (factory) => (
        <Badge variant="primary" size="md">
          {factory.code}
        </Badge>
      ),
      width: '130px',
    },
    {
      header: 'Nama Pabrik',
      accessorKey: 'name',
      cell: (factory) => (
        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
          {factory.name}
        </span>
      ),
    },
    {
      header: 'Lokasi / Alamat',
      accessorKey: 'location',
      cell: (factory) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)' }}>
          <MapPin size={15} style={{ flexShrink: 0 }} />
          <span>{factory.location || 'Lokasi belum diatur'}</span>
        </div>
      ),
    },
    {
      header: 'Tanggal Terdaftar',
      accessorKey: 'created_at',
      cell: (factory) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {factory.created_at
            ? new Date(factory.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '-'}
        </span>
      ),
      width: '160px',
    },
    {
      header: 'Aksi',
      cell: (factory) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(factory)}
            leftIcon={<Pencil size={15} />}
            title="Edit Pabrik"
          >
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(factory.id)}
            style={{ color: '#ef4444' }}
            title="Hapus Pabrik"
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
      data={factories}
      isLoading={isLoading}
      emptyMessage="Belum ada data pabrik terdaftar."
      keyExtractor={(row) => row.id}
    />
  );
};
