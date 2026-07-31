import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useMatches } from '@/store/matchStore';
import { resolveMatch } from '@/engine/resolution';
import { syncWriteMatchResolution, resetAllGroupMembers } from '@/utils/sync';
import { soundFx } from '@/utils/audio';
import type { AdminMatchInput, Match } from '@/types';

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY ?? 'gts_admin_2026';

export const Admin: React.FC = () => {
  const { state: matchState, updateMatch } = useMatches();
  const navigate = useNavigate();
  const [keyInput, setKeyInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('gw1_m1');
  const [form, setForm] = useState<AdminMatchInput>({
    goalTimes: [],
    cards: 0,
    redCards: 0,
    teamAGoals: 0,
    teamBGoals: 0,
    extraTime: false,
    penalties: false,
    narrativeSummary: '',
    sideResults: [],
    resolvedScriptId: '',
  });
  const [goalTimesInput, setGoalTimesInput] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');

  const selectedMatch = matchState.matches.find((m) => m.id === selectedMatchId);

  useEffect(() => {
    if (selectedMatch) {
      if (selectedMatch.status === 'resolved' && selectedMatch.resolution) {
        const res = selectedMatch.resolution;
        setForm({
          goalTimes: res.details.goalTimes,
          cards: res.details.cards,
          redCards: res.details.redCards,
          teamAGoals: res.details.teamAGoals,
          teamBGoals: res.details.teamBGoals,
          extraTime: res.details.resolutionType === 'extra_time' || res.details.resolutionType === 'penalties',
          penalties: res.details.resolutionType === 'penalties',
          narrativeSummary: res.narrativeSummary,
          sideResults: res.sideResults,
          resolvedScriptId: res.resolvedScriptId,
        });
        setGoalTimesInput(res.details.goalTimes.join(', '));
      } else {
        setForm({
          goalTimes: [],
          cards: 0,
          redCards: 0,
          teamAGoals: 0,
          teamBGoals: 0,
          extraTime: false,
          penalties: false,
          narrativeSummary: '',
          sideResults: [],
          resolvedScriptId: '',
        });
        setGoalTimesInput('');
      }
      setSuccess('');
      setError('');
    }
  }, [selectedMatchId]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    if (keyInput === ADMIN_KEY) {
      setIsAuthenticated(true);
    } else {
      setError('Invalid admin key.');
    }
  };

  const handleResolve = async () => {
    if (!selectedMatch) return;

    if (!form.resolvedScriptId) {
      setError('Please select the correct script verdict.');
      return;
    }

    soundFx.playStamp();

    try {
      const goalTimes = goalTimesInput
        .split(',')
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));

      const input: AdminMatchInput = {
        ...form,
        goalTimes,
        sideResults: selectedMatch.sideOptions.map((opt) => ({
          optionId: opt.id,
          correct: form.sideResults.find((r) => r.optionId === opt.id)?.correct ?? opt.choices[0].value,
        })),
      };

      const resolution = resolveMatch(selectedMatch.id, input);

      const updatedMatch: Match = {
        ...selectedMatch,
        status: 'resolved',
        resolution,
      };

      updateMatch(updatedMatch);
      await syncWriteMatchResolution(selectedMatch.id, resolution);
      setSuccess(`✓ Match resolved as: "${resolution.resolvedScriptId}" — synced to all devices.`);
      setError('');
    } catch (err) {
      setError(`Error: ${err}`);
    }
  };

  const handleSeasonReset = async () => {
    if (!window.confirm('DANGER: This will zero out ALL users\' scores across every group in Firestore. This cannot be undone. Proceed?')) return;
    setResetStatus('running');
    try {
      // Reset the global World leaderboard + all private group codes stored in Firestore
      // We reset 'world' first; private groups share the same member docs so this covers everyone.
      await resetAllGroupMembers('world');
      setResetStatus('done');
    } catch (err) {
      console.error(err);
      setResetStatus('error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--color-bg)' }}>
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h1 className="font-display gold-gradient-text" style={{ fontSize: '28px', fontWeight: 800 }}>ORACLE ADMIN</h1>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Admin key"
              style={{
                height: 48,
                background: 'var(--color-surface-elevated)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0 16px',
                color: 'var(--color-text-primary)',
                fontSize: '15px',
                fontFamily: 'var(--font-sans)',
              }}
            />
            {error && <p style={{ color: 'var(--color-error)', fontSize: '13px' }}>{error}</p>}
            <Button type="submit" variant="primary" size="lg">Enter Vault</Button>
          </form>
          <button onClick={() => navigate('/')} style={{ color: 'var(--color-text-muted)', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Back to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', padding: '24px', color: 'var(--color-text-primary)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="font-display gold-gradient-text" style={{ fontSize: '22px', fontWeight: 800 }}>ORACLE RESOLUTION VAULT</h1>
          <button onClick={() => navigate('/')} className="font-display" style={{ color: 'var(--color-accent)', fontSize: '12px', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>
            ← APP
          </button>
        </div>

        {/* Match selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {matchState.matches.map((m) => (
            <button
              key={m.id}
              onClick={() => { soundFx.playClick(); setSelectedMatchId(m.id); }}
              className="font-display"
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${selectedMatchId === m.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: selectedMatchId === m.id ? 'rgba(245, 208, 97, 0.15)' : 'var(--color-surface-card)',
                color: selectedMatchId === m.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {m.label} <span style={{ fontSize: '9px' }}>({m.status})</span>
            </button>
          ))}
        </div>

        {/* Season Reset */}
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 className="font-display" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-error)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ⚠️ Season Reset — Wipe All Users
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Zeros out every player’s score, streak, badges and match history in Firestore.
            Use at the start of a new season. Cannot be undone.
          </p>
          {resetStatus === 'done' && (
            <div style={{ padding: '10px 14px', background: 'var(--color-success-bg)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--color-success)' }}>
              ✓ All Firestore member scores reset to 0.
            </div>
          )}
          {resetStatus === 'error' && (
            <div style={{ padding: '10px 14px', background: 'var(--color-error-bg)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--color-error)' }}>
              ✗ Reset failed — check console.
            </div>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={handleSeasonReset}
            disabled={resetStatus === 'running'}
          >
            {resetStatus === 'running' ? '⏳ Resetting…' : '🔄 Reset All Player Data'}
          </Button>
        </div>

        {selectedMatch && (
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 800 }}>
              {selectedMatch.teamA.name} vs {selectedMatch.teamB.name}
            </h2>

            {selectedMatch.status === 'resolved' && (
              <div style={{ padding: '12px', background: 'var(--color-success-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--color-success)' }}>
                ✓ Already resolved as: {selectedMatch.resolution?.resolvedScriptId}
              </div>
            )}

            <AdminField label="Correct Script Verdict">
              <select
                value={form.resolvedScriptId}
                onChange={(e) => setForm({ ...form, resolvedScriptId: e.target.value })}
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text-primary)',
                  paddingRight: '40px',
                }}
              >
                <option value="">-- Select Correct Script --</option>
                {selectedMatch.scripts.map((script) => (
                  <option key={script.id} value={script.id} style={{ background: '#030408', color: '#FFF' }}>
                    [{script.id}] {script.label} ({script.familyLabel})
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField label="Goal Times (comma-separated, e.g. 67, 78, 89)">
              <input
                type="text"
                value={goalTimesInput}
                onChange={(e) => setGoalTimesInput(e.target.value)}
                placeholder="67, 78, 89"
                style={inputStyle}
              />
            </AdminField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <AdminField label={`${selectedMatch.teamA.shortCode} Goals`}>
                <input type="number" value={form.teamAGoals} onChange={(e) => setForm({ ...form, teamAGoals: +e.target.value })} min={0} style={inputStyle} />
              </AdminField>
              <AdminField label={`${selectedMatch.teamB.shortCode} Goals`}>
                <input type="number" value={form.teamBGoals} onChange={(e) => setForm({ ...form, teamBGoals: +e.target.value })} min={0} style={inputStyle} />
              </AdminField>
              <AdminField label="Yellow Cards">
                <input type="number" value={form.cards} onChange={(e) => setForm({ ...form, cards: +e.target.value })} min={0} style={inputStyle} />
              </AdminField>
              <AdminField label="Red Cards">
                <input type="number" value={form.redCards} onChange={(e) => setForm({ ...form, redCards: +e.target.value })} min={0} style={inputStyle} />
              </AdminField>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.extraTime} onChange={(e) => setForm({ ...form, extraTime: e.target.checked })} />
                Extra Time
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.penalties} onChange={(e) => setForm({ ...form, penalties: e.target.checked })} />
                Penalties
              </label>
            </div>

            <AdminField label="Narrative Summary">
              <textarea
                value={form.narrativeSummary}
                onChange={(e) => setForm({ ...form, narrativeSummary: e.target.value })}
                rows={3}
                placeholder="Describe what happened in the match..."
                style={{ ...inputStyle, height: 'auto', padding: '12px 16px', resize: 'vertical' as const }}
              />
            </AdminField>

            {/* Side results */}
            {selectedMatch.sideOptions.length > 0 && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
                  Side Prediction Results
                </label>
                {selectedMatch.sideOptions.map((opt) => {
                  const current = form.sideResults.find((r) => r.optionId === opt.id)?.correct ?? '';
                  return (
                    <div key={opt.id} style={{ marginBottom: '8px' }}>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{opt.question}</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {opt.choices.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => {
                              soundFx.playClick();
                              const updated = form.sideResults.filter((r) => r.optionId !== opt.id);
                              setForm({ ...form, sideResults: [...updated, { optionId: opt.id, correct: c.value }] });
                            }}
                            style={{
                              padding: '4px 12px',
                              borderRadius: 'var(--radius-sm)',
                              border: `1px solid ${current === c.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                              background: current === c.value ? 'var(--color-accent-subtle)' : 'var(--color-surface-card)',
                              color: current === c.value ? 'var(--color-accent)' : 'var(--color-text-muted)',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {success && <div style={{ padding: '12px', background: 'var(--color-success-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--color-success)' }}>{success}</div>}
            {error && <div style={{ padding: '12px', background: 'var(--color-error-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--color-error)' }}>{error}</div>}

            <Button variant="primary" size="lg" fullWidth onClick={handleResolve}>
              🔓 Resolve Match Narrative
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  background: 'var(--color-bg)',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '0 14px',
  color: 'var(--color-text-primary)',
  fontSize: '14px',
  fontFamily: 'inherit',
};

const AdminField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
      {label}
    </label>
    {children}
  </div>
);
