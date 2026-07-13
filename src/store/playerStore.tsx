import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { Player } from '@/types';
import {
  savePlayer,
  loadPlayer,
  isOnboarded,
  setOnboarded,
} from '@/utils/storage';
import { generatePlayerId } from '@/utils/format';

// ─── State ────────────────────────────────────────────────────
interface PlayerState {
  player: Player | null;
  isLoading: boolean;
  hasOnboarded: boolean;
}

// ─── Actions ──────────────────────────────────────────────────
type PlayerAction =
  | { type: 'INIT'; player: Player | null; hasOnboarded: boolean }
  | { type: 'SET_PLAYER'; player: Player }
  | { type: 'UPDATE_SCORE'; matchId: string; score: number; badges: string[] }
  | { type: 'COMPLETE_ONBOARDING' };

function reducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'INIT':
      return { ...state, player: action.player, hasOnboarded: action.hasOnboarded, isLoading: false };

    case 'SET_PLAYER':
      return { ...state, player: action.player };

    case 'UPDATE_SCORE': {
      if (!state.player) return state;
      const newMatchScores = {
        ...state.player.matchScores,
        [action.matchId]: action.score,
      };
      const newTournamentScore = Object.values(newMatchScores).reduce((a, b) => a + b, 0);
      const scores = Object.values(newMatchScores);
      // Streak: scored ≥80 pts in a match (roughly equivalent to family match + some bonuses)
      // Previously ≥40 (out of 195 max), now ≥80 (out of 225 max) — same relative bar
      const streak = scores.filter((s) => s >= 80).length;
      const newBadges = [...new Set([...state.player.badges, ...action.badges])];
      const updated: Player = {
        ...state.player,
        matchScores: newMatchScores,
        tournamentScore: newTournamentScore,
        streak,
        badges: newBadges,
      };
      savePlayer(updated);
      return { ...state, player: updated };
    }

    case 'COMPLETE_ONBOARDING':
      setOnboarded();
      return { ...state, hasOnboarded: true };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────
interface PlayerContextValue {
  state: PlayerState;
  createPlayer: (name: string) => void;
  updateScore: (matchId: string, score: number, badges: string[]) => void;
  completeOnboarding: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────
export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    player: null,
    isLoading: true,
    hasOnboarded: false,
  });

  // Initialize from storage
  useEffect(() => {
    const player = loadPlayer();
    const hasOnboarded = isOnboarded();
    dispatch({ type: 'INIT', player, hasOnboarded });
  }, []);

  const createPlayer = useCallback((name: string) => {
    const player: Player = {
      id: generatePlayerId(),
      name: name.trim(),
      isGuest: true,
      createdAt: new Date().toISOString(),
      streak: 0,
      tournamentScore: 0,
      badges: [],
      matchScores: {},
    };
    savePlayer(player);
    dispatch({ type: 'SET_PLAYER', player });
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  }, []);

  const updateScore = useCallback((matchId: string, score: number, badges: string[]) => {
    dispatch({ type: 'UPDATE_SCORE', matchId, score, badges });
  }, []);

  const completeOnboarding = useCallback(() => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  }, []);

  return (
    <PlayerContext.Provider value={{ state, createPlayer, updateScore, completeOnboarding }}>
      {children}
    </PlayerContext.Provider>
  );
};
