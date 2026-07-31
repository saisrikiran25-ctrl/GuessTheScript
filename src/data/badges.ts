import type { BadgeDefinition } from '@/types';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_script',
    label: 'First Script',
    description: 'Submitted your first Premier League match prediction.',
    icon: '📜',
    rarity: 'common',
  },
  {
    id: 'clean_sheet_master',
    label: 'Clean Sheet Master',
    description: 'Predicted a tactical defensive masterclass clean sheet.',
    icon: '🛡️',
    rarity: 'common',
  },
  {
    id: 'perfect_half',
    label: 'Perfect Half',
    description: 'Called first-half tempo and scoring timing correctly.',
    icon: '🌙',
    rarity: 'common',
  },
  {
    id: 'early_riser',
    label: 'Early Riser',
    description: 'Submitted prediction 12+ hours before kickoff.',
    icon: '🌅',
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
    id: 'goal_fest_oracle',
    label: 'Goal Fest Oracle',
    description: 'Predicted a high-scoring 4+ goal festival.',
    icon: '⚽',
    rarity: 'rare',
  },
  {
    id: 'perfect_script',
    label: 'Perfect Script',
    description: 'Exact match on primary script. 100 base points.',
    icon: '✨',
    rarity: 'rare',
  },
  {
    id: 'comeback_believer',
    label: 'Comeback Believer',
    description: 'Called a second-half comeback and watched it unfold.',
    icon: '↩️',
    rarity: 'rare',
  },
  {
    id: 'late_drama',
    label: 'Late Drama Caller',
    description: 'Predicted 90+ minute stoppage-time winning drama.',
    icon: '⏱️',
    rarity: 'rare',
  },
  {
    id: 'hat_trick',
    label: 'Hat-Trick of Reads',
    description: 'Scored 160+ points in 3 Premier League matches.',
    icon: '🎩',
    rarity: 'legendary',
  },
  {
    id: 'script_master',
    label: 'Script Master',
    description: 'Achieved 3 Perfect Scripts in the season.',
    icon: '🎬',
    rarity: 'legendary',
  },
  {
    id: 'the_oracle',
    label: 'The Oracle',
    description: 'Achieved 5 Perfect Scripts in the season. Rarest honor.',
    icon: '🔮',
    rarity: 'legendary',
  },
];

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === id);
}

export function getBadgesByIds(ids: string[]): BadgeDefinition[] {
  return ids.map((id) => getBadgeById(id)).filter(Boolean) as BadgeDefinition[];
}
