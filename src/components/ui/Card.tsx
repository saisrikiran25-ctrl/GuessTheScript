import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'selected' | 'flat';
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
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    padding: paddingMap[padding],
    position: 'relative',
    transition: 'all var(--transition-base)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
    ...style,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'var(--color-surface)',
    },
    elevated: {
      background: 'var(--color-surface-2)',
      boxShadow: 'var(--shadow-md)',
    },
    selected: {
      background: 'var(--color-surface-2)',
      borderColor: 'var(--color-accent)',
      boxShadow: 'var(--shadow-accent)',
    },
    flat: {
      background: 'var(--color-surface)',
      border: 'none',
    },
  };

  const interactiveStyles: React.CSSProperties = interactive
    ? {
        cursor: 'pointer',
        userSelect: 'none',
      }
    : {};

  const accentStyles: React.CSSProperties = accentColor
    ? {
        borderLeft: `4px solid ${accentColor}`,
        paddingLeft: `calc(${paddingMap[padding]} - 3px)`,
      }
    : {};

  return (
    <div
      className={`card ${className}`}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...interactiveStyles,
        ...accentStyles,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
