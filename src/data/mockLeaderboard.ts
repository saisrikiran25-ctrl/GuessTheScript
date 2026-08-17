import type { LeaderboardEntry } from '@/types';

// ─── Mock Leaderboard ─────────────────────────────────────────
// No mock players. Leaderboard is populated exclusively from real Firestore data.
// All users who register and use the app appear here automatically.

export const MOCK_LEADERBOARD: Omit<LeaderboardEntry, 'rank'>[] = [];
