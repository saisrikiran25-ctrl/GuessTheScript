import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { usePlayer } from '@/store/playerStore';
import { Analytics } from '@/utils/analytics';
import { soundFx } from '@/utils/audio';

const SLIDES = [
  {
    id: 1,
    eyebrow: 'FIFA World Cup 2026',
    headline: 'Every match\nhas a script.',
    sub: 'Tactile openers. High press chaos. Penalty shootouts. Football writes legendary stories.',
    icon: '📜',
  },
  {
    id: 2,
    eyebrow: 'Your Mission',
    headline: 'Draft it\nbefore kickoff.',
    sub: 'Predict the exact match narrative that will unfold. Claim up to 130 points per game.',
    icon: '🔮',
  },
  {
    id: 3,
    eyebrow: 'The Hall of Oracles',
    headline: 'See if football\nagreed.',
    sub: 'Compete in private friend leagues, earn legendary badges, and prove your football instinct.',
    icon: '👑',
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
    soundFx.playClick();
    if (slide === SLIDES.length - 1) {
      Analytics.onboardingStart();
      setIsNameStep(true);
    } else {
      setSlide((s) => s + 1);
    }
  }, [slide]);

  const handleSkip = useCallback(() => {
    soundFx.playClick();
    Analytics.onboardingStart();
    setIsNameStep(true);
  }, []);

  const handleSubmitName = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    soundFx.playStamp();
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
            <div
              className="font-display"
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: 'var(--space-3)',
              }}
            >
              FINAL ORACLE PASS STEP
            </div>
            <h1 className="type-h1 font-display gold-gradient-text">
              What do we call you?
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)', fontSize: '14px' }}>
              Your oracle moniker appears on global leaderboards and prediction pass cards.
            </p>
          </div>

          {/* Name input */}
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your handle or name..."
              maxLength={24}
              autoFocus
              aria-label="Enter your name"
              style={{
                width: '100%',
                height: '58px',
                background: 'var(--color-surface-elevated)',
                border: `1.5px solid ${name.trim() ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '0 var(--space-5)',
                color: 'var(--color-text-primary)',
                fontSize: '18px',
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                boxShadow: name.trim() ? '0 0 20px rgba(245, 208, 97, 0.2)' : 'none',
                transition: 'all 0.2s ease',
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
            Enter the Matchroom →
          </Button>

          <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            No sign-up required. Your predictions & data are saved locally on this device.
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
          top: '-15%',
          right: '-15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 208, 97, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="font-display"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 20px)',
          right: 'var(--space-5)',
          color: 'var(--color-text-muted)',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
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
        <div style={{ fontSize: '72px', marginBottom: 'var(--space-8)', lineHeight: 1 }}>
          {current.icon}
        </div>

        <div
          className="font-display"
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: 'var(--space-3)',
          }}
        >
          {current.eyebrow}
        </div>

        <h2
          className="font-display"
          style={{
            fontSize: 'clamp(2.5rem, 10vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-5)',
            whiteSpace: 'pre-line',
          }}
        >
          {current.headline}
        </h2>

        <p
          style={{
            fontSize: '15px',
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { soundFx.playClick(); setSlide(i); }}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === slide ? '28px' : '8px',
                height: '6px',
                borderRadius: '99px',
                background: i === slide ? 'var(--color-accent)' : 'var(--color-border)',
                transition: 'all 0.22s ease',
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
          {slide === SLIDES.length - 1 ? 'Set My Oracle Moniker →' : 'Next →'}
        </Button>
      </div>
    </div>
  );
};
