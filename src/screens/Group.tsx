import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { usePlayer } from '@/store/playerStore';
import { useToast } from '@/components/ui/Toast';
import { formatScore, getInitials } from '@/utils/format';
import { track } from '@/utils/analytics';
import { syncUploadMember, syncDownloadMembers } from '@/utils/sync';
import { soundFx } from '@/utils/audio';

interface GroupMember {
  playerId: string;
  name: string;
  score: number;
  streak: number;
  isYou?: boolean;
}

interface UserGroup {
  code: string;
  name: string;
  members: GroupMember[];
}

const DEFAULT_GROUP: UserGroup = {
  code: 'world',
  name: 'World League',
  members: [],
};

const STORAGE_KEY = 'gts_groups';

function loadGroupsFromStorage(): UserGroup[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [DEFAULT_GROUP];
    const parsed = JSON.parse(stored) as UserGroup[];
    // Strip legacy/stale groups
    const cleaned = parsed.filter(
      (g) => g.code !== 'wc-fever' && g.code !== '47PCP1'
    );
    // Always ensure World League is present
    if (!cleaned.some((g) => g.code === 'world')) {
      cleaned.unshift({ ...DEFAULT_GROUP });
    }
    return cleaned;
  } catch {
    return [DEFAULT_GROUP];
  }
}

function saveGroupsToStorage(groups: UserGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch {
    console.warn('Failed to persist groups to localStorage');
  }
}

