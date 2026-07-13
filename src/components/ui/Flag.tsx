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
  size = '1.2em',
  style,
  className = '',
}) => {
  if (team.flagCode) {
    return (
      <img
        src={`https://flagcdn.com/w40/${team.flagCode}.png`}
        srcSet={`https://flagcdn.com/w80/${team.flagCode}.png 2x`}
        alt={`${team.name} flag`}
        className={className}
        style={{
          width: size,
          height: 'auto',
          aspectRatio: '4/3',
          objectFit: 'cover',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
          display: 'inline-block',
          verticalAlign: 'middle',
          ...style,
        }}
      />
    );
  }

  // Fallback to emoji character (e.g. for TBD teams where flagEmoji is '🏆')
  return (
    <span
      className={className}
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      }}
    >
      {team.flagEmoji}
    </span>
  );
};
