import React from 'react';
import type { Department } from '../types/departments.types';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Edit2, Trash2, Network } from 'lucide-react';

interface DepartmentTableProps {
  departments: Department[];
  isLoading: boolean;
  onEdit: (department: Department) => void;
  onDelete: (id: string, name: string) => void;
}

export const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments,
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
        Memuat daftar departemen...
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div
        style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted, #64748b)',
          backgroundColor: 'var(--bg-main, #f8fafc)',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px dashed var(--border-color, #cbd5e1)',
        }}
      >
        Tidak ada data departemen ditemukan. Silakan tambahkan departemen baru.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--bg-main, #f1f5f9)',
              textAlign: 'left',
              color: 'var(--text-muted, #475569)',
              borderBottom: '1px solid var(--border-color, #cbd5e1)',
            }}
          >
            <th style={{ padding: '0.75rem 1rem' }}>No</th>
            <th style={{ padding: '0.75rem 1rem' }}>Kode</th>
            <th style={{ padding: '0.75rem 1rem' }}>Nama Departemen</th>
            <th style={{ padding: '0.75rem 1rem' }}>Deskripsi</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept, index) => (
            <tr
              key={dept.id}
              style={{
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                transition: 'background-color 0.15s ease',
              }}
            >
              <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted, #64748b)' }}>
                {index + 1}
              </td>
              <td style={{ padding: '0.75rem 1rem' }}>
                <Badge variant="info">{dept.code}</Badge>
              </td>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Network size={16} color="var(--primary-color, #008d51)" />
                  <span>{dept.name}</span>
                </div>
              </td>
              <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted, #64748b)' }}>
                {dept.description || '-'}
              </td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onEdit(dept)}
                    title="Edit Departemen"
                    leftIcon={<Edit2 size={13} />}
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(dept.id, dept.name)}
                    title="Hapus Departemen"
                    leftIcon={<Trash2 size={13} />}
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    Hapus
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
