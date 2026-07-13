import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Match } from '@/types';
import { CountdownTimer, Flag } from '@/components/ui';
import { isBeforeKickoff, formatKickoffDate } from '@/utils/format';

interface MatchCardProps {
  match: Match;
  playerScore?: number;
  hasSubmitted?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  live: 'Live',
  resolved: 'Result Ready',
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
    navigate(`/match/${match.id}`);
  };

  return (
    <div
      onClick={handleTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleTap()}
      aria-label={`${match.label}: ${match.teamA.name} vs ${match.teamB.name}`}
      style={{
        background: 'var(--color-surface)',
        border: `1.5px solid ${match.status === 'resolved' ? 'rgba(232, 195, 102, 0.25)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: match.status === 'resolved' ? '0 0 16px rgba(232, 195, 102, 0.15)' : '0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = match.status === 'resolved' ? 'rgba(232, 195, 102, 0.5)' : 'rgba(255, 255, 255, 0.15)';
        el.style.background = 'var(--color-surface-2)';
        el.style.transform = 'translateY(-2px)';
        el.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = match.status === 'resolved' ? 'rgba(232, 195, 102, 0.25)' : 'var(--color-border)';
        el.style.background = 'var(--color-surface)';
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = match.status === 'resolved' ? '0 0 16px rgba(232, 195, 102, 0.15)' : '0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.03)';
      }}
    >
      {/* Top row: label + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            {match.label}
          </span>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {formatKickoffDate(match.kickoff)} · {match.city}
          </div>
        </div>
        <StatusBadge status={match.status} />
      </div>

      {/* Teams */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <TeamDisplay team={match.teamA} isFinalTBD={isFinalTBD} />
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em' }}>
          VS
        </span>
        <TeamDisplay team={match.teamB} isFinalTBD={isFinalTBD} />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Countdown or score */}
        {match.status === 'resolved' && playerScore !== undefined ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: playerScore >= 100 ? 'var(--color-success)' : playerScore >= 40 ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
              {playerScore}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>pts</span>
          </div>
        ) : match.status === 'upcoming' && isUpcoming ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Kicks off in</span>
            <CountdownTimer kickoffISO={match.kickoff} compact />
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {match.status === 'live' ? '⏱ Match underway' : ''}
          </span>
        )}

        {/* CTA indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {hasSubmitted && match.status !== 'resolved' && (
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-success)',
              background: 'var(--color-success-bg)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
            }}>
              ✓ Script locked
            </span>
          )}
          {match.status === 'resolved' && (
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
            }}>
              See result →
            </span>
          )}
          {match.status === 'upcoming' && !hasSubmitted && !isFinalTBD && (
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary)',
            }}>
              Read →
            </span>
          )}
        </div>
      </div>

      {/* Bottom highlight for resolved */}
      {match.status === 'resolved' && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
          opacity: 0.5,
        }} />
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────

const TeamDisplay: React.FC<{ team: Match['teamA']; isFinalTBD: boolean }> = ({ team, isFinalTBD }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
    <Flag team={team} size="28px" />
    <div>
      <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
        {isFinalTBD ? '???' : team.shortCode}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
        {isFinalTBD ? 'TBD' : team.name}
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: Match['status'] }> = ({ status }) => {
  const styleMap: Record<string, { bg: string; color: string; border: string }> = {
    upcoming: { bg: 'rgba(94, 94, 120, 0.12)', color: 'var(--color-text-muted)', border: 'rgba(94, 94, 120, 0.2)' },
    live: { bg: 'rgba(231, 76, 60, 0.12)', color: 'var(--color-error)', border: 'rgba(231, 76, 60, 0.3)' },
    resolved: { bg: 'rgba(212, 168, 67, 0.1)', color: 'var(--color-accent)', border: 'rgba(212, 168, 67, 0.3)' },
    void: { bg: 'rgba(94, 94, 120, 0.08)', color: 'var(--color-text-muted)', border: 'transparent' },
  };

  const s = styleMap[status];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 8px',
      borderRadius: 'var(--radius-full)',
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
      fontSize: '9px',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      flexShrink: 0,
    }}>
      {status === 'live' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'block', animation: 'pulse 1.5s infinite' }} />}
      {STATUS_LABELS[status]}
    </div>
  );
};
