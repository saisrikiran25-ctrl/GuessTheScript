import type {
  Match,
  PlayerPrediction,
  PlayerScore,
  ScoreBreakdownItem,
  MatchResolution,
} from '@/types';
import { getScriptById } from '@/data/scripts';

// ─── Scoring Constants ────────────────────────────────────────
// Max per match: 100 (script) + 40 (dims) + 60 (6×10 side preds) + 25 (perfect) = 225
// Max tournament (4 matches): 900
const EXACT_MATCH_SCORE = 100;
const FAMILY_MATCH_SCORE = 40;
const PARTIAL_MATCH_SCORE = 15;
const DIMENSION_BONUS_PER_DIM = 10;
const SIDE_PRED_SCORE = 10;  // 6 questions × 10 pts = 60 pts max
const PERFECT_BONUS = 25;

// ─── Season Config ────────────────────────────────────────────
// Change this constant each new season to trigger automatic data reset for all users.
export const SEASON_ID = 'pl_2026_27';
export const TOTAL_SEASON_MATCHES = 380;

// ─── Score a single prediction against a resolved match ───────
export function scorePrediction(
  prediction: PlayerPrediction,
  match: Match
): PlayerScore {
  const resolution = match.resolution;
  if (!resolution) {
    throw new Error(`Match ${match.id} has no resolution`);
  }

  const selectedScript = getScriptById(prediction.scriptId);
  const resolvedScript = getScriptById(resolution.resolvedScriptId);

  if (!selectedScript || !resolvedScript) {
    throw new Error('Invalid script ID');
  }

  const breakdown: ScoreBreakdownItem[] = [];

  // ─── Primary Script Score ─────────────────────────────────
  let primaryScriptScore = 0;
  const isExactMatch = prediction.scriptId === resolution.resolvedScriptId;
  const isFamilyMatch =
    !isExactMatch && selectedScript.family === resolvedScript.family;

  if (isExactMatch) {
    primaryScriptScore = EXACT_MATCH_SCORE;
    breakdown.push({
      label: 'Exact Script Match',
      points: EXACT_MATCH_SCORE,
      earned: true,
      detail: `You called "${selectedScript.label}" — that's exactly what happened.`,
    });
  } else if (isFamilyMatch) {
    primaryScriptScore = FAMILY_MATCH_SCORE;
    breakdown.push({
      label: 'Right Narrative Family',
      points: FAMILY_MATCH_SCORE,
      earned: true,
      detail: `Wrong script, right family. You felt the shape.`,
    });
  } else {
    primaryScriptScore = PARTIAL_MATCH_SCORE;
    breakdown.push({
      label: 'Partial Credit',
      points: PARTIAL_MATCH_SCORE,
      earned: true,
      detail: `Football went a different direction, but some elements aligned.`,
    });
  }

  // ─── Dimension Bonus ──────────────────────────────────────
  let familyBonusScore = 0;
  const dims = selectedScript.dimensions;
  const actual = resolution.details;
  const dimensionBreakdown: ScoreBreakdownItem[] = [];

  // Dim 1: First-half tempo
  if (dims.firstHalfTempo !== null && dims.firstHalfTempo === actual.firstHalfTempo) {
    familyBonusScore += DIMENSION_BONUS_PER_DIM;
    dimensionBreakdown.push({
      label: 'First-Half Read',
      points: DIMENSION_BONUS_PER_DIM,
      earned: true,
      detail: `You read the ${actual.firstHalfTempo} first-half correctly.`,
    });
  } else {
    dimensionBreakdown.push({
      label: 'First-Half Read',
      points: 0,
      earned: false,
      detail:
        dims.firstHalfTempo === null
          ? 'Not applicable for this script.'
          : `Expected ${dims.firstHalfTempo}, was ${actual.firstHalfTempo}.`,
    });
  }

  // Dim 2: Scoring timing
  if (dims.scoringTiming !== null && dims.scoringTiming === actual.scoringTiming) {
    familyBonusScore += DIMENSION_BONUS_PER_DIM;
    dimensionBreakdown.push({
      label: 'Scoring Timing',
      points: DIMENSION_BONUS_PER_DIM,
      earned: true,
      detail: `You called the ${actual.scoringTiming} scoring correctly.`,
    });
  } else {
    dimensionBreakdown.push({
      label: 'Scoring Timing',
      points: 0,
      earned: false,
      detail:
        dims.scoringTiming === null
          ? 'Not applicable for this script.'
          : `Expected ${dims.scoringTiming} goals, was ${actual.scoringTiming}.`,
    });
  }

  // Dim 3: Drama level
  if (dims.dramaLevel === actual.dramaLevel) {
    familyBonusScore += DIMENSION_BONUS_PER_DIM;
    dimensionBreakdown.push({
      label: 'Drama Level',
      points: DIMENSION_BONUS_PER_DIM,
      earned: true,
      detail: `You sensed the ${actual.dramaLevel} chaos level.`,
    });
  } else {
    dimensionBreakdown.push({
      label: 'Drama Level',
      points: 0,
      earned: false,
      detail: `Expected ${dims.dramaLevel} chaos, was ${actual.dramaLevel}.`,
    });
  }

  // Dim 4: Resolution type
  if (dims.resolutionType === actual.resolutionType) {
    familyBonusScore += DIMENSION_BONUS_PER_DIM;
    dimensionBreakdown.push({
      label: 'Match Outcome Type',
      points: DIMENSION_BONUS_PER_DIM,
      earned: true,
      detail: `You called the ${actual.resolutionType.replace('_', ' ')} finish.`,
    });
  } else {
    dimensionBreakdown.push({
      label: 'Match Outcome Type',
      points: 0,
      earned: false,
      detail: `Expected ${dims.resolutionType}, was ${actual.resolutionType}.`,
    });
  }

  breakdown.push(...dimensionBreakdown);

  // ─── Side Prediction Score ────────────────────────────────
  let sidePredictionScore = 0;
  const sideBreakdown: ScoreBreakdownItem[] = [];

  for (const sel of prediction.sideSelections) {
    const result = resolution.sideResults.find((r) => r.optionId === sel.optionId);
    if (result) {
      const correct = result.correct === sel.answer;
      if (correct) {
        sidePredictionScore += SIDE_PRED_SCORE;
        sideBreakdown.push({
          label: 'Side Prediction',
          points: SIDE_PRED_SCORE,
          earned: true,
          detail: `Correct: ${sel.answer}`,
        });
      } else {
        sideBreakdown.push({
          label: 'Side Prediction',
          points: 0,
          earned: false,
          detail: `You said ${sel.answer}, was ${result.correct}`,
        });
      }
    }
  }

  breakdown.push(...sideBreakdown);

  // ─── Perfect Bonus ────────────────────────────────────────
  let perfectBonus = 0;
  const allSidesCorrect =
    prediction.sideSelections.length > 0 &&
    prediction.sideSelections.every((sel) => {
      const result = resolution.sideResults.find((r) => r.optionId === sel.optionId);
      return result && result.correct === sel.answer;
    });

  if (isExactMatch && allSidesCorrect) {
    perfectBonus = PERFECT_BONUS;
    breakdown.push({
      label: 'Perfect Script Bonus',
      points: PERFECT_BONUS,
      earned: true,
      detail: 'Every prediction correct. You read the script perfectly.',
    });
  }

  const totalMatchScore =
    primaryScriptScore + familyBonusScore + sidePredictionScore + perfectBonus;

  return {
    playerId: prediction.playerId,
    matchId: prediction.matchId,
    primaryScriptScore,
    familyBonusScore,
    sidePredictionScore,
    perfectBonus,
    totalMatchScore,
    badgesEarned: [], // populated by badge engine
    breakdown,
  };
}

