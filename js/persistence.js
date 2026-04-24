// ── Persistência de streak via localStorage ───────────────────
function saveStreak(){
  try{localStorage.setItem('kp_streak',state.streak);
      localStorage.setItem('kp_bestStreak',state.bestStreak);}catch(e){}
}
function loadStreak(){
  try{
    const s=parseInt(localStorage.getItem('kp_streak')||'0');
    const b=parseInt(localStorage.getItem('kp_bestStreak')||'0');
    if(s>0){state.streak=s;}
    if(b>0){state.bestStreak=b;}
  }catch(e){}
}
loadStreak();

// ── Firestore: salvar e carregar progresso ────────────────────
function saveProgress(){
  if(!state.user)return;
  _saveTimer=null;
  if(_saveMaxTimer){clearTimeout(_saveMaxTimer);_saveMaxTimer=null;}
  db.collection('players').doc(state.user.uid).set({
    displayName:state.user.displayName||'',
    xp:state.xp,
    notas:state.notas,
    moedas:state.moedas,
    diamantes:state.diamantes,
    bestStreak:state.bestStreak,
    stats:state.stats,
    chordStats:state.chordStats,
    violaoEquipado:state.violaoEquipado,
    violoesComprados:state.violoesComprados,
    inventario:state.inventario,
    firstCardSeen:state.firstCardSeen,
    ratingDone:state.ratingDone,
    ratingSkippedAt:state.ratingSkippedAt,
  },{merge:true}).catch(e=>console.error('saveProgress error:',e));
}
async function loadProgress(uid){
  try{
    const doc=await db.collection('players').doc(uid).get();
    if(doc.exists){
      const d=doc.data();
      if(d.xp!=null)state.xp=d.xp;
      if(d.notas!=null)state.notas=d.notas;
      if(d.moedas!=null)state.moedas=d.moedas;
      if(d.diamantes!=null)state.diamantes=d.diamantes;
      if(d.bestStreak!=null)state.bestStreak=d.bestStreak;
      if(d.stats)state.stats=d.stats;
      if(d.chordStats)state.chordStats=d.chordStats;
      if(d.violaoEquipado)state.violaoEquipado=d.violaoEquipado;
      if(d.violoesComprados)state.violoesComprados=d.violoesComprados;
      if(d.inventario)state.inventario=d.inventario;
      if(d.firstCardSeen!=null)state.firstCardSeen=d.firstCardSeen;
      if(d.ratingDone!=null)state.ratingDone=d.ratingDone;
      if(d.ratingSkippedAt!=null)state.ratingSkippedAt=d.ratingSkippedAt;
      state.xpDisplay=state.xp;
    }
  }catch(e){console.error('loadProgress error:',e);}
}

