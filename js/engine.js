// ── 4. ESTADO E MOTOR DO JOGO ─────────────────────────────────
// ── State ─────────────────────────────────────────────────────
const LEVEL_XP_START=LEVELS.reduce((acc,l,i)=>{
  acc.push(i===0?0:acc[i-1]+LEVELS[i-1].xpToNext);
  return acc;
},[]);

function getLvlIdx(xp){
  for(let i=LEVELS.length-1;i>=0;i--){if(xp>=LEVEL_XP_START[i])return i;}
  return 0;
}
function getLvlStartXP(idx){return LEVEL_XP_START[idx]||0;}

const state={
  tab:'game',phase:'start',
  user:null,
  lang:null,
  isGuest:true,guestExerciseCount:0,guestNextPrompt:3,guestPopupCount:0,showGuestPopup:false,
  journeyAnswered:0,pendingFocusedPromo:false,showFocusedPromo:false,
  chord:null,choices:[],selected:null,
  xp:0,xpDisplay:0,streak:0,bestStreak:0,score:0,result:null,
  stats:{t:0,c:0},
  chordStats:{},
  playing:false,lvlUpPending:false,lvlUpFromFocused:false,
  notas:GAME_CONFIG.initialNotas,moedas:GAME_CONFIG.initialMoedas,diamantes:GAME_CONFIG.initialDiamantes,
  inventario:[],
  violaoEquipado:'violao_basico',
  violoesComprados:['violao_basico'],
  coinPopAnim:false,
  isBonus:false,
  isFretboard:false,
  fbSel:{},
  diamondToggle:0,commonQCount:0,
  isQuality:false,
  qualityAnswer:null,
  qualitySelected:null,
  qualityPair:null,
  questionCount:0,nextDiamondAt:0,
  journeyMode:'harmonic',
  firstCardSeen:false,
  lvlUpIsNewGroup:false,
  focusedSwitches:{maior_menor:false,menor_diminuto:false,diminuto_meio_diminuto:false,diminuto_aumentado:false,triades_maiores:false,triades_menores:false,tetrades_maiores:false,tetrades_menores:false,inversoes:false,dissonantes:false,extensoes:false,xm7M:false,bossa_jazz:false,acordes_complexos:false},
  fretboardSwitches:{fb_triades:false,fb_tetrades:false,fb_complexos:false},
  fretboardExercise:false,
  salaStep:0, salaActiveStep:0, salaOpenStep:0, salaFbSel:{}, salaVerified:false, salaVerifyOk:false, salaCorrectCount:0, salaP4Review:null,
  focusedPool:[],isSmartSession:false,smartWeakQualities:[],smartActivePairs:[],focusedStreak:0,focusedSessionScore:0,focusedSessionTotal:0,focusedSessionCorrect:0,
  onbStep:null,
  _pendingDisplayName:false,
  fullAccess:GAME_CONFIG.fullAccess,
  rankingData:[], rankingLoading:false,
  ratingDone:false,
  ratingSkippedAt:0,
  unlockPopupDismissed:false,
};

let autoTimer=null;

function getFlames(s){if(s>=9)return'🔥🔥🔥';if(s>=6)return'🔥🔥';if(s>=3)return'🔥';return'';}
function getBonusLabel(s){const p=t('points');const b=state.lang==='en'?'bonus':state.lang==='es'?'bonificación':'bônus';if(s>=9)return`+20 ${p} ${b}`;if(s>=6)return`+12 ${p} ${b}`;if(s>=3)return`+5 ${p} ${b}`;if(s>=2)return`+2 ${p} ${b}`;return '';}
// ── Novo sistema de combo ─────────────────────────────────────
function comboMultiplier(streak){return streak<1?1:Math.floor(streak/5)+1;}
function comboPoints(streak){return 10*streak*comboMultiplier(streak);}
function comboColor(mult){
  if(mult===1)return'#22c55e';
  if(mult===2)return'#F5A623';
  if(mult===3)return'#f472b6';
  if(mult===4)return'#60dcff';
  return'#c084fc';
}
function comboEmoji(streak){
  if(streak>=20)return'⚡';
  if(streak>=15)return'💥';
  if(streak>=10)return'🔥🔥🔥';
  if(streak>=6)return'🔥🔥';
  if(streak>=3)return'🔥';
  if(streak>=2)return'✨';
  return'🎵';
}
function getAcc(){return state.stats.t>0?Math.round(state.stats.c/state.stats.t*100):0;}


function _fretboardInterval(lvlN){
  if(lvlN<=20) return 5;
  if(lvlN<=40) return 4;
  if(lvlN<=60) return 3;
  return 2;
}

function _qualityChance(lvlN){
  const cat=Math.ceil(lvlN/10); // categoria 1-10
  if(cat>=10)return 0;          // categoria 10 (níveis 91-100): zero
  return 1/(cat+1);             // cat1=1/2, cat2=1/3, cat3=1/4, ...
}

function genQ(){
  state.questionCount++;
  state.isFretboard=false;
  state.fbSel={};
  state.isQuality=false;
  state.qualityAnswer=null;
  state.qualitySelected=null;
  state.qualityPair=null;

  // ── JORNADA PELAS CORDAS ──────────────────────────────────
  if(state.journeyMode==='cordas'){
    if(!state.nextDiamondAt) state.nextDiamondAt=Math.floor(Math.random()*5)+6;
    state.isBonus=(state.questionCount>=state.nextDiamondAt);
    if(state.isBonus){
      state.nextDiamondAt=state.questionCount+Math.floor(Math.random()*5)+6;
      const _prev=state.chord?.id;
      let ans=CHORDS_DIAMOND[Math.floor(Math.random()*CHORDS_DIAMOND.length)];
      if(CHORDS_DIAMOND.length>1&&_prev!=null&&ans.id===_prev){const alt=CHORDS_DIAMOND.filter(c=>c.id!==_prev);if(alt.length>0)ans=alt[Math.floor(Math.random()*alt.length)];}
      state.chord=ans;state.isFretboard=true;state.selected=null;state.result=null;
      return;
    }
    const _lvlC=LEVELS[getLvlIdx(state.xp)].n;
    const _rawC=_poolForCordas(_lvlC);
    const _poolC=_rawC==='ALL'?[...CHORDS,...CHORDS_DIAMOND]:_rawC.map(id=>CHORDS.find(c=>c.id===id)).filter(Boolean);
    const _prevC=state.chord?.id;
    let ansC=_poolC[Math.floor(Math.random()*_poolC.length)];
    if(_poolC.length>1&&_prevC!=null&&ansC.id===_prevC){const alt=_poolC.filter(c=>c.id!==_prevC);if(alt.length>0)ansC=alt[Math.floor(Math.random()*alt.length)];}
    state.chord=ansC;state.isFretboard=true;state.selected=null;state.result=null;
    return;
  }

  // ── JORNADA HARMÔNICA ─────────────────────────────────────
  // ── 1. Pergunta Diamante (a cada 6–10 perguntas) ──────────
  if(!state.nextDiamondAt) state.nextDiamondAt=Math.floor(Math.random()*5)+6;
  state.isBonus=(state.questionCount>=state.nextDiamondAt);
  if(state.isBonus){
    state.nextDiamondAt=state.questionCount+Math.floor(Math.random()*5)+6;
    const pool=CHORDS_DIAMOND;
    const _prev=state.chord?.id;
    let ans=pool[Math.floor(Math.random()*pool.length)];
    if(pool.length>1&&_prev!=null&&ans.id===_prev){const alt=pool.filter(c=>c.id!==_prev);if(alt.length>0)ans=alt[Math.floor(Math.random()*alt.length)];}
    state.chord=ans;
    state.choices=[ans,..._pickWrong(ans,pool)].sort(()=>Math.random()-.5);
    state.selected=null;state.result=null;
    return;
  }

  // ── 3. Pergunta de Qualidade (chance por nível) ───────────
  const lIdx=getLvlIdx(state.xp);
  const lvlN=LEVELS[lIdx].n;
  const chance=_qualityChance(lvlN);
  if(chance>0&&Math.random()<chance){
    const PAIRS=[
      {opts:['maior','menor'],         labels:['Maior','Menor'],          ids:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,163]},
      {opts:['menor','diminuto'],      labels:['Menor','Diminuto'],       ids:[7,8,9,10,11,12,13,163]},
      {opts:['diminuto','meio-diminuto'],labels:['Diminuto','Meio Diminuto']},
      {opts:['diminuto','aumentado'],  labels:['Diminuto','Aumentado']},
    ];
    const dimPool=[...CHORDS_DIAMOND.filter(c=>c.quality==='diminuto'),...CHORDS_DIAMOND.filter(c=>c.quality==='aumentado')];
    const augPool=[...CHORDS.filter(c=>c.quality==='aumentado'),...CHORDS_DIAMOND.filter(c=>c.quality==='aumentado')];
    const validPairs=PAIRS.filter(p=>{
      if(p.opts[0]==='maior'&&p.opts[1]==='menor') return true;
      if(lvlN<5) return false;
      if(p.opts[1]==='meio-diminuto') return lvlN>6;
      if(p.opts[0]==='diminuto'&&p.opts[1]==='aumentado'){
        return dimPool.some(c=>c.quality==='diminuto')&&augPool.some(c=>c.quality==='aumentado');
      }
      return true;
    });
    const pair=validPairs[Math.floor(Math.random()*validPairs.length)];
    let pool;
    if(pair.opts[0]==='diminuto'&&pair.opts[1]==='aumentado'){
      pool=[...CHORDS_DIAMOND.filter(c=>c.quality==='diminuto'),...CHORDS.filter(c=>c.quality==='aumentado'),...CHORDS_DIAMOND.filter(c=>c.quality==='aumentado')];
    }else if(pair.opts[1]==='meio-diminuto'){
      pool=[...CHORDS_DIAMOND.filter(c=>c.quality==='diminuto'),...CHORDS_DIAMOND.filter(c=>[125,126,127,128,145].includes(c.id))];
    }else if(pair.opts[1]==='diminuto'){
      const menores=pair.ids.map(id=>CHORDS.find(c=>c.id===id)).filter(Boolean);
      const dims=CHORDS_DIAMOND.filter(c=>c.quality==='diminuto');
      pool=[...menores,...dims];
    }else{
      pool=pair.ids.map(id=>CHORDS.find(c=>c.id===id)).filter(Boolean);
    }
    const _prevId=state.chord?.id;
    let chord=pool[Math.floor(Math.random()*pool.length)];
    if(pool.length>1&&_prevId!=null&&chord.id===_prevId){const _alt=pool.filter(c=>c.id!==_prevId);if(_alt.length>0)chord=_alt[Math.floor(Math.random()*_alt.length)];}
    state.chord=chord;
    state.isQuality=true;
    state.qualityAnswer=chord.quality??([125,126,127,128,145].includes(chord.id)?'meio-diminuto':null);
    state.qualityPair=pair;
    state.selected=null;state.result=null;
    return;
  }

  // ── 4. Pergunta Normal ────────────────────────────────────
  const lvlPool=LEVELS[lIdx].pool;
  const pool=lvlPool==='ALL'?[...CHORDS,...CHORDS_DIAMOND]:lvlPool.map(id=>CHORDS.find(c=>c.id===id)).filter(Boolean);
  const _prevIdN=state.chord?.id;
  let ans=pool[Math.floor(Math.random()*pool.length)];
  if(pool.length>1&&_prevIdN!=null&&ans.id===_prevIdN){const _altN=pool.filter(c=>c.id!==_prevIdN);if(_altN.length>0)ans=_altN[Math.floor(Math.random()*_altN.length)];}
  const wrong=_pickWrong(ans,pool);
  state.chord=ans;
  state.choices=[ans,...wrong].sort(()=>Math.random()-.5);
  state.selected=null;state.result=null;
}

