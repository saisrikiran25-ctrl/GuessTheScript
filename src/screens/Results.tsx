import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, ScoreCounter, Flag } from '@/components/ui';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { useMatches } from '@/store/matchStore';
import { usePlayer } from '@/store/playerStore';
import { loadPrediction, loadScore, saveScore } from '@/utils/storage';
import { scorePrediction, getClosenessMessage } from '@/engine/scoring';
import { getBadgeById } from '@/data/badges';
import { awardBadges, awardTournamentBadges } from '@/engine/badges';
import { getScriptById } from '@/data/scripts';
import { generateShareCard, shareCard } from '@/utils/shareCard';
import { Analytics } from '@/utils/analytics';
import { syncUploadMember } from '@/utils/sync';
import { soundFx } from '@/utils/audio';
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

    let score = loadScore(match.id, player.id);

    if (!score) {
      score = scorePrediction(prediction, match);
      const badges = awardBadges(score, prediction, player, match.resolution.resolvedScriptId, match.kickoff);
      score.badgesEarned = badges;
      saveScore(score);
      updateScore(match.id, score.totalMatchScore, badges);
      setNewBadges(badges);

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

      const tournamentBadges = awardTournamentBadges(syncedPlayer);
      if (tournamentBadges.length > 0) {
        updateScore(match.id, score.totalMatchScore, tournamentBadges);
        const allNewBadges = [...new Set([...badges, ...tournamentBadges])];
        setNewBadges(allNewBadges);
        syncedPlayer.badges = [...new Set([...syncedPlayer.badges, ...tournamentBadges])];
      }

      syncUploadMember('world', syncedPlayer);

      try {
        const storedGroups = localStorage.getItem('gts_groups');
        if (storedGroups) {
          const parsedGroups = JSON.parse(storedGroups) as { code: string }[];
          parsedGroups.forEach((g) => {
            if (g.code && g.code !== 'world') {
              syncUploadMember(g.code, syncedPlayer);
            }
          });
        }
      } catch (err) {
        console.warn('Failed to sync score to joined groups:', err);
      }

    } else {
      setNewBadges(score.badgesEarned ?? []);
    }

    scoreRef.current = score;
    setPlayerScore(score);
    soundFx.playTriumph();

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
    soundFx.playClick();
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
        title="Oracle Revelation"
        rightAction={
          <button
            onClick={() => {
              soundFx.playClick();
              navigate('/leaderboard');
            }}
            className="font-display"
            style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            Oracles →
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
              <div style={{ fontSize: '56px' }}>🏆</div>
              <h2 className="type-h2 font-display gold-gradient-text">
                THE SCRIPT REVELATION
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Flag team={match.teamA} size="28px" />
                <span className="font-display" style={{ fontWeight: 800 }}>{match.teamA.shortCode}</span>
                <span className="font-display gold-gradient-text" style={{ fontSize: '24px', fontWeight: 800, margin: '0 4px' }}>
                  {match.resolution?.details.teamAGoals} – {match.resolution?.details.teamBGoals}
                </span>
                <span className="font-display" style={{ fontWeight: 800 }}>{match.teamB.shortCode}</span>
                <Flag team={match.teamB} size="28px" />
              </p>
            </div>
          )}

          {/* ─── Phase: Actual Script Reveal ─────────────── */}
          {(phase === 'actual' || phase === 'score' || phase === 'badges' || phase === 'done') && resolvedScript && (
            <div
              className="ticket-stub"
              style={{
                border: `1.5px solid ${resolvedScript.familyColor}`,
                padding: 'var(--space-6)',
                boxShadow: `0 0 24px ${resolvedScript.familyColor}33`,
                animation: 'fadeInUp 400ms ease-out',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: resolvedScript.familyColor, marginBottom: 'var(--space-2)' }}>
                OFFICIAL MATCH SCRIPT WRITTEN
              </div>
              <h2 className="font-display" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)', lineHeight: 1.1 }}>
                {resolvedScript.label}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {match.resolution?.narrativeSummary}
              </p>
            </div>
          )}

          {/* Your script comparison */}
          {(phase === 'actual' || phase === 'score' || phase === 'badges' || phase === 'done') && selectedScript && (
            <div
              style={{
                background: 'var(--color-surface-elevated)',
                border: `1px solid ${selectedScriptId_matches(selectedScript, resolvedScript) ? 'var(--color-success)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4) var(--space-5)',
                animation: 'fadeInUp 400ms ease-out 150ms both',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                YOUR DRAFTED SCRIPT
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="font-display" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {selectedScript.label}
                </h3>
                <span style={{ fontSize: '20px' }}>
                  {selectedScriptId_matches(selectedScript, resolvedScript) ? '🎯' : '❌'}
                </span>
              </div>
            </div>
          )}

          {/* ─── Phase: Score reveal ─────────────────────── */}
          {(phase === 'score' || phase === 'badges' || phase === 'done') && playerScore && closeness && (
            <div
              style={{
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border-accent)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-6)',
                textAlign: 'center',
                boxShadow: '0 0 30px rgba(245, 208, 97, 0.2)',
                animation: 'scaleIn 400ms ease-out',
              }}
            >
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <ScoreCounter target={playerScore.totalMatchScore} duration={1200} />
                <span style={{ display: 'block', fontSize: '12px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  MATCH POINTS EARNED
                </span>
              </div>

              <h3
                className="font-display"
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: sentimentColor[closeness.sentiment],
                  marginBottom: 'var(--space-2)',
                  lineHeight: 1.25,
                }}
              >
                {closeness.headline}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {closeness.sub}
              </p>

              {/* Breakdown toggle */}
              <button
                onClick={() => { soundFx.playClick(); setShowBreakdown(!showBreakdown); }}
                className="font-display"
                style={{
                  marginTop: 'var(--space-4)',
                  color: 'var(--color-accent)',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {showBreakdown ? 'Hide' : 'See'} Score Breakdown ↓
              </button>

              {showBreakdown && (
                <div style={{ marginTop: 'var(--space-4)', textAlign: 'left', borderTop: '1px dashed var(--color-border)', paddingTop: 'var(--space-4)' }}>
                  {playerScore.breakdown.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        padding: 'var(--space-2) 0',
                        borderBottom: i < playerScore.breakdown.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                        gap: 'var(--space-3)',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: item.earned ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                          {item.label}
                        </div>
                        {item.detail && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: 1.4 }}>{item.detail}</div>
                        )}
                      </div>
                      <span className="font-display" style={{
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
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border-accent)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                boxShadow: '0 0 20px rgba(245, 208, 97, 0.15)',
                animation: 'fadeInUp 400ms ease-out',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 'var(--space-3)' }}>
                🎖 NEW BADGES UNLOCKED
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
                  Couldn't generate your card. Screenshot this screen to share your prediction.
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
                📤 Share Revelation Card
              </Button>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => { soundFx.playClick(); navigate('/leaderboard'); }}
                id="see-leaderboard-btn"
              >
                View Oracle Leaderboard →
              </Button>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => { soundFx.playClick(); navigate('/'); }}
              >
                Back to Matchroom
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function selectedScriptId_matches(selected: any, resolved: any): boolean {
  return selected?.id === resolved?.id;
}
