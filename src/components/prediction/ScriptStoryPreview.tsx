import React from 'react';
import type { Match, ScriptOption, SidePredictionOption } from '@/types';

interface ScriptStoryPreviewProps {
  match: Match;
  selectedScript?: ScriptOption;
  selectedSideOptions: Record<string, string>;
  predictedScore?: { teamA: number; teamB: number };
}

export const ScriptStoryPreview: React.FC<ScriptStoryPreviewProps> = ({
  match,
  selectedScript,
  selectedSideOptions,
  predictedScore,
}) => {
  const getStoryText = () => {
    if (!selectedScript) {
      return 'Select a primary script option below to generate your match narrative press draft...';
    }

    let text = `In an extraordinary ${match.label} fixture at ${match.city}, ${match.teamA.name} and ${match.teamB.name} collided in a match defined by standard-setting tactical high drama. `;

    text += `The narrative unfolded strictly according to the "${selectedScript.label}" script: ${selectedScript.description} `;

    // Append side predictions if selected
    match.sideOptions.forEach((q: SidePredictionOption) => {
      const selectedId = selectedSideOptions[q.id];
      if (selectedId) {
        const choice = q.choices.find((c) => c.value === selectedId);
        if (choice) {
          text += `Furthermore, key moments witnessed ${choice.label.toLowerCase()}. `;
        }
      }
    });

    if (predictedScore) {
      text += `When the final whistle blew, the scoreboard read ${match.teamA.shortCode} ${predictedScore.teamA} – ${predictedScore.teamB} ${match.teamB.shortCode}.`;
    }

    return text;
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(22, 25, 41, 0.95) 0%, rgba(14, 16, 26, 0.95) 100%)',
        border: '1px solid var(--color-border-accent)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Top Stamp Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)' }} />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-display)',
            }}
          >
            OFFICIAL MATCH SCRIPT DRAFT
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#CBD5E1', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
          YOUR NARRATIVE
        </span>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: selectedScript ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          lineHeight: 1.6,
          fontStyle: selectedScript ? 'normal' : 'italic',
        }}
      >
        "{getStoryText()}"
      </div>

      {selectedScript && (
        <div
          style={{
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            NARRATIVE CLASSIFICATION
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              background: `${selectedScript.familyColor}22`,
              color: selectedScript.familyColor,
              border: `1px solid ${selectedScript.familyColor}44`,
            }}
          >
            {selectedScript.familyLabel}
          </span>
        </div>
      )}
    </div>
  );
};
