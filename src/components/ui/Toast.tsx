import React, { createContext, useContext, useCallback, useState } from 'react';
import type { ToastMessage } from '@/types';

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
    const id = Math.random().toString(36).slice(2);
    const toast: ToastMessage = { ...message, id };
    setToasts((prev) => [toast, ...prev].slice(0, 3));

    const delay = message.type === 'error' ? 5000 : 3000;
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
        top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 'var(--z-toast)' as any,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: 'min(calc(100vw - 32px), 400px)',
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
    bg: 'rgba(46, 204, 113, 0.15)',
    border: 'rgba(46, 204, 113, 0.4)',
    icon: '✓',
    iconColor: '#2ECC71',
  },
  error: {
    bg: 'rgba(231, 76, 60, 0.15)',
    border: 'rgba(231, 76, 60, 0.4)',
    icon: '✗',
    iconColor: '#E74C3C',
  },
  info: {
    bg: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.15)',
    icon: '·',
    iconColor: '#9B9BB0',
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
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '10px',
        background: '#13131A',
        border: `1px solid ${s.border}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        animation: 'toastSlideIn 200ms ease-out',
        pointerEvents: 'all',
        cursor: 'pointer',
      }}
      onClick={() => onDismiss(toast.id)}
    >
      <span style={{ color: s.iconColor, fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
        {s.icon}
      </span>
      <span style={{ color: '#F5F5F0', fontSize: '13px', fontWeight: 500, lineHeight: 1.4, flex: 1 }}>
        {toast.message}
      </span>
      {toast.action && (
        <button
          onClick={(e) => { e.stopPropagation(); toast.action!.onClick(); }}
          style={{
            color: '#D4A843',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            padding: '2px 0',
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
};
