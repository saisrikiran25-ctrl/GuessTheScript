import type { ScriptOption, SidePredictionOption, Match } from '@/types';

// ─── All 11 Premier League & League Match Scripts ─────────────
// 4 Families:
// Family A — Control & Dominance (#00F2FE)
// Family B — Drama & Momentum (#FF5E36)
// Family C — Tactical Shifts & Incidents (#D946EF)
// Family D — High Entertainment & Upsets (#FF2A55)

export const ALL_SCRIPTS: ScriptOption[] = [
  // ─── FAMILY A — Control & Dominance ────────────────────────
  {
    id: 'S1',
    label: 'Routine/Dominant Win',
    description: 'Better side controls possession, territory, and chances from early on; scoreline just confirms it. No real tension after ~60 mins. (e.g., 3-0, 4-1)',
    family: 'A',
    familyLabel: 'Control & Dominance',
    familyColor: '#00F2FE',
    dimensions: {
      firstHalfTempo: 'active',
      scoringTiming: 'early',
      dramaLevel: 'low',
      resolutionType: 'normal',
    },
  },
  {
    id: 'S7',
    label: 'Cagey Stalemate',
    description: 'Tactical chess match, low event count, few clear chances. 0-0 or a scrappy 1-0/1-1 where the story is what didn\'t happen rather than what did.',
    family: 'A',
    familyLabel: 'Control & Dominance',
    familyColor: '#00F2FE',
    dimensions: {
      firstHalfTempo: 'quiet',
      scoringTiming: 'deadlock',
      dramaLevel: 'low',
      resolutionType: 'normal',
    },
  },

  // ─── FAMILY B — Drama & Momentum ───────────────────────────
  {
    id: 'S3',
    label: 'Late Drama',
    description: 'Tense, tight game broken open in the final 10-15 minutes or stoppage time — a winner or a last-gasp equalizer. Arguably the most replayed narrative type in the PL.',
    family: 'B',
    familyLabel: 'Drama & Momentum',
    familyColor: '#FF5E36',
    dimensions: {
      firstHalfTempo: 'quiet',
      scoringTiming: 'late',
      dramaLevel: 'high',
      resolutionType: 'normal',
    },
  },
  {
    id: 'S4',
    label: 'The Comeback',
    description: 'Team goes down (often by 2+) and claws back to win or draw. Reads as a resilience/mentality story.',
    family: 'B',
    familyLabel: 'Drama & Momentum',
    familyColor: '#FF5E36',
    dimensions: {
      firstHalfTempo: 'active',
      scoringTiming: 'mid',
      dramaLevel: 'high',
      resolutionType: 'normal',
    },
  },
  {
    id: 'S5',
    label: 'The Collapse',
    description: 'Mirror image of #4 — team builds a seemingly safe lead, then concedes control and points late. Reads as a bottle-job/capitulation story.',
    family: 'B',
    familyLabel: 'Drama & Momentum',
    familyColor: '#FF5E36',
    dimensions: {
      firstHalfTempo: 'active',
      scoringTiming: 'late',
      dramaLevel: 'high',
      resolutionType: 'normal',
    },
  },

  // ─── FAMILY C — Tactical Shifts & Incidents ─────────────────
  {
    id: 'S2',
    label: 'Smash and Grab / Backs-to-the-Wall',
    description: 'One team dominates the run of play but the other nicks a goal (counter, set piece, moment of quality) and holds on. Classic "wrong side of the stats sheet" result.',
    family: 'C',
    familyLabel: 'Tactical Shifts & Incidents',
    familyColor: '#D946EF',
    dimensions: {
      firstHalfTempo: 'quiet',
      scoringTiming: 'mid',
      dramaLevel: 'medium',
      resolutionType: 'normal',
    },
  },
  {
    id: 'S8',
    label: 'Red Card Turning Point',
    description: 'An early or pre-halftime sending-off reshapes the whole match, usually tilting it decisively toward the side with the extra man.',
    family: 'C',
    familyLabel: 'Tactical Shifts & Incidents',
    familyColor: '#D946EF',
    dimensions: {
      firstHalfTempo: null,
      scoringTiming: null,
      dramaLevel: 'high',
      resolutionType: 'normal',
    },
  },
  {
    id: 'S10',
    label: 'Decided by One Moment',
    description: 'An otherwise even, balanced game turned by a single incident — a wondergoal, a VAR/penalty controversy, a defensive howler. The narrative is "the game was even until X happened."',
    family: 'C',
    familyLabel: 'Tactical Shifts & Incidents',
    familyColor: '#D946EF',
    dimensions: {
      firstHalfTempo: 'quiet',
      scoringTiming: 'late',
      dramaLevel: 'medium',
      resolutionType: 'normal',
    },
  },

  // ─── FAMILY D — High Entertainment & Upsets ────────────────
  {
    id: 'S6',
    label: 'End-to-End Shootout',
    description: 'Both sides trade goals, momentum swings repeatedly, defense optional. High entertainment, often called "end-to-end" or "basketball score." (e.g., 3-3, 5-2, 4-3)',
    family: 'D',
    familyLabel: 'High Entertainment & Upsets',
    familyColor: '#FF2A55',
    dimensions: {
      firstHalfTempo: 'active',
      scoringTiming: 'mid',
      dramaLevel: 'high',
      resolutionType: 'normal',
    },
  },
  {
    id: 'S9',
    label: 'The Upset / Giant-Killing',
    description: 'Clear underdog beats or holds a heavy favorite. More common in cups and UCL group/league phase, but happens in the PL against "bigger" clubs too.',
    family: 'D',
    familyLabel: 'High Entertainment & Upsets',
    familyColor: '#FF2A55',
    dimensions: {
      firstHalfTempo: 'quiet',
      scoringTiming: 'mid',
      dramaLevel: 'high',
      resolutionType: 'normal',
    },
  },
  {
    id: 'S11',
    label: 'Knockout Theatre (UCL-specific)',
    description: 'Two-legged ties or knockout fixtures decided by extra time, penalties, or a late aggregate swing across 180 minutes rather than within one match.',
    family: 'D',
    familyLabel: 'High Entertainment & Upsets',
    familyColor: '#FF2A55',
    isKnockoutOnly: true,
    dimensions: {
      firstHalfTempo: 'active',
      scoringTiming: 'deadlock',
      dramaLevel: 'high',
      resolutionType: 'extra_time',
    },
  },
];

