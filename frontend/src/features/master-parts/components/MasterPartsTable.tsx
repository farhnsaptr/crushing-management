import React from 'react';
import type { MasterPart } from '../types/masterParts.types';
import { Table, type Column } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Pencil, Trash2 } from 'lucide-react';

interface MasterPartsTableProps {
  parts: MasterPart[];
  isLoading: boolean;
  onEdit: (part: MasterPart) => void;
  onDelete: (id: string) => void;
}

export const MasterPartsTable: React.FC<MasterPartsTableProps> = ({
  parts,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const columns: Column<MasterPart>[] = [
    {
      header: 'Sebango Code',
      accessorKey: 'sebango_code',
      cell: (part) => (
        <Badge variant="primary" size="md">
          {part.sebango_code}
        </Badge>
      ),
      width: '140px',
    },
    {
      header: 'Part Number',
      accessorKey: 'part_number',
      cell: (part) => (
        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
          {part.part_number}
        </span>
      ),
      width: '150px',
    },
    {
      header: 'Part Name',
      accessorKey: 'part_name',
      cell: (part) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
          {part.part_name}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'customer',
      cell: (part) => (
        <Badge variant="neutral" size="sm">
          {part.customer || '-'}
        </Badge>
      ),
      width: '100px',
    },
    {
      header: 'Model',
      accessorKey: 'model_code',
      cell: (part) => (
        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{part.model_code || '-'}</span>
      ),
      width: '90px',
    },
    {
      header: 'Mesin',
      accessorKey: 'machine_code',
      cell: (part) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {part.machine_code ? `${part.machine_code} (${part.factory_code || ''})` : '-'}
        </span>
      ),
      width: '140px',
    },
    {
      header: 'Jenis Part',
      accessorKey: 'jenis_part',
      cell: (part) => (
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{part.jenis_part || '-'}</span>
      ),
      width: '120px',
    },
    {
      header: 'Material',
      accessorKey: 'material',
      cell: (part) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{part.material || '-'}</span>
      ),
      width: '140px',
    },
    {
      header: 'Shikake',
      accessorKey: 'shikake',
      cell: (part) => <span>{Number(part.shikake)}</span>,
      width: '70px',
    },
    {
      header: 'Berat Part (gr)',
      accessorKey: 'berat_part_gr',
      cell: (part) => <span>{Number(part.berat_part_gr)} gr</span>,
      width: '110px',
    },
    {
      header: 'Berat Runner (gr)',
      accessorKey: 'berat_runner_gr',
      cell: (part) => <span>{Number(part.berat_runner_gr || 0)} gr</span>,
      width: '110px',
    },
    {
      header: 'STD QTY NG',
      accessorKey: 'std_qty_ng',
      cell: (part) => (
        <span style={{ fontWeight: 800, color: '#2563eb' }}>
          {Number(part.std_qty_ng ?? (part.shikake || 1) * 2)}
        </span>
      ),
      width: '100px',
    },
    {
      header: 'Allowance (kg)',
      accessorKey: 'allowance_kg',
      cell: (part) => (
        <span style={{ fontWeight: 800, color: '#2563eb' }}>
          {Number(part.allowance_kg ?? (((part.shikake || 1) * 2 * part.berat_part_gr) / 1000))} kg
        </span>
      ),
      width: '110px',
    },
    {
      header: 'Aksi',
      cell: (part) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(part)}
            leftIcon={<Pencil size={15} />}
            title="Edit Master Part"
          >
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(part.id)}
            style={{ color: '#ef4444' }}
            title="Hapus Master Part"
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
      data={parts}
      isLoading={isLoading}
      emptyMessage="Belum ada data master part terdaftar."
      keyExtractor={(row) => row.id}
    />
  );
};
