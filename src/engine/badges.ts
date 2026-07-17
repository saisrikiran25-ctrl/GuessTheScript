import type { PlayerScore, PlayerPrediction, Player } from '@/types';

// ─── Badge Award Engine ───────────────────────────────────────
// Returns array of badge IDs earned based on prediction outcome.

export function awardBadges(
  score: PlayerScore,
  prediction: PlayerPrediction,
  player: Player,
  resolvedScriptId: string,
  kickoffTime: string
): string[] {
  const earned: string[] = [];
  const submittedAt = new Date(prediction.submittedAt).getTime();
  const kickoff = new Date(kickoffTime).getTime();
  const hoursBeforeKickoff = (kickoff - submittedAt) / (1000 * 60 * 60);

  // First Script — everyone gets this on first prediction
  if (Object.keys(player.matchScores).length === 0) {
    earned.push('first_script');
  }

  // Called the Chaos — predicted B2 and it resolved
  if (prediction.scriptId === 'B2' && resolvedScriptId === 'B2') {
    earned.push('called_the_chaos');
  }

  // Penalty Prophet — predicted D1 and it resolved
  if (prediction.scriptId === 'D1' && resolvedScriptId === 'D1') {
    earned.push('penalty_prophet');
  }

  // Perfect Half — first-half tempo and scoring timing both correct
  const dimItems = score.breakdown.filter(
    (b) => (b.label === 'First-Half Read' || b.label === 'Scoring Timing') && b.earned
  );
  if (dimItems.length >= 2) {
    earned.push('perfect_half');
  }

  // Perfect Script — exact match on primary script
  if (score.primaryScriptScore === 100) {
    earned.push('perfect_script');
  }

  // Late Drama Caller — predicted C1 and it resolved
  if (prediction.scriptId === 'C1' && resolvedScriptId === 'C1') {
    earned.push('late_drama');
  }

  // Extra Time Prophet — predicted C2 and it resolved
  if (prediction.scriptId === 'C2' && resolvedScriptId === 'C2') {
    earned.push('extra_time_prophet');
  }

  // Comeback Believer — predicted B3 and it resolved
  if (prediction.scriptId === 'B3' && resolvedScriptId === 'B3') {
    earned.push('comeback_believer');
  }

  // Early Riser — submitted 12+ hours before kickoff
  if (hoursBeforeKickoff >= 12) {
    earned.push('early_riser');
  }

  // De-duplicate and filter out already-owned badges
  const alreadyHas = new Set(player.badges);
  return [...new Set(earned)].filter((b) => !alreadyHas.has(b));
}

// ─── Check multi-match badges ─────────────────────────────────
// Called after each match resolution with full player history.

export function awardTournamentBadges(player: Player): string[] {
  const earned: string[] = [];
  const alreadyHas = new Set(player.badges);

  const scores = Object.values(player.matchScores);

  // Hat-Trick of Reads — scored ≥80 in 3 or more played matches (225/match max)
  if (scores.length >= 3 && scores.every((s) => s >= 80)) {
    earned.push('hat_trick');
  }

  // Script Master — perfect script (100+) in ≥2 matches
  // (Tracked via perfect_script badge count in match history — simplified here)
  const perfectScriptCount = player.badges.filter((b) => b === 'perfect_script').length;
  if (perfectScriptCount >= 2) {
    earned.push('script_master');
  }

  // The Oracle — perfect script in all 4
  if (perfectScriptCount >= 3) {
    earned.push('the_oracle');
  }

  return earned.filter((b) => !alreadyHas.has(b));
}
