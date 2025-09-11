'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useMatchStore, type Team } from '@/store/useMatchStore';

// IMPORTANT: do NOT export `revalidate` here.
// If you had one, remove it. If you must force dynamic, use:
export const dynamic = 'force-dynamic';

export default function LivePage() {
  const s = useMatchStore();

  const chance = useMemo(() => {
    // simple win-prob model using current score and target
    const target = s.target || 25;
    const a = s.scoreMy;
    const b = s.scoreOpp;
    const memo = new Map<string, number>();

    function key(x: number, y: number) {
      return `${x}-${y}`;
    }
    function winProb(x: number, y: number): number {
      if (x >= target && x - y >= 2) return 1;
      if (y >= target && y - x >= 2) return 0;
      const k = key(x, y);
      const cached = memo.get(k);
      if (cached !== undefined) return cached;
      // 50/50 rally model; you can replace later
      const p = 0.5 * winProb(x + 1, y) + 0.5 * winProb(x, y + 1);
      memo.set(k, p);
      return p;
    }

    const pNow = winProb(a, b);
    const pIfWin = winProb(a + 1, b);
    const pIfLose = winProb(a, b + 1);
    return { now: pNow, dIfWin: pIfWin - pNow, dIfLose: pIfLose - pNow };
  }, [s.scoreMy, s.scoreOpp, s.target]);

  const addPoint = (winner: Team) => {
    useMatchStore.getState().commitRally(winner);
  };

  const reset = () => {
    useMatchStore.getState().resetSet();
  };

  // quick stat readout (not required for buttons to work)
  const stats = useMatchStore.getState().computeStats();

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link href="/">Home</Link>
        <Link href="/setup">Setup</Link>
        <Link href="/summary">Summary</Link>
        <Link href="/season">Season</Link>
      </nav>

      <h1>Live</h1>

      <section className="card" style={{ padding: 12, marginTop: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          Score: {s.scoreMy} – {s.scoreOpp} &nbsp; (target {s.target})
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button onClick={() => addPoint('my')}>+1 My</button>
          <button onClick={() => addPoint('opp')}>+1 Opp</button>
          <button onClick={reset} style={{ marginLeft: 16 }}>
            Reset Set
          </button>
        </div>
      </section>

      <section className="card" style={{ padding: 12, marginTop: 12 }}>
        <div>My rotation: {s.rotMy} &nbsp; | &nbsp; Opp rotation: {s.rotOpp}</div>
        <div style={{ marginTop: 8 }}>
          Win chance now: {(chance.now * 100).toFixed(1)}%
          &nbsp; | if next rally win: {( (chance.now + chance.dIfWin) * 100).toFixed(1)}%
          &nbsp; | if next rally loss: {( (chance.now + chance.dIfLose) * 100).toFixed(1)}%
        </div>
      </section>

      <section className="card" style={{ padding: 12, marginTop: 12 }}>
        <div><b>Season-ish snapshot (this set)</b></div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Laps: {stats.laps} &nbsp; | &nbsp; Extras: {stats.extras}
        </div>
      </section>
    </div>
  );
}
