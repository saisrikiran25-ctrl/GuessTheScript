import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button, Flag } from '@/components/ui';
import { usePlayer } from '@/store/playerStore';
import { useMatches } from '@/store/matchStore';
import { loadPrediction, loadScore } from '@/utils/storage';
import { getScriptById } from '@/data/scripts';
import { soundFx } from '@/utils/audio';

export const LeagueTimeline: React.FC = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { state: matchState } = useMatches();
  const { state: playerState } = usePlayer();
  const navigate = useNavigate();
  const player = playerState.player;

  const [selectedGW, setSelectedGW] = useState<number>(1);

  // Filter matches for selected Gameweek
  const gwPrefix = `gw${selectedGW}_`;
  const gwMatches = matchState.matches.filter((m) => m.id.startsWith(gwPrefix));

  const leagueTitle = leagueId === 'premier-league' || !leagueId ? 'Premier League 2026/27' : leagueId.replace('-', ' ').toUpperCase();

  return (
    <div className="screen">
      <ScreenHeader showBack title={leagueTitle} />

      <main style={{ flex: 1, maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%' }}>
        {/* Gameweek Selector Bar */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-5)',
            background: 'rgba(22, 25, 41, 0.85)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div>
            <div
              className="font-display"
              style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
              }}
            >
              SEASON TIMELINE
            </div>
            <div
              className="font-display gold-gradient-text"
              style={{
                fontSize: '18px',
                fontWeight: 800,
              }}
            >
              Gameweek {selectedGW}
            </div>
          </div>

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
              padding: '8px 16px',
              color: 'var(--color-accent)',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 0 16px rgba(245, 208, 97, 0.2)',
            }}
          >
            {Array.from({ length: 38 }, (_, i) => i + 1).map((gw) => (
              <option key={gw} value={gw} style={{ background: '#090B16', color: '#FFF' }}>
                Gameweek {gw}
              </option>
            ))}
          </select>
        </div>

        {/* Match List for Selected Gameweek */}
        <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {gwMatches.length > 0 ? (
            gwMatches.map((match) => {
              const prediction = player ? loadPrediction(match.id, player.id) : null;
              const score = player ? loadScore(match.id, player.id) : null;
              const selectedScript = prediction ? getScriptById(prediction.scriptId) : null;
              const resolvedScript = match.resolution ? getScriptById(match.resolution.resolvedScriptId) : null;

              return (
                <div
                  key={match.id}
                  onClick={() => {
                    soundFx.playClick();
                    if (!prediction && match.status === 'upcoming') {
                      navigate(`/match/${match.id}/predict`);
                    } else {
                      navigate(`/match/${match.id}`);
                    }
                  }}
                  className="ticket-stub"
                  style={{
                    padding: 'var(--space-5)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span
                      className="font-display"
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {match.label}
                    </span>
                    <span
                      className="font-display"
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: match.status === 'resolved'
                          ? 'var(--color-accent)'
                          : prediction
                          ? 'var(--color-success)'
                          : 'var(--color-text-muted)',
                      }}
                    >
                      {match.status === 'resolved'
                        ? 'Resolved'
                        : prediction
                        ? '✓ Locked'
                        : 'Draft Open →'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Teams Display */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Flag team={match.teamA} size="24px" />
                      <span className="font-display" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        {match.teamA.shortCode}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', margin: '0 2px' }}>vs</span>
                      <Flag team={match.teamB} size="24px" />
                      <span className="font-display" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        {match.teamB.shortCode}
                      </span>
                    </div>

                    {/* Score / Points */}
                    <div style={{ textAlign: 'right' }}>
                      {score ? (
                        <span className="font-display" style={{ fontSize: '20px', fontWeight: 800, color: score.totalMatchScore >= 160 ? 'var(--color-success)' : 'var(--color-accent)' }}>
                          {score.totalMatchScore} <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>PTS</span>
                        </span>
                      ) : (
                        <span className="font-display" style={{ fontSize: '11px', fontWeight: 800, color: prediction ? 'var(--color-success)' : 'var(--color-accent)' }}>
                          {prediction ? 'View →' : 'Predict →'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Prediction or Resolution Detail pill */}
                  {prediction && (
                    <div
                      style={{
                        marginTop: '12px',
                        paddingTop: '8px',
                        borderTop: '1px dashed var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '11px',
                      }}
                    >
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        Your Draft: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedScript?.label ?? '—'}</strong>
                      </span>
                      {resolvedScript && (
                        <span style={{ color: 'var(--color-accent)' }}>
                          Actual: <strong>{resolvedScript.label}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'var(--color-surface-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '32px', marginBottom: 'var(--space-3)' }}>📅</p>
              <h3 className="font-display" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Gameweek {selectedGW} Fixtures
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                Fixtures for Gameweek {selectedGW} will unlock as the season progresses.
                <br />
                Check back closer to kickoff to draft your script narratives.
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
