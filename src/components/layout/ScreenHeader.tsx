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

      {/* ── Iconic GTS Emblem: Shield + Football + Script Quill + Oracle Star ── */}
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
          style={{ display: 'block', filter: 'drop-shadow(0 2px 8px rgba(245, 208, 97, 0.25))' }}
        >
          <defs>
            {/* Rich gold metallic gradient */}
            <linearGradient id="gts-gold-metal" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF2AD" />
              <stop offset="35%" stopColor="#F5D061" />
              <stop offset="70%" stopColor="#D49B24" />
              <stop offset="100%" stopColor="#996D13" />
            </linearGradient>

            {/* Dark inner shield gradient */}
            <linearGradient id="gts-shield-bg" x1="20" y1="4" x2="20" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1B1E32" />
              <stop offset="100%" stopColor="#080A12" />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="gts-gold-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Badge Background Shield — Single Clean Crest Border */}
          <path
            d="M 20 4 L 33 9.5 L 33 21.5 C 33 29 20 35.5 20 35.5 C 20 35.5 7 29 7 21.5 L 7 9.5 Z"
            fill="url(#gts-shield-bg)"
            stroke="url(#gts-gold-metal)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* ── Clip path for inner shield pattern ── */}
          <clipPath id="gts-inner-shield-clip">
            <path d="M 20 4.5 L 32.5 9.8 L 32.5 21.5 C 32.5 28.5 20 34.8 20 34.8 C 20 34.8 7.5 28.5 7.5 21.5 L 7.5 9.8 Z" />
          </clipPath>

          {/* ── Complete Football Geodesic Pattern Across Entire Crest ── */}
          <g clipPath="url(#gts-inner-shield-clip)">
            {/* Center Pentagon Patch */}
            <polygon
              points="20,13 24.75,16.45 22.94,22.05 17.06,22.05 15.25,16.45"
              fill="url(#gts-gold-metal)"
              opacity="0.35"
            />
            <polygon
              points="20,13 24.75,16.45 22.94,22.05 17.06,22.05 15.25,16.45"
              fill="none"
              stroke="url(#gts-gold-metal)"
              strokeWidth="1.2"
              opacity="0.9"
            />

            {/* Top Outer Patch */}
            <polygon
              points="20,13 24.75,16.45 29.5,13.5 26.5,8 20,7"
              fill="url(#gts-gold-metal)"
              opacity="0.12"
            />
            {/* Bottom-Right Outer Patch */}
            <polygon
              points="22.94,22.05 24.75,16.45 30,15 31.5,22 26.5,27.5"
              fill="url(#gts-gold-metal)"
              opacity="0.12"
            />
            {/* Bottom-Left Outer Patch */}
            <polygon
              points="17.06,22.05 15.25,16.45 10,15 8.5,22 13.5,27.5"
              fill="url(#gts-gold-metal)"
              opacity="0.12"
            />

            {/* Radiating Pentagon Edge Lines to Outer Crest Boundaries */}
            <line x1="20" y1="13" x2="20" y2="4.5" stroke="url(#gts-gold-metal)" strokeWidth="1" opacity="0.65" />
            <line x1="24.75" y1="16.45" x2="32.5" y2="13.5" stroke="url(#gts-gold-metal)" strokeWidth="1" opacity="0.65" />
            <line x1="22.94" y1="22.05" x2="28" y2="29" stroke="url(#gts-gold-metal)" strokeWidth="1" opacity="0.65" />
            <line x1="17.06" y1="22.05" x2="12" y2="29" stroke="url(#gts-gold-metal)" strokeWidth="1" opacity="0.65" />
            <line x1="15.25" y1="16.45" x2="7.5" y2="13.5" stroke="url(#gts-gold-metal)" strokeWidth="1" opacity="0.65" />

            {/* Lower Crest Seam Splines for full vertical coverage */}
            <line x1="20" y1="22.05" x2="20" y2="34.8" stroke="url(#gts-gold-metal)" strokeWidth="1" opacity="0.6" />
            <line x1="22.94" y1="22.05" x2="17.06" y2="22.05" stroke="url(#gts-gold-metal)" strokeWidth="1" opacity="0.6" />
          </g>
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

