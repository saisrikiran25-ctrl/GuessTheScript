import React from 'react';
import styles from './Button.module.css';
import { soundFx } from '@/utils/audio';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      soundFx.playClick();
      if (onClick) onClick(e);
    };

    const classes = [
      styles.btn,
      styles[`btn--${variant}`],
      styles[`btn--${size}`],
      fullWidth ? styles['btn--full'] : '',
      loading ? styles['btn--loading'] : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          <>
            {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
