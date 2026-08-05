import React from 'react';
import { useUsers } from '../hooks/useUsers';
import { UserTable } from '../components/UserTable';
import { UserModal } from '../components/UserModal';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Toast } from '../../../components/common/Toast';
import { Search, UserPlus, RefreshCw } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const {
    users,
    searchQuery,
    setSearchQuery,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingUser,
    handleOpenCreateModal,
    handleOpenEditModal,
    toast,
    setToast,
    fetchUsers,
    handleCreateUser,
    handleUpdateUser,
    handleToggleStatus,
    handleDeleteUser,
  } = useUsers();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Action Header Card */}
      <Card>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1, minWidth: '260px', maxWidth: '400px' }}>
            <Input
              placeholder="Cari nama, username, atau role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button
              variant="outline"
              onClick={fetchUsers}
              isLoading={isLoading}
              leftIcon={<RefreshCw size={16} />}
              title="Refresh Data"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenCreateModal}
              leftIcon={<UserPlus size={18} />}
            >
              Tambah Pengguna
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table Card */}
      <Card
        title="Daftar Pengguna Sistem"
        subtitle={`Menampilkan ${users.length} akun terdaftar (akun terlogin diexclude otomatis dari query)`}
      >
        <UserTable
          users={users}
          isLoading={isLoading}
          onEdit={handleOpenEditModal}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteUser}
        />
      </Card>

      {/* Create / Edit User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={editingUser}
        onCreateSubmit={handleCreateUser}
        onUpdateSubmit={handleUpdateUser}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