// ── Grupos sonoros para seleção inteligente de alternativas ───
const SONIC_GROUP={
  // BRILHANTE: maiores, maj7, 6ª maior, inversões de acorde maior
  brilhante:[0,1,2,3,4,5,6,          // C D E F G A B
             57,60,156,               // D F F (voicings alt maiores)
             21,22,23,24,25,26,157,   // C7M D7M E7M F7M G7M B7M G7M(alt)
             44,45,                   // A7M C6
             39,162,                  // E6 E6(alt)
             166,169,172],            // E/G# C7M/E B/A (inversões maiores)
  // SOMBRIO: menores, m7, extensões menores, inversões menores
  sombrio:[7,8,9,10,11,12,13,        // Cm Dm Em Fm Gm Am Bm
           56,58,59,163,              // Am Dm Cm Ebm (voicings/novos menores)
           27,28,29,30,31,32,43,52,  // Cm7 Dm7 Em7 Gm7 Am7 C#m7 Bm7 Fm7
           161,                       // Em7 (voicing alt)
           167,168,170,171,           // Em/G Dm/F Am/G Am/E (inversões menores)
           173,174,175,180,           // Cm7(9) Dm7(9) Em7(9) Em7(9) open
           176,177,                   // Am6 Bm6
           46,47,48,49,181,182,183,   // Am7M Bm7M Gm7M Dm7M Em7M Fm7M Abm7M
           184,185,186,189,           // Cm7M Cm7M(9) Dm7M(9) Am7M(9)
           187,188,190,191],          // Am7(9)v Cm7(9)v Am6(9) Em6(9)
  // TENSO: dom7, alterados, dim, hdim, aumentados, sus dominante
  tenso:[14,15,16,17,18,19,20,       // C7 D7 E7 F7 G7 A7 B7
         159,164,165,                 // C7 A7 Eb7 (voicings/novos dom)
         40,41,42,                    // C7M(#5) C(#5) D(#5)
         108,109,110,111,             // B7(9) B7(#9) B7(b9) A7(b9)
         113,115,116,117,118,119,120, // E7(9) D7/F# F#7(#11) G7(13) G7(#5) B7(13) B7(#5)
         121,122,123,124,             // Cdim Edim Fdim G#dim
         125,126,127,128,129,         // Bm7(b5) Em7(b5) F#m7(b5) Am7(b5) E7(#5)
         178,179],                    // A7sus4 B7sus4
  // COLORIDO: ext9, sus, inversões complexas, outros
  colorido:[33,34,35,36,37,38,       // D6 G6 Gm6 D6/F# Csus4 E7/G#
            100,101,102,103,104,105,106,107, // C7M(9) C7(9) C6(9) A(9) E(9) Em(9) Em7(9) Am(9)
            114]                      // D6 diamante
};
const _chordGroup=id=>{
  for(const[g,ids] of Object.entries(SONIC_GROUP))if(ids.includes(id))return g;
  return 'colorido'; // fallback
};
// Adjacências: grupo → grupos vizinhos em ordem de preferência
const _adjacent={brilhante:['sombrio','colorido','tenso'],sombrio:['brilhante','colorido','tenso'],tenso:['colorido','sombrio','brilhante'],colorido:['tenso','brilhante','sombrio']};

function _pickWrong(ans,pool){
  const seenCifras=new Set([ans.cifra]);
  const avail=pool.filter(c=>{if(seenCifras.has(c.cifra))return false;seenCifras.add(c.cifra);return true;});
  if(avail.length<=3)return avail.sort(()=>Math.random()-.5);
  const g=_chordGroup(ans.id);
  const sameGroup=avail.filter(c=>_chordGroup(c.id)===g).sort(()=>Math.random()-.5);
  const result=[];
  // 2 do mesmo grupo
  result.push(...sameGroup.slice(0,2));
  // completar com grupos adjacentes se necessário
  if(result.length<3){
    for(const adj of _adjacent[g]){
      const adjPool=avail.filter(c=>!result.includes(c)&&_chordGroup(c.id)===adj).sort(()=>Math.random()-.5);
      result.push(...adjPool.slice(0,3-result.length));
      if(result.length>=3)break;
    }
  }
  // fallback absoluto
  if(result.length<3){
    const rest=avail.filter(c=>!result.includes(c)).sort(()=>Math.random()-.5);
    result.push(...rest.slice(0,3-result.length));
  }
  return result.slice(0,3);
}

// ── Fretboard: toca nota individual via Howler ────────────────
const FB_CLICK_SUSTAIN=2000,FB_CLICK_FADE=600;
function playFbNoteClick(midi){
  initCompressor();
  const sn=nearestSample(midi);
  const ratio=midiToFreq(midi)/midiToFreq(sn);
  const id=howls[sn].play();
  const _fbVol=0.20*_noteBoost(midi);
  howls[sn].volume(_fbVol,id);
  if(Math.abs(ratio-1)>0.001)howls[sn].rate(ratio,id);
  setTimeout(()=>{try{howls[sn].fade(_fbVol,0,FB_CLICK_FADE,id);}catch(e){}},FB_CLICK_SUSTAIN);
}

// ── Fretboard: toca notas montadas pelo usuário (grave→agudo) ──
function playFbSelChord(){
  const keys=Object.keys(state.fbSel);
  if(!keys.length)return;
  initCompressor();
  // ordenar do grave para o agudo (igual ao playChord)
  const notes=keys.map(k=>{const p=k.split('-').map(Number);return{k,midi:FB_OPEN[p[0]]+p[1]};}).sort((a,b)=>a.midi-b.midi);
  const noteVol=1.2/keys.length;
  notes.forEach(({midi},i)=>{
    const sn=nearestSample(midi);
    const ratio=midiToFreq(midi)/midiToFreq(sn);
    setTimeout(()=>{
      const id=howls[sn].play();
      howls[sn].volume(noteVol*_noteBoost(midi),id);
      if(Math.abs(ratio-1)>0.001)howls[sn].rate(ratio,id);
    },i*110);
  });
}

// ── Fretboard: posições corretas de um acorde no braço ─────────
function getChordPositions(chord){
  const positions=[];
  const usedStrings=new Set();
  const sorted=[...chord.midi].sort((a,b)=>b-a);
  for(const midi of sorted){
    let best=null,bestFret=99;
    for(let s=0;s<6;s++){
      if(usedStrings.has(s))continue;
      const f=midi-FB_OPEN[s];
      if(f>=0&&f<=12&&f<bestFret){best={s,f};bestFret=f;}
    }
    if(best){positions.push({s:best.s,f:best.f,midi});usedStrings.add(best.s);}
  }
  return positions;
}

// ── Sala de Aula ────────────────────────────────────────────────
// Pool gerado dinamicamente: apenas acordes cujas posições no braço ficam todas até a 4ª casa
const SALA_POOL=CHORDS.filter(ch=>getChordPositions(ch).every(p=>p.f<=4)).map(ch=>ch.id);

function startSalaDeAula(){
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  const pool=SALA_POOL.map(id=>CHORDS.find(c=>c.id===id)).filter(Boolean);
  let ch;
  do{ch=pool[Math.floor(Math.random()*pool.length)];}
  while(pool.length>1&&state.chord&&ch.id===state.chord.id);
  state.chord=ch;
  state.salaStep=0;
  state.salaActiveStep=0;
  state.salaOpenStep=0;
  state.salaFbSel={};
  state.salaVerified=false;
  state.salaP4Review=null;
  state.salaVerifyOk=false;
  state.phase='sala_de_aula';
  state.playing=false;
  render();
  _salaStartTimer=setTimeout(()=>{_salaStartTimer=null;playChord(state.chord);},500);
}

function playChordHighlighted(chord,highlightNoteClasses){
  initCompressor();
  if(_playTimer){clearTimeout(_playTimer);_playTimer=null;}
  if(_fadeTimer){clearTimeout(_fadeTimer);_fadeTimer=null;}
  chord.midi.forEach(midi=>{try{howls[nearestSample(midi)].stop();}catch(e){}});
  _playingIds=[];
  state.playing=true;
  const _pbtn=document.querySelector('.play-btn');
  if(_pbtn){_pbtn.textContent=t('listening');_pbtn.classList.add('playing');}
  const hlSet=new Set(highlightNoteClasses);
  const noteDelay=110;
  chord.midi.forEach((midi,i)=>{
    const sn=nearestSample(midi);
    const ratio=midiToFreq(midi)/midiToFreq(sn);
    const isHl=hlSet.has(midi);
    const vol=isHl?0.82:0.08;
    setTimeout(()=>{
      const id=howls[sn].play();
      howls[sn].volume(vol,id);
      if(Math.abs(ratio-1)>0.001)howls[sn].rate(ratio,id);
      _playingIds.push({howl:howls[sn],id,vol});
    },i*noteDelay);
  });
  const totalDur=(chord.midi.length-1)*noteDelay+3000;
  _fadeTimer=setTimeout(()=>{
    _playingIds.forEach(({howl,id,vol})=>{try{howl.fade(vol,0,FADE_DURATION,id);}catch(e){}});
  },totalDur-FADE_DURATION);
  _playTimer=setTimeout(()=>{
    _playTimer=null;state.playing=false;
    const _pbtn2=document.querySelector('.play-btn');
    if(_pbtn2){_pbtn2.textContent=t('listen_chord');_pbtn2.classList.remove('playing');}
  },totalDur);
}

