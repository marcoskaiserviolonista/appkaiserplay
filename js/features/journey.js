// ── Render: Start ─────────────────────────────────────────────
function renderStart(){
  const acc=getAcc();
  const myRankIdx=state.rankingData.findIndex(p=>p.uid===state.user?.uid);
  const myPos=myRankIdx>=0?myRankIdx+1:null;
  const rankDisplay=myPos?`#${myPos}`:'--';
  const lIdx=getLvlIdx(state.xp);
  const lvl=LEVELS[lIdx];
  const lvlStart=getLvlStartXP(lIdx);
  const prog=Math.min((state.xp-lvlStart)/lvl.xpToNext,1)*100;
  const userName=esc(state.isGuest?t('guest_label'):(state.user?.displayName||state.user?.email?.split('@')[0]||t('player_default_pt')));
  const initials=userName[0].toUpperCase();
  return `
    <button class="profile-card" onclick="playClickSfx('nav');if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}state.phase='niveis';render()">
      <div style="width:52px;flex-shrink:0;aspect-ratio:2/3;background:transparent;display:flex;align-items:center;justify-content:center">
        <img src="${_nivelImg((NIVEL_GROUPS.find(g=>lvl.n>=g.range[0]&&lvl.n<=g.range[1])||NIVEL_GROUPS[0]).title)}"
          style="width:100%;height:100%;object-fit:contain"
          onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span style=\'font-size:1.1rem;font-weight:900;color:#F5A623\'>${initials}</span>')"
          alt="${lvlTitle(lvl)}"/>
      </div>
      <div class="profile-info">
        <div class="profile-name">${userName}${myPos?` — ${t('profile_rank')}${myPos}`:''}</div>
        <div class="profile-title">${lvlTitle(lvl)}</div>
        <div class="profile-xp-track"><div class="profile-xp-fill" style="width:${prog}%"></div></div>
        <div class="profile-xp-label">${state.xp-lvlStart} / ${lvl.xpToNext} XP</div>
      </div>
      <div class="profile-lvl-badge">
        <div class="profile-lvl-num">${lvl.n}</div>
        <div class="profile-lvl-lbl">${t('level_label')}</div>
      </div>
      <img src="assets/setas-flechas.png" style="width:30px;height:30px;object-fit:contain;flex-shrink:0;margin-left:.3rem">
    </button>
    <div class="start-hero-d3">
      <div class="start-title">${t('train_ear').replace('Ouvido','<span>Ouvido</span>').replace('Ear','<span>Ear</span>')}</div>
      <div class="start-desc">${t('start_desc')}</div>
    </div>
    <div class="section-title">Escolha seu Treino</div>
    <button id="ob-harmonica" class="cta-btn" onclick="playClickSfx('nav');startGame()" style="display:flex;align-items:center;justify-content:center;gap:.6rem;margin-bottom:.75rem">
      <img src="assets/jornada-harmonica.png" style="width:28px;height:28px;object-fit:contain;flex-shrink:0">${t('harmonic_journey')}
    </button>
    ${SHOW_CORDAS_JOURNEY?`<button class="cta-btn" onclick="playClickSfx('nav');startCordas()" style="margin-bottom:.75rem;background:linear-gradient(180deg,#a855f7 0%,#7c3aed 100%);display:flex;align-items:center;justify-content:center;gap:.6rem">
      <img src="assets/jornada-cordas.png" style="width:28px;height:28px;object-fit:contain;flex-shrink:0">${t('cordas_journey')}
    </button>`:''}
    <div class="quadro-sec-grid" style="margin-bottom:.75rem">
      <button id="ob-focused" onclick="playClickSfx('nav');if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}state.phase='treino_focado_menu';render()"
        style="background:linear-gradient(180deg,#1a2a3a 0%,#0e1a2a 100%);border:3px solid #2a4a6a;border-radius:16px;box-shadow:4px 4px 0 #0a1520;cursor:pointer;padding:.85rem .75rem;display:flex;align-items:center;justify-content:center;gap:.55rem">
        <img src="assets/alvo.png" style="width:1.5rem;height:1.5rem;flex-shrink:0;object-fit:contain">
        <div style="font-size:1rem;font-weight:900;color:#60dcff;font-family:var(--font-body);letter-spacing:.01em;text-shadow:0 0 12px #60dcff66">${t('focused_training')}</div>
      </button>
      <button id="ob-sala" onclick="playClickSfx('nav');startSalaDeAula()"
        style="background:linear-gradient(180deg,#1a2a1a 0%,#0e1a0e 100%);border:3px solid #2a5a2a;border-radius:16px;box-shadow:4px 4px 0 #051005;cursor:pointer;padding:.85rem .75rem;display:flex;align-items:center;justify-content:center;gap:.55rem">
        <img src="assets/chapeu-da-graduacao.png" style="width:1.5rem;height:1.5rem;flex-shrink:0;object-fit:contain">
        <div style="font-size:1rem;font-weight:900;color:#7cdd7c;font-family:var(--font-body);letter-spacing:.01em;text-shadow:0 0 12px #7cdd7c66">${t('sala_de_aula')}</div>
      </button>
    </div>
    <div class="section-title"></div>
    <div style="width:100%;max-width:520px;display:grid;grid-template-columns:1fr 1fr;gap:.65rem;margin-bottom:.65rem">
      <button class="nav-btn" style="background:linear-gradient(180deg,#1a1100,#0e0900);border:2px solid #F5A62344;box-shadow:3px 3px 0 #0a0700" onclick="playClickSfx('nav');if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}state.phase='metronomo';render()">
        <img src="assets/metronomo.png"><span class="nav-btn-label" style="color:#F5A623">${t('metronome')}</span>
      </button>
      <button class="nav-btn" style="background:linear-gradient(180deg,#001618,#000d10);border:2px solid #60dcff44;box-shadow:3px 3px 0 #000a0d" onclick="playClickSfx('nav');if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}state.phase='afinador';render()">
        <img src="assets/afinador.png"><span class="nav-btn-label" style="color:#60dcff">${t('tuner')}</span>
      </button>
    </div>
    <div style="width:100%;max-width:520px;display:grid;grid-template-columns:1fr 1fr;gap:.65rem;margin-bottom:.75rem">
      <button id="ob-loja" class="nav-btn gold" onclick="playClickSfx('nav');if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}state.phase='loja';render()"><img src='assets/moeda.png'><span class="nav-btn-label">${t('shop')}</span></button>
      <button id="ob-inventario" class="nav-btn muted" onclick="playClickSfx('nav');if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}state.phase='inventario';render()"><img src='assets/inventario.png'><span class="nav-btn-label">${t('inventory')}</span></button>
    </div>

    <div class="section-title">${t('your_stats')}</div>
    <div class="user-stats">
      <div class="user-stat-card"><span class="us-icon"><span style="color:#e03030;font-weight:900;font-family:'Poppins',sans-serif;font-size:1rem;letter-spacing:.04em">XP</span></span><div><div class="us-val">${state.xp}</div><div class="us-lbl">${t('total_xp')}</div></div></div>
      <div class="user-stat-card"><span class="us-icon">🎯</span><div><div class="us-val">${acc}%</div><div class="us-lbl">${t('hit_rate')}</div></div></div>
      <div class="user-stat-card"><span class="us-icon">🔥</span><div><div class="us-val">${state.bestStreak}</div><div class="us-lbl">${t('best_seq')}</div></div></div>
      <div class="user-stat-card"><span class="us-icon">🏆</span><div><div class="us-val">${rankDisplay}</div><div class="us-lbl">${t('placement')}</div></div></div>
    </div>
    <a href="https://kaiserplay.com.br" target="_blank" rel="noopener" onclick="playClickSfx('nav')"
       style="display:flex;flex-direction:column;align-items:center;gap:.35rem;width:100%;max-width:520px;margin-top:1.25rem;text-decoration:none">
      <div style="font-size:1rem;font-weight:700;color:#e8e8e8;line-height:1">Aprenda violão no</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:.75rem;width:100%">
        <span style="font-size:1.3rem;color:#F5A623">→</span>
        <img src="assets/logo-kaiserplay-transp.png" style="width:52%;object-fit:contain;display:block">
        <span style="font-size:1.3rem;color:#F5A623">←</span>
      </div>
      <div style="font-size:.75rem;font-weight:600;color:#888">Clique para saber mais</div>
    </a>
    ${state.isGuest?`<div style="width:100%;max-width:520px;margin-top:.75rem;text-align:center">
      <button onclick="state.phase='signup';render()" style="background:transparent;border:none;color:#F5A623;font-size:.82rem;font-weight:700;font-family:var(--font-body);cursor:pointer;text-decoration:underline">${t('guest_popup_create')}</button>
    </div>`:''}
  `;
}

