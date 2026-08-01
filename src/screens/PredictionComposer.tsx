import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScriptCard } from '@/components/prediction/ScriptCard';
import { SidePredictionChip } from '@/components/prediction/SidePredictionChip';
import { ScriptStoryPreview } from '@/components/prediction/ScriptStoryPreview';
import { Button, Flag } from '@/components/ui';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useMatches } from '@/store/matchStore';
import { usePlayer } from '@/store/playerStore';
import { savePrediction } from '@/utils/storage';
import { isBeforeKickoff } from '@/utils/format';
import { getScriptById, getScriptsForMatch } from '@/data/scripts';
import { Analytics } from '@/utils/analytics';
import { useToast } from '@/components/ui/Toast';
import { soundFx } from '@/utils/audio';
import { PLMatchHubLink } from '@/components/match/PLMatchHubLink';
import type { PlayerPrediction } from '@/types';

type Step = 1 | 2 | 3;

export const PredictionComposer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getMatch } = useMatches();
  const { state: playerState } = usePlayer();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const match = getMatch(id ?? '');
  const player = playerState.player;

  const [step, setStep] = useState<Step>(1);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [sideSelections, setSideSelections] = useState<Record<string, string>>({});
  const [isLocking, setIsLocking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Guards
  if (!match || !player) {
    navigate('/');
    return null;
  }

  if (!isBeforeKickoff(match.kickoff)) {
    showToast({ type: 'error', message: 'The whistle has blown. Scripts are locked.' });
    navigate(`/match/${id}`);
    return null;
  }

  const handleScriptSelect = useCallback((scriptId: string) => {
    setSelectedScriptId((prev) => (prev === scriptId ? null : scriptId));
    Analytics.scriptSelected(match.id, scriptId);
  }, [match.id]);

  const handleSideSelect = useCallback((optionId: string, answer: string) => {
    setSideSelections((prev) => ({ ...prev, [optionId]: answer }));
    Analytics.sidePredSelected(match.id, optionId, answer);
  }, [match.id]);

  const handleLock = useCallback(async () => {
    if (!selectedScriptId) return;
    setIsLocking(true);
    soundFx.playStamp();

    const prediction: PlayerPrediction = {
      matchId: match.id,
      playerId: player.id,
      scriptId: selectedScriptId,
      sideSelections: Object.entries(sideSelections).map(([optionId, answer]) => ({ optionId, answer })),
      submittedAt: new Date().toISOString(),
      isLocked: true,
    };

    savePrediction(prediction);
    Analytics.predictionSubmitted(match.id, selectedScriptId, prediction.sideSelections.length);

    setIsLocked(true);
    soundFx.playTriumph();
    await new Promise((r) => setTimeout(r, 1400));
    navigate(`/match/${match.id}`, { replace: true });
  }, [selectedScriptId, sideSelections, match.id, player.id, navigate]);

  const selectedScript = selectedScriptId ? getScriptById(selectedScriptId) : null;

  const STEP_LABELS = ['Primary Script', 'Side Plot Twists', 'Press Lock'];

  return (
    <div
      className="screen screen--no-nav"
      style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}
    >
      <ScreenHeader
        showBack
        title={match.label}
        rightAction={
          <div className="font-display" style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 800 }}>
            STEP {step} / 3
          </div>
        }
      />

      {/* Step Indicator */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface-card)',
        }}
      >
        {STEP_LABELS.map((label, i) => {
          const stepNum = (i + 1) as Step;
          const isActive = stepNum === step;
          const isComplete = stepNum < step;
          return (
            <div
              key={stepNum}
              style={{
                flex: 1,
                padding: 'var(--space-3) var(--space-2)',
                textAlign: 'center',
                borderBottom: `2px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
                transition: 'all 0.22s ease',
              }}
            >
              <span
                className="font-display"
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--color-accent)' : isComplete ? 'var(--color-success)' : 'var(--color-text-muted)',
                }}
              >
                {isComplete ? '✓ ' : ''}{label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* ─── STEP 1: Script Selection ─────────────────── */}
          {step === 1 && (
            <>
              {/* Official Premier League Match Hub redirect banner */}
              <PLMatchHubLink compact />

              <div>
                <h2 className="type-h2 font-display" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                  Draft the match narrative.
                </h2>
                <p style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span>Select the tactical script that will dominate the 90 minutes.</span>
                </p>
              </div>

              {/* Dynamic Live Narrative Press Release Preview */}
              <ScriptStoryPreview
                match={match}
                selectedScript={selectedScript ?? undefined}
                selectedSideOptions={sideSelections}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {getScriptsForMatch(match).map((script, i) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    isSelected={selectedScriptId === script.id}
                    onSelect={handleScriptSelect}
                    index={i}
                  />
                ))}
              </div>
            </>
          )}

          {/* ─── STEP 2: Side Predictions ─────────────────── */}
          {step === 2 && (
            <>
              <div>
                <h2 className="type-h2 font-display" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
                  Draft side plot twists.
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 700, letterSpacing: '0.04em' }}>
                  OPTIONAL — UP TO +20 BONUS POINTS
                </p>
              </div>

              {/* Live Press Draft Preview */}
              <ScriptStoryPreview
                match={match}
                selectedScript={selectedScript ?? undefined}
                selectedSideOptions={sideSelections}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {match.sideOptions.map((option) => (
                  <SidePredictionChip
                    key={option.id}
                    option={option}
                    selectedAnswer={sideSelections[option.id] ?? null}
                    onSelect={handleSideSelect}
                  />
                ))}
              </div>
            </>
          )}

          {/* ─── STEP 3: Confirmation ─────────────────────── */}
          {step === 3 && (
            <>
              <div>
                <h2 className="type-h2 font-display" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                  Lock script into Oracle vault.
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Once locked, your match pass cannot be altered. Football will settle the rest.
                </p>
              </div>

              <ScriptStoryPreview
                match={match}
                selectedScript={selectedScript ?? undefined}
                selectedSideOptions={sideSelections}
              />

              {/* Change script link */}
              <button
                onClick={() => { soundFx.playClick(); setStep(1); }}
                style={{ color: 'var(--color-accent)', fontSize: '12px', fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'center', fontFamily: 'var(--font-display)' }}
              >
                ← Change primary script
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stamp animation overlay */}
      {isLocked && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 4, 8, 0.92)',
            backdropFilter: 'blur(24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          <div
            style={{
              fontSize: '84px',
              animation: 'stampDown 450ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            📜
          </div>
          <h2 className="type-h2 font-display gold-gradient-text" style={{ textAlign: 'center', fontSize: '2rem' }}>
            SCRIPT LOCKED IN VAULT
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', fontSize: '14px' }}>
            Your official prediction pass is generated. Good luck.
          </p>
        </div>
      )}

      {/* Bottom CTA Bar */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          paddingBottom: 'calc(var(--space-4) + env(safe-area-inset-bottom, 0px))',
          borderTop: '1px solid var(--color-border)',
          background: 'rgba(14, 16, 26, 0.95)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', display: 'flex', gap: 'var(--space-3)' }}>
          {step === 1 && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!selectedScriptId}
              onClick={() => { setStep(2); Analytics.predictionStarted(match.id); }}
              id="next-to-side-preds"
            >
              Continue to Side Plots →
            </Button>
          )}
          {step === 2 && (
            <>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setStep(3)}
                style={{ flex: 1 }}
                id="skip-side-preds"
              >
                Skip
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setStep(3)}
                style={{ flex: 2 }}
                id="confirm-side-preds"
              >
                Proceed to Lock →
              </Button>
            </>
          )}
          {step === 3 && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLocking}
              onClick={handleLock}
              id="lock-script-btn"
            >
              🔒 Lock Match Pass
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
