import React from 'react';
import type { SidePredictionOption } from '@/types';

interface SidePredictionChipProps {
  option: SidePredictionOption;
  selectedAnswer: string | null;
  onSelect: (optionId: string, answer: string) => void;
  disabled?: boolean;
}

export const SidePredictionChip: React.FC<SidePredictionChipProps> = ({
  option,
  selectedAnswer,
  onSelect,
  disabled = false,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <span
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          lineHeight: 1.4,
        }}
      >
        {option.question}
      </span>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        {option.choices.map((choice) => {
          const isSelected = selectedAnswer === choice.value;
          return (
            <button
              key={choice.value}
              onClick={() => !disabled && onSelect(option.id, choice.value)}
              aria-pressed={isSelected}
              disabled={disabled}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: isSelected ? 'var(--color-accent-subtle)' : 'var(--color-surface-2)',
                color: isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: disabled ? 'default' : 'pointer',
                transition: 'all var(--transition-fast)',
                minHeight: 36,
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !disabled) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-text-muted)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
