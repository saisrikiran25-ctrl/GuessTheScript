import React, { useState } from 'react';
import type { Team } from '@/types';
import { getTeamBadgeUrl } from '@/data/teams';

interface FlagProps {
  team: Team;
  size?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const Flag: React.FC<FlagProps> = ({
  team,
  size = '28px',
  style,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const badgeUrl = getTeamBadgeUrl(team);

  if (badgeUrl && !imgError) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '3px',
          flexShrink: 0,
          ...style,
        }}
      >
        <img
          src={badgeUrl}
          alt={`${team.name} crest`}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.6))',
          }}
        />
      </div>
    );
  }

  // Country flag fallback
  if (team.flagCode && !imgError) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-surface-elevated)',
          flexShrink: 0,
          ...style,
        }}
      >
        <img
          src={`https://flagcdn.com/w80/${team.flagCode}.png`}
          alt={`${team.name} flag`}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    );
  }

  // Fallback circle with shortCode
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: team.primaryColor ? `${team.primaryColor}33` : 'rgba(245, 208, 97, 0.15)',
        border: `1.5px solid ${team.primaryColor || 'var(--color-border-accent)'}`,
        fontSize: `calc(${size} * 0.42)`,
        fontWeight: 800,
        color: '#FFF',
        flexShrink: 0,
        ...style,
      }}
    >
      {team.shortCode.slice(0, 3)}
    </div>
  );
};
