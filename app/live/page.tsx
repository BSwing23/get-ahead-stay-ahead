'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useMatchStore } from '@/store/useMatchStore';

// Force this page to be rendered on the client only (no prerender)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function LivePage() {
  const {
    scoreMy, scoreOpp, target,
    rotMy, rotOpp,
    commitRally, resetSet, computeStats
  } = useMatchStore();

  // Safe, memoized win-probability (bounded recursion with memo)
  const chance = useMemo(() => {
    const t = target || 25;
    const a = scoreMy;
    const b = scoreOpp;
    const memo = new Map<string, number>();

    const k = (x:number,y:number)=>`${x}-${y}`;
    function winProb(x:number,y:number):number{
      if (x >= t && x - y >= 2) return 1;
      if (y >= t && y - x >= 2) return 0;
      const key = k(x,y);
      const hit = memo.get(key);
      if (hit !== undefined) return hit;
      const p = 0.5 * winProb(x+1,y) + 0.5 * winProb(x,y+1);
      memo.set(key,p);
      return p;
    }

    const pNow   = winProb(a,b);
    const pIfWin = winProb(a+1,b);
    const pIfLose= winProb(a,b+1);
    return { now:pNow, dIfWin:pIfWin - pNow, dIfLose:pIfLose - pNow };
  }, [scoreMy, scoreOpp, target]);

  const stats = computeStats();

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}>
      <nav style={{ display:'flex', gap:12, marginBottom:16 }}>
        <Link href="/">Home</Link>
        <Link href="/setup">Setup</Link>
        <Link href="/summary">Summary</Link>
        <Link href="/season">Season</Link>
      </nav>

      <h1>Live</h1>

      <section className="card" style={{ padding:12, marginTop:12 }}>
        <div style={{ fontSize:18, fontWeight:700 }}>
          Score: {scoreMy} – {scoreOpp} &nbsp; (target {target})
        </div>

        <div style={{ marginTop:12, display:'flex', gap:8 }}>
          <button onClick={() => commitRally('my')}>+1 My</button>
          <button onClick={() => commitRally('opp')}>+1 Opp</button>
          <button onClick={resetSet} style={{ marginLeft:16 }}>Reset Set</button>
        </div>
      </section>

      <section className="card" style={{ padding:12, marginTop:12 }}>
        <div>My rotation: {rotMy} &nbsp; | &nbsp; Opp rotation: {rotOpp}</div>
        <div style={{ marginTop:8 }}>
          Win chance: {(chance.now*100).toFixed(1)}%
          &nbsp; | if win next: {((chance.now+chance.dIfWin)*100).toFixed(1)}%
          &nbsp; | if lose next: {((chance.now+chance.dIfLose)*100).toFixed(1)}%
        </div>
      </section>

      <section className="card" style={{ padding:12, marginTop:12 }}>
        <div><b>Stats</b></div>
        <div style={{ fontSize:12, opacity:.7 }}>
          Laps: {stats.laps} &nbsp; | &nbsp; Extras: {stats.extras}
        </div>
      </section>
    </div>
  );
}
