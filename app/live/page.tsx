'use client'

import React from 'react'
import Link from 'next/link'
import { useMatchStore } from '@/store/useMatchStore'

// ---- Real Points helper (matches rally shape in your store) ----
type Rally = {
  id?: string
  rallyNumber: number
  winner: 'my' | 'opp'
  servingTeamAtStart: 'my' | 'opp'
  myRotationAtStart: 1|2|3|4|5|6
}
function computeRealPoints(rallies: Rally[]) {
  let my = 0, opp = 0
  for (const r of rallies) {
    if (r.winner === 'my'  && r.servingTeamAtStart === 'my')  my++
    if (r.winner === 'opp' && r.servingTeamAtStart === 'opp') opp++
  }
  return { my, opp }
}
// ----------------------------------------------------------------

// ---- Neutral win-probability (DP with deuce) ----
// p(a,b,target): chance my team wins the set from score (a,b), win by 2
function winProb(a:number, b:number, target:number, memo: Map<string, number>): number {
  // set over if someone hit target with 2+ lead
  if (a >= target && a - b >= 2) return 1
  if (b >= target && b - a >= 2) return 0
  // deuce tail approximation: once both reach target-1, treat deuce as fair with small bias to leader
  if (a >= target - 1 && b >= target - 1) {
    const lead = a - b
    if (lead === 0) return 0.5
    return lead > 0 ? 0.75 : 0.25
  }
  const key = `${a},${b},${target}`
  if (memo.has(key)) return memo.get(key)!
  // neutral rally model (no sideout bias here): next rally 50/50
  const p = 0.5 * (winProb(a + 1, b, target, memo) + winProb(a, b + 1, target, memo))
  memo.set(key, p)
  return p
}
// Convenience wrapper returning current p, and p if next rally is W/L
function winProbNow(a:number, b:number, target:number){
  const memo = new Map<string, number>()
  const p = winProb(a,b,target,memo)
  const pIfWin = winProb(a+1,b,target,memo)
  const pIfLose = winProb(a,b+1,target,memo)
  return { p, pIfWin, pIfLose }
}
// ----------------------------------------------------------------

