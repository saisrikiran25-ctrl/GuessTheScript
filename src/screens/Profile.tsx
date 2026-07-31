import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader, SoundToggleButton } from '@/components/layout/ScreenHeader';
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
import { soundFx } from '@/utils/audio';

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

  return (
    <div className="screen">
      <ScreenHeader title="Oracle Dossier" />

      <main style={{ flex: 1, overflowY: 'auto', maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%' }}>
        {/* Avatar + Moniker Header */}
        <div
          style={{
            padding: 'var(--space-8) var(--space-5) var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
            background: 'linear-gradient(180deg, rgba(22, 25, 41, 0.8) 0%, transparent 100%)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F5D061 0%, #C99E2E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 800,
              color: '#030408',
              boxShadow: '0 0 24px rgba(245, 208, 97, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
              animation: 'scaleIn 300ms ease-out',
            }}
          >
            {getInitials(player.name)}
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 className="type-h2 font-display gold-gradient-text">
              {player.name}
            </h1>
            <span
              className="font-display"
              style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                background: 'rgba(245, 208, 97, 0.1)',
                border: '1px solid var(--color-border-accent)',
                padding: '3px 12px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-block',
                marginTop: '6px',
              }}
            >
              CERTIFIED KNOCKOUT ORACLE
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

          {/* Sound Audio Control Box */}
          <div
            style={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4) var(--space-5)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div className="font-display" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Tactile Audio Engine
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Pure Web Audio synth feedback sounds
              </div>
            </div>

            <SoundToggleButton />
          </div>

          {/* Predictions Timeline League Selectors */}
          <section>
            <h2
              className="font-display"
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-3)',
              }}
            >
              Predictions Timeline
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {/* Premier League Card Option */}
              <div
                onClick={() => {
                  soundFx.playClick();
                  navigate('/timeline/premier-league');
                }}
                className="ticket-stub"
                style={{
                  padding: 'var(--space-5)',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.12) 0%, rgba(22, 25, 41, 0.9) 100%)',
                  border: '1px solid var(--color-border-accent)',
                  boxShadow: '0 0 20px rgba(245, 208, 97, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                      marginBottom: '4px',
                    }}
                  >
                    ENGLISH TOP FLIGHT · 2026/27
                  </div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>🦁 Premier League</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    38 Gameweeks · 380 Matches · Select Gameweek Timeline
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <button
                    className="font-display"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(245, 208, 97, 0.2)',
                      border: '1px solid var(--color-border-accent)',
                      color: 'var(--color-accent)',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    Select GW →
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Badge shelf */}
          <section>
            <h2
              className="font-display"
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-3)',
              }}
            >
              Badge Vault
            </h2>

            {earnedBadges.length === 0 ? (
              <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  Earn badges by accurately predicting knockout narratives.
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
            Reset local player data (dev)
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
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      textAlign: 'center',
    }}
  >
    <div
      className="font-display"
      style={{
        fontSize: '10px',
        fontWeight: 800,
        color: 'var(--color-text-muted)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '4px',
      }}
    >
      {label}
    </div>
    <div className="font-display" style={{ fontSize: '26px', fontWeight: 800, color, lineHeight: 1 }}>
      {value}{suffix}
    </div>
  </div>
);
