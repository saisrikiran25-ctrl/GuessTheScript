import React, { useState, useEffect, useRef } from 'react';

interface ScoreCounterProps {
  target: number;
  duration?: number; // ms
  size?: 'sm' | 'md' | 'lg';
  suffix?: string;
  color?: string;
}

export const ScoreCounter: React.FC<ScoreCounterProps> = ({
  target,
  duration = 1200,
  size = 'lg',
  suffix = '',
  color = 'var(--color-accent)',
}) => {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = Date.now();
    const startVal = 0;

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(startVal + (target - startVal) * eased);
      setCurrent(val);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  const sizeMap = {
    sm: '1.5rem',
    md: '2.5rem',
    lg: '3.75rem',
  };

  return (
    <span
      role="status"
      aria-label={`Score: ${current}${suffix}`}
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-display)',
        fontSize: sizeMap[size],
        fontWeight: 800,
        color,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        textShadow: color === 'var(--color-accent)' ? '0 0 20px rgba(245, 208, 97, 0.3)' : 'none',
      }}
    >
      {current}{suffix}
    </span>
  );
};
