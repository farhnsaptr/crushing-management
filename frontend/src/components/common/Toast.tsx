import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X, Undo2 } from 'lucide-react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: ToastAction;
  durationMs?: number;
}

export type ToastState = ToastMessage;

interface ToastProps {
  toast?: ToastMessage | null;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  action?: ToastAction;
  onClose: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  toast,
  message,
  type = 'info',
  action,
  onClose,
  durationMs = 4000,
}) => {
  const activeMessage = toast?.message || message;
  const activeType = toast?.type || type;
  const activeAction = toast?.action || action;
  const activeDuration = toast?.durationMs || durationMs;

  useEffect(() => {
    if (activeMessage) {
      const timer = setTimeout(onClose, activeDuration);
      return () => clearTimeout(timer);
    }
  }, [activeMessage, onClose, activeDuration]);

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
        padding: '0.85rem 1.15rem',
        backgroundColor: 'var(--bg-card, #ffffff)',
        color: 'var(--text-main, #0f172a)',
        borderLeft: `4px solid ${getBorderColor()}`,
        borderRadius: 'var(--radius-md, 8px)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        maxWidth: '460px',
        animation: 'slideInRight 0.3s ease',
      }}
    >
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{getIcon()}</div>
      <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.35 }}>
        {activeMessage}
      </div>

      {activeAction && (
        <button
          type="button"
          onClick={() => {
            activeAction.onClick();
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.35rem 0.65rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(231, 97, 20, 0.1)',
            border: '1px solid rgba(231, 97, 20, 0.3)',
            color: 'var(--secondary-color, #e76114)',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--secondary-color, #e76114)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(231, 97, 20, 0.1)';
            e.currentTarget.style.color = 'var(--secondary-color, #e76114)';
          }}
        >
          <Undo2 size={13} strokeWidth={2.5} />
          <span>{activeAction.label}</span>
        </button>
      )}

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted, #94a3b8)',
          cursor: 'pointer',
          display: 'flex',
          padding: '2px',
          borderRadius: '4px',
          flexShrink: 0,
        }}
        title="Tutup notifikasi"
      >
        <X size={16} />
      </button>
    </div>
  );
};
