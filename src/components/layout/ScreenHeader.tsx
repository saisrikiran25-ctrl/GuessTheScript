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

      {/* ── Bespoke Emblem ─────────────────────────────────────── */}
      <div
        style={{
          width: e,
          height: e,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <svg
          width={e}
          height={e}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Main gold gradient */}
            <linearGradient id="gts-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFE580" />
              <stop offset="55%" stopColor="#F5D061" />
              <stop offset="100%" stopColor="#C99E2E" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="gts-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Shield clip */}
            <clipPath id="gts-shield-clip">
              <path d="M20 3 L34 9 L34 22 Q34 31 20 37 Q6 31 6 22 L6 9 Z" />
            </clipPath>
          </defs>

          {/* ── Outer shield fill (dark) ── */}
          <path
            d="M20 3 L34 9 L34 22 Q34 31 20 37 Q6 31 6 22 L6 9 Z"
            fill="url(#gts-gold)"
            opacity="0.13"
          />

          {/* ── Shield border ── */}
          <path
            d="M20 3 L34 9 L34 22 Q34 31 20 37 Q6 31 6 22 L6 9 Z"
            fill="none"
            stroke="url(#gts-gold)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            filter="url(#gts-glow)"
          />

          {/* ── Inner shield inset line ── */}
          <path
            d="M20 7 L30 11.5 L30 21.5 Q30 28.5 20 33.5 Q10 28.5 10 21.5 L10 11.5 Z"
            fill="none"
            stroke="url(#gts-gold)"
            strokeWidth="0.7"
            opacity="0.45"
          />

          {/* ── Football seam lines clipped to shield ── */}
          <g clipPath="url(#gts-shield-clip)" opacity="0.2">
            {/* horizontal middle */}
            <line x1="6" y1="20" x2="34" y2="20" stroke="#F5D061" strokeWidth="0.8" />
            {/* vertical centre */}
            <line x1="20" y1="3" x2="20" y2="37" stroke="#F5D061" strokeWidth="0.8" />
            {/* top-left arc */}
            <path d="M6 14 Q13 16 20 14" stroke="#F5D061" strokeWidth="0.8" fill="none" />
            {/* bottom-right arc */}
            <path d="M20 26 Q27 24 34 26" stroke="#F5D061" strokeWidth="0.8" fill="none" />
          </g>

          {/* ── Quill / Script stroke — the hero icon ── */}
          {/* Quill body */}
          <path
            d="M27 10 Q31 13 28 20 Q25 26 15 29"
            stroke="url(#gts-gold)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            filter="url(#gts-glow)"
          />
          {/* Quill nib */}
          <path
            d="M15 29 L17 24 L20 27 Z"
            fill="url(#gts-gold)"
            opacity="0.9"
          />
          {/* Quill feather top curl */}
          <path
            d="M27 10 Q24 7 22 9 Q25 11 27 10"
            fill="url(#gts-gold)"
            opacity="0.8"
          />
          {/* Writing line 1 */}
          <line x1="13" y1="22" x2="21" y2="19" stroke="url(#gts-gold)" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
          {/* Writing line 2 (shorter, below) */}
          <line x1="13" y1="25" x2="18" y2="23" stroke="url(#gts-gold)" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />

          {/* ── Dot accent at shield crown ── */}
          <circle cx="20" cy="5.5" r="1.2" fill="url(#gts-gold)" opacity="0.9" filter="url(#gts-glow)" />
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

