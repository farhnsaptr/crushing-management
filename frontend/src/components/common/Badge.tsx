import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary' | 'neutral';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  style = {},
  className = '',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'warning':
        return { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'danger':
        return { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'info':
        return { backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'primary':
        return { backgroundColor: 'rgba(0, 141, 81, 0.15)', color: 'var(--primary-color)', border: '1px solid rgba(0, 141, 81, 0.3)' };
      case 'secondary':
        return { backgroundColor: 'rgba(231, 97, 20, 0.15)', color: 'var(--secondary-color)', border: '1px solid rgba(231, 97, 20, 0.3)' };
      case 'neutral':
      default:
        return { backgroundColor: 'var(--border-color)', color: 'var(--text-muted)', border: 'none' };
    }
  };

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        borderRadius: '9999px',
        fontWeight: 600,
        fontSize: size === 'sm' ? '0.7rem' : '0.8rem',
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.65rem',
        whiteSpace: 'nowrap',
        ...getStyles(),
        ...style,
      }}
    >
      {children}
    </span>
  );
};
