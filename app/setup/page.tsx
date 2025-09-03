
'use client'
import { useMatchStore } from '@/store/useMatchStore'
import { t } from '@/lib/i18n'
import Link from 'next/link'

const langs = ['en','es','fr','pt','pt-BR','it','de','ja','zh'] as const

export default function SetupPage(){
  const {
    lang, setLang, convention, setConvention, side, setSide,
    startRotationMy, setStartRotation, startIn, setStartIn,
    myName, oppName, setMyName, setOppName
  } = useMatchStore()
  const rotCaption = (n:number, conv:'International'|'American') => (conv==='International'?`Z${n}`:`${n}`)
  return (
    <main className="container col">
      <div className="row">
        <Link href="/" className="btn btn-ghost">← Home</Link>
      </div>
      <h1>{t('live_title', lang)}</h1>

      <section className="card col">
        <label>{t('setup_language', lang)}</label>
        <select value={lang} onChange={e=>setLang(e.target.value as any)}>
          {langs.map(code=> <option key={code} value={code}>{code}</option>)}
        </select>

        <label>{t('setup_convention', lang)}</label>
        <select value={convention} onChange={e=>setConvention(e.target.value as any)}>
          <option value="International">International</option>
          <option value="American">American</option>
        </select>

        <label>{t('setup_scoreboard_side', lang)}</label>
        <div className="row">
          <button className={"btn "+(side==='left'?'btn-primary':'btn-ghost')} onClick={()=>setSide('left')}>←</button>
          <button className={"btn "+(side==='right'?'btn-primary':'btn-ghost')} onClick={()=>setSide('right')}>→</button>
        </div>

        <label>{t('setup_my_name', lang)}</label>
        <input className="btn-ghost" style={{padding:'8px',borderRadius:8,border:'1px solid #e5e7eb'}} value={myName} onChange={e=>setMyName(e.target.value)} />

        <label>{t('setup_opp_name', lang)}</label>
        <input className="btn-ghost" style={{padding:'8px',borderRadius:8,border:'1px solid #e5e7eb'}} value={oppName} onChange={e=>setOppName(e.target.value)} />

        <label>{t('setup_start_rotation', lang)}</label>
        <select value={startRotationMy} onChange={e=>setStartRotation(parseInt(e.target.value) as any)}>
          {[1,2,3,4,5,6].map(n=> <option key={n} value={n}>{rotCaption(n, convention)}</option>)}
        </select>

        <label>{t('setup_first_serving', lang)}</label>
        <div className="row">
          <button className={"btn "+(startIn==='serve'?'btn-primary':'btn-ghost')} onClick={()=>setStartIn('serve')}>Serve</button>
          <button className={"btn "+(startIn==='receive'?'btn-primary':'btn-ghost')} onClick={()=>setStartIn('receive')}>Receive</button>
        </div>
      </section>

      <div className="row">
        <Link href="/live" className="btn btn-primary">Go to Live</Link>
        <Link href="/summary" className="btn btn-ghost">Summary</Link>
      </div>
    </main>
  )
}
