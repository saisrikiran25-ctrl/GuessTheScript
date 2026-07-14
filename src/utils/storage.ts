import type { Match, Player, PlayerPrediction, PlayerScore } from '@/types';

const PREFIX = 'gts_';

const KEYS = {
  player: `${PREFIX}player`,
  predictions: `${PREFIX}predictions`,
  scores: `${PREFIX}scores`,
  onboarded: `${PREFIX}onboarded`,
  matches: `${PREFIX}matches`,
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