function renderGame(){
  const lIdx=getLvlIdx(state.xp),lvl=LEVELS[lIdx];
  const lvlStart=getLvlStartXP(lIdx);
  const dispXP=state.xpDisplay;
  const dispLvlIdx=getLvlIdx(dispXP);
  const dispLvlStart=getLvlStartXP(dispLvlIdx);
  const dispLvl=LEVELS[dispLvlIdx];
  const prog=Math.min((dispXP-dispLvlStart)/dispLvl.xpToNext,1)*100;
  const acc=getAcc();
  const flames=getFlames(state.streak);
  const bonusLbl=getBonusLabel(state.streak);
  const streakColor=state.streak>=3?'color:#F5A623;text-shadow:0 0 14px rgba(245,166,35,.7)':'';
  const streakSize=state.streak>=10?'font-size:2.2rem':state.streak>=5?'font-size:2rem':'font-size:1.7rem';
  const streakAnim=(state.phase==='answered'&&state.result?.ok&&state.streak>=3)?'animation:streakPop .4s ease':'';

  return `
    <div style="width:100%;max-width:520px;display:flex;align-items:center;margin-bottom:.75rem;gap:.75rem">
      <button class="back-btn" onclick="playClickSfx('back');state.phase='start';render()">${t('back_btn')}</button>
      <span style="display:flex;flex-direction:column;gap:.1rem">
        <span style="font-size:1rem;font-weight:900;color:${state.journeyMode==='cordas'?'#a855f7':'#F5A623'}">${t(state.journeyMode==='cordas'?'cordas_journey':'harmonic_journey')}</span>
        ${state.journeyMode==='cordas'?`<span style="font-size:.7rem;font-weight:600;color:#fff;opacity:.8">${t('cordas_double_pts')}</span>`:''}
      </span>
      ${state.diamantes>0?`<span style="margin-left:auto;font-size:.85rem;font-weight:800;color:#60dcff;background:#0a1a2e;border:2px solid #60dcff;border-radius:10px;padding:.25rem .7rem">💎 ${state.diamantes}</span>`:''}
    </div>
    <div class="lvl-bar">
      <div class="lvl-row">
        <span class="lvl-name">${t('level')} ${lvl.n}</span>
        <span class="lvl-xp" id="xp-label">${dispXP-dispLvlStart} / ${dispLvl.xpToNext} XP</span>
      </div>
      <div class="xp-track"><div class="xp-fill" id="xp-fill" style="width:${prog}%"></div></div>
    </div>


    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-val orange ${state.phase==='answered'&&state.result?.ok?'anim':''}">${state.xp}</div>
        <div class="stat-lbl">${t('points')}</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="${streakColor};${streakSize};${streakAnim}">${state.streak}</div>
        <div class="stat-lbl" style="${state.streak>=1?'color:'+comboColor(comboMultiplier(state.streak))+';font-weight:800':''}">${t('combo')}</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${acc}%</div>
        <div class="stat-lbl">${t('correct_answers')}</div>
      </div>
    </div>
    <div class="play-area"
      style="${state.isBonus?'background:linear-gradient(135deg,#04101e,#081a30);border:3px solid #60dcff;box-shadow:0 0 28px rgba(96,220,255,.16),4px 4px 0 #010608;':''}${state.isFretboard?'padding-bottom:.4rem;':''}"
      ${state.phase==='answered'&&!state.isFretboard?'onclick="if(state.phase===\'answered\'){if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}nextQ();}"':''}>
      <button class="play-btn ${state.playing?'playing':''}"
        style="${state.isBonus?'background:transparent;border:2px solid #60dcff;color:#60dcff;text-shadow:none;box-shadow:none;':state.journeyMode==='cordas'?'background:linear-gradient(180deg,#a855f7,#7c3aed);border-color:#5b21b6;box-shadow:4px 4px 0 #1a1a1a;':''}"
        onclick="playClickSfx('soft');playChord(state.chord)">
        ${state.playing?t('listening'):t('listen_chord')}
      </button>
      <div class="label-sm mt" style="${state.isBonus?'color:#c8ecff;font-weight:700;':''}">${state.isFretboard?t('build_chord_fretboard'):state.isQuality?t('what_quality'):t('what_chord')}</div>
      ${state.isFretboard ? `
        <div class="fb-action-row">
          ${state.phase==='answered'
            ? `<button class="fb-confirm-btn" style="background:linear-gradient(180deg,#1a2a1a,#0e1a0e);border-color:#4ade80;color:#4ade80" onclick="playClickSfx('soft');if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}nextQ()">${t('next_fretboard')} <img src="assets/seta-direita.png" style="width:18px;height:18px;vertical-align:middle;flex-shrink:0"></button>`
            : `<button id="fb-confirm-btn" class="fb-confirm-btn" style="${state.journeyMode==='cordas'?'background:linear-gradient(180deg,#a855f7,#7c3aed);border-color:#5b21b6;':''}" onclick="doFretboardConfirm()" ${Object.keys(state.fbSel).length===0?'disabled':''}>✓ ${t('confirm')}</button>
               <button class="fb-ghost-btn" style="${state.journeyMode==='cordas'?'background:linear-gradient(180deg,#1e1230,#130c20);border-color:#7c3aed;color:#a855f7;':''}" onclick="playClickSfx('soft');playFbSelChord()" ${Object.keys(state.fbSel).length===0?'disabled':''}>  ${t('hear_build')}</button>`
          }
        </div>
        ${state.phase==='answered'?`<div style="text-align:center;font-size:1.5rem;font-weight:900;color:#F5A623;margin-top:.35rem;letter-spacing:-.01em">${(state.lang==='en'&&state.chord.cifraEn)?state.chord.cifraEn:state.chord.cifra}</div>`:''}
      ` : `<div class="choices" style="${state.isQuality?'display:flex;gap:1rem;justify-content:center;':''}">
        ${state.isQuality ? (() => {
          const pair=state.qualityPair||{opts:['maior','menor'],labels:['Maior','Menor']};
          const opts=pair.opts.map((q,i)=>({q,label:_translateQualityLabel(q,pair.labels[i])}));
          return opts.map(o=>{
            let cls='choice';
            if(state.phase==='answered'){
              cls+=' locked';
              if(o.q===state.qualityAnswer)cls+=' correct';
              else if(o.q===state.qualitySelected)cls+=' wrong';
              else cls+=' dim';
            }
            return `<button class="${cls}" style="flex:1;max-width:200px;height:4.5rem" onclick="handleQualityAnswer('${o.q}',this)">
              <span style="font-size:1.4rem;font-weight:900;letter-spacing:-.02em;line-height:1.2;display:block">${o.label}</span>
            </button>`;
          }).join('');
        })() : state.choices.map(ch=>{
          let cls='choice';
          if(state.phase==='answered'){
            cls+=' locked';
            if(ch.id===state.chord.id)cls+=' correct';
            else if(ch.id===state.selected)cls+=' wrong';
            else cls+=' dim';
          }
          const diamondStyle=state.isBonus&&!cls.includes('correct')&&!cls.includes('wrong')&&!cls.includes('dim')?'background:linear-gradient(180deg,#0d2444,#07162c);border-color:#60dcff;':'';
          return `<button class="${cls}" style="${diamondStyle}height:4rem" onclick="handleAnswer(${ch.id},this)">
            <span style="font-size:1.5rem;font-weight:900;letter-spacing:-.02em;line-height:1;display:block">${(state.lang!=='pt'&&ch.cifraEn)?ch.cifraEn:ch.cifra}</span>
          </button>`;
        }).join('')}</div>`}
    </div>
    ${state.phase==='question'?buildQualityHintHtml():''}
    ${state.phase==='answered'&&state.result?.multLevelUp?(()=>{const mc=comboColor(comboMultiplier(state.streak));return `<div class="play-area" style="border-color:${mc};background:#111;text-align:center;animation:feedbackPop .35s ease"><div style="font-size:1.5rem;font-weight:900;color:${mc};letter-spacing:-.02em;line-height:1;text-shadow:0 0 24px ${mc}66">${state.result.msg}</div></div>`;})():''}
    ${state.isFretboard ? `
      <div class="fb-wrap" id="fb-wrap">${buildFbSVG()}</div>
    ` : ''}
    ${state.showFocusedPromo&&!state.fullAccess&&state.phase==='question'?`
    <div style="width:100%;max-width:520px;margin-top:1rem;background:linear-gradient(180deg,#0d1e2e,#081422);border:2.5px solid #60dcff66;border-radius:18px;padding:1.1rem 1.15rem 1rem;box-shadow:0 0 18px rgba(96,220,255,.1);animation:promoFadeIn .35s ease">
      <div style="display:flex;align-items:flex-start;gap:.7rem;margin-bottom:.85rem">
        <img src="assets/alvo.png" style="width:1.4rem;height:1.4rem;flex-shrink:0;margin-top:.05rem;object-fit:contain">
        <div>
          <div style="font-size:.95rem;font-weight:900;color:#60dcff;line-height:1.25;margin-bottom:.3rem">${t('focused_promo_title')}</div>
          <div style="font-size:.82rem;color:#a8d8ea;font-weight:500;line-height:1.45">${t('focused_promo_body')}</div>
        </div>
      </div>
      <button onclick="playClickSfx('click');state.showFocusedPromo=false;state.phase='treino_focado_menu';render()"
        style="width:100%;padding:.65rem;background:linear-gradient(180deg,#1a3a4a,#0e2030);border:2.5px solid #60dcff88;border-radius:12px;box-shadow:3px 3px 0 #04090e;font-family:var(--font-body);font-size:.88rem;font-weight:900;color:#60dcff;cursor:pointer;letter-spacing:.01em">
        ${t('focused_promo_btn')} →
      </button>
    </div>`:''}
  `;
}

