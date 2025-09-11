'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useMatchStore } from '@/store/useMatchStore';

/**
 * Safe, memoized win probability for 50/50 rallies, win-by-2.
 * Guards:
 * - invalid/zero target → 50%
 * - terminal states handled
 * - hard cap when either side goes beyond target+2 (prevents runaway)
 * - memoization to avoid explosion
 */
function winProb(a: number, b: number, target: number, memo: Map<string, number>): number {
  if (!target || target < 1 || target > 200) return 0.5;

  const key = `${a},${b},${target}`;
  const cached = memo.get(key);
  if (cached !== undefined) return cached;

  // Terminal conditions
  if (a >= target && a - b >= 2) return 1;
  if (b >= target && b - a >= 2) return 0;

  // Safety cap to stop unbounded recursion in pathological states
  if (a > target + 2 || b > target + 2) {
    const res = a > b ? 1 : 0;
    memo.set(key, res);
    return res;
  }

  const next =
    0.5 * (winProb(a + 1, b, target, memo) + winProb(a, b + 1, target, memo));

  memo.set(key, next);
  return next;
}

export default function LivePage() {
  // Named import only (no default import)
  const s = useMatchStore() as any;

  // Be tolerant of varying store shapes while we stabilize:
  const my = s?.realMy ?? s?.scoreMy ?? 0;
  const opp = s?.realOpp ?? s?.scoreOpp ?? 0;

  // Use provided target if present; otherwise default to 25
  const target: number = s?.target ?? 25;

  const chance = useMemo(() => {
    const memo = new Map<string, number>();
    return {
      now: winProb(my, opp, target, memo),
      pIfWin: winProb(my + 1, opp, target, memo),
      pIfLose: winProb(my, opp + 1, target, memo),
    };
  }, [my, opp, target]);

  const commitRally = s?.commitRally ?? (() => {});
  const addMy = () => commitRally({ winner: 'my' });
  const addOpp = () => commitRally({ winner: 'opp' });

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}>
      <header style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <Link href="/setup">Setup</Link>
        <Link href="/summary">Summary</Link>
        <Link href="/season">Season</Link>
      </header>

      <h1>Live</h1>

      <div style={{ marginBottom: 12 }}>Score: <b>{my}</b> — <b>{opp}</b> (to {target}, win by 2)</div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button onClick={addMy} style={{ padding: '8px 12px' }}>+1 Us</button>
        <button onClick={addOpp} style={{ padding: '8px 12px' }}>+1 Them</button>
      </div>

      <section style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, maxWidth: 520 }}>
        <div>Win % now: <b>{(chance.now * 100).toFixed(1)}%</b></div>
        <div>If we win next: <b>{(chance.pIfWin * 100).toFixed(1)}%</b></div>
        <div>If we lose next: <b>{(chance.pIfLose * 100).toFixed(1)}%</b></div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
          50/50 rally model; memoized and guarded to avoid recursion overflow.
        </div>
      </section>
    </div>
  );
}