export const Group: React.FC = () => {
  const { code: routeCode } = useParams<{ code?: string }>();
  const { state: playerState } = usePlayer();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const player = playerState.player;

  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [activeGroupCode, setActiveGroupCode] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Track whether initial join from URL has been processed
  const joinHandledRef = useRef(false);

  // ─── Load groups from localStorage on mount ──────────────────
  useEffect(() => {
    const loaded = loadGroupsFromStorage();
    setGroups(loaded);
    saveGroupsToStorage(loaded);
  }, []);

  // ─── Core: Sync current player to a group and pull members ──
  const performSync = useCallback(async (groupCode: string): Promise<GroupMember[]> => {
    if (!player) return [];

    // Always push the current player into Firestore for this group
    await syncUploadMember(groupCode, player);

    // Pull all members from Firestore
    const latest = await syncDownloadMembers(groupCode);

    // Build deduped map keyed by playerId
    const memberMap = new Map<string, GroupMember>();
    latest.forEach((m) => {
      memberMap.set(m.playerId, {
        playerId: m.playerId,
        name: m.name,
        score: m.score,
        streak: m.streak,
        isYou: m.playerId === player.id,
      });
    });

    // Ensure current player appears even if Firestore hasn't propagated yet
    memberMap.set(player.id, {
      playerId: player.id,
      name: player.name,
      score: player.tournamentScore,
      streak: player.streak,
      isYou: true,
    });

    return Array.from(memberMap.values());
  }, [player]);

  // ─── Refresh a single group's member list ────────────────────
  const refreshGroup = useCallback(async (groupCode: string) => {
    const members = await performSync(groupCode);
    setGroups((prev) => {
      const updated = prev.map((g) =>
        g.code === groupCode ? { ...g, members } : g
      );
      saveGroupsToStorage(updated);
      return updated;
    });
  }, [performSync]);

  // ─── Polling: refresh active group every 10 s ────────────────
  useEffect(() => {
    if (!activeGroupCode || !player) return;
    setIsSyncing(true);
    refreshGroup(activeGroupCode).finally(() => setIsSyncing(false));
    const interval = setInterval(() => refreshGroup(activeGroupCode), 10000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroupCode, player?.id]);

  // ─── Auto-activate group from URL params ─────────────────────
  useEffect(() => {
    if (groups.length === 0 || !player || joinHandledRef.current) return;

    if (routeCode) {
      // Check if already a member
      const existing = groups.find((g) => g.code === routeCode);
      if (existing) {
        setActiveGroupCode(routeCode);
        joinHandledRef.current = true;
      } else {
        // Auto-join if arriving via invite link
        handleJoinByCode(routeCode);
        joinHandledRef.current = true;
      }
    } else {
      setActiveGroupCode(groups[0].code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups.length, routeCode, player?.id]);

  // ─── Create a new private league ─────────────────────────────
  const handleCreateGroup = useCallback(() => {
    soundFx.playStamp();
    const trimmed = newGroupName.trim();
    if (!trimmed || !player) return;

    const code = Math.random().toString(36).slice(2, 8);
    const newGroup: UserGroup = { code, name: trimmed, members: [] };
    const updated = [...groups, newGroup];
    setGroups(updated);
    saveGroupsToStorage(updated);
    setActiveGroupCode(code);
    setNewGroupName('');
    setIsCreating(false);
    showToast({ type: 'success', message: `Private League "${trimmed}" created!` });
    track('group_created', { group_name: trimmed, group_code: code });
    // Upload current player immediately so they appear in this new group
    syncUploadMember(code, player);
  }, [newGroupName, groups, player, showToast]);

  // ─── Join a group by code (invite link or manual) ────────────
  const handleJoinByCode = useCallback(async (code: string) => {
    const trimmed = code.trim().toLowerCase();
    if (!trimmed || !player) return;

    // Already in this group?
    if (groups.some((g) => g.code === trimmed)) {
      setActiveGroupCode(trimmed);
      showToast({ type: 'success', message: 'Already in this league!' });
      return;
    }

    // Upload current player to the Firestore group collection immediately
    await syncUploadMember(trimmed, player);

    // Pull members to get the group name from existing members (if any)
    const members = await syncDownloadMembers(trimmed);

    // Build the group locally
    const memberMap = new Map<string, GroupMember>();
    members.forEach((m) => {
      memberMap.set(m.playerId, {
        playerId: m.playerId,
        name: m.name,
        score: m.score,
        streak: m.streak,
        isYou: m.playerId === player.id,
      });
    });
    // Ensure current user appears
    memberMap.set(player.id, {
      playerId: player.id,
      name: player.name,
      score: player.tournamentScore,
      streak: player.streak,
      isYou: true,
    });

    const resolvedMembers = Array.from(memberMap.values());
    const newGroup: UserGroup = {
      code: trimmed,
      name: `League ${trimmed.toUpperCase()}`,
      members: resolvedMembers,
    };

    const updated = [...groups, newGroup];
    setGroups(updated);
    saveGroupsToStorage(updated);
    setActiveGroupCode(trimmed);
    setJoinCodeInput('');
    setIsJoining(false);
    showToast({ type: 'success', message: `Joined league ${trimmed.toUpperCase()}! 🏆` });
    track('group_joined', { group_code: trimmed });
  }, [groups, player, showToast]);

  const handleInvite = useCallback((group: UserGroup) => {
    soundFx.playClick();
    const origin = window.location.origin;
    const pathname = window.location.pathname.endsWith('/')
      ? window.location.pathname
      : window.location.pathname + '/';
    const inviteUrl = `${origin}${pathname}#/group/${group.code}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      showToast({ type: 'success', message: 'Pass invite link copied to clipboard!' });
      track('share_completed', { match_id: 'all', format: 'link', method: 'copy' });
    }).catch(() => {
      showToast({ type: 'error', message: 'Failed to copy invite link.' });
    });
  }, [showToast]);

  const activeGroup = groups.find((g) => g.code === activeGroupCode);

  // Build final sorted member list (local player always included, deduped by name)
  const sortedMembers: GroupMember[] = (() => {
    if (!activeGroup) return [];
    const memberMap = new Map<string, GroupMember>();
    activeGroup.members.forEach((m) => memberMap.set(m.playerId ?? m.name, m));
    if (player) {
      memberMap.set(player.id, {
        playerId: player.id,
        name: player.name,
        score: player.tournamentScore,
        streak: player.streak,
        isYou: true,
      });
    }
    return Array.from(memberMap.values()).sort((a, b) => b.score - a.score);
  })();

  return (
    <div className="screen">
      <ScreenHeader
        title="Private Leagues"
        rightAction={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { soundFx.playClick(); setIsJoining(true); }}
              className="font-display"
              style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              Join
            </button>
            <button
              onClick={() => { soundFx.playClick(); setIsCreating(true); }}
              className="font-display"
              style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              + New
            </button>
          </div>
        }
      />

      <main style={{ flex: 1, maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', overflowY: 'auto' }}>
        {/* Group selector tabs */}
        {groups.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {groups.map((g) => (
              <button
                key={g.code}
                onClick={() => { soundFx.playClick(); setActiveGroupCode(g.code); }}
                className="font-display"
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: activeGroupCode === g.code ? 'rgba(245, 208, 97, 0.15)' : 'var(--color-surface-card)',
                  border: `1px solid ${activeGroupCode === g.code ? 'var(--color-border-accent)' : 'var(--color-border)'}`,
                  color: activeGroupCode === g.code ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  fontSize: '11px',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}

        {/* Active group details */}
        {activeGroup ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card variant="ticket" padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h2 className="type-h3 font-display" style={{ color: 'var(--color-text-primary)' }}>
                    {activeGroup.name}
                  </h2>
                  <span className="font-display" style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 700 }}>
                    PASS CODE: {activeGroup.code.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {isSyncing && (
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      Syncing…
                    </span>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => handleInvite(activeGroup)}>
                    Invite 🔗
                  </Button>
                </div>
              </div>

              <div className="ticket-perforated-line" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                {sortedMembers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    Invite friends to this league to see them here!
                  </div>
                ) : (
                  sortedMembers.map((member, idx) => (
                    <div
                      key={member.playerId ?? member.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: member.isYou ? 'rgba(245, 208, 97, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${member.isYou ? 'var(--color-border-accent)' : 'transparent'}`,
                      }}
                    >
                      <span className="font-display" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text-muted)', width: '20px' }}>
                        #{idx + 1}
                      </span>
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: member.isYou ? 'linear-gradient(135deg, #F5D061 0%, #C99E2E 100%)' : 'var(--color-surface-elevated)',
                          border: '1px solid var(--color-border)',
                          color: member.isYou ? '#030408' : 'var(--color-text-secondary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 800,
                        }}
                      >
                        {getInitials(member.name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="font-display" style={{ fontSize: '13px', fontWeight: 700, color: member.isYou ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                          {member.name} {member.isYou && '(You)'}
                        </div>
                        {member.streak > 0 && (
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                            Streak: {member.streak}🔥
                          </div>
                        )}
                      </div>
                      <span className="font-display" style={{ fontSize: '15px', fontWeight: 800, color: member.isYou ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                        {formatScore(member.score)} <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>PTS</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Loading leagues…
          </div>
        )}
      </main>

      {/* ── Create Group Modal ─────────────────────────────────── */}
      {isCreating && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(3, 4, 8, 0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 'var(--space-5)',
          }}
        >
          <Card variant="elevated" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', border: '1px solid var(--color-border-accent)' }}>
            <h2 className="type-h3 font-display gold-gradient-text">CREATE PRIVATE LEAGUE</h2>
            <input
              type="text"
              placeholder="League Name (e.g. Tactical Oracles)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && newGroupName.trim()) handleCreateGroup(); }}
              maxLength={32}
              autoFocus
              style={{ height: 50, width: '100%', background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 var(--space-4)', color: 'var(--color-text-primary)', fontSize: '14px' }}
            />
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button variant="ghost" onClick={() => setIsCreating(false)} style={{ flex: 1 }}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateGroup} disabled={!newGroupName.trim()} style={{ flex: 2 }}>Create League</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Join Group Modal ───────────────────────────────────── */}
      {isJoining && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(3, 4, 8, 0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 'var(--space-5)',
          }}
        >
          <Card variant="elevated" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', border: '1px solid var(--color-border-accent)' }}>
            <h2 className="type-h3 font-display gold-gradient-text">JOIN A LEAGUE</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Enter the 6-character league pass code shared by your friend.
            </p>
            <input
              type="text"
              placeholder="Enter pass code (e.g. abc123)"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toLowerCase())}
              onKeyDown={(e) => { if (e.key === 'Enter' && joinCodeInput.trim()) handleJoinByCode(joinCodeInput); }}
              maxLength={10}
              autoFocus
              style={{ height: 50, width: '100%', background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 var(--space-4)', color: 'var(--color-text-primary)', fontSize: '14px', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            />
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button variant="ghost" onClick={() => { setIsJoining(false); setJoinCodeInput(''); }} style={{ flex: 1 }}>Cancel</Button>
              <Button variant="primary" onClick={() => handleJoinByCode(joinCodeInput)} disabled={!joinCodeInput.trim()} style={{ flex: 2 }}>Join League</Button>
            </div>
          </Card>
        </div>
      )}

      <BottomNav />
    </div>
  );
};
