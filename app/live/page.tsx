"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useMatchStore } from "@/store/useMatchStore";

// ---- Win probability (50/50 rallies), win-by-2, target = 25 or 15 ----
function winProb(a: number, b: number, target: number, memo = new Map<string, number>()): number {
  if (a >= target && a >= b + 2) return 1;
  if (b >= target && b >= a + 2) return 0;

  const key = `${a},${b}`;
  if (memo.has(key)) return memo.get(key)!;

  const p =
    0.5 * winProb(a + 1, b, target, memo) +
    0.5 * winProb(a, b + 1, target, memo);

  memo.set(key, p);
  return p;
}

export default function LivePage() {
  const s = useMatchStore();

  const chance = useMemo(() => {
    const memo = new Map<string, number>();
    const target = s.target; // 25 or 15
    const pNow = winProb(s.realMy, s.realOpp, target, memo);
    const pIfWin = winProb(s.realMy + 1, s.realOpp, target, memo);
    const pIfLose = winProb(s.realMy, s.realOpp + 1, target, memo);

    return { now: pNow, deltaWin: pIfWin - pNow, deltaLose: pIfLose - pNow };
  }, [s.realMy, s.realOpp, s.target]);

  const addMy = () => s.commitRally("my");   // ✅ fixed
  const addOpp = () => s.commitRally("opp"); // ✅ fixed

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: "0 auto" }}>
      <h1>Live Match</h1>

      <div style={{ marginBottom: 16 }}>
        <Link href="/summary">Go to Summary</Link>
      </div>

      <div>
        <h3>Score</h3>
        <p>
          Me: {s.realMy} — Opp: {s.realOpp}
        </p>
        <button onClick={addMy}>+1 Me</button>
        <button onClick={addOpp}>+1 Opp</button>
      </div>

      <div>
        <h3>Win Chance</h3>
        <p>Now: {(chance.now * 100).toFixed(1)}%</p>
        <p>If Win Rally: {(chance.deltaWin * 100).toFixed(1)}%</p>
        <p>If Lose Rally: {(chance.deltaLose * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
}
