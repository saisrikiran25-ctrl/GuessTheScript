import React, { useState, useEffect } from 'react';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { SkeletonLeaderboardRow } from '@/components/ui/Skeleton';
import { usePlayer } from '@/store/playerStore';
import { useMatches } from '@/store/matchStore';
import { MOCK_LEADERBOARD } from '@/data/mockLeaderboard';
import { loadAllScores } from '@/utils/storage';
import { formatOrdinal } from '@/utils/format';
import { getBadgeById } from '@/data/badges';
import { Analytics } from '@/utils/analytics';
import type { LeaderboardEntry } from '@/types';

type LeaderboardTab = 'tournament' | 'sf1' | 'sf2';

export const Leaderboard: React.FC = () => {
  const { state: playerState } = usePlayer();
  const { state: matchState } = useMatches();
  const [tab, setTab] = useState<LeaderboardTab>('tournament');
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const player = playerState.player;

  useEffect(() => {
    Analytics.leaderboardViewed(tab);
  }, [tab]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const allScores = loadAllScores();

      // Build player entry from real scores
      let playerEntry: LeaderboardEntry | null = null;
      if (player) {
        const matchScores: Record<string, number> = Object.fromEntries(
          matchState.matches
            .map((m) => {
              const score = allScores[`${m.id}__${player.id}`];
              return [m.id, score?.totalMatchScore ?? 0] as [string, number];
            })
            .filter(([, v]) => v > 0)
        );
        const tournamentScore = Object.values(matchScores).reduce((a, b) => (a as number) + (b as number), 0) as number;
        const exactCount = Object.values(matchScores).filter((s) => (s as number) >= 100).length;

        playerEntry = {
          rank: 0,
          playerId: player.id,
          name: player.name,
          tournamentScore,
          matchScores,
          streak: player.streak,
          badges: player.badges,
          isCurrentPlayer: true,
          exactMatchCount: exactCount,
        };
      }

      // Combine mock + real player
      const combined = [
        ...MOCK_LEADERBOARD.map((e) => ({ ...e, rank: 0 })),
        ...(playerEntry ? [playerEntry] : []),
      ];

      // Sort by tournament score, then exact matches
      combined.sort((a, b) => {
        if (b.tournamentScore !== a.tournamentScore) return b.tournamentScore - a.tournamentScore;
        return b.exactMatchCount - a.exactMatchCount;
      });

      // Assign ranks
      const ranked = combined.map((e, i) => ({ ...e, rank: i + 1 }));

      setEntries(ranked);
      setIsLoading(false);
    }, 500);
  }, [player, matchState.matches, tab]);

  const TABS: { id: LeaderboardTab; label: string }[] = [
    { id: 'tournament', label: 'Tournament' },
    { id: 'sf1', label: 'Semi 1' },
    { id: 'sf2', label: 'Semi 2' },
  ];

  const filteredEntries = tab === 'tournament'
    ? entries
    : entries.map((e) => ({
        ...e,
        tournamentScore: e.matchScores[tab] ?? 0,
      })).sort((a, b) => b.tournamentScore - a.tournamentScore).map((e, i) => ({ ...e, rank: i + 1 }));

  const playerEntry = filteredEntries.find((e) => e.isCurrentPlayer);
  const top10 = filteredEntries.slice(0, 10);

  return (
    <div className="screen">
      <ScreenHeader title="Leaderboard" />

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: tab === t.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
              borderBottom: `2px solid ${tab === t.id ? 'var(--color-accent)' : 'transparent'}`,
              transition: 'all var(--transition-fast)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ flex: 1, maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%' }}>
        {/* Top 3 podium */}
        {!isLoading && top10.length >= 3 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: 'var(--space-6) var(--space-5) var(--space-4)',
              gap: 'var(--space-3)',
              background: 'var(--color-surface)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            {/* 2nd */}
            <PodiumEntry entry={top10[1]} position={2} />
            {/* 1st */}
            <PodiumEntry entry={top10[0]} position={1} />
            {/* 3rd */}
            <PodiumEntry entry={top10[2]} position={3} />
          </div>
        )}

        {/* List */}
        <div style={{ padding: '0 var(--space-4)' }}>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonLeaderboardRow key={i} />)
          ) : filteredEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
              <p style={{ fontSize: '36px', marginBottom: 'var(--space-4)' }}>🏆</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                The board fills up after the first prediction.
              </p>
            </div>
          ) : (
            <>
              {top10.slice(3).map((entry, i) => (
                <LeaderboardRow key={entry.playerId} entry={entry} animate={i} />
              ))}

              {/* If player is outside top 10, show separator + their entry */}
              {playerEntry && playerEntry.rank > 10 && (
                <>
                  <div style={{ padding: 'var(--space-3) 0', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>· · ·</span>
                  </div>
                  <LeaderboardRow entry={playerEntry} animate={0} />
                </>
              )}
            </>
          )}
        </div>

        <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Leaderboard updates after each match resolves.
            <br />
            Max 675 pts across all 3 matches.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

// ─── Podium ───────────────────────────────────────────────────
const PODIUM_HEIGHTS = { 1: 80, 2: 56, 3: 40 };
const PODIUM_COLORS = { 1: '#D4A843', 2: '#9B9BB0', 3: '#E67E22' };
const PODIUM_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const PodiumEntry: React.FC<{ entry: LeaderboardEntry; position: 1 | 2 | 3 }> = ({ entry, position }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
    {/* Medal */}
    <span style={{ fontSize: position === 1 ? '28px' : '22px' }}>{PODIUM_MEDALS[position]}</span>
    {/* Name */}
    <span
      style={{
        fontSize: '11px',
        fontWeight: 700,
        color: entry.isCurrentPlayer ? PODIUM_COLORS[position] : 'var(--color-text-primary)',
        textAlign: 'center',
        maxWidth: '80px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {entry.name}
    </span>
    {/* Score */}
    <span style={{ fontSize: '13px', fontWeight: 900, color: PODIUM_COLORS[position] }}>
      {entry.tournamentScore}
    </span>
    {/* Podium block */}
    <div
      style={{
        width: '100%',
        height: PODIUM_HEIGHTS[position],
        background: `${PODIUM_COLORS[position]}18`,
        border: `1px solid ${PODIUM_COLORS[position]}44`,
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: '18px', fontWeight: 900, color: PODIUM_COLORS[position] }}>{position}</span>
    </div>
  </div>
);

// ─── Row ──────────────────────────────────────────────────────
const LeaderboardRow: React.FC<{ entry: LeaderboardEntry; animate: number }> = ({ entry, animate }) => {
  const topBadge = entry.badges.length > 0 ? getBadgeById(entry.badges[entry.badges.length - 1]) : null;

  return (
    <div
      className="animate-fadeInUp"
      style={{
        animationDelay: `${animate * 40}ms`,
        animationFillMode: 'both',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) 0',
        borderBottom: '1px solid var(--color-border-dim)',
        background: entry.isCurrentPlayer ? 'var(--color-accent-subtle)' : 'transparent',
        borderRadius: entry.isCurrentPlayer ? 'var(--radius-sm)' : 0,
        paddingLeft: entry.isCurrentPlayer ? 'var(--space-3)' : 0,
        paddingRight: entry.isCurrentPlayer ? 'var(--space-3)' : 0,
        marginLeft: entry.isCurrentPlayer ? 'calc(-1 * var(--space-3))' : 0,
        marginRight: entry.isCurrentPlayer ? 'calc(-1 * var(--space-3))' : 0,
      }}
    >
      {/* Rank */}
      <span
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          width: '24px',
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {entry.rank}
      </span>

      {/* Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: entry.isCurrentPlayer ? 'var(--color-accent)' : 'var(--color-surface-2)',
          border: `1px solid ${entry.isCurrentPlayer ? 'var(--color-accent)' : 'var(--color-border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 800,
          color: entry.isCurrentPlayer ? '#0A0A0F' : 'var(--color-text-secondary)',
          flexShrink: 0,
        }}
      >
        {entry.name.charAt(0).toUpperCase()}
      </div>

      {/* Name + badge */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '14px',
              fontWeight: entry.isCurrentPlayer ? 800 : 600,
              color: entry.isCurrentPlayer ? 'var(--color-accent)' : 'var(--color-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {entry.name}
          </span>
          {entry.isCurrentPlayer && (
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>you</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          {entry.streak >= 1 && (
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {entry.streak}{entry.streak >= 2 ? '🔥' : '📊'} streak
            </span>
          )}
          {topBadge && (
            <span style={{ fontSize: '11px' }} title={topBadge.label}>{topBadge.icon}</span>
          )}
        </div>
      </div>

      {/* Score */}
      <span
        style={{
          fontSize: '18px',
          fontWeight: 900,
          color: entry.isCurrentPlayer ? 'var(--color-accent)' : 'var(--color-text-primary)',
          flexShrink: 0,
        }}
      >
        {entry.tournamentScore}
      </span>
    </div>
  );
};