function playSalaFocus(midiArray){
  initCompressor();
  if(_playTimer){clearTimeout(_playTimer);_playTimer=null;}
  if(_fadeTimer){clearTimeout(_fadeTimer);_fadeTimer=null;}
  SAMPLE_NOTES.forEach(sn=>{try{howls[sn].stop();}catch(e){}});
  _playingIds=[];
  state.playing=true;
  const _pbtn=document.querySelector('.play-btn');
  if(_pbtn){_pbtn.textContent=t('listening');_pbtn.classList.add('playing');}
  const noteDelay=110;
  const noteVol=Math.min(0.9/midiArray.length,1);
  const played=[];
  midiArray.forEach((midi,i)=>{
    const sn=nearestSample(midi);
    const ratio=midiToFreq(midi)/midiToFreq(sn);
    setTimeout(()=>{
      const id=howls[sn].play();
      const vol=Math.min(noteVol*_noteBoost(midi),1);
      howls[sn].volume(vol,id);
      if(Math.abs(ratio-1)>0.001)howls[sn].rate(ratio,id);
      played.push({howl:howls[sn],id,vol});
      _playingIds=played;
    },i*noteDelay);
  });
  const totalDur=(midiArray.length-1)*noteDelay+3000;
  _fadeTimer=setTimeout(()=>{
    _fadeTimer=null;
    played.forEach(({howl,id,vol})=>{try{if(howl.playing(id))howl.fade(vol,0,FADE_DURATION,id);}catch(e){}});
  },totalDur-FADE_DURATION);
  _playTimer=setTimeout(()=>{
    _playTimer=null;
    played.forEach(({howl,id})=>{try{howl.stop(id);}catch(e){}});
    _playingIds=[];
    state.playing=false;
    const _pbtn2=document.querySelector('.play-btn');
    if(_pbtn2){_pbtn2.textContent=t('listen_chord');_pbtn2.classList.remove('playing');}
  },totalDur);
}

