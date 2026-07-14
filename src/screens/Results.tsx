import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, ScoreCounter, Flag } from '@/components/ui';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { useMatches } from '@/store/matchStore';
import { usePlayer } from '@/store/playerStore';
import { loadPrediction, loadScore, saveScore } from '@/utils/storage';
import { scorePrediction, getClosenessMessage } from '@/engine/scoring';
import { awardBadges } from '@/engine/badges';
import { getScriptById } from '@/data/scripts';
import { getBadgeById, BADGE_DEFINITIONS } from '@/data/badges';
import { generateShareCard, shareCard } from '@/utils/shareCard';
import { Analytics } from '@/utils/analytics';
import { syncUploadMember } from '@/utils/sync';
import type { Player } from '@/types';

type RevealPhase = 'intro' | 'actual' | 'score' | 'badges' | 'done';

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getMatch } = useMatches();
  const { state: playerState, updateScore } = usePlayer();
  const navigate = useNavigate();

  const match = getMatch(id ?? '');
  const player = playerState.player;

  const [phase, setPhase] = useState<RevealPhase>('intro');
  const [playerScore, setPlayerScore] = useState<ReturnType<typeof scorePrediction> | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const scoreRef = useRef<ReturnType<typeof scorePrediction> | null>(null);

  // Compute score on mount
  useEffect(() => {
    if (!match || !player || match.status !== 'resolved' || !match.resolution) return;

    const prediction = loadPrediction(match.id, player.id);
    if (!prediction) return;

    // Check if already scored
    let score = loadScore(match.id, player.id);

    if (!score) {
      // Calculate score
      score = scorePrediction(prediction, match);
      // Award badges
      const badges = awardBadges(score, prediction, player, match.resolution.resolvedScriptId, match.kickoff);
      score.badgesEarned = badges;
      saveScore(score);
      updateScore(match.id, score.totalMatchScore, badges);
      setNewBadges(badges);

      // ── Sync updated score to Firestore immediately ──────────
      // Reconstruct the player as playerStore will compute it, so Firestore
      // gets the exact same values that localStorage will have.
      const updatedMatchScores = { ...player.matchScores, [match.id]: score.totalMatchScore };
      const updatedTournamentScore = Object.values(updatedMatchScores).reduce((a: number, b: number) => a + b, 0);
      const updatedStreak = Object.values(updatedMatchScores).filter((s: number) => s >= 80).length;
      const updatedBadges = [...new Set([...player.badges, ...badges])];
      const syncedPlayer: Player = {
        ...player,
        matchScores: updatedMatchScores,
        tournamentScore: updatedTournamentScore,
        streak: updatedStreak,
        badges: updatedBadges,
      };
      syncUploadMember('world', syncedPlayer); // fire-and-forget — offline-safe
    } else {
      setNewBadges(score.badgesEarned ?? []);
    }

    scoreRef.current = score;
    setPlayerScore(score);

    Analytics.resultViewed(match.id, score.totalMatchScore, score.perfectBonus > 0);
  }, [match, player]);

  // Phase progression
  useEffect(() => {
    if (!playerScore) return;
    const timings: Record<RevealPhase, number> = {
      intro: 1200,
      actual: 2000,
      score: 2500,
      badges: 2000,
      done: 0,
    };

    const phaseOrder: RevealPhase[] = ['intro', 'actual', 'score', 'badges', 'done'];
    const idx = phaseOrder.indexOf(phase);
    if (phase === 'done') return;

    const next = phaseOrder[idx + 1];
    const t = setTimeout(() => setPhase(next), timings[phase]);
    return () => clearTimeout(t);
  }, [phase, playerScore]);

  const handleShare = useCallback(async () => {
    if (!match || !player || !playerScore) return;
    setIsGeneratingCard(true);
    setShareError(false);
    try {
      Analytics.shareInitiated(match.id, 'portrait');
      const dataUrl = await generateShareCard(match, playerScore, player);
      const method = await shareCard(dataUrl);
      Analytics.shareCompleted(match.id, 'portrait', method);
    } catch (err) {
      setShareError(true);
    } finally {
      setIsGeneratingCard(false);
    }
  }, [match, player, playerScore]);

  if (!match) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Match not found.</div>;
  }

  if (match.status !== 'resolved') {
    navigate(`/match/${id}`);
    return null;
  }

  if (!player) {
    navigate('/welcome');
    return null;
  }

  const prediction = loadPrediction(match.id, player.id);
  const resolvedScript = match.resolution ? getScriptById(match.resolution.resolvedScriptId) : null;
  const selectedScript = prediction ? getScriptById(prediction.scriptId) : null;
  const closeness = playerScore && match.resolution ? getClosenessMessage(playerScore, match.resolution) : null;

  const sentimentColor = {
    perfect: 'var(--color-accent)',
    great: 'var(--color-success)',
    close: 'var(--color-warning)',
    miss: 'var(--color-text-secondary)',
  };

  return (
    <div
      className="screen screen--no-nav"
      style={{
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ScreenHeader
        showBack
        title="Your Result"
        rightAction={
          <button
            onClick={() => navigate('/leaderboard')}
            style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Board →
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* ─── Phase: Intro ────────────────────────────── */}
          {phase === 'intro' && (
            <div
              style={{
                minHeight: '50vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 'var(--space-4)',
                textAlign: 'center',
                animation: 'fadeIn 600ms ease-out',
              }}
            >
              <div style={{ fontSize: '48px' }}>🎬</div>
              <h2 className="type-h2" style={{ color: 'var(--color-text-primary)' }}>
                Here's what<br />actually happened.
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Flag team={match.teamA} size="1.4em" />
                <span>{match.teamA.shortCode}</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-text-primary)', margin: '0 6px' }}>
                  {match.resolution?.details.teamAGoals}–{match.resolution?.details.teamBGoals}
                </span>
                <span>{match.teamB.shortCode}</span>
                <Flag team={match.teamB} size="1.4em" />
              </p>
            </div>
          )}

          {/* ─── Phase: Actual Script Reveal ─────────────── */}
          {(phase === 'actual' || phase === 'score' || phase === 'badges' || phase === 'done') && resolvedScript && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: `1.5px solid ${resolvedScript.familyColor}`,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                position: 'relative',
                overflow: 'hidden',
                animation: 'fadeInUp 400ms ease-out',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${resolvedScript.familyColor}10 0%, transparent 60%)`, pointerEvents: 'none' }} />
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: resolvedScript.familyColor, marginBottom: 'var(--space-2)' }}>
                The actual script
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)', lineHeight: 1.1 }}>
                {resolvedScript.label}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {match.resolution?.narrativeSummary}
              </p>
            </div>
          )}

          {/* Your script (comparison) */}
          {(phase === 'actual' || phase === 'score' || phase === 'badges' || phase === 'done') && selectedScript && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: `1px solid ${selectedScriptId_matches(selectedScript, resolvedScript) ? 'var(--color-success)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                animation: 'fadeInUp 400ms ease-out 200ms both',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                Your script
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {selectedScript.label}
                </h3>
                <span style={{ fontSize: '18px' }}>
                  {selectedScriptId_matches(selectedScript, resolvedScript) ? '✅' : '❌'}
                </span>
              </div>
            </div>
          )}

          {/* ─── Phase: Score reveal ─────────────────────── */}
          {(phase === 'score' || phase === 'badges' || phase === 'done') && playerScore && closeness && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                textAlign: 'center',
                animation: 'scaleIn 400ms ease-out',
              }}
            >
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <ScoreCounter target={playerScore.totalMatchScore} duration={1200} />
                <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: '4px' }}>points</span>
              </div>

              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: sentimentColor[closeness.sentiment],
                  marginBottom: 'var(--space-2)',
                  lineHeight: 1.2,
                }}
              >
                {closeness.headline}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {closeness.sub}
              </p>

              {/* Breakdown toggle */}
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                style={{
                  marginTop: 'var(--space-4)',
                  color: 'var(--color-accent)',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {showBreakdown ? 'Hide' : 'See'} breakdown ↓
              </button>

              {showBreakdown && (
                <div style={{ marginTop: 'var(--space-4)', textAlign: 'left', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                  {playerScore.breakdown.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        padding: 'var(--space-2) 0',
                        borderBottom: i < playerScore.breakdown.length - 1 ? '1px solid var(--color-border-dim)' : 'none',
                        gap: 'var(--space-3)',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: item.earned ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                          {item.label}
                        </div>
                        {item.detail && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: 1.4 }}>{item.detail}</div>
                        )}
                      </div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: item.earned ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        flexShrink: 0,
                      }}>
                        {item.earned ? `+${item.points}` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── Phase: Badges ────────────────────────────── */}
          {(phase === 'badges' || phase === 'done') && newBadges.length > 0 && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid rgba(212,168,67,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-5)',
                animation: 'fadeInUp 400ms ease-out',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}>
                🏅 New badges earned
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {newBadges.map((badgeId, i) => {
                  const badge = getBadgeById(badgeId);
                  if (!badge) return null;
                  return (
                    <div key={badgeId} style={{ animation: `badgeAppear 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 150}ms both` }}>
                      <Badge badge={badge} size="md" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Phase: Share + Next ──────────────────────── */}
          {phase === 'done' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                paddingBottom: 'var(--space-8)',
                animation: 'fadeInUp 400ms ease-out',
              }}
            >
              {shareError && (
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                  Couldn't generate your card. Screenshot this screen and share it.
                </p>
              )}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={isGeneratingCard}
                onClick={handleShare}
                id="share-result-btn"
              >
                📤 Share Your Script
              </Button>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => navigate('/leaderboard')}
                id="see-leaderboard-btn"
              >
                See Leaderboard
              </Button>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => navigate('/')}
              >
                Back to Matches
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper
function selectedScriptId_matches(selected: any, resolved: any): boolean {
  return selected?.id === resolved?.id;
}
