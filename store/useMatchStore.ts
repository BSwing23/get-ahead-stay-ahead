'use client';

import { create } from 'zustand';

/** ----- Types ----- */
export type Rot = 1 | 2 | 3 | 4 | 5 | 6;
export type Team = 'my' | 'opp';

export type Rally = {
  winner: Team;
  rotMy: Rot;      // my rotation at rally start
  rotOpp: Rot;     // opp rotation at rally start
  serveBy: Team;   // who served this rally
};

export type ByRot = {
  serves: number;     // total rallies started while we were serving in this rot
  receives: number;   // total rallies started while we were receiving in this rot
  ps: number;         // points scored on serve (my team)
  so: number;         // sideouts won on receive (my team)
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

  // rotations (advance loser)
  rotMy: Rot;
  rotOpp: Rot;

  // history
  rallies: Rally[];
  commitRally: (winner: Team) => void;
  resetSet: () => void;

  // helpers
  computeStats: (rallies?: Rally[]) => Stats;
};

/** ----- Helpers ----- */
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

/** ----- Store ----- */
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

    // Infer server: if last rally winner kept serve; otherwise it flipped.
    const last = s.rallies[s.rallies.length - 1];
    const serveBy: Team = last
      ? last.winner === last.serveBy
        ? last.serveBy
        : last.serveBy === 'my'
        ? 'opp'
        : 'my'
      : 'my';

    const rotMy = s.rotMy;
    const rotOpp = s.rotOpp;

    // Update scores & real points
    let scoreMy = s.scoreMy;
    let scoreOpp = s.scoreOpp;
    let realMy = s.realMy;
    let realOpp = s.realOpp;

    if (winner === 'my') {
      scoreMy += 1;
      if (serveBy === 'my') realMy += 1;
    } else {
      scoreOpp += 1;
      if (serveBy === 'opp') realOpp += 1;
    }

    // Loser rotates
    let nextMy = s.rotMy;
    let nextOpp = s.rotOpp;
    if (winner === 'my') nextOpp = nextRot(s.rotOpp);
    else nextMy = nextRot(s.rotMy);

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

  computeStats: (r?: Rally[]) => {
    const rallies = r ?? get().rallies;
    const byRot = emptyByRot();

    rallies.forEach((ra) => {
      const mineServing = ra.serveBy === 'my';
      const rot = ra.rotMy; // we always bucket by my rotation at start

      if (mineServing) {
        byRot[rot].serves += 1;
        if (ra.winner === 'my') byRot[rot].ps += 1;
      } else {
        byRot[rot].receives += 1;
        if (ra.winner === 'my') byRot[rot].so += 1;
      }
    });

    const servesPerRot = Object.values(byRot).map((b) => b.serves);
    const maxServes = Math.max(0, ...servesPerRot);
    const laps = Math.floor(maxServes / 6);
    const extras = Math.max(0, maxServes - laps * 6);

    return { byRot, laps, extras };
  },
}));
