'use client'

import React from 'react'
import Link from 'next/link'
import { useSeasonStore, Rot, TargetKind } from '@/store/useSeasonStore'

export default function SeasonPage(){
  const bank25 = useSeasonStore(s=>s.bank25)
  const bank15 = useSeasonStore(s=>s.bank15)
  const addSet = useSeasonStore(s=>s.addSet)
  const clear  = useSeasonStore(s=>s.clearSeason)
  const bestStart = useSeasonStore(s=>s.bestStart)
  const avgLE = useSeasonStore(s=>s.avgLapsExtras)
  const averages = useSeasonStore(s=>s.averages)

  const [target, setTarget] = React.useState<TargetKind>(25)
  const [laps, setLaps] = React.useState<number>(2)
  const [extras, setExtras] = React.useState<number>(0)
  const [mode, setMode] = React.useState<'serve'|'receive'>('receive')
  const [ps, setPs] = React.useState<Record<Rot, number>>({1:0,2:0,3:0,4:0,5:0,6:0})
  const [so, setSo] = React.useState<Record<Rot, number>>({1:0,2:0,3:0,4:0,5:0,6:0})

  const fmt = (x:number)=> (x*100).toFixed(1)+'%'

  const addNow = ()=>{
    addSet({ target, laps, extras, ps, so })
    const { laps:dl, extras:de } = avgLE(target)
    setLaps(dl); setExtras(de)
    alert('Set added to season.')
  }
  const useSeasonAvg = ()=>{
    const { laps:dl, extras:de } = avgLE(target)
    setLaps(dl); setExtras(de)
  }

  const rec = bestStart(target, mode, laps, extras)

  return (
    <main style={{padding:'20px', maxWidth:1100, margin:'0 auto'}}>
      <h1 style={{marginTop:0}}>Season</h1>

      <section style={{border:'1px solid #e5e7eb', borderRadius:12, padding:16, marginBottom:16, background:'#fff'}}>
        <h3 style={{marginTop:0}}>Add a Set to Season</h3>
        <div style={{display:'grid', gap:12, gridTemplateColumns:'repeat(4, minmax(0,1fr))'}}>
          <div>
            <label>Target</label>
            <select value={target} onChange={e=>setTarget(parseInt(e.target.value) as TargetKind)}>
              <option value={25}>25-point</option>
              <option value={15}>15-point</option>
            </select>
          </div>
          <div>
            <label>Laps</label>
            <input type="number" min={1} max={10} value={laps} onChange={e=>setLaps(parseInt(e.target.value)||1)} />
          </div>
          <div>
            <label>Extras</label>
            <input type="number" min={0} max={5} value={extras} onChange={e=>setExtras(parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label>Mode for Recommendation</label>
            <select value={mode} onChange={e=>setMode(e.target.value as any)}>
              <option value="receive">Receiving First</option>
              <option value="serve">Serving First</option>
            </select>
          </div>
        </div>

        {/* PS/SO grid */}
        <div style={{marginTop:12}}>
          <div style={{fontWeight:700, marginBottom:6}}>PS% / SO% by Rotation (decimals like 0.56)</div>
          <div style={{display:'grid', gap:8, gridTemplateColumns:'repeat(7, minmax(0,1fr))', alignItems:'end'}}>
            <div style={{fontSize:12, opacity:.7}}>Rot</div>
            {[1,2,3,4,5,6].map(r=><div key={'h'+r} style={{textAlign:'center', fontWeight:700}}>{r}</div>)}
            <div style={{fontSize:12, opacity:.7}}>PS</div>
            {[1,2,3,4,5,6].map((r:Rot)=>
              <input key={'ps'+r} type="number" step="0.001" min="0" max="1"
                     value={ps[r]} onChange={e=>setPs({...ps, [r]: parseFloat(e.target.value)||0})} />
            )}
            <div style={{fontSize:12, opacity:.7}}>SO</div>
            {[1,2,3,4,5,6].map((r:Rot)=>
              <input key={'so'+r} type="number" step="0.001" min="0" max="1"
                     value={so[r]} onChange={e=>setSo({...so, [r]: parseFloat(e.target.value)||0})} />
            )}
          </div>
        </div>

        <div style={{display:'flex', gap:12, marginTop:12, flexWrap:'wrap'}}>
          <button onClick={addNow} style={{padding:'10px 14px', borderRadius:8, border:'1px solid #1d4ed8', background:'#1d4ed8', color:'#fff', cursor:'pointer'}}>Add Set to Season</button>
          <button onClick={useSeasonAvg} style={{padding:'10px 14px', borderRadius:8, border:'1px solid #d0d7de', background:'#fff', cursor:'pointer'}}>Use Season Avg Laps/Extras</button>
          <button onClick={()=>clear()} style={{padding:'10px 14px', borderRadius:8, border:'1px solid #ef4444', background:'#ef4444', color:'#fff', cursor:'pointer'}}>Clear Season</button>
        </div>
      </section>

      {/* Recommendation */}
      <section style={{border:'1px solid #e5e7eb', borderRadius:12, padding:16, background:'#fff'}}>
        <h3 style={{marginTop:0}}>Recommend Start (Season Averages)</h3>
        <div style={{display:'grid', gap:12, gridTemplateColumns:'repeat(4, minmax(0,1fr))'}}>
          <div>
            <label>Target</label>
            <select value={target} onChange={e=>setTarget(parseInt(e.target.value) as TargetKind)}>
              <option value={25}>25-point</option>
              <option value={15}>15-point</option>
            </select>
          </div>
          <div>
            <label>Laps</label>
            <input type="number" min={1} max={10} value={laps} onChange={e=>setLaps(parseInt(e.target.value)||1)} />
          </div>
          <div>
            <label>Extras</label>
            <input type="number" min={0} max={5} value={extras} onChange={e=>setExtras(parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label>Mode</label>
            <select value={mode} onChange={e=>setMode(e.target.value as any)}>
              <option value="receive">Receiving First</option>
              <option value="serve">Serving First</option>
            </select>
          </div>
        </div>

        <div style={{marginTop:12, fontSize:16}}>
          <b>Best start ({mode}) → Rotation {bestStart(target, mode, laps, extras).rot}</b>
          <span style={{opacity:.7}}> (total {bestStart(target, mode, laps, extras).total.toFixed(3)})</span>
        </div>
      </section>

      {/* Snapshot */}
      <section style={{marginTop:16, border:'1px solid #e5e7eb', borderRadius:12, padding:16, background:'#fff'}}>
        <h3 style={{marginTop:0}}>Season Snapshot</h3>
        <div style={{display:'grid', gap:16, gridTemplateColumns:'repeat(2, minmax(0,1fr))'}}>
          <Snapshot title="25-point sets" bank="25" />
          <Snapshot title="15-point sets" bank="15" />
        </div>
      </section>
    </main>
  )
}

function Snapshot({ title, bank }:{ title:string, bank:'25'|'15'}) {
  const averages = useSeasonStore(s=>s.averages)
  const avgLE = useSeasonStore(s=>s.avgLapsExtras)
  const targ = bank==='25' ? 25 : 15
  const ps = averages(targ).ps
  const so = averages(targ).so
  const fmt = (x:number)=> (x*100).toFixed(1)+'%'
  const sets = useSeasonStore(s=> bank==='25' ? s.bank25.sets : s.bank15.sets)
  const le = avgLE(targ)

  return (
    <div>
      <h4>{title}</h4>
      <div>Sets: {sets}</div>
      <div>Avg laps/extras: {le.laps} / {le.extras}</div>
      <div style={{marginTop:8}}>
        <div style={{fontSize:12, opacity:.7}}>Avg PS/SO by rotation</div>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead><tr><th>Rot</th><th>PS</th><th>SO</th></tr></thead>
          <tbody>
            {[1,2,3,4,5,6].map((r:Rot)=>
              <tr key={bank+r}><td>{r}</td><td>{fmt(ps[r])}</td><td>{fmt(so[r])}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
