import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScriptCard } from '@/components/prediction/ScriptCard';
import { SidePredictionChip } from '@/components/prediction/SidePredictionChip';
import { Button, Flag } from '@/components/ui';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useMatches } from '@/store/matchStore';
import { usePlayer } from '@/store/playerStore';
import { savePrediction } from '@/utils/storage';
import { isBeforeKickoff } from '@/utils/format';
import { getScriptById } from '@/data/scripts';
import { Analytics } from '@/utils/analytics';
import { useToast } from '@/components/ui/Toast';
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

    // Show stamp animation
    setIsLocked(true);
    await new Promise((r) => setTimeout(r, 1200));
    navigate(`/match/${match.id}`, { replace: true });
  }, [selectedScriptId, sideSelections, match.id, player.id, navigate]);

  const selectedScript = selectedScriptId ? getScriptById(selectedScriptId) : null;

  const STEP_LABELS = ['Choose Script', 'Add Detail', 'Lock It In'];

  return (
    <div
      className="screen screen--no-nav"
      style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}
    >
      <ScreenHeader
        showBack
        title={match.label}
        rightAction={
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Step {step}/3
          </div>
        }
      />

      {/* Step indicator */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
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
                transition: 'border-color var(--transition-base)',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
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
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* ─── STEP 1: Script Selection ─────────────────── */}
          {step === 1 && (
            <>
              <div>
                <h2 className="type-h2" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                  Choose your script.
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <Flag team={match.teamA} size="1.2em" />
                  <span>{match.teamA.shortCode}</span>
                  <span style={{ color: 'var(--color-text-muted)', margin: '0 2px' }}>vs</span>
                  <Flag team={match.teamB} size="1.2em" />
                  <span>{match.teamB.shortCode}</span>
                  <span style={{ marginLeft: '4px' }}>— pick the narrative you believe will unfold.</span>
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {match.scripts.map((script, i) => (
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
                <h2 className="type-h2" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
                  Add some detail.
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600 }}>
                  Optional — but worth it.
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                  Up to 15 bonus points each. Skip if you just want your script.
                </p>
              </div>

              {/* Selected script reminder */}
              {selectedScript && (
                <div
                  style={{
                    background: 'var(--color-surface)',
                    border: `1px solid ${selectedScript.familyColor}44`,
                    borderLeft: `4px solid ${selectedScript.familyColor}`,
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                  }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700, color: selectedScript.familyColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Your script
                  </span>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                    {selectedScript.label}
                  </p>
                </div>
              )}

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
                <h2 className="type-h2" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                  Lock it in.
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  This is your call. Football will answer.
                </p>
              </div>

              {/* Script summary */}
              {selectedScript && (
                <div
                  style={{
                    background: 'var(--color-surface)',
                    border: `1.5px solid ${selectedScript.familyColor}`,
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-5)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${selectedScript.familyColor}10 0%, transparent 60%)`, pointerEvents: 'none' }} />
                  <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: selectedScript.familyColor, marginBottom: 'var(--space-2)' }}>
                    {selectedScript.familyLabel}
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)', lineHeight: 1.1 }}>
                    {selectedScript.label}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {selectedScript.description}
                  </p>
                </div>
              )}

              {/* Side predictions summary */}
              {Object.keys(sideSelections).length > 0 && (
                <div
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                    Side predictions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {match.sideOptions.map((opt) => {
                      const answer = sideSelections[opt.id];
                      if (!answer) return null;
                      const choiceLabel = opt.choices.find((c) => c.value === answer)?.label;
                      return (
                        <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>{opt.question}</span>
                          <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{choiceLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Change script link */}
              <button
                onClick={() => setStep(1)}
                style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'center' }}
              >
                Change script
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
            background: 'rgba(10,10,15,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          <div
            style={{
              fontSize: '80px',
              animation: 'stampIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            🔒
          </div>
          <h2 className="type-h2" style={{ color: 'var(--color-text-primary)', textAlign: 'center' }}>
            Script locked.
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', fontSize: '14px' }}>
            Bold call. Let football answer.
          </p>
        </div>
      )}

      {/* Bottom CTA */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          paddingBottom: 'calc(var(--space-4) + env(safe-area-inset-bottom, 0px))',
          borderTop: '1px solid var(--color-border)',
          background: 'rgba(10,10,15,0.95)',
          backdropFilter: 'blur(12px)',
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
              Next →
            </Button>
          )}
          {step === 2 && (
            <>
              <Button
                variant="ghost"
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
                {Object.keys(sideSelections).length > 0 ? 'Confirm →' : 'Skip & Confirm →'}
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
              style={{ background: 'var(--color-accent)', letterSpacing: '0.08em' }}
            >
              🔒 Lock the Script
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
