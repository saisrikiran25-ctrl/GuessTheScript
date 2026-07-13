import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Badge } from '@/components/ui/Badge';
import { Button, Flag } from '@/components/ui';
import { usePlayer } from '@/store/playerStore';
import { useMatches } from '@/store/matchStore';
import { loadPrediction, loadScore } from '@/utils/storage';
import { getScriptById } from '@/data/scripts';
import { getBadgeById, BADGE_DEFINITIONS } from '@/data/badges';
import { getInitials } from '@/utils/format';
import { clearAll } from '@/utils/storage';

export const Profile: React.FC = () => {
  const { state: playerState } = usePlayer();
  const { state: matchState } = useMatches();
  const navigate = useNavigate();
  const player = playerState.player;

  if (!player) {
    return (
      <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
          Your first match is waiting. Don't let it go unread.
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate('/')}>See Matches</Button>
        <BottomNav />
      </div>
    );
  }

  const matchHistory = matchState.matches.map((match) => {
    const prediction = loadPrediction(match.id, player.id);
    const score = loadScore(match.id, player.id);
    const selectedScript = prediction ? getScriptById(prediction.scriptId) : null;
    const resolvedScript = match.resolution ? getScriptById(match.resolution.resolvedScriptId) : null;
    return { match, prediction, score, selectedScript, resolvedScript };
  });

  const earnedBadges = player.badges;
  const lockedBadges = BADGE_DEFINITIONS.filter((b) => !earnedBadges.includes(b.id));

  const AVATAR_COLORS = [
    '#D4A843', '#4A90D9', '#E67E22', '#9B59B6', '#2ECC71', '#C0392B'
  ];
  const avatarColor = AVATAR_COLORS[player.name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="screen">
      <ScreenHeader title="Profile" />

      <main style={{ flex: 1, overflowY: 'auto', maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%' }}>
        {/* Avatar + Name */}
        <div
          style={{
            padding: 'var(--space-8) var(--space-5) var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-3)',
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: avatarColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 900,
              color: '#0A0A0F',
              boxShadow: `0 0 0 4px ${avatarColor}22, 0 8px 24px rgba(0,0,0,0.4)`,
              animation: 'scaleIn 300ms ease-out',
            }}
          >
            {getInitials(player.name)}
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 className="type-h2" style={{ color: 'var(--color-text-primary)' }}>
              {player.name}
            </h1>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-block',
              marginTop: '4px',
            }}>
              Guest
            </span>
          </div>
        </div>

        <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Stats row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 'var(--space-3)',
            }}
          >
            <StatBox label="Points" value={player.tournamentScore} color="var(--color-accent)" />
            <StatBox label="Streak" value={player.streak} color={player.streak >= 2 ? 'var(--color-success)' : 'var(--color-text-primary)'} suffix={player.streak >= 2 ? '🔥' : ''} />
            <StatBox label="Badges" value={earnedBadges.length} color="var(--color-text-primary)" />
          </div>

          {/* Match history */}
          <section>
            <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
              Match History
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {matchHistory.map(({ match, prediction, score, selectedScript, resolvedScript }) => (
                <div
                  key={match.id}
                  onClick={() => navigate(`/match/${match.id}`)}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        {match.label}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Flag team={match.teamA} size="1.2em" />
                        <span>{match.teamA.shortCode}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', margin: '0 2px' }}>vs</span>
                        <Flag team={match.teamB} size="1.2em" />
                        <span>{match.teamB.shortCode}</span>
                      </div>
                      {prediction && (
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          Your script: <span style={{ color: 'var(--color-text-secondary)' }}>{selectedScript?.label ?? '—'}</span>
                        </div>
                      )}
                      {match.status === 'resolved' && resolvedScript && (
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          Actual: <span style={{ color: 'var(--color-accent)' }}>{resolvedScript.label}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {score ? (
                        <span style={{ fontSize: '22px', fontWeight: 900, color: score.totalMatchScore >= 160 ? 'var(--color-success)' : score.totalMatchScore >= 80 ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                          {score.totalMatchScore}
                        </span>
                      ) : match.status === 'upcoming' ? (
                        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: prediction ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                          {prediction ? '✓ Ready' : 'Predict'}
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Badge shelf */}
          <section>
            <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
              Badges
            </h2>

            {earnedBadges.length === 0 ? (
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  Earn badges by reading the game correctly.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {earnedBadges.map((badgeId) => {
                  const badge = getBadgeById(badgeId);
                  if (!badge) return null;
                  return <Badge key={badgeId} badge={badge} size="sm" />;
                })}
                {lockedBadges.slice(0, 4).map((badge) => (
                  <Badge key={badge.id} badge={badge} size="sm" locked />
                ))}
              </div>
            )}
          </section>

          {/* Dev: Reset */}
          <button
            onClick={() => {
              clearAll();
              window.location.reload();
            }}
            style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              alignSelf: 'center',
              marginBottom: 'var(--space-4)',
            }}
          >
            Reset game data (dev)
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: number; color: string; suffix?: string }> = ({ label, value, color, suffix = '' }) => (
  <div
    style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4)',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
      {label}
    </div>
    <div style={{ fontSize: '26px', fontWeight: 900, color, lineHeight: 1 }}>
      {value}{suffix}
    </div>
  </div>
);
