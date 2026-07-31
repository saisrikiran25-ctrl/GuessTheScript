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
    sm: { icon: '14px', label: '10px', padding: '3px 8px', gap: '4px', radius: 'var(--radius-full)' },
    md: { icon: '18px', label: '11px', padding: '5px 12px', gap: '6px', radius: 'var(--radius-full)' },
    lg: { icon: '22px', label: '13px', padding: '8px 16px', gap: '8px', radius: 'var(--radius-full)' },
  };

  const rarityColors = {
    common: { bg: 'rgba(203, 213, 225, 0.1)', border: 'rgba(203, 213, 225, 0.25)', text: '#CBD5E1', shadow: 'none' },
    rare: { bg: 'rgba(0, 242, 254, 0.12)', border: 'rgba(0, 242, 254, 0.4)', text: '#00F2FE', shadow: '0 0 12px rgba(0, 242, 254, 0.2)' },
    legendary: { bg: 'rgba(245, 208, 97, 0.15)', border: 'rgba(245, 208, 97, 0.5)', text: '#F5D061', shadow: '0 0 16px rgba(245, 208, 97, 0.25)' },
  };

  const s = sizeMap[size];
  const colors = locked
    ? { bg: 'rgba(148, 163, 184, 0.08)', border: 'rgba(148, 163, 184, 0.2)', text: '#94A3B8', shadow: 'none' }
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
        boxShadow: colors.shadow,
        opacity: locked ? 0.55 : 1,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'all 0.2s ease',
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
            letterSpacing: '0.08em',
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
