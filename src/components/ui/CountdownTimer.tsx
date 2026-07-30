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
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-error)', fontWeight: 800, fontSize: '11px', letterSpacing: '0.1em' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', animation: 'pulse 1s infinite' }} />
        LIVE NOW
      </div>
    );
  }

  if (compact) {
    return (
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
        {parts.days > 0
          ? `${parts.days}d ${parts.hours}h`
          : parts.hours > 0
          ? `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
          : `${pad(parts.minutes)}:${pad(parts.seconds)}`}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
  <div
    style={{
      textAlign: 'center',
      minWidth: '42px',
      padding: '6px 8px',
      borderRadius: 'var(--radius-sm)',
      background: 'rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    }}
  >
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.4rem',
        fontWeight: 800,
        color: 'var(--color-accent)',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {pad(value)}
    </div>
    <div
      style={{
        fontSize: '8px',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
        marginTop: '3px',
      }}
    >
      {label}
    </div>
  </div>
);

const Separator: React.FC = () => (
  <span style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '1rem', lineHeight: 1, marginTop: '-10px' }}>
    :
  </span>
);

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
