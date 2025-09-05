'use client'

import React from 'react'
import { useMatchStore, Convention, Side, StartIn, Rot } from '@/store/useMatchStore'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
]

export default function SetupPage(){
  const {
    lang, setLang,
    convention, setConvention,
    side, setSide,
    myName, oppName, setMyName, setOppName,
    startRotationMy, setStartRotation,
    startIn, setStartIn,
  } = useMatchStore()

  return (
    <main style={{padding:'20px', maxWidth:1100, margin:'0 auto'}}>
      <div style={{display:'flex', gap:12, justifyContent:'flex-end', marginBottom:8}}>
        <a href="/setup" style={{fontWeight:700}}>Setup</a>
        <a href="/live">Live</a>
        <a href="/summary">Summary</a>
        <a href="/season">Season</a>
      </div>

      <h1 style={{marginTop:0}}>Setup</h1>

      {/* Language */}
      <section className="card" style={card}>
        <h3>Language</h3>
        <select value={lang} onChange={e=>setLang(e.target.value)} style={input}>
          {LANGS.map(l=> <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </section>

      {/* Names */}
      <section className="card" style={card}>
        <h3>Team Names</h3>
        <div style={row}>
          <label style={label}>My team</label>
          <input value={myName} onChange={e=>setMyName(e.target.value)} style={input} />
        </div>
        <div style={row}>
          <label style={label}>Opponent</label>
          <input value={oppName} onChange={e=>setOppName(e.target.value)} style={input} />
        </div>
      </section>

      {/* Convention / Side */}
      <section className="card" style={card}>
        <h3>Display</h3>
        <div style={row}>
          <label style={label}>Rotation convention</label>
          <select value={convention} onChange={e=>setConvention(e.target.value as Convention)} style={input}>
            <option value="american">American (1–6)</option>
            <option value="international">International (Z1–Z6)</option>
          </select>
        </div>
        <div style={row}>
          <label style={label}>Scoreboard side</label>
          <select value={side} onChange={e=>setSide(e.target.value as Side)} style={input}>
            <option value="left">My score on Left</option>
            <option value="right">My score on Right</option>
          </select>
        </div>
      </section>

      {/* Start settings */}
      <section className="card" style={card}>
        <h3>Starting Settings</h3>
        <div style={row}>
          <label style={label}>Start in</label>
          <select value={startIn} onChange={e=>setStartIn(e.target.value as StartIn)} style={input}>
            <option value="serve">Serving</option>
            <option value="receive">Receiving</option>
          </select>
        </div>
        <div style={row}>
          <label style={label}>My starting rotation</label>
          <select value={startRotationMy} onChange={e=>setStartRotation(parseInt(e.target.value) as Rot)} style={input}>
            <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
            <option value={4}>4</option><option value={5}>5</option><option value={6}>6</option>
          </select>
        </div>
      </section>
    </main>
  )
}

/* quick inline styles */
const card: React.CSSProperties = { padding:'16px', border:'1px solid #e5e7eb', borderRadius:12, marginTop:16 }
const row: React.CSSProperties = { display:'grid', gridTemplateColumns:'180px 1fr', gap:12, alignItems:'center', marginTop:8 }
const label: React.CSSProperties = { opacity:.8 }
const input: React.CSSProperties = { padding:'8px 10px', border:'1px solid #d1d5db', borderRadius:8 }
