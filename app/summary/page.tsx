'use client'

import React from 'react'
import { useMatchStore, computeStats, Rot } from '@/store/useMatchStore'

export default function SummaryPage() {
  const s = useMatchStore()
  const { byRot } = computeStats(s.rallies)

  const rows = ([1,2,3,4,5,6] as Rot[]).map(rot => {
    const st = byRot[rot]
    const psPct = st.serves ? (st.ps).toFixed(3) : "0.000"
    const soPct = st.receives ? (st.so).toFixed(3) : "0.000"
    const win = st.ps + st.so > 1 ? "Winning" : "Losing"
    return { rot, serves:st.serves, receives:st.receives, psPct, soPct, win }
  })

  return (
    <main style={{padding:'20px', maxWidth:1100, margin:'0 auto'}}>
      <div style={{display:'flex', gap:12, justifyContent:'flex-end', marginBottom:8}}>
        <a href="/setup">Setup</a>
        <a href="/live">Live</a>
        <a href="/summary" style={{fontWeight:700}}>Summary</a>
        <a href="/season">Season</a>
      </div>

      <h1>Summary — Set {s.currentSet}</h1>

      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th>Zone (Z)</th>
            <th>Serves</th>
            <th>Receives</th>
            <th>PS%</th>
            <th>SO%</th>
            <th>PS%+SO%</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.rot}>
              <td>Z{r.rot}</td>
              <td>{r.serves}</td>
              <td>{r.receives}</td>
              <td>{r.psPct}</td>
              <td>{r.soPct}</td>
              <td>{(parseFloat(r.psPct)+parseFloat(r.soPct)).toFixed(3)}</td>
              <td>{r.win}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
