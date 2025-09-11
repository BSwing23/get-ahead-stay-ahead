'use client';
import React, { useMemo } from 'react';
import { useMatchStore } from '@store/useMatchStore';

// ✅ Fix: disable ISR/revalidation
export const revalidate = false;

export default function LivePage() {
  const s = useMatchStore();

  // --- Win probability calculation (unchanged) ---
  function winProb(a: number, b: number, target: number, memo = new Map<string, number>()): number {
    const key = `${a},${b},${target}`;
    if (memo.has(key)) return memo.get(key)!;
    if (a >= target && a - b >= 2) return 1;
    if (b >= target && b - a >= 2) return 0;
    const p = 0.5 * winProb(a + 1, b, target, memo) + 0.5 * winProb(a, b + 1, target, memo);
    memo.set(key, p);
    return p;
  }

  const chance = useMemo(() => {
    const memo = new Map<string, number>();
    const target = s.target;
    const pNow = winProb(s.realMy, s.realOpp, target, memo);
    const pIfWin = winProb(s.realMy + 1, s.realOpp, target, memo);
    const pIfLose = winProb(s.realMy, s.realOpp + 1, target, memo);
    return { now: pNow, deltaWin: pIfWin - pNow, deltaLose: pIfLose - pNow };
  }, [s.realMy, s.realOpp, s.target]);

  // --- Button handlers with debug logs ---
  const addMy = () => {
    console.log("Button pressed: My team scores");
    s.commitRally('my');
  };

  const addOpp = () => {
    console.log("Button pressed: Opponent scores");
    s.commitRally('opp');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Live Match</h1>
      <p>Score: {s.scoreMy} - {s.scoreOpp}</p>
      <p>Real Points: {s.realMy} - {s.realOpp}</p>
      <p>Target: {s.target}</p>

      <button onClick={addMy}>+1 My Team</button>
      <button onClick={addOpp}>+1 Opponent</button>

      <h2>Win Chance</h2>
      <p>Now: {(chance.now * 100).toFixed(1)}%</p>
      <p>If Win Rally: {(chance.now + chance.deltaWin) * 100}%</p>
      <p>If Lose Rally: {(chance.now + chance.deltaLose) * 100}%</p>
    </div>
  );
}
