// ── ONBOARDING SYSTEM ─────────────────────────────────────────
const OB_STEPS=[
  {centered:true,
   title:{pt:'BEM-VINDO',en:'WELCOME',es:'BIENVENIDO'},
   pt:'Aqui é <span style="color:#F5A623;font-weight:900">Marcos Kaiser</span> e vou te ensinar como usar o App.<br><br>Seu ouvido nunca mais será o mesmo!',
   en:'I\'m <span style="color:#F5A623;font-weight:900">Marcos Kaiser</span> and I\'ll show you how to use the App.<br><br>Your ear will never be the same!',
   es:'Soy <span style="color:#F5A623;font-weight:900">Marcos Kaiser</span> y te enseñaré cómo usar la App.<br><br>¡Tu oído nunca más será el mismo!'},
  {id:'ob-harmonica',
   pt:'Ouça acordes e tente identificar o nome pelo som.',
   en:'Listen to chords and try to identify them by ear.',
   es:'Escucha acordes e intenta identificarlos por el sonido.'},
  {id:'ob-focused',
   pt:'Treine os acordes que você mais erra.',
   en:'Train the chords you miss the most.',
   es:'Entrena los acordes que más fallas.'},
  {id:'ob-sala',
   pt:'Método simples para melhorar o seu ouvido.',
   en:'A simple method to improve your ear.',
   es:'Un método simple para mejorar tu oído.'},
  {id:'ob-loja',
   pt:'Compre itens para ganhar mais pontos no jogo ou tablaturas para você estudar.',
   en:'Buy items to earn more points in the game, or tabs to practice.',
   es:'Compra artículos para ganar más puntos en el juego o tablaturas para estudiar.'},
  {id:'ob-inventario',
   pt:'É aqui que ficam os seus itens.',
   en:'This is where your items are stored.',
   es:'Aquí se guardan tus artículos.'},
];
function _obFlag(k){try{return localStorage.getItem(k)==='1';}catch(e){return false;}}
function _obSetFlag(k){try{localStorage.setItem(k,'1');}catch(e){}}
function updateObOverlay(){
  _maybeInitOb();
  const root=document.getElementById('ob-root');if(!root)return;
  // Main onboarding
  if(state.onbStep!==null&&state.onbStep>=0&&state.phase==='start'){
    const step=OB_STEPS[state.onbStep];
    if(!step){obEnd();return;}
    const txt=state.lang==='en'?step.en:state.lang==='es'?step.es:step.pt;
    if(step.centered){
      const title=state.lang==='en'?step.title.en:state.lang==='es'?step.title.es:step.title.pt;
      _drawCenteredModal(root,title,txt,'obNext()');
      return;
    }
    const target=document.getElementById(step.id);
    if(!target){root.innerHTML='';return;}
    document.body.style.overflow='';
    target.scrollIntoView({behavior:'instant',block:'center'});
    document.body.style.overflow='hidden';
    _drawTooltip(root,target,txt,state.onbStep===OB_STEPS.length-1,'obNext()','obSkip()',state.onbStep+1,OB_STEPS.length);
    return;
  }
  root.innerHTML='';
}
function _drawCenteredModal(root,title,body,nextFn){
  const okLabel='OK';
  root.innerHTML=`
    <div style="position:fixed;inset:0;z-index:8999;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:1.5rem;animation:obFadeIn .28s ease">
      <div style="background:#181818;border:2.5px solid #F5A623;border-radius:22px;padding:2rem 1.6rem 1.5rem;max-width:290px;width:100%;box-shadow:0 12px 48px rgba(0,0,0,.9);text-align:center">
        <div style="font-family:var(--font-title);font-size:2rem;font-weight:700;color:#F5A623;letter-spacing:.04em;margin-bottom:.6rem">${title}</div>
        <div style="width:40px;height:3px;background:#F5A623;border-radius:2px;margin:0 auto .9rem"></div>
        <p style="font-size:.95rem;color:#ddd;font-weight:500;line-height:1.6;margin:0 0 1.5rem">${body}</p>
        <button onclick="${nextFn}" style="background:linear-gradient(180deg,#F5A623,#d48a10);border:2px solid #111;border-radius:12px;padding:.55rem 2.2rem;font-family:var(--font-body);font-size:.9rem;font-weight:900;color:#111;cursor:pointer;text-shadow:none;display:inline-block">${okLabel}</button>
      </div>
    </div>`;
}
function _drawTooltip(root,target,text,isLast,nextFn,skipFn,stepN,stepTotal,noNext){
  const rect=target.getBoundingClientRect();
  const vw=window.innerWidth,vh=window.innerHeight;
  const ttW=Math.min(272,vw-28);const ttH=130;const gap=10;
  const spaceBelow=vh-(rect.bottom+gap);
  let ttTop,arrowDir;
  if(spaceBelow>=ttH||spaceBelow>=rect.top-gap){ttTop=rect.bottom+gap+6;arrowDir='up';}
  else{ttTop=rect.top-ttH-gap-6;arrowDir='down';}
  let ttLeft=(rect.left+rect.width/2)-ttW/2;
  ttLeft=Math.max(8,Math.min(ttLeft,vw-ttW-8));
  const arrowOff=Math.max(12,Math.min((rect.left+rect.width/2)-ttLeft-9,ttW-22));
  const nextLabel=state.lang==='en'?'Next':state.lang==='es'?'Siguiente':'Próximo';
  const skipLabel=state.lang==='en'?'Skip':state.lang==='es'?'Saltar':'Pular';
  const dots=Array.from({length:stepTotal},(_,i)=>`<span style="display:inline-block;width:${i===stepN-1?'18px':'7px'};height:7px;border-radius:4px;background:${i===stepN-1?'#F5A623':'#444'};transition:all .2s;margin:0 2px"></span>`).join('');
  const nextBtn=noNext?'':`<button onclick="${nextFn}" style="background:linear-gradient(180deg,#F5A623,#d48a10);border:2px solid #111;border-radius:10px;padding:.35rem .9rem;font-family:var(--font-body);font-size:.8rem;font-weight:900;color:#111;cursor:pointer;text-shadow:none">${isLast?'OK':nextLabel}</button>`;
  root.innerHTML=`
    <div style="position:fixed;inset:0;z-index:8997;pointer-events:none">
      <div style="position:absolute;left:${rect.left-6}px;top:${rect.top-6}px;width:${rect.width+12}px;height:${rect.height+12}px;border-radius:16px;box-shadow:0 0 0 9999px rgba(0,0,0,.75);border:2px solid #F5A623;pointer-events:none"></div>
    </div>
    <div style="position:fixed;left:${ttLeft}px;top:${ttTop}px;width:${ttW}px;z-index:8999;pointer-events:all;animation:obFadeIn .22s ease">
      ${arrowDir==='up'?`<div style="position:absolute;top:-7px;left:${arrowOff}px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:8px solid #F5A623"></div>`:''}
      <div style="background:#181818;border:2px solid #F5A623;border-radius:16px;padding:.85rem 1rem .75rem;box-shadow:0 8px 24px rgba(0,0,0,.8)">
        <p style="font-size:.86rem;color:#eee;font-weight:600;line-height:1.5;margin:0 0 .75rem">${text}</p>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;align-items:center;gap:0">${dots}</div>
          <div style="display:flex;align-items:center;gap:.6rem">
            <button onclick="${skipFn}" style="background:transparent;border:none;color:#555;font-size:.72rem;font-weight:600;font-family:var(--font-body);cursor:pointer;padding:0;text-shadow:none">${skipLabel}</button>
            ${nextBtn}
          </div>
        </div>
      </div>
      ${arrowDir==='down'?`<div style="position:absolute;bottom:-7px;left:${arrowOff}px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid #F5A623"></div>`:''}
    </div>`;
}
function obNext(){
  if(state.onbStep===null)return;
  state.onbStep++;
  if(state.onbStep>=OB_STEPS.length){obEnd();return;}
  clearTimeout(_obTimer);_obTimer=setTimeout(updateObOverlay,40);
}
function obSkip(){obEnd();}
function obEnd(){
  state.onbStep=null;
  _obSetFlag('ob_done');
  document.body.style.overflow='';
  const el=document.getElementById('ob-root');if(el)el.innerHTML='';
}
// Inicialização automática — só na primeira vez (flag persistida em localStorage)
function _maybeInitOb(){
  if(state.phase==='start'&&state.onbStep===null&&!_obFlag('ob_done')){
    state.onbStep=0;
    document.body.style.overflow='hidden';
  }
}