// Retorna a classe (0–11) da tônica a partir do nome do acorde
// Funciona para C, Cm, C#m7, Eb7, D7/F#, Am/G, G/B, etc.
function _chordRootClass(chord){
  const name=chord.cifra||chord.name;
  const baseMap={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const base=baseMap[name[0]];
  if(base===undefined)return 0;
  if(name[1]==='#')return(base+1)%12;
  if(name[1]==='b')return(base+11)%12;
  return base;
}

function _salaHighlightMidis(step){
  const midi=state.chord.midi;
  const sorted=[...midi].sort((a,b)=>a-b);
  if(step===1)return[sorted[sorted.length-1]];
  if(step===2)return[sorted[0]];
  if(step===3){
    // Tônica: nota mais grave cujo pitch class bate com a raiz do acorde
    const rootClass=_chordRootClass(state.chord);
    const tonicMidi=sorted.find(m=>m%12===rootClass)??sorted[0];
    // Terça: menor (3st) ou maior (4st) acima da tônica
    const third=sorted.find(m=>{const iv=((m-tonicMidi)%12+12)%12;return iv===3||iv===4;});
    return third?[tonicMidi,third]:[tonicMidi];
  }
  return[];
}

function doSalaStep(n){
  playClickSfx('soft');
  if(_salaStartTimer){clearTimeout(_salaStartTimer);_salaStartTimer=null;}
  state.salaStep=n;
  state.salaActiveStep=n;
  if(n===4){state.salaFbSel={};state.salaVerified=false;state.salaVerifyOk=false;state.salaP4Review=null;}
  if(n<=3){playSalaFocus(_salaHighlightMidis(n));}
  else{playChord(state.chord);}
  render();
}

function buildSalaFbSVG(){
  const ST=[2.2,1.8,1.4,1.1,0.9,0.7];
  let o='';
  const hL=FB_NUT_X[0]-20,hR=FB_NUT_X[5]+20;
  o+=`<svg width="${FB_SVG_W}" height="${FB_SVG_H}" viewBox="0 0 ${FB_SVG_W} ${FB_SVG_H}" xmlns="http://www.w3.org/2000/svg" style="display:block">`;
  o+=`<rect width="${FB_SVG_W}" height="${FB_SVG_H}" fill="#111"/>`;
  o+=`<line x1="${FB_NUT_X[0]}" y1="${FB_NUT_Y}" x2="${hL}" y2="${FB_HEAD_Y}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[5]}" y1="${FB_NUT_Y}" x2="${hR}" y2="${FB_HEAD_Y}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  o+=`<line x1="${hL}" y1="${FB_HEAD_Y}" x2="${hR}" y2="${FB_HEAD_Y}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  for(let sn=0;sn<6;sn++)o+=`<text x="${FB_NUT_X[sn]}" y="${FB_HEAD_Y-9}" text-anchor="middle" dominant-baseline="alphabetic" fill="#ccc" font-size="17" font-weight="700" font-family="Poppins,sans-serif">${FB_SNAMES[sn]}</text>`;
  for(let sh=0;sh<6;sh++)o+=`<line x1="${FB_NUT_X[sh]}" y1="${FB_HEAD_Y}" x2="${FB_NUT_X[sh]}" y2="${FB_NUT_Y}" stroke="#fff" stroke-width="${ST[sh]}" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[0]}" y1="${FB_NUT_Y}" x2="${FB_NUT_X[5]}" y2="${FB_NUT_Y}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[0]}" y1="${FB_NUT_Y}" x2="${FB_BOT_X[0]}" y2="${FB_NUT_Y+FB_PLAY_H}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[5]}" y1="${FB_NUT_Y}" x2="${FB_BOT_X[5]}" y2="${FB_NUT_Y+FB_PLAY_H}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  for(let ss=1;ss<=4;ss++)o+=`<line x1="${FB_NUT_X[ss]}" y1="${FB_NUT_Y}" x2="${FB_BOT_X[ss]}" y2="${FB_NUT_Y+FB_PLAY_H}" stroke="#fff" stroke-width="${ST[ss]}" stroke-linecap="round"/>`;
  for(let fw=1;fw<=12;fw++){
    const wy=FB_NUT_Y+FB_FRET_Y[fw],tn=FB_FRET_Y[fw]/FB_PLAY_H;
    const wxL=Math.round(fbStrX(0,tn)),wxR=Math.round(fbStrX(5,tn));
    o+=`<line x1="${wxL}" y1="${wy}" x2="${wxR}" y2="${wy}" stroke="#fff" stroke-width="${fw===12?2.5:1.5}" stroke-linecap="round"/>`;
  }
  [5,7].forEach(fn=>{
    const fmid=(FB_FRET_Y[fn-1]+FB_FRET_Y[fn])/2,fmy=Math.round(FB_NUT_Y+fmid);
    const tp=fmid/FB_PLAY_H;
    const mcx=Math.round((fbStrX(2,tp)+fbStrX(3,tp))/2);
    o+=`<circle cx="${mcx}" cy="${fmy}" r="5" fill="#333" stroke="#555" stroke-width="1"/>`;
  });
  for(let fl=1;fl<=12;fl++){
    const fmid=(FB_FRET_Y[fl-1]+FB_FRET_Y[fl])/2,fmy=Math.round(FB_NUT_Y+fmid);
    const flx=Math.round(fbStrX(0,fmid/FB_PLAY_H))-4;
    o+=`<text x="${flx}" y="${fmy+4}" text-anchor="end" fill="#444" font-size="11" font-family="Poppins,sans-serif">${fl}</text>`;
  }
  // Bolinhas do acorde (não interativas)
  const hlMidis=state.salaActiveStep>0?new Set(_salaHighlightMidis(state.salaActiveStep)):new Set();
  getChordPositions(state.chord).forEach(({s,f,midi})=>{
    const nc=fbNoteClass(s,f);
    const isHl=hlMidis.has(midi);
    let cx,cy,fspace;
    if(f===0){cx=FB_NUT_X[s];cy=Math.round((FB_HEAD_Y+FB_NUT_Y)/2);fspace=FB_NUT_Y-FB_HEAD_Y;}
    else{const fmv=(FB_FRET_Y[f-1]+FB_FRET_Y[f])/2;cx=Math.round(fbStrX(s,fmv/FB_PLAY_H));cy=Math.round(FB_NUT_Y+fmv);fspace=FB_FRET_Y[f]-FB_FRET_Y[f-1];}
    const r=Math.min(16,Math.floor(fspace*0.45)),fs=r>=14?'12':r>=11?'11':'10';
    const fill=isHl?'#F5A623':(state.salaActiveStep>0?'#222':'#3a3a3a');
    const stroke=isHl?'#7a4a00':'#1a1a1a';
    const tf=isHl?'#111':(state.salaActiveStep>0?'#444':'#888');
    o+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    o+=`<text x="${cx}" y="${cy+4}" text-anchor="middle" fill="${tf}" font-size="${fs}" font-weight="800" font-family="Poppins,sans-serif">${FB_NNAMES[nc]}</text>`;
  });
  o+='</svg>';
  return o;
}

// Retorna as posições exatas (corda+casa) a exibir no fretboard por passo
function _salaFbPositions(activeStep){
  if(activeStep===0)return[];
  const pos=getChordPositions(state.chord);
  const sorted=[...pos].sort((a,b)=>(FB_OPEN[a.s]+a.f)-(FB_OPEN[b.s]+b.f));
  if(activeStep===1)return[sorted[sorted.length-1]]; // só a mais aguda
  if(activeStep===2)return[sorted[0]];               // só a mais grave
  if(activeStep===3){
    // Tônica + terça, respeitando acordes invertidos
    const rootClass=_chordRootClass(state.chord);
    const tonicPos=sorted.find(p=>(FB_OPEN[p.s]+p.f)%12===rootClass)??sorted[0];
    const tonicMidi=FB_OPEN[tonicPos.s]+tonicPos.f;
    const thirdPos=sorted.find(p=>{const iv=((FB_OPEN[p.s]+p.f-tonicMidi)%12+12)%12;return iv===3||iv===4;});
    return thirdPos?[tonicPos,thirdPos]:[tonicPos];
  }
  return sorted;                                     // todas (passo 4)
}

// Fretboard limitado até a 4ª casa (exclusivo da Sala de Aula)
function buildSalaFbSVGLimited(){
  const SALA_FRETS=4;
  const SALA_SVG_H=FB_NUT_Y+FB_FRET_Y[SALA_FRETS]+16;
  const ST=[2.2,1.8,1.4,1.1,0.9,0.7];
  let o='';
  const hL=FB_NUT_X[0]-20,hR=FB_NUT_X[5]+20;
  const botT=FB_FRET_Y[SALA_FRETS]/FB_PLAY_H;
  o+=`<svg width="${FB_SVG_W}" height="${SALA_SVG_H}" viewBox="0 0 ${FB_SVG_W} ${SALA_SVG_H}" xmlns="http://www.w3.org/2000/svg" style="display:block">`;
  o+=`<rect width="${FB_SVG_W}" height="${SALA_SVG_H}" fill="#111"/>`;
  o+=`<line x1="${FB_NUT_X[0]}" y1="${FB_NUT_Y}" x2="${hL}" y2="${FB_HEAD_Y}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[5]}" y1="${FB_NUT_Y}" x2="${hR}" y2="${FB_HEAD_Y}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  o+=`<line x1="${hL}" y1="${FB_HEAD_Y}" x2="${hR}" y2="${FB_HEAD_Y}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  for(let sn=0;sn<6;sn++)o+=`<text x="${FB_NUT_X[sn]}" y="${FB_HEAD_Y-9}" text-anchor="middle" dominant-baseline="alphabetic" fill="#ccc" font-size="17" font-weight="700" font-family="Poppins,sans-serif">${FB_SNAMES[sn]}</text>`;
  for(let sh=0;sh<6;sh++)o+=`<line x1="${FB_NUT_X[sh]}" y1="${FB_HEAD_Y}" x2="${FB_NUT_X[sh]}" y2="${FB_NUT_Y}" stroke="#fff" stroke-width="${ST[sh]}" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[0]}" y1="${FB_NUT_Y}" x2="${FB_NUT_X[5]}" y2="${FB_NUT_Y}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[0]}" y1="${FB_NUT_Y}" x2="${Math.round(fbStrX(0,botT))}" y2="${FB_NUT_Y+FB_FRET_Y[SALA_FRETS]}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[5]}" y1="${FB_NUT_Y}" x2="${Math.round(fbStrX(5,botT))}" y2="${FB_NUT_Y+FB_FRET_Y[SALA_FRETS]}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  for(let ss=1;ss<=4;ss++)o+=`<line x1="${FB_NUT_X[ss]}" y1="${FB_NUT_Y}" x2="${Math.round(fbStrX(ss,botT))}" y2="${FB_NUT_Y+FB_FRET_Y[SALA_FRETS]}" stroke="#fff" stroke-width="${ST[ss]}" stroke-linecap="round"/>`;
  for(let fw=1;fw<=SALA_FRETS;fw++){
    const wy=FB_NUT_Y+FB_FRET_Y[fw],tn=FB_FRET_Y[fw]/FB_PLAY_H;
    const wxL=Math.round(fbStrX(0,tn)),wxR=Math.round(fbStrX(5,tn));
    o+=`<line x1="${wxL}" y1="${wy}" x2="${wxR}" y2="${wy}" stroke="#fff" stroke-width="${fw===SALA_FRETS?2.5:1.5}" stroke-linecap="round"/>`;
  }
  // Sem inlay dentro das 4 casas (inlay padrão começa na 5ª)
  for(let fl=1;fl<=SALA_FRETS;fl++){
    const fmid=(FB_FRET_Y[fl-1]+FB_FRET_Y[fl])/2,fmy=Math.round(FB_NUT_Y+fmid);
    const flx=Math.round(fbStrX(0,fmid/FB_PLAY_H))-4;
    o+=`<text x="${flx}" y="${fmy+4}" text-anchor="end" fill="#444" font-size="11" font-family="Poppins,sans-serif">${fl}</text>`;
  }
  // Dots: só posições relevantes ao passo — sem notas fantasma
  const _fbDispStep=(state.salaActiveStep===4&&state.salaP4Review)?state.salaP4Review:state.salaActiveStep;
  if(_fbDispStep>0){
    const showPos=_salaFbPositions(_fbDispStep);
    const showSet=new Set(showPos.map(p=>`${p.s}-${p.f}`));
    const isExp=state.salaActiveStep>=4;
    getChordPositions(state.chord).forEach(({s,f})=>{
      if(f>SALA_FRETS)return;
      if(!showSet.has(`${s}-${f}`))return;
      const nc=fbNoteClass(s,f);
      let cx,cy,fspace;
      if(f===0){cx=FB_NUT_X[s];cy=Math.round((FB_HEAD_Y+FB_NUT_Y)/2);fspace=FB_NUT_Y-FB_HEAD_Y;}
      else{const fmv=(FB_FRET_Y[f-1]+FB_FRET_Y[f])/2;cx=Math.round(fbStrX(s,fmv/FB_PLAY_H));cy=Math.round(FB_NUT_Y+fmv);fspace=FB_FRET_Y[f]-FB_FRET_Y[f-1];}
      const r=Math.min(16,Math.floor(fspace*0.45)),fs=r>=14?'12':r>=11?'11':'10';
      const fill='#F5A623';
      const stroke='#7a4a00';
      const tf='#111';
      o+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
      o+=`<text x="${cx}" y="${cy+4}" text-anchor="middle" fill="${tf}" font-size="${fs}" font-weight="800" font-family="Poppins,sans-serif">${FB_NNAMES[nc]}</text>`;
    });
  }
  o+='</svg>';
  return o;
}

function doSalaFbTap(key){
  if(state.salaVerified)return;
  const s=parseInt(key.split('-')[0]);
  const parts=key.split('-').map(Number);
  const wasSelected=!!state.salaFbSel[key];
  Object.keys(state.salaFbSel).forEach(k=>{if(parseInt(k.split('-')[0])===s)delete state.salaFbSel[k];});
  if(!wasSelected){state.salaFbSel[key]=true;playFbNoteClick(FB_OPEN[parts[0]]+parts[1]);}
  render();
}
function doSalaVerify(){
  const keys=Object.keys(state.salaFbSel);
  if(keys.length===0)return;
  const got=keys.map(k=>{const p=k.split('-').map(Number);return fbNoteClass(p[0],p[1]);}).sort((a,b)=>a-b);
  const exp=state.chord.midi.map(m=>m%12).sort((a,b)=>a-b);
  let ok=(got.length===exp.length);
  if(ok)for(let i=0;i<exp.length;i++){if(got[i]!==exp[i]){ok=false;break;}}
  const expSet=new Set(exp);
  state.salaCorrectCount=got.filter(nc=>expSet.has(nc)).length;
  state.salaVerified=true;
  state.salaVerifyOk=ok;
  render();
  playSfx(ok?'correct':'wrong');
  spawnSalaFeedback(ok);
}
function playSalaAssembly(){
  const keys=Object.keys(state.salaFbSel);
  if(!keys.length)return;
  initCompressor();
  const notes=keys.map(k=>{const p=k.split('-').map(Number);return FB_OPEN[p[0]]+p[1];}).sort((a,b)=>a-b);
  const noteVol=1.2/keys.length;
  notes.forEach((midi,i)=>{
    const sn=nearestSample(midi);
    const ratio=midiToFreq(midi)/midiToFreq(sn);
    setTimeout(()=>{
      const id=howls[sn].play();
      howls[sn].volume(noteVol*_noteBoost(midi),id);
      if(Math.abs(ratio-1)>0.001)howls[sn].rate(ratio,id);
    },i*110);
  });
}
function buildSalaFbInteractive(){
  const SALA_FRETS=4;
  const SALA_SVG_H=FB_NUT_Y+FB_FRET_Y[SALA_FRETS]+16;
  const ST=[2.2,1.8,1.4,1.1,0.9,0.7];
  let o='';
  const hL=FB_NUT_X[0]-20,hR=FB_NUT_X[5]+20;
  const botT=FB_FRET_Y[SALA_FRETS]/FB_PLAY_H;
  o+=`<svg width="${FB_SVG_W}" height="${SALA_SVG_H}" viewBox="0 0 ${FB_SVG_W} ${SALA_SVG_H}" xmlns="http://www.w3.org/2000/svg" style="display:block">`;
  o+=`<rect width="${FB_SVG_W}" height="${SALA_SVG_H}" fill="#111"/>`;
  o+=`<line x1="${FB_NUT_X[0]}" y1="${FB_NUT_Y}" x2="${hL}" y2="${FB_HEAD_Y}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[5]}" y1="${FB_NUT_Y}" x2="${hR}" y2="${FB_HEAD_Y}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  o+=`<line x1="${hL}" y1="${FB_HEAD_Y}" x2="${hR}" y2="${FB_HEAD_Y}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  for(let sn=0;sn<6;sn++)o+=`<text x="${FB_NUT_X[sn]}" y="${FB_HEAD_Y-9}" text-anchor="middle" dominant-baseline="alphabetic" fill="#ccc" font-size="17" font-weight="700" font-family="Poppins,sans-serif">${FB_SNAMES[sn]}</text>`;
  for(let sh=0;sh<6;sh++)o+=`<line x1="${FB_NUT_X[sh]}" y1="${FB_HEAD_Y}" x2="${FB_NUT_X[sh]}" y2="${FB_NUT_Y}" stroke="#fff" stroke-width="${ST[sh]}" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[0]}" y1="${FB_NUT_Y}" x2="${FB_NUT_X[5]}" y2="${FB_NUT_Y}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[0]}" y1="${FB_NUT_Y}" x2="${Math.round(fbStrX(0,botT))}" y2="${FB_NUT_Y+FB_FRET_Y[SALA_FRETS]}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[5]}" y1="${FB_NUT_Y}" x2="${Math.round(fbStrX(5,botT))}" y2="${FB_NUT_Y+FB_FRET_Y[SALA_FRETS]}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  for(let ss=1;ss<=4;ss++)o+=`<line x1="${FB_NUT_X[ss]}" y1="${FB_NUT_Y}" x2="${Math.round(fbStrX(ss,botT))}" y2="${FB_NUT_Y+FB_FRET_Y[SALA_FRETS]}" stroke="#fff" stroke-width="${ST[ss]}" stroke-linecap="round"/>`;
  for(let fw=1;fw<=SALA_FRETS;fw++){
    const wy=FB_NUT_Y+FB_FRET_Y[fw],tn=FB_FRET_Y[fw]/FB_PLAY_H;
    const wxL=Math.round(fbStrX(0,tn)),wxR=Math.round(fbStrX(5,tn));
    o+=`<line x1="${wxL}" y1="${wy}" x2="${wxR}" y2="${wy}" stroke="#fff" stroke-width="${fw===SALA_FRETS?2.5:1.5}" stroke-linecap="round"/>`;
  }
  for(let fl=1;fl<=SALA_FRETS;fl++){
    const fmid=(FB_FRET_Y[fl-1]+FB_FRET_Y[fl])/2,fmy=Math.round(FB_NUT_Y+fmid);
    const flx=Math.round(fbStrX(0,fmid/FB_PLAY_H))-4;
    o+=`<text x="${flx}" y="${fmy+4}" text-anchor="end" fill="#444" font-size="11" font-family="Poppins,sans-serif">${fl}</text>`;
  }
  // Notas selecionadas pelo usuário
  const isAnswered=state.salaVerified;
  const isWrong=isAnswered&&!state.salaVerifyOk;
  const _chordMidiSet=isAnswered?new Set(state.chord.midi):null;
  Object.keys(state.salaFbSel).forEach(k=>{
    const pts=k.split('-').map(Number),sc=pts[0],fc=pts[1];
    if(fc>SALA_FRETS)return;
    const nc=fbNoteClass(sc,fc);
    let cx,cy,fspace;
    if(fc===0){cx=FB_NUT_X[sc];cy=Math.round((FB_HEAD_Y+FB_NUT_Y)/2);fspace=FB_NUT_Y-FB_HEAD_Y;}
    else{const fmv=(FB_FRET_Y[fc-1]+FB_FRET_Y[fc])/2;cx=Math.round(fbStrX(sc,fmv/FB_PLAY_H));cy=Math.round(FB_NUT_Y+fmv);fspace=FB_FRET_Y[fc]-FB_FRET_Y[fc-1];}
    const r=Math.min(16,Math.floor(fspace*0.45)),fs=r>=14?'12':r>=11?'11':'10';
    let fill,stroke,tf;
    if(isAnswered){
      const midiNote=FB_OPEN[sc]+fc;
      const inChord=!isWrong||_chordMidiSet.has(midiNote);
      if(inChord){fill='#4caf50';stroke='#1a3d1a';}else{fill='#f44336';stroke='#3d1a1a';}
      tf='#fff';
    }else{fill='#60dcff';tf='#111';stroke='#0a2030';}
    o+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    o+=`<text x="${cx}" y="${cy+4}" text-anchor="middle" fill="${tf}" font-size="${fs}" font-weight="800" font-family="Poppins,sans-serif">${FB_NNAMES[nc]}</text>`;
  });
  // Notas faltando → laranja, nas posições exatas da digitação configurada (somente quando errou)
  if(isWrong){
    const userMidiSet=new Set(Object.keys(state.salaFbSel).map(k=>{const[s,f]=k.split('-').map(Number);return FB_OPEN[s]+f;}));
    getChordPositions(state.chord).forEach(({s,f,midi})=>{
      if(userMidiSet.has(midi))return;
      if(f>SALA_FRETS)return;
      const nc=fbNoteClass(s,f);
      let cx,cy,fspace;
      if(f===0){cx=FB_NUT_X[s];cy=Math.round((FB_HEAD_Y+FB_NUT_Y)/2);fspace=FB_NUT_Y-FB_HEAD_Y;}
      else{const fmv=(FB_FRET_Y[f-1]+FB_FRET_Y[f])/2;cx=Math.round(fbStrX(s,fmv/FB_PLAY_H));cy=Math.round(FB_NUT_Y+fmv);fspace=FB_FRET_Y[f]-FB_FRET_Y[f-1];}
      const r=Math.min(16,Math.floor(fspace*0.45))+2,fs=r>=14?'12':r>=11?'11':'10';
      o+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#F5A623" stroke="#7a4a00" stroke-width="2"/>`;
      o+=`<text x="${cx}" y="${cy+4}" text-anchor="middle" fill="#111" font-size="${fs}" font-weight="800" font-family="Poppins,sans-serif">${FB_NNAMES[nc]}</text>`;
    });
  }
  // Células clicáveis (apenas enquanto não verificado)
  if(!state.salaVerified){
    for(let cs0=0;cs0<6;cs0++)o+=`<rect x="${FB_COL_EDGES[cs0]}" y="${FB_HEAD_Y}" width="${FB_COL_EDGES[cs0+1]-FB_COL_EDGES[cs0]}" height="${FB_NUT_Y-FB_HEAD_Y}" fill="transparent" class="fb-fc" onclick="doSalaFbTap('${cs0}-0')"/>`;
    for(let cs=0;cs<6;cs++){
      for(let cf=1;cf<=SALA_FRETS;cf++){
        const ry=FB_NUT_Y+FB_FRET_Y[cf-1],rh=FB_FRET_Y[cf]-FB_FRET_Y[cf-1];
        o+=`<rect x="${FB_COL_EDGES[cs]}" y="${ry}" width="${FB_COL_EDGES[cs+1]-FB_COL_EDGES[cs]}" height="${rh}" fill="transparent" class="fb-fc" onclick="doSalaFbTap('${cs}-${cf}')"/>`;
      }
    }
  }
  o+='</svg>';
  return o;
}

