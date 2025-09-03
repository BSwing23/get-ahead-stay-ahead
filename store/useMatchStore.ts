
import { create } from "zustand"

export type LangCode = 'en'|'es'|'fr'|'pt'|'pt-BR'|'it'|'de'|'ja'|'zh'
export type Convention = 'International'|'American'
export type Side = 'left'|'right'
export type Winner = 'my'|'opp'
export type Rot = 1|2|3|4|5|6

export interface Rally {
  id: string
  rallyNumber: number
  winner: Winner
  myRotationAtStart: Rot
  servingTeamAtStart: Winner
  realPointMy: 0|1
  realPointOpp: 0|1
  excludeFromStats?: boolean
}

type Stats = { serves:number; receiveAttempts:number; ps:number; so:number; psPlusSo:number }
export type RotStats = Record<Rot, Stats>
const emptyStats = (): Stats => ({serves:0,receiveAttempts:0,ps:0,so:0,psPlusSo:0})

function computeStats(rallies: Rally[]): RotStats {
  const S: RotStats = {1:emptyStats(),2:emptyStats(),3:emptyStats(),4:emptyStats(),5:emptyStats(),6:emptyStats()}
  for (const r of rallies) {
    if (r.excludeFromStats) continue
    const rot = r.myRotationAtStart
    const meServing = (r.servingTeamAtStart === 'my')
    if (meServing) {
      S[rot].serves += 1
      if (r.winner==='my') S[rot].ps += 1
    } else {
      S[rot].receiveAttempts += 1
      if (r.winner==='my') S[rot].so += 1
    }
  }
  (Object.keys(S) as unknown as Rot[]).forEach(rot=>{
    const a=S[rot]
    a.ps = a.serves? a.ps/a.serves : 0
    a.so = a.receiveAttempts? a.so/a.receiveAttempts : 0
    a.psPlusSo = a.ps + a.so
  })
  return S
}

function recalcFromRallies(all: Rally[], startRot: Rot, startIn: 'serve'|'receive', _convention: Convention) {
  let scoreMy=0, scoreOpp=0
  let currentRotation: Rot = startRot
  let servingTeam: Winner = (startIn==='serve')?'my':'opp'
  for (const r of all) {
    if (r.winner==='my') scoreMy++; else scoreOpp++;
    if (servingTeam==='opp' && r.winner==='my') { // sideout -> rotate backward
      currentRotation = (((currentRotation + 4) % 6) + 1) as Rot
      servingTeam='my'
    } else if (servingTeam==='my' && r.winner==='opp') {
      servingTeam='opp'
    }
  }
  const nextRallyNumber = all.length+1
  return { scoreMy, scoreOpp, currentRotation, servingTeam, nextRallyNumber }
}

type State = {
  lang: LangCode
  convention: Convention
  side: Side
  startRotationMy: Rot
  startIn: 'serve'|'receive'
  myName: string
  oppName: string
  rallies: Rally[]
  currentRotation: Rot
  servingTeam: Winner
  scoreMy: number
  scoreOpp: number
  nextRallyNumber: number
  setLang: (l: LangCode) => void
  setConvention: (c: Convention) => void
  setSide: (s: Side) => void
  setStartRotation: (r: Rot) => void
  setStartIn: (x: 'serve'|'receive') => void
  setMyName: (s: string) => void
  setOppName: (s: string) => void
  resetSet: () => void
  commitRally: (winner: Winner) => void
  stats: () => RotStats
  undoLast: () => void
  excludeLastForStats: () => void
  toggleExcludeById: (id: string) => void
}

export const useMatchStore = create<State>((set,get)=>({
  lang:'en', convention:'International', side:'left',
  startRotationMy:1, startIn:'receive',
  myName:'My', oppName:'Opp',
  rallies:[], currentRotation:1, servingTeam:'opp',
  scoreMy:0, scoreOpp:0, nextRallyNumber:1,

  setLang:(l)=>set({lang:l}), setConvention:(c)=>set({convention:c}), setSide:(s)=>set({side:s}),
  setStartRotation:(r)=>set({startRotationMy:r, currentRotation:r}),
  setStartIn:(x)=>set({startIn:x, servingTeam: x==='serve'?'my':'opp'}),
  setMyName:(s)=>set({myName:s}), setOppName:(s)=>set({oppName:s}),

  resetSet:()=>set((state)=>({
    rallies:[], scoreMy:0, scoreOpp:0, nextRallyNumber:1,
    currentRotation: state.startRotationMy, servingTeam: state.startIn==='serve'?'my':'opp'
  })),

  commitRally:(winner)=>set((state)=>{
    const rn=state.nextRallyNumber
    const rally: Rally = {
      id:`${Date.now()}-${rn}`, rallyNumber: rn, winner,
      myRotationAtStart: state.currentRotation,
      servingTeamAtStart: state.servingTeam,
      realPointMy: winner==='my'?1:0, realPointOpp: winner==='opp'?1:0,
      excludeFromStats:false
    }
    let nextRot=state.currentRotation; let nextServer=state.servingTeam
    if (state.servingTeam==='opp' && winner==='my'){ // sideout rotate backward
      nextRot = (((state.currentRotation + 4) % 6) + 1) as Rot
      nextServer='my'
    } else if (state.servingTeam==='my' && winner==='opp'){
      nextServer='opp'
    }
    return {
      rallies:[...state.rallies, rally],
      scoreMy: state.scoreMy + (winner==='my'?1:0),
      scoreOpp: state.scoreOpp + (winner==='opp'?1:0),
      nextRallyNumber: rn+1, currentRotation: nextRot, servingTeam: nextServer
    }
  }),

  stats:()=>computeStats(get().rallies),

  undoLast:()=>set((state)=>{
    if (!state.rallies.length) return state as any
    const newRallies = state.rallies.slice(0,-1)
    const r = recalcFromRallies(newRallies, state.startRotationMy, state.startIn, state.convention)
    return { rallies:newRallies, ...r }
  }),

  excludeLastForStats:()=>set((state)=>{
    if (!state.rallies.length) return state as any
    const newRallies = state.rallies.slice()
    newRallies[newRallies.length-1] = { ...newRallies[newRallies.length-1], excludeFromStats: true }
    return { rallies:newRallies }
  }),

  toggleExcludeById:(id)=>set((state)=>{
    const newRallies = state.rallies.map(r => r.id===id ? { ...r, excludeFromStats: !r.excludeFromStats } : r)
    return { rallies:newRallies }
  }),
}))
