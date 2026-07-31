import type {
  AdminMatchInput,
  MatchResolution,
  FirstHalfTempo,
  ScoringTiming,
  DramaLevel,
  ResolutionType,
} from '@/types';
import { getScriptById } from '@/data/scripts';

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
    resolvedScriptId,
  } = input;

  const resolved = resolvedScriptId;
  const script = getScriptById(resolved);

  const totalGoals = teamAGoals + teamBGoals;

  // ─── Computed Dimensions (used as fallback or for unmapped fields) ───
  const firstHalfGoals = goalTimes.filter((t) => t <= 45).length;
  const computedFirstHalfTempo: FirstHalfTempo =
    firstHalfGoals >= 1 || cards >= 3 ? 'active' : 'quiet';

  let computedScoringTiming: ScoringTiming = 'deadlock';
  if (totalGoals > 0) {
    const firstGoal = Math.min(...goalTimes);
    if (firstGoal <= 20) {
      computedScoringTiming = 'early';
    } else if (firstGoal <= 74) {
      computedScoringTiming = 'mid';
    } else {
      computedScoringTiming = 'late';
    }
  }

  const hasLeadChange = teamAGoals >= 1 && teamBGoals >= 1;
  const computedDramaLevel: DramaLevel =
    cards >= 4 || redCards >= 1 || hasLeadChange ? 'high' : totalGoals >= 3 ? 'medium' : 'low';

  const computedResolutionType: ResolutionType = penalties
    ? 'penalties'
    : extraTime
    ? 'extra_time'
    : 'normal';

  // ─── Final Resolution Dimensions ──────────────────────────────────
  // If the admin selected a specific script, we align the official match
  // dimensions exactly with the dimensions defined by that script.
  const firstHalfTempo = script
    ? (script.dimensions.firstHalfTempo ?? computedFirstHalfTempo)
    : computedFirstHalfTempo;

  const scoringTiming = script
    ? (script.dimensions.scoringTiming ?? computedScoringTiming)
    : computedScoringTiming;

  const dramaLevel = script ? script.dimensions.dramaLevel : computedDramaLevel;
  const resolutionType = script ? script.dimensions.resolutionType : computedResolutionType;

  const scorers = input.scorersInput
    ? input.scorersInput.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    resolvedScriptId: resolved,
    resolvedAt: new Date().toISOString(),
    scorers,
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