function renderSalaDeAula(){
  const step=state.salaStep;
  const nextStep=step+1;
  // Seta à esquerda apontando para a direita (imagem rotacionada -90°)
  const cifra=state.lang!=='pt'&&state.chord.cifraEn?state.chord.cifraEn:state.chord.cifra;
  const _arrowImg=`<img src="assets/seta-para-baixo.png" style="width:28px;height:28px;transform:rotate(-90deg)">`;
  const _fbtn=(label,hlN)=>
    `<button class="sala-focus-btn" onclick="playClickSfx('soft');playSalaFocus(_salaHighlightMidis(${hlN}))"><img src="assets/nota-musical.png" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;margin-right:.35rem">${label}</button>`;
  const _lbtn=()=>
    `<button class="sala-focus-btn" onclick="playClickSfx('soft');playChord(state.chord)"><img src="assets/nota-musical.png" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;margin-right:.35rem">${t('listen_chord')}</button>`;
  const twoBtns=(label,hlN)=>
    `<div style="display:flex;gap:.5rem;margin-top:.5rem">${_lbtn()}${_fbtn(label,hlN)}</div>`;
  const s1body=`${t('sala_s1_body')}${twoBtns(t('sala_focus_high'),1)}`;
  const s2body=`${t('sala_s2_body')}${twoBtns(t('sala_focus_low'),2)}`;
  const s3body=`<p style="margin:.2rem 0 .1rem">${t('sala_s3_intro')}</p>
    <ul>
      <li>${t('sala_s3_maior')}</li>
      <li>${t('sala_s3_menor')}</li>
      <li style="color:#aaa;font-style:italic">${t('sala_s3_dim')}</li>
    </ul>
    ${twoBtns(t('sala_focus_mid'),3)}`;
  const _p4btn=(label,step)=>
    `<button class="sala-focus-btn" onclick="playClickSfx('soft');playSalaFocus(_salaHighlightMidis(${step}))">${label}</button>`;
  const _selCount=Object.keys(state.salaFbSel).length;
  const _qLabel=state.chord.quality?_translateQualityLabel(state.chord.quality,state.chord.quality):'';
  const _p4helpText=state.lang==='en'?'Need help? Click the tips below.':state.lang==='es'?'¿Necesitas ayuda? Haz clic en las pistas abajo.':'Precisa de ajuda? Clique nas dicas abaixo.';
  const _p4lHigh=state.lang==='en'?'💡 highest note':state.lang==='es'?'💡 nota más aguda':'💡 nota mais aguda';
  const _p4lLow=state.lang==='en'?'💡 lowest note':state.lang==='es'?'💡 nota más grave':'💡 nota mais grave';
  const _p4lMid=state.lang==='en'?'💡 third interval':state.lang==='es'?'💡 intervalo de tercera':'💡 intervalo de terça';
  const s4ReviewBtns=`
  <div style="border-top:1px solid #2a3a2a;padding-top:.5rem;margin-top:.5rem">
    <div style="font-size:.82rem;color:#fff;font-weight:700;margin-bottom:.35rem">${_p4helpText}</div>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap">${_p4btn(_p4lHigh,1)}${_p4btn(_p4lLow,2)}${_p4btn(_p4lMid,3)}</div>
  </div>`;
  const s4body=`
  <div style="font-size:.85rem;color:#ccc;margin-bottom:.5rem">${t('sala_monte')}</div>
  ${!state.salaVerified
    ?`<div class="fb-note-count" style="margin:.2rem 0">${_selCount} / ${state.chord.midi.length} ${state.lang==='en'?'notes':'notas'}</div>
      <div class="fb-action-row">
        <button class="fb-confirm-btn" onclick="doSalaVerify()" ${_selCount===0?'disabled':''}>✓ ${t('confirm')}</button>
        <button class="fb-ghost-btn" onclick="playClickSfx('soft');playSalaAssembly()" ${_selCount===0?'disabled':''}>${t('hear_build')}</button>
      </div>`
    :`<div style="text-align:center;margin:.4rem 0 .3rem">
        <div style="font-size:1.6rem;font-weight:900;color:${state.salaVerifyOk?'#4caf50':'#F5A623'};font-family:var(--font-body);text-shadow:0 0 18px ${state.salaVerifyOk?'#4caf5066':'#F5A62366'};letter-spacing:-.01em">${cifra}</div>
        ${_qLabel?`<div style="font-size:.82rem;color:#aaa;font-weight:700;margin-top:.15rem">${_qLabel}</div>`:''}
        <div style="margin-top:.4rem;font-size:.75rem;color:#888;display:flex;justify-content:center;gap:.9rem">
          <span><span style="color:#4caf50;font-size:.9rem">●</span> ${state.lang==='en'?'correct':state.lang==='es'?'correcto':'acertou'}</span>
          <span><span style="color:#f44336;font-size:.9rem">●</span> ${state.lang==='en'?'wrong':state.lang==='es'?'incorrecto':'errou'}</span>
          <span><span style="color:#F5A623;font-size:.9rem">●</span> ${state.lang==='en'?'missing':'faltando'}</span>
        </div>
      </div>
      <div class="fb-action-row">
        ${!state.salaVerifyOk?`<button class="fb-ghost-btn" onclick="playClickSfx('soft');state.salaFbSel={};state.salaVerified=false;render()">${t('sala_retry')}</button>`:''}
        <button class="fb-ghost-btn" onclick="playClickSfx('soft');playSalaAssembly()" ${_selCount===0?'disabled':''}>${t('hear_build')}</button>
      </div>`}
  ${s4ReviewBtns}`;
  // Painel expandido (passo ativo)
  const panel=(n,title,body)=>`
    <div style="margin-top:.5rem">
      <button class="sala-step-btn sala-done" onclick="doSalaStep(${n})" style="width:100%;margin-bottom:.4rem">✓ ${title}</button>
      <div class="sala-step-text">${body}</div>
    </div>`;
  // Botão do próximo passo
  const nextBtn=(n,title)=>`
    <div style="margin-top:.5rem;display:flex;align-items:center;gap:.4rem">
      <span class="sala-vez-arrow">${_arrowImg}</span>
      <button class="sala-step-btn" onclick="doSalaStep(${n})" style="flex:1">${title}</button>
    </div>`;
  // Área de passos: apenas passo atual + botão do próximo
  let stepArea='';
  if(step===0){stepArea=nextBtn(1,t('sala_s1_title'));}
  else if(step===1){stepArea=panel(1,t('sala_s1_title'),s1body)+nextBtn(2,t('sala_s2_title'));}
  else if(step===2){stepArea=panel(2,t('sala_s2_title'),s2body)+nextBtn(3,t('sala_s3_title'));}
  else if(step===3){stepArea=panel(3,t('sala_s3_title'),s3body)+nextBtn(4,t('sala_s4_title'));}
  else{
    stepArea=panel(4,t('sala_s4_title'),s4body);
    if(state.salaVerified)stepArea+=`<button class="cta-btn" style="margin-top:.9rem" onclick="playClickSfx('nav');startSalaDeAula()">${t('sala_next')} <img src="assets/seta-direita.png" style="width:18px;height:18px;vertical-align:middle;margin-left:.3rem"></button>`;
  }
  return`<div style="padding:.75rem 0">
  <div style="width:100%;max-width:520px;display:flex;align-items:center;margin-bottom:.6rem;gap:.75rem">
    <button class="back-btn" onclick="playClickSfx('nav');if(_salaStartTimer){clearTimeout(_salaStartTimer);_salaStartTimer=null;}state.phase='start';render()">${t('back_btn')}</button>
    <span style="font-size:1rem;font-weight:900;color:#7cdd7c;font-family:var(--font-body)">${t('sala_de_aula')}</span>
  </div>
  <div style="font-size:1.05rem;font-weight:700;line-height:1.5;padding:.1rem 0 .6rem;text-align:center;color:#7cdd7c">${t('sala_intro')}</div>
  <button class="play-btn${state.playing?' playing':''}" onclick="playClickSfx('soft');playChord(state.chord)" style="width:100%;max-width:520px">${state.playing?t('listening'):t('listen_chord')}</button>
  <div class="fb-wrap" style="margin-top:.5rem">${state.salaActiveStep===4?buildSalaFbInteractive():buildSalaFbSVGLimited()}</div>
  <div style="width:100%;max-width:520px;margin-top:.4rem">${stepArea}</div>
</div>`;
}

