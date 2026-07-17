import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchCard } from '@/components/match/MatchCard';
import { AppWordmark } from '@/components/layout/ScreenHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useMatches } from '@/store/matchStore';
import { usePlayer } from '@/store/playerStore';
import { loadPrediction, loadScore } from '@/utils/storage';
import { Analytics } from '@/utils/analytics';
import { MAX_TOURNAMENT_SCORE } from '@/engine/scoring';

export const Home: React.FC = () => {
  const { state: matchState } = useMatches();
  const { state: playerState } = usePlayer();
  const navigate = useNavigate();
  const player = playerState.player;

  useEffect(() => {
    Analytics.appOpen(player?.isGuest ?? true);
  }, []);

  const getMatchMeta = (matchId: string) => {
    if (!player) return { hasSubmitted: false, score: undefined };
    const prediction = loadPrediction(matchId, player.id);
    const score = loadScore(matchId, player.id);
    return {
      hasSubmitted: !!prediction,
      score: score?.totalMatchScore,
    };
  };

  const streak = player?.streak ?? 0;
  const tournamentScore = player?.tournamentScore ?? 0;

  return (
    <div className="screen">
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)' as any,
          background: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <AppWordmark size="md" />
        {player && (
          <button
            onClick={() => navigate('/profile')}
            aria-label="View profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 12px 6px 6px',
              color: 'var(--color-text-primary)',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800,
                color: '#0A0A0F',
              }}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{player.name.split(' ')[0]}</span>
          </button>
        )}
      </header>

      <main style={{ flex: 1, padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%' }}>
        {/* Hero headline */}
        <div style={{ paddingTop: 'var(--space-3)' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: 'var(--space-2)',
            }}
          >
            FIFA World Cup 2026 · Knockout Stage
          </div>
          <h1 className="type-h1" style={{ color: 'var(--color-text-primary)' }}>
            Every match<br />has a script.
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)', fontSize: '14px', lineHeight: 1.6 }}>
            Guess the narrative before kickoff. Score points for reading the game.
          </p>
        </div>

        {/* Streak / Tournament Score Banner (if player has played) */}
        {player && tournamentScore > 0 && (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4) var(--space-5)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              animation: 'fadeInUp 300ms ease-out',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Tournament Score
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-accent)', lineHeight: 1 }}>{tournamentScore}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>/ {MAX_TOURNAMENT_SCORE} pts</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Streak
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: streak >= 2 ? 'var(--color-success)' : 'var(--color-text-primary)', lineHeight: 1 }}>
                  {streak}
                </span>
                <span style={{ fontSize: '16px' }}>{streak >= 2 ? '🔥' : '📊'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Match cards */}
        <section>
          <h2
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-3)',
            }}
          >
            The Fixtures
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {matchState.matches.map((match, i) => {
              const meta = getMatchMeta(match.id);
              return (
                <div
                  key={match.id}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                >
                  <MatchCard
                    match={match}
                    playerScore={meta.score}
                    hasSubmitted={meta.hasSubmitted}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer note */}
        <div style={{ textAlign: 'center', paddingBottom: 'var(--space-4)' }}>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Predictions lock at kickoff.
            <br />
            Results revealed after full-time.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
