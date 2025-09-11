'use client';

import { create } from 'zustand';

// ===== Types =====
export type Rot = 1 | 2 | 3 | 4 | 5 | 6;
export type Team = 'my' | 'opp';

export type Rally = {
  winner: Team;     // who won the rally
  rotMy: Rot;       // my rotation when the rally started
  rotOpp: Rot;      // opponent rotation when the rally started
  serveBy: Team;    // who served the rally
};

export type ByRot = {
  serves: number;   // number of times *my team* served in this rotation
  receives: number; // number of times *my team* received in this rotation
  ps: number;       // points scored on serve (my team)
  so: number;       // sideouts won on receive (my team)
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
  setTarget: (n: number) => void;

  // rotations
  rotMy: Rot;
  rotOpp: Rot;

  // rally history
  rallies: Rally[];
  commitRally: (winner: Team) => void;
  resetSet: () => void;

  // derived stats
  computeStats: (rallies?: Rally[]) => Stats;
};

// ===== Helpers =====
function nextRot(r: Rot): Rot {
  return ((r % 6) + 1) as Rot;
}

function emptyByRot(): Record<Rot, ByRot> {
  return {
    1: { serves: 0, receives: 0, ps: 0, so: 0 },
    2: { serves: 0, receives: 0, ps: 0, so: 0 },
    3: { serves: 0, receives: 0, ps: 0, so: 0 },
    4: { serves: 0, receives: 0, ps: 0, so: 0 },
    5: { serves: 0, receives: 0, ps: 0, so: 0 },
    6: { serves: 0, receives: 0, ps: 0, so: 0 },
  };
}

// ===== Store =====
export const useMatchStore = create<MatchState>((set, get) => ({
  scoreMy: 0,
  scoreOpp: 0,

  realMy: 0,
  realOpp: 0,

  target: 25,
  setTarget: (n: number) => set({ target: n === 15 ? 15 : 25 }),

  rotMy: 1,
  rotOpp: 1,

  rallies: [],

  commitRally: (winner: Team) => {
    const s = get();

    // Infer server: if last rally winner === last server, same server continues;
    // else serve flips. If no rallies yet, start with 'my' serving.
    const last = s.rallies[s.rallies.length - 1];
    const serveBy: Team = last
      ? last.winner === last.serveBy
        ? last.serveBy
        : last.serveBy === 'my'
        ? 'opp'
        : 'my'
      : 'my';

    // attach current rotations to this rally
    const rotMy = s.rotMy;
    const rotOpp = s.rotOpp;

    // scoring
    let scoreMy = s.scoreMy;
    let scoreOpp = s.scoreOpp;
    let realMy = s.realMy;
    let realOpp = s.realOpp;

    if (winner === 'my') {
      scoreMy += 1;
      if (serveBy === 'my') realMy += 1; // point on my serve
    } else {
      scoreOpp += 1;
      if (serveBy === 'opp') realOpp += 1; // point on opp serve
    }

    // rotation changes: loser rotates
    let nextMy = s.rotMy;
    let nextOpp = s.rotOpp;
    if (winner === 'my') {
      nextOpp = nextRot(s.rotOpp);
    } else {
      nextMy = nextRot(s.rotMy);
    }

    const rally: Rally = { winner, rotMy, rotOpp, serveBy };

    set({
      rallies: [...s.rallies, rally],
      scoreMy,
      scoreOpp,
      realMy,
      realOpp,
      rotMy: nextMy,
      rotOpp: nextOpp,
    });
  },

  resetSet: () =>
    set({
      scoreMy: 0,
      scoreOpp: 0,
      realMy: 0,
      realOpp: 0,
      rotMy: 1,
      rotOpp: 1,
      rallies: [],
    }),

  computeStats: (input?: Rally[]) => {
    const rallies = input ?? get().rallies;
    const byRot = emptyByRot();

    // Tally PS/SO by my rotation
    rallies.forEach((ra) => {
      const mineServing = ra.serveBy === 'my';
      if (mineServing) {
        byRot[ra.rotMy].serves += 1;
        if (ra.winner === 'my') byRot[ra.rotMy].ps += 1;
      } else {
        byRot[ra.rotMy].receives += 1;
        if (ra.winner === 'my') byRot[ra.rotMy].so += 1;
      }
    });

    // Simple laps/extras approximation from serves (my team)
    const maxServes = Math.max(0, ...Object.values(byRot).map((b) => b.serves));
    const laps = Math.floor(maxServes / 6);
    const extras = Math.max(0, maxServes - laps * 6);

    return { byRot, laps, extras };
  },
}));
