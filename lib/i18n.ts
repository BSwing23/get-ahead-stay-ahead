
export type LangCode = 'en'|'es'|'fr'|'pt'|'pt-BR'|'it'|'de'|'ja'|'zh'
export const t = (k:string, _lang:LangCode) => {
  const dict:any = { en: {
    live_title: 'Live Match View',
    live_actual_score: 'Actual Score',
    setup_language: 'Language',
    setup_convention: 'Convention',
    setup_scoreboard_side: 'Scoreboard Side',
    setup_start_rotation: 'Starting Rotation (My)',
    setup_first_serving: 'First Serving Team',
    setup_my_name: 'My Team Name',
    setup_opp_name: 'Opponent Name',
    summary_title: 'Rotation Performance (This Match)',
    summary_rotation: 'Rotation',
    summary_serves: 'Serves',
    summary_realpts: 'RealPts',
    summary_ps_pct: 'PS%',
    summary_receives: 'Receives',
    summary_sideouts: 'Sideouts',
    summary_so_pct: 'SO%',
    summary_psso_pct: 'PS%+SO%',
    summary_winning_label: 'Winning?',
    summary_winning: 'Winning',
    summary_losing: 'Losing'
  } };
  return dict.en[k] || k;
}
