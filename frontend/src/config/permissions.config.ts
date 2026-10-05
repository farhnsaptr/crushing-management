import type { UserRole } from '../context/AuthContext';

// Role yang boleh mengubah data (upload, rollback, verifikasi, input). Role lain (pengirim, guest) tidak.
// Guest = viewer murni; backend tetap jadi penjaga utama (auth.middleware menolak non-GET untuk guest).
export const DATA_MANAGER_ROLES: UserRole[] = ['super-admin', 'admin', 'operator'];

export const canManageData = (role?: UserRole): boolean =>
  !!role && DATA_MANAGER_ROLES.includes(role);
