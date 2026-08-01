import React from 'react';
import { soundFx } from '@/utils/audio';

const PL_MATCHES_URL = 'https://www.premierleague.com/en/matches/premier-league/2026-27/';

interface PLMatchHubLinkProps {
  compact?: boolean;
}

export const PLMatchHubLink: React.FC<PLMatchHubLinkProps> = ({ compact = false }) => {
  return (
    <a
      href={PL_MATCHES_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => soundFx.playClick()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: compact ? '10px 14px' : '14px 18px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(88, 24, 98, 0.45) 0%, rgba(22, 25, 41, 0.95) 100%)',
        border: '1px solid rgba(160, 70, 180, 0.45)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(88, 24, 98, 0.25)',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
        <div
          style={{
            width: compact ? 34 : 40,
            height: compact ? 34 : 40,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: '3px',
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/120px-Premier_League_Logo.svg.png"
            alt="Premier League"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div
            className="font-display"
            style={{
              fontSize: compact ? '12px' : '13px',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Premier League Official Match Hub
          </div>
          <div
            style={{
              fontSize: compact ? '10px' : '11px',
              color: 'var(--color-text-muted)',
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Official lineups, stats & match info
          </div>
        </div>
      </div>

      <div
        className="font-display"
        style={{
          padding: compact ? '6px 12px' : '8px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(245, 208, 97, 0.18)',
          border: '1px solid var(--color-border-accent)',
          color: 'var(--color-accent)',
          fontSize: compact ? '10px' : '11px',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginLeft: '10px',
        }}
      >
        <span>Details</span>
        <span style={{ fontSize: '12px' }}>↗</span>
      </div>
    </a>
  );
};
