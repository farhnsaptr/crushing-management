import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../config/navigation.config';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { Badge } from '../common/Badge';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { user } = useAuth();
  const { siteLogo } = useTheme();
  const userRole = user?.role || 'operator';

  // Filter navigation items by section & active role permissions
  const mainNavItems = NAVIGATION_ITEMS.filter(
    (item) => item.section === 'main' && item.roles.includes(userRole)
  );

  const masterNavItems = NAVIGATION_ITEMS.filter(
    (item) => item.section === 'master' && item.roles.includes(userRole)
  );

  const adminNavItems = NAVIGATION_ITEMS.filter(
    (item) => item.section === 'admin' && item.roles.includes(userRole)
  );

  const isSuperAdmin = userRole === 'super-admin';
  const isAdminOrSuper = userRole === 'super-admin' || userRole === 'admin';

  return (
    <aside
      style={{
        width: isCollapsed ? '80px' : '270px',
        backgroundColor: 'var(--secondary-color)', // Solid Secondary Color (#E76114)
        borderRight: '1px solid rgba(0, 0, 0, 0.1)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        boxShadow: 'var(--shadow-md)',
        color: '#ffffff',
      }}
    >
      {/* Brand Header - Fixed Position Toggle Button */}
      <div
        style={{
          padding: isCollapsed ? '1rem 0.5rem' : '1.25rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          minHeight: '76px',
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Logo and Brand Title (Hidden when collapsed to prevent overflow/cutting) */}
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', overflow: 'hidden' }}>
            <div
              style={{
                padding: '0.25rem',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src={siteLogo || '/logo.png'}
                alt="PT Sugity Creatives Logo"
                style={{
                  height: '34px',
                  objectFit: 'contain',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                SUGITY
              </span>
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.9)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                RECYCLE MATERIAL MANAGEMENT
              </span>
            </div>
          </div>
        )}

        {/* Toggle Button - Fixed at Top Header */}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.45rem',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Items Container */}
      <div className="no-scrollbar" style={{ flex: 1, padding: '1.25rem 0.875rem', overflowY: 'auto' }}>
        {/* SECTION 1: MAIN MENU (Universal for all roles) */}
        {mainNavItems.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            {!isCollapsed && (
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.75)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.625rem',
                  paddingLeft: '0.5rem',
                }}
              >
                Main Menu
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={isCollapsed ? item.title : undefined}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.925rem',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? 'var(--secondary-color)' : '#ffffff',
                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                      boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                    })}
                  >
                    <Icon size={20} style={{ flexShrink: 0 }} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: MASTER DATA MANAGEMENT (Visible for super-admin & admin) */}
        {isAdminOrSuper && masterNavItems.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            {!isCollapsed && (
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.75)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.625rem',
                  paddingLeft: '0.5rem',
                }}
              >
                Master Data
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {masterNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={isCollapsed ? item.title : undefined}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.925rem',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? 'var(--secondary-color)' : '#ffffff',
                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                      boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                    })}
                  >
                    <Icon size={20} style={{ flexShrink: 0 }} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: SYSTEM ADMINISTRATOR (ONLY visible for Super-Admin Role) */}
        {isSuperAdmin && adminNavItems.length > 0 && (
          <div>
            {!isCollapsed && (
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.75)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.625rem',
                  paddingLeft: '0.5rem',
                }}
              >
                System Administrator
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={isCollapsed ? item.title : undefined}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.925rem',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? 'var(--secondary-color)' : '#ffffff',
                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                      boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                    })}
                  >
                    <Icon size={20} style={{ flexShrink: 0 }} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer User Badge */}
      {!isCollapsed && user && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="#ffffff" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
              Session Active
            </span>
          </div>
          <Badge variant="neutral" size="sm">
            {userRole.toUpperCase()}
          </Badge>
        </div>
      )}
    </aside>
  );
};
