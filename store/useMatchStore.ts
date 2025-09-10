// store/useMatchStore.ts
import { create } from "zustand";

/** ===== Types ===== */
export type Rot = 1 | 2 | 3 | 4 | 5 | 6;
export type Team = "my" | "opp";
export type StartIn = "serve" | "receive";
export type Side = "left" | "right";
export type Convention = "usa" | "fivb";
export type LangCode = "en" | "es" | "fr" | "de" | "it" | "pt";

export interface Rally {
  /** who won the rally */
  winner: Team;
  /** rotation numbers on that rally (for PS/SO attribution) */
  rotMy: Rot;
  rotOpp: Rot;
  /** which team was serving for that rally */
  server: Team;
}

export interface MatchState {
  // Setup / prefs
  myName: string;
  oppName: string;
  lang: LangCode;
  convention: Convention;
  side: Side; // which scoreboard side "My" is on
  startIn: StartIn;
  startRotationMy: Rot;

  // Live state
  currentSet: number;
  scoreMy: number;
  scoreOpp: number;
  serving: Team; // current server
  rotMy: Rot;
  rotOpp: Rot;
  rallies: Rally[];

  // Actions
  setMyName: (v: string) => void;
  setOppName: (v: string) => void;
  setLang: (v: LangCode) => void;
  setConvention: (v: Convention) => void;
  setSide: (v: Side) => void;
  setStartIn: (v: StartIn) => void;
  setStartRotation: (v: Rot) => void;

  /** record a rally result and advance rotations/scores */
  commitRally: (winner: Team) => void;

  /** zero just the current set’s live state (not names/prefs) */
  resetSet: () => void;

  /** increment set number and reset live scores/rotations */
  endSet: () => void;
}

/** ===== Helpers ===== */
const nextRot = (r: Rot): Rot => ((r % 6) + 1) as Rot;

/**
 * Given the live rallies, compute rotation-level stats and laps/extras.
 * PS = Points scored while serving (per rotation)
 * SO = Sideouts won while receiving (per rotation)
 */
export function computeStats(rallies: Rally[]): {
  byRot: Record<
    Rot,
    {
      serves: number;
      receives: number;
      ps: number; // points while serving
      so: number; // sideouts won while receiving
    }
  >;
  laps: number; // full 6-rotation cycles the serving team completed
  extras: number; // extra rotations beyond whole laps
} {
  const init = { serves: 0, receives: 0, ps: 0, so: 0 };
  const byRot: Record<Rot, typeof init> = {
    1: { ...init },
    2: { ...init },
    3: { ...init },
    4: { ...init },
    5: { ...init },
    6: { ...init },
  };

  // Track how many distinct serves by "my" team to estimate laps/extras
  let myServeRotVisits: Rot[] = [];

  rallies.forEach((r) => {
    if (r.server === "my") {
      // a serve happened from my rotation r.rotMy
      byRot[r.rotMy].serves += 1;
      if (!myServeRotVisits.length || myServeRotVisits[myServeRotVisits.length - 1] !== r.rotMy) {
        myServeRotVisits.push(r.rotMy);
      }
      if (r.winner === "my") {
        byRot[r.rotMy].ps += 1;
      } else {
        // opp won, that is a sideout for opp (not counted in my SO)
      }
    } else {
      // opp served; my team received at my rotation r.rotMy
      byRot[r.rotMy].receives += 1;
      if (r.winner === "my") {
        // my sideout (won point when receiving)
        byRot[r.rotMy].so += 1;
      }
    }
  });

  // Compute laps/extras from distinct serving rotations visited
  // A "lap" is every 6 distinct my serving rotations we pass through.
  // Extras are the remainder.
  // This is an approximation that aligns with how we snapshot during a set.
  const distinctMyServeRots = new Set(myServeRotVisits);
  // If we served at least once from any rotation, count how far we cycled
  // Better: approximate count by how many times we returned to start rot.
  let laps = 0;
  let extras = 0;
  if (myServeRotVisits.length > 0) {
    // Partition the sequence by occurrences of the first rotation
    const first = myServeRotVisits[0];
    let returnsToFirst = myServeRotVisits.filter((r) => r === first).length - 1; // number of times we came back to start
    if (returnsToFirst < 0) returnsToFirst = 0;
    laps = returnsToFirst;
    // Extras: rotations past the last full lap, counting unique rotations after final return
    if (returnsToFirst === 0) {
      // still in first lap
      extras = distinctMyServeRots.size - 1 >= 0 ? distinctMyServeRots.size - 1 : 0;
    } else {
      // crude but consistent: extras are how many steps into the next cycle since last full return
      // find last index of `first`, count unique rots after that
      const lastFirstIdx = myServeRotVisits.lastIndexOf(first);
      const tail = new Set(myServeRotVisits.slice(lastFirstIdx + 1));
      extras = tail.size;
    }
  }

  return { byRot, laps, extras };
}

