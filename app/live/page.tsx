'use client';

import React, { useMemo } from 'react';
import { useMatchStore, Team } from '../../store/useMatchStore';

// ---- Win probability helper (independent points, win-by-2, targets 25 or 15) ----
function winProb(a: number, b: number, target: number, memo = new Map<string, number>()): number {
  // a = my points, b = opp points, target = 25 or 15
  const key = `${a}|${b}|${target}`;
  if (memo.has(key)) return memo.get(key)!;

  // win conditions (win by 2)
  if (a >= target && a - b >= 2) return 1;
  if (b >= target && b - a >= 2) return 0;

  // simple 50/50 rally model (we’ll refine later)
  const p = 0.5;
  const val = p * winProb(a + 1, b, target, memo) + (1 - p) * winProb(a, b + 1, target, memo);
  memo.set(key, val);
  return val;
}

export default function LivePage() {
  const s = useMatchStore();

  const addMy = () => s.commitRally('my' as Team);
  const addOpp = () => s.commitRally('opp' as Team);
  const reset = () => s.resetSet();

  // chance-of-winning readout (basic 50/50 rally model)
  const chance = useMemo(() => {
    const target = s.target ?? 25;
    const now = winProb(s.scoreMy, s.scoreOpp, target);
    const ifWin = winProb(s.scoreMy + 1, s.scoreOpp, target);
    const ifLose = winProb(s.scoreMy, s.scoreOpp + 1, target);
    return { now, dIfWin: ifWin - now, dIfLose: ifLose - now };
  }, [s.scoreMy, s.scoreOpp, s.target]);

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: '0 auto', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' }}>
      <h1 style={{ marginBottom: 12 }}>Live</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 1fr',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        border: '1px solid #e5e7eb',
        borderRadius: 12
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Us</div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{s.scoreMy}</div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 18 }}>—</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Them</div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{s.scoreOpp}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button
          onClick={addMy}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #10b981',
            background: '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer'
          }}>
          +1 Us
        </button>
        <button
          onClick={addOpp}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #ef4444',
            background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer'
          }}>
          +1 Them
        </button>
        <button
          onClick={reset}
          style={{
            padding: '12px 16px', borderRadius: 10, border: '1px solid #374151',
            background: 'white', color: '#111827', fontWeight: 600, cursor: 'pointer', minWidth: 120
          }}>
          Reset Set
        </button>
      </div>

      <div style={{ marginTop: 20, padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Chances (simple model)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Stat label="Win now" value={`${(chance.now * 100).toFixed(1)}%`} />
          <Stat label="Δ if we win next" value={`${(chance.dIfWin * 100).toFixed(1)}%`} />
          <Stat label="Δ if we lose next" value={`${(chance.dIfLose * 100).toFixed(1)}%`} />
        </div>
      </div>

      <div style={{ marginTop: 20, fontSize: 14, opacity: 0.7 }}>
        Target: {s.target} • Rotations — Us: {s.rotMy} • Them: {s.rotOpp} • Real points (serve only): {s.realMy}–{s.realOpp}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 10 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
