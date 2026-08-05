import React from 'react';
import type { Machine } from '../types/machines.types';
import { Table, type Column } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Pencil, Trash2, Gauge } from 'lucide-react';

interface MachineTableProps {
  machines: Machine[];
  isLoading: boolean;
  onEdit: (machine: Machine) => void;
  onDelete: (id: string) => void;
}

export const MachineTable: React.FC<MachineTableProps> = ({
  machines,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const columns: Column<Machine>[] = [
    {
      header: 'Pabrik',
      accessorKey: 'factory_code',
      cell: (machine) => (
        <Badge variant="neutral" size="sm">
          {machine.factory_code ? `${machine.factory_code} - ${machine.factory_name}` : 'Unknown Factory'}
        </Badge>
      ),
      width: '180px',
    },
    {
      header: 'Kode Mesin',
      accessorKey: 'code',
      cell: (machine) => (
        <Badge variant="primary" size="md">
          {machine.code}
        </Badge>
      ),
      width: '130px',
    },
    {
      header: 'Nama Mesin',
      accessorKey: 'name',
      cell: (machine) => (
        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
          {machine.name}
        </span>
      ),
    },
    {
      header: 'Tipe',
      accessorKey: 'type',
      cell: (machine) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {machine.type || 'Injection Mold'}
        </span>
      ),
      width: '150px',
    },
    {
      header: 'Tonase',
      accessorKey: 'tonnage',
      cell: (machine) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
          <Gauge size={14} color="var(--text-muted)" />
          <span>{machine.tonnage || '-'}</span>
        </div>
      ),
      width: '120px',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (machine) => (
        <Badge variant={machine.status === 'active' ? 'success' : 'danger'} size="sm">
          {machine.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
        </Badge>
      ),
      width: '120px',
    },
    {
      header: 'Tanggal Dibuat',
      accessorKey: 'created_at',
      cell: (machine) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {machine.created_at
            ? new Date(machine.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '-'}
        </span>
      ),
      width: '150px',
    },
    {
      header: 'Aksi',
      cell: (machine) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(machine)}
            leftIcon={<Pencil size={15} />}
            title="Edit Mesin"
          >
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(machine.id)}
            style={{ color: '#ef4444' }}
            title="Hapus Mesin"
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
      data={machines}
      isLoading={isLoading}
      emptyMessage="Belum ada data mesin terdaftar."
      keyExtractor={(row) => row.id}
    />
  );
};
