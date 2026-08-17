import type { Match, Player, MatchResolution } from '@/types';
import { db } from '@/services/firebase';
import {
  doc,
  setDoc,
  collection,
  getDocs,
} from 'firebase/firestore';

export interface SyncMember {
  playerId: string;
  name: string;
  score: number;
  streak: number;
  updatedAt: string;
  matchScores?: Record<string, number>;
  badges?: string[];
}

// ─── Group: Upload player score ───────────────────────────────
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
    matchScores: player.matchScores,
    badges: player.badges,
  };

  try {
    const docRef = doc(db, `groups/${groupCode}/members/${player.id}`);
    await setDoc(docRef, member, { merge: true });
  } catch (e) {
    console.warn('[GTS] syncUploadMember failed:', e);
  }
}

// ─── Group: Fetch all members ─────────────────────────────────
export async function syncDownloadMembers(
  groupCode: string
): Promise<SyncMember[]> {
  try {
    const membersRef = collection(db, `groups/${groupCode}/members`);
    const snapshot = await getDocs(membersRef);
    const members: SyncMember[] = [];
    snapshot.forEach((docSnap) => {
      members.push(docSnap.data() as SyncMember);
    });
    return members;
  } catch (e) {
    console.warn('[GTS] syncDownloadMembers failed:', e);
    return [];
  }
}

// ─── Matches: Write resolution to Firestore ───────────────────
// Called by Admin when a match is resolved.
// Stores { status, resolution } under matches/{matchId}.
export async function syncWriteMatchResolution(
  matchId: string,
  resolution: MatchResolution
): Promise<void> {
  try {
    const docRef = doc(db, `matches/${matchId}`);
    await setDoc(docRef, { status: 'resolved', resolution }, { merge: true });
  } catch (e) {
    console.warn('[GTS] syncWriteMatchResolution failed:', e);
  }
}

// ─── Matches: Read all resolutions from Firestore ────────────
// Called on app boot. Returns a map of matchId → { status, resolution }
// for any matches that have been resolved by the admin.
export async function syncReadAllMatchResolutions(): Promise<
  Record<string, Pick<Match, 'status' | 'resolution'>>
> {
  try {
    const matchesRef = collection(db, 'matches');
    const snapshot = await getDocs(matchesRef);
    const result: Record<string, Pick<Match, 'status' | 'resolution'>> = {};
    snapshot.forEach((docSnap) => {
      result[docSnap.id] = docSnap.data() as Pick<Match, 'status' | 'resolution'>;
    });
    return result;
  } catch (e) {
    console.warn('[GTS] syncReadAllMatchResolutions failed:', e);
    return {};
  }
}

// ─── PL Specials: Write resolution to Firestore ───────────────
import type { PLSpecialPrediction, PLSpecialResolution } from '@/data/specials';

export async function syncWritePLSpecialResolution(
  res: PLSpecialResolution
): Promise<void> {
  try {
    const docRef = doc(db, 'specials/pl_season_2026');
    await setDoc(docRef, res, { merge: true });
  } catch (e) {
    console.warn('[GTS] syncWritePLSpecialResolution failed:', e);
  }
}

export async function syncReadPLSpecialResolution(): Promise<PLSpecialResolution | null> {
  try {
    const snap = await getDocs(collection(db, 'specials'));
    let found: PLSpecialResolution | null = null;
    snap.forEach((d) => {
      if (d.id === 'pl_season_2026') {
        found = d.data() as PLSpecialResolution;
      }
    });
    return found;
  } catch (e) {
    console.warn('[GTS] syncReadPLSpecialResolution failed:', e);
    return null;
  }
}

export async function syncUploadPLSpecialPrediction(
  prediction: PLSpecialPrediction
): Promise<void> {
  try {
    const docRef = doc(db, `specials_predictions/${prediction.playerId}`);
    await setDoc(docRef, prediction, { merge: true });
  } catch (e) {
    console.warn('[GTS] syncUploadPLSpecialPrediction failed:', e);
  }
}

// ─── Admin: Reset all members in a group to zero ─────────────
// Iterates every document in groups/{groupCode}/members and
// overwrites score / matchScores / streak / badges to season-zero state.
export async function resetAllGroupMembers(groupCode: string): Promise<void> {
  const membersRef = collection(db, `groups/${groupCode}/members`);
  const snapshot = await getDocs(membersRef);
  const updates = snapshot.docs.map((docSnap) =>
    setDoc(
      docSnap.ref,
      {
        score: 0,
        streak: 0,
        badges: [],
        matchScores: {},
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  );
  await Promise.all(updates);
}
