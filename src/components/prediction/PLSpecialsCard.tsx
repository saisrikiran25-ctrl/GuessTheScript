import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/components/ui';
import { soundFx } from '@/utils/audio';
import { loadPLSpecialPrediction } from '@/utils/storage';
import {
  PLSpecialPrediction,
  isSpecialDeadlinePassed,
  formatDeadlineIST,
} from '@/data/specials';
import { PLSpecialsModal } from './PLSpecialsModal';

interface PLSpecialsCardProps {
  playerId: string;
}

export const PLSpecialsCard: React.FC<PLSpecialsCardProps> = ({ playerId }) => {
  const [prediction, setPrediction] = useState<PLSpecialPrediction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isLocked = isSpecialDeadlinePassed();

  const refreshPrediction = useCallback(() => {
    if (playerId) {
      const pred = loadPLSpecialPrediction(playerId);
      setPrediction(pred);
    }
  }, [playerId]);

  useEffect(() => {
    refreshPrediction();
  }, [refreshPrediction]);

  const hasAllThree = !!(
    prediction &&
    prediction.goldenBoot &&
    prediction.goldenGlove &&
    prediction.pfaPlayer
  );

  return (
    <>
      <div
        className="ticket-stub"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.14) 0%, rgba(22, 25, 41, 0.96) 100%)',
          border: '1.5px solid var(--color-border-accent)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(245, 208, 97, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            className="font-display"
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
            }}
          >
            PL SEASON SPECIALS · 1,500 PTS TOTAL
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: isLocked ? '#EF4444' : 'var(--color-text-secondary)',
              background: isLocked ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${isLocked ? 'rgba(239, 68, 68, 0.3)' : 'var(--color-border)'}`,
            }}
          >
            {isLocked ? '🔒 Locked' : `⏰ Deadline: ${formatDeadlineIST()}`}
          </span>
        </div>

        <div>
          <h2 className="type-h3 font-display gold-gradient-text" style={{ fontSize: '20px', fontWeight: 900 }}>
            Golden Boot, Glove & PFA Oracles
          </h2>
          <p style={{ fontSize: '13px', color: '#E2E8F0', marginTop: '4px', lineHeight: 1.5 }}>
            Predict the Premier League 2026/27 season award winners (+500 PTS each).
            Editable until Aug 26, 00:00 AM IST.
          </p>
        </div>

        {/* Prediction summary chips */}
        {hasAllThree ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              background: 'rgba(3, 4, 8, 0.6)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(245, 208, 97, 0.25)',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: '#F5D061', fontWeight: 800 }}>⚽ Golden Boot</div>
              <div className="font-display" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {prediction.goldenBoot}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#00F2FE', fontWeight: 800 }}>🧤 Golden Glove</div>
              <div className="font-display" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {prediction.goldenGlove}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#D946EF', fontWeight: 800 }}>👑 PFA Player</div>
              <div className="font-display" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {prediction.pfaPlayer}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            No special predictions submitted yet. Tap below to select your 3 season award winners.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              soundFx.playClick();
              setIsModalOpen(true);
            }}
          >
            {hasAllThree
              ? (isLocked ? '🔒 View Locked Oracles' : 'Edit Season Oracles →')
              : 'Make Special Predictions →'}
          </Button>
        </div>
      </div>

      <PLSpecialsModal
        playerId={playerId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={refreshPrediction}
      />
    </>
  );
};
