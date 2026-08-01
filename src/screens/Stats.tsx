import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { usePlayer } from '@/store/playerStore';
import { useMatches } from '@/store/matchStore';
import { loadPrediction, loadScore, loadAllScores } from '@/utils/storage';
import { getScriptById, ALL_SCRIPTS } from '@/data/scripts';
import { Button } from '@/components/ui';

// ─── Types ───────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, color = 'var(--color-accent)', icon }) => (
  <div
    style={{
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}
  >
    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
      {icon && <span style={{ marginRight: '5px' }}>{icon}</span>}{label}
    </div>
    <div className="font-display" style={{ fontSize: '28px', fontWeight: 900, color, lineHeight: 1 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{sub}</div>}
  </div>
);

// ─── Horizontal bar ──────────────────────────────────────────
const HBar: React.FC<{ label: string; value: number; max: number; color: string; count: number }> = ({
  label, value, max, color, count,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{label}</span>
      <span className="font-display" style={{ fontSize: '12px', fontWeight: 800, color }}>{count}×</span>
    </div>
    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: max > 0 ? `${(value / max) * 100}%` : '0%',
          background: color,
          borderRadius: '99px',
          transition: 'width 0.6s ease',
          boxShadow: `0 0 8px ${color}66`,
        }}
      />
    </div>
  </div>
);

// ─── Section label ───────────────────────────────────────────
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="font-display"
    style={{
      fontSize: '11px',
      fontWeight: 800,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--color-text-muted)',
      marginBottom: '12px',
    }}
  >
    {children}
  </div>
);

// ─── Donut arc (SVG) ─────────────────────────────────────────
const DonutRing: React.FC<{ pct: number; color: string; size?: number; stroke?: number }> = ({
  pct, color, size = 96, stroke = 10,
}) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.7s ease' }}
      />
    </svg>
  );
};

