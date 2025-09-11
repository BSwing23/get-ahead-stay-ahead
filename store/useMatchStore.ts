'use client';
import { create } from 'zustand';

export type Rot = 1|2|3|4|5|6;
export type Team = 'my'|'opp';

export type Rally = {
  winner: Team;
  rotMy: Rot;   // rotation number when rally started
  rotOpp: Rot;
  serveBy: Team; // who served that rally
};

export type ByRot = {
  serves: number;
  receives: number;
  ps: number;       // points scored on serve
  so: number;       // sideouts won on receive
};

export type Stats = {
  byRot: Record<Rot, ByRot>;
  laps: number;
  extras: number;
};

export type MatchState = {
  // scoreboard
  scoreMy: number;
  scoreOpp: number;
  // “real points” (serve points only)
  realMy: number;
  realOpp: number;
  // target (25 or 15)
  target: number;
  setTarget: (n:number)=>void;

  // rotation tracking
  rotMy: Rot;
  rotOpp: Rot;

  // rallies history
  rallies: Rally[];
  commitRally: (winner: Team)=>void;
  resetSet: ()=>void;

  // quick debug bumpers (to prove UI/store wiring)
  bumpMy: ()=>void;
  bumpOpp: ()=>void;

  // helpers
  computeStats: (rallies?: Rally[])=>Stats;
};

function nextRot(r: Rot): Rot {
  return (r % 6 + 1) as Rot;
}

function emptyByRot(): Record<Rot, ByRot> {
  return {
    1:{serves:0,receives:0,ps:0,so:0},
    2:{serves:0,receives:0,ps:0,so:0},
    3:{serves:0,receives:0,ps:0,so:0},
    4:{serves:0,receives:0,ps:0,so:0},
    5:{serves:0,receives:0,ps:0,so:0},
    6:{serves:0,receives:0,ps:0,so:0},
  };
}

export const useMatchStore = create<MatchState>((set,get)=>({
  scoreMy: 0,
  scoreOpp: 0,
  realMy: 0,
  realOpp: 0,
  target: 25,
  setTarget: (n:number)=>set({target: n===15?15:25}),

  rotMy: 1,
  rotOpp: 1,

  rallies: [],

  commitRally: (winner: Team) => {
    const s = get();

    // infer server from last rally (winner keeps serve; sideout flips)
    const last = s.rallies[s.rallies.length-1];
    const serveBy: Team = last ? (last.winner === last.serveBy ? last.serveBy : (last.serveBy==='my'?'opp':'my')) : 'my';

    // attach current rotations to this rally
    const rotMy = s.rotMy;
    const rotOpp = s.rotOpp;

    // scoring
    let scoreMy = s.scoreMy;
    let scoreOpp = s.scoreOpp;
    let realMy  = s.realMy;
    let realOpp = s.realOpp;

    if (winner==='my') {
      scoreMy += 1;
      if (serveBy==='my') realMy += 1; // point on serve
    } else {
      scoreOpp += 1;
      if (serveBy==='opp') realOpp += 1;
    }

    // rotation changes: loser rotates
    let nextMy = s.rotMy;
    let nextOpp = s.rotOpp;
    if (winner==='my') {
      nextOpp = nextRot(s.rotOpp);
    } else {
      nextMy = nextRot(s.rotMy);
    }

    const rally: Rally = { winner, rotMy, rotOpp, serveBy };

    set({
      rallies: [...s.rallies, rally],
      scoreMy, scoreOpp, realMy, realOpp,
      rotMy: nextMy, rotOpp: nextOpp,
    });
  },

  resetSet: ()=> set({
    scoreMy:0, scoreOpp:0, realMy:0, realOpp:0,
    rotMy:1, rotOpp:1, rallies:[],
  }),

  // debug bumpers
  bumpMy: ()=> set((st)=>({ scoreMy: st.scoreMy+1, realMy: st.realMy+1 })),
  bumpOpp: ()=> set((st)=>({ scoreOpp: st.scoreOpp+1, realOpp: st.realOpp+1 })),

  computeStats: (r?: Rally[])=>{
    const rallies = r ?? get().rallies;
    const byRot = emptyByRot();

    rallies.forEach((ra)=>{
      const mine = ra.serveBy==='my';
      if (mine) {
        byRot[ra.rotMy].serves += 1;
        if (ra.winner==='my') byRot[ra.rotMy].ps += 1;
      } else {
        byRot[ra.rotMy].receives += 1;
        if (ra.winner==='my') byRot[ra.rotMy].so += 1;
      }
    });

    const servesPerRot = Object.values(byRot).map(b=>b.serves);
    const maxServes = Math.max(0,...servesPerRot);
    const laps = Math.floor(maxServes/6);
    const extras = Math.max(0, maxServes - laps*6);

    return { byRot, laps, extras };
  },
}));

// 🔒 Export both named and default to avoid import mismatches
export default useMatchStore;
