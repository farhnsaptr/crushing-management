import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import type { User, CreateUserPayload, UpdateUserPayload } from '../types/users.types';
import { User as UserIcon, Lock, UserCheck, Shield } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser?: User | null;
  onCreateSubmit: (payload: CreateUserPayload) => Promise<void>;
  onUpdateSubmit: (id: string, payload: UpdateUserPayload) => Promise<void>;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  editingUser,
  onCreateSubmit,
  onUpdateSubmit,
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<'admin' | 'operator'>('operator');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editingUser;

  useEffect(() => {
    if (editingUser) {
      setUsername(editingUser.username);
      setFullName(editingUser.full_name);
      setRole(editingUser.role);
      setPassword('');
    } else {
      setUsername('');
      setFullName('');
      setRole('operator');
      setPassword('');
    }
    setError(null);
  }, [editingUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isEditMode) {
      if (!fullName.trim()) {
        setError('Nama lengkap wajib diisi.');
        return;
      }

      setIsSubmitting(true);
      try {
        await onUpdateSubmit(editingUser.id, {
          full_name: fullName,
          role,
          password: password.trim() ? password : undefined,
        });
      } catch (err: any) {
        setError(err.message || 'Gagal memperbarui data user.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!username.trim() || !password.trim() || !fullName.trim()) {
        setError('Seluruh field wajib diisi.');
        return;
      }

      setIsSubmitting(true);
      try {
        await onCreateSubmit({ username, password, full_name: fullName, role });
      } catch (err: any) {
        setError(err.message || 'Gagal menyimpan data user.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {isEditMode ? 'Simpan Perubahan' : 'Simpan Pengguna'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        <Input
          label="Nama Lengkap"
          placeholder="misal Rudi Hartono"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<UserCheck size={18} />}
          required
        />

        <Input
          label="Username"
          placeholder="misal op_rudi"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<UserIcon size={18} />}
          disabled={isEditMode} // Username cannot be changed once created
          required={!isEditMode}
        />

        <Input
          label={isEditMode ? 'Password Baru (Opsional)' : 'Password'}
          type="password"
          placeholder={isEditMode ? 'Kosongkan jika tidak ingin mengubah password' : 'Minimal 6 karakter'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={18} />}
          required={!isEditMode}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Role Akses
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Shield
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'operator')}
              style={{
                width: '100%',
                paddingTop: '0.625rem',
                paddingBottom: '0.625rem',
                paddingLeft: '2.5rem',
                paddingRight: '0.75rem',
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
              }}
            >
              <option value="operator">OPERATOR (Input NG & Actual)</option>
              <option value="admin">ADMIN (Akses Penuh Sistem)</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};
