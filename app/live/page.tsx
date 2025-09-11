'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { useMatchStore } from '@/store/useMatchStore';

export default function LivePage() {
  const s = useMatchStore();

  // ---- Compute win probability ----
  const chance = useMemo(() => {
    if (!s) return { now: 0, pIfWin: 0, pIfLose: 0 };

    const target = s.target;
    const memo = new Map<string, number>();

    function winProb(my: number, opp: number): number {
      if (my >= target && my - opp >= 2) return 1; // I win
      if (opp >= target && opp - my >= 2) return 0; // Opp wins
      const key = `${my},${opp}`;
      if (memo.has(key)) return memo.get(key)!;
      const res = 0.5 * winProb(my + 1, opp) + 0.5 * winProb(my, opp + 1);
      memo.set(key, res);
      return res;
    }

    const now = winProb(s.scoreMy, s.scoreOpp);
    const pIfWin = winProb(s.scoreMy + 1, s.scoreOpp);
    const pIfLose = winProb(s.scoreMy, s.scoreOpp + 1);

    return { now, pIfWin, pIfLose };
  }, [s.scoreMy, s.scoreOpp, s.target]);

  // ---- Button handlers ----
  const addMy = () => s.commitRally('my');
  const addOpp = () => s.commitRally('opp');
  const reset = () => s.resetSet();

  return (
    <div style={{ padding: 20 }}>
      <h1>Live Scoring</h1>

      <div style={{ marginBottom: 12 }}>
        <strong>Score:</strong> {s.scoreMy} – {s.scoreOpp}
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={addMy} style={{ marginRight: 8 }}>
          +1 My Team
        </button>
        <button onClick={addOpp} style={{ marginRight: 8 }}>
          +1 Opponent
        </button>
        <button onClick={reset}>Reset Set</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Real Points:</strong> {s.realMy} – {s.realOpp}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Rotations:</strong> My {s.rotMy} | Opp {s.rotOpp}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Win Chance Now:</strong> {(chance.now * 100).toFixed(1)}%
      </div>
      <div style={{ marginBottom: 12 }}>
        <strong>If My Team Wins Next Rally:</strong>{' '}
        {(chance.pIfWin * 100).toFixed(1)}%
      </div>
      <div style={{ marginBottom: 12 }}>
        <strong>If Opponent Wins Next Rally:</strong>{' '}
        {(chance.pIfLose * 100).toFixed(1)}%
      </div>

      <Link href="/summary">Go to Summary</Link>
    </div>
  );
}
