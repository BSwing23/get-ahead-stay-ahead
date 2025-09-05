import create from "zustand"

/** ===== Types ===== */
export type Winner = "my" | "opp"
export type Rot = 1|2|3|4|5|6
export type TargetKind = 25 | 15
export type Convention = "american" | "international"
export type Side = "left" | "right"
export type StartIn = "serve" | "receive"

export interface Rally {
  winner: Winner
  myRot: Rot
  oppRot: Rot
  servedBy: Winner
}

interface StatsByRot { serves:number; receives:number; sideouts:number; ps:number; so:number; }
interface MatchStats {
  byRot: Record<Rot, StatsByRot>
  laps: number
  extras: number
}

/** ===== Helpers ===== */
function emptyByRot(): Record<Rot, StatsByRot> {
  return {1:{serves:0,receives:0,sideouts:0,ps:0,so:0},
          2:{serves:0,receives:0,sideouts:0,ps:0,so:0},
          3:{serves:0,receives:0,sideouts:0,ps:0,so:0},
          4:{serves:0,receives:0,sideouts:0,ps:0,so:0},
          5:{serves:0,receives:0,sideouts:0,ps:0,so:0},
          6:{serves:0,receives:0,sideouts:0,ps:0,so:0}}
}

export function computeStats(rallies: Rally[]): MatchStats {
  const byRot = emptyByRot()
  let myLegs = 0
  let oppLegs = 0

  for (const r of rallies) {
    const rot: Rot = r.myRot
    if (r.servedBy === "my") {
      byRot[rot].serves++
      if (r.winner === "my") { byRot[rot].ps++; myLegs++ }
      else { byRot[rot].sideouts++; oppLegs++ }
    } else {
      byRot[rot].receives++
      if (r.winner === "my") { byRot[rot].sideouts++; myLegs++ }
      else { byRot[rot].so++; oppLegs++ }
    }
  }

  (Object.keys(byRot) as unknown as Rot[]).forEach(rot=>{
    const x = byRot[rot]
    x.ps = x.serves   ? x.ps / x.serves       : 0
    x.so = x.receives ? x.sideouts / x.receives : 0
  })

  const laps = Math.min(myLegs, oppLegs)
  const extras = Math.abs(myLegs - oppLegs)
  return { byRot, laps, extras }
}

export function summarizeForSeason(target: TargetKind, rallies: Rally[]) {
  const { byRot, laps, extras } = computeStats(rallies)
  const ps: Record<Rot, number> = {1:0,2:0,3:0,4:0,5:0,6:0}
  const so: Record<Rot, number> = {1:0,2:0,3:0,4:0,5:0,6:0}
  (Object.keys(byRot) as unknown as Rot[]).forEach(rot=>{
    ps[rot] = byRot[rot].ps
    so[rot] = byRot[rot].so
  })
  return { target, laps, extras, ps, so }
}

/** ===== Store ===== */
interface MatchState {
  // live match
  rallies: Rally[]
  currentSet: number
  addRally: (r: Rally) => void
  resetSet: () => void

  // setup / preferences
  lang: string
  setLang: (l: string) => void

  myName: string
  oppName: string
  setMyName: (s: string) => void
  setOppName: (s: string) => void

  convention: Convention
  setConvention: (c: Convention) => void

  side: Side
  setSide: (s: Side) => void

  startRotationMy: Rot
  setStartRotation: (r: Rot) => void

  startIn: StartIn
  setStartIn: (v: StartIn) => void
}

export const useMatchStore = create<MatchState>((set,get)=>({
  // live match
  rallies: [],
  currentSet: 1,
  addRally: (r)=> set(s=>({ rallies: [...s.rallies, r] })),
  resetSet: ()=> set({ rallies: [], currentSet: get().currentSet + 1 }),

  // setup / preferences (defaults)
  lang: "en",
  setLang: (l)=> set({ lang: l }),

  myName: "My",
  oppName: "Opp",
  setMyName: (s)=> set({ myName: s }),
  setOppName: (s)=> set({ oppName: s }),

  convention: "international",
  setConvention: (c)=> set({ convention: c }),

  side: "right",
  setSide: (s)=> set({ side: s }),

  startRotationMy: 1,
  setStartRotation: (r: Rot)=> set({ startRotationMy: r }),

  startIn: "receive",
  setStartIn: (v)=> set({ startIn: v }),
}))
