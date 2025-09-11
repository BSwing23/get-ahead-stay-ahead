'use client';

import React from 'react';
import Link from 'next/link';
import { useMatchStore } from '@/store/useMatchStore';

export default function SetupPage() {
  // Grab the store (named import)
  const s = useMatchStore() as any;

  const setMyName = s?.setMyName ?? (() => {});
  const setOppName = s?.setOppName ?? (() => {});
  const setSide = s?.setSide ?? (() => {});
  const setStartIn = s?.setStartIn ?? (() => {});

  const side = s?.side ?? 'left';
  const startIn = s?.startIn ?? 'receive';

  const swapSides = () => setSide(side === 'left' ? 'right' : 'left');
  const toggleStartIn = () => setStartIn(startIn === 'receive' ? 'serve' : 'receive');

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}>
      <header style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <Link href="/live">Live</Link>
        <Link href="/summary">Summary</Link>
        <Link href="/season">Season</Link>
      </header>

      <h1>Setup</h1>

      <section style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <label>
          <div>My Team</div>
          <input
            value={s?.myName ?? ''}
            onChange={(e) => setMyName(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </label>

        <label>
          <div>Opponent</div>
          <input
            value={s?.oppName ?? ''}
            onChange={(e) => setOppName(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </label>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div>Side:</div>
          <div style={{ fontWeight: 700 }}>{side}</div>
          <button onClick={swapSides} style={{ padding: '6px 10px' }}>
            Swap Sides
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div>Start In:</div>
          <div style={{ fontWeight: 700 }}>{startIn}</div>
          <button onClick={toggleStartIn} style={{ padding: '6px 10px' }}>
            Toggle Serve/Receive
          </button>
        </div>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Tip: This page only sets simple match prefs. Use **Live** to track rallies and **Summary/Season**
          to review stats.
        </div>
      </section>
    </div>
  );
}