// ── Fretboard: confirmar resposta no Treino Focado ─────────────
function doFocusedFretboardConfirm(){
  if(!state.isFretboard||state.phase!=='treino_focado_question')return;
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  const ok=fbValidate();
  state.result={ok};
  state.phase='treino_focado_answered';

  const btn=document.getElementById('fb-confirm-btn');
  const rect=btn?btn.getBoundingClientRect():{left:window.innerWidth/2,top:window.innerHeight/2,width:0,height:0};
  const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  const cl=(window.innerWidth-520)/2;

  if(ok){
    state.focusedStreak++;
    const bonus=state.focusedStreak>=2?state.focusedStreak:0;
    const pontos=5+bonus;
    const xpBefore=state.xp;
    state.xp+=pontos;
    state.xpDisplay=xpBefore;
    state.notas+=pontos;
    state.focusedSessionScore+=pontos;
    state.focusedSessionCorrect++;
    state.focusedSessionTotal++;
    const color=getFocusedColor(state.focusedStreak);
    playSfx(getFocusedSound(state.focusedStreak));
    particles.push(...makeParticles(cx-cl,cy,12,false));startParticleLoop();
    const app=document.getElementById('app');
    if(app){app.classList.add('flash-correct');setTimeout(()=>app.classList.remove('flash-correct'),350);}
    const pontosTxt=bonus===0?`+5 ${t('points')}`:`5 + ${bonus} ${t('points')}`;
    const xpPopup=document.createElement('div');
    xpPopup.textContent=pontosTxt;
    xpPopup.style.cssText=`position:fixed;z-index:9999;left:${cx}px;top:${rect.top}px;transform:translate(-50%,-100%);font-size:1.25rem;font-weight:900;color:${color};text-shadow:0 0 18px ${color},0 0 40px ${color}66;pointer-events:none;white-space:nowrap;`;
    document.body.appendChild(xpPopup);
    xpPopup.animate([{opacity:0,transform:'translate(-50%,-60%) scale(.5)'},{opacity:1,transform:'translate(-50%,-120%) scale(1.2)',offset:.15},{opacity:1,transform:'translate(-50%,-130%) scale(1)',offset:.78},{opacity:0,transform:'translate(-50%,-160%) scale(.9)'}],{duration:1500,easing:'ease-out'}).onfinish=()=>xpPopup.remove();
    setTimeout(()=>animateXPGain(xpBefore,state.xp),100);
  } else {
    const xpBefore=state.xp;
    state.xp=Math.max(0,state.xp-5);
    state.xpDisplay=xpBefore;
    state.notas=Math.max(0,state.notas-5);
    state.focusedStreak=0;
    state.focusedSessionTotal++;
    playSfx('wrong');
    const app=document.getElementById('app');
    if(app){app.classList.add('flash-wrong');setTimeout(()=>app.classList.remove('flash-wrong'),350);}
    const pa=document.querySelector('.play-area');
    if(pa){pa.classList.add('shake');setTimeout(()=>pa.classList.remove('shake'),400);}
    const wrongPop=document.createElement('div');
    wrongPop.textContent='-5 XP';
    wrongPop.style.cssText=`position:fixed;z-index:9999;left:${cx}px;top:${rect.top}px;transform:translate(-50%,-100%);font-size:1.2rem;font-weight:900;color:#f87171;text-shadow:0 0 14px #f8717188;pointer-events:none;white-space:nowrap;`;
    document.body.appendChild(wrongPop);
    wrongPop.animate([{opacity:0,transform:'translate(-50%,-30%) scale(.6)'},{opacity:1,transform:'translate(-50%,-100%) scale(1.05)',offset:.15},{opacity:1,transform:'translate(-50%,-110%) scale(1)',offset:.78},{opacity:0,transform:'translate(-50%,-140%) scale(.85)'}],{duration:750,easing:'ease-out'}).onfinish=()=>wrongPop.remove();
    setTimeout(()=>animateXPGain(xpBefore,state.xp),100);
  }
  saveProgress();
  render();
  // fretboard: sem avanço automático — usuário clica "Próximo"
}

// ── Fretboard: próxima questão (Treino Focado) ─────────────────
function nextFocusedFretboardQ(){
  if(state.lvlUpPending){
    const lvlNow=LEVELS[getLvlIdx(state.xp)];
    const grupoNow=NIVEL_GROUPS.find(g=>lvlNow.n>=g.range[0]&&lvlNow.n<=g.range[1])||NIVEL_GROUPS[0];
    const isNewGroup=lvlNow.n===grupoNow.range[0];
    state.lvlUpIsNewGroup=isNewGroup;
    state.firstCardSeen=true;
    if(isNewGroup){playSfx('levelup');particles.push(...makeParticles(260,300,60,true));particles.push(...makeParticles(100,200,30,true));particles.push(...makeParticles(400,200,30,true));startParticleLoop();}
    else{playSfx('correct2');}
    state.lvlUpPending=false;
    state.lvlUpFromFocused=true;
    state.phase='levelup';render();return;
  }
  genFocusedQ();state.phase='treino_focado_question';render();
}

// ── Fretboard: confirmar resposta ─────────────────────────────
function doFretboardConfirm(){
  if(!state.isFretboard||state.phase!=='question')return;
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  const ok=fbValidate();
  const ns=ok?state.streak+1:0;
  state.streak=ns;
  if(ns>state.bestStreak)state.bestStreak=ns;
  saveStreak();
  state.stats.t++;
  if(!state.chordStats[state.chord.id])state.chordStats[state.chord.id]={c:0,e:0};
  if(ok){state.stats.c++;state.chordStats[state.chord.id].c++;}
  else{state.chordStats[state.chord.id].e++;}
  const violaoAtual=VIOLOES.find(v=>v.id===state.violaoEquipado)||VIOLOES[0];
  const violaoPct=violaoAtual.pct||0;
  let gain=0,msg=null,diamondGained=0;
  const prevMult=comboMultiplier(Math.max(1,ns-1));
  const newMult=comboMultiplier(ns);
  const multLevelUp=ok&&ns>1&&newMult>prevMult;
  // Captura posição do botão ANTES do render() destruir o DOM
  const _fbBtn=document.getElementById('fb-confirm-btn');
  const _fbRect=_fbBtn?_fbBtn.getBoundingClientRect():null;
  if(ok){
    gain=Math.round(comboPoints(ns)*(1+violaoPct)*(state.journeyMode==='cordas'?3:1));
    if(multLevelUp){msg=`×${newMult} ${t('multiplier')}!`;playSfx('combo9');}
    else if(ns>=10){playSfx('combo9');}
    else if(ns>=6){playSfx('combo6');}
    else if(ns>=3){playSfx('combo3');}
    else if(ns>=2){playSfx('correct2');}
    else{playSfx('correct');}
    state.notas+=gain;
    const xpBefore=state.xp;
    state.score+=gain;state.xp+=gain;state.xpDisplay=xpBefore;
    const lvlBefore=getLvlIdx(state.xp-gain);
    if(getLvlIdx(state.xp)>lvlBefore){state.lvlUpPending=true;checkRatingPrompt(LEVELS[getLvlIdx(state.xp)].n);}
    const app=document.getElementById('app');
    if(app){app.classList.add('flash-correct');setTimeout(()=>app.classList.remove('flash-correct'),500);}
    if(multLevelUp){
      const ring=document.createElement('div');
      const mc=comboColor(newMult);
      ring.style.cssText=`position:fixed;inset:0;z-index:9997;pointer-events:none;box-shadow:inset 0 0 0 3px ${mc}66;animation:xpBarFlash .35s ease;`;
      document.body.appendChild(ring);
      setTimeout(()=>ring.remove(),1500);
    }
    if(_fbRect){
      const cx=_fbRect.left+_fbRect.width/2,cy=_fbRect.top+_fbRect.height/2;
      const cl=(window.innerWidth-520)/2;
      const isBig=ns>=5;
      particles.push(...makeParticles(cx-cl,cy,isBig?28:12,isBig));startParticleLoop();
      const color=comboColor(newMult);
      const xpPopup=document.createElement('div');
      xpPopup.textContent=`+${gain} ${t('points')}`;
      xpPopup.style.cssText=`position:fixed;z-index:9999;left:${cx}px;top:${_fbRect.top-16}px;transform:translate(-50%,-100%);font-size:${isBig?'1.6rem':'1.25rem'};font-weight:900;color:${color};text-shadow:0 0 18px ${color},0 0 40px ${color}66;pointer-events:none;white-space:nowrap;`;
      document.body.appendChild(xpPopup);
      xpPopup.animate([
        {opacity:0,transform:'translate(-50%,-60%) scale(.5)'},
        {opacity:1,transform:'translate(-50%,-120%) scale(1.2)',offset:.15},
        {opacity:1,transform:'translate(-50%,-130%) scale(1)',offset:.78},
        {opacity:0,transform:'translate(-50%,-160%) scale(.9)'}
      ],{duration:1500,easing:'ease-out'}).onfinish=()=>xpPopup.remove();
    }
    setTimeout(()=>animateXPGain(xpBefore,state.xp),50);
  }else{
    state.notas=Math.max(0,state.notas-10);
    gain=-10;state.xp=Math.max(0,state.xp-10);
    playSfx('wrong');
    const app=document.getElementById('app');
    if(app){app.classList.add('flash-wrong');setTimeout(()=>app.classList.remove('flash-wrong'),500);}
    document.querySelector('.play-area')?.classList.add('shake');
    setTimeout(()=>document.querySelector('.play-area')?.classList.remove('shake'),400);
    if(_fbRect){
      const wrongXp=document.createElement('div');
      wrongXp.textContent=`-10 ${t('points')}`;
      wrongXp.style.cssText=`position:fixed;z-index:9999;left:${_fbRect.left+_fbRect.width/2}px;top:${_fbRect.top-16}px;transform:translate(-50%,-100%);font-size:1.2rem;font-weight:900;color:#f87171;text-shadow:0 0 14px #f8717188;pointer-events:none;white-space:nowrap;`;
      document.body.appendChild(wrongXp);
      wrongXp.animate([
        {opacity:0,transform:'translate(-50%,-30%) scale(.6)'},
        {opacity:1,transform:'translate(-50%,-100%) scale(1.05)',offset:.15},
        {opacity:1,transform:'translate(-50%,-110%) scale(1)',offset:.78},
        {opacity:0,transform:'translate(-50%,-140%) scale(.85)'}
      ],{duration:750,easing:'ease-out'}).onfinish=()=>wrongXp.remove();
    }
  }
  state.result={ok,gain,msg,chordName:state.chord.name,diamondGained,multLevelUp};
  state.phase='answered';
  if(state.isGuest){
    state.guestExerciseCount++;
    if(state.guestExerciseCount===state.guestNextPrompt)state.showGuestPopup=true;
  }
  try{render();}catch(e){console.error('render error:',e);}
  // fretboard: sem avanço automático — usuário clica "Próximo"
}

