import React from 'react';
import type { MasterPart } from '../types/masterParts.types';
import { Table, type Column } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface MasterPartsTableProps {
  parts: MasterPart[];
  isLoading: boolean;
  selectedPartId: string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  onSelectPart: (part: MasterPart) => void;
  onOpenDetailModal: (part: MasterPart) => void;
  onEdit: (part: MasterPart) => void;
  onDelete: (id: string) => void;
}

export const MasterPartsTable: React.FC<MasterPartsTableProps> = ({
  parts,
  isLoading,
  selectedPartId,
  sortBy,
  sortOrder = 'asc',
  onSort,
  onSelectPart,
  onOpenDetailModal,
  onEdit,
  onDelete,
}) => {
  const renderSortHeader = (label: string, field: string) => {
    const isSorted = sortBy === field;
    return (
      <div
        onClick={() => onSort && onSort(field)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        title={`Urutkan berdasarkan ${label}`}
      >
        <span>{label}</span>
        {isSorted ? (
          sortOrder === 'asc' ? (
            <ArrowUp size={14} style={{ color: 'var(--primary-color)' }} />
          ) : (
            <ArrowDown size={14} style={{ color: 'var(--primary-color)' }} />
          )
        ) : (
          <ArrowUpDown size={13} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
        )}
      </div>
    );
  };

  const columns: Column<MasterPart>[] = [
    {
      header: renderSortHeader('Part Name', 'part_name'),
      accessorKey: 'part_name',
      cell: (part) => (
        <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)' }}>
          {part.part_name}
        </span>
      ),
    },
    {
      header: renderSortHeader('Model', 'model_code'),
      accessorKey: 'model_code',
      cell: (part) => (
        <Badge variant="neutral" size="sm">
          {part.model_code || '-'}
        </Badge>
      ),
      width: '110px',
    },
    {
      header: renderSortHeader('Factory', 'factory_name'),
      accessorKey: 'factory_name',
      cell: (part) => (
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-color)' }}>
          {part.factory_name || part.factory_code || '-'}
        </span>
      ),
      width: '120px',
    },
    {
      header: 'Aksi',
      cell: (part) => (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          onClick={(e) => e.stopPropagation()} // Prevent row select when clicking buttons
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenDetailModal(part)}
            leftIcon={<Eye size={14} />}
            title="Lihat Detail Spesifikasi Part"
            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
          >
            Detail
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(part)}
            leftIcon={<Pencil size={14} />}
            title="Edit Master Part"
            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
          >
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(part.id)}
            style={{ color: '#ef4444', padding: '0.3rem' }}
            title="Hapus Master Part"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      ),
      width: '180px',
    },
  ];

  return (
    <Table
      columns={columns}
      data={parts}
      isLoading={isLoading}
      emptyMessage="Belum ada data master part terdaftar."
      keyExtractor={(row) => row.id}
      onRowClick={(row) => onSelectPart(row)}
      selectedRowId={selectedPartId || undefined}
    />
  );
};
