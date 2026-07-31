import type { Match } from '@/types';
import { ALL_SCRIPTS, SIDE_PREDICTION_SETS } from './scripts';

// ─── Match Data — Premier League 2026/27 · Gameweek 1 ───────
// All kickoff times stored as UTC. BST = UTC+1.

export const MATCHES: Match[] = [

  // ─── Friday 21 Aug · 20:00 BST (19:00 UTC) ──────────────
  {
    id: 'gw1_m1',
    label: 'Gameweek 1 · Match 1',
    sublabel: 'Premier League 2026/27',
    teamA: {
      id: 'ars',
      name: 'Arsenal',
      shortCode: 'ARS',
      flagEmoji: '🔴',
      primaryColor: '#EF0107',
    },
    teamB: {
      id: 'cov',
      name: 'Coventry City',
      shortCode: 'COV',
      flagEmoji: '⚽',
      primaryColor: '#005FA4',
    },
    kickoff: '2026-08-21T19:00:00Z',
    status: 'upcoming',
    venue: 'Emirates Stadium',
    city: 'London',
    scripts: ALL_SCRIPTS,
    sideOptions: SIDE_PREDICTION_SETS.default,
  },

  // ─── Saturday 22 Aug · 12:30 BST (11:30 UTC) ────────────
  {
    id: 'gw1_m2',
    label: 'Gameweek 1 · Match 2',
    sublabel: 'Premier League 2026/27',
    teamA: {
      id: 'hul',
      name: 'Hull City',
      shortCode: 'HUL',
      flagEmoji: '🐯',
      primaryColor: '#F5A12D',
    },
    teamB: {
      id: 'mun',
      name: 'Manchester United',
      shortCode: 'MUN',
      flagEmoji: '🔴',
      primaryColor: '#DA020E',
    },
    kickoff: '2026-08-22T11:30:00Z',
    status: 'upcoming',
    venue: 'MKM Stadium',
    city: 'Hull',
    scripts: ALL_SCRIPTS,
    sideOptions: SIDE_PREDICTION_SETS.default,
  },

  // ─── Saturday 22 Aug · 15:00 BST (14:00 UTC) ────────────
  {
    id: 'gw1_m3',
    label: 'Gameweek 1 · Match 3',
    sublabel: 'Premier League 2026/27',
    teamA: {
      id: 'eve',
      name: 'Everton',
      shortCode: 'EVE',
      flagEmoji: '🔵',
      primaryColor: '#003399',
    },
    teamB: {
      id: 'cry',
      name: 'Crystal Palace',
      shortCode: 'CRY',
      flagEmoji: '🦅',
      primaryColor: '#1B458F',
    },
    kickoff: '2026-08-22T14:00:00Z',
    status: 'upcoming',
    venue: 'Goodison Park',
    city: 'Liverpool',
    scripts: ALL_SCRIPTS,
    sideOptions: SIDE_PREDICTION_SETS.default,
  },

  {
    id: 'gw1_m4',
    label: 'Gameweek 1 · Match 4',
    sublabel: 'Premier League 2026/27',
    teamA: {
      id: 'ips',
      name: 'Ipswich Town',
      shortCode: 'IPS',
      flagEmoji: '🔵',
      primaryColor: '#3A64A3',
    },
    teamB: {
      id: 'sun',
      name: 'Sunderland',
      shortCode: 'SUN',
      flagEmoji: '🔴',
      primaryColor: '#EB172B',
    },
    kickoff: '2026-08-22T14:00:00Z',
    status: 'upcoming',
    venue: 'Portman Road',
    city: 'Ipswich',
    scripts: ALL_SCRIPTS,
    sideOptions: SIDE_PREDICTION_SETS.default,
  },

  {
    id: 'gw1_m5',
    label: 'Gameweek 1 · Match 5',
    sublabel: 'Premier League 2026/27',
    teamA: {
      id: 'nfo',
      name: 'Nottingham Forest',
      shortCode: 'NFO',
      flagEmoji: '🌳',
      primaryColor: '#DD0000',
    },
    teamB: {
      id: 'lee',
      name: 'Leeds United',
      shortCode: 'LEE',
      flagEmoji: '⚪',
      primaryColor: '#FFCD00',
    },
    kickoff: '2026-08-22T14:00:00Z',
    status: 'upcoming',
    venue: 'City Ground',
    city: 'Nottingham',
    scripts: ALL_SCRIPTS,
    sideOptions: SIDE_PREDICTION_SETS.default,
  },

  // ─── Saturday 22 Aug · 17:30 BST (16:30 UTC) ────────────
  {
    id: 'gw1_m6',
    label: 'Gameweek 1 · Match 6',
    sublabel: 'Premier League 2026/27',
    teamA: {
      id: 'bre',
      name: 'Brentford',
      shortCode: 'BRE',
      flagEmoji: '⚪',
      primaryColor: '#E30613',
    },
    teamB: {
      id: 'spu',
      name: 'Tottenham Hotspur',
      shortCode: 'SPU',
      flagEmoji: '🐓',
      primaryColor: '#132257',
    },
    kickoff: '2026-08-22T16:30:00Z',
    status: 'upcoming',
    venue: 'Gtech Community Stadium',
    city: 'London',
    scripts: ALL_SCRIPTS,
    sideOptions: SIDE_PREDICTION_SETS.default,
  },

  // ─── Sunday 23 Aug · 14:00 BST (13:00 UTC) ──────────────
  {
    id: 'gw1_m7',
    label: 'Gameweek 1 · Match 7',
    sublabel: 'Premier League 2026/27',
    teamA: {
      id: 'bha',
      name: 'Brighton',
      shortCode: 'BHA',
      flagEmoji: '🔵',
      primaryColor: '#0057B8',
    },
    teamB: {
      id: 'avl',
      name: 'Aston Villa',
      shortCode: 'AVL',
      flagEmoji: '🦁',
      primaryColor: '#670E36',
    },
    kickoff: '2026-08-23T13:00:00Z',
    status: 'upcoming',
    venue: 'Amex Stadium',
    city: 'Brighton',
    scripts: ALL_SCRIPTS,
    sideOptions: SIDE_PREDICTION_SETS.default,
  },

  {
    id: 'gw1_m8',
    label: 'Gameweek 1 · Match 8',
    sublabel: 'Premier League 2026/27',
    teamA: {
      id: 'mci',
      name: 'Manchester City',
      shortCode: 'MCI',
      flagEmoji: '🔵',
      primaryColor: '#6CABDD',
    },
    teamB: {
      id: 'bou',
      name: 'Bournemouth',
      shortCode: 'BOU',
      flagEmoji: '🍒',
      primaryColor: '#DA291C',
    },
    kickoff: '2026-08-23T13:00:00Z',
    status: 'upcoming',
    venue: 'Etihad Stadium',
    city: 'Manchester',
    scripts: ALL_SCRIPTS,
    sideOptions: SIDE_PREDICTION_SETS.default,
  },

  // ─── Sunday 23 Aug · 16:30 BST (15:30 UTC) ──────────────
  {
    id: 'gw1_m9',
    label: 'Gameweek 1 · Match 9',
    sublabel: 'Premier League 2026/27',
    teamA: {
      id: 'new',
      name: 'Newcastle United',
      shortCode: 'NEW',
      flagEmoji: '⚫',
      primaryColor: '#241F20',
    },
    teamB: {
      id: 'liv',
      name: 'Liverpool',
      shortCode: 'LIV',
      flagEmoji: '🔴',
      primaryColor: '#C8102E',
    },
    kickoff: '2026-08-23T15:30:00Z',
    status: 'upcoming',
    venue: 'St. James\' Park',
    city: 'Newcastle',
    scripts: ALL_SCRIPTS,
    sideOptions: SIDE_PREDICTION_SETS.default,
  },

  // ─── Monday 24 Aug · 20:00 BST (19:00 UTC) ──────────────
  {
    id: 'gw1_m10',
    label: 'Gameweek 1 · Match 10',
    sublabel: 'Premier League 2026/27',
    teamA: {
      id: 'ful',
      name: 'Fulham',
      shortCode: 'FUL',
      flagEmoji: '⚫',
      primaryColor: '#CC0000',
    },
    teamB: {
      id: 'che',
      name: 'Chelsea',
      shortCode: 'CHE',
      flagEmoji: '🔵',
      primaryColor: '#034694',
    },
    kickoff: '2026-08-24T19:00:00Z',
    status: 'upcoming',
    venue: 'Craven Cottage',
    city: 'London',
    scripts: ALL_SCRIPTS,
    sideOptions: SIDE_PREDICTION_SETS.default,
  },
];

export function getMatchById(id: string): Match | undefined {
  return MATCHES.find((m) => m.id === id);
}

export function getMatchOrder(): string[] {
  return MATCHES.map((m) => m.id);
}
