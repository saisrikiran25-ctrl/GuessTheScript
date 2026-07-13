import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--radius-sm)',
  className = '',
}) => {
  return (
    <div
      className={`shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  );
};

// ─── Preset skeletons ────────────────────────────────────────

export const SkeletonMatchCard: React.FC = () => (
  <div
    style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
    }}
  >
    <Skeleton height="12px" width="80px" />
    <Skeleton height="28px" width="70%" />
    <Skeleton height="16px" width="50%" />
    <Skeleton height="44px" width="100%" borderRadius="var(--radius-md)" />
  </div>
);

export const SkeletonLeaderboardRow: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-3) var(--space-4)',
    }}
  >
    <Skeleton width="24px" height="24px" borderRadius="50%" />
    <Skeleton width="36px" height="36px" borderRadius="50%" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Skeleton height="14px" width="60%" />
      <Skeleton height="11px" width="40%" />
    </div>
    <Skeleton height="22px" width="52px" borderRadius="var(--radius-full)" />
  </div>
);
