
'use client'
import { useMatchStore, Rot } from '@/store/useMatchStore'
import { t } from '@/lib/i18n'
import Link from 'next/link'

export default function SummaryPage(){
  const s = useMatchStore()
  const stats = s.stats()
  const rows = ([1,2,3,4,5,6] as Rot[]).map(rot=>{
    const st = stats[rot]
    const psPct = st.serves ? st.ps : 0
    const soPct = st.receiveAttempts ? st.so : 0
    const psso = psPct + soPct
    const winning = psso >= 1
    return {rot, serves:st.serves, realpts:(st.ps*st.serves), psPct, rec:st.receiveAttempts, soCnt:(st.so*st.receiveAttempts), soPct, psso, winning}
  })
  return (
    <main className="container col">
      <div className="row">
        <Link className="btn btn-ghost" href="/live">← Live</Link>
      </div>
      <h1>{t('summary_title', s.lang)}</h1>
      <section className="card" style={{overflowX:'auto'}}>
        <table style={{width:'100%', fontSize:14}}>
          <thead>
            <tr>
              <th>{s.convention==='International' ? 'Zone (Z)' : t('summary_rotation', s.lang)}</th>
              <th>{t('summary_serves', s.lang)}</th>
              <th>{t('summary_realpts', s.lang)}</th>
              <th>{t('summary_ps_pct', s.lang)}</th>
              <th>{t('summary_receives', s.lang)}</th>
              <th>{t('summary_sideouts', s.lang)}</th>
              <th>{t('summary_so_pct', s.lang)}</th>
              <th>{t('summary_psso_pct', s.lang)}</th>
              <th>{t('summary_winning_label', s.lang)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.rot}>
                <td>{s.convention==='International'?`Z${r.rot}`:r.rot}</td>
                <td>{r.serves}</td>
                <td>{r.realpts.toFixed(0)}</td>
                <td>{r.psPct.toFixed(3)}</td>
                <td>{r.rec}</td>
                <td>{r.soCnt.toFixed(0)}</td>
                <td>{r.soPct.toFixed(3)}</td>
                <td>{r.psso.toFixed(3)}</td>
                <td>
                  <span className="pill" style={{background:r.winning?'#ecfdf5':'#fee2e2',color:r.winning?'#065f46':'#991b1b'}}>
                    {r.winning ? t('summary_winning', s.lang) : t('summary_losing', s.lang)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
