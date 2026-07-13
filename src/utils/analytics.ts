// ─── Analytics Event Wrapper ──────────────────────────────────
// Stub implementation — replace with Plausible/PostHog in V1.1

type EventName =
  | 'app_open'
  | 'onboarding_start'
  | 'onboarding_complete'
  | 'match_view'
  | 'prediction_started'
  | 'script_selected'
  | 'side_pred_selected'
  | 'prediction_submitted'
  | 'result_viewed'
  | 'badge_earned'
  | 'share_initiated'
  | 'share_completed'
  | 'leaderboard_viewed'
  | 'group_created'
  | 'group_joined';

type EventProperties = Record<string, string | number | boolean>;

export function track(event: EventName, properties?: EventProperties): void {
  // In development, log events to console
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${event}`, properties ?? {});
  }

  // V1.1: send to Plausible
  // if (typeof window.plausible === 'function') {
  //   window.plausible(event, { props: properties });
  // }

  // V1.1: send to PostHog
  // if (typeof window.posthog !== 'undefined') {
  //   window.posthog.capture(event, properties);
  // }
}

// ─── Convenience wrappers ─────────────────────────────────────

export const Analytics = {
  appOpen: (isGuest: boolean) =>
    track('app_open', { is_guest: isGuest }),

  onboardingStart: () => track('onboarding_start'),

  onboardingComplete: (nameSet: boolean) =>
    track('onboarding_complete', { name_set: nameSet }),

  matchView: (matchId: string) =>
    track('match_view', { match_id: matchId }),

  predictionStarted: (matchId: string) =>
    track('prediction_started', { match_id: matchId }),

  scriptSelected: (matchId: string, scriptId: string) =>
    track('script_selected', { match_id: matchId, script_id: scriptId }),

  sidePredSelected: (matchId: string, optionId: string, answer: string) =>
    track('side_pred_selected', { match_id: matchId, option_id: optionId, answer }),

  predictionSubmitted: (matchId: string, scriptId: string, sideCount: number) =>
    track('prediction_submitted', {
      match_id: matchId,
      script_id: scriptId,
      side_count: sideCount,
    }),

  resultViewed: (matchId: string, score: number, isPerfect: boolean) =>
    track('result_viewed', { match_id: matchId, score, is_perfect: isPerfect }),

  badgeEarned: (badgeId: string, matchId: string) =>
    track('badge_earned', { badge_id: badgeId, match_id: matchId }),

  shareInitiated: (matchId: string, format: string) =>
    track('share_initiated', { match_id: matchId, format }),

  shareCompleted: (matchId: string, format: string, method: string) =>
    track('share_completed', { match_id: matchId, format, method }),

  leaderboardViewed: (tab: string, matchId?: string) =>
    track('leaderboard_viewed', { tab, ...(matchId ? { match_id: matchId } : {}) }),
};
