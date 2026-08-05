import { LayoutDashboard, Building2, Cpu, Users, FileText, Palette } from 'lucide-react';
import React from 'react';

export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  roles: ('super-admin' | 'admin' | 'operator')[];
  section: 'main' | 'master' | 'admin';
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['super-admin', 'admin', 'operator'],
    section: 'main',
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
