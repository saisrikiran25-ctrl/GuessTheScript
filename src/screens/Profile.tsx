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

  const [badgeFilter, setBadgeFilter] = React.useState<'all' | 'unlocked' | 'locked'>('all');

  const earnedBadges = player.badges;

  return (
    <div className="screen">
      <ScreenHeader title="Your Profile" />

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
              CERTIFIED FOOTBALL ORACLE
            </span>
          </div>
        </div>

        <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Stats row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--space-3)',
            }}
          >
            <StatBox label="Points" value={player.tournamentScore} color="var(--color-accent)" />
            <StatBox label="Streak" value={player.streak} color="var(--color-accent)" suffix="🔥" />
            <StatBox label="Badges" value={earnedBadges.length} color="var(--color-accent)" />
          </div>

          {/* Sound Toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-4)',
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
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

          {/* Badge Vault */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <h2
                className="font-display"
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                }}
              >
                Badge Vault ({earnedBadges.length} / {BADGE_DEFINITIONS.length})
              </h2>

              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['all', 'unlocked', 'locked'] as const).map((filterMode) => (
                  <button
                    key={filterMode}
                    onClick={() => {
                      soundFx.playClick();
                      setBadgeFilter(filterMode);
                    }}
                    className="font-display"
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${badgeFilter === filterMode ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: badgeFilter === filterMode ? 'rgba(245, 208, 97, 0.15)' : 'var(--color-surface-card)',
                      color: badgeFilter === filterMode ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    {filterMode}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: '6px',
                width: '100%',
                background: 'var(--color-surface-card)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                marginBottom: 'var(--space-4)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(earnedBadges.length / BADGE_DEFINITIONS.length) * 100}%`,
                  background: 'linear-gradient(90deg, #F5D061 0%, #10B981 100%)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease',
                  boxShadow: '0 0 10px rgba(245, 208, 97, 0.5)',
                }}
              />
            </div>

            {/* Badge Grid List */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)' }}>
              {BADGE_DEFINITIONS.filter((badge) => {
                const isUnlocked = earnedBadges.includes(badge.id);
                if (badgeFilter === 'unlocked') return isUnlocked;
                if (badgeFilter === 'locked') return !isUnlocked;
                return true;
              }).map((badge) => {
                const isUnlocked = earnedBadges.includes(badge.id);

                const rarityColorMap = {
                  common: { text: '#9DA3BC', border: 'rgba(157, 163, 188, 0.3)', glow: 'rgba(157, 163, 188, 0.1)' },
                  rare: { text: '#00F2FE', border: 'rgba(0, 242, 254, 0.4)', glow: 'rgba(0, 242, 254, 0.15)' },
                  legendary: { text: '#F5D061', border: 'rgba(245, 208, 97, 0.5)', glow: 'rgba(245, 208, 97, 0.2)' },
                };
                const rarityStyle = rarityColorMap[badge.rarity];

                return (
                  <div
                    key={badge.id}
                    className="ticket-stub"
                    style={{
                      padding: 'var(--space-4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-4)',
                      background: isUnlocked
                        ? `linear-gradient(135deg, ${rarityStyle.glow} 0%, rgba(18, 20, 34, 0.9) 100%)`
                        : 'rgba(14, 16, 26, 0.5)',
                      border: `1.5px solid ${isUnlocked ? rarityStyle.border : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: isUnlocked ? `0 0 16px ${rarityStyle.glow}` : 'none',
                      opacity: isUnlocked ? 1 : 0.6,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Badge Icon */}
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: isUnlocked
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.3)',
                        border: `1.5px solid ${isUnlocked ? rarityStyle.text : 'rgba(255, 255, 255, 0.1)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        flexShrink: 0,
                        position: 'relative',
                        boxShadow: isUnlocked ? `0 0 12px ${rarityStyle.glow}` : 'none',
                      }}
                    >
                      {badge.icon}
                      {!isUnlocked && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            fontSize: '11px',
                            background: '#0F111E',
                            borderRadius: '50%',
                            padding: '2px',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          🔒
                        </div>
                      )}
                    </div>

                    {/* Badge Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span
                          className="font-display"
                          style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: isUnlocked ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                          }}
                        >
                          {badge.label}
                        </span>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            color: rarityStyle.text,
                            background: `${rarityStyle.text}18`,
                            border: `1px solid ${rarityStyle.text}33`,
                          }}
                        >
                          {badge.rarity}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: isUnlocked ? 'var(--color-text-secondary)' : 'var(--color-text-muted)', lineHeight: 1.4, margin: 0 }}>
                        {badge.description}
                      </p>
                    </div>

                    {/* Unlocked / Locked Status Tag */}
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      {isUnlocked ? (
                        <span
                          className="font-display"
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--color-success)',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)',
                          }}
                        >
                          ✓ UNLOCKED
                        </span>
                      ) : (
                        <span
                          className="font-display"
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--color-text-muted)',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--color-border)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          🔒 LOCKED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
