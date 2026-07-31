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
import { soundFx } from '@/utils/audio';

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

  useEffect(() => {
    const stored = localStorage.getItem('gts_groups');
    const defaultGroup: UserGroup = {
      code: 'world',
      name: 'World League',
      members: [],
    };

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UserGroup[];
        let cleaned = parsed.filter(g => g.code !== 'wc-fever' && g.code !== '47PCP1');
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
      setGroups([defaultGroup]);
      localStorage.setItem('gts_groups', JSON.stringify([defaultGroup]));
    }
  }, []);

  const performSync = useCallback(async (groupCode: string) => {
    if (!player) return;
    await syncUploadMember(groupCode, player);
    const latest = await syncDownloadMembers(groupCode);
    if (latest.length > 0) {
      setGroups((prevGroups) => {
        const updated = prevGroups.map((g) => {
          if (g.code === groupCode) {
            const otherMembers = latest
              .filter((m) => m.playerId !== player.id)
              .map((m) => ({
                name: m.name,
                score: m.score,
                streak: m.streak,
              }));
            return { ...g, members: otherMembers };
          }
          return g;
        });
        localStorage.setItem('gts_groups', JSON.stringify(updated));
        return updated;
      });
    }
  }, [player]);

  useEffect(() => {
    if (activeGroupCode) {
      performSync(activeGroupCode);
      const interval = setInterval(() => performSync(activeGroupCode), 10000);
      return () => clearInterval(interval);
    }
  }, [activeGroupCode, performSync]);

  useEffect(() => {
    if (groups.length > 0) {
      if (routeCode && groups.some((g) => g.code === routeCode)) {
        setActiveGroupCode(routeCode);
      } else if (!activeGroupCode) {
        setActiveGroupCode(groups[0].code);
      }
    }
  }, [groups, routeCode, activeGroupCode]);

  const handleCreateGroup = useCallback(() => {
    soundFx.playStamp();
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
    showToast({ type: 'success', message: `Private League "${trimmed}" created!` });
    track('group_created', { group_name: trimmed, group_code: code });
  }, [newGroupName, groups, showToast]);

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

  const sortedMembers = (() => {
    if (!activeGroup) return [];
    const members = [...activeGroup.members];
    if (player) {
      if (!members.some((m) => m.isYou)) {
        members.push({
          name: player.name,
          score: player.tournamentScore,
          streak: player.streak,
          isYou: true,
        });
      } else {
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
        title="Private Leagues"
        rightAction={
          <button
            onClick={() => { soundFx.playClick(); setIsCreating(true); }}
            className="font-display"
            style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            + New League
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

        {/* Group details */}
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
                <Button variant="secondary" size="sm" onClick={() => handleInvite(activeGroup)}>
                  Invite Friends 🔗
                </Button>
              </div>

              <div className="ticket-perforated-line" />

              {/* Members listing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                {sortedMembers.map((member, idx) => (
                  <div
                    key={member.name}
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
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: member.isYou ? 'linear-gradient(135deg, #F5D061 0%, #C99E2E 100%)' : 'var(--color-surface-elevated)',
                        border: '1px solid var(--color-border)',
                        color: member.isYou ? '#030408' : 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800,
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
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {/* Modal for Group Creation */}
        {isCreating && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(3, 4, 8, 0.85)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 'var(--space-5)',
            }}
          >
            <Card
              variant="elevated"
              style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', border: '1px solid var(--color-border-accent)' }}
            >
              <h2 className="type-h3 font-display gold-gradient-text">
                CREATE PRIVATE LEAGUE
              </h2>
              <input
                type="text"
                placeholder="League Name (e.g. Tactical Oracles)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                maxLength={32}
                autoFocus
                style={{
                  height: 50,
                  width: '100%',
                  background: 'var(--color-bg)',
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
                  Create League
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
