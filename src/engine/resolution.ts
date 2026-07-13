import type {
  AdminMatchInput,
  MatchResolution,
  FirstHalfTempo,
  ScoringTiming,
  DramaLevel,
} from '@/types';
import { ALL_SCRIPTS } from '@/data/scripts';

// ─── Determine which script best matches actual match data ────
export function resolveMatch(
  matchId: string,
  input: AdminMatchInput
): MatchResolution {
  const {
    goalTimes,
    cards,
    redCards,
    teamAGoals,
    teamBGoals,
    extraTime,
    penalties,
    narrativeSummary,
    sideResults,
  } = input;

  const totalGoals = teamAGoals + teamBGoals;

  // ─── Determine dimensions ────────────────────────────────
  // First-half tempo: any goal before 45' or 4+ cards = active
  const firstHalfGoals = goalTimes.filter((t) => t <= 45).length;
  const firstHalfTempo: FirstHalfTempo =
    firstHalfGoals >= 1 || cards >= 3 ? 'active' : 'quiet';

  // Scoring timing
  let scoringTiming: ScoringTiming = 'deadlock';
  if (totalGoals > 0) {
    const firstGoal = Math.min(...goalTimes);
    if (firstGoal <= 20) {
      scoringTiming = 'early';
    } else if (firstGoal <= 74) {
      scoringTiming = 'mid';
    } else {
      scoringTiming = 'late';
    }
  }

  // Drama level: high if cards≥4 OR redCard OR lead changes
  const hasLeadChange = detectLeadChange(goalTimes, teamAGoals, teamBGoals);
  const dramaLevel: DramaLevel =
    cards >= 4 || redCards >= 1 || hasLeadChange ? 'high' : totalGoals >= 3 ? 'medium' : 'low';

  // Resolution type
  const resolutionType = penalties
    ? 'penalties'
    : extraTime
    ? 'extra_time'
    : 'normal';

  // ─── Match against script definitions ────────────────────
  const resolved = findBestScript({
    firstHalfTempo,
    scoringTiming,
    dramaLevel,
    resolutionType,
    totalGoals,
    redCards,
    goalTimes,
  });

  return {
    resolvedScriptId: resolved,
    resolvedAt: new Date().toISOString(),
    details: {
      firstHalfTempo,
      scoringTiming,
      dramaLevel,
      resolutionType,
      goalTimes,
      cards,
      redCards,
      teamAGoals,
      teamBGoals,
    },
    sideResults,
    narrativeSummary,
  };
}

// ─── Script matching algorithm ────────────────────────────────
function findBestScript(actual: {
  firstHalfTempo: FirstHalfTempo;
  scoringTiming: ScoringTiming;
  dramaLevel: DramaLevel;
  resolutionType: string;
  totalGoals: number;
  redCards: number;
  goalTimes: number[];
}): string {
  // Priority rules — checked in order:

  // D1: Penalties
  if (actual.resolutionType === 'penalties') return 'D1';

  // C2: Extra time but no penalties
  if (actual.resolutionType === 'extra_time') return 'C2';

  // D1 fallback: 0 goals in 90 min and no extra time (match abandoned state — shouldn't happen)

  // B2: Card-heavy chaos (red card or ≥4 yellows and high drama)
  if (actual.redCards >= 1 || (actual.dramaLevel === 'high' && actual.goalTimes.length === 0)) {
    return 'B2';
  }

  // C1: Late winner (decided after 75', normal time)
  const lateGoals = actual.goalTimes.filter((t) => t >= 75);
  const isLateWinner =
    lateGoals.length >= 1 &&
    actual.resolutionType === 'normal' &&
    actual.totalGoals <= 3;
  if (isLateWinner && actual.firstHalfTempo === 'quiet') return 'C1';

  // B3: Comeback — team was losing then scored to level/win
  // (Simplified: detect if goalTimes suggest a comeback)
  // For resolution, check if last N goals went to same team after conceding first
  if (actual.dramaLevel === 'high' && actual.totalGoals >= 2) return 'B3';

  // B1: Quiet first half, explosive second (2+ goals in second half)
  const secondHalfGoals = actual.goalTimes.filter((t) => t > 45).length;
  if (actual.firstHalfTempo === 'quiet' && secondHalfGoals >= 2) return 'B1';

  // A2: Early goal + control
  if (actual.scoringTiming === 'early' && actual.dramaLevel === 'low') return 'A2';

  // A3: One-sided dominance (≥3 goals, low drama)
  if (actual.totalGoals >= 3 && actual.dramaLevel === 'low') return 'A3';

  // A1: Cagey & controlled (default low-drama match)
  return 'A1';
}

// ─── Simple lead change detector ─────────────────────────────
function detectLeadChange(goalTimes: number[], teamAGoals: number, teamBGoals: number): boolean {
  // Simplified: if both teams scored, assume potential lead change
  return teamAGoals >= 1 && teamBGoals >= 1;
}
