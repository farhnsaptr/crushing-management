import {
  LayoutDashboard,
  Building2,
  Cpu,
  Package,
  Layers,
  Users,
  FileText,
  Palette,
  PackageX,
  FileSpreadsheet,
  CheckSquare,
  Network,
  Send,
  ClipboardCheck,
} from 'lucide-react';
import React from 'react';
import type { UserRole } from '../context/AuthContext';

export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  roles: UserRole[];
  section: 'main' | 'master' | 'admin';
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['super-admin', 'admin', 'operator', 'pengirim'],
    section: 'main',
  },
  {
    id: 'requests',
    title: 'Kirim Part NG',
    path: '/requests',
    icon: Send,
    roles: ['pengirim'],
    section: 'main',
  },
  {
    id: 'request-approval',
    title: 'Verifikasi Permintaan',
    path: '/approval-requests',
    icon: ClipboardCheck,
    roles: ['super-admin', 'admin', 'operator'],
    section: 'main',
  },
  {
    id: 'ng-input',
    title: 'Detail Part NG',
    path: '/ng-input',
    icon: PackageX,
    roles: ['super-admin', 'admin', 'operator'],
    section: 'main',
  },
  {
    id: 'part-runner-ng',
    title: 'Input Part Runner NG',
    path: '/part-runner-ng',
    icon: FileSpreadsheet,
    roles: ['super-admin', 'admin', 'operator'],
    section: 'main',
  },
  {
    id: 'verification',
    title: 'Verifikasi Input',
    path: '/verification',
    icon: CheckSquare,
    roles: ['super-admin', 'admin', 'operator'],
    section: 'main',
  },
  {
    id: 'departments',
    title: 'Department Management',
    path: '/admin/departments',
    icon: Network,
    roles: ['super-admin', 'admin'],
    section: 'master',
  },
  {
    id: 'factories',
    title: 'Factory Management',
    path: '/admin/factories',
    icon: Building2,
    roles: ['super-admin', 'admin'],
    section: 'master',
  },
  {
    id: 'machines',
    title: 'Machine Management',
    path: '/admin/machines',
    icon: Cpu,
    roles: ['super-admin', 'admin'],
    section: 'master',
  },
  {
    id: 'materials',
    title: 'Material Management',
    path: '/admin/materials',
    icon: Layers,
    roles: ['super-admin', 'admin'],
    section: 'master',
  },
  {
    id: 'master-parts',
    title: 'Master Parts',
    path: '/admin/master-parts',
    icon: Package,
    roles: ['super-admin', 'admin'],
    section: 'master',
  },
  {
    id: 'users',
    title: 'User Management',
    path: '/admin/users',
    icon: Users,
    roles: ['super-admin'],
    section: 'admin',
  },
  {
    id: 'global-logs',
    title: 'Global Audit Logs',
    path: '/admin/logs',
    icon: FileText,
    roles: ['super-admin'],
    section: 'admin',
  },
  {
    id: 'site-config',
    title: 'Site Configuration',
    path: '/admin/site-config',
    icon: Palette,
    roles: ['super-admin'],
    section: 'admin',
  },
];
