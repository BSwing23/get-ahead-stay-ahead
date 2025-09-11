'use client';
export const dynamic = 'force-dynamic';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useMatchStore, type Team } from '@/store/useMatchStore';

// ---------- Safe win probability (capped depth) ----------
function winProb(a: number, b: number, target: number, memo: Map<string, number>): number {
  const key = `${a},${b}`;
  if (memo.has(key)) return memo.get(key)!;

  if (a >= target && a - b >= 2) return 1;
  if (b >= target && b - a >= 2) return 0;

  // hard cap recursion depth by total rallies considered
  if (a + b > 200) return 0.5;

  const p =
    0.5 * winProb(a + 1, b, target, memo) +
    0.5 * winProb(a, b + 1, target, memo);

  memo.set(key, p);
  return p;
}

export default function LivePage() {
  const s = useMatchStore();

  // --------- TEMP: button handlers with loud signals ---------
  const addMy = () => {
    console.log('[LIVE] +1 MY clicked');
    try {
      s.commitRally('my' as Team);
      console.log('[LIVE] commitRally(my) done');
    } catch (e) {
      console.error('[LIVE] commitRally(my) error:', e);
    }
    // TEMP: visual proof a click fired
    alert('+1 MY'); // remove after we confirm
  };

  const addOpp = () => {
    console.log('[LIVE] +1 OPP clicked');
    try {
      s.commitRally('opp' as Team);
      console.log('[LIVE] commitRally(opp) done');
    } catch (e) {
      console.error('[LIVE] commitRally(opp) error:', e);
    }
    // TEMP: visual proof a click fired
    alert('+1 OPP'); // remove after we confirm
  };

  const chance = useMemo(() => {
    const memo = new Map<string, number>();
    const target = s.target ?? 25;
    const pNow = winProb(s.scoreMy, s.scoreOpp, target, memo);
    const pIfWin = winProb(s.scoreMy + 1, s.scoreOpp, target, memo);
    const pIfLose = winProb(s.scoreMy, s.scoreOpp + 1, target, memo);
    return { now: pNow, deltaWin: pIfWin - pNow, deltaLose: pIfLose - pNow };
  }, [s.scoreMy, s.scoreOpp, s.target]);

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1>Live</h1>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link href="/setup">Setup</Link>
          <Link href="/summary">Summary</Link>
          <Link href="/season">Season</Link>
        </nav>
      </header>

      <section className="card" style={{ padding: 16, marginBottom: 16, border: '1px solid #ddd', borderRadius: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
          Score: {s.scoreMy} – {s.scoreOpp}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" onClick={addMy} style={{ padding: '8px 14px' }}>
            +1 My Team
          </button>
          <button type="button" onClick={addOpp} style={{ padding: '8px 14px' }}>
            +1 Opponent
          </button>
        </div>
      </section>

      <section className="card" style={{ padding: 16, marginBottom: 16, border: '1px solid #ddd', borderRadius: 8 }}>
        <div><b>Win chance now:</b> {(chance.now * 100).toFixed(1)}%</div>
        <div><b>If next rally WIN:</b> {(chance.deltaWin * 100).toFixed(1)}%</div>
        <div><b>If next rally LOSE:</b> {(chance.deltaLose * 100).toFixed(1)}%</div>
      </section>

      {/* TEMP DEBUG — helps confirm state actually changes */}
      <section className="card" style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Debug</div>
        <div>rotMy: {s.rotMy} | rotOpp: {s.rotOpp}</div>
        <div>realMy: {s.realMy} | realOpp: {s.realOpp}</div>
        <div>target: {s.target}</div>
        <div>rallies: {s.rallies.length}</div>
      </section>
    </div>
  );
}
