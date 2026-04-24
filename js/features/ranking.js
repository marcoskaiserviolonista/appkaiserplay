// ── Ranking: leitura pontual (sem listener em tempo real) ─────
async function loadRankingData(){
  if(!state.user)return;
  try{
    const snap=await db.collection('players').orderBy('xp','desc').limit(10).get();
    state.rankingData=snap.docs.map(d=>({uid:d.id,...d.data()}));
  }catch(e){console.error('ranking load:',e);}
  finally{state.rankingLoading=false;render();}
}

// ── 8. RANKING ────────────────────────────────────────────────
function renderRanking(){
  const myUid=state.user?.uid;
  const data=state.rankingData;
  if(state.rankingLoading) return `
    <div class="back-row">
      <button class="back-btn" onclick="playClickSfx('back');state.tab='game';state.phase='start';render()">${t('back_btn')}</button>
      <span class="page-title">${t('ranking_title')}</span>
    </div>
    <div style="text-align:center;padding:3rem 1rem;color:#60dcff88;font-size:.95rem;letter-spacing:.05em">${t('loading')}</div>`;
  const rows=data.length===0
    ?`<div style="color:#555;text-align:center;padding:2rem;font-size:.85rem">${t('no_ranking_data')}</div>`
    :data.map((p,i)=>{
      const isMe=p.uid===myUid;
      const nome=esc(p.displayName||t('player_default_pt'));
      const lvlIdx=getLvlIdx(p.xp||0);
      const lvl=LEVELS[lvlIdx];
      return `
        <div class="rank-row${isMe?' me':''}">
          <span class="rank-pos${i<3?' top':''}">${i+1}</span>
          <div class="rank-info">
            <div class="rank-name">${nome}</div>
            <div class="rank-meta">${t('level')} ${lvl.n} • ${lvlTitle(lvl)}</div>
          </div>
          <div class="rank-xp-col">
            <div class="rank-xp">${(p.xp||0).toLocaleString()} <span style="font-size:.72rem">XP</span></div>
          </div>
        </div>`;
    }).join('');
  return `
    <div class="back-row">
      <button class="back-btn" onclick="playClickSfx('back');state.tab='game';state.phase='start';render()">${t('back_btn')}</button>
      <span class="page-title">${t('ranking_title')}</span>
    </div>
    <div class="rank-card">
      <div class="rank-arcade-header">
        <div class="rank-arcade-title">RANKING</div>
        <div class="rank-arcade-sub">Top 10</div>
      </div>
      ${rows}
    </div>
  `;
}

