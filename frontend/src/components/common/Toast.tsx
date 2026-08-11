import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface ToastProps {
  toast?: ToastMessage | null;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  toast,
  message,
  type = 'info',
  onClose,
  durationMs = 4000,
}) => {
  const activeMessage = toast?.message || message;
  const activeType = toast?.type || type;

  useEffect(() => {
    if (activeMessage) {
      const timer = setTimeout(onClose, durationMs);
      return () => clearTimeout(timer);
    }
  }, [activeMessage, onClose, durationMs]);

  if (!activeMessage) return null;

  const getIcon = () => {
    switch (activeType) {
      case 'success':
        return <CheckCircle2 color="#10b981" size={20} />;
      case 'error':
        return <XCircle color="#ef4444" size={20} />;
      case 'warning':
        return <AlertTriangle color="#f59e0b" size={20} />;
      case 'info':
      default:
        return <Info color="#3b82f6" size={20} />;
    }
  };

  const getBorderColor = () => {
    switch (activeType) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
      default:
        return '#3b82f6';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-main)',
        borderLeft: `4px solid ${getBorderColor()}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '400px',
        animation: 'slideInRight 0.3s ease',
      }}
    >
      <div>{getIcon()}</div>
      <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{activeMessage}</div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