function initLevelUpCanvas(id){
  const cv=document.getElementById(id);
  if(!cv||cv._anim)return;
  cv._anim=true;
  const cx=cv.getContext('2d');
  const W=cv.width,H=cv.height;
  const U=3;
  let t=0,raf=null;

  function px(x,y,w,h,c){cx.fillStyle=c;cx.fillRect(x*U,y*U,w*U,h*U);}

  const BX=8,BY=10,BW=77,BH=25;

  function drawBanner(glow){
    cx.save();
    cx.shadowBlur=16+glow*20;cx.shadowColor='#F5A623';cx.globalAlpha=.2+glow*.2;
    cx.fillStyle='#F5A623';cx.fillRect((BX+2)*U,(BY+2)*U,(BW-4)*U,(BH-4)*U);
    cx.restore();
    px(BX,BY,BW,BH,'#110800');
    px(BX+1,BY+1,BW-2,BH-2,'#1c0e00');
    px(BX+2,BY+2,BW-4,BH-4,'#F5A623');
    px(BX+2,BY+2,BW-4,1,'#FFD880');
    px(BX+2,BY+2,1,BH-4,'#FFD880');
    px(BX+2,BY+BH-3,BW-4,1,'#B06000');
    px(BX+BW-3,BY+2,1,BH-4,'#B06000');
    px(BX+3,BY+3,BW-6,1,'#FFE0A0');
    px(BX+3,BY+3,1,BH-6,'#FFE0A0');
    px(BX+3,BY+BH-4,BW-6,1,'#C07800');
    px(BX+BW-4,BY+3,1,BH-6,'#C07800');
  }

  function drawText(){
    cx.save();
    cx.font=`${7*U}px 'VT323',monospace`;
    cx.textAlign='center';cx.textBaseline='middle';
    const tx=W/2,ty=(BY+BH/2)*U;
    cx.fillStyle='rgba(60,25,0,.6)';cx.fillText('LEVEL UP',tx+2,ty+2);
    cx.fillStyle='#fff';cx.fillText('LEVEL UP',tx,ty);
    cx.restore();
  }

  const ARR=[[2,0],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[4,2],[2,3],[2,4],[2,5],[2,6]];
  function drawArrow(ax,ay,col,alpha){
    cx.globalAlpha=alpha;cx.fillStyle=col;
    ARR.forEach(([dx,dy])=>cx.fillRect((ax+dx)*U,(ay+dy)*U,U,U));
    cx.globalAlpha=1;
  }

  const SP_S=[[1,0],[0,1],[1,1],[2,1],[1,2]];
  const SP_L=[[2,0],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],[2,4]];
  function drawSpark(sx,sy,big,col){
    cx.fillStyle=col;
    (big?SP_L:SP_S).forEach(([dx,dy])=>cx.fillRect((sx+dx)*U,(sy+dy)*U,U,U));
  }

  const SPARKS=[
    {x:1,y:1,big:true,ph:0},{x:83,y:1,big:true,ph:6},
    {x:0,y:19,big:false,ph:3},{x:88,y:18,big:false,ph:9},
    {x:29,y:38,big:false,ph:2},{x:55,y:39,big:false,ph:5},
    {x:19,y:0,big:false,ph:4},{x:67,y:0,big:false,ph:7},
  ];
  const SCOLS=['#FFD047','#F5A623','#FFE880'];

  function frame(){
    cx.clearRect(0,0,W,H);
    const glow=(Math.sin(t*0.08)+1)/2;
    drawBanner(glow);
    drawText();
    const astep=Math.floor(t/4)%12;
    const aVisible=astep<8;
    const ay=BY-2-astep;
    const aAlpha=aVisible?(astep>=5?(8-astep)/3:1):0;
    const aCol=glow>0.5?'#4ade80':'#22c55e';
    if(aAlpha>0.05){
      drawArrow(BX-1,ay,aCol,aAlpha);
      drawArrow(BX+BW-4,ay,aCol,aAlpha);
    }
    for(const s of SPARKS){
      const ph=(t*0.7+s.ph*3.7)%14;
      if(ph<9)drawSpark(s.x,s.y,s.big,SCOLS[Math.floor((t+s.ph*2)/5)%3]);
    }
    t++;
    if(state.phase==='levelup')raf=requestAnimationFrame(frame);
    else cancelAnimationFrame(raf);
  }

  document.fonts.ready.then(()=>{raf=requestAnimationFrame(frame);});
}

