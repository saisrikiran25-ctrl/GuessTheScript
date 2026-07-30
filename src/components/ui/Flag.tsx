import React from 'react';
import type { Team } from '@/types';

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
  if (team.flagCode) {
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
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    );
  }

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
        background: 'rgba(245, 208, 97, 0.15)',
        border: '1.5px solid var(--color-border-accent)',
        fontSize: `calc(${size} * 0.55)`,
        flexShrink: 0,
        ...style,
      }}
    >
      {team.flagEmoji}
    </div>
  );
};
