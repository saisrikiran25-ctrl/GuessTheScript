import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Onboarding } from '@/screens/Onboarding';
import { Home } from '@/screens/Home';
import { MatchDetail } from '@/screens/MatchDetail';
import { PredictionComposer } from '@/screens/PredictionComposer';
import { Results } from '@/screens/Results';
import { Leaderboard } from '@/screens/Leaderboard';
import { Profile } from '@/screens/Profile';
import { LeagueTimeline } from '@/screens/LeagueTimeline';
import { Group } from '@/screens/Group';
import { Admin } from '@/screens/Admin';
import { Stats } from '@/screens/Stats';
import { usePlayer } from '@/store/playerStore';

export const Router: React.FC = () => {
  const { state } = usePlayer();

  // Show loading while hydrating from localStorage
  if (state.isLoading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
        }}
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
            }}
          >
            GUESS THE <span style={{ color: 'var(--color-accent)' }}>SCRIPT</span>
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              border: '2px solid var(--color-border)',
              borderTop: '2px solid var(--color-accent)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Onboarding */}
      <Route
        path="/welcome"
        element={
          state.hasOnboarded ? <Navigate to="/" replace /> : <Onboarding />
        }
      />

      {/* Main app routes (redirect to onboarding if not set up) */}
      <Route
        path="/"
        element={
          !state.hasOnboarded ? <Navigate to="/welcome" replace /> : <Home />
        }
      />
      <Route
        path="/match/:id"
        element={
          !state.hasOnboarded ? <Navigate to="/welcome" replace /> : <MatchDetail />
        }
      />
      <Route
        path="/match/:id/predict"
        element={
          !state.hasOnboarded ? <Navigate to="/welcome" replace /> : <PredictionComposer />
        }
      />
      <Route
        path="/match/:id/result"
        element={
          !state.hasOnboarded ? <Navigate to="/welcome" replace /> : <Results />
        }
      />
      <Route
        path="/leaderboard"
        element={
          !state.hasOnboarded ? <Navigate to="/welcome" replace /> : <Leaderboard />
        }
      />
      <Route
        path="/profile"
        element={
          !state.hasOnboarded ? <Navigate to="/welcome" replace /> : <Profile />
        }
      />
      <Route
        path="/timeline"
        element={
          !state.hasOnboarded ? <Navigate to="/welcome" replace /> : <Navigate to="/timeline/premier-league" replace />
        }
      />
      <Route
        path="/timeline/:leagueId"
        element={
          !state.hasOnboarded ? <Navigate to="/welcome" replace /> : <LeagueTimeline />
        }
      />
      <Route
        path="/group"
        element={
          !state.hasOnboarded ? <Navigate to="/welcome" replace /> : <Group />
        }
      />
      <Route
        path="/group/:code"
        element={
          !state.hasOnboarded ? <Navigate to="/welcome" replace /> : <Group />
        }
      />

      {/* Stats */}
      <Route
        path="/stats"
        element={
          !state.hasOnboarded ? <Navigate to="/welcome" replace /> : <Stats />
        }
      />

      {/* Admin */}
      <Route path="/admin" element={<Admin />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
