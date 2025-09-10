'use client';
import React from 'react';
import Link from 'next/link';
import { useMatchStore, Rot } from '@/store/useMatchStore';

export default function SummaryPage(){
  const s = useMatchStore();
  const { byRot, laps, extras } = s.computeStats();

  const rows = ([1,2,3,4,5,6] as Rot[]).map((r)=>{
    const st = byRot[r];
    const psPct = st.serves ? st.ps / st.serves : 0;
    const soPct = st.receives ? st.so / st.receives : 0;
    return { r, ...st, psPct, soPct, sum: psPct+soPct };
  });

  return (
    <main style={{padding:16, maxWidth:980, margin:'0 auto'}}>
      <nav style={{display:'flex', gap:16, marginBottom:12}}>
        <Link href="/setup">Setup</Link>
        <Link href="/live">Live</Link>
        <Link href="/season">Season</Link>
      </nav>

      <h1>Summary — Set</h1>
      <div style={{fontSize:12, opacity:.8, marginBottom:8}}>
        Laps: <b>{laps}</b> &nbsp; Extras: <b>{extras}</b>
      </div>

      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th style={{textAlign:'left'}}>Rot</th>
            <th>Serves</th><th>PS</th><th>PS%</th>
            <th>Receives</th><th>SO</th><th>SO%</th>
            <th>PS%+SO%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row=>(
            <tr key={row.r}>
              <td>{row.r}</td>
              <td>{row.serves}</td>
              <td>{row.ps}</td>
              <td>{(row.psPct*100).toFixed(1)}%</td>
              <td>{row.receives}</td>
              <td>{row.so}</td>
              <td>{(row.soPct*100).toFixed(1)}%</td>
              <td>{(row.sum*100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
