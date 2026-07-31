import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundFx } from '@/utils/audio';

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
        padding: '0 var(--space-5)',
        gap: 'var(--space-3)',
        background: transparent ? 'transparent' : 'rgba(3, 4, 8, 0.88)',
        backdropFilter: transparent ? 'none' : 'blur(24px)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(24px)',
        borderBottom: transparent ? 'none' : '1px solid var(--color-border)',
      }}
    >
      {showBack && (
        <button
          onClick={() => {
            soundFx.playClick();
            navigate(-1);
          }}
          aria-label="Go back"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
      )}

      {title && (
        <h1
          className="type-h3 font-display"
          style={{ flex: 1, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {title}
        </h1>
      )}

      {rightAction ? (
        <div style={{ marginLeft: 'auto' }}>
          {rightAction}
        </div>
      ) : (
        <SoundToggleButton />
      )}
    </header>
  );
};

// ─── Sound Toggle Button ──────────────────────────────────────
export const SoundToggleButton: React.FC = () => {
  const [enabled, setEnabled] = useState(() => soundFx.isEnabled());

  const handleToggle = () => {
    const newState = soundFx.toggleSound();
    setEnabled(newState);
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={enabled ? 'Mute sound' : 'Unmute sound'}
      title={enabled ? 'Sound ON' : 'Sound OFF'}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: enabled ? 'rgba(245, 208, 97, 0.12)' : 'rgba(255, 255, 255, 0.06)',
        border: `1px solid ${enabled ? 'var(--color-border-accent)' : 'var(--color-border)'}`,
        color: enabled ? 'var(--color-accent)' : 'var(--color-text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto',
        flexShrink: 0,
        transition: 'all 0.2s ease',
      }}
    >
      {enabled ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
      )}
    </button>
  );
};

// ─── App Wordmark ─────────────────────────────────────────────
export const AppWordmark: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeMap = {
    sm: { main: '14px', sub: '8px', icon: 18 },
    md: { main: '17px', sub: '9px', icon: 22 },
    lg: { main: '22px', sub: '11px', icon: 28 },
  };

  const s = sizeMap[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Bespoke Emblem Icon */}
      <div
        style={{
          width: s.icon + 10,
          height: s.icon + 10,
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.2) 0%, rgba(201, 158, 46, 0.05) 100%)',
          border: '1px solid var(--color-border-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(245, 208, 97, 0.15)',
        }}
      >
        <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none" stroke="#F5D061" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
          <path d="m16 8-8 8"/>
          <path d="M16 12v4h-4"/>
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          className="font-display"
          style={{
            fontSize: s.main,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
          }}
        >
          GUESS THE <span className="gold-gradient-text">SCRIPT</span>
        </span>
        <span
          style={{
            fontSize: s.sub,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginTop: '3px',
          }}
        >
          The Football Oracle
        </span>
      </div>
    </div>
  );
};
