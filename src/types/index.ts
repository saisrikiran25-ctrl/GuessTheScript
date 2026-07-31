// ============================================================
// CORE TYPES — Guess the Script
// ============================================================

export type MatchStatus = 'upcoming' | 'live' | 'resolved' | 'void';
export type ScriptFamily = 'A' | 'B' | 'C' | 'D';
export type FirstHalfTempo = 'quiet' | 'active';
export type ScoringTiming = 'early' | 'mid' | 'late' | 'deadlock';
export type DramaLevel = 'low' | 'medium' | 'high';
export type ResolutionType = 'normal' | 'extra_time' | 'penalties';

// ─── Team ────────────────────────────────────────────────────
export interface Team {
  id: string;
  name: string;
  shortCode: string;
  flagEmoji: string;
  primaryColor: string;
  flagCode?: string;
  badgeUrl?: string;
}

// ─── Script Option ───────────────────────────────────────────
export interface ScriptOption {
  id: string;
  label: string;
  description: string;
  family: ScriptFamily;
  familyLabel: string;
  familyColor: string;
  // Narrative dimensions for closeness scoring
  dimensions: {
    firstHalfTempo: FirstHalfTempo | null;
    scoringTiming: ScoringTiming | null;
    dramaLevel: DramaLevel;
    resolutionType: ResolutionType;
  };
}

// ─── Side Prediction ─────────────────────────────────────────
export interface SidePredictionOption {
  id: string;
  question: string;
  choices: { value: string; label: string }[];
}

// ─── Match ───────────────────────────────────────────────────
export interface Match {
  id: string;
  label: string;
  sublabel: string;
  teamA: Team;
  teamB: Team;
  kickoff: string; // ISO8601
  status: MatchStatus;
  venue: string;
  city: string;
  scripts: ScriptOption[];
  sideOptions: SidePredictionOption[];
  resolution?: MatchResolution;
}

// ─── Match Resolution ────────────────────────────────────────
export interface MatchResolution {
  resolvedScriptId: string;
  resolvedAt: string; // ISO8601
  details: {
    firstHalfTempo: FirstHalfTempo;
    scoringTiming: ScoringTiming;
    dramaLevel: DramaLevel;
    resolutionType: ResolutionType;
    goalTimes: number[];
    cards: number;
    redCards: number;
    teamAGoals: number;
    teamBGoals: number;
  };
  sideResults: { optionId: string; correct: string }[];
  narrativeSummary: string;
}

// ─── Player Prediction ───────────────────────────────────────
export interface PlayerPrediction {
  matchId: string;
  playerId: string;
  scriptId: string;
  sideSelections: { optionId: string; answer: string }[];
  submittedAt: string; // ISO8601
  isLocked: boolean;
}

// ─── Player Score ────────────────────────────────────────────
export interface PlayerScore {
  playerId: string;
  matchId: string;
  primaryScriptScore: number;       // 0, 15, 40, or 100
  familyBonusScore: number;         // up to 40 (4 dims × 10)
  sidePredictionScore: number;      // up to 60 (6 × 10)
  perfectBonus: number;             // 25 if exact script + all sides correct
  totalMatchScore: number;
  badgesEarned: string[];
  breakdown: ScoreBreakdownItem[];
}

export interface ScoreBreakdownItem {
  label: string;
  points: number;
  earned: boolean;
  detail?: string;
}

// ─── Player ──────────────────────────────────────────────────
export interface Player {
  id: string;
  name: string;
  isGuest: boolean;
  createdAt: string; // ISO8601
  streak: number;
  tournamentScore: number;
  badges: string[];
  matchScores: Record<string, number>; // matchId → score
}

// ─── Badge ───────────────────────────────────────────────────
export interface BadgeDefinition {
  id: string;
  label: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'legendary';
}

// ─── Leaderboard Entry ───────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  name: string;
  tournamentScore: number;
  matchScores: Record<string, number>;
  streak: number;
  badges: string[];
  isCurrentPlayer?: boolean;
  exactMatchCount: number;
}

// ─── Group ───────────────────────────────────────────────────
export interface Group {
  code: string;
  name: string;
  createdAt: string;
  memberIds: string[];
}

// ─── UI Store State ──────────────────────────────────────────
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  action?: { label: string; onClick: () => void };
}

// ─── Admin Match Input ───────────────────────────────────────
export interface AdminMatchInput {
  goalTimes: number[];
  cards: number;
  redCards: number;
  teamAGoals: number;
  teamBGoals: number;
  extraTime: boolean;
  penalties: boolean;
  narrativeSummary: string;
  sideResults: { optionId: string; correct: string }[];
  resolvedScriptId: string;
}
