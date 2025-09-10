"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useMatchStore } from "@/store/useMatchStore";

// ---- Win probability (50/50 rallies), win-by-2, target = 25 or 15 ----
function winProb(
  a: number,
  b: number,
  target: number,
  memo: Map<string, number> = new Map()
): number {
  // terminal states
  if (a >= target && a >= b + 2) return 1;
  if (b >= target && b >= a + 2) return 0;

  const key = `${a},${b},${target}`;
  const hit = memo.get(key);
  if (hit !== undefined) return hit;

  const p =
    0.5 * winProb(a + 1, b, target, memo) +
    0.5 * winProb(a, b + 1, target, memo);

  memo.set(key, p);
  return p;
}

export default function LivePage() {
  const s = useMatchStore();

  // Some repos name this differently. Avoid TS errors by probing via `any` and default to 25.
  // If your store later exposes `target` (15/25) or `targetPoints`, this will pick it up.
  const target: number =
    (s as any)?.target ??
    (s as any)?.targetPoints ??
    ((s as any)?.isDecidingSet ? 15 : 25) ??
    25;

  const chance = useMemo(() => {
    const memo = new Map<string, number>();
    const pNow = winProb(s.realMy, s.realOpp, target, memo);
    const pIfWin = winProb(s.realMy + 1, s.realOpp, target, memo);
    const pIfLose = winProb(s.realMy, s.realOpp + 1, target, memo);
    return {
      now: pNow,
      deltaWin: pIfWin - pNow,
      deltaLose: pIfLose - pNow,
    };
  }, [s.realMy, s.realOpp, target]);

  // commitRally expects a Team: "my" | "opp"
  const addMy = () => s.commitRally("my");
  const addOpp = () => s.commitRally("opp");

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Link href="/setup">Setup</Link>
        <Link href="/summary">Summary</Link>
        <Link href="/season">Season</Link>
      </div>

      <h1>Live Match</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Scoreboard (target {target})</h3>
        <p>
          <strong>Me</strong>: {s.realMy} &nbsp; — &nbsp; <strong>Opp</strong>: {s.realOpp}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={addMy}>+1 Me</button>
          <button onClick={addOpp}>+1 Opp</button>
        </div>
      </div>

      <div className="card">
        <h3>Win Chance</h3>
        <p>Now: {(chance.now * 100).toFixed(1)}%</p>
        <p>If win next rally: {(chance.deltaWin * 100).toFixed(1)}%</p>
        <p>If lose next rally: {(chance.deltaLose * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
}
