const NIVEL_GROUPS = [
  {range:[1,10],   title:"Escudeiro",                        titleKey:'lvl_aprendiz', desc:"Cada acorde é uma conquista. A jornada começa — e o violão nunca mais soa igual.",                         cor:'#a0a0a0'},
  {range:[11,20],  title:"Bardo",                            titleKey:'lvl_bardo',    desc:"Suas músicas já carregam histórias. O violão não é mais instrumento — é sua voz.",                         cor:'#86efac'},
  {range:[21,30],  title:"Alquimista Harmônico",             titleKey:'lvl_alquimista',desc:"Você não toca acordes — você transmuta sons em sentimento. A harmonia cede à sua vontade.",                cor:'#F5A623'},
  {range:[31,40],  title:"Sentinela das Cordas",             titleKey:'lvl_estudante',desc:"Sua escuta afinou. Cada corda revela segredos que só os dedicados conseguem ouvir.",                      cor:'#6ee7b7'},
  {range:[41,50],  title:"Bardo Dissonante",                 titleKey:'lvl_barbaro',  desc:"Onde outros ouvem erro, você ouve expressão. O caos harmônico é sua arma.",                               cor:'#ef4444'},
  {range:[51,60],  title:"Guardião da Harmonia",             titleKey:'lvl_guardiao', desc:"Você preserva o que outros esquecem e inventa o que ninguém ousou. Seu legado ressoa.",                   cor:'#f472b6'},
  {range:[61,70],  title:"Mago do Som",                      titleKey:'lvl_mago',     desc:"Seu ouvido enxerga o invisível. Cada acorde revela camadas que poucos jamais perceberão.",                cor:'#fb923c'},
  {range:[71,80],  title:"Arcanista das Cordas",             titleKey:'lvl_arcanista',desc:"Teoria e instinto são um só em você. As harmonias mais complexas rendem-se ao seu domínio.",              cor:'#c084fc'},
  {range:[81,90],  title:"Bruxo da Tempestade Harmônica",   titleKey:'lvl_virtuose', desc:"A tempestade harmônica responde ao seu toque. Você convoca sons que pouquíssimos dominam.",               cor:'#60dcff'},
  {range:[91,99],  title:"Lenda da Música",                  titleKey:'lvl_lenda',    desc:"Seu nome ressoa como uma canção que ninguém esquece. Você é a inspiração de quem começa.",                cor:'#fbbf24'},
  {range:[100,100],title:"Mestre Supremo",                   titleKey:'lvl_mestre',   desc:"Além da técnica, além da teoria — você transcendeu. O som flui por você como respiração.",                cor:'#60dcff'},
];

function _nivelImg(title){
  return 'assets/'+title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'_')+'.png';
}