// ─── Main Component ──────────────────────────────────────────
export const Stats: React.FC = () => {
  const { state: playerState } = usePlayer();
  const { state: matchState } = useMatches();
  const navigate = useNavigate();
  const player = playerState.player;

  const stats = useMemo(() => {
    if (!player) return null;

    const allScores = loadAllScores();
    const resolvedMatches = matchState.matches.filter((m) => m.status === 'resolved' && m.resolution);
    const predictedMatches = resolvedMatches.filter((m) => loadPrediction(m.id, player.id));

    // ─── Participation ───────────────────────────────────────
    const totalResolved = resolvedMatches.length;
    const participated = predictedMatches.length;
    const participationRate = totalResolved > 0 ? Math.round((participated / totalResolved) * 100) : 0;

    // ─── Score breakdown ─────────────────────────────────────
    let exactMatches = 0;
    let familyMatches = 0;
    let partialCredits = 0;
    let missedScript = 0;
    let totalSidePredictions = 0;
    let correctSidePredictions = 0;
    let totalPerfectBonuses = 0;
    let highestMatchScore = 0;
    let totalScoredMatches = 0;

    // ─── Script picks frequency map ──────────────────────────
    const scriptPickCounts: Record<string, number> = {};
    const scriptFamilyCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };

    predictedMatches.forEach((m) => {
      const prediction = loadPrediction(m.id, player.id);
      const score = allScores[`${m.id}__${player.id}`];
      if (!prediction || !score) return;

      const s = score.totalMatchScore;
      if (s > highestMatchScore) highestMatchScore = s;
      if (s > 0) totalScoredMatches++;

      // Script classification
      const primary = score.primaryScriptScore;
      if (primary >= 100) exactMatches++;
      else if (primary >= 40) familyMatches++;
      else if (primary >= 15) partialCredits++;
      else missedScript++;

      // Side predictions (count from breakdown)
      score.breakdown.forEach((item) => {
        if (item.label.toLowerCase().includes('side') || item.label.toLowerCase().includes('goalscorer')) {
          totalSidePredictions++;
          if (item.earned) correctSidePredictions++;
        }
      });

      if (score.perfectBonus > 0) totalPerfectBonuses++;

      // Script pick frequency
      const scriptId = prediction.scriptId;
      scriptPickCounts[scriptId] = (scriptPickCounts[scriptId] || 0) + 1;

      // Family frequency
      const script = getScriptById(scriptId);
      if (script) {
        scriptFamilyCounts[script.family] = (scriptFamilyCounts[script.family] || 0) + 1;
      }
    });

    const avgScore = participated > 0 ? Math.round(player.tournamentScore / participated) : 0;
    const sideAccuracy = totalSidePredictions > 0
      ? Math.round((correctSidePredictions / totalSidePredictions) * 100)
      : 0;
    const exactRate = participated > 0 ? Math.round((exactMatches / participated) * 100) : 0;
    const familyRate = participated > 0 ? Math.round((familyMatches / participated) * 100) : 0;

    // ─── Favourite script ────────────────────────────────────
    const favouriteScriptId = Object.entries(scriptPickCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const favouriteScript = favouriteScriptId ? getScriptById(favouriteScriptId) : null;

    // ─── Dominant family ─────────────────────────────────────
    const dominantFamily = Object.entries(scriptFamilyCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const familyMeta: Record<string, { label: string; color: string; icon: string }> = {
      A: { label: 'Control & Dominance', color: '#00F2FE', icon: '🧊' },
      B: { label: 'Drama & Momentum',    color: '#FF5E36', icon: '🔥' },
      C: { label: 'Tactical Shifts',     color: '#D946EF', icon: '⚡' },
      D: { label: 'High Entertainment',  color: '#FF2A55', icon: '🎭' },
    };

    // ─── Prediction style archetype ──────────────────────────
    let archetype = 'The Neutral';
    let archetypeDesc = 'You spread your picks evenly across script families.';
    if (dominantFamily === 'A') { archetype = 'The Tactician'; archetypeDesc = 'You favour controlled, dominant performances — you see the game before it unfolds.'; }
    else if (dominantFamily === 'B') { archetype = 'The Dramatist'; archetypeDesc = 'Late winners, comebacks, collapses — you\'re drawn to the moments that make football unforgettable.'; }
    else if (dominantFamily === 'C') { archetype = 'The Analyst'; archetypeDesc = 'Red cards, smash-and-grabs, single-moment deciders — you read the fine margins of the game.'; }
    else if (dominantFamily === 'D') { archetype = 'The Entertainer'; archetypeDesc = 'High-scoring thrillers and giant-killings — you believe in chaos and expect the unexpected.'; }

    return {
      totalResolved, participated, participationRate,
      exactMatches, familyMatches, partialCredits, missedScript,
      exactRate, familyRate,
      sideAccuracy, totalSidePredictions, correctSidePredictions,
      totalPerfectBonuses, highestMatchScore, avgScore,
      scriptPickCounts, scriptFamilyCounts, familyMeta,
      favouriteScript, dominantFamily,
      archetype, archetypeDesc,
    };
  }, [player, matchState.matches]);

  if (!player) {
    return (
      <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>No profile found.</p>
        <Button variant="primary" size="lg" onClick={() => navigate('/')}>Back to Home</Button>
        <BottomNav />
      </div>
    );
  }

  if (!stats || stats.participated === 0) {
    return (
      <div className="screen">
        <ScreenHeader title="Your Stats" showBack />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', textAlign: 'center', gap: 'var(--space-5)' }}>
          <div style={{ fontSize: '56px' }}>📊</div>
          <h2 className="font-display" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            No stats yet
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6, maxWidth: '280px' }}>
            Your personal analytics will appear here once matches are resolved and you've made predictions.
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>Go Predict →</Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const {
    totalResolved, participated, participationRate,
    exactMatches, familyMatches, partialCredits, missedScript,
    exactRate, sideAccuracy,
    totalPerfectBonuses, highestMatchScore, avgScore,
    scriptPickCounts, scriptFamilyCounts, familyMeta,
    favouriteScript, dominantFamily,
    archetype, archetypeDesc,
  } = stats;

  const maxFamilyCount = Math.max(...Object.values(scriptFamilyCounts));
  const maxScriptCount = Math.max(...Object.values(scriptPickCounts), 1);

  // Sort scripts by pick frequency
  const sortedScripts = ALL_SCRIPTS
    .filter((s) => !s.isKnockoutOnly && (scriptPickCounts[s.id] || 0) > 0)
    .sort((a, b) => (scriptPickCounts[b.id] || 0) - (scriptPickCounts[a.id] || 0));

  return (
    <div className="screen">
      <ScreenHeader title="Your Stats" showBack />
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          width: '100%',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-7)',
          paddingBottom: 'calc(var(--space-7) + 80px)',
        }}
      >
        {/* ── Oracle Identity Card ────────────────────────────── */}
        <div
          style={{
            background: `linear-gradient(135deg, rgba(245,208,97,0.12) 0%, rgba(22,25,41,0.95) 100%)`,
            border: '1.5px solid var(--color-border-accent)',
            borderRadius: 'var(--radius-xl)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 0 32px rgba(245,208,97,0.1)',
          }}
        >
          <div className="font-display" style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
            ORACLE STYLE PROFILE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {dominantFamily && (
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <DonutRing
                  pct={maxFamilyCount > 0 ? (scriptFamilyCounts[dominantFamily] / participated) * 100 : 0}
                  color={familyMeta[dominantFamily]?.color ?? '#F5D061'}
                  size={80}
                  stroke={8}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px',
                }}>
                  {familyMeta[dominantFamily]?.icon}
                </div>
              </div>
            )}
            <div>
              <div className="font-display" style={{ fontSize: '22px', fontWeight: 900, color: '#F5D061', lineHeight: 1.1 }}>
                {archetype}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginTop: '6px' }}>
                {archetypeDesc}
              </div>
            </div>
          </div>
          {favouriteScript && (
            <div
              style={{
                padding: '10px 14px',
                background: `${favouriteScript.familyColor}18`,
                border: `1px solid ${favouriteScript.familyColor}44`,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: favouriteScript.familyColor, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>
                Favourite Script
              </div>
              <div className="font-display" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {favouriteScript.label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Picked {scriptPickCounts[favouriteScript.id]}× across all matches
              </div>
            </div>
          )}
        </div>

        {/* ── Lifetime Summary ────────────────────────────────── */}
        <section>
          <SectionLabel>Lifetime Summary</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <StatCard label="Total Points" value={player.tournamentScore} color="var(--color-accent)" icon="⭐" />
            <StatCard label="Avg per Match" value={`${avgScore}`} sub="points / game" color="#00F2FE" icon="📈" />
            <StatCard label="Best Match" value={highestMatchScore} sub="points" color="#10B981" icon="🏆" />
            <StatCard label="Perfect Rounds" value={totalPerfectBonuses} sub="25pt bonus earned" color="#F59E0B" icon="💎" />
            <StatCard label="Streak" value={`${player.streak}🔥`} sub="high-score matches" color="#FF5E36" />
            <StatCard label="Badges" value={player.badges.length} sub="unlocked" color="#D946EF" icon="🎖️" />
          </div>
        </section>

        {/* ── Participation ───────────────────────────────────── */}
        <section>
          <SectionLabel>Participation</SectionLabel>
          <div
            style={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <DonutRing pct={participationRate} color="#00F2FE" size={80} stroke={8} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="font-display" style={{ fontSize: '16px', fontWeight: 900, color: '#00F2FE', lineHeight: 1 }}>
                  {participationRate}%
                </span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="font-display" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {participated} of {totalResolved} matches
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                You've made predictions in{' '}
                <span style={{ color: '#00F2FE', fontWeight: 700 }}>{participationRate}%</span> of resolved matches.
              </div>
            </div>
          </div>
        </section>

        {/* ── Script Accuracy ─────────────────────────────────── */}
        <section>
          <SectionLabel>Script Accuracy</SectionLabel>
          <div
            style={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <HBar label="🎯 Exact Script" value={exactMatches} max={participated} color="#F5D061" count={exactMatches} />
            <HBar label="🔗 Same Family" value={familyMatches} max={participated} color="#00F2FE" count={familyMatches} />
            <HBar label="⚡ Partial Credit" value={partialCredits} max={participated} color="#D946EF" count={partialCredits} />
            <HBar label="❌ Missed" value={missedScript} max={participated} color="#FF2A55" count={missedScript} />
            <div
              style={{
                marginTop: '4px',
                padding: '10px 14px',
                background: 'rgba(245,208,97,0.07)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(245,208,97,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Exact Script Rate</span>
              <span className="font-display" style={{ fontSize: '18px', fontWeight: 900, color: '#F5D061' }}>{exactRate}%</span>
            </div>
          </div>
        </section>

        {/* ── Side Prediction Accuracy ────────────────────────── */}
        <section>
          <SectionLabel>Side Prediction Accuracy</SectionLabel>
          <div
            style={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <DonutRing pct={sideAccuracy} color="#10B981" size={80} stroke={8} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="font-display" style={{ fontSize: '16px', fontWeight: 900, color: '#10B981', lineHeight: 1 }}>
                  {sideAccuracy}%
                </span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="font-display" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {stats.correctSidePredictions} / {stats.totalSidePredictions} correct
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                Across all bonus side predictions (goal times, clean sheets, red cards, scorers, etc.)
              </div>
            </div>
          </div>
        </section>

        {/* ── Script Family Breakdown ──────────────────────────── */}
        <section>
          <SectionLabel>Script Family Breakdown</SectionLabel>
          <div
            style={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {Object.entries(familyMeta).map(([family, meta]) => (
              <HBar
                key={family}
                label={`${meta.icon} ${meta.label}`}
                value={scriptFamilyCounts[family] || 0}
                max={maxFamilyCount || 1}
                color={meta.color}
                count={scriptFamilyCounts[family] || 0}
              />
            ))}
          </div>
        </section>

        {/* ── Most Picked Scripts ──────────────────────────────── */}
        {sortedScripts.length > 0 && (
          <section>
            <SectionLabel>Most Picked Scripts</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortedScripts.slice(0, 5).map((script) => (
                <div
                  key={script.id}
                  style={{
                    background: `${script.familyColor}0D`,
                    border: `1px solid ${script.familyColor}33`,
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div className="font-display" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                      {script.label}
                    </div>
                    <div style={{ fontSize: '10px', color: script.familyColor, fontWeight: 700, marginTop: '2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Family {script.family} · {script.familyLabel}
                    </div>
                  </div>
                  <div
                    style={{
                      background: `${script.familyColor}22`,
                      border: `1px solid ${script.familyColor}55`,
                      borderRadius: 'var(--radius-full)',
                      padding: '4px 12px',
                      minWidth: '42px',
                      textAlign: 'center',
                    }}
                  >
                    <span className="font-display" style={{ fontSize: '14px', fontWeight: 900, color: script.familyColor }}>
                      {scriptPickCounts[script.id] || 0}×
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Oracle Score Distribution ─────────────────────────── */}
        <section>
          <SectionLabel>Score Distribution</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { label: 'Exact (100+ pts)', count: exactMatches, color: '#F5D061', icon: '🥇' },
              { label: 'Family (40-99 pts)', count: familyMatches, color: '#00F2FE', icon: '🥈' },
              { label: 'Partial (15-39 pts)', count: partialCredits, color: '#D946EF', icon: '🥉' },
              { label: 'Miss (0-14 pts)', count: missedScript, color: '#FF2A55', icon: '❌' },
            ].map(({ label, count, color, icon }) => (
              <div
                key={label}
                style={{
                  background: `${color}0D`,
                  border: `1px solid ${color}33`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{icon}</div>
                <div className="font-display" style={{ fontSize: '24px', fontWeight: 900, color, lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};
