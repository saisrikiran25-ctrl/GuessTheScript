import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ScreenHeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  showBack = false,
  rightAction,
  transparent = false,
}) => {
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)' as any,
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-4)',
        gap: 'var(--space-3)',
        background: transparent ? 'transparent' : 'rgba(10, 10, 15, 0.92)',
        backdropFilter: transparent ? 'none' : 'blur(20px)',
        borderBottom: transparent ? 'none' : '1px solid var(--color-border)',
      }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
      )}

      {title && (
        <h1
          className="type-h3"
          style={{ flex: 1, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {title}
        </h1>
      )}

      {rightAction && (
        <div style={{ marginLeft: 'auto' }}>
          {rightAction}
        </div>
      )}
    </header>
  );
};

// ─── App Wordmark ─────────────────────────────────────────────
export const AppWordmark: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeMap = {
    sm: { main: '14px', sub: '9px' },
    md: { main: '18px', sub: '10px' },
    lg: { main: '24px', sub: '12px' },
  };

  const s = sizeMap[size];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
      <span
        style={{
          fontSize: s.main,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          color: 'var(--color-text-primary)',
        }}
      >
        GUESS THE{' '}
        <span style={{ color: 'var(--color-accent)' }}>SCRIPT</span>
      </span>
      <span
        style={{
          fontSize: s.sub,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginTop: '2px',
        }}
      >
        World Cup 2026
      </span>
    </div>
  );
};
