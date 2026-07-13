import type { Match } from '@/types';
import { ALL_SCRIPTS, SIDE_PREDICTION_SETS } from './scripts';

// ─── Match Data — 2026 FIFA World Cup Semis & Final ──────────
// Based on actual FIFA World Cup 2026 tournament dates.
// Clean seed data: all matches start as upcoming.

export const MATCHES: Match[] = [
  // ─────────────────────────────────────────────────────────
  // SEMIFINAL 1
  // ─────────────────────────────────────────────────────────
  {
    id: 'sf1',
    label: 'Semifinal 1',
    sublabel: 'FIFA World Cup 2026',
    teamA: {
      id: 'fra',
      name: 'France',
      shortCode: 'FRA',
      flagEmoji: '🇫🇷',
      primaryColor: '#002395',
      flagCode: 'fr',
    },
    teamB: {
      id: 'esp',
      name: 'Spain',
      shortCode: 'ESP',
      flagEmoji: '🇪🇸',
      primaryColor: '#AA151B',
      flagCode: 'es',
    },
    kickoff: '2026-07-14T19:00:00Z', // 3:00 PM ET
    status: 'upcoming',
    venue: 'AT&T Stadium',
    city: 'Dallas',
    scripts: ALL_SCRIPTS.filter((s) =>
      ['A1', 'B1', 'B2', 'B3', 'C1', 'D1', 'A2', 'C2'].includes(s.id)
    ),
    sideOptions: SIDE_PREDICTION_SETS.default,
  },

  // ─────────────────────────────────────────────────────────
  // SEMIFINAL 2
  // ─────────────────────────────────────────────────────────
  {
    id: 'sf2',
    label: 'Semifinal 2',
    sublabel: 'FIFA World Cup 2026',
    teamA: {
      id: 'arg',
      name: 'Argentina',
      shortCode: 'ARG',
      flagEmoji: '🇦🇷',
      primaryColor: '#74ACDF',
      flagCode: 'ar',
    },
    teamB: {
      id: 'eng',
      name: 'England',
      shortCode: 'ENG',
      flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      primaryColor: '#CE1126',
      flagCode: 'gb-eng',
    },
    kickoff: '2026-07-15T19:00:00Z', // 3:00 PM ET
    status: 'upcoming',
    venue: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
    scripts: ALL_SCRIPTS.filter((s) =>
      ['A1', 'A2', 'A3', 'B1', 'B3', 'C1', 'C2', 'D1'].includes(s.id)
    ),
    sideOptions: SIDE_PREDICTION_SETS.default,
  },

  // ─────────────────────────────────────────────────────────
  // FINAL
  // ─────────────────────────────────────────────────────────
  {
    id: 'final',
    label: 'The Final',
    sublabel: 'FIFA World Cup 2026',
    teamA: {
      id: 'tbd_a',
      name: 'TBD',
      shortCode: '???',
      flagEmoji: '🏆',
      primaryColor: '#D4A843',
    },
    teamB: {
      id: 'tbd_b',
      name: 'TBD',
      shortCode: '???',
      flagEmoji: '🏆',
      primaryColor: '#D4A843',
    },
    kickoff: '2026-07-19T23:00:00Z', // 7:00 PM ET
    status: 'upcoming',
    venue: 'MetLife Stadium',
    city: 'New York / New Jersey',
    scripts: ALL_SCRIPTS.filter((s) =>
      ['A1', 'B1', 'B2', 'B3', 'C1', 'C2', 'D1', 'A2'].includes(s.id)
    ),
    sideOptions: SIDE_PREDICTION_SETS.final,
  },
];

export function getMatchById(id: string): Match | undefined {
  return MATCHES.find((m) => m.id === id);
}

export function getMatchOrder(): string[] {
  return ['sf1', 'sf2', 'final'];
}
