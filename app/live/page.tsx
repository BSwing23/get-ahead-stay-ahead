'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useMatchStore, Rot, computeStats } from '@/store/useMatchStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const pill: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 10px',
  borderRadius: 999,
  background: '#eef2ff',
  fontWeight: 700,
};

function labelRot(r: Rot) { return `Z${r}`; }

/** 50/50 rallies, win-by-2, target points. Memoized & terminating. */
function winProb(a: number, b: number, target: number, memo: Map<string, number>): number {
  if (a >= target && a - b >= 2) return 1;
  if (b >= target && b - a >= 2) return 0;
  const key = `${a},${b},${target}`;
  const hit = memo.get(key);
  if (hit !== undefined) return hit;
  const p =
    0.5 * winProb(a + 1, b, target, memo) +
    0.5 * winProb(a, b + 1, target, memo);
  memo.set(key, p);
  return p;
}

export default function LivePage() {
  const s = useMatchStore();

  // Derive target without fighting TS types:
  // try state fields if they exist, else 15 for set 5, else 25.
  const target =
    (s as any).target ??
    (s as any).rules?.target ??
    (s.currentSet === 5 ? 15 : 25);

  const { byRot, laps, extras } = useMemo(() => computeStats(s.rallies), [s.rallies]);

  const rows = ([1,2,3,4,5,6] as Rot[]).map((rot) => {
    const st = byRot[rot] ?? { serves: 0, receives: 0, ps: 0, so: 0 };
    const psPct = st.serves ? st.ps / st.serves : 0;
    const soPct = st.receives ? st.so / st.receives : 0;
    return {
      rot,
      serves: st.serves,
      realPts: st.ps,
      psPct,
      receives: st.receives,
      sideouts: st.so,
      soPct,
      sumPct: psPct + soPct,
      winning: psPct + soPct >= 1,
    };
  });

  const chance = useMemo(() => {
    const memo = new Map<string, number>();
    const pNow = winProb(s.realMy, s.realOpp, target, memo);
    const pIfWin = winProb(s.realMy + 1, s.realOpp, target, memo);
    const pIfLose = winProb(s.realMy, s.realOpp + 1, target, memo);
    return { now: pNow, deltaWin: pIfWin - pNow, deltaLose: pIfLose - pNow };
  }, [s.realMy, s.realOpp, target]);

  const addMy = () => s.commitRally({ winner: 'my' });
  const addOpp = () => s.commitRally({ winner: 'opp' });

  return (
    <div style={{ padding: 16, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <Link href="/setup">Setup</Link>
        <b>Live</b>
        <Link href="/summary">Summary</Link>
        <Link href="/season">Season</Link>
      </div>

      <h1>Live — Set {s.currentSet}</h1>

      <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Actual Score</div>
          <div style={{ fontSize: 48, fontWeight: 800 }}>{s.scoreOpp}</div>
          <div style={{ opacity: 0.7 }}>{s.oppName || 'Opp'}</div>
        </div>
        <div style={{ width: 20 }} />
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Actual Score</div>
          <div style={{ fontSize: 48, fontWeight: 800 }}>{s.scoreMy}</div>
          <div style={{ opacity: 0.7 }}>{s.myName || 'My'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <button onClick={addMy} style={{ padding: '12px 18px', fontWeight: 700, background: '#3b82f6', color: '#fff', borderRadius: 12, border: 'none' }}>
          My +1
        </button>
        <button onClick={addOpp} style={{ padding: '12px 18px', fontWeight: 700, background: '#ef4444', color: '#fff', borderRadius: 12, border: 'none' }}>
          Opp +1
        </button>
        <button onClick={s.resetSet} style={{ padding: '12px 18px', borderRadius: 12 }}>
          Reset Set
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div>Rotation: <span style={pill}>{s.rotation}</span></div>
        <div>Serving: <span style={pill}>{s.serving}</span></div>
        <div>Target: <span style={pill}>{target}</span></div>
        <div>Laps/Extras: <span style={pill}>{laps}/{extras}</span></div>
      </div>

      <div className="card" style={{ padding: 12, marginBottom: 16, borderRadius: 12, border: '1px solid #eee' }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Win Probability (50/50 rallies)</div>
        <div>Now: <b>{(chance.now * 100).toFixed(1)}%</b></div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          If we win next point: <b>{(chance.deltaWin * 100).toFixed(1)}%</b> change · If we lose: <b>{(chance.deltaLose * 100).toFixed(1)}%</b> change
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Zone (Z)</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Serves</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>RealPts</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>PS%</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Receives</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Sideouts</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>SO%</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>PS%+SO%</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Winning?</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.rot}>
              <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{labelRot(r.rot)}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{r.serves}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{r.realPts}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{r.psPct.toFixed(3)}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{r.receives}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{r.sideouts}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{r.soPct.toFixed(3)}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{r.sumPct.toFixed(3)}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{r.winning ? 'Winning' : 'Losing'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
