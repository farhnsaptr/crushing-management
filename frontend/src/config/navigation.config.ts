import { LayoutDashboard, Users, FileText, Palette } from 'lucide-react';
import React from 'react';

export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  roles: ('admin' | 'operator')[];
  section: 'main' | 'admin';
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'operator'],
    section: 'main',
  },
  {
    id: 'users',
    title: 'User Management',
    path: '/admin/users',
    icon: Users,
    roles: ['admin'],
    section: 'admin',
  },
  {
    id: 'global-logs',
    title: 'Global Audit Logs',
    path: '/admin/logs',
    icon: FileText,
    roles: ['admin'],
    section: 'admin',
  },
  {
    id: 'site-config',
    title: 'Site Configuration',
    path: '/admin/site-config',
    icon: Palette,
    roles: ['admin'],
    section: 'admin',
  },
];
