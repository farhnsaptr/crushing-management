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
    <header className="app-header">
      {/* Page Title & Subtitle */}
      <div className="header-title-container">
        <h1 className="header-title" title={title || 'Crushing Management'}>
          {title || 'Crushing Management'}
        </h1>
        <p className="header-subtitle" title="PT SUGITY CREATIVES - Recycle Material Management System">
          PT SUGITY CREATIVES - Recycle Material Management System
        </p>
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Light/Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Mode Terang (Light Mode)' : 'Mode Gelap (Dark Mode)'}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#ffffff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          {isDarkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#ffffff" />}
        </button>

        {/* User Info & Avatar */}
        {user && (
          <div className="header-user-badge" title={`${user.full_name || user.username} (${user.role.toUpperCase()})`}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                color: 'var(--primary-color, #008d51)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={16} />}
            </div>

            <div className="header-user-text">
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                {user.full_name || user.username}
              </span>
              <span style={{ fontSize: '0.675rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 700 }}>
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign out / Keluar"
          className="header-logout-btn"
        >
          <LogOut size={16} />
          <span className="header-logout-text">Keluar</span>
        </button>
      </div>
    </header>
  );
};
