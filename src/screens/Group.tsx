import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { usePlayer } from '@/store/playerStore';
import { useToast } from '@/components/ui/Toast';
import { formatScore, getInitials } from '@/utils/format';
import { track } from '@/utils/analytics';
import { syncUploadMember, syncDownloadMembers } from '@/utils/sync';

interface GroupMember {
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

export const Group: React.FC = () => {
  const { code: routeCode } = useParams<{ code?: string }>();
  const { state: playerState } = usePlayer();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const player = playerState.player;

  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [activeGroupCode, setActiveGroupCode] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load groups from localStorage on mount & clean old cached mock users/groups
  useEffect(() => {
    const stored = localStorage.getItem('gts_groups');
    const defaultGroup: UserGroup = {
      code: 'world',
      name: 'World',
      members: [],
    };

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UserGroup[];
        // Filter out old test group codes: 'wc-fever' (WhatsApp Fanatics) and '47PCP1' (hh)
        let cleaned = parsed.filter(g => g.code !== 'wc-fever' && g.code !== '47PCP1');
        
        // Ensure the global 'world' group is present
        if (!cleaned.some(g => g.code === 'world')) {
          cleaned.unshift(defaultGroup);
        }
        
        setGroups(cleaned);
        localStorage.setItem('gts_groups', JSON.stringify(cleaned));
      } catch {
        setGroups([defaultGroup]);
        localStorage.setItem('gts_groups', JSON.stringify([defaultGroup]));
      }
    } else {
      // Seed default "World" group
      setGroups([defaultGroup]);
      localStorage.setItem('gts_groups', JSON.stringify([defaultGroup]));
    }
  }, []);

  const performSync = useCallback(async (groupCode: string) => {
    if (!player) return;
    
    // Only upload if the player has a real score — never overwrite Firestore
    // with score=0 (which happens when a user visits Group before seeing Results).
    if (player.tournamentScore > 0) {
      await syncUploadMember(groupCode, player);
    }
    
    // Download group members list
    const latest = await syncDownloadMembers(groupCode);
    
    if (latest.length > 0) {
      setGroups((prevGroups) => {
        const updated = prevGroups.map((g) => {
          if (g.code === groupCode) {
            // Keep only other players from KV (we append player dynamically in UI)
            const otherMembers = latest
              .filter((m) => m.playerId !== player.id)
              .map((m) => ({
                name: m.name,
                score: m.score,
                streak: m.streak,
              }));
            
            return {
              ...g,
              members: otherMembers,
            };
          }
          return g;
        });
        localStorage.setItem('gts_groups', JSON.stringify(updated));
        return updated;
      });
    }
  }, [player]);

  // Run sync on active group change or when matches resolve
  useEffect(() => {
    if (activeGroupCode) {
      performSync(activeGroupCode);
      
      // Pull scores from KV every 10 seconds to keep groups updated
      const interval = setInterval(() => {
        performSync(activeGroupCode);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [activeGroupCode, performSync]);

  // Update active group from route or list
  useEffect(() => {
    if (groups.length > 0) {
      if (routeCode && groups.some((g) => g.code === routeCode)) {
        setActiveGroupCode(routeCode);
      } else if (!activeGroupCode) {
        setActiveGroupCode(groups[0].code);
      }
    }
  }, [groups, routeCode, activeGroupCode]);

  // Handle auto-joining when landing on a group code route
  useEffect(() => {
    if (routeCode && groups.length > 0 && !groups.some((g) => g.code === routeCode)) {
      // Create new group automatically for the code
      const joined: UserGroup = {
        code: routeCode,
        name: `Invited Group (${routeCode.toUpperCase()})`,
        members: [],
      };
      const updated = [...groups, joined];
      setGroups(updated);
      localStorage.setItem('gts_groups', JSON.stringify(updated));
      setActiveGroupCode(routeCode);
      showToast({ type: 'success', message: 'Joined new friend group!' });
    }
  }, [routeCode, groups, showToast]);

  const handleCreateGroup = useCallback(() => {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;

    const code = Math.random().toString(36).slice(2, 8);
    const newGroup: UserGroup = {
      code,
      name: trimmed,
      members: [],
    };

    const updated = [...groups, newGroup];
    setGroups(updated);
    localStorage.setItem('gts_groups', JSON.stringify(updated));
    setActiveGroupCode(code);
    setNewGroupName('');
    setIsCreating(false);
    showToast({ type: 'success', message: `Group "${trimmed}" created!` });
    track('group_created', { group_name: trimmed, group_code: code });
  }, [newGroupName, groups, showToast]);

  const handleInvite = useCallback((group: UserGroup) => {
    const origin = window.location.origin;
    const pathname = window.location.pathname.endsWith('/') 
      ? window.location.pathname 
      : window.location.pathname + '/';
    const inviteUrl = `${origin}${pathname}#/group/${group.code}`;
    
    navigator.clipboard.writeText(inviteUrl).then(() => {
      showToast({ type: 'success', message: 'Invite link copied to clipboard!' });
      track('share_completed', { match_id: 'all', format: 'link', method: 'copy' });
    }).catch(() => {
      showToast({ type: 'error', message: 'Failed to copy link.' });
    });
  }, [showToast]);

  const activeGroup = groups.find((g) => g.code === activeGroupCode);

  // Combine members with current player
  const sortedMembers = (() => {
    if (!activeGroup) return [];
    const members = [...activeGroup.members];
    if (player) {
      // Check if player already in group
      if (!members.some((m) => m.isYou)) {
        members.push({
          name: player.name,
          score: player.tournamentScore,
          streak: player.streak,
          isYou: true,
        });
      } else {
        // Update score/streak for player
        const idx = members.findIndex((m) => m.isYou);
        members[idx].score = player.tournamentScore;
        members[idx].streak = player.streak;
      }
    }
    return members.sort((a, b) => b.score - a.score);
  })();

  return (
    <div className="screen">
      <ScreenHeader
        title="Friend Groups"
        rightAction={
          <button
            onClick={() => setIsCreating(true)}
            style={{ fontSize: '13px', color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            + Create
          </button>
        }
      />

      <main style={{ flex: 1, maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Selector */}
        {groups.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {groups.map((g) => (
              <button
                key={g.code}
                onClick={() => setActiveGroupCode(g.code)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: activeGroupCode === g.code ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                  border: `1.5px solid ${activeGroupCode === g.code ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: activeGroupCode === g.code ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}

        {/* Group details */}
        {activeGroup ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card variant="default" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h2 className="type-h3" style={{ color: 'var(--color-text-primary)' }}>
                    {activeGroup.name}
                  </h2>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Code: {activeGroup.code.toUpperCase()}
                  </span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => handleInvite(activeGroup)}>
                  Invite Friend
                </Button>
              </div>

              {/* Members listing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {sortedMembers.map((member, idx) => (
                  <div
                    key={member.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-2) 0',
                      borderBottom: idx < sortedMembers.length - 1 ? '1px solid var(--color-border-dim)' : 'none',
                    }}
                  >
                    {/* Rank */}
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', width: '20px' }}>
                      {idx + 1}
                    </span>
                    {/* Avatar */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: member.isYou ? 'var(--color-accent)' : 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: member.isYou ? '#0A0A0F' : 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800,
                      }}
                    >
                      {getInitials(member.name)}
                    </div>
                    {/* Name */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: member.isYou ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                        {member.name} {member.isYou && '(You)'}
                      </div>
                      {member.streak > 0 && (
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Streak: {member.streak}🔥
                        </div>
                      )}
                    </div>
                    {/* Score */}
                    <span style={{ fontSize: '16px', fontWeight: 800, color: member.isYou ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                      {formatScore(member.score)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Invite link copies a unique URL that lets your friends join this group instantly.
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-10) 0' }}>
            <span style={{ fontSize: '48px' }}>👥</span>
            <h3 className="type-h3" style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>No groups joined</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
              Create a group to compete with your friends side-by-side.
            </p>
            <Button variant="primary" onClick={() => setIsCreating(true)}>Create Group</Button>
          </div>
        )}

        {/* Modal for Group Creation */}
        {isCreating && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 'var(--space-5)',
            }}
          >
            <Card
              variant="elevated"
              style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <h2 className="type-h3" style={{ color: 'var(--color-text-primary)' }}>
                New Friend Group
              </h2>
              <input
                type="text"
                placeholder="Group Name (e.g. Dream Team)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                maxLength={32}
                autoFocus
                style={{
                  height: 48,
                  width: '100%',
                  background: 'var(--color-surface-2)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0 var(--space-4)',
                  color: 'var(--color-text-primary)',
                  fontSize: '14px',
                }}
              />
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Button variant="ghost" onClick={() => setIsCreating(false)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleCreateGroup} disabled={!newGroupName.trim()} style={{ flex: 2 }}>
                  Create Group
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};
