'use client'

import Link from 'next/link'
import React from 'react'

export default function HomePage() {
  return (
    <main style={{padding:'24px', maxWidth:960, margin:'0 auto'}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <h1 style={{margin:0}}>Get Ahead Stay Ahead</h1>
        <div style={{fontSize:12, opacity:.7}}>Win More, Intelligently</div>
      </header>

      <section
        style={{
          display:'grid',
          gridTemplateColumns:'repeat(2, minmax(0,1fr))',
          gap:16,
          marginBottom:20
        }}
      >
        <Link
          href="/setup"
          style={{
            display:'block', padding:'16px', borderRadius:12, border:'1px solid #e5e7eb',
            background:'#fff', textDecoration:'none'
          }}
        >
          <h3 style={{margin:'0 0 6px'}}>Setup</h3>
          <div style={{opacity:.75, fontSize:14}}>Team names, rotation convention, scoreboard side.</div>
        </Link>

        <Link
          href="/live"
          style={{
            display:'block', padding:'16px', borderRadius:12, border:'1px solid #e5e7eb',
            background:'#fff', textDecoration:'none'
          }}
        >
          <h3 style={{margin:'0 0 6px'}}>Live</h3>
          <div style={{opacity:.75, fontSize:14}}>
            Score, Real Points, Win Probability, Recent Plays. Buttons flip with side.
          </div>
        </Link>

        <Link
          href="/summary"
          style={{
            display:'block', padding:'16px', borderRadius:12, border:'1px solid #e5e7eb',
            background:'#fff', textDecoration:'none'
          }}
        >
          <h3 style={{margin:'0 0 6px'}}>Summary</h3>
          <div style={{opacity:.75, fontSize:14}}>
            Set recap and stats (per set). Great after each set/match.
          </div>
        </Link>

        <Link
          href="/season"
          style={{
            display:'block', padding:'16px', borderRadius:12, border:'1px solid #e5e7eb',
            background:'#fff', textDecoration:'none'
          }}
        >
          <h3 style={{margin:'0 0 6px'}}>Season</h3>
          <div style={{opacity:.75, fontSize:14}}>
            Accumulate sets (25 & 15), view season PS/SO by rotation, and get lineup
            recommendations by laps + extras (serve/receive).
          </div>
        </Link>
      </section>

      <footer style={{fontSize:12, opacity:.6}}>
        Tip: use <code>Vercel</code> for instant deploys from GitHub. Changes go live after each push.
      </footer>
    </main>
  )
}
