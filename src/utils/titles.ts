/**
 * Dynamically computes a player's official tier title based on their total season score.
 * Applied across all user profiles, leaderboards, and private groups.
 */
export function getPlayerTitle(score: number): string {
  if (score >= 5000) return 'GOD OF PROPHETS';
  if (score >= 2500) return 'LEGENDARY ORACLE';
  if (score >= 1000) return 'MASTER PROPHET';
  if (score >= 500) return 'TACTICAL GENIUS';
  if (score >= 200) return 'SEASONED ORACLE';
  if (score >= 80) return 'PROSPECT PROPHET';
  return 'PREMIER LEAGUE ORACLE';
}
