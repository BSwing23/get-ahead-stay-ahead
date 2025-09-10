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

  // rotation tracking (we keep it simple: rotMy advances after we win on receive or lose on serve)
  rotMy: Rot;
  rotOpp: Rot;

  // rallies history
  rallies: Rally[];
  commitRally: (winner: Team)=>void;
  resetSet: ()=>void;

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
    // who served this rally? (if teams have equal rotations, assume 'my' started receiving -> opp served first)
    // We track server by parity of last rally: simplest is "whoever didn't just sideout keeps serving".
    // To keep deterministic, infer from score changes: if my score increased and we were serving, it's PS; if my score increased and we were receiving, it's SO.
    // Implement with a simple rule: we store serveBy on each rally using last rally, else assume 'my' serves to start.
    const last = s.rallies[s.rallies.length-1];
    const serveBy: Team = last ? (last.winner === last.serveBy ? last.serveBy : (last.serveBy==='my'?'opp':'my')) : 'my';

    // compute rotations attached to this rally
    const rotMy = s.rotMy;
    const rotOpp = s.rotOpp;

    // scoring
    let scoreMy = s.scoreMy;
    let scoreOpp = s.scoreOpp;
    let realMy = s.realMy;
    let realOpp = s.realOpp;

    if (winner==='my') {
      scoreMy += 1;
      if (serveBy==='my') realMy += 1; // point on serve
    } else {
      scoreOpp += 1;
      if (serveBy==='opp') realOpp += 1;
    }

    // rotation changes: winner keeps serve; loser rotates
    let nextMy = s.rotMy;
    let nextOpp = s.rotOpp;
    if (winner==='my') {
      // opp lost -> they rotate
      nextOpp = nextRot(s.rotOpp);
    } else {
      // we lost -> we rotate
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

  computeStats: (r?: Rally[])=>{
    const rallies = r ?? get().rallies;
    const byRot = emptyByRot();

    // Tally PS/SO per rotation *for my team*
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

    // laps/extras (rough): count maximum rotation count seen then minus laps
    const servesPerRot = Object.values(byRot).map(b=>b.serves);
    const maxServes = Math.max(0,...servesPerRot);
    const laps = Math.floor(maxServes/6);
    const extras = Math.max(0, maxServes - laps*6);

    return { byRot, laps, extras };
  },
}));
