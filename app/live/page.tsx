'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useMatchStore } from '@/store/useMatchStore';

// ---- Safe, memoized 50/50 rally win probability to target, win-by-2 ----
function winProb(a: number, b: number, target: number, memo: Map<string, number>): number {
  if (!target || target < 1 || target > 200) return 0.5;
  const key = `${a},${b},${target}`;
  const cached = memo.get(key);
  if (cached !== undefined) return cached;

  if (a >= target && a - b >= 2) return 1;
  if (b >= target && b - a >= 2) return 0;

  // recursion guard (shouldn’t hit, but avoids runaway if target/state is odd)
  if (a > target + 3 || b > target + 3) {
    const res = a > b ? 1 : 0;
    memo.set(key, res);
    return res;
  }

  const res = 0.5 * (winProb(a + 1, b, target, memo) + winProb(a, b + 1, target, memo));
  memo.set(key, res);
  return res;
}

// Common method names various builds have used
const CANDIDATE_METHODS = [
  'commitRally',
  'addRally',
  'recordRally',
  'rally',
  'pushRally',
  'addPoint',
  'point',
  'score',
  'add',
];

type Winner = 'my' | 'opp';

export default function LivePage() {
  const s: any = useMatchStore();
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const pushLog = (line: string) => {
    setLog((prev) => {
      const next = [...prev, line];
      // keep last ~60 lines
      if (next.length > 60) next.shift();
      return next;
    });
    // scroll into view
    queueMicrotask(() => {
      logRef.current?.scrollTo({ top: 999999, behavior: 'smooth' });
    });
  };

  const my = s?.realMy ?? s?.scoreMy ?? 0;
  const opp = s?.realOpp ?? s?.scoreOpp ?? 0;
  const target: number = s?.target ?? 25;

  const chance = useMemo(() => {
    const memo = new Map<string, number>();
    const now = winProb(my, opp, target, memo);
    const pIfWin = winProb(my + 1, opp, target, memo);
    const pIfLose = winProb(my, opp + 1, target, memo);
    return { now, pIfWin, pIfLose };
  }, [my, opp, target]);

  /** Try a bunch of method names and signatures; log every attempt inline. */
  const fireRally = (who: Winner) => {
    if (!s) {
      pushLog('❌ Store is undefined');
      return;
    }

    // 1) Try candidate rally methods
    for (const name of CANDIDATE_METHODS) {
      const fn = s?.[name];
      if (typeof fn === 'function') {
        // a) string signature
        try {
          pushLog(`↪️ trying ${name}('${who}')`);
          fn.call(s, who);
          pushLog(`✅ ${name}('${who}') worked`);
          return;
        } catch (e: any) {
          pushLog(`⚠️ ${name}('${who}') threw: ${e?.message || e}`);
        }
        // b) object signature
        try {
          pushLog(`↪️ trying ${name}({ winner: '${who}' })`);
          fn.call(s, { winner: who });
          pushLog(`✅ ${name}({ winner: '${who}' }) worked`);
          return;
        } catch (e: any) {
          pushLog(`⚠️ ${name}({ winner }) threw: ${e?.message || e}`);
        }
      }
    }

    // 2) Try very direct score setters if present
    const inc = (key: string) => {
      try {
        if (typeof s?.[key] === 'function') {
          pushLog(`↪️ trying ${key}()`);
          s[key]();
          pushLog(`✅ ${key}() worked`);
          return true;
        }
      } catch (e: any) {
        pushLog(`⚠️ ${key}() threw: ${e?.message || e}`);
      }
      return false;
    };

    if (who === 'my') {
      if (inc('incRealMy') || inc('incScoreMy')) return;
    } else {
      if (inc('incRealOpp') || inc('incScoreOpp')) return;
    }

    // 3) Final note
    pushLog('❌ No known method worked. Expose commitRally/addRally on the store.');
  };

  // Build a small diagnostics view of the store surface
  const fnList = Object.keys(s ?? {})
    .filter((k) => typeof s[k] === 'function')
    .sort();

  const detected = CANDIDATE_METHODS.filter((m) => typeof s?.[m] === 'function');

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
        <button onClick={() => fireRally('my')} style={{ padding: '8px 12px' }}>+1 Us</button>
        <button onClick={() => fireRally('opp')} style={{ padding: '8px 12px' }}>+1 Them</button>
      </div>

      <section style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, maxWidth: 520, marginBottom: 16 }}>
        <div>Win % now: <b>{(chance.now * 100).toFixed(1)}%</b></div>
        <div>If we win next: <b>{(chance.pIfWin * 100).toFixed(1)}%</b></div>
        <div>If we lose next: <b>{(chance.pIfLose * 100).toFixed(1)}%</b></div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
          50/50 rally model; memoized and guarded.
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Diagnostics</h3>
          <div style={{ fontSize: 14, marginBottom: 6 }}>
            <div><b>Detected rally methods:</b> {detected.length ? detected.join(', ') : 'none'}</div>
            <div style={{ marginTop: 6 }}>
              <b>All functions on store ({fnList.length}):</b>
              <div style={{
                maxHeight: 150, overflow: 'auto', padding: 8, background: '#fafafa',
                border: '1px solid #eee', borderRadius: 6, marginTop: 6, fontFamily: 'monospace', fontSize: 12
              }}>
                {fnList.join('\n')}
              </div>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Action Log</h3>
          <div
            ref={logRef}
            style={{
              maxHeight: 190, overflow: 'auto', padding: 8, background: '#0b1020',
              color: '#e9f0ff', borderRadius: 6, fontFamily: 'monospace', fontSize: 12
            }}
          >
            {log.map((l, i) => (<div key={i}>{l}</div>))}
          </div>
        </div>
      </section>
    </div>
  );
}
