'use client'
import { create } from 'zustand'

export type Rot = 1|2|3|4|5|6
export type TargetKind = 25 | 15

type SetSummary = {
  target: TargetKind
  laps: number
  extras: number
  ps: Record<Rot, number>
  so: Record<Rot, number>
}
type SeasonAgg = {
  target: TargetKind
  psSum: Record<Rot, number>
  soSum: Record<Rot, number>
  psN:   Record<Rot, number>
  soN:   Record<Rot, number>
  sets:  number
  lapsList: number[]
  extrasList: number[]
}
type SeasonState = {
  bank25: SeasonAgg
  bank15: SeasonAgg
  addSet: (s:SetSummary)=>void
  clearSeason: ()=>void
  averages: (target: TargetKind) => { ps: Record<Rot, number>, so: Record<Rot, number> }
  scoreFor: (target: TargetKind, start: Rot, mode:'serve'|'receive', laps:number, extras:number) => number
  bestStart: (target: TargetKind, mode:'serve'|'receive', laps:number, extras:number) => { rot: Rot, total: number }
  avgLapsExtras: (target: TargetKind) => { laps:number, extras:number }
}

const emptyAgg = (target: TargetKind): SeasonAgg => ({
  target,
  psSum: {1:0,2:0,3:0,4:0,5:0,6:0},
  soSum: {1:0,2:0,3:0,4:0,5:0,6:0},
  psN:   {1:0,2:0,3:0,4:0,5:0,6:0},
  soN:   {1:0,2:0,3:0,4:0,5:0,6:0},
  sets:  0,
  lapsList: [],
  extrasList: []
})

const STORAGE_KEY = 'gasa-season-v1'
function load() {
  if (typeof window === 'undefined') return { bank25: emptyAgg(25), bank15: emptyAgg(15) }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { bank25: emptyAgg(25), bank15: emptyAgg(15) }
    const parsed = JSON.parse(raw)
    return {
      bank25: { ...emptyAgg(25), ...parsed.bank25 },
      bank15: { ...emptyAgg(15), ...parsed.bank15 },
    }
  } catch {
    return { bank25: emptyAgg(25), bank15: emptyAgg(15) }
  }
}
function save(state: { bank25: SeasonAgg, bank15: SeasonAgg }) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const useSeasonStore = create<SeasonState>((set, get) => ({
  ...load(),

  addSet: (summary) => {
    const bankKey = summary.target === 25 ? 'bank25' : 'bank15'
    const state = get() as any
    const bank: SeasonAgg = { ...state[bankKey] }

    ;([1,2,3,4,5,6] as Rot[]).forEach(r => {
      const p = summary.ps[r] ?? 0
      const s = summary.so[r] ?? 0
      if (!Number.isNaN(p)) { bank.psSum[r] += p; bank.psN[r] += 1 }
      if (!Number.isNaN(s)) { bank.soSum[r] += s; bank.soN[r] += 1 }
    })
    bank.sets += 1
    bank.lapsList = [...bank.lapsList, summary.laps]
    bank.extrasList = [...bank.extrasList, summary.extras]

    const next = summary.target === 25 ? { bank25: bank, bank15: get().bank15 } : { bank25: get().bank25, bank15: bank }
    save(next)
    set(next)
  },

  clearSeason: ()=>{
    const next = { bank25: emptyAgg(25), bank15: emptyAgg(15) }
    save(next)
    set(next)
  },

  averages: (target)=>{
    const bank = target === 25 ? get().bank25 : get().bank15
    const ps: Record<Rot, number> = {1:0,2:0,3:0,4:0,5:0,6:0}
    const so: Record<Rot, number> = {1:0,2:0,3:0,4:0,5:0,6:0}
    ;([1,2,3,4,5,6] as Rot[]).forEach(r=>{
      ps[r] = bank.psN[r] ? bank.psSum[r]/bank.psN[r] : 0
      so[r] = bank.soN[r] ? bank.soSum[r]/bank.soN[r] : 0
    })
    return { ps, so }
  },

  scoreFor: (target, start, mode, laps, extras)=>{
    const { ps, so } = get().averages(target)
    const seq: Rot[] = []
    for (let i=0;i<laps;i++) ([1,2,3,4,5,6] as Rot[]).forEach(k=>seq.push(k))
    for (let e=0;e<extras;e++) seq.push((e+1) as Rot)
    const idx = seq.findIndex(r=>r===start)
    const ord = idx>=0 ? [...seq.slice(idx), ...seq.slice(0,idx)] : seq
    let total = 0
    ord.forEach((rot, i) => {
      if (i===0) total += (mode==='receive' ? so[rot] : ps[rot])
      else total += ps[rot] + so[rot]
    })
    return total
  },

  bestStart: (target, mode, laps, extras)=>{
    let best = { rot: 1 as Rot, total: -1 }
    ;([1,2,3,4,5,6] as Rot[]).forEach(r=>{
      const t = get().scoreFor(target, r, mode, laps, extras)
      if (t > best.total) best = { rot: r, total: t }
    })
    return best
  },

  avgLapsExtras: (target)=>{
    const bank = target === 25 ? get().bank25 : get().bank15
    const laps = bank.lapsList.length ? (bank.lapsList.reduce((a,b)=>a+b,0)/bank.lapsList.length) : 2
    const extras = bank.extrasList.length ? Math.round(bank.extrasList.reduce((a,b)=>a+b,0)/bank.extrasList.length) : 0
    return { laps: Math.max(1, Math.round(laps)), extras }
  }
}))
