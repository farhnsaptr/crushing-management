import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../config/navigation.config';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeft, ShieldCheck, Menu } from 'lucide-react';
import { Badge } from '../common/Badge';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { user } = useAuth();
  const { siteLogo } = useTheme();
  const userRole = user?.role || 'operator';

  // Close overlay drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCollapsed) {
        onToggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed, onToggleCollapse]);

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

  const isAdminOrSuper = userRole === 'super-admin' || userRole === 'admin';

  return (
    <>
      {/* 1. COLLAPSED STATIC RAIL (Always visible at 72px) */}
      <aside
        style={{
          width: '72px',
          backgroundColor: 'var(--secondary-color)', // Solid Secondary Color (#E76114)
          borderRight: '1px solid rgba(0, 0, 0, 0.15)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 90,
          boxShadow: 'var(--shadow-sm)',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Rail Top: Hamburger Icon Button */}
        <div
          style={{
            minHeight: '76px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Buka Menu Navigasi"
            aria-label="Buka Menu Navigasi"
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md, 8px)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.28)';
              e.currentTarget.style.transform = 'scale(1.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Rail Middle: Navigation Icons Centered */}
        <div className="no-scrollbar" style={{ flex: 1, padding: '1rem 0.5rem', overflowY: 'auto' }}>
          {/* Main Menu Icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  title={item.title}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem 0',
                    borderRadius: 'var(--radius-md, 8px)',
                    color: isActive ? 'var(--secondary-color)' : '#ffffff',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  })}
                >
                  <Icon size={20} style={{ flexShrink: 0 }} />
                </NavLink>
              );
            })}
          </div>

          {/* Master Data Icons */}
          {isAdminOrSuper && masterNavItems.length > 0 && (
            <>
              <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '0.5rem 0.25rem' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', margin: '0.5rem 0 1rem 0' }}>
                {masterNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      title={item.title}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.75rem 0',
                        borderRadius: 'var(--radius-md, 8px)',
                        color: isActive ? 'var(--secondary-color)' : '#ffffff',
                        backgroundColor: isActive ? '#ffffff' : 'transparent',
                        boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                        transition: 'all 0.2s ease',
                        textDecoration: 'none',
                      })}
                    >
                      <Icon size={20} style={{ flexShrink: 0 }} />
                    </NavLink>
                  );
                })}
              </div>
            </>
          )}

          {/* Admin Icons */}
          {adminNavItems.length > 0 && (
            <>
              <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '0.5rem 0.25rem' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      title={item.title}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.75rem 0',
                        borderRadius: 'var(--radius-md, 8px)',
                        color: isActive ? 'var(--secondary-color)' : '#ffffff',
                        backgroundColor: isActive ? '#ffffff' : 'transparent',
                        boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                        transition: 'all 0.2s ease',
                        textDecoration: 'none',
                      })}
                    >
                      <Icon size={20} style={{ flexShrink: 0 }} />
                    </NavLink>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Rail Footer: Session Shield */}
        {user && (
          <div
            style={{
              padding: '0.85rem 0',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`${user.full_name || user.username} (${userRole.toUpperCase()})`}
          >
            <ShieldCheck size={20} color="#ffffff" />
          </div>
        )}
      </aside>

      {/* 2. OVERLAY BACKDROP */}
      <div
        onClick={onToggleCollapse}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          zIndex: 999,
          opacity: isCollapsed ? 0 : 1,
          pointerEvents: isCollapsed ? 'none' : 'auto',
          transition: 'opacity 0.28s ease',
        }}
      />

      {/* 3. SLIDE-IN OVERLAY DRAWER (Fixed 280px width, slides in smoothly without font stretching) */}
      <aside
        style={{
          width: '280px',
          backgroundColor: 'var(--secondary-color)', // Solid Secondary Color (#E76114)
          borderRight: '1px solid rgba(0, 0, 0, 0.15)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          boxShadow: isCollapsed ? 'none' : 'var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.35))',
          color: '#ffffff',
          overflow: 'hidden',
          transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease',
          willChange: 'transform',
          pointerEvents: isCollapsed ? 'none' : 'auto',
        }}
      >
        {/* Drawer Brand Header: Displays Sugity Logo & Name when opened */}
        <div
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            minHeight: '76px',
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Logo & Brand Title */}
          <div
            onClick={onToggleCollapse}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            title="Tutup Menu Navigasi"
          >
            <div
              style={{
                padding: '0.25rem',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-sm, 6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
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
              <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                SUGITY
              </span>
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.9)', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                MATERIAL MANAGEMENT
              </span>
            </div>
          </div>

          {/* Close Chevron Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Tutup Menu Navigasi"
            aria-label="Tutup Menu Navigasi"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.45rem',
              borderRadius: 'var(--radius-md, 8px)',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Drawer Navigation Items Container */}
        <div className="no-scrollbar" style={{ flex: 1, padding: '1.25rem 0.875rem', overflowY: 'auto' }}>
          {/* SECTION 1: MAIN MENU */}
          {mainNavItems.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={onToggleCollapse}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md, 8px)',
                        fontSize: '0.925rem',
                        fontWeight: isActive ? 800 : 600,
                        color: isActive ? 'var(--secondary-color)' : '#ffffff',
                        backgroundColor: isActive ? '#ffffff' : 'transparent',
                        boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                        transition: 'all 0.2s ease',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      })}
                    >
                      <Icon size={20} style={{ flexShrink: 0 }} />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: MASTER DATA MANAGEMENT */}
          {isAdminOrSuper && masterNavItems.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {masterNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={onToggleCollapse}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md, 8px)',
                        fontSize: '0.925rem',
                        fontWeight: isActive ? 800 : 600,
                        color: isActive ? 'var(--secondary-color)' : '#ffffff',
                        backgroundColor: isActive ? '#ffffff' : 'transparent',
                        boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                        transition: 'all 0.2s ease',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      })}
                    >
                      <Icon size={20} style={{ flexShrink: 0 }} />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: SYSTEM ADMINISTRATION */}
          {adminNavItems.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
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
                System Admin
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={onToggleCollapse}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md, 8px)',
                        fontSize: '0.925rem',
                        fontWeight: isActive ? 800 : 600,
                        color: isActive ? 'var(--secondary-color)' : '#ffffff',
                        backgroundColor: isActive ? '#ffffff' : 'transparent',
                        boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                        transition: 'all 0.2s ease',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      })}
                    >
                      <Icon size={20} style={{ flexShrink: 0 }} />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer: User Session Badge */}
        {user && (
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
              <ShieldCheck size={18} color="#ffffff" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap' }}>
                Session Active
              </span>
            </div>
            <Badge variant="neutral" size="sm">
              {userRole.toUpperCase()}
            </Badge>
          </div>
        )}
      </aside>
    </>
  );
};
