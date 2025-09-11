'use client';

export const dynamic = 'force-dynamic';
export const revalidate = false;

import React, { useMemo } from 'react';
import { useMatchStore } from '@/store/useMatchStore';

/** Win probability with simple 50/50 rally model, win-by-2, to target (25/15) */
function winProb(a: number, b: number, target: number, memo = new Map<string, number>()): number {
  if (a >= target && a - b >= 2) return 1;
  if (b >= target && b - a >= 2) return 0;

  const key = `${a},${b}`;
  const hit = memo.get(key);
  if (hit !== undefined) return hit;

  const p = 0.5 * winProb(a + 1, b, target, memo) + 0.5 * winProb(a, b + 1, target, memo);
  memo.set(key, p);
  return p;
}

export default function LivePage() {
  const s = useMatchStore();

  const chance = useMemo(() => {
    const memo = new Map<string, number>();
    const target = s.target ?? 25;

    const pNow = winProb(s.scoreMy, s.scoreOpp, target, memo);
    const pIfWin = winProb(s.scoreMy + 1, s.scoreOpp, target, memo);
    const pIfLose = winProb(s.scoreMy, s.scoreOpp + 1, target, memo);

    return {
      now: pNow,
      deltaWin: pIfWin - pNow,
      deltaLose: pIfLose - pNow,
    };
  }, [s.scoreMy, s.scoreOpp, s.target]);

  const addMy = () => s.commitRally('my');
  const addOpp = () => s.commitRally('opp');
  const reset = () => s.resetSet();

  return (
    <div style={{ padding: 20, maxWidth: 720, margin: '0 auto', lineHeight: 1.4 }}>
      <h1>Live</h1>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Score</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {s.scoreMy} : {s.scoreOpp}
          </div>
        </div>
        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Real Points</div>
          <div>
            My {s.realMy} • Opp {s.realOpp}
          </div>
        </div>
        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Rotations</div>
          <div>
            My {s.rotMy} • Opp {s.rotOpp}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button onClick={addMy}>+1 My</button>
        <button onClick={addOpp}>+1 Opp</button>
        <button onClick={reset}>Reset Set</button>
      </div>

      <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>Win Probability</h3>
        <div>Current: {(chance.now * 100).toFixed(1)}%</div>
        <div>Δ if win next: {(chance.deltaWin * 100).toFixed(1)}%</div>
        <div>Δ if lose next: {(chance.deltaLose * 100).toFixed(1)}%</div>
      </div>
    </div>
  );
}
