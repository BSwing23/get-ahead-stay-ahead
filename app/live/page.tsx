'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useMatchStore } from '@/store/useMatchStore';

/** Memoized 50/50 rally win probability to target, win-by-2 (guarded). */
function winProb(a: number, b: number, target: number, memo: Map<string, number>): number {
  if (!target || target < 1 || target > 200) return 0.5;

  const key = `${a},${b},${target}`;
  const hit = memo.get(key);
  if (hit !== undefined) return hit;

  if (a >= target && a - b >= 2) return 1;
  if (b >= target && b - a >= 2) return 0;

  // safety cap prevents runaway recursion in pathological states
  if (a > target + 2 || b > target + 2) {
    const res = a > b ? 1 : 0;
    memo.set(key, res);
    return res;
  }

  const res = 0.5 * (winProb(a + 1, b, target, memo) + winProb(a, b + 1, target, memo));
  memo.set(key, res);
  return res;
}

/** Call the store in a defensive way so buttons always work. */
function fireRally(s: any, who: 'my' | 'opp') {
  if (!s) return;

  // 1) commitRally('my'|'opp')
  try {
    if (typeof s.commitRally === 'function' && s.commitRally.length >= 1) {
      s.commitRally(who);
      console.log('[Live] commitRally(who) fired:', who);
      return;
    }
  } catch (e) {
    console.warn('[Live] commitRally(who) failed, trying object form…', e);
  }

  // 2) commitRally({ winner: 'my'|'opp' })
  try {
    if (typeof s.commitRally === 'function') {
      s.commitRally({ winner: who });
      console.log('[Live] commitRally({winner}) fired:', who);
      return;
    }
  } catch (e) {
    console.warn('[Live] commitRally({winner}) failed, trying addRally…', e);
  }

  // 3) addRally fallback (some stores use a different name)
  try {
    if (typeof s.addRally === 'function') {
      // Support both signatures here too
      if (s.addRally.length >= 1) {
        s.addRally(who);
      } else {
        s.addRally({ winner: who });
      }
      console.log('[Live] addRally fired:', who);
      return;
    }
  } catch (e) {
    console.error('[Live] addRally failed:', e);
  }

  console.error('[Live] No rally method matched. Please expose commitRally or addRally in the store.');
}

export default function LivePage() {
  const s = useMatchStore() as any;

  // read scores defensively (names varied across builds)
  const my = s?.realMy ?? s?.scoreMy ?? 0;
  const opp = s?.realOpp ?? s?.scoreOpp ?? 0;

  // default to 25 if store doesn’t provide
  const target: number = s?.target ?? 25;

  const chance = useMemo(() => {
    const memo = new Map<string, number>();
    const now = winProb(my, opp, target, memo);
    const pIfWin = winProb(my + 1, opp, target, memo);
    const pIfLose = winProb(my, opp + 1, target, memo);
    return { now, pIfWin, pIfLose };
  }, [my, opp, target]);

  const addMy = () => fireRally(s, 'my');
  const addOpp = () => fireRally(s, 'opp');

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}>
      <header style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <Link href="/setup">Setup</Link>
        <Link href="/summary">Summary</Link>
        <Link href="/season">Season</Link>
      </header>

      <h1>Live</h1>

      <div style={{ marginBottom: 12 }}>
        Score: <b>{my}</b> — <b>{opp}</b> (to {target}, win by 2)
      </div>

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
