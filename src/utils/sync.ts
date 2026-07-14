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
  };

  try {
    const docRef = doc(db, `groups/${groupCode}/members/${player.id}`);
    await setDoc(docRef, member, { merge: true });
  } catch (e) {
    console.warn('Network sync failed (offline fallback active):', e);
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
    snapshot.forEach((doc) => {
      members.push(doc.data() as SyncMember);
    });
    return members;
  } catch (e) {
    console.warn('Network sync load failed (offline fallback active):', e);
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
    console.warn('Failed to write match resolution to Firestore:', e);
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
    console.warn('Failed to read match resolutions from Firestore:', e);
    return {};
  }
}

