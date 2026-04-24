// ── Detecção de idioma ────────────────────────────────────────
(function(){
  const savedLang=localStorage.getItem('kaiserplay_lang');
  if(savedLang){
    state.lang=savedLang;
  } else {
    const nav=navigator.language||navigator.userLanguage||'pt';
    const _l=nav.toLowerCase();
    state.lang=_l.startsWith('pt')?'pt':_l.startsWith('es')?'es':'en';
  }
})();

// ── 9. INICIALIZAÇÃO ──────────────────────────────────────────
auth.onAuthStateChanged(async user=>{
  state.user=user||null;
  if(user){
    state.isGuest=false;
    await loadProgress(user.uid);
    if(state.phase==='login'||state.phase==='set_display_name'){
      if(state._pendingDisplayName){state.phase='set_display_name';state._pendingDisplayName=false;}
      else{state.phase='start';}
    }
  } else {
    state.rankingData=[];
    // Only redirect to login if not in guest mode
    if(!state.isGuest){state.phase='login';}
  }
  try{render();}catch(e){console.error('render error:',e);}
});

// ── Fretboard: delegação de clique (registrado uma vez, nunca dentro do render) ──
document.getElementById('content').addEventListener('click',function(e){
  if(!state.isFretboard)return;
  if(state.phase!=='question'&&state.phase!=='treino_focado_question')return;
  let el=e.target;
  while(el&&!el.dataset.fbk&&el!==this)el=el.parentElement;
  if(!el||!el.dataset.fbk)return;
  const k=el.dataset.fbk,parts=k.split('-').map(Number);
  if(state.fbSel[k]){delete state.fbSel[k];}
  else{state.fbSel[k]=true;playFbNoteClick(FB_OPEN[parts[0]]+parts[1]);}
  render();
});

