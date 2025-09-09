'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import useMatchStore from '@/store/useMatchStore'; // path alias '@' -> project root

// ---- Win probability (50/50 rallies), win-by-2, target = 25 or 15 ----
function winProb(a: number, b: number, target: number, memo = new Map<string, number>()): number {
  // Terminal: someone already won
  if (a >= target && a - b >= 2) return 1;
  if (b >= target && b - a >= 2) return 0;

  // Deuce region shortcut (both near target): for p=0.5 this is exact
  if (a >= target - 1 && b >= target - 1) {
    if (a === b) return 0.5;        // tied at deuce-ish
    if (a === b + 1) return 0.75;   // up 1
    if (b === a + 1) return 0.25;   // down 1
  }

  const key = `${a},${b},${target}`;
  if (memo.has(key)) return memo.get(key)!;

  // Next rally is 50/50: average of win/lose branches
  const p = 0.5 * (winProb(a + 1, b, target, memo) + winProb(a, b + 1, target, memo));
  memo.set(key, p);
  return p;
}

export default function LivePage() {
  // use 'any' to avoid strict type mismatches across builds
  const s: any = useMatchStore();

  // Scores (fallbacks so the page never crashes)
  const my = (s?.realMy ?? s?.scoreMy ?? 0) as number;
  const opp = (s?.realOpp ?? s?.scoreOpp ?? 0) as number;

  // Names
  const myName = (s?.myName ?? 'My') as string;
  const oppName = (s?.oppName ?? 'Opp') as string;

  // Target: 25 by default, 15 if deciding (or if store provides a target)
  const target: number = (s?.target ?? (s?.isDecidingSet ? 15 : 25)) as number;

  // Win probability now, and if the next rally is won/lost
  const { pNow, pIfWin, pIfLose } = useMemo(() => {
    const pNow = winProb(my, opp, target);
    const pIfWin = winProb(my + 1, opp, target);
    const pIfLose = winProb(my, opp + 1, target);
    return { pNow, pIfWin, pIfLose };
  }, [my, opp, target]);

  // Button handlers (work with either commitRally or winRally naming)
  const commit = (who: 'my' | 'opp') => {
    if (typeof s?.commitRally === 'function') s.commitRally(who);
    else if (typeof s?.winRally === 'function') s.winRally(who);
  };

  const endSet = () => {
    if (typeof s?.endSet === 'function') s.endSet();
    // route to Summary as a fallback
    if (typeof window !== 'undefined') window.location.href = '/summary';
  };

  const pill: React.CSSProperties = {
    padding: '8px 14px',
    borderRadius: 999,
    fontWeight: 700,
    display: 'inline-block',
    minWidth: 56,
    textAlign: 'center',
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      {/* simple top nav */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginBottom: 12 }}>
        <Link href="/setup">Setup</Link>
        <Link href="/live">Live</Link>
        <Link href="/summary">Summary</Link>
        <Link href="/season">Season</Link>
      </div>

      <h1 style={{ marginBottom: 8 }}>Live</h1>

      {/* Scoreboards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
        <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 14, opacity: 0.7 }}>{oppName}</div>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1 }}>{opp}</div>
        </div>
        <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 14, opacity: 0.7, textAlign: 'right' }}>{myName}</div>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, textAlign: 'right' }}>{my}</div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
        <button
          onClick={() => commit('my')}
          style={{ ...pill, background: '#2563eb', color: 'white' }}
          aria-label={`${myName} won rally`}
        >
          {myName} +1
        </button>
        <button
          onClick={() => commit('opp')}
          style={{ ...pill, background: '#ef4444', color: 'white' }}
          aria-label={`${oppName} won rally`}
        >
          {oppName} +1
        </button>
        <button onClick={endSet} style={{ ...pill, background: '#e5e7eb', color: '#111827' }}>
          End Set → Summary
        </button>
      </div>

      {/* Win probability panel */}
      <div
        style={{
          marginTop: 20,
          border: '1px solid #eee',
          borderRadius: 12,
          padding: 16,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Win odds now</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{Math.round(pNow * 100)}%</div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>If we win next</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#065f46' }}>
            {Math.round(pIfWin * 100)}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>If we lose next</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#7f1d1d' }}>
            {Math.round(pIfLose * 100)}%
          </div>
        </div>
      </div>

      {/* Context details */}
      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        Target: {target} (win by 2) • Assumes 50/50 rallies for quick live odds.
      </div>
    </div>
  );
}