function renderLevelUp(){
  const lvl=LEVELS[getLvlIdx(state.xp)];
  const grupo=NIVEL_GROUPS.find(g=>lvl.n>=g.range[0]&&lvl.n<=g.range[1])||NIVEL_GROUPS[0];
  const cor=grupo.cor;
  const showCard=state.lvlUpIsNewGroup; // nova categoria OU primeira vez
  const coursePromo=`
    <a href="https://kaiserplay.com.br" target="_blank" rel="noopener" onclick="playClickSfx('nav')"
       style="display:flex;flex-direction:column;align-items:center;gap:.35rem;width:100%;max-width:520px;margin-top:1.25rem;text-decoration:none">
      <div style="font-size:1rem;font-weight:700;color:#e8e8e8;line-height:1">Aprenda violão no</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:.75rem;width:100%">
        <span style="font-size:1.3rem;color:#F5A623">→</span>
        <img src="assets/logo-kaiserplay-transp.png" style="width:52%;object-fit:contain;display:block">
        <span style="font-size:1.3rem;color:#F5A623">←</span>
      </div>
      <div style="font-size:.75rem;font-weight:600;color:#888">Clique para saber mais</div>
    </a>`;

  if(showCard){
    const img=_nivelImg(grupo.title);
    const isFirstEver=lvl.n===1&&grupo.range[0]===1;
    const cardName=t(grupo.titleKey)||grupo.title;
    return `
    <div style="display:flex;flex-direction:column;align-items:center;padding:1rem 1.25rem 1.5rem;text-align:center;animation:lvlupEntrance .5s cubic-bezier(.34,1.56,.64,1) forwards">
      <div style="font-family:'VT323',monospace;font-size:1.5rem;color:${cor};letter-spacing:.04em;text-shadow:0 0 16px ${cor}88;margin-bottom:.75rem">${cardName}</div>
      <img src="${img}"
        style="max-height:50svh;width:auto;max-width:90%;object-fit:contain;filter:drop-shadow(0 12px 40px rgba(0,0,0,1)) drop-shadow(0 0 40px ${cor}55);margin-bottom:1.25rem"
        onerror="this.style.display='none'">
      <div style="font-family:'VT323',monospace;font-size:2rem;color:${cor};margin-bottom:.15rem">${t('new_level')}</div>
      <div style="font-family:'VT323',monospace;font-size:5rem;color:#f0f0f0;letter-spacing:-.03em;margin-bottom:.45rem;text-shadow:4px 4px 0 ${cor}99;line-height:1">${lvl.n}</div>
      <button class="cta-btn" style="width:auto;padding-left:2.5rem;padding-right:2.5rem" onclick="afterLvlUp()">${lvl.n===1?t('start_journey'):t('continue_journey')}</button>
    </div>`;
  }

  // Subiu de nível dentro da mesma categoria: sem moldura
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:12dvh;text-align:center;animation:lvlupEntrance .4s cubic-bezier(.34,1.56,.64,1) forwards">
      <div class="lvlup-frame">
        <img src="assets/up.png"
          style="max-height:100%;max-width:100%;object-fit:contain;animation:lvlupBounce .9s ease-in-out infinite,lvlupGlow 1.1s ease-in-out infinite;position:relative;z-index:1"
          onerror="this.style.display='none'">
        <span class="lvlup-arrow" style="left:18%;top:2%;font-size:1.9rem;animation-delay:0s">▲</span>
        <span class="lvlup-arrow" style="right:18%;top:2%;font-size:1.9rem;animation-delay:.18s">▲</span>
        <span class="lvlup-spark" style="left:6%;top:18%;font-size:1.2rem;animation-delay:0s">✦</span>
        <span class="lvlup-spark" style="right:4%;top:22%;font-size:.9rem;animation-delay:.23s">✦</span>
        <span class="lvlup-spark" style="left:28%;bottom:8%;font-size:.85rem;animation-delay:.41s">+</span>
        <span class="lvlup-spark" style="right:24%;bottom:5%;font-size:1rem;animation-delay:.15s">+</span>
        <span class="lvlup-spark" style="left:50%;top:5%;font-size:.8rem;animation-delay:.35s;transform:translateX(-50%)">✦</span>
      </div>
      <div style="font-family:'VT323',monospace;font-size:2rem;color:${cor};line-height:1">${t('new_level')}</div>
      <div style="font-family:'VT323',monospace;font-size:5rem;color:#f0f0f0;text-shadow:4px 4px 0 ${cor}99,0 0 30px ${cor}55;line-height:1;margin-bottom:.9rem">${lvl.n}</div>
      <button class="cta-btn" style="width:auto;padding-left:2.5rem;padding-right:2.5rem" onclick="afterLvlUp()">${t('continue_journey')}</button>
      ${coursePromo}
    </div>`;
}

// ── Render: Desempenho ────────────────────────────────────────
function renderDesempenho(){
  const acc=getAcc();
  const _allChordsMap={};
  [...CHORDS,...CHORDS_DIAMOND].forEach(c=>{_allChordsMap[c.id]=c;});
  const chordList=Object.entries(state.chordStats).map(([id,v])=>{
    const chord=_allChordsMap[id];
    if(!chord)return null;
    return {name:chord.name,...v,total:v.c+v.e};
  }).filter(Boolean).sort((a,b)=>b.e-a.e);
  const maiorErro=chordList[0];

  return `
    <div class="back-row">
      <button class="back-btn" onclick="playClickSfx('back');state.phase='start';render()">${t('back_btn')}</button>
      <span class="page-title">${t('my_performance')}</span>
    </div>
    <div class="section-title">${t('overview')}</div>
    <div class="user-stats">
      <div class="user-stat-card"><span class="us-icon"><span style="color:#e03030;font-weight:900;font-family:'Poppins',sans-serif;font-size:1rem;letter-spacing:.04em">XP</span></span><div><div class="us-val">${state.xp}</div><div class="us-lbl">${t('total_xp')}</div></div></div>
      <div class="user-stat-card"><span class="us-icon">🎯</span><div><div class="us-val">${acc}%</div><div class="us-lbl">${t('hit_rate')}</div></div></div>
      <div class="user-stat-card"><span class="us-icon">⭐</span><div><div class="us-val">${state.notas}</div><div class="us-lbl">${t('points')}</div></div></div>
      <div class="user-stat-card"><span class="us-icon"><img src="assets/moeda.png" style="width:28px;height:28px;object-fit:contain;vertical-align:middle"></span><div><div class="us-val">${state.moedas}</div><div class="us-lbl">${t('coins')}</div></div></div>
      <div class="user-stat-card"><span class="us-icon">💎</span><div><div class="us-val">${state.diamantes}</div><div class="us-lbl">${t('diamonds')}</div></div></div>
      <div class="user-stat-card"><span class="us-icon">🔥</span><div><div class="us-val">${state.bestStreak}</div><div class="us-lbl">${t('best_streak')}</div></div></div>
    </div>

    ${maiorErro?`
    <div class="section-title">${t('most_missed_chord')}</div>
    <div class="perf-card" style="background:#2a1010;border-color:#ef4444;margin-bottom:1rem">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:.75rem">
          <span style="font-size:1.5rem">😓</span>
          <div>
            <div style="font-size:1.1rem;font-weight:900;color:#f87171">${maiorErro.name}</div>
            <div style="font-size:.72rem;color:#bbb">${maiorErro.e} ${t('wrong_answers').toLowerCase()} · ${maiorErro.c} ${t('correct_answers').toLowerCase()}</div>
          </div>
        </div>
        <div style="font-size:1.6rem;font-weight:900;color:#ef4444">${maiorErro.e}×</div>
      </div>
    </div>`:''}

    ${chordList.length>0?`
    <div class="section-title">${t('hits_and_misses')}</div>
    <div class="perf-card">
      ${chordList.map((ch,i)=>{
        const pct=Math.round(ch.c/ch.total*100);
        return `<div class="chord-row">
          <span style="font-size:.88rem;font-weight:700;color:#e8e8e8;flex:1">${ch.name}</span>
          <span style="font-size:.78rem;color:#4ade80;font-weight:700;margin-right:.75rem">✓ ${ch.c}</span>
          <span style="font-size:.78rem;color:#f87171;font-weight:700;margin-right:.75rem">✗ ${ch.e}</span>
          <span style="font-size:.78rem;font-weight:900;color:${pct>=70?'#F5A623':'#888'}">${pct}%</span>
        </div>`;
      }).join('')}
    </div>`:`<div style="color:#555;text-align:center;padding:2rem 0;font-size:.9rem">${t('play_to_see_stats')}</div>`}
  `;
}

// ── Render: Loja ──────────────────────────────────────────────
// ── Actions ───────────────────────────────────────────────────
function startGame(){
  if(!_obFlag('journey_ob_done')){_showJourneyOb();return;}
  _startJourneyReal();
}
function _showJourneyOb(){
  const root=document.getElementById('ob-root');if(!root)return;
  const lang=state.lang||'pt';
  const titles={pt:'Jornada Harmônica',en:'Harmonic Journey',es:'Jornada Armónica'};
  const bodies={
    pt:'Suba de nível a cada resposta certa.<br>Quanto mais alto o nível, maior <span style="color:#F5A623">será a dificuldade.</span><br><span style="color:#F5A623">Novos acordes irão surgir</span>, cada vez mais complexos.<br>Pratique todos os dias e seu ouvido ficará cada vez mais treinado.',
    en:'Level up with every correct answer.<br>The higher the level, <span style="color:#F5A623">the harder it gets.</span><br><span style="color:#F5A623">New, increasingly complex chords</span> will keep appearing.<br>Practice every day and your ear will keep growing stronger.',
    es:'Sube de nivel con cada respuesta correcta.<br>Cuanto más alto el nivel, <span style="color:#F5A623">mayor será la dificultad.</span><br><span style="color:#F5A623">Nuevos acordes irán surgiendo</span>, cada vez más complejos.<br>Practica todos los días y tu oído estará cada vez más entrenado.'
  };
  const okLabels={pt:'Vamos lá!',en:"Let's go!",es:'¡Vamos!'};
  const title=titles[lang]||titles.pt;
  const body=bodies[lang]||bodies.pt;
  const okLabel=okLabels[lang]||okLabels.pt;
  root.innerHTML=`
    <div style="position:fixed;inset:0;z-index:8999;background:#111;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:0;padding:0.75rem 1.75rem;animation:obFadeIn .32s ease">
      <div style="text-align:center;width:100%">
        <div style="font-family:var(--font-title);font-size:1.9rem;font-weight:700;color:#F5A623;letter-spacing:.04em;margin-bottom:.5rem">${title}</div>
        <div style="width:40px;height:3px;background:#F5A623;border-radius:2px;margin:0 auto .85rem"></div>
        <p style="font-size:.92rem;color:#ddd;font-weight:500;line-height:1.55;margin:0;text-align:center">${body}</p>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;width:100%">
        <img src="assets/mago_jornada.png" style="width:100%;max-width:300px;object-fit:contain;display:block;margin-top:-1rem;margin-bottom:-2.5rem">
        <button onclick="_obSetFlag('journey_ob_done');document.getElementById('ob-root').innerHTML='';_startJourneyReal()" style="width:100%;max-width:320px;background:linear-gradient(180deg,#f5aa2a,#d4720a);border:3px solid #1a1a1a;border-radius:16px;box-shadow:5px 5px 0 #1a1a1a;padding:1rem;font-family:var(--font-body);font-size:1.1rem;font-weight:900;color:#fff;cursor:pointer;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8);letter-spacing:.03em">${okLabel}</button>
      </div>
    </div>`;
}
function _startJourneyReal(){
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  state.journeyMode='harmonic';
  if(state.xp===0){
    Object.assign(state,{streak:0,bestStreak:0,score:0,stats:{t:0,c:0},chordStats:{},result:null,lvlUpPending:false,lvlUpFromFocused:false,notas:0,moedas:0,inventario:[],violoesComprados:['violao_basico'],violaoEquipado:'violao_basico',xpDisplay:0});
  } else {
    Object.assign(state,{score:0,result:null,lvlUpPending:false,lvlUpFromFocused:false});
  }
  // Primeira vez: mostra card inicial antes de gerar pergunta
  if(!state.firstCardSeen){
    state.firstCardSeen=true;
    state.lvlUpIsNewGroup=true;
    state.phase='levelup';
    render();
    return;
  }
  genQ();state.phase='question';render();
  setTimeout(()=>playChord(state.chord),300);
}

function startCordas(){
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  state.journeyMode='cordas';
  if(state.xp===0){
    Object.assign(state,{streak:0,bestStreak:0,score:0,stats:{t:0,c:0},chordStats:{},result:null,lvlUpPending:false,lvlUpFromFocused:false,notas:0,moedas:0,inventario:[],violoesComprados:['violao_basico'],violaoEquipado:'violao_basico',xpDisplay:0});
  } else {
    Object.assign(state,{score:0,result:null,lvlUpPending:false,lvlUpFromFocused:false});
  }
  if(!state.firstCardSeen){
    state.firstCardSeen=true;
    state.lvlUpIsNewGroup=true;
    state.phase='levelup';
    render();
    return;
  }
  genQ();state.phase='question';render();
  setTimeout(()=>playChord(state.chord),300);
}

function nextQ(){
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  if(!['answered','question','levelup'].includes(state.phase)) return;
  // sincroniza xpDisplay com xp real antes de renderizar nova pergunta
  state.xpDisplay=state.xp;
  if(state.lvlUpPending){
    const lvlNow=LEVELS[getLvlIdx(state.xp)];
    const grupoNow=NIVEL_GROUPS.find(g=>lvlNow.n>=g.range[0]&&lvlNow.n<=g.range[1])||NIVEL_GROUPS[0];
    const isNewGroup=lvlNow.n===grupoNow.range[0];
    const isFirstEver=!state.firstCardSeen;
    state.lvlUpIsNewGroup=isNewGroup||isFirstEver;
    state.firstCardSeen=true;
    if(isFirstEver){
      // primeira vez: mostra card sem som nem partículas
    } else if(isNewGroup){
      playSfx('levelup');
      particles.push(...makeParticles(260,300,60,true));
      particles.push(...makeParticles(100,200,30,true));
      particles.push(...makeParticles(400,200,30,true));
      startParticleLoop();
    } else {
      playSfx('correct2');
    }
    state.lvlUpPending=false;state.phase='levelup';render();return;
  }
  if(state.pendingFocusedPromo){state.showFocusedPromo=true;state.pendingFocusedPromo=false;}
  else{state.showFocusedPromo=false;}
  genQ();state.phase='question';render();
  if(state.isBonus){
    playSfx('diamond');
    const app=document.getElementById('app');
    app.style.transition='box-shadow .2s';
    app.style.boxShadow='inset 0 0 60px rgba(96,220,255,.15)';
    setTimeout(()=>{app.style.boxShadow='';app.style.transition='';},1200);
  }
  setTimeout(()=>playChord(state.chord),state.isBonus?900:300);
  if(state.isBonus){
    setTimeout(()=>{
      const popup=document.createElement('div');
      popup.style.cssText='position:fixed;z-index:9999;left:50%;top:42%;transform:translate(-50%,-50%);font-size:1.6rem;font-weight:900;color:#60dcff;text-shadow:0 0 24px #60dcff,0 0 60px #60dcff88;pointer-events:none;white-space:nowrap;text-align:center;';
      popup.innerHTML='💎 '+t('diamond_question');
      document.body.appendChild(popup);
      popup.animate([
        {opacity:0,transform:'translate(-50%,-50%) scale(.7)'},
        {opacity:1,transform:'translate(-50%,-60%) scale(1.08)',offset:.3},
        {opacity:1,transform:'translate(-50%,-65%) scale(1)',offset:.8},
        {opacity:0,transform:'translate(-50%,-80%) scale(.95)'}
      ],{duration:2000,easing:'ease-out'}).onfinish=()=>popup.remove();
    },150);
  }
}

function afterLvlUp(){
  if(state.lvlUpFromFocused){
    state.lvlUpFromFocused=false;
    genFocusedQ();
    state.phase='treino_focado_question';render();
    return;
  }
  genQ();state.phase='question';render();
  if(state.isBonus){playSfx('diamond');}
  setTimeout(()=>playChord(state.chord),state.isBonus?900:300);
  if(state.isBonus){
    const app=document.getElementById('app');
    if(app){app.style.transition='box-shadow .2s';app.style.boxShadow='inset 0 0 60px rgba(96,220,255,.15)';setTimeout(()=>{app.style.boxShadow='';app.style.transition='';},1200);}
    setTimeout(()=>{
      const popup=document.createElement('div');
      popup.style.cssText='position:fixed;z-index:9999;left:50%;top:42%;transform:translate(-50%,-50%);font-size:1.6rem;font-weight:900;color:#60dcff;text-shadow:0 0 24px #60dcff,0 0 60px #60dcff88;pointer-events:none;white-space:nowrap;text-align:center;';
      popup.innerHTML='💎 '+t('diamond_question');
      document.body.appendChild(popup);
      popup.animate([
        {opacity:0,transform:'translate(-50%,-50%) scale(.7)'},
        {opacity:1,transform:'translate(-50%,-60%) scale(1.08)',offset:.3},
        {opacity:1,transform:'translate(-50%,-65%) scale(1)',offset:.8},
        {opacity:0,transform:'translate(-50%,-80%) scale(.95)'}
      ],{duration:2000,easing:'ease-out'}).onfinish=()=>popup.remove();
    },200);
  }
}

