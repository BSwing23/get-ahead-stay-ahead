'use client';

// These two lines make Next treat this page as fully dynamic and never cache it.
export const dynamic = 'force-dynamic';
export const revalidate = false;

import React from 'react';
import { useMatchStore } from '@/store/useMatchStore';

export default function LivePage() {
  const s = useMatchStore();

  const addMy = () => s.commitRally('my');
  const addOpp = () => s.commitRally('opp');
  const reset  = () => s.resetSet();

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: '0 auto', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      <h1>Live</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, opacity: .7 }}>My score</div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{s.scoreMy}</div>
          <button onClick={addMy} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer' }}>
            +1 Us
          </button>
        </div>

        <div>
          <div style={{ fontSize: 12, opacity: .7 }}>Opp score</div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{s.scoreOpp}</div>
          <button onClick={addOpp} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer' }}>
            +1 Them
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
        <button onClick={reset} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer' }}>
          Reset Set
        </button>
        <button onClick={() => alert('Test fired')} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer' }}>
          Test Alert
        </button>
      </div>

      <hr style={{ margin: '20px 0' }} />

      <div>
        <div>Real (serve) points — Us: <b>{s.realMy}</b> • Opp: <b>{s.realOpp}</b></div>
        <div style={{ marginTop: 6 }}>Rotations — Us: <b>{s.rotMy}</b> • Opp: <b>{s.rotOpp}</b></div>
        <div style={{ marginTop: 6, fontSize: 12, opacity: .7 }}>
          Rallies recorded: {s.rallies.length}
        </div>
      </div>
    </div>
  );
}
