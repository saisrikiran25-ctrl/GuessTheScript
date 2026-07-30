import React, { useEffect, useCallback } from 'react';
import { soundFx } from '@/utils/audio';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = '480px',
}) => {
  const handleClose = () => {
    soundFx.playClick();
    onClose();
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)' as any,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(3, 4, 8, 0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          animation: 'fadeIn 200ms ease-out',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth,
          background: 'var(--color-surface-elevated)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRadius: '28px 28px 0 0',
          border: '1px solid var(--color-border)',
          borderBottom: 'none',
          padding: 'var(--space-6)',
          paddingBottom: 'calc(var(--space-6) + env(safe-area-inset-bottom, 0px))',
          animation: 'fadeInUp 280ms cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: '90dvh',
          overflowY: 'auto',
          boxShadow: '0 -16px 48px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Pull handle indicator */}
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 99,
            background: 'rgba(255, 255, 255, 0.2)',
            margin: '0 auto var(--space-4) auto',
          }}
        />

        {title && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-5)',
            }}
          >
            <h2 className="type-h3 font-display" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </h2>
            <button
              onClick={handleClose}
              aria-label="Close modal"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
