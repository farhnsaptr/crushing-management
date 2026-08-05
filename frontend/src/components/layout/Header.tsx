import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, User } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <header
      style={{
        height: '76px',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        backgroundColor: 'var(--primary-color)', // Solid Primary Color (#008d51)
        color: '#ffffff',
        boxShadow: 'var(--shadow-md)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          {title || 'Crushing Management'}
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>
          PT Sugity Creatives - Recycle Material Management System
        </p>
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Light/Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Mode Terang (Light Mode)' : 'Mode Gelap (Dark Mode)'}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#ffffff',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          {isDarkMode ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#ffffff" />}
        </button>

        {/* User Info & Avatar */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.4rem 0.875rem',
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.9rem',
              }}
            >
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={18} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                {user.full_name || user.username}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 700 }}>
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign out"
          style={{
            background: '#ffffff',
            border: 'none',
            color: '#ef4444',
            padding: '0.55rem 1rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 800,
            fontSize: '0.85rem',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
          }}
        >
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
};
