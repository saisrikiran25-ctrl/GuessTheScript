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
    sm: { main: '13px', sub: '7.5px', emblem: 32 },
    md: { main: '16px', sub: '8.5px', emblem: 40 },
    lg: { main: '21px', sub: '10px',  emblem: 50 },
  };

  const s = sizeMap[size];
  const e = s.emblem;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

      {/* ── Emblem: clean pill container + quill icon ─────────── */}
      <div
        style={{
          width: e,
          height: e,
          borderRadius: Math.round(e * 0.28),
          background: 'linear-gradient(145deg, rgba(245,208,97,0.18) 0%, rgba(201,158,46,0.06) 100%)',
          border: '1.5px solid rgba(245,208,97,0.45)',
          boxShadow: '0 0 14px rgba(245,208,97,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={Math.round(e * 0.58)}
          height={Math.round(e * 0.58)}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gts-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFE580" />
              <stop offset="100%" stopColor="#C99E2E" />
            </linearGradient>
          </defs>
          {/* Quill diagonal stroke */}
          <path
            d="M18 3 C20 3 21 5 19 7 L8 20"
            stroke="url(#gts-g)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Nib tip */}
          <path
            d="M8 20 L6 22 L10 21 Z"
            fill="url(#gts-g)"
          />
          {/* Ruled line 1 */}
          <line x1="4" y1="16" x2="13" y2="13" stroke="url(#gts-g)" strokeWidth="1.4" strokeLinecap="round" opacity="0.65" />
          {/* Ruled line 2 */}
          <line x1="4" y1="19.5" x2="10" y2="17.5" stroke="url(#gts-g)" strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
        </svg>
      </div>

      {/* ── Wordmark text ──────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          className="font-display"
          style={{
            fontSize: s.main,
            fontWeight: 900,
            letterSpacing: '-0.01em',
            color: 'var(--color-text-primary)',
          }}
        >
          GUESS THE{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #FFE580 0%, #F5D061 50%, #C99E2E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SCRIPT
          </span>
        </span>
        <span
          style={{
            fontSize: s.sub,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(245, 208, 97, 0.55)',
            marginTop: '3px',
          }}
        >
          Your Narrative
        </span>
      </div>
    </div>
  );
};

