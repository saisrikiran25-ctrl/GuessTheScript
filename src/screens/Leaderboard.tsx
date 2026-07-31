import React, { useState, useEffect } from 'react';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { SkeletonLeaderboardRow } from '@/components/ui/Skeleton';
import { usePlayer } from '@/store/playerStore';
import { useMatches } from '@/store/matchStore';
import { MOCK_LEADERBOARD } from '@/data/mockLeaderboard';
import { loadAllScores } from '@/utils/storage';
import { getBadgeById } from '@/data/badges';
import { Analytics } from '@/utils/analytics';
import { syncDownloadMembers } from '@/utils/sync';
import { MAX_TOURNAMENT_SCORE } from '@/engine/scoring';
import { soundFx } from '@/utils/audio';
import type { LeaderboardEntry } from '@/types';

type ViewMode = 'overall' | 'gameweek';

export const Leaderboard: React.FC = () => {
  const { state: playerState } = usePlayer();
  const { state: matchState } = useMatches();
  const [viewMode, setViewMode] = useState<ViewMode>('overall');
  const [selectedGW, setSelectedGW] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const player = playerState.player;

  useEffect(() => {
    Analytics.leaderboardViewed(viewMode === 'overall' ? 'overall' : `gw_${selectedGW}`);
  }, [viewMode, selectedGW]);

  useEffect(() => {
    let isMounted = true;

    const buildEntries = async () => {
      const allScores = loadAllScores();

      // Always sync current player to Firestore so all other users see them
      if (player) {
        await syncUploadMember('world', player);
      }

      const worldMembers = await syncDownloadMembers('world');
      if (!isMounted) return;

      const entryMap = new Map<string, LeaderboardEntry>();

      // 1. Add all real members from Firestore
      worldMembers.forEach((m) => {
        const matchScores = m.matchScores ?? {};
        const exactCount = Object.values(matchScores).filter((s) => (s as number) >= 100).length;
        entryMap.set(m.playerId, {
          rank: 0,
          playerId: m.playerId,
          name: m.name,
          tournamentScore: m.score,
          matchScores,
          streak: m.streak,
          badges: m.badges ?? [],
          isCurrentPlayer: m.playerId === player?.id,
          exactMatchCount: exactCount,
        });
      });

      // 2. Add or update current local player (ensuring 100% accurate local score)
      if (player) {
        const localMatchScores: Record<string, number> = Object.fromEntries(
          matchState.matches
            .map((m) => {
              const score = allScores[`${m.id}__${player.id}`];
              return [m.id, score?.totalMatchScore ?? 0] as [string, number];
            })
            .filter(([, v]) => v > 0)
        );
        const mergedMatchScores = { ...player.matchScores, ...localMatchScores };
        const tournamentScore = Math.max(
          player.tournamentScore,
          Object.values(mergedMatchScores).reduce((a, b) => a + b, 0)
        );
        const exactCount = Object.values(mergedMatchScores).filter((s) => s >= 100).length;

        entryMap.set(player.id, {
          rank: 0,
          playerId: player.id,
          name: player.name,
          tournamentScore,
          matchScores: mergedMatchScores,
          streak: player.streak,
          badges: player.badges,
          isCurrentPlayer: true,
          exactMatchCount: exactCount,
        });
      }

      // 3. Add mock players ONLY if they do not collide with real user names/IDs
      MOCK_LEADERBOARD.forEach((mock) => {
        const nameKey = mock.name.toLowerCase();
        const nameExists = Array.from(entryMap.values()).some((e) => e.name.toLowerCase() === nameKey);
        if (!nameExists && !entryMap.has(mock.playerId)) {
          entryMap.set(mock.playerId, { ...mock, rank: 0 });
        }
      });

      const combined = Array.from(entryMap.values());
      setEntries(combined);
      setIsLoading(false);
    };

    buildEntries();
    const interval = setInterval(buildEntries, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [player, matchState.matches]);

  // Compute entries filtered and ranked by mode
  const filteredEntries = React.useMemo(() => {
    let list: LeaderboardEntry[] = [];
    if (viewMode === 'overall') {
      list = entries.map((e) => ({ ...e }));
      list.sort((a, b) => {
        if (b.tournamentScore !== a.tournamentScore) return b.tournamentScore - a.tournamentScore;
        return b.exactMatchCount - a.exactMatchCount;
      });
    } else {
      // Filter by selected Gameweek (matches starting with gwX_)
      const prefix = `gw${selectedGW}_`;
      list = entries.map((e) => {
        const gwScore = Object.entries(e.matchScores)
          .filter(([mId]) => mId.startsWith(prefix))
          .reduce((sum, [, pts]) => sum + pts, 0);

        const gwExactCount = Object.entries(e.matchScores)
          .filter(([mId, pts]) => mId.startsWith(prefix) && pts >= 100)
          .length;

        return {
          ...e,
          tournamentScore: gwScore,
          exactMatchCount: gwExactCount,
        };
      });

      list.sort((a, b) => {
        if (b.tournamentScore !== a.tournamentScore) return b.tournamentScore - a.tournamentScore;
        return b.exactMatchCount - a.exactMatchCount;
      });
    }

    return list.map((e, i) => ({ ...e, rank: i + 1 }));
  }, [entries, viewMode, selectedGW]);

  const playerEntry = filteredEntries.find((e) => e.isCurrentPlayer);
  const top10 = filteredEntries.slice(0, 10);

  return (
    <div className="screen">
      <ScreenHeader title="Leaderboard" />

      {/* Tab bar (Overall vs Gameweek) */}
      <div
        style={{
          display: 'flex',
          background: 'var(--color-surface-card)',
          borderBottom: '1px solid var(--color-border)',
          alignItems: 'center',
          padding: '0 var(--space-4)',
        }}
      >
        <button
          onClick={() => {
            soundFx.playClick();
            setViewMode('overall');
          }}
          className="font-display"
          style={{
            flex: 1,
            padding: 'var(--space-3)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: viewMode === 'overall' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            borderBottom: `2px solid ${viewMode === 'overall' ? 'var(--color-accent)' : 'transparent'}`,
            transition: 'all 0.2s ease',
          }}
        >
          Overall Season
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setViewMode('gameweek');
          }}
          className="font-display"
          style={{
            flex: 1,
            padding: 'var(--space-3)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: viewMode === 'gameweek' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            borderBottom: `2px solid ${viewMode === 'gameweek' ? 'var(--color-accent)' : 'transparent'}`,
            transition: 'all 0.2s ease',
          }}
        >
          Gameweek
        </button>
      </div>

      {/* Gameweek Selector Dropdown Bar (GW1 to GW38) */}
      {viewMode === 'gameweek' && (
        <div
          style={{
            padding: '10px var(--space-5)',
            background: 'rgba(22, 25, 41, 0.7)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            className="font-display"
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            Select Gameweek:
          </span>

          <select
            value={selectedGW}
            onChange={(e) => {
              soundFx.playClick();
              setSelectedGW(Number(e.target.value));
            }}
            className="font-display"
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1.5px solid var(--color-border-accent)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 14px',
              color: 'var(--color-accent)',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 0 12px rgba(245, 208, 97, 0.15)',
            }}
          >
            {Array.from({ length: 38 }, (_, i) => i + 1).map((gw) => (
              <option key={gw} value={gw} style={{ background: '#090B16', color: '#FFF' }}>
                Gameweek {gw}
              </option>
            ))}
          </select>
        </div>
      )}

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
              background: 'linear-gradient(180deg, rgba(22, 25, 41, 0.6) 0%, transparent 100%)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <PodiumEntry entry={top10[1]} position={2} />
            <PodiumEntry entry={top10[0]} position={1} />
            <PodiumEntry entry={top10[2]} position={3} />
          </div>
        )}

        {/* List */}
        <div style={{ padding: 'var(--space-3) var(--space-5)' }}>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonLeaderboardRow key={i} />)
          ) : filteredEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
              <p style={{ fontSize: '36px', marginBottom: 'var(--space-4)' }}>🏆</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                The Leaderboard standings will populate after predictions resolve.
              </p>
            </div>
          ) : (
            <>
              {top10.slice(3).map((entry, i) => (
                <LeaderboardRow key={entry.playerId} entry={entry} animate={i} />
              ))}

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
            Rankings reflect official Premier League oracle accuracy.
            <br />
            {viewMode === 'overall' ? `Maximum ${MAX_TOURNAMENT_SCORE} pts available across the season.` : `Gameweek ${selectedGW} Standings.`}
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

// ─── Podium Sub-component ─────────────────────────────────────
const PODIUM_HEIGHTS = { 1: 96, 2: 70, 3: 52 };
const PODIUM_COLORS = { 1: '#F5D061', 2: '#C0C0C0', 3: '#CD7F32' };
const PODIUM_MEDALS = { 1: '👑', 2: '🥈', 3: '🥉' };

const PodiumEntry: React.FC<{ entry: LeaderboardEntry; position: 1 | 2 | 3 }> = ({ entry, position }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
    <span style={{ fontSize: position === 1 ? '32px' : '24px' }}>{PODIUM_MEDALS[position]}</span>
    
    <span
      className="font-display"
      style={{
        fontSize: '11px',
        fontWeight: 800,
        color: entry.isCurrentPlayer ? PODIUM_COLORS[position] : 'var(--color-text-primary)',
        textAlign: 'center',
        maxWidth: '84px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {entry.name}
    </span>

    <span className="font-display" style={{ fontSize: '14px', fontWeight: 800, color: PODIUM_COLORS[position] }}>
      {entry.tournamentScore} <span style={{ fontSize: '9px', opacity: 0.7 }}>PTS</span>
    </span>

    {/* Podium pedestal block */}
    <div
      style={{
        width: '100%',
        height: PODIUM_HEIGHTS[position],
        background: `linear-gradient(180deg, ${PODIUM_COLORS[position]}25 0%, ${PODIUM_COLORS[position]}08 100%)`,
        border: `1.5px solid ${PODIUM_COLORS[position]}55`,
        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 20px ${PODIUM_COLORS[position]}22`,
      }}
    >
      <span className="font-display" style={{ fontSize: '20px', fontWeight: 800, color: PODIUM_COLORS[position] }}>{position}</span>
    </div>
  </div>
);

// ─── Row Sub-component ────────────────────────────────────────
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
        padding: '12px 14px',
        marginBottom: '6px',
        background: entry.isCurrentPlayer
          ? 'linear-gradient(135deg, rgba(245, 208, 97, 0.15) 0%, rgba(22, 25, 41, 0.8) 100%)'
          : 'var(--color-surface-card)',
        border: `1px solid ${entry.isCurrentPlayer ? 'var(--color-border-accent)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: entry.isCurrentPlayer ? '0 0 16px rgba(245, 208, 97, 0.15)' : 'none',
      }}
    >
      {/* Rank */}
      <span
        className="font-display"
        style={{
          fontSize: '12px',
          fontWeight: 800,
          color: entry.isCurrentPlayer ? 'var(--color-accent)' : 'var(--color-text-muted)',
          width: '24px',
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        #{entry.rank}
      </span>

      {/* Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: entry.isCurrentPlayer ? 'linear-gradient(135deg, #F5D061 0%, #C99E2E 100%)' : 'var(--color-surface-elevated)',
          border: `1px solid ${entry.isCurrentPlayer ? '#F5D061' : 'var(--color-border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 800,
          color: entry.isCurrentPlayer ? '#030408' : 'var(--color-text-secondary)',
          flexShrink: 0,
        }}
      >
        {entry.name.charAt(0).toUpperCase()}
      </div>

      {/* Name + details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            className="font-display"
            style={{
              fontSize: '14px',
              fontWeight: entry.isCurrentPlayer ? 800 : 700,
              color: entry.isCurrentPlayer ? 'var(--color-accent)' : 'var(--color-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {entry.name}
          </span>
          {entry.isCurrentPlayer && (
            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '1px 6px', borderRadius: '4px', background: 'var(--color-accent-subtle)' }}>YOU</span>
          )}
        </div>
        {(entry.streak >= 1 || topBadge) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            {entry.streak >= 1 && (
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                {entry.streak}{entry.streak >= 2 ? '🔥' : '⚡️'} streak
              </span>
            )}
            {topBadge && (
              <span style={{ fontSize: '11px' }} title={topBadge.label}>{topBadge.icon}</span>
            )}
          </div>
        )}
      </div>

      {/* Score */}
      <span
        className="font-display"
        style={{
          fontSize: '17px',
          fontWeight: 800,
          color: entry.isCurrentPlayer ? 'var(--color-accent)' : 'var(--color-text-primary)',
          flexShrink: 0,
        }}
      >
        {entry.tournamentScore} <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>PTS</span>
      </span>
    </div>
  );
};
