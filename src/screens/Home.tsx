import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchCard } from '@/components/match/MatchCard';
import { AppWordmark, SoundToggleButton } from '@/components/layout/ScreenHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useMatches } from '@/store/matchStore';
import { usePlayer } from '@/store/playerStore';
import { loadPrediction, loadScore } from '@/utils/storage';
import { Analytics } from '@/utils/analytics';
import { soundFx } from '@/utils/audio';

export const Home: React.FC = () => {
  const { state: matchState } = useMatches();
  const { state: playerState } = usePlayer();
  const navigate = useNavigate();
  const player = playerState.player;

  const [stageFilter, setStageFilter] = useState<'all' | 'fri' | 'sat' | 'sun' | 'mon'>('all');

  useEffect(() => {
    Analytics.appOpen(player?.isGuest ?? true);
  }, [player]);

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

  const filteredMatches = matchState.matches.filter((m) => {
    if (stageFilter === 'all') return true;
    const kickoff = new Date(m.kickoff);
    // Convert UTC to BST (UTC+1) for day comparison
    const bstDate = new Date(kickoff.getTime() + 60 * 60 * 1000);
    const day = bstDate.getUTCDay(); // 0=Sun, 1=Mon, 2=Tue, 5=Fri, 6=Sat
    if (stageFilter === 'fri') return day === 5;
    if (stageFilter === 'sat') return day === 6;
    if (stageFilter === 'sun') return day === 0;
    if (stageFilter === 'mon') return day === 1;
    return true;
  });

  return (
    <div className="screen">
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)' as any,
          background: 'rgba(3, 4, 8, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <AppWordmark size="md" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SoundToggleButton />

          {player && (
            <button
              onClick={() => {
                soundFx.playClick();
                navigate('/profile');
              }}
              aria-label="View profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border-accent)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px 4px 4px',
                color: 'var(--color-text-primary)',
                boxShadow: '0 0 12px rgba(245, 208, 97, 0.12)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F5D061 0%, #C99E2E 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#030408',
                }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-display" style={{ fontSize: '12px', fontWeight: 700 }}>
                {player.name.split(' ')[0]}
              </span>
            </button>
          )}
        </div>
      </header>

      <main style={{ flex: 1, padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%' }}>
        {/* Editorial Hero Header */}
        <div style={{ paddingTop: 'var(--space-2)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(245, 208, 97, 0.1)',
              border: '1px solid var(--color-border-accent)',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: 'var(--space-3)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)' }} />
            Premier League 2026/27 · Gameweek 1
          </div>

          <h1 className="type-h1 font-display" style={{ color: 'var(--color-text-primary)', fontSize: '2.2rem' }}>
            Every match<br />
            has a <span className="gold-gradient-text">script.</span>
          </h1>

          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)', fontSize: '13px', lineHeight: 1.6 }}>
            Pick the match narrative before kickoff. Outsmart football reality & claim your place in the Hall of Oracles.
          </p>
        </div>

        {/* Tournament Score / Streak Banner */}
        {player && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(22, 25, 41, 0.9) 0%, rgba(14, 16, 26, 0.9) 100%)',
              border: '1px solid var(--color-border-accent)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                ORACLE SCORE
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span className="font-display gold-gradient-text" style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>
                  {tournamentScore}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>pts</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                ORACLE STREAK
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                <span className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: streak >= 2 ? 'var(--color-success)' : 'var(--color-text-primary)', lineHeight: 1 }}>
                  {streak}
                </span>
                <span style={{ fontSize: '18px' }}>{streak >= 2 ? '🔥' : '⚡️'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Stage Filter Switcher Tabs */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2
              className="font-display"
              style={{
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
              }}
            >
              Gameweek 1 Fixtures
            </h2>

            <div
              style={{
                display: 'flex',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '3px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
              }}
            >
              {(['all', 'fri', 'sat', 'sun', 'mon'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    soundFx.playClick();
                    setStageFilter(tab);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '10px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: stageFilter === tab ? 800 : 600,
                    color: stageFilter === tab ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    background: stageFilter === tab ? 'rgba(245, 208, 97, 0.15)' : 'transparent',
                    border: `1px solid ${stageFilter === tab ? 'var(--color-border-accent)' : 'transparent'}`,
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {tab === 'all' ? 'All' : tab === 'fri' ? 'Fri' : tab === 'sat' ? 'Sat' : tab === 'sun' ? 'Sun' : 'Mon'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {filteredMatches.map((match, i) => {
              const meta = getMatchMeta(match.id);
              return (
                <div
                  key={match.id}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${i * 90}ms`, animationFillMode: 'both' }}
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

        {/* Footer info note */}
        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Official predictions lock strictly at kickoff time.
            <br />
            Resolutions processed live post full-time whistle.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
