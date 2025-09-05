import create from "zustand"

/** Rally + state types (unchanged from your build) */
export type Winner = "my" | "opp"
export type Rot = 1|2|3|4|5|6
export type TargetKind = 25 | 15

export interface Rally {
  winner: Winner
  myRot: Rot            // rotation/zone BEFORE this rally (your app already keeps this)
  oppRot: Rot
  servedBy: Winner      // who served this rally ("my" or "opp")
}

interface StatsByRot { serves:number; receives:number; sideouts:number; ps:number; so:number; }
interface MatchStats {
  byRot: Record<Rot, StatsByRot>
  laps: number
  extras: number
}

function emptyByRot(): Record<Rot, StatsByRot> {
  return {1:{serves:0,receives:0,sideouts:0,ps:0,so:0},
          2:{serves:0,receives:0,sideouts:0,ps:0,so:0},
          3:{serves:0,receives:0,sideouts:0,ps:0,so:0},
          4:{serves:0,receives:0,sideouts:0,ps:0,so:0},
          5:{serves:0,receives:0,sideouts:0,ps:0,so:0},
          6:{serves:0,receives:0,sideouts:0,ps:0,so:0}}
}

/** Core stat pass used by Live and Season */
export function computeStats(rallies: Rally[]): MatchStats {
  const byRot = emptyByRot()

  // running counts of "legs" to derive laps/extras later
  let myServeRuns = 0
  let oppServeRuns = 0

  for (const r of rallies) {
    const rot: Rot = r.myRot

    if (r.servedBy === "my") {
      byRot[rot].serves++
      if (r.winner === "my") {
        byRot[rot].ps++
        myServeRuns++    // we held serve → part of the same leg
      } else {
        byRot[rot].sideouts++
        oppServeRuns++   // we lost serve → a leg for opp begins/continues
      }
    } else { // servedBy = opp
      byRot[rot].receives++
      if (r.winner === "my") {
        byRot[rot].sideouts++
        myServeRuns++    // after sideout we get to serve (counts toward our legs)
      } else {
        byRot[rot].so++  // opp held
        oppServeRuns++
      }
    }
  }

  // convert counts to percentages (safe divide)
  (Object.keys(byRot) as unknown as Rot[]).forEach(rot=>{
    const x = byRot[rot]
    x.ps = x.serves ? x.ps / x.serves : 0
    x.so = x.receives ? x.sideouts / x.receives : 0
  })

  // laps = min(our legs, opp legs), extras = |legs difference|
  const laps = Math.min(myServeRuns, oppServeRuns)
  const extras = Math.abs(myServeRuns - oppServeRuns)

  return { byRot, laps, extras }
}

/** Minimal match store (only the bits Live needs) */
interface MatchState {
  rallies: Rally[]
  currentSet: number
  resetSet(): void
  addRally(r: Rally): void
}

export const useMatchStore = create<MatchState>((set,get)=>({
  rallies: [],
  currentSet: 1,
  resetSet: ()=> set({ rallies: [], currentSet: get().currentSet + 1 }),
  addRally: (r)=> set(s=>({ rallies: [...s.rallies, r] }))
}))

/** What Live needs to drop into Season in one call */
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
