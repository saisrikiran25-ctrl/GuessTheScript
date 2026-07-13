import type { LeaderboardEntry } from '@/types';

// ─── Mock Leaderboard ─────────────────────────────────────────
// Clean production state: no mock players.
// Leaderboard is populated dynamically in real-time as users submit and resolve predictions.

export const MOCK_LEADERBOARD: Omit<LeaderboardEntry, 'rank'>[] = [];
