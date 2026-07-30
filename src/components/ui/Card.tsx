import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'selected' | 'ticket' | 'gold';
  accentColor?: string;  // for left-border family color
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  accentColor,
  padding = 'md',
  interactive = false,
  children,
  style,
  className = '',
  ...props
}) => {
  const paddingMap = {
    none: '0',
    sm: 'var(--space-3)',
    md: 'var(--space-5)',
    lg: 'var(--space-6)',
  };

  const baseStyles: React.CSSProperties = {
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    padding: paddingMap[padding],
    position: 'relative',
    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
    ...style,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'var(--color-surface-card)',
    },
    elevated: {
      background: 'var(--color-surface-elevated)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
    },
    selected: {
      background: 'var(--color-surface-elevated)',
      borderColor: 'var(--color-accent)',
      boxShadow: '0 0 24px rgba(245, 208, 97, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    },
    gold: {
      background: 'linear-gradient(145deg, rgba(35, 30, 15, 0.9) 0%, rgba(18, 20, 34, 0.9) 100%)',
      border: '1px solid var(--color-border-accent)',
      boxShadow: '0 0 20px rgba(245, 208, 97, 0.18)',
    },
    ticket: {
      background: 'var(--color-surface-card)',
    },
  };

  const accentStyles: React.CSSProperties = accentColor
    ? {
        borderLeft: `4px solid ${accentColor}`,
      }
    : {};

  return (
    <div
      className={`card ${variant === 'ticket' ? 'ticket-stub' : ''} ${className}`}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...(interactive ? { cursor: 'pointer', userSelect: 'none' } : {}),
        ...accentStyles,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
