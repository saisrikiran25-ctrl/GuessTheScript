import type { Match, Player, PlayerPrediction, PlayerScore } from '@/types';

const PREFIX = 'gts_';

const KEYS = {
  player: `${PREFIX}player`,
  predictions: `${PREFIX}predictions`,
  scores: `${PREFIX}scores`,
  onboarded: `${PREFIX}onboarded`,
  matches: `${PREFIX}matches`,
  seasonId: `${PREFIX}season_id`,
} as const;

// ─── Player ───────────────────────────────────────────────────
export function savePlayer(player: Player): void {
  try {
    localStorage.setItem(KEYS.player, JSON.stringify(player));
  } catch {
    console.warn('Failed to save player to localStorage');
  }
}

export function loadPlayer(): Player | null {
  try {
    const raw = localStorage.getItem(KEYS.player);
    return raw ? (JSON.parse(raw) as Player) : null;
  } catch {
    return null;
  }
}

// ─── Onboarding State ─────────────────────────────────────────
export function setOnboarded(): void {
  localStorage.setItem(KEYS.onboarded, 'true');
}

export function isOnboarded(): boolean {
  return localStorage.getItem(KEYS.onboarded) === 'true';
}

// ─── Predictions ─────────────────────────────────────────────
export function savePrediction(prediction: PlayerPrediction): void {
  const all = loadAllPredictions();
  const key = `${prediction.matchId}__${prediction.playerId}`;
  all[key] = prediction;
  try {
    localStorage.setItem(KEYS.predictions, JSON.stringify(all));
  } catch {
    console.warn('Failed to save prediction');
  }
}

export function loadPrediction(
  matchId: string,
  playerId: string
): PlayerPrediction | null {
  const all = loadAllPredictions();
  return all[`${matchId}__${playerId}`] ?? null;
}

export function loadAllPredictions(): Record<string, PlayerPrediction> {
  try {
    const raw = localStorage.getItem(KEYS.predictions);
    return raw ? (JSON.parse(raw) as Record<string, PlayerPrediction>) : {};
  } catch {
    return {};
  }
}

// ─── Scores ──────────────────────────────────────────────────
export function saveScore(score: PlayerScore): void {
  const all = loadAllScores();
  const key = `${score.matchId}__${score.playerId}`;
  all[key] = score;
  try {
    localStorage.setItem(KEYS.scores, JSON.stringify(all));
  } catch {
    console.warn('Failed to save score');
  }
}

export function loadScore(matchId: string, playerId: string): PlayerScore | null {
  const all = loadAllScores();
  return all[`${matchId}__${playerId}`] ?? null;
}

export function loadAllScores(): Record<string, PlayerScore> {
  try {
    const raw = localStorage.getItem(KEYS.scores);
    return raw ? (JSON.parse(raw) as Record<string, PlayerScore>) : {};
  } catch {
    return {};
  }
}

// ─── Matches ─────────────────────────────────────────────────
export function saveMatches(matches: Match[]): void {
  try {
    localStorage.setItem(KEYS.matches, JSON.stringify(matches));
  } catch {
    console.warn('Failed to save matches to localStorage');
  }
}

export function loadMatches(): Match[] | null {
  try {
    const raw = localStorage.getItem(KEYS.matches);
    return raw ? (JSON.parse(raw) as Match[]) : null;
  } catch {
    return null;
  }
}

// ─── Clear all (dev/test use) ─────────────────────────────────
export function clearAll(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

// ─── Season ID tracking ───────────────────────────────────────
// Used to auto-reset user prediction/score data when a new season starts.
export function getStoredSeasonId(): string | null {
  return localStorage.getItem(KEYS.seasonId);
}

export function setStoredSeasonId(id: string): void {
  localStorage.setItem(KEYS.seasonId, id);
}

// Wipes all per-season data (predictions, scores, match cache, player stats)
// but preserves player identity (name, id, onboarded flag).
export function resetSeasonData(): void {
  // Preserve identity
  const player = loadPlayer();
  // Clear all season-specific data
  localStorage.removeItem(KEYS.predictions);
  localStorage.removeItem(KEYS.scores);
  localStorage.removeItem(KEYS.matches);
  // Reset player stats but keep identity fields
  if (player) {
    const resetPlayer = {
      ...player,
      streak: 0,
      tournamentScore: 0,
      badges: [],
      matchScores: {},
    };
    localStorage.setItem(KEYS.player, JSON.stringify(resetPlayer));
  }
}
