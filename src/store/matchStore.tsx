import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { Match } from '@/types';
import { MATCHES } from '@/data/matches';

// ─── State ────────────────────────────────────────────────────
interface MatchState {
  matches: Match[];
}

// ─── Actions ──────────────────────────────────────────────────
type MatchAction =
  | { type: 'UPDATE_MATCH'; match: Match };

function reducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case 'UPDATE_MATCH':
      return {
        ...state,
        matches: state.matches.map((m) =>
          m.id === action.match.id ? action.match : m
        ),
      };
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
  const [state, dispatch] = useReducer(reducer, { matches: MATCHES });

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
