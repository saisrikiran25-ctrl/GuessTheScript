import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Match } from '@/types';
import { CountdownTimer, Flag } from '@/components/ui';
import { isBeforeKickoff, formatKickoffDate } from '@/utils/format';
import { soundFx } from '@/utils/audio';

interface MatchCardProps {
  match: Match;
  playerScore?: number;
  hasSubmitted?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  live: 'Live Now',
  resolved: 'Script Resolved',
  void: 'Void',
};

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  playerScore,
  hasSubmitted = false,
}) => {
  const navigate = useNavigate();
  const isUpcoming = isBeforeKickoff(match.kickoff);
  const isFinalTBD = match.id === 'final' && match.status === 'upcoming' && match.teamA.id === 'tbd_a';

  const handleTap = () => {
    soundFx.playClick();
    navigate(`/match/${match.id}`);
  };

  return (
    <div
      onClick={handleTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleTap()}
      aria-label={`${match.label}: ${match.teamA.name} vs ${match.teamB.name}`}
      className="ticket-stub"
      style={{
        background: 'linear-gradient(135deg, rgba(7, 24, 17, 0.85) 0%, rgba(14, 18, 30, 0.9) 100%)',
        borderColor: match.status === 'resolved' ? 'rgba(245, 208, 97, 0.5)' : 'rgba(16, 185, 129, 0.25)',
        padding: 'var(--space-5)',
        boxShadow: match.status === 'resolved' ? '0 0 20px rgba(245, 208, 97, 0.15)' : '0 8px 30px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(16, 185, 129, 0.1)',
      }}
    >
      {/* Top Header: Label + Barcode + Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <div>
          <span
            className="font-display"
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
            }}
          >
            {match.label}
          </span>
          <div style={{ fontSize: '11px', color: '#E2E8F0', fontWeight: 600, marginTop: '2px' }}>
            {formatKickoffDate(match.kickoff)} · {match.venue} ({match.city})
          </div>
        </div>

        <StatusBadge status={match.status} />
      </div>

      {/* Perforated Divider */}
      <div className="ticket-perforated-line" />

      {/* Teams Display */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', margin: 'var(--space-4) 0' }}>
        <TeamDisplay team={match.teamA} isFinalTBD={isFinalTBD} align="left" />
        
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span
            className="font-display"
            style={{
              color: '#F1F5F9',
              fontWeight: 800,
              fontSize: '14px',
              letterSpacing: '0.14em',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
            }}
          >
            VS
          </span>
        </div>

        <TeamDisplay team={match.teamB} isFinalTBD={isFinalTBD} align="right" />
      </div>

      {/* Perforated Divider */}
      <div className="ticket-perforated-line" />

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
        {/* Countdown or score */}
        {match.status === 'resolved' && playerScore !== undefined ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#CBD5E1' }}>Score:</span>
            <span className="font-display" style={{ fontSize: '20px', fontWeight: 800, color: playerScore >= 100 ? 'var(--color-success)' : 'var(--color-accent)' }}>
              {playerScore} <span style={{ fontSize: '11px', color: '#CBD5E1' }}>pts</span>
            </span>
          </div>
        ) : match.status === 'upcoming' && isUpcoming ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#E2E8F0' }}>Kickoff:</span>
            <CountdownTimer kickoffISO={match.kickoff} compact />
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: '#CBD5E1' }}>
            {match.status === 'live' ? '⏱ Underway' : 'Match Concluded'}
          </span>
        )}

        {/* CTA indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasSubmitted && match.status !== 'resolved' && (
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-success)',
              background: 'var(--color-success-bg)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
            }}>
              ✓ Script Locked
            </span>
          )}
          {match.status === 'resolved' && (
            <span className="font-display" style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
            }}>
              View Revelation →
            </span>
          )}
          {match.status === 'upcoming' && !hasSubmitted && !isFinalTBD && (
            <span className="font-display" style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}>
              Draft Script →
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────

const TeamDisplay: React.FC<{ team: Match['teamA']; isFinalTBD: boolean; align: 'left' | 'right' }> = ({ team, isFinalTBD, align }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: align === 'right' ? 'row-reverse' : 'row', flex: 1 }}>
    <Flag team={team} size="34px" />
    <div style={{ textAlign: align }}>
      <div className="font-display" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
        {isFinalTBD ? '???' : team.shortCode}
      </div>
      <div style={{ fontSize: '12px', color: '#CBD5E1', fontWeight: 600, marginTop: '3px' }}>
        {isFinalTBD ? 'TBD' : team.name}
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: Match['status'] }> = ({ status }) => {
  const styleMap: Record<string, { bg: string; color: string; border: string }> = {
    upcoming: { bg: 'rgba(255, 255, 255, 0.1)', color: '#F1F5F9', border: 'rgba(255, 255, 255, 0.25)' },
    live: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-error)', border: 'rgba(239, 68, 68, 0.4)' },
    resolved: { bg: 'rgba(245, 208, 97, 0.12)', color: 'var(--color-accent)', border: 'var(--color-border-accent)' },
    void: { bg: 'rgba(148, 163, 184, 0.12)', color: '#CBD5E1', border: 'transparent' },
  };

  const s = styleMap[status];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
      fontSize: '9px',
      fontWeight: 800,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      flexShrink: 0,
      fontFamily: 'var(--font-display)',
    }}>
      {status === 'live' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', animation: 'pulse 1s infinite' }} />}
      {STATUS_LABELS[status]}
    </div>
  );
};
