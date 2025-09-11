'use client';

export const dynamic = 'force-dynamic';
export const revalidate = false;

import React from 'react';
import Link from 'next/link';
import { useMatchStore, type Team } from '../../store/useMatchStore';

export default function LivePage() {
  const {
    scoreMy,
    scoreOpp,
    rotMy,
    rotOpp,
    commitRally,
    resetSet,
    target,
    setTarget,
  } = useMatchStore(s => ({
    scoreMy: s.scoreMy,
    scoreOpp: s.scoreOpp,
    rotMy: s.rotMy,
    rotOpp: s.rotOpp,
    commitRally: s.commitRally,
    resetSet: s.resetSet,
    target: s.target,
    setTarget: s.setTarget,
  }));

  const addPoint = (winner: Team) => {
    // fire the store action; no async, no returns
    commitRally(winner);
  };

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: '0 auto', fontFamily: 'Inter, system-ui, Arial' }}>
      {/* Top nav */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link href="/setup">Setup</Link>
        <Link href="/summary">Summary</Link>
        <span style={{ fontWeight: 700 }}>Live</span>
        <Link href="/season">Season</Link>
      </div>

      <h1 style={{ marginBottom: 12 }}>Live</h1>

      {/* Target toggle (25 / 15) */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 600 }}>Target:</span>
        <button
          type="button"
          onClick={() => setTarget(25)}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: target === 25 ? '#eef' : '#fff',
          }}
        >
          25
        </button>
        <button
          type="button"
          onClick={() => setTarget(15)}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: target === 15 ? '#eef' : '#fff',
          }}
        >
          15
        </button>
      </div>

      {/* Scoreboard */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 1fr',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          border: '1px solid #ddd',
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Us (Rot {rotMy})</div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>{scoreMy}</div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 700 }}>—</div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Them (Rot {rotOpp})</div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>{scoreOpp}</div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => addPoint('my')}
          style={{
            padding: '14px 16px',
            borderRadius: 12,
            border: '1px solid #2b7',
            background: '#eafff4',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          +1 Us
        </button>

        <button
          type="button"
          onClick={() => addPoint('opp')}
          style={{
            padding: '14px 16px',
            borderRadius: 12,
            border: '1px solid #c44',
            background: '#ffefef',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          +1 Them
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="button"
          onClick={resetSet}
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #aaa',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Reset Set
        </button>

        <Link
          href="/summary"
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #888',
            background: '#f6f6f6',
            textDecoration: 'none',
          }}
        >
          End Set → Summary
        </Link>
      </div>
    </div>
  );
}