// Helper: get available scripts for a match
// Excludes Knockout Theatre unless match.isKnockout === true
export function getScriptsForMatch(match?: Match): ScriptOption[] {
  if (!match || !match.isKnockout) {
    return ALL_SCRIPTS.filter((s) => !s.isKnockoutOnly);
  }
  return ALL_SCRIPTS;
}

// ─── Side Prediction Options (used across matches) ────────────

export const SIDE_PREDICTION_SETS: Record<string, SidePredictionOption[]> = {
  default: [
    {
      id: 'sp_early_goal',
      question: 'Goal before the 20th minute?',
      choices: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
    {
      id: 'sp_goalscorer',
      question: 'Write the name of the scorer or one of the scorers:',
      isTextInput: true,
      placeholder: 'e.g. Bukayo Saka',
      choices: [],
    },
    {
      id: 'sp_both_score',
      question: 'Clean sheet kept?',
      choices: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
    {
      id: 'sp_total_goals',
      question: 'Total goals in the match?',
      choices: [
        { value: 'low', label: '0–1 Goals' },
        { value: 'mid', label: '2–3 Goals' },
        { value: 'high', label: '4+ Goals' },
      ],
    },
    {
      id: 'sp_red_card',
      question: 'At least one red card?',
      choices: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
    {
      id: 'sp_comeback',
      question: 'A team comes from behind?',
      choices: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
  ],
};

// Helper: get script by id
export function getScriptById(id: string): ScriptOption | undefined {
  return ALL_SCRIPTS.find((s) => s.id === id);
}
