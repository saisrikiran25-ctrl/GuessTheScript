import type { ScriptOption, SidePredictionOption } from '@/types';

// ─── All 9 Script Definitions ────────────────────────────────
// These are the canonical script taxonomy.
// Each match surfaces 6–8 of these based on context.

export const ALL_SCRIPTS: ScriptOption[] = [
  // FAMILY A — Tempo & Control
  {
    id: 'A1',
    label: 'Cagey & Controlled',
    description: 'Both teams careful, organized, low risk. Minimal chances in the first half. Decided by the smallest margin — a set piece or a moment of individual quality.',
    family: 'A',
    familyLabel: 'Tempo & Control',
    familyColor: '#4A90D9',
    dimensions: {
      firstHalfTempo: 'quiet',
      scoringTiming: 'mid',
      dramaLevel: 'low',
      resolutionType: 'normal',
    },
  },
  {
    id: 'A2',
    label: 'Fast Start, Then Control',
    description: 'An early goal before the 20th minute flips the dynamic. The leading side then manages the game — clinical, efficient, controlled.',
    family: 'A',
    familyLabel: 'Tempo & Control',
    familyColor: '#4A90D9',
    dimensions: {
      firstHalfTempo: 'active',
      scoringTiming: 'early',
      dramaLevel: 'low',
      resolutionType: 'normal',
    },
  },
  {
    id: 'A3',
    label: 'One-Sided Dominance',
    description: 'One team controls possession, creates chance after chance. Comfortable winning margin. The result feels inevitable by the 60th minute.',
    family: 'A',
    familyLabel: 'Tempo & Control',
    familyColor: '#4A90D9',
    dimensions: {
      firstHalfTempo: 'active',
      scoringTiming: 'early',
      dramaLevel: 'low',
      resolutionType: 'normal',
    },
  },

  // FAMILY B — Drama & Chaos
  {
    id: 'B1',
    label: 'Quiet Start, Explosive Finish',
    description: 'A cagey first half gives way to a dramatic second. Two or more significant events — goals, cards, substitutions — reshape the match after the break.',
    family: 'B',
    familyLabel: 'Drama & Chaos',
    familyColor: '#E67E22',
    dimensions: {
      firstHalfTempo: 'quiet',
      scoringTiming: 'late',
      dramaLevel: 'high',
      resolutionType: 'normal',
    },
  },
  {
    id: 'B2',
    label: 'Card-Heavy Chaos',
    description: 'Physical, disjointed, VAR-influenced. Four or more bookings or a red card changes the shape of the game. Tension overrides football.',
    family: 'B',
    familyLabel: 'Drama & Chaos',
    familyColor: '#E67E22',
    dimensions: {
      firstHalfTempo: null,
      scoringTiming: null,
      dramaLevel: 'high',
      resolutionType: 'normal',
    },
  },
  {
    id: 'B3',
    label: 'Comeback Story',
    description: 'A team goes behind but fights back to equalize or win. A momentum shift that makes the first half feel like a different match.',
    family: 'B',
    familyLabel: 'Drama & Chaos',
    familyColor: '#E67E22',
    dimensions: {
      firstHalfTempo: 'active',
      scoringTiming: 'mid',
      dramaLevel: 'high',
      resolutionType: 'normal',
    },
  },

  // FAMILY C — Deadline Drama
  {
    id: 'C1',
    label: 'Late Winner',
    description: 'The match is decided after the 75th minute. A goal deep in normal time — possibly in stoppage time — ends it. Late drama, late heartbreak.',
    family: 'C',
    familyLabel: 'Deadline Drama',
    familyColor: '#9B59B6',
    dimensions: {
      firstHalfTempo: 'quiet',
      scoringTiming: 'late',
      dramaLevel: 'medium',
      resolutionType: 'normal',
    },
  },
  {
    id: 'C2',
    label: 'Extra Time After Deadlock',
    description: 'Ninety minutes of tension produces no winner. Both teams leave it all on the pitch in extra time. The match runs 120 minutes.',
    family: 'C',
    familyLabel: 'Deadline Drama',
    familyColor: '#9B59B6',
    dimensions: {
      firstHalfTempo: 'quiet',
      scoringTiming: 'deadlock',
      dramaLevel: 'medium',
      resolutionType: 'extra_time',
    },
  },

  // FAMILY D — Shootout
  {
    id: 'D1',
    label: 'Penalties After Deadlock',
    description: 'Neither team can win in 120 minutes. It goes to a penalty shootout. The lottery of football. The highest drama the game can produce.',
    family: 'D',
    familyLabel: 'Shootout',
    familyColor: '#C0392B',
    dimensions: {
      firstHalfTempo: 'quiet',
      scoringTiming: 'deadlock',
      dramaLevel: 'high',
      resolutionType: 'penalties',
    },
  },
];

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
      id: 'sp_normal_time',
      question: 'Decided in normal time?',
      choices: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'Goes beyond' },
      ],
    },
  ],
  chaos: [
    {
      id: 'sp_red_card',
      question: 'At least one red card?',
      choices: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
    {
      id: 'sp_total_goals',
      question: 'Total goals in the match?',
      choices: [
        { value: 'low', label: '0–1' },
        { value: 'mid', label: '2–3' },
        { value: 'high', label: '4+' },
      ],
    },
  ],
  final: [
    {
      id: 'sp_penalties',
      question: 'Does it go to penalties?',
      choices: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
    {
      id: 'sp_goals_scored',
      question: 'Both teams score?',
      choices: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'One team blanked' },
      ],
    },
  ],
};

// Helper: get script by id
export function getScriptById(id: string): ScriptOption | undefined {
  return ALL_SCRIPTS.find((s) => s.id === id);
}