function renderNiveis(){
  const lIdx=getLvlIdx(state.xp);
  const currentLvl=LEVELS[lIdx].n;
  const groups=NIVEL_GROUPS.map((g,i)=>{
    const [from,to]=g.range;
    let status='locked';
    if(currentLvl>to) status='done';
    else if(currentLvl>=from) status='current';
    return{...g,status,idx:i};
  });

  const currentGroup=groups.find(g=>g.status==='current')||groups[0];
  const nextGroup=groups.find(g=>g.status==='locked');
  const cgStart=LEVEL_XP_START[currentGroup.range[0]-1];
  const cgEnd=nextGroup?LEVEL_XP_START[nextGroup.range[0]-1]:999999;
  const cgPct=Math.min(Math.round((state.xp-cgStart)/(cgEnd-cgStart)*100),100);
  const xpFaltando=nextGroup?Math.max(0,cgEnd-state.xp):0;
  const cor=currentGroup.cor;

  const progressHeader=`
    <div style="width:100%;max-width:520px;background:#1a1a1a;border:3px solid #2a2a2a;border-radius:18px;padding:1.1rem 1.2rem;margin-bottom:1.25rem;box-shadow:4px 4px 0 #151515">
      <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem">
        <img src="${_nivelImg(currentGroup.title)}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;flex-shrink:0" onerror="this.style.display='none'">
        <div style="flex:1">
          <div style="font-size:.62rem;color:#888;text-transform:uppercase;letter-spacing:.1em;font-weight:700">${t('current_category')}</div>
          <div style="font-size:1rem;font-weight:900;color:${cor}">${currentGroup.title}</div>
        </div>
        ${nextGroup?`
        <div style="font-size:.6rem;color:#666;text-align:right">
          <div style="font-weight:700;color:#888">${t('next_category')}</div>
          <div style="font-weight:900;color:${nextGroup.cor}">${nextGroup.title}</div>
        </div>`:`<div style="font-size:.72rem;font-weight:900;color:#fbbf24">${t('max_badge')}</div>`}
      </div>
      <div style="height:10px;background:#111;border-radius:99px;overflow:hidden;border:2px solid #2a2a2a;margin-bottom:.5rem">
        <div style="height:100%;width:${cgPct}%;background:linear-gradient(90deg,${cor}88,${cor},#fff8);border-radius:99px;transition:width .8s ease;box-shadow:0 0 8px ${cor}66"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.68rem;font-weight:700">
        <span style="color:#666">${state.xp-cgStart} ${t('xp_in_category')}</span>
        ${nextGroup
          ?`<span style="color:${cor}">${t('missing_points')} ${xpFaltando.toLocaleString()} ${t('points')}</span>`
          :`<span style="color:#4ade80">${t('max_category')}</span>`}
      </div>
    </div>`;

  const initialIdx=groups.findIndex(g=>g.status==='current');
  window._nivelIdx=initialIdx>=0?initialIdx:0;

  const cardsHtml=groups.map((g,i)=>{
    const img=_nivelImg(g.title);
    const isDone=g.status==='done';
    const isCurrent=g.status==='current';
    const isLocked=g.status==='locked';
    const gc=g.cor;
    const unlocked=isDone||isCurrent;

    // XP progress bar (current only)
    const xpBar=isCurrent?`
      <div style="margin-bottom:.85rem">
        <div style="display:flex;justify-content:space-between;font-size:.65rem;color:#bbb;margin-bottom:.35rem;font-weight:700">
          <span>${t('step_progress')}</span><span style="color:${gc}">${cgPct}%</span>
        </div>
        <div style="height:7px;background:#1a1a1a;border-radius:99px;overflow:hidden;border:1.5px solid #2a2a2a">
          <div style="height:100%;width:${cgPct}%;background:linear-gradient(90deg,${gc}88,${gc});border-radius:99px"></div>
        </div>
      </div>`:'';

    const statusBadge=isDone
      ?`<div style="font-size:.6rem;font-weight:800;border-radius:20px;padding:.18rem .55rem;background:#22c55e;color:#fff;border:1.5px solid rgba(255,255,255,.15)">${t('done_badge')}</div>`
      :isCurrent
      ?`<div style="font-size:.6rem;font-weight:800;border-radius:20px;padding:.18rem .55rem;background:${gc};color:#111;border:1.5px solid rgba(255,255,255,.15)">${t('here_badge')}</div>`
      :`<div style="font-size:.6rem;font-weight:800;border-radius:20px;padding:.18rem .55rem;background:#1e1e1e;color:#555;border:1.5px solid #333">🔒 ${t('level')} ${g.range[0]}+</div>`;

    const rangeBadge=`<div style="font-size:.6rem;font-weight:800;color:${isLocked?'#555':gc};background:#0e0e0e;border:1.5px solid ${isLocked?'#2a2a2a':gc+'44'};border-radius:20px;padding:.18rem .55rem">${g.range[0]}${g.range[1]!==g.range[0]?'–'+g.range[1]:''}</div>`;

    const downloadBtn=unlocked
      ?`<button onclick="downloadNivelCard('${img}','${g.title}','${g.title}')" style="display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;padding:.75rem;background:linear-gradient(180deg,#1a2a1a,#0d1a0d);border:2.5px solid #22c55e66;border-radius:14px;font-family:var(--font-body);font-size:.88rem;font-weight:900;color:#4ade80;box-shadow:4px 4px 0 #080808;cursor:pointer;letter-spacing:.01em"><img src="assets/seta-para-cima.png" style="width:22px;height:22px;transform:rotate(180deg);flex-shrink:0"> Download</button>`
      :`<div style="display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;padding:.75rem;background:#111;border:2px solid #1e1e1e;border-radius:14px;font-family:var(--font-body);font-size:.88rem;font-weight:900;color:#2a2a2a;letter-spacing:.01em">🔒 ${t('locked')}</div>`;

    return `
    <div style="flex-shrink:0;width:82%;scroll-snap-align:center;background:#0e0e0e;border-radius:20px;border:2.5px solid ${isCurrent?gc:'#222'};overflow:hidden;box-shadow:${isCurrent?`5px 5px 0 #060606,0 0 28px ${gc}33`:'4px 4px 0 #080808'}">
      <div style="position:relative;width:100%;background:#0a0a0a">
        <img src="${img}" style="width:100%;height:auto;display:block" onerror="this.style.display='none'">
        ${isLocked?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2"><div style="font-size:3.5rem;filter:drop-shadow(0 4px 16px rgba(0,0,0,.95))">🔒</div></div>`:''}
        ${isCurrent?`<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,${gc},transparent);z-index:2"></div>`:''}
      </div>
      <div style="padding:.9rem 1rem 1rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.55rem">${statusBadge}${rangeBadge}</div>
        <div style="font-size:1.15rem;font-weight:900;color:${isLocked?'#555':gc};margin-bottom:.3rem;letter-spacing:-.01em">${t(g.titleKey)||g.title}</div>
        ${xpBar}
        ${downloadBtn}
      </div>
    </div>`;
  }).join('');

  const dotsHtml=groups.map((g,i)=>`<div class="nivel-dot" style="height:7px;border-radius:99px;background:#333;transition:all .3s ease;cursor:pointer" onclick="nivelCarouselGo(${i})"></div>`).join('');

  return `
    <div class="back-row">
      <button class="back-btn" onclick="playClickSfx('back');state.phase='start';render()">${t('back_btn')}</button>
      <span class="page-title">${t('levels')}</span>
    </div>

    ${progressHeader}

    <div style="position:relative;width:100%;max-width:520px;margin-bottom:.75rem">
      <button onclick="nivelCarouselNav(-1)" style="position:absolute;left:0;top:50%;transform:translateY(-50%);z-index:10;background:rgba(10,10,10,.85);border:1.5px solid #333;border-radius:50%;width:36px;height:36px;color:#ccc;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)">‹</button>
      <button onclick="nivelCarouselNav(1)" style="position:absolute;right:0;top:50%;transform:translateY(-50%);z-index:10;background:rgba(10,10,10,.85);border:1.5px solid #333;border-radius:50%;width:36px;height:36px;color:#ccc;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)">›</button>
      <div id="nivel-carousel" onscroll="nivelCarouselOnScroll()" style="display:flex;overflow-x:scroll;scroll-snap-type:x mandatory;scroll-behavior:smooth;gap:.75rem;padding:0 9%;scrollbar-width:none;-webkit-overflow-scrolling:touch">
        ${cardsHtml}
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:center;gap:.4rem;padding:.5rem 0 1.5rem">
      ${dotsHtml}
    </div>
  `;
}

function nivelCarouselInit(){
  requestAnimationFrame(()=>{
    const c=document.getElementById('nivel-carousel');
    if(!c)return;
    const idx=window._nivelIdx||0;
    const card=c.children[idx];
    if(card)card.scrollIntoView({behavior:'instant',inline:'center',block:'nearest'});
    _nivelUpdateDots();
  });
}
function nivelCarouselNav(dir){
  playClickSfx('soft');
  const c=document.getElementById('nivel-carousel');
  if(!c)return;
  const n=c.children.length;
  window._nivelIdx=Math.max(0,Math.min(n-1,(window._nivelIdx||0)+dir));
  c.children[window._nivelIdx].scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
  _nivelUpdateDots();
}
function nivelCarouselGo(idx){
  const c=document.getElementById('nivel-carousel');
  if(!c)return;
  window._nivelIdx=idx;
  c.children[idx].scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
  _nivelUpdateDots();
}
function nivelCarouselOnScroll(){
  const c=document.getElementById('nivel-carousel');
  if(!c)return;
  const cx=c.getBoundingClientRect().left+c.clientWidth/2;
  let best=0,bestD=Infinity;
  Array.from(c.children).forEach((el,i)=>{
    const r=el.getBoundingClientRect();
    const d=Math.abs(r.left+r.width/2-cx);
    if(d<bestD){bestD=d;best=i;}
  });
  window._nivelIdx=best;
  _nivelUpdateDots();
}
function _nivelUpdateDots(){
  const idx=window._nivelIdx||0;
  document.querySelectorAll('.nivel-dot').forEach((d,i)=>{
    d.style.background=i===idx?NIVEL_GROUPS[i].cor:'#333';
    d.style.width=i===idx?'18px':'7px';
  });
}

// ── Modal de Nível ────────────────────────────────────────────
let nivelModal=null;
function openNivelModal(idx){
  closeNivelModal();
  const g=NIVEL_GROUPS[idx];
  const lIdx=getLvlIdx(state.xp);
  const currentLvl=LEVELS[lIdx].n;
  const [from,to]=g.range;
  let status='locked';
  if(currentLvl>to) status='done';
  else if(currentLvl>=from) status='current';

  const img=_nivelImg(g.title);
  const cor=g.cor;
  const xpNeeded=LEVEL_XP_START[from-1];
  const isDone=status==='done';
  const isCurrent=status==='current';
  const isLocked=status==='locked';

  // Progresso dentro do grupo atual
  let progressBar='';
  if(isCurrent){
    const groupStart=LEVEL_XP_START[from-1];
    const groupEnd=to===100?999999:LEVEL_XP_START[to];
    const pct=Math.min(Math.round((state.xp-groupStart)/(groupEnd-groupStart)*100),100);
    progressBar=`
      <div style="margin-bottom:1rem">
        <div style="display:flex;justify-content:space-between;font-size:.72rem;color:#bbb;margin-bottom:.4rem">
          <span>${t('step_progress')}</span><span style="color:${cor};font-weight:800">${pct}%</span>
        </div>
        <div style="height:8px;background:#1a1a1a;border-radius:99px;overflow:hidden;border:1.5px solid #2a2a2a">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${cor}88,${cor});border-radius:99px;transition:width .6s ease"></div>
        </div>
      </div>`;
  }

  const statusTag=isDone
    ? `<div style="display:inline-flex;align-items:center;gap:.4rem;background:#14521433;border:1.5px solid #22c55e55;border-radius:20px;padding:.3rem .8rem;font-size:.78rem;font-weight:800;color:#4ade80;margin-bottom:.9rem">${t('step_done')}</div>`
    : isCurrent
    ? `<div style="display:inline-flex;align-items:center;gap:.4rem;background:${cor}18;border:1.5px solid ${cor}55;border-radius:20px;padding:.3rem .8rem;font-size:.78rem;font-weight:800;color:${cor};margin-bottom:.9rem">${t('step_current')}</div>`
    : `<div style="display:inline-flex;align-items:center;gap:.4rem;background:#33333333;border:1.5px solid #444;border-radius:20px;padding:.3rem .8rem;font-size:.78rem;font-weight:800;color:#555;margin-bottom:.9rem">${t('step_locked')} ${from}</div>`;

  const overlay=document.createElement('div');
  overlay.id='nivel-modal-overlay';
  overlay.style.cssText='position:fixed;inset:0;z-index:8000;background:#080808;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto;';
  overlay.onclick=e=>{if(e.target===overlay)closeNivelModal();};

  overlay.innerHTML=`
    <div style="width:100%;max-width:520px;min-height:100vh;display:flex;flex-direction:column;position:relative;">
      <!-- fechar -->
      <button onclick="closeNivelModal()" style="position:fixed;top:1rem;right:1rem;z-index:9001;background:rgba(10,10,10,.95);border:1.5px solid #3a3a3a;border-radius:50%;width:40px;height:40px;color:#ccc;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)">✕</button>

      <!-- imagem grande -->
      <div style="width:100%;background:radial-gradient(ellipse at 50% 45%,#1e1a10 0%,#080808 100%);display:flex;align-items:center;justify-content:center;padding:3.5rem 0 2rem;flex-shrink:0;border-bottom:2px solid ${cor}22;position:relative;">
        ${isLocked?`<div style="position:absolute;inset:0;background:#08080888;display:flex;align-items:center;justify-content:center;font-size:4rem;z-index:2">🔒</div>`:''}
        <img src="${img}" style="height:55vh;width:auto;max-width:90%;object-fit:contain;filter:drop-shadow(0 20px 60px rgba(0,0,0,1)) drop-shadow(0 0 40px ${cor}33)${isLocked?';filter:brightness(.35) grayscale(.5)':''}"
          onerror="this.style.display='none'">
      </div>

      <!-- painel info -->
      <div style="flex:1;background:#0e0e0e;padding:1.5rem 1.3rem 3rem;border-top:2.5px solid ${cor}33;">
        ${statusTag}
        <div style="font-size:1.6rem;font-weight:900;color:${isLocked?'#555':cor};margin-bottom:.25rem;letter-spacing:-.02em">${t(g.titleKey)||g.title}</div>
        <div style="font-size:.82rem;color:#666;font-weight:700;margin-bottom:.85rem">
          ${t('levels_range')} ${g.range[0]}${g.range[1]!==g.range[0]?' – '+g.range[1]:''}
        </div>
        ${progressBar}
        ${!isDone&&!isCurrent?`<div style="font-size:.8rem;color:#555;display:flex;align-items:center;gap:.4rem">⭐ ${state.lang==='en'?'Required XP:':state.lang==='es'?'XP necesario:':'XP necessário:'} <strong style="color:#666">${xpNeeded.toLocaleString()} XP</strong></div>`:''}
        ${isDone?`<div style="font-size:.8rem;color:#4ade8088;display:flex;align-items:center;gap:.4rem">✓ ${state.lang==='en'?'You have already passed this stage.':state.lang==='es'?'Ya superaste esta etapa.':'Você já superou esta etapa da jornada.'}</div>`:''}
      </div>
    </div>`;

  document.body.appendChild(overlay);
  nivelModal=overlay;
  playClickSfx('soft');
}
function closeNivelModal(){
  if(nivelModal){nivelModal.remove();nivelModal=null;}
}

async function downloadNivelCard(imgSrc, titulo, categoria){
  playClickSfx('soft');
  const userName=state.user?.displayName||state.user?.email?.split('@')[0]||'Jogador';
  await document.fonts.ready;
  const img=await new Promise((res,rej)=>{
    const i=new Image();
    i.crossOrigin='anonymous';
    i.onload=()=>res(i);
    i.onerror=()=>rej();
    i.src=imgSrc;
  }).catch(()=>null);
  if(!img){
    const a=document.createElement('a');
    a.href=imgSrc; a.download=titulo+'.png'; a.click();
    return;
  }
  const c=document.createElement('canvas');
  c.width=img.naturalWidth; c.height=img.naturalHeight;
  const ctx=c.getContext('2d');
  ctx.drawImage(img,0,0);
  const W=c.width, H=c.height;
  // vinheta suave na parte inferior
  const vigH=H*0.36;
  const grd=ctx.createLinearGradient(0,H-vigH,0,H);
  grd.addColorStop(0,'rgba(0,0,0,0)');
  grd.addColorStop(0.5,'rgba(0,0,0,0.28)');
  grd.addColorStop(1,'rgba(0,0,0,0.62)');
  ctx.fillStyle=grd;
  ctx.fillRect(0,H-vigH,W,vigH);
  const mb=H*0.055;  // margem inferior
  const gap=H*0.038; // espaço entre as duas linhas
  ctx.textAlign='center';
  ctx.textBaseline='bottom';
  // categoria — Poppins 400 itálico, papel envelhecido suave
  ctx.font=`400 italic ${Math.round(W*0.04)}px 'Poppins',sans-serif`;
  ctx.fillStyle='rgba(240,224,176,0.78)';
  ctx.shadowColor='rgba(0,0,0,0.92)';
  ctx.shadowBlur=14;
  ctx.shadowOffsetY=1;
  ctx.fillText(categoria,W/2,H-mb);
  // nome do usuário — Poppins 700, papel envelhecido
  ctx.font=`700 ${Math.round(W*0.0576)}px 'Poppins',sans-serif`;
  ctx.fillStyle='#F0E0B0';
  ctx.shadowBlur=18;
  ctx.fillText(userName,W/2,H-mb-gap);
  ctx.shadowBlur=0;
  c.toBlob(blob=>{
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=titulo+'.png'; a.click();
    URL.revokeObjectURL(url);
  },'image/png');
}

