import type { Player } from '@/types';

// ─── Free Public Relational Sync Bucket ───────────────────────
// We use a public bucket ID to sync score state in real-time across players.
// No setup required by the user, works instantly on public hostings.
const BUCKET_ID = 'gts_wc2026_group_relay';
const BASE_URL = `https://kvdb.io/${BUCKET_ID}`;

export interface SyncMember {
  playerId: string;
  name: string;
  score: number;
  streak: number;
  updatedAt: string;
}

// Upload player score for a specific group
export async function syncUploadMember(
  groupCode: string,
  player: Player
): Promise<void> {
  const member: SyncMember = {
    playerId: player.id,
    name: player.name,
    score: player.tournamentScore,
    streak: player.streak,
    updatedAt: new Date().toISOString(),
  };

  try {
    // Write key: <groupCode>_<playerId>
    await fetch(`${BASE_URL}/${groupCode}_${player.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(member),
    });
  } catch (e) {
    console.warn('Network sync failed (offline fallback active):', e);
  }
}

// Fetch all members in a group
export async function syncDownloadMembers(
  groupCode: string
): Promise<SyncMember[]> {
  try {
    const res = await fetch(`${BASE_URL}/?prefix=${groupCode}&values=true`);
    if (!res.ok) return [];
    
    // kvdb.io returns an array of [key, value] pairs
    const data: [string, string][] = await res.json();
    return data
      .map(([, val]) => {
        try {
          return JSON.parse(val) as SyncMember;
        } catch {
          return null;
        }
      })
      .filter((m): m is SyncMember => m !== null);
  } catch (e) {
    console.warn('Network sync load failed (offline fallback active):', e);
    return [];
  }
}
