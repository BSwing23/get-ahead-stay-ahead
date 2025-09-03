
'use client'
import { useMatchStore } from '@/store/useMatchStore'
import { t } from '@/lib/i18n'
import Link from 'next/link'

export default function LivePage(){
  const s = useMatchStore()
  const leftIsMy = s.side === 'left'
  const labelLeft = leftIsMy ? s.myName : s.oppName
  const labelRight = leftIsMy ? s.oppName : s.myName
  const scoreLeft = leftIsMy ? s.scoreMy : s.scoreOpp
  const scoreRight = leftIsMy ? s.scoreOpp : s.scoreMy
  const commit = (w:'my'|'opp')=> s.commitRally(w)
  const zoneLabel = `Zone: ${s.convention==='International' ? `Z${s.currentRotation}` : s.currentRotation}`

  return (
    <main className="container col">
      <div className="row">
        <Link href="/setup" className="btn btn-ghost">← Setup</Link>
        <Link href="/summary" className="btn btn-ghost">Summary →</Link>
      </div>
      <h1>{t('live_title', s.lang)}</h1>

      <section className="card col">
        <div className="grid-2">
          <div className="col" style={{alignItems:'center'}}>
            <div>{t('live_actual_score', s.lang)}</div>
            <div style={{fontSize:48,fontWeight:800}}>{scoreLeft}</div>
            <div className="pill">{labelLeft}</div>
          </div>
          <div className="col" style={{alignItems:'center'}}>
            <div>{t('live_actual_score', s.lang)}</div>
            <div style={{fontSize:48,fontWeight:800}}>{scoreRight}</div>
            <div className="pill">{labelRight}</div>
          </div>
        </div>

        <div className="grid-2">
          {leftIsMy ? (
            <>
              <button className="btn btn-primary" onClick={()=>commit('my')}>{s.myName} +1</button>
              <button className="btn" onClick={()=>commit('opp')}>{s.oppName} +1</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={()=>commit('opp')}>{s.oppName} +1</button>
              <button className="btn btn-primary" onClick={()=>commit('my')}>{s.myName} +1</button>
            </>
          )}
        </div>

        <div className="row" style={{justifyContent:'center'}}>
          <button className="btn" onClick={s.undoLast}>Undo Last</button>
          <button className="btn" onClick={s.excludeLastForStats}>Exclude Last (stats only)</button>
        </div>

        <div className="row" style={{justifyContent:'center'}}>
          <div className="pill">{zoneLabel}</div>
          <div className="pill">Serving: {s.servingTeam==='my'? s.myName : s.oppName}</div>
          <button className="btn" onClick={()=>s.resetSet()}>Reset Set</button>
        </div>

        <div className="card">
          <div style={{fontWeight:600, marginBottom:8}}>Recent Rallies</div>
          <ul style={{listStyle:'none',padding:0,margin:0}}>
            {s.rallies.slice(-6).reverse().map(r=>(
              <li key={r.id} className="row" style={{justifyContent:'space-between'}}>
                <span>#{r.rallyNumber} — {r.winner==='my'?s.myName:s.oppName} {r.excludeFromStats?'(excluded)':''}</span>
                <button className="btn" onClick={()=>s.toggleExcludeById(r.id)}>{r.excludeFromStats?'Include':'Exclude'}</button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
