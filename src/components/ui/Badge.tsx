import React from 'react';
import type { BadgeDefinition } from '@/types';

interface BadgeProps {
  badge: BadgeDefinition;
  size?: 'sm' | 'md' | 'lg';
  locked?: boolean;
  showLabel?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  badge,
  size = 'md',
  locked = false,
  showLabel = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: '16px', label: '10px', padding: '2px 8px', gap: '4px', radius: '4px' },
    md: { icon: '20px', label: '11px', padding: '4px 10px', gap: '6px', radius: '6px' },
    lg: { icon: '24px', label: '13px', padding: '6px 14px', gap: '8px', radius: '8px' },
  };

  const rarityColors = {
    common: { bg: 'rgba(155, 155, 176, 0.1)', border: 'rgba(155, 155, 176, 0.3)', text: '#9B9BB0' },
    rare: { bg: 'rgba(74, 144, 217, 0.1)', border: 'rgba(74, 144, 217, 0.3)', text: '#4A90D9' },
    legendary: { bg: 'rgba(212, 168, 67, 0.12)', border: 'rgba(212, 168, 67, 0.4)', text: '#D4A843' },
  };

  const s = sizeMap[size];
  const colors = locked
    ? { bg: 'rgba(94, 94, 120, 0.08)', border: 'rgba(94, 94, 120, 0.2)', text: '#5E5E78' }
    : rarityColors[badge.rarity];

  return (
    <div
      className={className}
      title={badge.description}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        padding: s.padding,
        borderRadius: s.radius,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        opacity: locked ? 0.5 : 1,
        transition: 'all var(--transition-base)',
      }}
    >
      <span style={{ fontSize: s.icon, lineHeight: 1 }}>
        {locked ? '🔒' : badge.icon}
      </span>
      {showLabel && (
        <span
          style={{
            fontSize: s.label,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {badge.label}
        </span>
      )}
    </div>
  );
};
