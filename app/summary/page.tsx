'use client';

import React from 'react';
import Link from 'next/link';
import { useMatchStore, computeStats, Rot } from '@/store/useMatchStore';

const th: React.CSSProperties = { textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' };
const td: React.CSSProperties = { borderBottom: '1px solid #eee', padding: '6px' };

export default function SummaryPage() {
  const s = useMatchStore();

  // Compute summarised stats from rallies (do NOT call s.stats() — it's not a function)
  const { byRot, laps, extras } = computeStats(s.rallies);

  const rows = ([1, 2, 3, 4, 5, 6] as Rot[]).map((rot) => {
    const st =
      byRot[rot] ??
      {
        serves: 0,
        receives: 0,
        ps: 0, // real points on serve
        so: 0, // sideouts (receives won)
      };
    const psPct = st.serves ? st.ps / st.serves : 0;
    const soPct = st.receives ? st.so / st.receives : 0;
    const winning = psPct + soPct >= 1;
    return {
      rot,
      serves: st.serves,
      realPts: st.ps,
      psPct,
      receives: st.receives,
      sideouts: st.so,
      soPct,
      sumPct: psPct + soPct,
      winning,
    };
  });

  return (
    <div style={{ padding: 16, maxWidth: 1000, margin: '0 auto' }}>
      {/* Top nav */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <Link href="/setup">Setup</Link>
        <Link href="/live">Live</Link>
        <b>Summary</b>
        <Link href="/season">Season</Link>
      </div>

      <h1>Summary — Set {s.currentSet}</h1>
      <p>
        Projected laps: <b>{laps}</b> · extras: <b>{extras}</b>
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Zone (Z)</th>
            <th style={th}>Serves</th>
            <th style={th}>RealPts</th>
            <th style={th}>PS%</th>
            <th style={th}>Receives</th>
            <th style={th}>Sideouts</th>
            <th style={th}>SO%</th>
            <th style={th}>PS%+SO%</th>
            <th style={th}>Winning?</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.rot}>
              <td style={td}>Z{r.rot}</td>
              <td style={td}>{r.serves}</td>
              <td style={td}>{r.realPts}</td>
              <td style={td}>{r.psPct.toFixed(3)}</td>
              <td style={td}>{r.receives}</td>
              <td style={td}>{r.sideouts}</td>
              <td style={td}>{r.soPct.toFixed(3)}</td>
              <td style={td}>{r.sumPct.toFixed(3)}</td>
              <td style={td}>{r.winning ? 'Winning' : 'Losing'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
