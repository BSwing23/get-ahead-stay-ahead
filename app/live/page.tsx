'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useMatchStore } from '@/store/useMatchStore'; // ✅ named import (no default)

// ---- Win probability (50/50 rallies), win-by-2, target = 25 or 15 ----
function winProb(
  a: number,
  b: number,
  target: number,
  memo = new Map<string, number>()
): number {
  const key = `${a},${b},${target}`;
  const hit = memo.get(key);
  if (hit !== undefined) return hit;

  // Already won?
  if (a >= target && a - b >= 2) {
    memo.set(key, 1);
    return 1;
  }
  if (b >= target && b - a >= 2) {
    memo.set(key, 0);
    return 0;
  }

  // One rally each side with 50/50 chance
  const p = 0.5 * winProb(a + 1, b, target, memo) + 0.5 * winProb(a, b + 1, target, memo);
  memo.set(key, p);
  return p;
}

export default function LivePage() {
  // Read store as any to be resilient to type changes between builds
  const s = useMatchStore() as any;

  const myName: string = s?.myName ?? 'My';
  const oppName: string = s?.oppName ?? 'Opp';
  const scoreMy: number = s?.scoreMy ?? 0;
  const scoreOpp: number = s?.scoreOpp ?? 0;
  const target: number = s?.target ?? 25; // 25 for regular sets, 15 for deciding
  const sideLabel: string = s?.side ? (s.side === 'left' ? 'Left' : 'Right') : '';

  // ---- buttons (robust to differing method names in store) ----
  const addMy = () => {
    if (typeof s?.commitRally === 'function') return s.commitRally({ winner: 'my' });
    if (typeof s?.myPlusOne === 'function') return s.myPlusOne();
    if (typeof s?.addMy === 'function') return s.addMy();
  };
  const addOpp = () => {
    if (typeof s?.commitRally === 'function') return s.commitRally({ winner: 'opp' });
    if (typeof s?.oppPlusOne === 'function') return s.oppPlusOne();
    if (typeof s?.addOpp === 'function') return s.addOpp();
  };
  const resetSet = () => {
    if (typeof s?.resetSet === 'function') return s.resetSet();
    if (typeof s?.hardReset === 'function') return s.hardReset();
  };

  // Chance to win *current* set from current score
  const pNow = useMemo(() => winProb(scoreMy, scoreOpp, target), [scoreMy, scoreOpp, target]);
  // If we win/lose the next rally, how does it change?
  const pIfWin = useMemo(() => winProb(scoreMy + 1, scoreOpp, target), [scoreMy, scoreOpp, target]);
  const pIfLose = useMemo(() => winProb(scoreMy, scoreOpp + 1, target), [scoreMy, scoreOpp, target]);

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
      {/* Top nav */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <Link href="/setup">Setup</Link>
        <Link href="/summary">Summary</Link>
        <Link href="/live" aria-current="page" style={{ fontWeight: 700 }}>Live</Link>
        <Link href="/season">Season</Link>
        <div style={{ marginLeft: 'auto', opacity: 0.6 }}>Side: {sideLabel}</div>
      </div>

      {/* Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 24, marginTop: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, opacity: 0.7 }}>{oppName}</div>
          <div style={{ fontSize: 64, fontWeight: 800 }}>{scoreOpp}</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, opacity: 0.6 }}>Target: {target} (win by 2)</div>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={addMy}
              style={{
                padding: '12px 20px',
                fontWeight: 700,
                borderRadius: 10,
                border: '1px solid #ccd',
                cursor: 'pointer',
                marginRight: 8
              }}
            >
              {myName} +1
            </button>
            <button
              onClick={addOpp}
              style={{
                padding: '12px 20px',
                fontWeight: 700,
                borderRadius: 10,
                border: '1px solid #ccd',
                cursor: 'pointer',
                background: '#f44',
                color: 'white'
              }}
            >
              {oppName} +1
            </button>
          </div>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={resetSet}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #ccd',
                background: '#f6f7fb',
                cursor: 'pointer'
              }}
            >
              Reset Set
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, opacity: 0.7 }}>{myName}</div>
          <div style={{ fontSize: 64, fontWeight: 800 }}>{scoreMy}</div>
        </div>
      </div>

      {/* Win probability block */}
      <div
        style={{
          marginTop: 24,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 16
        }}
      >
        <div className="card" style={{ padding: 16, border: '1px solid #eee', borderRadius: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Chance to win (now)</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{(pNow * 100).toFixed(1)}%</div>
        </div>
        <div className="card" style={{ padding: 16, border: '1px solid #eee', borderRadius: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>If we win next point</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{(pIfWin * 100).toFixed(1)}%</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
            Δ {( (pIfWin - pNow) * 100 ).toFixed(1)} pts
          </div>
        </div>
        <div className="card" style={{ padding: 16, border: '1px solid #eee', borderRadius: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>If we lose next point</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{(pIfLose * 100).toFixed(1)}%</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
            Δ {( (pIfLose - pNow) * 100 ).toFixed(1)} pts
          </div>
        </div>
      </div>

      {/* Last rally summary if your store exposes it */}
      {Array.isArray(s?.rallies) && s.rallies.length > 0 && (
        <div style={{ marginTop: 24, opacity: 0.8 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Last Rally</div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#fafafa', padding: 12, borderRadius: 8, border: '1px solid #eee' }}>
            {JSON.stringify(s.rallies[s.rallies.length - 1], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
