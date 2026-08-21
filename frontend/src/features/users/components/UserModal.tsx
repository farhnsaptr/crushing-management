import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import type { User, UserRole, CreateUserPayload, UpdateUserPayload } from '../types/users.types';
import type { Factory } from '../../factories/types/factories.types';
import type { Department } from '../../departments/types/departments.types';
import { User as UserIcon, Lock, UserCheck, Shield, Building2, Network } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser?: User | null;
  factories: Factory[];
  departments: Department[];
  onCreateSubmit: (payload: CreateUserPayload) => Promise<void>;
  onUpdateSubmit: (id: string, payload: UpdateUserPayload) => Promise<void>;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  editingUser,
  factories,
  departments,
  onCreateSubmit,
  onUpdateSubmit,
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('operator');
  const [factoryId, setFactoryId] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editingUser;

  useEffect(() => {
    if (editingUser) {
      setUsername(editingUser.username);
      setFullName(editingUser.full_name);
      setRole(editingUser.role);
      setFactoryId(editingUser.factory_id || '');
      setDepartmentId(editingUser.department_id || '');
      setPassword('');
    } else {
      setUsername('');
      setFullName('');
      setRole('pengirim');
      setFactoryId(factories.length > 0 ? factories[0].id : '');
      setDepartmentId(departments.length > 0 ? departments[0].id : '');
      setPassword('');
    }
    setError(null);
  }, [editingUser, isOpen, factories, departments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === 'pengirim' && (!factoryId || !departmentId)) {
      setError('Role Pengirim wajib memilih Factory dan Departemen penugasan.');
      return;
    }

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
          factory_id: role === 'pengirim' ? factoryId : factoryId || null,
          department_id: role === 'pengirim' ? departmentId : departmentId || null,
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
        await onCreateSubmit({
          username,
          password,
          full_name: fullName,
          role,
          factory_id: factoryId || null,
          department_id: departmentId || null,
        });
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
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        <Input
          label="Nama Lengkap"
          placeholder="misal Budi Santoso"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<UserCheck size={18} />}
          required
        />

        <Input
          label="Username"
          placeholder="misal pengirim_budi"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<UserIcon size={18} />}
          disabled={isEditMode}
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

        {/* Role Access Select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
            Role Akses
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Shield
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: 'var(--text-muted, #64748b)',
                pointerEvents: 'none',
              }}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              style={{
                width: '100%',
                paddingTop: '0.625rem',
                paddingBottom: '0.625rem',
                paddingLeft: '2.5rem',
                paddingRight: '0.75rem',
                fontSize: '0.925rem',
                color: 'var(--text-main, #0f172a)',
                backgroundColor: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border-color, #cbd5e1)',
                borderRadius: 'var(--radius-md, 8px)',
                outline: 'none',
              }}
            >
              <option value="pengirim">PENGIRIM (Request & Kirim Part/Runner NG)</option>
              <option value="operator">OPERATOR (Validasi, Approval & Crushing)</option>
              <option value="admin">ADMIN (Kelola Master Data, Departemen & Pabrik)</option>
              <option value="super-admin">SUPER-ADMIN (Akses Penuh Seluruh Sistem)</option>
            </select>
          </div>
        </div>

        {/* Factory Assignment Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
            Factory Penugasan {role === 'pengirim' && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Building2
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: 'var(--text-muted, #64748b)',
                pointerEvents: 'none',
              }}
            />
            <select
              value={factoryId}
              onChange={(e) => setFactoryId(e.target.value)}
              required={role === 'pengirim'}
              style={{
                width: '100%',
                paddingTop: '0.625rem',
                paddingBottom: '0.625rem',
                paddingLeft: '2.5rem',
                paddingRight: '0.75rem',
                fontSize: '0.925rem',
                color: 'var(--text-main, #0f172a)',
                backgroundColor: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border-color, #cbd5e1)',
                borderRadius: 'var(--radius-md, 8px)',
                outline: 'none',
              }}
            >
              <option value="">-- Pilih Factory --</option>
              {factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.location || 'Cibitung'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Department Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
            Departemen {role === 'pengirim' && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Network
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: 'var(--text-muted, #64748b)',
                pointerEvents: 'none',
              }}
            />
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required={role === 'pengirim'}
              style={{
                width: '100%',
                paddingTop: '0.625rem',
                paddingBottom: '0.625rem',
                paddingLeft: '2.5rem',
                paddingRight: '0.75rem',
                fontSize: '0.925rem',
                color: 'var(--text-main, #0f172a)',
                backgroundColor: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border-color, #cbd5e1)',
                borderRadius: 'var(--radius-md, 8px)',
                outline: 'none',
              }}
            >
              <option value="">-- Pilih Departemen --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};
