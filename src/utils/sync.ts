import type { Player } from '@/types';
import { db } from '@/services/firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

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
    const docRef = doc(db, `groups/${groupCode}/members/${player.id}`);
    await setDoc(docRef, member, { merge: true });
  } catch (e) {
    console.warn('Network sync failed (offline fallback active):', e);
  }
}

// Fetch all members in a group
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
