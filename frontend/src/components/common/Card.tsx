import React from 'react';
import { Badge } from './Badge';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  hasUnsavedChanges?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  hasUnsavedChanges = false,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`glass-card ${className}`}
      style={{
        padding: '1.5rem',
        border: '1px solid var(--border-color)',
        borderLeft: hasUnsavedChanges ? '6px solid var(--accent-color)' : '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-card)',
        boxShadow: hasUnsavedChanges ? '0 4px 14px rgba(3, 114, 51, 0.15)' : 'var(--shadow-sm)',
        transition: 'all 0.25s ease',
        ...style,
      }}
    >
      {(title || subtitle || action || hasUnsavedChanges) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            paddingBottom: title && subtitle ? '0.75rem' : '0.5rem',
            borderBottom: title ? '1px solid var(--border-color)' : 'none',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {title && (
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                  }}
                >
                  {title}
                </h3>
              )}
              {hasUnsavedChanges && (
                <Badge variant="warning" size="sm">
                  Belum Tersimpan
                </Badge>
              )}
            </div>
            {subtitle && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
