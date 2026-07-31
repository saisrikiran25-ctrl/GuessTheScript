import React from 'react';
import type { Team } from '@/types';
import { Flag } from '@/components/ui/Flag';

interface PitchFieldProps {
  teamA?: Team;
  teamB?: Team;
  height?: number | string;
  showTeams?: boolean;
  children?: React.ReactNode;
}

export const PitchField: React.FC<PitchFieldProps> = ({
  teamA,
  teamB,
  height = 200,
  showTeams = true,
  children,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1.5px solid rgba(16, 185, 129, 0.4)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7), inset 0 0 40px rgba(0, 0, 0, 0.8)',
        background: `
          radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.25) 0%, rgba(5, 20, 13, 0.95) 100%),
          repeating-linear-gradient(
            90deg,
            rgba(16, 185, 129, 0.12) 0px,
            rgba(16, 185, 129, 0.12) 60px,
            rgba(5, 20, 13, 0.3) 60px,
            rgba(5, 20, 13, 0.3) 120px
          )
        `,
      }}
    >
      {/* SVG Football Pitch Field Lines */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 600 300"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, opacity: 0.45 }}
      >
        {/* Outer Field Boundary */}
        <rect x="20" y="20" width="560" height="260" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
        {/* Halfway Line */}
        <line x1="300" y1="20" x2="300" y2="280" stroke="#FFFFFF" strokeWidth="2" />
        {/* Center Circle */}
        <circle cx="300" cy="150" r="50" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="300" cy="150" r="3.5" fill="#FFFFFF" />

        {/* Penalty Area Left (Team A) */}
        <rect x="20" y="70" width="90" height="160" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <rect x="20" y="105" width="35" height="90" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="80" cy="150" r="2.5" fill="#FFFFFF" />

        {/* Penalty Area Right (Team B) */}
        <rect x="490" y="70" width="90" height="160" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <rect x="545" y="105" width="35" height="90" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="520" cy="150" r="2.5" fill="#FFFFFF" />

        {/* Corner Arcs */}
        <path d="M 20 35 A 15 15 0 0 0 35 20" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        <path d="M 20 265 A 15 15 0 0 1 35 280" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        <path d="M 580 35 A 15 15 0 0 1 565 20" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        <path d="M 580 265 A 15 15 0 0 0 565 280" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>

      {/* Floodlight Beam Glow Overlay */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '60px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 208, 97, 0.25) 0%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />

      {/* Teams Positioned on Pitch */}
      {showTeams && teamA && teamB && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-8)',
            zIndex: 2,
          }}
        >
          {/* Team A (Left Penalty Box) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'rgba(9, 11, 22, 0.85)',
                border: '2px solid #10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Flag team={teamA} size="32px" />
            </div>
            <span
              className="font-display"
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#FFFFFF',
                textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                letterSpacing: '0.04em',
              }}
            >
              {teamA.shortCode}
            </span>
          </div>

          {/* Center Pitch Indicator */}
          <div
            className="font-display"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(3, 4, 8, 0.85)',
              border: '1px solid rgba(245, 208, 97, 0.5)',
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--color-accent)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              boxShadow: '0 0 16px rgba(245, 208, 97, 0.2)',
            }}
          >
            PITCH BATTLE
          </div>

          {/* Team B (Right Penalty Box) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'rgba(9, 11, 22, 0.85)',
                border: '2px solid #10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Flag team={teamB} size="32px" />
            </div>
            <span
              className="font-display"
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#FFFFFF',
                textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                letterSpacing: '0.04em',
              }}
            >
              {teamB.shortCode}
            </span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};