function handleAnswer(choiceId,btnEl){
  if(state.selected!==null||state.phase!=='question')return;
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}

  state.selected=choiceId;
  btnEl.blur(); // remove foco residual que causa contorno laranja
  const selectedCifra=(state.choices.find(c=>c.id===choiceId)||{}).cifra;
  const ok=selectedCifra===state.chord.cifra;
  const ns=ok?state.streak+1:0;
  state.streak=ns;
  if(ns>state.bestStreak)state.bestStreak=ns;
  saveStreak();
  state.stats.t++;
  if(!state.chordStats[state.chord.id])state.chordStats[state.chord.id]={c:0,e:0};
  if(ok){state.stats.c++;state.chordStats[state.chord.id].c++;}
  else{state.chordStats[state.chord.id].e++;}

  const violaoAtual=VIOLOES.find(v=>v.id===state.violaoEquipado)||VIOLOES[0];
  const violaoPct=violaoAtual.pct||0;

  let gain=0,msg=null,diamondGained=0;
  const prevMult=comboMultiplier(Math.max(1,ns-1));
  const newMult=comboMultiplier(ns);
  const multLevelUp=ok&&ns>1&&newMult>prevMult;

  if(ok){
    if(state.isBonus){
      const diamGain=violaoAtual.doubleDiamonds?2:1;
      diamondGained=diamGain;state.diamantes+=diamGain;
      const baseCombo=comboPoints(ns);
      gain=Math.round((baseCombo*2)*(1+violaoPct)*(state.journeyMode==='cordas'?3:1));
      msg=violaoAtual.doubleDiamonds?`💎💎 ${state.lang==='en'?'Double Diamond! ×2':state.lang==='es'?'¡Doble Diamante! ×2':'Diamante Duplo! ×2'}`:`💎 ×2 ${state.lang==='en'?'in Combo!':state.lang==='es'?'¡en Combo!':'no Combo!'}`;
      playSfx('diamond');
    } else {
      gain=Math.round(comboPoints(ns)*(1+violaoPct)*(state.journeyMode==='cordas'?3:1));
      if(multLevelUp){msg=`×${newMult} ${t('multiplier')}!`;playSfx('combo9');}
      else if(ns>=10){playSfx('combo9');}
      else if(ns>=6){playSfx('combo6');}
      else if(ns>=3){playSfx('combo3');}
      else if(ns>=2){playSfx('correct2');}
      else{playSfx('correct');}
      state.notas+=gain;
    }
    if(state.isBonus) state.notas+=gain; // diamante também soma pontos
    const xpBefore=state.xp;
    state.score+=gain;state.xp+=gain;
    state.xpDisplay=xpBefore;
    const lvlBefore=getLvlIdx(state.xp-gain);
    if(getLvlIdx(state.xp)>lvlBefore){state.lvlUpPending=true;checkRatingPrompt(LEVELS[getLvlIdx(state.xp)].n);}

    const rect=btnEl.getBoundingClientRect();
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    const cl=(window.innerWidth-520)/2;
    btnEl.style.animation='correctExplode .4s ease';
    setTimeout(()=>{if(btnEl)btnEl.style.animation='';},400);
    const isBig=ns>=5||state.isBonus;
    particles.push(...makeParticles(cx-cl,cy,isBig?28:12,isBig));startParticleLoop();
    const app=document.getElementById('app');
    if(state.isBonus){
      app.style.transition='background .15s';app.style.background='#0a1a2e';
      setTimeout(()=>{app.style.background='';app.style.transition='';},500);
    }else{
      app.classList.add('flash-correct');
      setTimeout(()=>app.classList.remove('flash-correct'),500);
    }
    if(multLevelUp){
      const ring=document.createElement('div');
      const mc=comboColor(newMult);
      ring.style.cssText=`position:fixed;inset:0;z-index:9997;pointer-events:none;box-shadow:inset 0 0 0 3px ${mc}66;animation:xpBarFlash .35s ease;border-radius:0;`;
      document.body.appendChild(ring);
      setTimeout(()=>ring.remove(),1500);
    }
    const color=state.isBonus?'#60dcff':comboColor(newMult);
    const xpPopup=document.createElement('div');
    const popLabel=state.isBonus?`💎 +${gain} ${t('points')}`:`+${gain} ${t('points')}`;
    xpPopup.textContent=popLabel;
    xpPopup.style.cssText=`position:fixed;z-index:9999;left:${rect.left+rect.width/2}px;top:${rect.top}px;transform:translate(-50%,-100%);font-size:${isBig?'1.6rem':'1.25rem'};font-weight:900;color:${color};text-shadow:0 0 18px ${color},0 0 40px ${color}66;pointer-events:none;white-space:nowrap;`;
    document.body.appendChild(xpPopup);
    xpPopup.animate([
      {opacity:0,transform:'translate(-50%,-60%) scale(.5)'},
      {opacity:1,transform:'translate(-50%,-120%) scale(1.2)',offset:.15},
      {opacity:1,transform:'translate(-50%,-130%) scale(1)',offset:.78},
      {opacity:0,transform:'translate(-50%,-160%) scale(.9)'}
    ],{duration:1500,easing:'ease-out'}).onfinish=()=>xpPopup.remove();
    setTimeout(()=>animateXPGain(xpBefore, state.xp), 100);
  }else{
    state.notas=Math.max(0,state.notas-10);
    gain=-10;
    state.xp=Math.max(0,state.xp-10);
    playSfx('wrong');
    const app=document.getElementById('app');
    app.classList.add('flash-wrong');
    setTimeout(()=>app.classList.remove('flash-wrong'),500);
    document.querySelector('.play-area')?.classList.add('shake');
    setTimeout(()=>document.querySelector('.play-area')?.classList.remove('shake'),400);
    const wrect=btnEl.getBoundingClientRect();
    const wx=wrect.left+wrect.width/2;
    const wrongXp=document.createElement('div');
    wrongXp.textContent=`-10 ${t('points')}`;
    wrongXp.style.cssText=`position:fixed;z-index:9999;left:${wx}px;top:${wrect.top}px;transform:translate(-50%,-100%);font-size:1.2rem;font-weight:900;color:#f87171;text-shadow:0 0 14px #f8717188;pointer-events:none;white-space:nowrap;`;
    document.body.appendChild(wrongXp);
    const errAnim=[
      {opacity:0,transform:'translate(-50%,-30%) scale(.6)'},
      {opacity:1,transform:'translate(-50%,-100%) scale(1.05)',offset:.15},
      {opacity:1,transform:'translate(-50%,-110%) scale(1)',offset:.78},
      {opacity:0,transform:'translate(-50%,-140%) scale(.85)'}
    ];
    wrongXp.animate(errAnim,{duration:750,easing:'ease-out'}).onfinish=()=>wrongXp.remove();
  }
  state.result={ok,gain,msg,chordName:state.chord.name,diamondGained,multLevelUp};
  state.phase='answered';
  if(state.isGuest){
    state.guestExerciseCount++;
    if(state.guestExerciseCount===state.guestNextPrompt){
      state.showGuestPopup=true;
    }
  }
  if(!state.fullAccess){
    state.journeyAnswered++;
    if(!ok&&state.journeyAnswered>=10){state.pendingFocusedPromo=true;state.journeyAnswered=0;}
  }
  try{render();}catch(e){console.error('render error:',e);}
  autoTimer=setTimeout(()=>{autoTimer=null;nextQ();},1200);
}

