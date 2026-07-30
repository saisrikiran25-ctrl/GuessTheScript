import React from 'react';
import type { ScriptOption } from '@/types';
import { soundFx } from '@/utils/audio';

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
  const handleSelect = () => {
    if (disabled) return;
    soundFx.playStamp();
    onSelect(script.id);
  };

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={disabled ? -1 : 0}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          handleSelect();
        }
      }}
      className={`animate-fadeInUp ${isSelected ? 'animate-stampDown' : ''}`}
      style={{
        animationDelay: `${index * 60}ms`,
        animationFillMode: 'both',
        cursor: disabled ? 'default' : 'pointer',
        background: isSelected
          ? `linear-gradient(135deg, ${script.familyColor}15 0%, var(--color-surface-elevated) 100%)`
          : 'var(--color-surface-card)',
        border: `1.5px solid ${isSelected ? script.familyColor : 'var(--color-border)'}`,
        borderLeft: `5px solid ${script.familyColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-4)',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isSelected
          ? `0 0 24px ${script.familyColor}33, 0 8px 32px rgba(0,0,0,0.5)`
          : '0 4px 20px rgba(0,0,0,0.3)',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Selected glow accent line */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: script.familyColor,
            boxShadow: `0 0 10px ${script.familyColor}`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div style={{ flex: 1, zIndex: 1 }}>
        {/* Family label + check */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <span
            className="font-display"
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: script.familyColor,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              background: `${script.familyColor}15`,
              border: `1px solid ${script.familyColor}33`,
            }}
          >
            {script.familyLabel}
          </span>

          {isSelected && (
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: script.familyColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 12px ${script.familyColor}`,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#030408" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          )}
        </div>

        {/* Script label */}
        <h3
          className="font-display"
          style={{
            fontSize: '16px',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            lineHeight: 1.25,
            marginBottom: 'var(--space-2)',
            marginTop: 'var(--space-2)',
          }}
        >
          {script.label}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.55,
          }}
        >
          {script.description}
        </p>
      </div>
    </div>
  );
};
