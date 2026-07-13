import React, { useState, useEffect } from 'react';
import { getCountdownParts } from '@/utils/format';

interface CountdownTimerProps {
  kickoffISO: string;
  onExpired?: () => void;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  kickoffISO,
  onExpired,
  compact = false,
}) => {
  const [parts, setParts] = useState(() => getCountdownParts(kickoffISO));

  useEffect(() => {
    if (parts.total <= 0) {
      onExpired?.();
      return;
    }

    const interval = setInterval(() => {
      const p = getCountdownParts(kickoffISO);
      setParts(p);
      if (p.total <= 0) {
        clearInterval(interval);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [kickoffISO, onExpired]);

  if (parts.total <= 0) {
    return (
      <span style={{ color: 'var(--color-error)', fontWeight: 700, fontSize: 'var(--type-label)' }}>
        LIVE
      </span>
    );
  }

  if (compact) {
    return (
      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {parts.days > 0
          ? `${parts.days}d ${parts.hours}h`
          : parts.hours > 0
          ? `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
          : `${pad(parts.minutes)}:${pad(parts.seconds)}`}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
      {parts.days > 0 && (
        <CountUnit value={parts.days} label="days" />
      )}
      <CountUnit value={parts.hours} label="hrs" />
      <Separator />
      <CountUnit value={parts.minutes} label="min" />
      <Separator />
      <CountUnit value={parts.seconds} label="sec" />
    </div>
  );
};

const CountUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div style={{ textAlign: 'center', minWidth: '36px' }}>
    <div
      style={{
        fontSize: '1.5rem',
        fontWeight: 800,
        color: 'var(--color-text-primary)',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {pad(value)}
    </div>
    <div
      style={{
        fontSize: '9px',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
        marginTop: '2px',
      }}
    >
      {label}
    </div>
  </div>
);

const Separator: React.FC = () => (
  <span style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '1.2rem', lineHeight: 1, marginTop: '-8px' }}>
    :
  </span>
);

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
