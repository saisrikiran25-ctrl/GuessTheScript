import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { usePlayer } from '@/store/playerStore';
import { Analytics } from '@/utils/analytics';

const SLIDES = [
  {
    id: 1,
    eyebrow: 'World Cup 2026',
    headline: 'Every match\nhas a script.',
    sub: 'Cagey opener. Late drama. Penalty chaos. Football writes its own stories.',
    icon: '📖',
  },
  {
    id: 2,
    eyebrow: 'Your job',
    headline: 'Guess it\nbefore kickoff.',
    sub: 'Pick the narrative you think will unfold. Earn points for reading the game right.',
    icon: '🎯',
  },
  {
    id: 3,
    eyebrow: 'Then see',
    headline: 'If football\nagreed.',
    sub: 'Compare with friends. Build a streak. Become the oracle.',
    icon: '🔮',
  },
];

export const Onboarding: React.FC = () => {
  const [slide, setSlide] = useState(0);
  const [name, setName] = useState('');
  const [isNameStep, setIsNameStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { createPlayer } = usePlayer();

  const handleSlideNext = useCallback(() => {
    if (slide === SLIDES.length - 1) {
      Analytics.onboardingStart();
      setIsNameStep(true);
    } else {
      setSlide((s) => s + 1);
    }
  }, [slide]);

  const handleSkip = useCallback(() => {
    Analytics.onboardingStart();
    setIsNameStep(true);
  }, []);

  const handleSubmitName = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    createPlayer(trimmed);
    Analytics.onboardingComplete(true);
    navigate('/', { replace: true });
  }, [name, createPlayer, navigate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && name.trim()) handleSubmitName();
    },
    [name, handleSubmitName]
  );

  if (isNameStep) {
    return (
      <div
        className="screen screen--no-nav"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--space-8)',
          minHeight: '100dvh',
          background: 'var(--color-bg)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 'var(--max-width)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-8)',
            animation: 'fadeInUp 300ms ease-out',
          }}
        >
          {/* Wordmark */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 'var(--space-3)' }}>
              One last thing
            </div>
            <h1 className="type-h1" style={{ color: 'var(--color-text-primary)' }}>
              What do we call you?
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)', fontSize: '14px' }}>
              Your name shows on the leaderboard and share cards.
            </p>
          </div>

          {/* Name input */}
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Your name or nickname"
              maxLength={24}
              autoFocus
              aria-label="Enter your name"
              style={{
                width: '100%',
                height: '56px',
                background: 'var(--color-surface-2)',
                border: `1.5px solid ${name.trim() ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0 var(--space-5)',
                color: 'var(--color-text-primary)',
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'var(--font-family)',
                transition: 'border-color var(--transition-fast)',
              }}
            />
            <div style={{ marginTop: 'var(--space-2)', fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'right' }}>
              {name.length}/24
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            disabled={!name.trim()}
            onClick={handleSubmitName}
            id="enter-match-btn"
          >
            Enter the Match →
          </Button>

          <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            No account required. Guest mode — your data stays on this device.
          </p>
        </div>
      </div>
    );
  }

  const current = SLIDES[slide];

  return (
    <div
      className="screen screen--no-nav"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        background: 'var(--color-bg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,67,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* Skip button */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 20px)',
          right: 'var(--space-5)',
          color: 'var(--color-text-muted)',
          fontSize: '13px',
          fontWeight: 600,
          zIndex: 10,
        }}
      >
        Skip
      </button>

      {/* Slide content */}
      <div
        key={current.id}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'var(--space-10) var(--space-8)',
          animation: 'fadeInUp 300ms ease-out',
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: '72px', marginBottom: 'var(--space-8)', lineHeight: 1 }}>
          {current.icon}
        </div>

        {/* Eyebrow */}
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: 'var(--space-3)',
          }}
        >
          {current.eyebrow}
        </div>

        {/* Headline */}
        <h2
          style={{
            fontSize: 'clamp(2.5rem, 10vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-5)',
            whiteSpace: 'pre-line',
          }}
        >
          {current.headline}
        </h2>

        {/* Sub */}
        <p
          style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            maxWidth: '340px',
          }}
        >
          {current.sub}
        </p>
      </div>

      {/* Bottom navigation */}
      <div
        style={{
          padding: 'var(--space-6) var(--space-8)',
          paddingBottom: 'calc(var(--space-8) + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}
      >
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === slide ? '24px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === slide ? 'var(--color-accent)' : 'var(--color-border)',
                transition: 'all var(--transition-base)',
              }}
            />
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSlideNext}
          id={`onboarding-next-${slide}`}
        >
          {slide === SLIDES.length - 1 ? 'Set My Name →' : 'Next →'}
        </Button>
      </div>
    </div>
  );
};
