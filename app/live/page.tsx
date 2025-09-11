'use client';

export const dynamic = 'force-dynamic';
export const revalidate = false;

import React, { useMemo } from 'react';
import { useMatchStore } from '@/store/useMatchStore';

export default function LivePage() {
  const s = useMatchStore();

  const chance = useMemo(() => {
    const memo = new Map<string, number>();
    const target = s.target; // 25 or 15

    const pNow = winProb(s.realMy, s.realOpp, target, memo);
    const pIfWin = winProb(s.realMy + 1, s.realOpp, target, memo);
    const pIfLose = winProb(s.realMy, s.realOpp + 1, target, memo);

    return {
      now: pNow,
      deltaWin: pIfWin - pNow,
      deltaLose: pIfLose - pNow,
    };
  }, [s.realMy, s.realOpp, s.target]);

  const addMy = () => s.commitRally('my');
  const addOpp = () => s.commitRally('opp');

  return (
    <main style={{ padding: 20 }}>
      <h1>Live Match</h1>
      <p>
        Score: {s.scoreMy} - {s.scoreOpp}
      </p>
      <p>
        Real Points: {s.realMy} - {s.realOpp}
      </p>
      <p>Target: {s.target}</p>
      <p>Win Probability: {(chance.now * 100).toFixed(1)}%</p>

      <div style={{ marginTop: 20 }}>
        <button onClick={addMy}>+ My Point</button>
        <button onClick={addOpp} style={{ marginLeft: 10 }}>
          + Opp Point
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={s.resetSet}>Reset Set</button>
      </div>
    </main>
  );
}

// ---- Helpers ----

function winProb(a: number, b: number, target: number, memo: Map<string, number>): number {
  const key = `${a},${b}`;
  if (memo.has(key)) return memo.get(key)!;

  // terminal conditions
  if (a >= target && a - b >= 2) return 1;
  if (b >= target && b - a >= 2) return 0;

  const p =
    0.5 * winProb(a + 1, b, target, memo) +
    0.5 * winProb(a, b + 1, target, memo);

  memo.set(key, p);
  return p;
}
