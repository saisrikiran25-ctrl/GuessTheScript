import type { BadgeDefinition } from '@/types';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_script',
    label: 'First Script',
    description: 'Submitted your first prediction.',
    icon: '📜',
    rarity: 'common',
  },
  {
    id: 'called_the_chaos',
    label: 'Called the Chaos',
    description: 'Predicted a card-heavy chaotic match and it delivered.',
    icon: '🟥',
    rarity: 'rare',
  },
  {
    id: 'penalty_prophet',
    label: 'Penalty Prophet',
    description: 'Predicted the penalty shootout. The most dramatic call in football.',
    icon: '🎯',
    rarity: 'rare',
  },
  {
    id: 'perfect_half',
    label: 'Perfect Half',
    description: 'Called the first-half tempo and scoring timing correctly.',
    icon: '🌙',
    rarity: 'common',
  },
  {
    id: 'perfect_script',
    label: 'Perfect Script',
    description: 'Exact match on the primary script. 100 points.',
    icon: '✨',
    rarity: 'rare',
  },
  {
    id: 'script_master',
    label: 'Script Master',
    description: 'Perfect Script on 2 of 3 matches.',
    icon: '🎬',
    rarity: 'legendary',
  },
  {
    id: 'the_oracle',
    label: 'The Oracle',
    description: 'Perfect Script on all 3 World Cup matches. Rarest achievement.',
    icon: '🔮',
    rarity: 'legendary',
  },
  {
    id: 'comeback_believer',
    label: 'Comeback Believer',
    description: 'Called the comeback and watched it happen.',
    icon: '↩️',
    rarity: 'rare',
  },
  {
    id: 'hat_trick',
    label: 'Hat-Trick of Reads',
    description: 'Scored at least 40 points in all 3 matches.',
    icon: '🎩',
    rarity: 'legendary',
  },
  {
    id: 'late_drama',
    label: 'Late Drama Caller',
    description: 'Predicted a late winner and football delivered.',
    icon: '⏱️',
    rarity: 'rare',
  },
  {
    id: 'extra_time_prophet',
    label: 'Extra Time Prophet',
    description: 'Called extra time. You felt the deadlock before anyone else.',
    icon: '⌛',
    rarity: 'rare',
  },
  {
    id: 'early_riser',
    label: 'Early Riser',
    description: 'Submitted your prediction more than 12 hours before kickoff.',
    icon: '🌅',
    rarity: 'common',
  },
];

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === id);
}

export function getBadgesByIds(ids: string[]): BadgeDefinition[] {
  return ids.map((id) => getBadgeById(id)).filter(Boolean) as BadgeDefinition[];
}
