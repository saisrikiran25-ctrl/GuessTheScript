import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { soundFx } from '@/utils/audio';
import {
  PLSpecialPrediction,
  SPECIAL_DEADLINE_ISO,
  SPECIAL_CATEGORY_POINTS,
  SPECIAL_TOTAL_POINTS,
  GOLDEN_BOOT_SUGGESTIONS,
  GOLDEN_GLOVE_SUGGESTIONS,
  PFA_PLAYER_SUGGESTIONS,
  formatDeadlineIST,
  isSpecialDeadlinePassed,
} from '@/data/specials';
import { savePLSpecialPrediction, loadPLSpecialPrediction } from '@/utils/storage';
import { syncUploadPLSpecialPrediction } from '@/utils/sync';

interface PLSpecialsModalProps {
  playerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const PLSpecialsModal: React.FC<PLSpecialsModalProps> = ({
  playerId,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { showToast } = useToast();
  const isLocked = isSpecialDeadlinePassed();

  const [goldenBoot, setGoldenBoot] = useState('');
  const [goldenGlove, setGoldenGlove] = useState('');
  const [pfaPlayer, setPfaPlayer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && playerId) {
      const existing = loadPLSpecialPrediction(playerId);
      if (existing) {
        setGoldenBoot(existing.goldenBoot || '');
        setGoldenGlove(existing.goldenGlove || '');
        setPfaPlayer(existing.pfaPlayer || '');
      }
    }
  }, [isOpen, playerId]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (isLocked) {
      showToast({ type: 'error', message: 'Predictions locked on Aug 26, 00:00 AM IST.' });
      return;
    }

    if (!goldenBoot.trim() || !goldenGlove.trim() || !pfaPlayer.trim()) {
      showToast({ type: 'error', message: 'Please complete predictions for all 3 categories.' });
      return;
    }

    const hasMultiName = (val: string) => val.includes(',') || val.includes('/') || val.includes('&') || /\band\b/i.test(val);

    if (hasMultiName(goldenBoot) || hasMultiName(goldenGlove) || hasMultiName(pfaPlayer)) {
      showToast({
        type: 'error',
        message: 'Anti-cheat rule: Please enter ONLY ONE full player name per category (no commas or multiple names).',
      });
      return;
    }

    soundFx.playStamp();
    setIsSubmitting(true);

    const pred: PLSpecialPrediction = {
      playerId,
      goldenBoot: goldenBoot.trim(),
      goldenGlove: goldenGlove.trim(),
      pfaPlayer: pfaPlayer.trim(),
      submittedAt: new Date().toISOString(),
      isLocked: false,
    };

    savePLSpecialPrediction(pred);
    await syncUploadPLSpecialPrediction(pred);

    setIsSubmitting(false);
    showToast({ type: 'success', message: 'Season POTS saved! Editable until Aug 26, 00:00 AM IST. 🏆' });

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 4, 8, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 'var(--space-4)',
        overflowY: 'auto',
      }}
    >
      <Card
        variant="elevated"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          border: '1.5px solid var(--color-border-accent)',
          background: 'linear-gradient(145deg, rgba(22, 25, 41, 0.98) 0%, rgba(14, 16, 26, 0.98) 100%)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 208, 97, 0.15)',
          overflowY: 'auto',
          padding: '24px',
        }}
      >
        {/* Header */}
        <div>
          <div
            className="font-display"
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: '4px',
            }}
          >
            PREMIER LEAGUE 2026/27 · 1,500 PTS TOTAL
          </div>
          <h2 className="type-h3 font-display gold-gradient-text" style={{ fontSize: '22px', fontWeight: 900 }}>
            PL Season Special Predictions
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
            Each category awards <strong style={{ color: 'var(--color-accent)' }}>+500 PTS</strong> for exact matching predictions.
          </p>
        </div>

        {/* Deadline Alert Banner */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: isLocked ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 208, 97, 0.12)',
            border: `1px solid ${isLocked ? 'rgba(239, 68, 68, 0.3)' : 'var(--color-border-accent)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px' }}>{isLocked ? '🔒' : '⏰'}</span>
          <div style={{ fontSize: '11px', color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
            <strong>Deadline:</strong> {formatDeadlineIST()} ({isLocked ? 'LOCKED' : 'Editable until deadline'})
            <div style={{ color: 'var(--color-text-muted)', fontSize: '10px', marginTop: '2px' }}>
              Ensure exact full player name as in official match lineups.
            </div>
          </div>
        </div>

        {/* Strict Anti-Cheat Banner */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '16px' }}>🛡️</span>
          <div style={{ fontSize: '11px', color: '#F87171', lineHeight: 1.5 }}>
            <strong style={{ color: '#FF8A8A' }}>STRICT ANTI-CHEAT RULE:</strong> Write the exact full name of ONE player as mentioned in the match lineup (e.g. <em>Bukayo Saka</em> or <em>Erling Haaland</em>). Points are provided ONLY if the name matches exactly. Writing multiple names, commas, or extra text will void your prediction and score 0 points.
          </div>
        </div>

        {/* Category 1: Golden Boot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="font-display" style={{ fontSize: '12px', fontWeight: 800, color: '#F5D061' }}>
            ⚽ Golden Boot Winner (+500 PTS)
          </label>
          <input
            type="text"
            placeholder="e.g. Erling Haaland"
            value={goldenBoot}
            onChange={(e) => setGoldenBoot(e.target.value)}
            disabled={isLocked}
            style={{
              height: '46px',
              background: 'var(--color-bg)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0 14px',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
            }}
          />
          {!isLocked && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {GOLDEN_BOOT_SUGGESTIONS.slice(0, 5).map((name) => (
                <button
                  key={name}
                  onClick={() => { soundFx.playClick(); setGoldenBoot(name); }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: goldenBoot === name ? 'rgba(245, 208, 97, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${goldenBoot === name ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    color: goldenBoot === name ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category 2: Golden Glove */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="font-display" style={{ fontSize: '12px', fontWeight: 800, color: '#00F2FE' }}>
            🧤 Golden Glove Winner (+500 PTS)
          </label>
          <input
            type="text"
            placeholder="e.g. David Raya"
            value={goldenGlove}
            onChange={(e) => setGoldenGlove(e.target.value)}
            disabled={isLocked}
            style={{
              height: '46px',
              background: 'var(--color-bg)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0 14px',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
            }}
          />
          {!isLocked && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {GOLDEN_GLOVE_SUGGESTIONS.slice(0, 5).map((name) => (
                <button
                  key={name}
                  onClick={() => { soundFx.playClick(); setGoldenGlove(name); }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: goldenGlove === name ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${goldenGlove === name ? '#00F2FE' : 'var(--color-border)'}`,
                    color: goldenGlove === name ? '#00F2FE' : 'var(--color-text-secondary)',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category 3: PFA Player of the Season */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="font-display" style={{ fontSize: '12px', fontWeight: 800, color: '#D946EF' }}>
            👑 PFA Player of the Season (+500 PTS)
          </label>
          <input
            type="text"
            placeholder="e.g. Bukayo Saka"
            value={pfaPlayer}
            onChange={(e) => setPfaPlayer(e.target.value)}
            disabled={isLocked}
            style={{
              height: '46px',
              background: 'var(--color-bg)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0 14px',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
            }}
          />
          {!isLocked && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {PFA_PLAYER_SUGGESTIONS.slice(0, 5).map((name) => (
                <button
                  key={name}
                  onClick={() => { soundFx.playClick(); setPfaPlayer(name); }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: pfaPlayer === name ? 'rgba(217, 70, 239, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${pfaPlayer === name ? '#D946EF' : 'var(--color-border)'}`,
                    color: pfaPlayer === name ? '#D946EF' : 'var(--color-text-secondary)',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>
            Close
          </Button>
          {!isLocked && (
            <Button variant="primary" loading={isSubmitting} onClick={handleSave} style={{ flex: 2 }}>
              Lock In Season POTS →
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
