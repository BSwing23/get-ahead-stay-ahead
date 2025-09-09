import React from 'react'
import { useMatchStore, Rot, computeStats } from '@/store/useMatchStore'

export default function SummaryPage() {
  const s = useMatchStore()
  const { byRot } = computeStats(s.rallies)

  const rows = ([1, 2, 3, 4, 5, 6] as Rot[]).map(rot => {
    const st = byRot[rot]
    const psPct = st.serves ? st.ps : 0
    const soPct = st.receives ? st.so : 0

    return (
      <tr key={rot}>
        <td style={{ border: '1px solid #ccc', padding: '4px' }}>{rot}</td>
        <td style={{ border: '1px solid #ccc', padding: '4px' }}>
          {(psPct * 100).toFixed(1)}%
        </td>
        <td style={{ border: '1px solid #ccc', padding: '4px' }}>
          {(soPct * 100).toFixed(1)}%
        </td>
      </tr>
    )
  })

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}>
      <h1>Summary</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Rotation</th>
            <th style={{ border: '1px solid #ccc', padding: '4px' }}>PS%</th>
            <th style={{ border: '1px solid #ccc', padding: '4px' }}>SO%</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}
