import React from 'react';
import type { ScriptOption } from '@/types';

interface ScriptCardProps {
  script: ScriptOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
  index?: number;
  disabled?: boolean;
}

export const ScriptCard: React.FC<ScriptCardProps> = ({
  script,
  isSelected,
  onSelect,
  index = 0,
  disabled = false,
}) => {
  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect(script.id)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          onSelect(script.id);
        }
      }}
      className="animate-fadeInUp"
      style={{
        animationDelay: `${index * 60}ms`,
        animationFillMode: 'both',
        cursor: disabled ? 'default' : 'pointer',
        background: isSelected ? 'var(--color-surface-2)' : 'var(--color-surface)',
        border: `1.5px solid ${isSelected ? script.familyColor : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        borderLeft: `4px solid ${script.familyColor}`,
        padding: 'var(--space-4) var(--space-5)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        transition: 'all var(--transition-base)',
        boxShadow: isSelected ? `0 0 0 1px ${script.familyColor}22, 0 4px 16px rgba(0,0,0,0.3)` : 'none',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Selected glow overlay */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${script.familyColor}08 0%, transparent 60%)`,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div style={{ flex: 1, zIndex: 1 }}>
        {/* Family label + check */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: script.familyColor,
            }}
          >
            {script.familyLabel}
          </span>
          {isSelected && (
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: script.familyColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'scaleIn 150ms ease-out',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          )}
        </div>

        {/* Script label */}
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
            lineHeight: 1.2,
            marginBottom: 'var(--space-2)',
          }}
        >
          {script.label}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {script.description}
        </p>
      </div>
    </div>
  );
};
