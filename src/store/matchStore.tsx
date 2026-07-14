import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { Match } from '@/types';
import { MATCHES } from '@/data/matches';
import { saveMatches, loadMatches } from '@/utils/storage';
import { syncReadAllMatchResolutions } from '@/utils/sync';

// ─── Hydrate from localStorage, falling back to seed data ─────
function getInitialMatches(): Match[] {
  const persisted = loadMatches();
  if (!persisted) return MATCHES;

  // Merge persisted state onto seed: keeps any new seed matches,
  // but honours persisted status/resolution for existing matches.
  return MATCHES.map((seed) => {
    const saved = persisted.find((m) => m.id === seed.id);
    return saved ?? seed;
  });
}

// ─── State ────────────────────────────────────────────────────
interface MatchState {
  matches: Match[];
}

// ─── Actions ──────────────────────────────────────────────────
type MatchAction =
  | { type: 'UPDATE_MATCH'; match: Match }
  | { type: 'HYDRATE_FROM_FIRESTORE'; resolutions: Record<string, Pick<Match, 'status' | 'resolution'>> };

function reducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case 'UPDATE_MATCH': {
      const updated = state.matches.map((m) =>
        m.id === action.match.id ? action.match : m
      );
      saveMatches(updated); // persist every update to localStorage too
      return { ...state, matches: updated };
    }

    case 'HYDRATE_FROM_FIRESTORE': {
      // Merge Firestore resolution data onto current match array.
      // Only updates matches that Firestore knows about (i.e. resolved ones).
      const updated = state.matches.map((m) => {
        const remote = action.resolutions[m.id];
        if (!remote) return m;
        const merged: Match = { ...m, status: remote.status, resolution: remote.resolution };
        return merged;
      });
      saveMatches(updated); // keep localStorage in sync
      return { ...state, matches: updated };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────
interface MatchContextValue {
  state: MatchState;
  getMatch: (id: string) => Match | undefined;
  updateMatch: (match: Match) => void;
}

const MatchContext = createContext<MatchContextValue | null>(null);

export function useMatches(): MatchContextValue {
  const ctx = useContext(MatchContext);
  if (!ctx) throw new Error('useMatches must be used within MatchProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────
export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { matches: getInitialMatches() });

  // On mount: fetch all match resolutions from Firestore and merge them in.
  // This is what makes resolution cross-device: every user's app pulls the
  // admin-written Firestore data on load.
  useEffect(() => {
    syncReadAllMatchResolutions().then((resolutions) => {
      if (Object.keys(resolutions).length > 0) {
        dispatch({ type: 'HYDRATE_FROM_FIRESTORE', resolutions });
      }
    });
  }, []);

  const getMatch = useCallback(
    (id: string) => state.matches.find((m) => m.id === id),
    [state.matches]
  );

  const updateMatch = useCallback((match: Match) => {
    dispatch({ type: 'UPDATE_MATCH', match });
  }, []);

  return (
    <MatchContext.Provider value={{ state, getMatch, updateMatch }}>
      {children}
    </MatchContext.Provider>
  );
};
