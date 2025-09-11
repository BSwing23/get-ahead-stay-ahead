'use client';

export const dynamic = "force-dynamic"; // <-- disables prerendering

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useMatchStore, type Team } from '@/store/useMatchStore';

// ---- Win probability ----
function winProb(a: number, b: number, target: number, memo: Map<string, number>): number {
  const key = `${a},${b}`;
  if (memo.has(key)) return memo.get(key)!;

  if (a >= target && a - b >= 2) return 1;
  if (b >= target && b - a >= 2) return 0;

  // stop runaway recursion (cap at 200 rallies)
  if (a + b > 200) return 0.5;

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
    return { now: pNow, deltaWin: pIfWin - pNow, deltaLose: pIfLose - pNow };
  }, [s.scoreMy, s.scoreOpp, s.target]);

  const addMy = () => s.commitRally('my' as Team);
  const addOpp = () => s.commitRally('opp' as Team);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Live Match</h1>
      <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
        Score: {s.scoreMy} - {s.scoreOpp}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={addMy}>+1 My Team</button>
        <button onClick={addOpp}>+1 Opponent</button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <strong>Win Chance Now:</strong> {(chance.now * 100).toFixed(1)}%<br />
        <strong>If Next Rally Win:</strong> {(chance.deltaWin * 100).toFixed(1)}%<br />
        <strong>If Next Rally Lose:</strong> {(chance.deltaLose * 100).toFixed(1)}%
      </div>

      <Link href="/summary">Go to Summary</Link>
    </div>
  );
}