export default function LivePage() {
  // ===== Select from store (keys match earlier builds) =====
  const side         = useMatchStore(s => (s as any).side ?? 'left') as 'left' | 'right'
  const myName       = useMatchStore(s => (s as any).myName ?? 'My Team')
  const oppName      = useMatchStore(s => (s as any).oppName ?? 'Opponent')
  const scoreMy      = useMatchStore(s => (s as any).scoreMy ?? 0)
  const scoreOpp     = useMatchStore(s => (s as any).scoreOpp ?? 0)
  const currentRot   = useMatchStore(s => (s as any).currentRotation ?? 1)
  const servingTeam  = useMatchStore(s => (s as any).servingTeam ?? 'my') as 'my' | 'opp'
  const rallies      = useMatchStore(s => (s as any).rallies ?? []) as Rally[]
  const targetPoints = useMatchStore(s => (s as any).targetPoints ?? 25)

  const commitRally  = useMatchStore(s => (s as any).commitRally as (w:'my'|'opp')=>void)
  const undoLast     = useMatchStore(s => (s as any).undoLast ?? (()=>{}))
  const excludeLast  = useMatchStore(s => (s as any).excludeLastForStats ?? (()=>{}))
  const resetSet     = useMatchStore(s => (s as any).resetSet ?? (()=>{}))
  const endSet       = useMatchStore(s => (s as any).endSetAndStartNext ?? (()=>{}))
  // =========================================================

  const { my: realMy, opp: realOpp } = computeRealPoints(rallies)

  // Scoreboard left/right based on Setup “Scoreboard Side”
  const leftIsMy   = side === 'left'
  const leftName   = leftIsMy ? myName : oppName
  const rightName  = leftIsMy ? oppName : myName
  const leftScore  = leftIsMy ? scoreMy : scoreOpp
  const rightScore = leftIsMy ? scoreOpp : scoreMy
  const leftReal   = leftIsMy ? realMy : realOpp
  const rightReal  = leftIsMy ? realOpp : realMy

  // Recent plays (last 8, newest first)
  const recent = [...rallies].slice(-8).reverse()

  // Optional: Win Probability panel toggle
  const [showWP, setShowWP] = React.useState(true)
  const { p, pIfWin, pIfLose } = winProbNow(scoreMy, scoreOpp, targetPoints)
  const pct = (x:number)=> (x*100).toFixed(1) + '%'
  const delta = (a:number,b:number)=> {
    const d = (a-b)*100
    const s = d >= 0 ? '+' : ''
    return `${s}${d.toFixed(1)}%`
  }

  return (
    <main style={{padding:'20px', maxWidth:1100, margin:'0 auto'}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <h1 style={{margin:0}}>Live</h1>
        <nav style={{display:'flex', gap:12}}>
          <Link href="/setup">← Setup</Link>
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
          marginBottom:20
        }}
      >
        {/* LEFT */}
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:14, opacity:.7, marginBottom:6}}>{leftName}</div>
          <div style={{fontSize:64, fontWeight:800, lineHeight:1}}>{leftScore}</div>
          <div style={{fontSize:12, opacity:.7, marginTop:6}}>Real Pts: {leftReal}</div>
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
              background: servingTeam === 'my' ? '#d1fae5' : '#fee2e2',
              border:'1px solid rgba(0,0,0,.06)',
              display:'inline-block',
              minWidth:90
            }}
          >
            {servingTeam === 'my' ? myName : oppName}
          </div>
          <div style={{fontSize:12, opacity:.7, marginTop:8}}>Zone: Z{currentRot}</div>
        </div>

        {/* RIGHT */}
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:14, opacity:.7, marginBottom:6}}>{rightName}</div>
          <div style={{fontSize:64, fontWeight:800, lineHeight:1}}>{rightScore}</div>
          <div style={{fontSize:12, opacity:.7, marginTop:6}}>Real Pts: {rightReal}</div>
        </div>
      </section>

      {/* Buttons */}
      <section style={{display:'flex', gap:12, justifyContent:'center', marginBottom:12, flexWrap:'wrap'}}>
        <button
          onClick={() => commitRally('my')}
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
          {myName} +1
        </button>

        <button
          onClick={() => commitRally('opp')}
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
          {oppName} +1
        </button>
      </section>

      {/* Utility row */}
      <section style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
        <button onClick={() => undoLast()}   style={{padding:'10px 14px', borderRadius:8, border:'1px solid #d0d7de', background:'#fff', cursor:'pointer'}}>Undo Last</button>
        <button onClick={() => excludeLast()} style={{padding:'10px 14px', borderRadius:8, border:'1px solid #d0d7de', background:'#fff', cursor:'pointer'}}>Exclude Last (stats)</button>
        <button onClick={() => resetSet()}   style={{padding:'10px 14px', borderRadius:8, border:'1px solid #d0d7de', background:'#fff', cursor:'pointer'}}>Reset Set</button>
        <button onClick={() => endSet()}     style={{padding:'10px 14px', borderRadius:8, border:'1px solid #1d4ed8', background:'#1d4ed8', color:'#fff', cursor:'pointer'}}>End Set → Next</button>
      </section>

      {/* Win Probability (optional) */}
      <section style={{marginTop:20}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <input id="wp-toggle" type="checkbox" checked={showWP} onChange={()=>setShowWP(v=>!v)} />
          <label htmlFor="wp-toggle" style={{userSelect:'none'}}>Show Win Probability</label>
        </div>
        {showWP && (
          <div style={{
            marginTop:10, display:'grid', gap:8,
            gridTemplateColumns:'repeat(3, minmax(0,1fr))'
          }}>
            <div style={{border:'1px solid #e5e7eb', borderRadius:10, padding:'10px', background:'#fff'}}>
              <div style={{fontSize:12, opacity:.7}}>Now</div>
              <div style={{fontSize:22, fontWeight:800}}>{pct(p)}</div>
            </div>
            <div style={{border:'1px solid #e5e7eb', borderRadius:10, padding:'10px', background:'#fff'}}>
              <div style={{fontSize:12, opacity:.7}}>If we win next rally</div>
              <div style={{fontSize:22, fontWeight:800}}>{pct(pIfWin)}</div>
              <div style={{fontSize:12, opacity:.7, marginTop:4}}>Δ {delta(pIfWin, p)}</div>
            </div>
            <div style={{border:'1px solid #e5e7eb', borderRadius:10, padding:'10px', background:'#fff'}}>
              <div style={{fontSize:12, opacity:.7}}>If we lose next rally</div>
              <div style={{fontSize:22, fontWeight:800}}>{pct(pIfLose)}</div>
              <div style={{fontSize:12, opacity:.7, marginTop:4}}>Δ {delta(pIfLose, p)}</div>
            </div>
          </div>
        )}
        <div style={{marginTop:8, fontSize:11, opacity:.55}}>
          Neutral-rally model (no sideout bias). Uses deuce approximation for long tails; we can swap in a PS/SO-aware model later.
        </div>
      </section>

      {/* Recent Plays */}
      <section style={{marginTop:24}}>
        <h3 style={{margin:'8px 0'}}>Recent Plays</h3>
        {recent.length === 0 ? (
          <div style={{fontSize:13, opacity:.7}}>No rallies yet.</div>
        ) : (
          <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:8}}>
            {recent.map(r => {
              const whoWon = r.winner === 'my' ? myName : oppName
              const serveTxt = r.servingTeamAtStart === 'my' ? `${myName} serve` : `${oppName} serve`
              const zoneTxt = `Z${r.myRotationAtStart}`
              const badgeColor = r.winner === 'my' ? '#dcfce7' : '#fee2e2'
              const badgeText  = r.winner === 'my' ? 'MY POINT' : 'OPP POINT'
              return (
                <li key={r.id ?? r.rallyNumber}
                    style={{
                      display:'grid',
                      gridTemplateColumns:'64px 1fr auto',
                      alignItems:'center',
                      gap:12,
                      border:'1px solid #e5e7eb',
                      borderRadius:10,
                      padding:'8px 10px',
                      background:'#fff'
                    }}>
                  <div style={{fontSize:12, opacity:.6}}>#{r.rallyNumber}</div>
                  <div style={{fontSize:14}}>
                    <span style={{padding:'2px 8px', background:badgeColor, borderRadius:999, marginRight:8, fontSize:12}}>
                      {badgeText}
                    </span>
                    <span style={{opacity:.8}}>{whoWon}</span>
                    <span style={{opacity:.6}}> • {serveTxt}</span>
                  </div>
                  <div style={{fontSize:12, opacity:.7}}>Zone: {zoneTxt}</div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div style={{marginTop:18, fontSize:12, opacity:.6, textAlign:'center'}}>
        Real points = points won while serving.
      </div>
    </main>
  )
}
