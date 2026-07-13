import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useMatches } from '@/store/matchStore';
import { resolveMatch } from '@/engine/resolution';
import type { AdminMatchInput, Match } from '@/types';

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY ?? 'gts_admin_2026';

export const Admin: React.FC = () => {
  const { state: matchState, updateMatch } = useMatches();
  const navigate = useNavigate();
  const [keyInput, setKeyInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('sf1');
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
  });
  const [goalTimesInput, setGoalTimesInput] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const selectedMatch = matchState.matches.find((m) => m.id === selectedMatchId);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput === ADMIN_KEY) {
      setIsAuthenticated(true);
    } else {
      setError('Invalid admin key.');
    }
  };

  const handleResolve = () => {
    if (!selectedMatch) return;

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
      setSuccess(`✓ Match resolved as: "${resolution.resolvedScriptId}"`);
      setError('');
    } catch (err) {
      setError(`Error: ${err}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--color-bg)' }}>
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h1 style={{ color: 'var(--color-text-primary)', fontSize: '24px', fontWeight: 800 }}>Admin</h1>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Admin key"
              style={{
                height: 48,
                background: 'var(--color-surface-2)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0 16px',
                color: 'var(--color-text-primary)',
                fontSize: '15px',
                fontFamily: 'var(--font-family)',
              }}
            />
            {error && <p style={{ color: 'var(--color-error)', fontSize: '13px' }}>{error}</p>}
            <Button type="submit" variant="primary" size="lg">Enter</Button>
          </form>
          <button onClick={() => navigate('/')} style={{ color: 'var(--color-text-muted)', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Back to app
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', padding: '24px', color: 'var(--color-text-primary)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800 }}>Match Admin</h1>
          <button onClick={() => navigate('/')} style={{ color: 'var(--color-accent)', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← App
          </button>
        </div>

        {/* Match selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {matchState.matches.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMatchId(m.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${selectedMatchId === m.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: selectedMatchId === m.id ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                color: selectedMatchId === m.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {m.label} <span style={{ fontSize: '10px' }}>({m.status})</span>
            </button>
          ))}
        </div>

        {selectedMatch && (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>
              {selectedMatch.teamA.name} vs {selectedMatch.teamB.name}
            </h2>

            {selectedMatch.status === 'resolved' && (
              <div style={{ padding: '12px', background: 'var(--color-success-bg)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--color-success)' }}>
                ✓ Already resolved as: {selectedMatch.resolution?.resolvedScriptId}
              </div>
            )}

            <AdminField label="Goal Times (comma-separated, e.g. 67,78,89)">
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
                              const updated = form.sideResults.filter((r) => r.optionId !== opt.id);
                              setForm({ ...form, sideResults: [...updated, { optionId: opt.id, correct: c.value }] });
                            }}
                            style={{
                              padding: '4px 12px',
                              borderRadius: 'var(--radius-sm)',
                              border: `1px solid ${current === c.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                              background: current === c.value ? 'var(--color-accent-subtle)' : 'var(--color-surface-2)',
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

            {success && <div style={{ padding: '12px', background: 'var(--color-success-bg)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--color-success)' }}>{success}</div>}
            {error && <div style={{ padding: '12px', background: 'var(--color-error-bg)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--color-error)' }}>{error}</div>}

            <Button variant="primary" size="lg" fullWidth onClick={handleResolve}>
              🔓 Resolve Match
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
  background: 'var(--color-surface-2)',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: '0 14px',
  color: '#F5F5F0',
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
