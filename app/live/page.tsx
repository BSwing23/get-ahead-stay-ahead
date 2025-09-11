// app/live/page.tsx
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useMatchStore } from '@/store/useMatchStore'; // named import (no default)

// ---- Win probability (50/50 rallies), win-by-2, target = 25 or 15 ----
function winProb(
  a: number,
  b: number,
  target: number,
  memo: Map<string, number> = new Map()
): number {
  // Guard: if target is falsy or invalid, avoid runaway recursion
  if (!target || target < 1) return 0;

  const k = `${a},${b},${target}`;
  if (memo.has(k)) return memo.get(k)!;

  // Terminals: win-by-2
  if (a >= target && a - b >= 2) return 1;
  if (b >= target && b - a >= 2) return 0;

  // Next rally is 50/50
  const v =
    0.5 * winProb(a + 1, b, target, memo) +
    0.5 * winProb(a, b + 1, target, memo);

  memo.set(k, v);
  return v;
}

export default function LivePage() {
  const s = useMatchStore();

  // Some stores don’t have target in state yet. Default to 25.
  const target = (s as any).target ?? 25;

  // Scores for the probability model: use “real” points if present, else fall back to displayed score.
  const realMy = (s as any).realMy ?? s.scoreMy ?? 0;
  const realOpp = (s as any).realOpp ?? s.scoreOpp ?? 0;

  // Compute current win chance and the swing (+/- next rally)
  const chance = useMemo(() => {
    const memo = new Map<string, number>();
    const now = winProb(realMy, realOpp, target, memo);
    const pIfWin = winProb(realMy + 1, realOpp, target, memo);
    const pIfLose = winProb(realMy, realOpp + 1, target, memo);
    return { now, pIfWin, pIfLose, deltaWin: pIfWin - now, deltaLose: pIfLose - now };
  }, [realMy, realOpp, target]);

  // Button handlers — ensure literal types match the store’s Team type ('my' | 'opp')
  const addMy = () => s.commitRally({ winner: 'my' as 'my' });
  const addOpp = () => s.commitRally({ winner: 'opp' as 'opp' });

  // Quick styles (kept simple to avoid CSS churn while we stabilize builds)
  const card: React.CSSProperties = {
    padding: 16,
    margin: '0 auto',
    maxWidth: 960,
    border: '1px solid #eee',
    borderRadius: 12,
    background: '#fff',
  };
  const btn: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #ddd',
    background: '#f7f7f7',
    cursor: 'pointer',
    fontWeight: 600,
  };
  const pill: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 999,
    background: '#f0f4ff',
    border: '1px solid #dfe7ff',
    fontVariantNumeric: 'tabular-nums',
  };

  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link href="/setup">Setup</Link>
        <Link href="/summary">Summary</Link>
        <Link href="/season">Season</Link>
        <span style={{ fontWeight: 700 }}>Live</span>
      </nav>

      <section style={card}>
        <h1 style={{ marginTop: 0 }}>Live</h1>

        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Score</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {realMy} — {realOpp}
              <span style={{ marginLeft: 10, fontSize: 12, opacity: 0.65 }}>
                (target {target})
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
              Win chance (now)
            </div>
            <div style={pill}>
              {(chance.now * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <button style={btn} onClick={addMy}>+1 Us</button>
          <button style={btn} onClick={addOpp}>+1 Them</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, border: '1px dashed #eee', borderRadius: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
              If we win the next rally
            </div>
            <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
              {(chance.pIfWin * 100).toFixed(1)}%
              <span style={{ marginLeft: 8, color: '#0a7' }}>
                ({(chance.deltaWin * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
          <div style={{ padding: 12, border: '1px dashed #eee', borderRadius: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
              If we lose the next rally
            </div>
            <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
              {(chance.pIfLose * 100).toFixed(1)}%
              <span style={{ marginLeft: 8, color: '#c33' }}>
                ({(chance.deltaLose * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