// ─── Determine closeness messaging ───────────────────────────
export function getClosenessMessage(
  score: PlayerScore,
  resolution: MatchResolution
): { headline: string; sub: string; sentiment: 'perfect' | 'great' | 'close' | 'miss' } {
  const isPerfect = score.perfectBonus > 0;
  const isExact = score.primaryScriptScore === EXACT_MATCH_SCORE;
  const isFamily = score.primaryScriptScore === FAMILY_MATCH_SCORE;
  const dimensionsCorrect = score.familyBonusScore / DIMENSION_BONUS_PER_DIM;

  if (isPerfect) {
    return {
      headline: 'You read it perfectly.',
      sub: 'Not many did. The script was yours before football wrote it.',
      sentiment: 'perfect',
    };
  }

  if (isExact) {
    return {
      headline: 'You called the script.',
      sub: `${dimensionsCorrect} out of 4 dimensions nailed. Strong read.`,
      sentiment: 'great',
    };
  }

  if (isFamily && dimensionsCorrect >= 2) {
    return {
      headline: 'That close. One scene away.',
      sub: 'You read the shape of the match. Just missed the final chapter.',
      sentiment: 'close',
    };
  }

  if (isFamily) {
    return {
      headline: 'You got the feel right.',
      sub: 'Wrong script, right narrative family. The instinct was there.',
      sentiment: 'close',
    };
  }

  return {
    headline: 'Football had other ideas.',
    sub: `The actual script: ${resolution.resolvedScriptId}. Next match, you read it again.`,
    sentiment: 'miss',
  };
}

// Per match: 100 (exact) + 40 (4 dims × 10) + 60 (6 sides × 10) + 25 (perfect bonus) = 225
export const MAX_SCORE_PER_MATCH = 225;
// Full Premier League season: 225 × 380 matches = 85,500
export const MAX_TOURNAMENT_SCORE = MAX_SCORE_PER_MATCH * TOTAL_SEASON_MATCHES; // 85,500