/** ===== Store ===== */
export const useMatchStore = create<MatchState>((set, get) => ({
  // Defaults
  myName: "My",
  oppName: "Opp",
  lang: "en",
  convention: "usa",
  side: "left",
  startIn: "receive",
  startRotationMy: 1,

  currentSet: 1,
  scoreMy: 0,
  scoreOpp: 0,
  serving: "opp", // since startIn default is 'receive'
  rotMy: 1,
  rotOpp: 1,
  rallies: [],

  // Setters
  setMyName: (v) => set({ myName: v }),
  setOppName: (v) => set({ oppName: v }),
  setLang: (v) => set({ lang: v }),
  setConvention: (v) => set({ convention: v }),
  setSide: (v) => set({ side: v }),
  setStartIn: (v) =>
    set((s) => ({
      startIn: v,
      serving: v === "serve" ? "my" : "opp",
      // keep rotations; only impacts who serves first
    })),
  setStartRotation: (v) =>
    set((s) => ({
      startRotationMy: v,
      rotMy: v,
      // Opp rotation is opposite. If you want to mirror, shift by 3:
      rotOpp: (((v + 2) % 6) + 1) as Rot, // 3 ahead modulo 6
    })),

  commitRally: (winner) => {
    const s = get();
    const server = s.serving;

    // Current rotations (before rally)
    const rotMy = s.rotMy;
    const rotOpp = s.rotOpp;

    // Update score
    const scoreMy = s.scoreMy + (winner === "my" ? 1 : 0);
    const scoreOpp = s.scoreOpp + (winner === "opp" ? 1 : 0);

    // Determine who serves next & how rotations shift
    let nextServing: Team = server;
    let nextRotMy: Rot = rotMy;
    let nextRotOpp: Rot = rotOpp;

    if (winner === server) {
      // point on serve; same server continues, no rotation change
      nextServing = server;
    } else {
      // sideout: serve flips, receiving team rotates
      nextServing = server === "my" ? "opp" : "my";
      if (nextServing === "my") {
        // my team will now serve -> my team rotates
        nextRotMy = nextRot(s.rotMy);
      } else {
        // opp will now serve -> opp rotates
        nextRotOpp = nextRot(s.rotOpp);
      }
    }

    const rally: Rally = { winner, rotMy, rotOpp, server };

    set({
      scoreMy,
      scoreOpp,
      serving: nextServing,
      rotMy: nextRotMy,
      rotOpp: nextRotOpp,
      rallies: [...s.rallies, rally],
    });
  },

  resetSet: () =>
    set((s) => ({
      scoreMy: 0,
      scoreOpp: 0,
      serving: s.startIn === "serve" ? "my" : "opp",
      rotMy: s.startRotationMy,
      rotOpp: (((s.startRotationMy + 2) % 6) + 1) as Rot,
      rallies: [],
    })),

  endSet: () =>
    set((s) => ({
      currentSet: s.currentSet + 1,
      scoreMy: 0,
      scoreOpp: 0,
      serving: s.startIn === "serve" ? "my" : "opp",
      rotMy: s.startRotationMy,
      rotOpp: (((s.startRotationMy + 2) % 6) + 1) as Rot,
      rallies: [],
    })),
}));

// Provide a default export for places that import default.
export default useMatchStore;
