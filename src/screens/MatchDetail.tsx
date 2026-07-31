import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button, CountdownTimer, Flag } from '@/components/ui';
import { useMatches } from '@/store/matchStore';
import { usePlayer } from '@/store/playerStore';
import { loadPrediction, loadScore } from '@/utils/storage';
import { isBeforeKickoff, formatKickoffDate, formatKickoffTime } from '@/utils/format';
import { getScriptById } from '@/data/scripts';
import { Analytics } from '@/utils/analytics';
import { useToast } from '@/components/ui/Toast';
import { generateShareCard, shareCard } from '@/utils/shareCard';
import { soundFx } from '@/utils/audio';

export const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getMatch } = useMatches();
  const { state: playerState } = usePlayer();
  const navigate = useNavigate();

  const match = getMatch(id ?? '');
  const player = playerState.player;

  const [isSharing, setIsSharing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (id) Analytics.matchView(id);
  }, [id]);

  const handleShare = async () => {
    if (!player || !match) return;
    soundFx.playClick();
    setIsSharing(true);
    try {
      Analytics.shareInitiated(match.id, 'prediction');
      const mockScore = {
        playerId: player.id,
        matchId: match.id,
        primaryScriptScore: 0,
        familyBonusScore: 0,
        sidePredictionScore: 0,
        perfectBonus: 0,
        totalMatchScore: 0,
        badgesEarned: [],
        breakdown: [],
      };
      const dataUrl = await generateShareCard(match, mockScore, player);
      await shareCard(dataUrl, `gts-prediction-${match.id}.png`, { teamA: match.teamA.name, teamB: match.teamB.name });
      Analytics.shareCompleted(match.id, 'prediction', 'shared');
      showToast({ type: 'success', message: 'Prediction share card generated!' });
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to generate share card.' });
    } finally {
      setIsSharing(false);
    }
  };

  if (!match) {
    return (
      <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ScreenHeader showBack title="Match" />
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Match details aren't loading. Refresh to try again.</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/')} style={{ marginTop: 'var(--space-5)' }}>
            Back to Matches
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const prediction = player ? loadPrediction(match.id, player.id) : null;
  const score = player ? loadScore(match.id, player.id) : null;
  const selectedScript = prediction ? getScriptById(prediction.scriptId) : null;
  const resolvedScript = match.resolution ? getScriptById(match.resolution.resolvedScriptId) : null;
  const beforeKickoff = isBeforeKickoff(match.kickoff);
  const isFinalTBD = match.id === 'final' && match.status === 'upcoming' && match.teamA.id === 'tbd_a';

  const canPredict = beforeKickoff && match.status === 'upcoming' && !prediction && !isFinalTBD;

  return (
    <div className="screen">
      <ScreenHeader showBack title={match.label} />

      <main
        style={{
          flex: 1,
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Match Stadium Banner */}
        <div
          className="ticket-stub pitch-tactical-grid"
          style={{
            background: 'linear-gradient(135deg, rgba(22, 25, 41, 0.95) 0%, rgba(14, 16, 26, 0.95) 100%)',
            border: '1px solid var(--color-border-accent)',
            padding: 'var(--space-6)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(245, 208, 97, 0.12)',
          }}
        >
          {/* Label & Location */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <span
              className="font-display"
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
              }}
            >
              {match.label}
            </span>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              {formatKickoffDate(match.kickoff)} · {formatKickoffTime(match.kickoff)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {match.venue} · {match.city}
            </div>
          </div>

          <div className="ticket-perforated-line" />

          {/* Teams Hero Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 'var(--space-5) 0' }}>
            <TeamHero team={match.teamA} isTBD={isFinalTBD} />

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="font-display" style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.14em', color: 'var(--color-text-muted)' }}>
                VS
              </span>
              {match.status === 'resolved' && match.resolution && (
                <div className="font-display gold-gradient-text" style={{ marginTop: 'var(--space-2)', fontSize: '26px', fontWeight: 800 }}>
                  {match.resolution.details.teamAGoals} – {match.resolution.details.teamBGoals}
                </div>
              )}
            </div>

            <TeamHero team={match.teamB} isTBD={isFinalTBD} align="right" />
          </div>

          <div className="ticket-perforated-line" />

          {/* Countdown timer */}
          {beforeKickoff && match.status === 'upcoming' && (
            <div style={{ paddingTop: 'var(--space-3)' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                Kickoff Countdown
              </div>
              <CountdownTimer kickoffISO={match.kickoff} />
            </div>
          )}

          {match.status === 'live' && (
            <div style={{ paddingTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-error)', animation: 'pulse 1s infinite' }} />
              <span className="font-display" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-error)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Match underway</span>
            </div>
          )}
        </div>

        {/* Prediction / Result Section */}
        {isFinalTBD ? (
          <FinalTBDState />
        ) : match.status === 'resolved' ? (
          <ResolvedState
            prediction={prediction}
            score={score}
            selectedScript={selectedScript}
            resolvedScript={resolvedScript}
            onSeeResult={() => {
              soundFx.playClick();
              navigate(`/match/${match.id}/result`);
            }}
          />
        ) : prediction ? (
          <LockedPredictionState
            script={selectedScript}
            beforeKickoff={beforeKickoff}
            onShare={handleShare}
            isSharing={isSharing}
          />
        ) : (
          <PredictCTAState
            canPredict={canPredict}
            onPredict={() => {
              soundFx.playClick();
              navigate(`/match/${match.id}/predict`);
            }}
            matchStatus={match.status}
          />
        )}

        {/* Match narrative post resolution */}
        {match.status === 'resolved' && match.resolution && (
          <div
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
              OFFICIAL MATCH PRESS RELEASE
            </div>
            <h3 className="font-display gold-gradient-text" style={{ fontSize: '17px', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
              {resolvedScript?.label}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {match.resolution.narrativeSummary}
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────

const TeamHero: React.FC<{ team: any; isTBD: boolean; align?: 'left' | 'right' }> = ({ team, isTBD, align = 'left' }) => (
  <div style={{ textAlign: align, flex: 1 }}>
    <div style={{ marginBottom: 'var(--space-2)', display: 'flex', justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
      <Flag team={team} size="46px" />
    </div>
    <div className="font-display" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
      {isTBD ? '???' : team.shortCode}
    </div>
    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>
      {isTBD ? 'TBD' : team.name}
    </div>
  </div>
);

const PredictCTAState: React.FC<{ canPredict: boolean; onPredict: () => void; matchStatus: string }> = ({
  canPredict, onPredict, matchStatus
}) => (
  <div
    style={{
      background: 'var(--color-surface-elevated)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      alignItems: 'center',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
    }}
  >
    {canPredict ? (
      <>
        <div style={{ fontSize: '36px' }}>📜</div>
        <div>
          <h3 className="type-h3 font-display" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            The narrative is waiting.
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Pick the match narrative before kickoff. Claim up to 130 points.
          </p>
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={onPredict} id="read-script-btn">
          Draft Match Script →
        </Button>
      </>
    ) : matchStatus === 'live' ? (
      <>
        <div style={{ fontSize: '36px' }}>⏱</div>
        <p className="font-display" style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          The script is playing out live...
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Check back post-match for the score revelation.
        </p>
      </>
    ) : (
      <>
        <div style={{ fontSize: '36px' }}>🔒</div>
        <p className="font-display" style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Predictions locked at kickoff.
        </p>
      </>
    )}
  </div>
);

const LockedPredictionState: React.FC<{
  script: any;
  beforeKickoff: boolean;
  onShare: () => void;
  isSharing: boolean;
}> = ({
  script, beforeKickoff, onShare, isSharing
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
    <div
      style={{
        background: 'var(--color-surface-elevated)',
        border: `1.5px solid ${script?.familyColor ?? 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 0 24px ${script?.familyColor ?? '#000'}22`,
      }}
    >
      <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-success)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>✓</span> SCRIPT VAULT LOCKED
      </div>
      <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
        {script?.label ?? 'Unknown Script'}
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
        {script?.description}
      </p>
    </div>
    <Button variant="primary" size="lg" fullWidth onClick={onShare} loading={isSharing} id="share-pred-btn">
      📤 Share Match Pass
    </Button>
  </div>
);

const ResolvedState: React.FC<{ prediction: any; score: any; selectedScript: any; resolvedScript: any; onSeeResult: () => void }> = ({
  score, selectedScript, resolvedScript, onSeeResult
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
    {score ? (
      <>
        <div
          style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-accent)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            boxShadow: '0 0 20px rgba(245, 208, 97, 0.15)',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 'var(--space-3)' }}>
            REVELATION RESULT
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: 'var(--space-2)' }}>
            <span className="font-display gold-gradient-text" style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1 }}>{score.totalMatchScore}</span>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 700 }}>PTS</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Your Pick: {selectedScript?.label} → Actual: {resolvedScript?.label}
          </p>
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={onSeeResult} id="see-result-btn">
          View Full Breakdown →
        </Button>
      </>
    ) : (
      <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>No prediction recorded for this match.</p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>Actual script: <strong style={{ color: 'var(--color-accent)' }}>{resolvedScript?.label}</strong></p>
      </div>
    )}
  </div>
);

const FinalTBDState: React.FC = () => (
  <div
    style={{
      background: 'var(--color-surface-elevated)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: '38px', marginBottom: 'var(--space-4)' }}>🏆</div>
    <h3 className="type-h3 font-display" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
      Finalists TBD
    </h3>
    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
      Match predictions unlock as soon as the semifinal games finish.
    </p>
  </div>
);
