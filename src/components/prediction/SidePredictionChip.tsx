import React from 'react';
import type { SidePredictionOption } from '@/types';
import { soundFx } from '@/utils/audio';

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
  const handleSelectChoice = (choiceVal: string) => {
    if (disabled) return;
    soundFx.playSelect();
    onSelect(option.id, choiceVal);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <span
        style={{
          fontSize: '13px',
          fontWeight: 700,
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
              onClick={() => handleSelectChoice(choice.value)}
              aria-pressed={isSelected}
              disabled={disabled}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: isSelected ? 'var(--color-accent-subtle)' : 'var(--color-surface-elevated)',
                color: isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontSize: '12px',
                fontFamily: 'var(--font-display)',
                fontWeight: isSelected ? 800 : 600,
                cursor: disabled ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                minHeight: 38,
                letterSpacing: '0.04em',
                boxShadow: isSelected ? '0 0 16px rgba(245, 208, 97, 0.2)' : 'none',
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
