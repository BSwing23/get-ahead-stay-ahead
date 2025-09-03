'use client'

import React from 'react'
import Link from 'next/link'
import { useMatchStore } from '@/store/useMatchStore'

// ---------- Real Points helper ----------
type Rally = { winner: 'my' | 'opp'; serving: 'my' | 'opp' }
function computeRealPoints(rallies: Rally[]) {
  let my = 0, opp = 0
  for (const r of rallies) {
    if (r.winner === 'my'  && r.serving === 'my')  my++
    if (r.winner === 'opp' && r.serving === 'opp') opp++
  }
  return { my, opp }
}
// ---------------------------------------

export default function LivePage() {
  // ===== SELECT FROM STORE (rename if your store uses different keys) =====
  const scoreMy   = useMatchStore(s => (s as any).scoreMy ?? 0)
  const scoreOpp  = useMatchStore(s => (s as any).scoreOpp ?? 0)
  const serving   = useMatchStore(s => (s as any).servingTeam ?? 'my') as 'my' | 'opp'
  const rotation  = useMatchStore(s => (s as any).currentRotation ?? 1)
  const rallies   = useMatchStore(s => (s as any).rallies ?? []) as Rally[]

  const pointMy   = useMatchStore(s => (s as any).pointMy   ?? (()=>{}))
  const pointOpp  = useMatchStore(s => (s as any).pointOpp  ?? (()=>{}))
  const undo      = useMatchStore(s => (s as any).undo      ?? (()=>{}))
  const resetSet  = useMatchStore(s => (s as any).resetSet  ?? (()=>{}))
  // =======================================================================

  const { my: realMy, opp: realOpp } = computeRealPoints(rallies)

  return (
    <main style={{padding:'20px', maxWidth:960, margin:'0 auto'}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <h1 style={{margin:0}}>Live</h1>
        <nav style={{display:'flex', gap:12}}>
          <Link href="/setup">Setup →</Link>
          <Link href="/summary">Summary →</Link>
        </nav>
      </header>

      {/* Scoreboard */}
      <section
        style={{
          display:'grid',
          gridTemplateColumns:'1fr auto 1fr',
          gap:24,
          alignItems:'center',
          marginBottom:24
        }}
      >
        {/* OPP side */}
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:14, opacity:.7, marginBottom:6}}>Opp</div>
          <div style={{fontSize:64, fontWeight:800, lineHeight:1}}>{scoreOpp}</div>
          <div style={{fontSize:12, opacity:.7, marginTop:6}}>Real Pts: {realOpp}</div>
        </div>

        {/* Center info */}
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:12, opacity:.7, marginBottom:4}}>Serving</div>
          <div
            style={{
              fontSize:14,
              fontWeight:700,
              padding:'6px 10px',
              borderRadius:999,
              background: serving === 'my' ? '#d0ebff' : '#ffe3e3',
              border:'1px solid rgba(0,0,0,.06)'
            }}
          >
            {serving === 'my' ? 'My' : 'Opp'}
          </div>
          <div style={{fontSize:12, opacity:.7, marginTop:8}}>Rotation: Z{rotation}</div>
        </div>

        {/* MY side */}
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:14, opacity:.7, marginBottom:6}}>My</div>
          <div style={{fontSize:64, fontWeight:800, lineHeight:1}}>{scoreMy}</div>
          <div style={{fontSize:12, opacity:.7, marginTop:6}}>Real Pts: {realMy}</div>
        </div>
      </section>

      {/* Buttons */}
      <section style={{display:'flex', gap:12, justifyContent:'center', marginBottom:12}}>
        <button
          onClick={() => pointMy()}
          style={{
            padding:'14px 18px',
            borderRadius:10,
            border:'1px solid #d0d7de',
            background:'#0d6efd',
            color:'#fff',
            fontWeight:700,
            cursor:'pointer'
          }}
        >
          My +1
        </button>

        <button
          onClick={() => pointOpp()}
          style={{
            padding:'14px 18px',
            borderRadius:10,
            border:'1px solid #d0d7de',
            background:'#dc3545',
            color:'#fff',
            fontWeight:700,
            cursor:'pointer'
          }}
        >
          Opp +1
        </button>
      </section>

      {/* Utility row */}
      <section style={{display:'flex', gap:12, justifyContent:'center'}}>
        <button
          onClick={() => undo()}
          style={{padding:'10px 14px', borderRadius:8, border:'1px solid #d0d7de', background:'#fff', cursor:'pointer'}}
        >
          Undo
        </button>
        <button
          onClick={() => resetSet()}
          style={{padding:'10px 14px', borderRadius:8, border:'1px solid #d0d7de', background:'#fff', cursor:'pointer'}}
        >
          Reset Set
        </button>
      </section>

      {/* Tiny debug/help */}
      <div style={{marginTop:18, fontSize:12, opacity:.6, textAlign:'center'}}>
        Real points = points won while serving.
      </div>
    </main>
  )
}
