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
      await shareCard(dataUrl, `gts-prediction-${match.id}.png`);
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
  const isFinalTBD = match.id === 'final' && match.teamA.id === 'tbd_a';

  const canPredict = beforeKickoff && match.status === 'upcoming' && !prediction && !isFinalTBD;
  const canSeeResult = match.status === 'resolved' && score;

  return (
    <div className="screen">
      <ScreenHeader showBack />

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
        {/* Match Hero */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Match label */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
              {match.label}
            </span>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px' }}>
              {formatKickoffDate(match.kickoff)} · {formatKickoffTime(match.kickoff)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {match.venue} · {match.city}
            </div>
          </div>

          {/* Teams */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <TeamHero team={match.teamA} isTBD={isFinalTBD} />

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>VS</span>
              {match.status === 'resolved' && match.resolution && (
                <div style={{ marginTop: 'var(--space-2)', fontSize: '18px', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                  {match.resolution.details.teamAGoals}–{match.resolution.details.teamBGoals}
                </div>
              )}
            </div>

            <TeamHero team={match.teamB} isTBD={isFinalTBD} align="right" />
          </div>

          {/* Countdown (if upcoming) */}
          {beforeKickoff && match.status === 'upcoming' && (
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                Kicks off in
              </div>
              <CountdownTimer kickoffISO={match.kickoff} />
            </div>
          )}

          {/* Status indicator */}
          {match.status === 'live' && (
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-error)', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-error)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Match in progress</span>
            </div>
          )}
        </div>

        {/* Prediction / Result Section */}
        {isFinalTBD ? (
          <FinalTBDState />
        ) : match.status === 'resolved' ? (
          <ResolvedState
            match={match}
            prediction={prediction}
            score={score}
            selectedScript={selectedScript}
            resolvedScript={resolvedScript}
            onSeeResult={() => navigate(`/match/${match.id}/result`)}
          />
        ) : prediction ? (
          <LockedPredictionState
            script={selectedScript}
            prediction={prediction}
            beforeKickoff={beforeKickoff}
            onShare={handleShare}
            isSharing={isSharing}
          />
        ) : (
          <PredictCTAState
            canPredict={canPredict}
            onPredict={() => navigate(`/match/${match.id}/predict`)}
            matchStatus={match.status}
            beforeKickoff={beforeKickoff}
          />
        )}

        {/* Match narrative (post-resolution) */}
        {match.status === 'resolved' && match.resolution && (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5)',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
              What actually happened
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-accent)', marginBottom: 'var(--space-2)' }}>
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
      <Flag team={team} size="44px" />
    </div>
    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-text-primary)' }}>
      {isTBD ? '???' : team.shortCode}
    </div>
    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
      {isTBD ? 'TBD' : team.name}
    </div>
  </div>
);

const PredictCTAState: React.FC<{ canPredict: boolean; onPredict: () => void; matchStatus: string; beforeKickoff: boolean }> = ({
  canPredict, onPredict, matchStatus, beforeKickoff
}) => (
  <div
    style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-6)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      alignItems: 'center',
    }}
  >
    {canPredict ? (
      <>
        <div style={{ fontSize: '32px' }}>🎬</div>
        <div>
          <h3 className="type-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            The script is unwritten.
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Pick the match narrative before kickoff. Bold call. Let football answer.
          </p>
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={onPredict} id="read-script-btn">
          Read the Script →
        </Button>
      </>
    ) : matchStatus === 'live' ? (
      <>
        <div style={{ fontSize: '32px' }}>⏱</div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          The script is writing itself...
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Results will be revealed at full-time.
        </p>
      </>
    ) : (
      <>
        <div style={{ fontSize: '32px' }}>🔒</div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          The whistle has blown. Scripts are locked.
        </p>
      </>
    )}
  </div>
);

const LockedPredictionState: React.FC<{
  script: any;
  prediction: any;
  beforeKickoff: boolean;
  onShare: () => void;
  isSharing: boolean;
}> = ({
  script, prediction, beforeKickoff, onShare, isSharing
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
    <div
      style={{
        background: 'var(--color-surface)',
        border: `1.5px solid ${script?.familyColor ?? 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-5)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${script?.familyColor ?? '#transparent'}10 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-success)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>✓</span> Script Locked
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
        {script?.label ?? 'Unknown Script'}
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
        {script?.description}
      </p>
      {beforeKickoff && (
        <p style={{ marginTop: 'var(--space-3)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          Your script is set. The match decides the rest.
        </p>
      )}
      {!beforeKickoff && (
        <p style={{ marginTop: 'var(--space-3)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          The script is writing itself...
        </p>
      )}
    </div>
    <Button variant="primary" size="lg" fullWidth onClick={onShare} loading={isSharing} id="share-pred-btn">
      📤 Share My Prediction
    </Button>
  </div>
);

const ResolvedState: React.FC<{ match: any; prediction: any; score: any; selectedScript: any; resolvedScript: any; onSeeResult: () => void }> = ({
  prediction, score, selectedScript, resolvedScript, onSeeResult
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
    {score ? (
      <>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid rgba(212,168,67,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-5)',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 'var(--space-3)' }}>
            Your result
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '40px', fontWeight: 900, color: 'var(--color-accent)', lineHeight: 1 }}>{score.totalMatchScore}</span>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>points</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {selectedScript?.label} → actual: {resolvedScript?.label}
          </p>
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={onSeeResult} id="see-result-btn">
          See Full Breakdown →
        </Button>
      </>
    ) : prediction ? (
      <>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-5)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: 'var(--space-3)' }}>
            You predicted: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedScript?.label}</strong>
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Actual script: <strong style={{ color: 'var(--color-accent)' }}>{resolvedScript?.label}</strong>
          </p>
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={onSeeResult} id="see-result-btn">
          See How You Did →
        </Button>
      </>
    ) : (
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>You didn't predict this match.</p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>The actual script: <strong style={{ color: 'var(--color-accent)' }}>{resolvedScript?.label}</strong></p>
      </div>
    )}
  </div>
);

const FinalTBDState: React.FC = () => (
  <div
    style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-6)',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: '36px', marginBottom: 'var(--space-4)' }}>🏆</div>
    <h3 className="type-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
      Finalists to be confirmed
    </h3>
    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
      Predictions will open once the semifinal results are in. Check back after the semis.
    </p>
  </div>
);
