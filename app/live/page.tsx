'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMatchStore, type Team } from '@/store/useMatchStore';

// ---- Safe win probability (capped) ----
function winProb(a: number, b: number, target: number, memo: Map<string, number>): number {
  const key = `${a},${b}`;
  if (memo.has(key)) return memo.get(key)!;
  if (a >= target && a - b >= 2) return 1;
  if (b >= target && b - a >= 2) return 0;
  if (a + b > 200) return 0.5; // cap depth
  const p = 0.5 * winProb(a + 1, b, target, memo) + 0.5 * winProb(a, b + 1, target, memo);
  memo.set(key, p);
  return p;
}

export default function LivePage() {
  const s = useMatchStore();
  const [hydrated, setHydrated] = useState(false);

  // PROVE hydration & see if anything is swallowing clicks
  useEffect(() => {
    setHydrated(true);
    console.log('[LIVE] Hydrated ✅');
    const clickSpy = (ev: MouseEvent) => {
      const el = ev.target as HTMLElement;
      console.log('[LIVE] Global click:', el?.tagName, el?.id, el?.className);
    };
    window.addEventListener('click', clickSpy, true);
    return () => window.removeEventListener('click', clickSpy, true);
  }, []);

  const addMy = () => {
    console.log('[LIVE] +1 MY clicked');
    alert('+1 MY'); // TEMP proof of click
    s.commitRally('my' as Team);
  };

  const addOpp = () => {
    console.log('[LIVE] +1 OPP clicked');
    alert('+1 OPP'); // TEMP proof of click
    s.commitRally('opp' as Team);
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
    <div style={{ padding: 16, maxWidth: 960, margin: '0 auto', position: 'relative' }}>
      {/* Hydration badge */}
      <div
        style={{
          position: 'fixed',
          top: 8,
          right: 8,
          padding: '4px 8px',
          borderRadius: 6,
          background: hydrated ? '#16a34a' : '#ef4444',
          color: '#fff',
          fontSize: 12,
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      >
        {hydrated ? 'Client Active' : 'Not Hydrated'}
      </div>

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
          <button
            id="btn-my"
            type="button"
            onClick={addMy}
            style={{ padding: '10px 16px', cursor: 'pointer', position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
          >
            +1 My Team
          </button>
          <button
            id="btn-opp"
            type="button"
            onClick={addOpp}
            style={{ padding: '10px 16px', cursor: 'pointer', position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
          >
            +1 Opponent
          </button>

          {/* TEST: guaranteed alert to prove hydration */}
          <button
            id="btn-test"
            type="button"
            onClick={() => {
              console.log('[LIVE] Test Alert');
              alert('Test Alert');
            }}
            style={{ padding: '10px 16px', cursor: 'pointer' }}
          >
            Test Alert
          </button>
        </div>
      </section>

      <section className="card" style={{ padding: 16, marginBottom: 16, border: '1px solid #ddd', borderRadius: 8 }}>
        <div><b>Win chance now:</b> {(chance.now * 100).toFixed(1)}%</div>
        <div><b>If next rally WIN:</b> {(chance.deltaWin * 100).toFixed(1)}%</div>
        <div><b>If next rally LOSE:</b> {(chance.deltaLose * 100).toFixed(1)}%</div>
      </section>

      {/* Debug */}
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
