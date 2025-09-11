'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
// import via named OR default now both work; use named:
import { useMatchStore } from '../../store/useMatchStore';

function winProb(a: number, b: number, target: number, memo: Map<string, number>): number {
  const key = `${a},${b},${target}`;
  if (memo.has(key)) return memo.get(key)!;
  if (a >= target && a - b >= 2) return 1;
  if (b >= target && b - a >= 2) return 0;
  if (!target || target < 1 || target > 200) return 0.5; // guard
  const v = 0.5 * (winProb(a + 1, b, target, memo) + winProb(a, b + 1, target, memo));
  memo.set(key, v);
  return v;
}

export default function LivePage() {
  const s = useMatchStore();

  const my = s.realMy;
  const opp = s.realOpp;
  const target = s.target;

  const chance = useMemo(()=>{
    const memo = new Map<string, number>();
    const now = winProb(my, opp, target, memo);
    const pIfWin = winProb(my+1, opp, target, memo);
    const pIfLose= winProb(my, opp+1, target, memo);
    return { now, pIfWin, pIfLose, dWin: pIfWin-now, dLose: pIfLose-now };
  }, [my, opp, target]);

  // Primary actions
  const addMy  = () => s.commitRally('my');
  const addOpp = () => s.commitRally('opp');

  // Debug actions (prove store <-> UI wiring)
  const bumpMy = () => s.bumpMy();
  const bumpOpp= () => s.bumpOpp();

  const pct = (x:number)=> (x*100).toFixed(1)+'%';
  const signed = (x:number)=> (x>=0?'+':'')+(x*100).toFixed(1)+'%';

  return (
    <div style={{ padding: 16, maxWidth: 1000, margin: '0 auto' }}>
      <header style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <Link href="/setup">Setup</Link>
        <Link href="/summary">Summary</Link>
        <Link href="/season">Season</Link>
        <b>Live</b>
      </header>

      <h1>Live</h1>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>Scoreboard</h3>
          <div style={{ fontSize: 20, marginBottom: 12 }}>
            Real points — <b>Us {my}</b> : <b>{opp} Them</b> <span style={{ opacity: 0.7 }}> (to {target})</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap:'wrap' }}>
            <button onClick={addMy}  style={{ padding: '8px 12px' }}>+1 Us (commitRally)</button>
            <button onClick={addOpp} style={{ padding: '8px 12px' }}>+1 Them (commitRally)</button>
            <button onClick={bumpMy}  style={{ padding: '8px 12px' }}>Debug +1 Us (bump)</button>
            <button onClick={bumpOpp} style={{ padding: '8px 12px' }}>Debug +1 Them (bump)</button>
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            Buttons call <code>commitRally('my'|'opp')</code>. Debug buttons call <code>bumpMy/bumpOpp</code>.
          </div>
        </div>

        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>Win Chances</h3>
          <div>Now: <b>{pct(chance.now)}</b></div>
          <div>If we win next: <b>{pct(chance.pIfWin)}</b> <span style={{ opacity: 0.7 }}>({signed(chance.dWin)})</span></div>
          <div>If we lose next: <b>{pct(chance.pIfLose)}</b> <span style={{ opacity: 0.7 }}>({signed(chance.dLose)})</span></div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>50/50 rally model.</div>
        </div>
      </section>

      <section style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>Rallies</h3>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{s.rallies.length} total</div>
        <div style={{ maxHeight: 240, overflow: 'auto', border: '1px solid #eee', borderRadius: 6 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #eee' }}>#</th>
                <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #eee' }}>Winner</th>
                <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #eee' }}>ServeBy</th>
                <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #eee' }}>Rot (Us/Opp)</th>
              </tr>
            </thead>
            <tbody>
              {s.rallies.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: 6, borderBottom: '1px solid #f5f5f5' }}>{i + 1}</td>
                  <td style={{ padding: 6, borderBottom: '1px solid #f5f5f5' }}>{r.winner}</td>
                  <td style={{ padding: 6, borderBottom: '1px solid #f5f5f5' }}>{r.serveBy}</td>
                  <td style={{ padding: 6, borderBottom: '1px solid #f5f5f5' }}>{r.rotMy} / {r.rotOpp}</td>
                </tr>
              ))}
              {s.rallies.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 8, opacity: 0.6 }}>No rallies yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
