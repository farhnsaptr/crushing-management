import React from 'react';
import type { User } from '../types/users.types';
import { Table, type Column } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { ToggleLeft, ToggleRight, Trash2, Pencil, Building2, Network } from 'lucide-react';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'danger';
      case 'admin':
        return 'primary';
      case 'operator':
        return 'warning';
      case 'pengirim':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Pengguna',
      accessorKey: 'full_name',
      cell: (user) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>{user.full_name}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>@{user.username}</span>
        </div>
      ),
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: (user) => (
        <Badge variant={getRoleBadgeVariant(user.role) as any} size="md">
          {user.role.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Factory & Departemen',
      cell: (user) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-main, #0f172a)' }}>
            <Building2 size={13} color="var(--secondary-color, #e76114)" />
            <span>{user.factory_name || '-'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted, #64748b)' }}>
            <Network size={13} color="var(--primary-color, #008d51)" />
            <span>{user.department_name || '-'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: (user) => (
        <Badge variant={user.is_active ? 'success' : 'danger'} size="md">
          {user.is_active ? 'Aktif' : 'Non-Aktif'}
        </Badge>
      ),
    },
    {
      header: 'Login Terakhir',
      accessorKey: 'last_login_at',
      cell: (user) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
          {user.last_login_at
            ? new Date(user.last_login_at).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : 'Belum pernah'}
        </span>
      ),
    },
    {
      header: 'Aksi',
      cell: (user) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
            leftIcon={<Pencil size={15} />}
            title="Edit Pengguna"
          >
            Edit
          </Button>

          <Button
            variant={user.is_active ? 'outline' : 'primary'}
            size="sm"
            onClick={() => onToggleStatus(user.id, user.is_active)}
            leftIcon={user.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            title={user.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
          >
            {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(user.id)}
            style={{ color: '#ef4444' }}
            title="Hapus Pengguna"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={users}
      isLoading={isLoading}
      emptyMessage="Tidak ada data pengguna lain ditemukan."
      keyExtractor={(row) => row.id}
    />
  );
};