function handleQualityAnswer(quality, btnEl){
  if(state.qualitySelected!==null||state.phase!=='question')return;
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  btnEl.blur();

  state.qualitySelected=quality;
  const ok=(quality===state.qualityAnswer);
  const ns=ok?state.streak+1:0;
  state.streak=ns;
  if(ns>state.bestStreak)state.bestStreak=ns;
  saveStreak();
  state.stats.t++;
  if(!state.chordStats[state.chord.id])state.chordStats[state.chord.id]={c:0,e:0};
  if(ok){state.stats.c++;state.chordStats[state.chord.id].c++;}
  else{state.chordStats[state.chord.id].e++;}

  const violaoAtual=VIOLOES.find(v=>v.id===state.violaoEquipado)||VIOLOES[0];
  const violaoPct=violaoAtual.pct||0;

  const prevMult=comboMultiplier(Math.max(1,ns-1));
  const newMult=comboMultiplier(ns);
  const multLevelUp=ok&&ns>1&&newMult>prevMult;
  let gain=ok?Math.round(comboPoints(ns)*(1+violaoPct)):0,msg=null;
  if(ok){
    if(multLevelUp){msg=`×${newMult} ${t('multiplier')}!`;playSfx('combo9');}
    else if(ns>=10){playSfx('combo9');}
    else if(ns>=6){playSfx('combo6');}
    else if(ns>=3){playSfx('combo3');}
    else if(ns>=2){playSfx('correct2');}
    else{playSfx('correct');}
    if(multLevelUp){
      const ring=document.createElement('div');
      const mc=comboColor(newMult);
      ring.style.cssText=`position:fixed;inset:0;z-index:9997;pointer-events:none;box-shadow:inset 0 0 0 3px ${mc}66;animation:xpBarFlash .35s ease;`;
      document.body.appendChild(ring);
      setTimeout(()=>ring.remove(),1500);
    }
    const xpBefore=state.xp;
    state.score+=gain;state.xp+=gain;state.xpDisplay=xpBefore;
    state.notas+=gain;
    const lvlBefore=getLvlIdx(state.xp-gain);
    if(getLvlIdx(state.xp)>lvlBefore){state.lvlUpPending=true;checkRatingPrompt(LEVELS[getLvlIdx(state.xp)].n);}
    const rect=btnEl.getBoundingClientRect();
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    const cl=(window.innerWidth-520)/2;
    btnEl.style.animation='correctExplode .4s ease';
    setTimeout(()=>{if(btnEl)btnEl.style.animation='';},400);
    const isBig=ns>=5;
    particles.push(...makeParticles(cx-cl,cy,isBig?28:12,isBig));startParticleLoop();
    const app=document.getElementById('app');
    app.classList.add('flash-correct');
    setTimeout(()=>app.classList.remove('flash-correct'),500);
    const qColor=comboColor(newMult);
    const xpPopup=document.createElement('div');
    xpPopup.textContent=`+${gain} ${t('points')}`;
    xpPopup.style.cssText=`position:fixed;z-index:9999;left:${rect.left+rect.width/2}px;top:${rect.top}px;transform:translate(-50%,-100%);font-size:${isBig?'1.6rem':'1.25rem'};font-weight:900;color:${qColor};text-shadow:0 0 18px ${qColor},0 0 40px ${qColor}66;pointer-events:none;white-space:nowrap;`;
    document.body.appendChild(xpPopup);
    xpPopup.animate([
      {opacity:0,transform:'translate(-50%,-60%) scale(.5)'},
      {opacity:1,transform:'translate(-50%,-120%) scale(1.2)',offset:.15},
      {opacity:1,transform:'translate(-50%,-130%) scale(1)',offset:.78},
      {opacity:0,transform:'translate(-50%,-160%) scale(.9)'}
    ],{duration:1500,easing:'ease-out'}).onfinish=()=>xpPopup.remove();
    setTimeout(()=>animateXPGain(xpBefore,state.xp), 100);
  }else{
    state.notas=Math.max(0,state.notas-10);
    gain=-10;
    state.xp=Math.max(0,state.xp-10);
    playSfx('wrong');
    const app=document.getElementById('app');
    app.classList.add('flash-wrong');
    setTimeout(()=>app.classList.remove('flash-wrong'),500);
    document.querySelector('.play-area')?.classList.add('shake');
    setTimeout(()=>document.querySelector('.play-area')?.classList.remove('shake'),400);
    const wrect=btnEl.getBoundingClientRect();
    const wrongXp=document.createElement('div');
    wrongXp.textContent=`-10 ${t('points')}`;
    wrongXp.style.cssText=`position:fixed;z-index:9999;left:${wrect.left+wrect.width/2}px;top:${wrect.top}px;transform:translate(-50%,-100%);font-size:1.2rem;font-weight:900;color:#f87171;text-shadow:0 0 14px #f8717188;pointer-events:none;white-space:nowrap;`;
    document.body.appendChild(wrongXp);
    wrongXp.animate([
      {opacity:0,transform:'translate(-50%,-30%) scale(.6)'},
      {opacity:1,transform:'translate(-50%,-100%) scale(1.05)',offset:.15},
      {opacity:1,transform:'translate(-50%,-110%) scale(1)',offset:.78},
      {opacity:0,transform:'translate(-50%,-140%) scale(.85)'}
    ],{duration:1500,easing:'ease-out'}).onfinish=()=>wrongXp.remove();
  }
  state.result={ok,gain,msg,chordName:state.chord.name,diamondGained:0};
  state.phase='answered';
  if(state.isGuest){
    state.guestExerciseCount++;
    if(state.guestExerciseCount===state.guestNextPrompt){
      state.showGuestPopup=true;
    }
  }
  if(!state.fullAccess){
    state.journeyAnswered++;
    if(!ok&&state.journeyAnswered>=10){state.pendingFocusedPromo=true;state.journeyAnswered=0;}
  }
  try{render();}catch(e){console.error('render error:',e);}
  autoTimer=setTimeout(()=>{autoTimer=null;nextQ();},1200);
}

// ── 5. LOJA E INVENTÁRIO ──────────────────────────────────────
function playEquipSfx(){
  try{
    const ctx=getAudioCtx();
    const t=ctx.currentTime;
    [[220,.08],[440,.06],[880,.05],[1320,.04]].forEach(([freq,vol],i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type= i<2 ? 'triangle' : 'sine';
      o.frequency.value=freq;
      g.gain.setValueAtTime(0,t+i*.055);
      g.gain.linearRampToValueAtTime(vol,t+i*.055+.018);
      g.gain.exponentialRampToValueAtTime(.001,t+i*.055+.22);
      o.connect(g);g.connect(ctx.destination);
      o.start(t+i*.055);o.stop(t+i*.055+.25);
    });
    const buf=ctx.createBuffer(1,ctx.sampleRate*.04,ctx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*.008));
    const src=ctx.createBufferSource(),gn=ctx.createGain();
    gn.gain.value=.18;
    src.buffer=buf;src.connect(gn);gn.connect(ctx.destination);
    src.start(t);
  }catch(e){}
}

function equiparViolao(id){
  state.violaoEquipado=id;
  const v=VIOLOES.find(x=>x.id===id);
  playEquipSfx();
  showToast(t('guitar_equipped_toast'),guitarName(v)+(v.pct>0?' · +'+Math.round(v.pct*100)+'% '+t('points'):t('no_bonus')));
  render();
}

function comprarViolao(id){
  const v=VIOLOES.find(x=>x.id===id);
  if(!v)return;
  if(state.violoesComprados.includes(id)){equiparViolao(id);return;}
  if(state.moedas<v.preco){showToast(t('not_enough_coins'),t('not_enough_coins_detail')+v.preco);return;}
  confirmarCompra({
    nome: guitarName(v),
    preco: v.preco,
    img: v.img,
    onConfirm: function(){
      if(state.moedas<v.preco){showToast(t('not_enough_coins'),t('not_enough_coins_detail')+v.preco);return;}
      state.moedas-=v.preco;
      state.violoesComprados.push(id);
      state.violaoEquipado=id;
      render();
      showBoughtModal({img:v.img, icon:'🎸', nome:guitarName(v), isEquipable:true});
    }
  });
}


function exchangeDiamonds(btnEl){
  if(state.diamantes<1)return;
  const gained=state.diamantes*10; // 1 diamante = 10 moedas
  state.diamantes=0;
  state.moedas+=gained;
  playDiamondExchangeSfx();
  const rect=btnEl.getBoundingClientRect();
  const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  const cl=(window.innerWidth-520)/2;
  particles.push(...makeCoinParticles(cx-cl,cy));startParticleLoop();
  spawnCoinFloats(cx,cy,Math.min(gained,8));
  spawnFloat(cx,cy-60,`+${gained} ${t('coins').toLowerCase()}`,true);
  saveProgress();
  render();
}

function exchangePoints(btnEl){
  if(state.notas<100)return;
  const gained=Math.floor(state.notas/100);
  state.notas=state.notas%100;
  state.moedas+=gained;
  playCoinSfx();
  const rect=btnEl.getBoundingClientRect();
  const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  const cl=(window.innerWidth-520)/2;
  particles.push(...makeCoinParticles(cx-cl,cy));startParticleLoop();
  spawnCoinFloats(cx,cy,gained>0?6:3);
  spawnFloat(cx,cy-60,`+${gained} ${t('coins').toLowerCase()}`,true);
  saveProgress();
  render();
}

// ── 6. SISTEMA DE XP E PROGRESSÃO ────────────────────────────
// ── Animação de ganho de XP ───────────────────────────────────
function playTickSfx(pitch){
  try{
    const ctx=getAudioCtx();
    const t=ctx.currentTime;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(pitch,t);
    o.frequency.exponentialRampToValueAtTime(pitch*1.4,t+.03);
    g.gain.setValueAtTime(.04,t);
    g.gain.exponentialRampToValueAtTime(.001,t+.05);
    o.connect(g);g.connect(ctx.destination);
    o.start(t);o.stop(t+.06);
  }catch(e){}
}

function animateXPGain(fromXP, toXP){
  if(toXP<=fromXP) return;
  const duration=700;
  const start=performance.now();
  const fill=document.getElementById('xp-fill');
  const label=document.getElementById('xp-label');
  if(!fill||!label) return;

  fill.style.transition='none';
  fill.classList.add('xp-fill--animating');

  let lastTick=-1;
  const tickInterval=50;

  function step(now){
    const elapsed=now-start;
    const t=Math.min(elapsed/duration,1);
    const eased=1-Math.pow(1-t,3);
    const currentXP=Math.round(fromXP+(toXP-fromXP)*eased);

    state.xpDisplay=currentXP;

    const lIdx=getLvlIdx(currentXP);
    const lvlStart=getLvlStartXP(lIdx);
    const lvl=LEVELS[lIdx];
    const inLevel=Math.max(0,currentXP-lvlStart);
    label.textContent=`${inLevel} / ${lvl.xpToNext} XP`;
    const prog=Math.min((currentXP-lvlStart)/lvl.xpToNext,1)*100;
    fill.style.width=prog+'%';

    const tickIndex=Math.floor(elapsed/tickInterval);
    if(tickIndex!==lastTick){
      lastTick=tickIndex;
      playTickSfx(500+eased*700);
    }

    if(t<1){
      requestAnimationFrame(step);
    } else {
      state.xpDisplay=toXP;
      fill.style.transition='width .8s cubic-bezier(.4,0,.2,1)';
      fill.classList.remove('xp-fill--animating');
      fill.style.animation='xpBarFlash .4s ease';
      setTimeout(()=>{if(fill)fill.style.animation='';},400);
    }
  }
  requestAnimationFrame(step);
}

function goToTraining(){
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  state.tab='game';
  // Se já está numa pergunta ativa, apenas re-renderiza
  if(state.phase==='question'||state.phase==='answered'){
    render();
    return;
  }
  // Qualquer outra tela: gera pergunta nova sem resetar XP/moedas/progresso
  state.result=null;
  state.lvlUpPending=false;
  genQ();
  state.phase='question';
  render();
  setTimeout(()=>playChord(state.chord),300);
}

function setTab(t){state.tab=t;if(t==='ranking'){state.rankingLoading=true;render();loadRankingData();}else render();}
