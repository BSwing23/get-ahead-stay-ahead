'use client'

import React from 'react'
import Link from 'next/link'
import useMatchStore from '@/store/useMatchStore' // default hook export

// Local, lightweight unions to keep TS happy without depending on store type exports
type LCode = 'en' | 'es'
type Conv = 'usa' | 'fivb'
type Start = 'serve' | 'receive'
type SideT = 'left' | 'right'
type Rot = 1 | 2 | 3 | 4 | 5 | 6

const LANGS: { code: LCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

const inputStyle: React.CSSProperties = {
  padding: 8,
  border: '1px solid #ddd',
  borderRadius: 8,
  width: '100%',
}

const card: React.CSSProperties = {
  padding: 16,
  border: '1px solid #eee',
  borderRadius: 12,
  marginBottom: 16,
}

export default function SetupPage() {
  const s = useMatchStore()

  // Safe helpers (avoid strict cross-file types)
  const setLang = (v: LCode) => s.setLang?.(v)
  const setConvention = (v: Conv) => s.setConvention?.(v)
  const setSide = (v: SideT) => s.setSide?.(v)
  const setStartIn = (v: Start) => s.setStartIn?.(v)
  const setStartRotation = (v: Rot) => s.setStartRotation?.(v)
  const setMyName = (v: string) => s.setMyName?.(v)
  const setOppName = (v: string) => s.setOppName?.(v)

  const toggleSide = () => {
    const next: SideT = (s.side === 'left' ? 'right' : 'left') as SideT
    setSide?.(next)
  }

  const toggleStartIn = () => {
    const next: Start = (s.startIn === 'receive' ? 'serve' : 'receive') as Start
    setStartIn?.(next)
  }

  const nextRot = () => {
    const r = (Number(s.startRotationMy ?? 1) as Rot)
    const nxt = (((r % 6) + 1) as Rot)
    setStartRotation?.(nxt)
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      {/* Top nav */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link href="/setup">Setup</Link>
        <Link href="/live">Live</Link>
        <Link href="/summary">Summary</Link>
        <Link href="/season">Season</Link>
      </div>

      {/* Language */}
      <section className="card" style={card}>
        <h3>Language</h3>
        <select
          value={(s.lang as LCode) ?? 'en'}
          onChange={(e) => setLang?.(e.target.value as LCode)}
          style={inputStyle}
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </section>

      {/* Team names */}
      <section className="card" style={card}>
        <h3>Team Names</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>My team</label>
            <input
              style={inputStyle}
              value={s.myName ?? ''}
              onChange={(e) => setMyName?.(e.target.value)}
              placeholder="e.g., Tigers"
            />
          </div>
          <div>
            <label>Opponent</label>
            <input
              style={inputStyle}
              value={s.oppName ?? ''}
              onChange={(e) => setOppName?.(e.target.value)}
              placeholder="e.g., Wolves"
            />
          </div>
        </div>
      </section>

      {/* Convention */}
      <section className="card" style={card}>
        <h3>Convention</h3>
        <select
          value={(s.convention as Conv) ?? 'usa'}
          onChange={(e) => setConvention?.(e.target.value as Conv)}
          style={inputStyle}
        >
          <option value="usa">USA</option>
          <option value="fivb">FIVB</option>
        </select>
      </section>

      {/* Side / StartIn */}
      <section className="card" style={card}>
        <h3>Layout & Start</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={toggleSide} style={inputStyle as React.CSSProperties}>
            Side: {(s.side as SideT) ?? 'left'} (tap to flip)
          </button>
          <button onClick={toggleStartIn} style={inputStyle as React.CSSProperties}>
            Start: {(s.startIn as Start) ?? 'receive'} (tap to toggle)
          </button>
        </div>
      </section>

      {/* Start rotation */}
      <section className="card" style={card}>
        <h3>My Start Rotation</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6].map((r) => (
            <button
              key={r}
              onClick={() => setStartRotation?.(r as Rot)}
              style={{
                padding: 10,
                border: '1px solid #ddd',
                borderRadius: 8,
                background: String(s.startRotationMy ?? 1) === String(r) ? '#def' : '#fff',
                minWidth: 48,
              }}
            >
              Z{r}
            </button>
          ))}
          <button onClick={nextRot} style={{ ...inputStyle, width: 'auto' }}>
            Next
          </button>
        </div>
      </section>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <Link href="/live" className="btn">
          Go Live →
        </Link>
        <Link href="/summary" className="btn">
          Summary →
        </Link>
        <Link href="/season" className="btn">
          Season →
        </Link>
      </div>
    </div>
  )
}
