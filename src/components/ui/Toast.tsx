import React, { createContext, useContext, useCallback, useState } from 'react';
import type { ToastMessage } from '@/types';
import { soundFx } from '@/utils/audio';

// ─── Context ──────────────────────────────────────────────────
interface ToastContextValue {
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    soundFx.playSelect();
    const id = Math.random().toString(36).slice(2);
    const toast: ToastMessage = { ...message, id };
    setToasts((prev) => [toast, ...prev].slice(0, 3));

    const delay = message.type === 'error' ? 5000 : 3200;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, delay);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </ToastContext.Provider>
  );
};

// ─── Toast Container ──────────────────────────────────────────
const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 20px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 'var(--z-toast)' as any,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: 'min(calc(100vw - 32px), 420px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

// ─── Toast Item ───────────────────────────────────────────────
const TOAST_STYLES = {
  success: {
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.4)',
    icon: '✓',
    iconColor: '#10B981',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.4)',
    icon: '✕',
    iconColor: '#EF4444',
  },
  info: {
    bg: 'rgba(245, 208, 97, 0.12)',
    border: 'rgba(245, 208, 97, 0.35)',
    icon: '◈',
    iconColor: '#F5D061',
  },
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const s = TOAST_STYLES[toast.type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface-elevated)',
        border: `1px solid ${s.border}`,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7), 0 0 16px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        animation: 'fadeInUp 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'all',
        cursor: 'pointer',
      }}
      onClick={() => onDismiss(toast.id)}
    >
      <span style={{ color: s.iconColor, fontWeight: 800, fontSize: '15px', flexShrink: 0 }}>
        {s.icon}
      </span>
      <span style={{ color: 'var(--color-text-primary)', fontSize: '13px', fontWeight: 600, lineHeight: 1.4, flex: 1 }}>
        {toast.message}
      </span>
      {toast.action && (
        <button
          onClick={(e) => { e.stopPropagation(); toast.action!.onClick(); }}
          style={{
            color: 'var(--color-accent)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-accent-subtle)',
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
};
