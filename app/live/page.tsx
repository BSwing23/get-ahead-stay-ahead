'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useMatchStore, summarizeForSeason } from '@/store/useMatchStore'
import { useSeasonStore, TargetKind } from '@/store/useSeasonStore'

export default function LivePage(){
  const router = useRouter()

  const rallies = useMatchStore(s=>s.rallies)
  const addRally = useMatchStore(s=>s.addRally)
  const resetSet = useMatchStore(s=>s.resetSet)

  const addSetToSeason = useSeasonStore(s=>s.addSet)

  // simple live scores for display
  const scoreMy  = rallies.filter(r=>r.winner==='my').length
  const scoreOpp = rallies.length - scoreMy

  // assume target 25 by default; switch to 15 when user selects deciding set in Setup later
  const [target, setTarget] = React.useState<TargetKind>(25)

  const onMyPoint = ()=>{
    // you already keep rotation/serving in store; here’s a minimal rally object
    addRally({ winner:'my', myRot: nextMyRot(), oppRot: nextOppRot(), servedBy: whoServed() })
  }
  const onOppPoint = ()=>{
    addRally({ winner:'opp', myRot: nextMyRot(), oppRot: nextOppRot(), servedBy: whoServed() })
  }

  // TODO: replace these with your real selectors
  const nextMyRot  = ()=> 1 as const
  const nextOppRot = ()=> 1 as const
  const whoServed  = ()=> 'my' as const

  const endSet = ()=>{
    // 1) package current set for Season
    const payload = summarizeForSeason(target, rallies)
    addSetToSeason(payload)

    // 2) reset for next set
    resetSet()

    // 3) go to Season so you can see it land
    router.push('/season')
  }

  return (
    <main style={{padding:'20px', maxWidth:1100, margin:'0 auto'}}>
      <div style={{display:'flex', gap:12, justifyContent:'flex-end', marginBottom:8}}>
        <a href="/setup">Setup</a>
        <a href="/live" style={{fontWeight:700}}>Live</a>
        <a href="/summary">Summary</a>
        <a href="/season">Season</a>
      </div>

      <h1 style={{marginTop:0}}>Live</h1>

      <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:16, alignItems:'center', marginTop:12}}>
        <div style={{textAlign:'center'}}>
          <div style={{opacity:.7}}>Opp</div>
          <div style={{fontSize:48, fontWeight:800}}>{scoreOpp}</div>
        </div>

        <div style={{display:'flex', gap:12}}>
          <button onClick={onMyPoint}  style={btn('blue')}>My +1</button>
          <button onClick={onOppPoint} style={btn('red')}>Opp +1</button>
        </div>

        <div style={{textAlign:'center'}}>
          <div style={{opacity:.7}}>My</div>
          <div style={{fontSize:48, fontWeight:800}}>{scoreMy}</div>
        </div>
      </div>

      <div style={{display:'flex', gap:12, marginTop:16}}>
        <select value={target} onChange={e=>setTarget(parseInt(e.target.value) as TargetKind)}>
          <option value={25}>25-point set</option>
          <option value={15}>15-point set</option>
        </select>

        <button onClick={endSet} style={btn('gray')}>End Set → Season</button>
      </div>
    </main>
  )
}

function btn(kind:'blue'|'red'|'gray'){
  const base = { padding:'12px 16px', borderRadius:10, border:'1px solid', cursor:'pointer', fontWeight:700 } as React.CSSProperties
  if (kind==='blue') return { ...base, background:'#1d4ed8', borderColor:'#1d4ed8', color:'#fff' }
  if (kind==='red')  return { ...base, background:'#dc2626', borderColor:'#dc2626', color:'#fff' }
  return { ...base, background:'#e5e7eb', borderColor:'#d1d5db', color:'#111827' }
}
