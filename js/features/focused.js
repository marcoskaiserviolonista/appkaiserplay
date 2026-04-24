// ── 7. FUNÇÕES DE RENDERIZAÇÃO (UI) ──────────────────────────
// Translates quality label based on current language
function _translateQualityLabel(quality, fallbackLabel){
  const map={
    'maior':t('quality_major'), 'menor':t('quality_minor'),
    'diminuto':t('quality_diminished'), 'meio-diminuto':t('quality_half_dim'),
    'aumentado':t('quality_augmented'),
    'Maior':t('quality_major'), 'Menor':t('quality_minor'),
    'Diminuto':t('quality_diminished'), 'Meio Diminuto':t('quality_half_dim'),
    'Aumentado':t('quality_augmented'),
  };
  return map[quality]||map[fallbackLabel]||fallbackLabel;
}
// ── TREINO FOCADO: Constantes ─────────────────────────────────
// 1-3: verde | 4-6: amarelo | 7-9: rosa | 10-12: ciano | ...
const FOCUSED_COMBO_COLORS = [
  '#22c55e','#ffd700','#ff79c6','#00e5ff','#69ff47',
  '#ffab40','#e040fb','#40c4ff','#b9f6ca','#ffe57f','#f8bbd0'
];
const FOCUSED_COMBO_SOUNDS = ['correct','correct2','combo3','combo6','combo9'];

function getFocusedStage(streak){return streak<1?0:Math.floor((streak-1)/3);}
function getFocusedColor(streak){return FOCUSED_COMBO_COLORS[getFocusedStage(streak)%FOCUSED_COMBO_COLORS.length];}
function getFocusedElogio(streak){const idx=Math.floor(streak/3)-1;const arr=t('focused_elogios').split('|');return arr[Math.min(idx,arr.length-1)];}
function getFocusedSound(streak){const s=getFocusedStage(streak);return FOCUSED_COMBO_SOUNDS[Math.min(s,FOCUSED_COMBO_SOUNDS.length-1)];}

// Definição dos pools dos switches
const FOCUSED_SWITCH_POOLS = {
  maior_menor:            ()=>[
    ...CHORDS.filter(c=>c.id>=0&&c.id<=13),
    ...CHORDS.filter(c=>[56,57,58,59,60,156,163].includes(c.id)),
  ],
  menor_diminuto:         ()=>[
    ...CHORDS.filter(c=>c.id>=7&&c.id<=13),
    ...CHORDS.filter(c=>[56,58,59,163].includes(c.id)),
    ...CHORDS_DIAMOND.filter(c=>[121,122,123,124,144,150,152].includes(c.id)),
  ],
  diminuto_meio_diminuto: ()=>[...CHORDS_DIAMOND.filter(c=>[121,122,123,124,144,150,152,125,126,127,128,145].includes(c.id))],
  diminuto_aumentado:     ()=>[...CHORDS_DIAMOND.filter(c=>[121,122,123,124,144,150,152,40,41,42,142,151].includes(c.id))],
  triades_maiores:        ()=>[...CHORDS.filter(c=>[0,1,2,3,4,5,6,57,60,156].includes(c.id))],
  triades_menores:        ()=>[...CHORDS.filter(c=>[7,8,9,10,11,12,13,56,58,59,163].includes(c.id))],
  tetrades_maiores:       ()=>[
    ...CHORDS.filter(c=>[21,22,23,24,25,26,44,157].includes(c.id)),
    ...CHORDS_DIAMOND.filter(c=>[155].includes(c.id)),
    // Dominantes
    ...CHORDS.filter(c=>c.id>=14&&c.id<=20),
    ...CHORDS.filter(c=>[159,164].includes(c.id)),
  ],
  tetrades_menores:       ()=>[
    ...CHORDS.filter(c=>[27,28,29,30,31,32,43,52,161].includes(c.id)),
    // Xm7M puros (tônica + terça menor + quinta + sétima maior)
    ...CHORDS_DIAMOND.filter(c=>[46,47,48,49,181,182,183,184].includes(c.id)),
  ],
  inversoes:              ()=>[...CHORDS_DIAMOND.filter(c=>[36,38,115,140,141,146,147,148,153,154,166,167,168,169,170,171,172].includes(c.id))],
  dissonantes:            ()=>[
    // Dominantes com tensão/extensão
    ...CHORDS_DIAMOND.filter(c=>[101,108,109,110,111,113,133,136,138,139,143].includes(c.id)),
    // Dominantes alterados
    ...CHORDS_DIAMOND.filter(c=>[40,116,117,118,119,120,129].includes(c.id)),
    // Aumentados
    ...CHORDS_DIAMOND.filter(c=>[41,42,142,151].includes(c.id)),
    // Diminutos
    ...CHORDS_DIAMOND.filter(c=>[121,122,123,124,144,150,152].includes(c.id)),
    // Meio-diminutos
    ...CHORDS_DIAMOND.filter(c=>[125,126,127,128,145].includes(c.id)),
    // Xm7M com extensão
    ...CHORDS_DIAMOND.filter(c=>[185,186,189].includes(c.id)),
    // Dominantes novos
    ...CHORDS_DIAMOND.filter(c=>[160,165].includes(c.id)),
  ],
  extensoes:              ()=>[
    // Sextas e Sus
    ...CHORDS.filter(c=>[33,34,35,37,39,45,162].includes(c.id)),
    // Nonas sobre base estável
    ...CHORDS_DIAMOND.filter(c=>[100,102,103,104,105,106,107,114,130,131,132,134,135,137].includes(c.id)),
    // Extensões novas
    ...CHORDS_DIAMOND.filter(c=>[158,173,174,175,176,177,178,179,180].includes(c.id)),
    // Voicings e 6(9)
    ...CHORDS_DIAMOND.filter(c=>[187,188,190,191].includes(c.id)),
  ],
  xm7M:                   ()=>[
    ...CHORDS_DIAMOND.filter(c=>[46,47,48,49,181,182,183,184].includes(c.id)),
  ],
  bossa_jazz:             ()=>[
    // X6 e X6(9)
    ...CHORDS.filter(c=>[33,34,35,39,45,162].includes(c.id)),
    ...CHORDS_DIAMOND.filter(c=>[102,114,176,177].includes(c.id)),
    // X7M(9) e Xm7(9)
    ...CHORDS_DIAMOND.filter(c=>[100,106,132,134,135,137,158,173,174,175,180].includes(c.id)),
    // X7(9) e variantes
    ...CHORDS_DIAMOND.filter(c=>[101,108,109,110,111,113,116,117,118,119,120,129,133,136,138,139,143,160].includes(c.id)),
    // Diminutos
    ...CHORDS_DIAMOND.filter(c=>[121,122,123,124,144,150,152].includes(c.id)),
    // Aumentados
    ...CHORDS_DIAMOND.filter(c=>[40,41,42,142,151].includes(c.id)),
    // Meio diminutos
    ...CHORDS_DIAMOND.filter(c=>[125,126,127,128,145].includes(c.id)),
    // Sus
    ...CHORDS.filter(c=>[37,162].includes(c.id)),
    ...CHORDS_DIAMOND.filter(c=>[178,179].includes(c.id)),
    // Inversões
    ...CHORDS_DIAMOND.filter(c=>[36,38,115,140,141,146,147,148,153,154,166,167,168,169,170,171,172].includes(c.id)),
    ...CHORDS_DIAMOND.filter(c=>[165].includes(c.id)),
    // Xm7M(9) e X6(9) novos
    ...CHORDS_DIAMOND.filter(c=>[185,186,187,188,189,190,191].includes(c.id)),
  ],
  acordes_complexos:      ()=>{const seen=new Set();return[...FOCUSED_SWITCH_POOLS.dissonantes(),...FOCUSED_SWITCH_POOLS.extensoes(),...FOCUSED_SWITCH_POOLS.bossa_jazz()].filter(c=>{if(seen.has(c.id))return false;seen.add(c.id);return true;});},
  construcao_acorde:      ()=>[...CHORDS,...CHORDS_DIAMOND],
};

const FB_TRIAD_IDS=new Set([0,1,2,3,4,5,6,7,8,9,10,11,12,13,56,57,58,59,60,156,163]);
const FB_TETRAD_IDS=new Set([14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,43,44,52,157,159,161,164]);
const FB_XM7M_IDS=new Set([46,47,48,49,181,182,183,184]);
const FRETBOARD_SWITCH_POOLS={
  fb_triades:  ()=>CHORDS.filter(c=>FB_TRIAD_IDS.has(c.id)),
  fb_tetrades: ()=>[...CHORDS.filter(c=>FB_TETRAD_IDS.has(c.id)),...CHORDS_DIAMOND.filter(c=>FB_XM7M_IDS.has(c.id))],
  fb_complexos:()=>[...CHORDS_DIAMOND.filter(c=>!FB_XM7M_IDS.has(c.id)),...CHORDS.filter(c=>!FB_TRIAD_IDS.has(c.id)&&!FB_TETRAD_IDS.has(c.id))],
};

// Switch labels are now resolved via t() at render time
function getFocusedSwitchLabel(key){
  const pt={
    maior_menor:'Maior ou Menor', menor_diminuto:'Menor ou Diminuto',
    diminuto_meio_diminuto:'Diminuto ou Meio Diminuto', diminuto_aumentado:'Diminuto ou Aumentado',
    triades_maiores:'Tríades Maiores', triades_menores:'Tríades Menores',
    tetrades_maiores:'Tétrades Maiores', tetrades_menores:'Tétrades Menores',
    inversoes:'Inversões', dissonantes:'Dissonantes', extensoes:'Extensões',
    bossa_jazz:'Bossa Nova & Jazz', acordes_complexos:'Acordes Complexos',
  };
  const en={
    maior_menor:'Major / Minor', menor_diminuto:'Minor / Diminished',
    diminuto_meio_diminuto:'Diminished / Half-Dim.', diminuto_aumentado:'Diminished / Augmented',
    triades_maiores:'Major Triads', triades_menores:'Minor Triads',
    tetrades_maiores:'Major Tetrads', tetrades_menores:'Minor Tetrads',
    inversoes:'Inversions', dissonantes:'Dissonant Chords', extensoes:'Extensions',
    bossa_jazz:'Bossa Nova & Jazz', acordes_complexos:'Complex Chords',
  };
  const es={
    maior_menor:'Mayor / Menor', menor_diminuto:'Menor / Disminuido',
    diminuto_meio_diminuto:'Disminuido / Semidisminuido', diminuto_aumentado:'Disminuido / Aumentado',
    triades_maiores:'Tríadas Mayores', triades_menores:'Tríadas Menores',
    tetrades_maiores:'Tétradas Mayores', tetrades_menores:'Tétradas Menores',
    inversoes:'Inversiones', dissonantes:'Acordes Disonantes', extensoes:'Extensiones',
    bossa_jazz:'Bossa Nova & Jazz', acordes_complexos:'Acordes Complejos',
  };
  return (state.lang==='en'?en:state.lang==='es'?es:pt)[key]||key;
}
// Switches que geram perguntas de qualidade (2 botões) em vez de 4 choices
const FOCUSED_QUALITY_PAIRS = {
  maior_menor:            {opts:['maior','menor'],          labels:['Maior','Menor']},
  menor_diminuto:         {opts:['menor','diminuto'],       labels:['Menor','Diminuto']},
  diminuto_meio_diminuto: {opts:['diminuto','meio-diminuto'],labels:['Diminuto','Meio Diminuto']},
  diminuto_aumentado:     {opts:['diminuto','aumentado'],   labels:['Diminuto','Aumentado']},
};

// Adicionar quality aos acordes do pool de qualidade que ainda não têm
// menor_diminuto: diminutos já têm quality='diminuto', menores têm quality='menor' ✓
// diminuto_meio_diminuto: meio-dim (m7b5) não têm quality definida → tratamos por id
// diminuto_aumentado: aumentados têm quality='aumentado' ✓

function getFocusedQualityForChord(ch, switchKey){
  if(ch.quality) return ch.quality;
  // meio-diminutos (ids 125-128, 145) não têm quality no objeto
  if([125,126,127,128,145].includes(ch.id)) return 'meio-diminuto';
  return null;
}

function isQualitySwitch(key){ return key in FOCUSED_QUALITY_PAIRS; }

const QUALITY_HINTS={
  maior_menor:{
    pt:{q:'O acorde que você está ouvindo é feliz ou triste?',a:'Maior = sensação alegre',b:'Menor = sensação triste'},
    en:{q:'Does the chord sound happy or sad?',a:'Major = happy feeling',b:'Minor = sad feeling'},
    es:{q:'¿El acorde que escuchas suena feliz o triste?',a:'Mayor = sensación alegre',b:'Menor = sensación triste'}
  },
  menor_diminuto:{
    pt:{q:'Qual acorde tem mais tensão?',a:'Menor = melancólico, triste',b:'Diminuto = sensação de terror'},
    en:{q:'Which chord has more tension?',a:'Minor = melancholic, sad',b:'Diminished = feeling of terror'},
    es:{q:'¿Cuál acorde tiene más tensión?',a:'Menor = melancólico, triste',b:'Disminuido = sensación de terror'}
  },
  diminuto_meio_diminuto:{
    pt:{q:'Qual o nível de tensão que você está sentindo?',a:'Diminuto = terror intenso',b:'Meio Diminuto = terror, mas não tanto'},
    en:{q:'How intense is the tension you hear?',a:'Diminished = intense terror',b:'Half Diminished = terror, but not as much'},
    es:{q:'¿Cuál es el nivel de tensión que sientes?',a:'Disminuido = terror intenso',b:'Semidisminuido = terror, pero no tanto'}
  },
  diminuto_aumentado:{
    pt:{q:'A tensão que você sente é sombria ou dramática?',a:'Diminuto = sensação de terror',b:'Aumentado = sensação dramática'},
    en:{q:'Does the tension feel dark or dramatic?',a:'Diminished = feeling of terror',b:'Augmented = dramatic feeling'},
    es:{q:'¿La tensión que sientes es sombría o dramática?',a:'Disminuido = sensación de terror',b:'Aumentado = sensación dramática'}
  }
};

function buildQualityHintHtml(){
  if(!state.isQuality||!state.qualityPair)return'';
  const pair=state.qualityPair;
  const hintKey=pair.opts[0]+'_'+pair.opts[1].replace('-','_');
  const h=QUALITY_HINTS[hintKey];
  if(!h)return'';
  const lang=state.lang||'pt';
  const d=h[lang]||h.pt;
  return `
    <div id="quality-hint-panel" style="display:none;position:fixed;bottom:calc(1.5rem + 72px + .75rem);left:1rem;max-width:360px;background:#1a1a1a;border:2px solid #555;border-radius:18px;padding:1.1rem 1.2rem;z-index:9998;box-shadow:4px 4px 0 #000">
      <button onclick="document.getElementById('quality-hint-panel').style.display='none'" style="position:absolute;top:.5rem;right:.7rem;background:transparent;border:none;color:#666;font-size:1.1rem;cursor:pointer">✕</button>
      <div style="font-size:1rem;font-weight:700;color:#F5A623;margin-bottom:.65rem;line-height:1.4;padding-right:1.4rem">${d.q}</div>
      <div style="font-size:.95rem;color:#ccc;font-weight:600;line-height:1.9">${d.a}<br>${d.b}</div>
    </div>
    <button onclick="const b=document.getElementById('quality-hint-panel');b.style.display=b.style.display==='none'?'block':'none'"
      style="position:fixed;bottom:1.5rem;left:1rem;width:64px;height:64px;border-radius:50%;background:linear-gradient(180deg,#555,#333);border:3px solid #aaa;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:9998;transition:transform .12s;animation:hintGlow 2s ease-in-out infinite"
      onmouseenter="this.style.transform='translate(-2px,-2px) scale(1.08)'"
      onmouseleave="this.style.transform=''"
      onmousedown="this.style.transform='scale(.93)'">
      <img src="assets/lampada.png" style="width:34px;height:34px;object-fit:contain">
    </button>
  `;
}

// UX TEST: setar true para reexibir o botão "Jornada pelas Cordas" na tela inicial
const SHOW_CORDAS_JOURNEY = false;

const FOCUSED_FREE_SWITCHES = new Set(['maior_menor','triades_maiores','tetrades_menores']);
function isSwitchUnlocked(key){ return state.fullAccess || FOCUSED_FREE_SWITCHES.has(key); }
const FRETBOARD_FREE_SWITCHES = new Set(['fb_triades']);
function isFretboardSwitchUnlocked(key){ return state.fullAccess || FRETBOARD_FREE_SWITCHES.has(key); }

function buildFocusedPool(){
  const seen=new Set();
  const pool=[];
  for(const[key,on] of Object.entries(state.focusedSwitches)){
    if(!on||!isSwitchUnlocked(key)) continue;
    for(const c of FOCUSED_SWITCH_POOLS[key]()){
      if(!seen.has(c.id)){seen.add(c.id);pool.push(c);}
    }
  }
  return pool;
}

function hasFocusedSwitch(){
  return Object.entries(state.focusedSwitches).some(([k,v])=>v&&isSwitchUnlocked(k));
}

function toggleFocusedSwitch(key){
  if(!isSwitchUnlocked(key)){playClickSfx('locked');return;}
  state.focusedSwitches[key]=!state.focusedSwitches[key];
  playClickSfx(state.focusedSwitches[key]?'switch_on':'switch_off');
  render();
}

function hasFretboardSwitch(){
  return Object.values(state.fretboardSwitches).some(Boolean);
}
function toggleFretboardSwitch(key){
  state.fretboardSwitches[key]=!state.fretboardSwitches[key];
  playClickSfx(state.fretboardSwitches[key]?'switch_on':'switch_off');
  render();
}

function startFocusedSession(){
  if(!hasFocusedSwitch()) return;
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  state.isSmartSession=false;
  state.fretboardExercise=false;
  state.focusedPool=buildFocusedPool();
  state.focusedStreak=0;
  state.focusedSessionScore=0;
  state.focusedSessionTotal=0;
  state.focusedSessionCorrect=0;
  state.result=null;
  state.selected=null;
  state.qualitySelected=null;
  genFocusedQ();
  state.phase='treino_focado_question';
  render();
}

function startFretboardSession(){
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  state.isSmartSession=false;
  state.fretboardExercise=true;
  let pool=[];
  const sw=state.fretboardSwitches;
  if(sw.fb_triades  &&isFretboardSwitchUnlocked('fb_triades'))  pool.push(...FRETBOARD_SWITCH_POOLS.fb_triades());
  if(sw.fb_tetrades &&isFretboardSwitchUnlocked('fb_tetrades')) pool.push(...FRETBOARD_SWITCH_POOLS.fb_tetrades());
  if(sw.fb_complexos&&isFretboardSwitchUnlocked('fb_complexos'))pool.push(...FRETBOARD_SWITCH_POOLS.fb_complexos());
  if(pool.length<2)  pool=[...CHORDS,...CHORDS_DIAMOND];
  const seen=new Set();
  state.focusedPool=pool.filter(c=>{if(seen.has(c.id))return false;seen.add(c.id);return true;});
  state.focusedStreak=0;state.focusedSessionScore=0;
  state.focusedSessionTotal=0;state.focusedSessionCorrect=0;
  state.result=null;state.selected=null;state.qualitySelected=null;
  genFocusedQ();
  state.phase='treino_focado_question';
  render();
}

function startSmartSession(){
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  state.fretboardExercise=false;
  state.isFretboard=false;
  const allChords=[...CHORDS,...CHORDS_DIAMOND];
  const chordMap=Object.fromEntries(allChords.map(c=>[c.id,c]));
  const specificWeak=Object.entries(state.chordStats)
    .filter(([,v])=>v.e>0).sort((a,b)=>b[1].e-a[1].e).slice(0,4)
    .map(([id])=>chordMap[parseInt(id)]).filter(Boolean);
  const seen=new Set();const pool=[];
  for(const c of specificWeak){if(!seen.has(c.id)){seen.add(c.id);pool.push(c);}}
  state.focusedPool=pool;
  state.isSmartSession=true;
  state.smartActivePairs=[];
  state.smartWeakQualities=[];
  state.focusedStreak=0;state.focusedSessionScore=0;state.focusedSessionTotal=0;state.focusedSessionCorrect=0;
  state.result=null;state.selected=null;state.qualitySelected=null;
  genFocusedQ();state.phase='treino_focado_question';render();
}

function genFocusedQ(){
  const pool=state.focusedPool;
  if(!pool||pool.length<2){state.phase='treino_focado_menu';render();return;}

  if(state.isSmartSession){
    const ans=pool[Math.floor(Math.random()*pool.length)];
    state.chord=ans;state.isQuality=false;state.qualityAnswer=null;state.qualityPair=null;
    state.choices=[...pool].sort(()=>Math.random()-.5);
    state.selected=null;state.qualitySelected=null;state.result=null;
    setTimeout(()=>playChord(state.chord),120);return;
  }

  // Fretboard exercise: pula toda lógica de qualidade/switches
  if(state.fretboardExercise){
    const ans=pool[Math.floor(Math.random()*pool.length)];
    state.chord=ans;state.isQuality=false;state.qualityAnswer=null;state.qualityPair=null;
    state.choices=[];state.selected=null;state.qualitySelected=null;state.result=null;
  }

  // Verificar se todos os switches ativos são de qualidade
  const activeKeys=Object.entries(state.focusedSwitches).filter(([,v])=>v).map(([k])=>k);
  const allQuality=activeKeys.length>0&&activeKeys.every(k=>isQualitySwitch(k));

  if(state.fretboardExercise){
    // já tratado acima, cai no bloco de ativação do fretboard
  } else if(allQuality){
    // Escolher aleatoriamente um dos switches ativos e gerar pergunta de qualidade
    const key=activeKeys[Math.floor(Math.random()*activeKeys.length)];
    const pair=FOCUSED_QUALITY_PAIRS[key];
    const keyPool=FOCUSED_SWITCH_POOLS[key]();
    const chord=keyPool[Math.floor(Math.random()*keyPool.length)];
    state.chord=chord;
    state.isQuality=true;
    state.qualityAnswer=getFocusedQualityForChord(chord, key);
    state.qualityPair=pair;
    state.choices=[];
    state.selected=null;
    state.qualitySelected=null;
    state.result=null;
  } else if(activeKeys.some(k=>isQualitySwitch(k))&&activeKeys.some(k=>!isQualitySwitch(k))){
    // Mix: chance 50% de gerar qualidade se tiver switches de qualidade ativos
    const qualityKeys=activeKeys.filter(k=>isQualitySwitch(k));
    if(Math.random()<0.5&&qualityKeys.length>0){
      const key=qualityKeys[Math.floor(Math.random()*qualityKeys.length)];
      const pair=FOCUSED_QUALITY_PAIRS[key];
      const keyPool=FOCUSED_SWITCH_POOLS[key]();
      const chord=keyPool[Math.floor(Math.random()*keyPool.length)];
      state.chord=chord;
      state.isQuality=true;
      state.qualityAnswer=getFocusedQualityForChord(chord, key);
      state.qualityPair=pair;
      state.choices=[];
      state.selected=null;
      state.qualitySelected=null;
      state.result=null;
    } else {
      // 4-choice: usa só os pools de switches de tipo (não qualidade)
      const typeKeys=activeKeys.filter(k=>!isQualitySwitch(k));
      const seen=new Set();const typePool=[];
      for(const k of typeKeys){for(const c of FOCUSED_SWITCH_POOLS[k]()){if(!seen.has(c.id)){seen.add(c.id);typePool.push(c);}}}
      const srcPool=typePool.length>=2?typePool:pool;
      const ans=srcPool[Math.floor(Math.random()*srcPool.length)];
      const wrong=_pickWrong(ans,srcPool);
      state.chord=ans;
      state.isQuality=false;
      state.qualityAnswer=null;
      state.qualityPair=null;
      state.choices=[ans,...wrong].sort(()=>Math.random()-.5);
      state.selected=null;
      state.qualitySelected=null;
      state.result=null;
    }
  } else {
    // Só switches de tipo → 4 choices normais
    const ans=pool[Math.floor(Math.random()*pool.length)];
    const wrong=_pickWrong(ans,pool);
    state.chord=ans;
    state.isQuality=false;
    state.qualityAnswer=null;
    state.qualityPair=null;
    state.choices=[ans,...wrong].sort(()=>Math.random()-.5);
    state.selected=null;
    state.qualitySelected=null;
    state.result=null;
  }

  // Fretboard mode para Construção de Acorde
  const _fbActive=state.fretboardExercise;
  state.isFretboard=_fbActive;
  if(_fbActive)state.fbSel={};

  setTimeout(()=>playChord(state.chord),120);
}

function handleFocusedQualityAnswer(quality, btnEl){
  if(state.qualitySelected!==null||state.phase!=='treino_focado_question') return;
  state.qualitySelected=quality;
  const ok=(quality===state.qualityAnswer);
  // reutiliza handleFocusedAnswer passando id correto e estado de qualidade
  state.selected=state.chord.id; // marca como respondido
  state.result={ok};
  state.phase='treino_focado_answered';

  const rect=btnEl.getBoundingClientRect();
  const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
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
    if(getLvlIdx(state.xp)>getLvlIdx(xpBefore)){state.lvlUpPending=true;checkRatingPrompt(LEVELS[getLvlIdx(state.xp)].n);}

    const color=getFocusedColor(state.focusedStreak);
    playSfx(getFocusedSound(state.focusedStreak));
    btnEl.style.animation='correctExplode .4s ease';
    setTimeout(()=>{if(btnEl)btnEl.style.animation='';},400);
    particles.push(...makeParticles(cx-cl,cy,12,false));startParticleLoop();
    const app=document.getElementById('app');
    if(app){app.classList.add('flash-correct');setTimeout(()=>app.classList.remove('flash-correct'),350);}

    const pontosTxt=bonus===0?`+5 ${t('points')}`:`5 + ${bonus} ${t('points')}`;
    const elogio=state.focusedStreak%3===0?getFocusedElogio(state.focusedStreak):null;
    const xpPopup=document.createElement('div');
    xpPopup.innerHTML=`<div style="font-size:1.25rem;font-weight:900;line-height:1.2">${pontosTxt}</div>${elogio?`<div style="font-size:.95rem;font-weight:700;opacity:.92;margin-top:.15rem">${elogio}</div>`:''}`;
    xpPopup.style.cssText=`position:fixed;z-index:9999;left:${rect.left+rect.width/2}px;top:${rect.top}px;transform:translate(-50%,-100%);text-align:center;color:${color};text-shadow:0 0 18px ${color},0 0 40px ${color}66;pointer-events:none;white-space:nowrap;`;
    document.body.appendChild(xpPopup);
    xpPopup.animate([
      {opacity:0,transform:'translate(-50%,-60%) scale(.5)'},
      {opacity:1,transform:'translate(-50%,-120%) scale(1.2)',offset:.15},
      {opacity:1,transform:'translate(-50%,-130%) scale(1)',offset:.78},
      {opacity:0,transform:'translate(-50%,-160%) scale(.9)'}
    ],{duration:1600,easing:'ease-out'}).onfinish=()=>xpPopup.remove();
    setTimeout(()=>animateXPGain(xpBefore, state.xp), 100);
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
    wrongPop.style.cssText=`position:fixed;z-index:9999;left:${rect.left+rect.width/2}px;top:${rect.top}px;transform:translate(-50%,-100%);font-size:1.1rem;font-weight:900;color:#ff9999;text-shadow:0 0 14px #ff999966;pointer-events:none;white-space:nowrap;`;
    document.body.appendChild(wrongPop);
    wrongPop.animate([
      {opacity:1,transform:'translate(-50%,-100%) translateY(0)'},
      {opacity:0,transform:'translate(-50%,-100%) translateY(-24px)'}
    ],{duration:900,easing:'ease-out'}).onfinish=()=>wrongPop.remove();
    setTimeout(()=>animateXPGain(xpBefore, state.xp), 100);
  }

  render();
  autoTimer=setTimeout(()=>{
    if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
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
    genFocusedQ();
    state.phase='treino_focado_question';
    render();
  },1400);
}

function handleFocusedAnswer(choiceId,btnEl){
  if(state.selected!==null||state.phase!=='treino_focado_question') return;
  state.selected=choiceId;
  const selectedCifraF=(state.choices.find(c=>c.id===choiceId)||{}).cifra;
  const ok=(selectedCifraF===state.chord.cifra);
  state.result={ok};
  state.phase='treino_focado_answered';

  const rect=btnEl.getBoundingClientRect();
  const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
  const cl=(window.innerWidth-520)/2;

  if(ok){
    // Pontuação: 5 base + bônus = streak após incremento (só a partir do 2º acerto)
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
    if(getLvlIdx(state.xp)>getLvlIdx(xpBefore)){state.lvlUpPending=true;checkRatingPrompt(LEVELS[getLvlIdx(state.xp)].n);}

    const color=getFocusedColor(state.focusedStreak);
    playSfx(getFocusedSound(state.focusedStreak));

    btnEl.style.animation='correctExplode .4s ease';
    setTimeout(()=>{if(btnEl)btnEl.style.animation='';},400);
    particles.push(...makeParticles(cx-cl,cy,12,false));startParticleLoop();

    const app=document.getElementById('app');
    if(app){app.classList.add('flash-correct');setTimeout(()=>app.classList.remove('flash-correct'),350);}

    // Popup de pontos + elogio na mesma caixa
    const pontosTxt=bonus===0?`+5 ${t('points')}`:`5 + ${bonus} ${t('points')}`;
    const elogio=state.focusedStreak%3===0?getFocusedElogio(state.focusedStreak):null;
    const xpPopup=document.createElement('div');
    xpPopup.innerHTML=`<div style="font-size:1.25rem;font-weight:900;line-height:1.2">${pontosTxt}</div>${elogio?`<div style="font-size:.95rem;font-weight:700;opacity:.92;margin-top:.15rem">${elogio}</div>`:''}`;
    xpPopup.style.cssText=`position:fixed;z-index:9999;left:${rect.left+rect.width/2}px;top:${rect.top}px;transform:translate(-50%,-100%);text-align:center;color:${color};text-shadow:0 0 18px ${color},0 0 40px ${color}66;pointer-events:none;white-space:nowrap;`;
    document.body.appendChild(xpPopup);
    xpPopup.animate([
      {opacity:0,transform:'translate(-50%,-60%) scale(.5)'},
      {opacity:1,transform:'translate(-50%,-120%) scale(1.2)',offset:.15},
      {opacity:1,transform:'translate(-50%,-130%) scale(1)',offset:.78},
      {opacity:0,transform:'translate(-50%,-160%) scale(.9)'}
    ],{duration:1600,easing:'ease-out'}).onfinish=()=>xpPopup.remove();

    // Animar barra de XP
    setTimeout(()=>animateXPGain(xpBefore, state.xp), 100);

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

    // Popup -5
    const wrongPop=document.createElement('div');
    wrongPop.textContent='-5 XP';
    wrongPop.style.cssText=`position:fixed;z-index:9999;left:${rect.left+rect.width/2}px;top:${rect.top}px;transform:translate(-50%,-100%);font-size:1.1rem;font-weight:900;color:#ff9999;text-shadow:0 0 14px #ff999966;pointer-events:none;white-space:nowrap;`;
    document.body.appendChild(wrongPop);
    wrongPop.animate([
      {opacity:1,transform:'translate(-50%,-100%) translateY(0)'},
      {opacity:0,transform:'translate(-50%,-100%) translateY(-24px)'}
    ],{duration:900,easing:'ease-out'}).onfinish=()=>wrongPop.remove();

    setTimeout(()=>animateXPGain(xpBefore, state.xp), 100);
  }

  render();
  autoTimer=setTimeout(()=>{
    if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
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
    genFocusedQ();
    state.phase='treino_focado_question';
    render();
  },1400);
}

// ── RENDER: Treino Focado Menu ────────────────────────────────
function renderTreinoFocadoMenu(){
  // Calcular 4 acordes mais errados
  const allChords=[...CHORDS,...CHORDS_DIAMOND];
  const chordMap=Object.fromEntries(allChords.map(c=>[c.id,c]));
  const hasHistory=state.stats.t>0;
  const topErrors=hasHistory
    ? Object.entries(state.chordStats)
        .filter(([,v])=>v.e>0)
        .sort((a,b)=>b[1].e-a[1].e)
        .slice(0,4)
        .map(([id])=>chordMap[parseInt(id)])
        .filter(Boolean)
    : [];
  const hasSmartData=topErrors.length>0;

  const section1=[
    {key:'maior_menor'},
    {key:'menor_diminuto'},
    {key:'diminuto_meio_diminuto'},
    {key:'diminuto_aumentado'},
  ];
  const section2=[
    {key:'triades_maiores'},
    {key:'triades_menores'},
    {key:'tetrades_maiores'},
    {key:'tetrades_menores'},
    {key:'acordes_complexos'},
  ];
  const makeSwitch=({key})=>{
    const on=state.focusedSwitches[key];
    const unlocked=isSwitchUnlocked(key);
    const isComplexo=key==='acordes_complexos';
    const desc=isComplexo?(state.lang==='en'?'chords with ninth, thirteenth, diminished, sixth, etc.':state.lang==='es'?'acordes con novena, decimotercera, disminuidos, sexta y etc.':'são os acordes com nona, décima terceira, diminutos, sexta e etc.'):null;
    const rowStyle=isComplexo?`background:#1a1400;border-color:${on?'#F5A62388':'#F5A62333'};animation:neonPulse 2.8s ease-in-out infinite;`:'';
    return `<div class="tf-switch-row${on?' active':''}" style="${rowStyle}" onclick="toggleFocusedSwitch('${key}')">
      <div style="flex:1;min-width:0">
        <span class="tf-switch-label" style="${isComplexo?'color:#F5A623;':''}">${getFocusedSwitchLabel(key)}</span>
        ${desc?`<div style="font-size:.75rem;color:#F5A62399;font-weight:600;margin-top:.2rem;line-height:1.3">${desc}</div>`:''}
      </div>
      <span style="display:flex;align-items:center;flex-shrink:0">
        ${!unlocked
          ? `<span style="font-size:1.05rem;line-height:1">🔒</span>`
          : `<span class="tf-switch${on?' on':''}"></span>`}
      </span>
    </div>`;
  };
  const enabled=hasFocusedSwitch();
  const paywall=!state.fullAccess;
  const fbSwitchLabels={
    fb_triades: state.lang==='en'?'Triads':state.lang==='es'?'Tríadas':'Tríades',
    fb_tetrades:state.lang==='en'?'Tetrads':state.lang==='es'?'Tétradas':'Tétrades',
    fb_complexos:state.lang==='en'?'Complex Chords':state.lang==='es'?'Acordes Complejos':'Acordes Complexos',
  };
  const fbSwitchesHtml=['fb_triades','fb_tetrades','fb_complexos'].map(key=>{
    const on=state.fretboardSwitches[key];
    const lbl=fbSwitchLabels[key];
    const locked=paywall&&!isFretboardSwitchUnlocked(key);
    const clickAct=locked?`playClickSfx('click');state.phase='comprar';render()`:`toggleFretboardSwitch('${key}')`;
    const isComplexo=key==='fb_complexos';
    const rowStyle=isComplexo
      ?`border-color:${on?'#60dcff88':'#60dcff22'};background:${on?'#0e2030':'#0a1520'};animation:neonPulseBlue 2.8s ease-in-out infinite;`
      :`border-color:${on?'#60dcff88':'#60dcff22'};background:${on?'#0e2030':'#0a1520'}`;
    return `<div class="tf-switch-row${on?' active':''}" style="${rowStyle}" onclick="${clickAct}">
      <span class="tf-switch-label" style="color:#60dcff">${lbl}</span>
      <span style="display:flex;align-items:center;flex-shrink:0">
        ${locked?`<span style="font-size:1.05rem;line-height:1">🔒</span>`:`<span class="tf-switch${on?' on':''}"></span>`}
      </span>
    </div>`;
  }).join('');
  const fbEnabled=hasFretboardSwitch()&&(['fb_triades','fb_tetrades','fb_complexos'].some(k=>state.fretboardSwitches[k]&&isFretboardSwitchUnlocked(k)));
  return `
    <div style="width:100%;max-width:520px;display:flex;align-items:center;margin-bottom:1.4rem;gap:.75rem">
      <button class="back-btn" onclick="playClickSfx('back');if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}state.phase='start';render()">${t('back_btn')}</button>
      <div style="flex:1;min-width:0;overflow:hidden">
        <span style="font-size:1rem;font-weight:900;color:#60dcff;letter-spacing:.01em;white-space:nowrap">${t('focused_training')}</span>
      </div>
    </div>

    ${paywall?`
    <div style="width:100%;max-width:520px;background:#0a1f0a;border:2px solid #22c55e88;border-radius:14px;padding:.7rem 1rem;margin-bottom:1.25rem;display:flex;align-items:center;justify-content:space-between;gap:.75rem">
      <span style="font-size:.85rem;font-weight:700;color:#4ade80;line-height:1.3">${t('unlock_all_trainings')}</span>
      <button onclick="document.getElementById('tf-paywall-anchor').scrollIntoView({behavior:'smooth',block:'start'})" style="flex-shrink:0;background:linear-gradient(180deg,#16a34a,#15803d);border:3px solid #111;border-radius:10px;box-shadow:4px 4px 0 #111;padding:.4rem .85rem;font-family:var(--font-body);font-size:.82rem;font-weight:900;color:#fff;cursor:pointer;white-space:nowrap;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8)">${state.lang==='en'?'Learn more':state.lang==='es'?'Saber más':'Saiba mais'}</button>
    </div>`:''}

    ${hasHistory&&!hasSmartData?`
    <div style="width:100%;max-width:520px;background:#1a1a1a;border:2px solid #2a2a2a;border-radius:14px;padding:.85rem 1rem;margin-bottom:1.25rem">
      <div style="display:flex;gap:.85rem;align-items:center">
        <img src="assets/forte.png" style="width:22%;flex-shrink:0;object-fit:contain" onerror="this.style.display='none'">
        <div style="flex:1;min-width:0">
          <div style="font-size:.88rem;color:#e0e0e0;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.3rem">${t('training_suggestion')}</div>
          <div style="font-size:.85rem;color:#555;font-weight:600;margin-top:.2rem">${state.lang==='en'?'No data yet':state.lang==='es'?'Sin datos aún':'Sem dados ainda'}</div>
        </div>
      </div>
    </div>`:''}

    ${hasHistory&&hasSmartData?`
    <div style="width:100%;max-width:520px;background:#1a1a1a;border:2px solid #2a2a2a;border-radius:14px;padding:.85rem 1rem;margin-bottom:1.25rem">
      <div style="display:flex;gap:.85rem;align-items:center;margin-bottom:.75rem">
        <img src="assets/forte.png" style="width:22%;flex-shrink:0;object-fit:contain" onerror="this.style.display='none'">
        <div style="flex:1;min-width:0">
          <div style="font-size:.88rem;color:#e0e0e0;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.3rem">${t('training_suggestion')}</div>
          <div style="font-size:.75rem;color:#f87171;font-weight:900;text-transform:uppercase;letter-spacing:.06em;margin-top:.2rem;margin-bottom:.2rem">${state.lang==='en'?'THESE ARE THE CHORDS YOU MISS THE MOST':state.lang==='es'?'ESTOS SON LOS ACORDES QUE MÁS FALLAS':'ESTES SÃO OS ACORDES QUE VOCÊ MAIS ERRA'}</div>
          <div style="font-size:.8rem;color:#888;font-weight:500;line-height:1.45;margin-top:.3rem">${state.lang==='en'?'Train exactly your weak points to improve faster.':state.lang==='es'?'Entrena exactamente tus puntos débiles para mejorar más rápido.':'treine exatamente seus pontos fracos para evoluir mais rápido'}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin-bottom:.75rem">
        ${topErrors.map(c=>`
          <div style="background:#111;border:2px solid #333;border-radius:12px;padding:.75rem .5rem;text-align:center">
            <div style="font-size:1.25rem;font-weight:900;color:#f0f0f0;line-height:1${paywall?';filter:blur(5px);user-select:none':''}">${(state.lang!=='pt'&&c.cifraEn)?c.cifraEn:c.cifra}</div>
            <div style="font-size:.65rem;color:#f87171;font-weight:700;margin-top:.4rem;text-transform:uppercase;letter-spacing:.06em">${state.chordStats[c.id]?.e||0} ${t('wrong_answers').toLowerCase()}</div>
          </div>
        `).join('')}
      </div>
      <button
        style="width:100%;background:linear-gradient(180deg,#1a2a3a,#0e1a2a);border:3px solid ${paywall?'#60dcff44':'#60dcff88'};border-radius:12px;box-shadow:4px 4px 0 #0a1520;cursor:pointer;padding:.7rem 1rem;display:flex;align-items:center;justify-content:center;gap:.6rem;font-family:var(--font-body);font-size:.9rem;font-weight:900;color:${paywall?'#60dcff66':'#60dcff'};letter-spacing:.01em;text-shadow:0 0 12px #60dcff44"
        onclick="${paywall?`playClickSfx('click');state.phase='comprar';render()`:`startSmartSession()`}">
        <span style="font-size:1.1rem">${paywall?'🔒':'<img src="assets/alvo.png" style="width:1.1rem;height:1.1rem;vertical-align:middle;object-fit:contain">'}</span> ${t('train_weak_points')}
      </button>
    </div>`:''}

    <div style="width:100%;max-width:520px;margin-bottom:.75rem;padding:0 .1rem">
      <div style="font-size:.9rem;font-weight:800;color:#60dcff;text-transform:uppercase;letter-spacing:.1em;text-align:center">${state.lang==='en'?'Combine workouts the way you prefer':state.lang==='es'?'Combina los entrenamientos a tu manera':'Combine os treinos da forma que preferir'}</div>
    </div>

    <div style="width:100%;max-width:520px;background:#0e1a24;border:2px solid #60dcff33;border-radius:14px;padding:.85rem 1rem;margin-bottom:1.25rem">
      <div style="display:flex;gap:.85rem;align-items:center;margin-bottom:.75rem">
        <img src="assets/mao.png" style="width:22%;flex-shrink:0;object-fit:contain" onerror="this.style.display='none'">
        <div style="flex:1;min-width:0">
          <div style="font-size:.88rem;color:#e0e0e0;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.3rem">${t('chord_building')}</div>
          <div style="font-size:.8rem;color:#60dcff88;line-height:1.45">${state.lang==='en'?'Train your ear by building the chord directly on the guitar fretboard.':state.lang==='es'?'Entrena tu oído construyendo el acorde directamente en el mástil de la guitarra.':'Treine seu ouvido construindo o acorde diretamente no braço do violão.'}</div>
        </div>
      </div>
      <div style="border-top:1px solid #60dcff22;margin-bottom:.65rem"></div>
      <button id="tut-fb-start-btn"
        style="width:100%;margin-bottom:.65rem;
          ${fbEnabled
            ? 'background:linear-gradient(180deg,#1a2a3a 0%,#0e1a2a 100%);border:3px solid #2a4a6a;border-radius:14px;box-shadow:5px 5px 0 #0a1520;cursor:pointer;padding:.85rem 1.25rem;display:flex;align-items:center;justify-content:center;gap:.75rem;font-family:var(--font-body);font-size:1rem;font-weight:900;color:#60dcff;letter-spacing:.01em;text-shadow:0 0 12px #60dcff66'
            : 'padding:.85rem;background:#111;border:2px solid #1e1e1e;border-radius:14px;font-family:var(--font-body);font-size:.95rem;font-weight:900;color:#333;cursor:default;box-shadow:none;letter-spacing:.02em;text-align:center'}"
        ${fbEnabled?'':'disabled'}
        onclick="${fbEnabled?`startFretboardSession()`:paywall?`playClickSfx('click');state.phase='comprar';render()`:''}">
        ${fbEnabled?'<img src="assets/alvo.png" style="width:1.3rem;height:1.3rem;vertical-align:middle;object-fit:contain;flex-shrink:0"> '+t('start_chord_building'):'🔒 '+t('activate_one')}
      </button>
      <div id="tut-fb-switches">${fbSwitchesHtml}</div>
    </div>

    <div style="width:100%;max-width:520px;background:#0e1a24;border:2px solid #60dcff22;border-radius:16px;padding:1rem 1rem 1.1rem;margin-bottom:1.25rem">
      <div style="font-size:.88rem;color:#60dcff;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.2rem">${t('evolve_faster')}</div>
      <div style="font-size:.82rem;color:#aaa;margin-bottom:.9rem">${t('choose_chords')}</div>
      <button
        style="width:100%;margin-bottom:.9rem;
          ${enabled
            ? 'background:linear-gradient(180deg,#1a2a3a 0%,#0e1a2a 100%);border:3px solid #2a4a6a;border-radius:14px;box-shadow:5px 5px 0 #0a1520;cursor:pointer;padding:.85rem 1.25rem;display:flex;align-items:center;justify-content:center;gap:.75rem;font-family:var(--font-body);font-size:1rem;font-weight:900;color:#60dcff;letter-spacing:.01em;text-shadow:0 0 12px #60dcff66'
            : 'padding:.85rem;background:#111;border:2px solid #1e1e1e;border-radius:14px;font-family:var(--font-body);font-size:.95rem;font-weight:900;color:#333;cursor:default;box-shadow:none;letter-spacing:.02em;text-align:center'}"
        ${enabled?'':'disabled'}
        onclick="startFocusedSession()">
        ${enabled?'<img src="assets/alvo.png" style="width:1.3rem;height:1.3rem;vertical-align:middle;object-fit:contain;flex-shrink:0"> '+t('start_training'):'🔒 '+t('activate_one')}
      </button>
      <div style="border-top:1px solid #60dcff15;margin-bottom:.75rem"></div>
      <div style="font-size:.72rem;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.45rem">${t('train_by_quality')}</div>
      ${section1.map(makeSwitch).join('')}
      <div style="font-size:.72rem;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin:.75rem 0 .45rem">${t('train_by_type')}</div>
      ${section2.map(makeSwitch).join('')}
    </div>
    ${paywall?`
    <div id="tf-paywall-anchor" style="width:100%;max-width:520px;background:#0e1a0e;border:3px solid #22c55e;border-radius:24px;padding:1.5rem 1.35rem 1.4rem;margin-top:1.5rem;text-align:center;box-shadow:6px 6px 0 #000">
      <div style="line-height:1.25;margin-bottom:1.2rem">
        <div style="font-size:1.05rem;font-weight:900;color:#4ade80;font-family:var(--font-title);text-transform:uppercase;letter-spacing:.04em">${t('unlock_all_trainings')}</div>
        <div style="font-size:.84rem;color:#aaa;font-weight:500;line-height:1.45;margin-top:.35rem">${state.lang==='en'?'Speed up your progress by identifying your weaknesses and creating personalized training sessions.':state.lang==='es'?'Acelera tu evolución identificando tus debilidades y creando entrenamientos personalizados.':'Acelere sua evolução identificando suas fraquezas e criando os treinos personalizados.'}</div>
      </div>
      <div style="background:#111;border:2px solid #22c55e22;border-radius:14px;padding:.9rem 1rem;margin-bottom:1.2rem;text-align:left">
        <div style="display:flex;align-items:flex-start;gap:.65rem;margin-bottom:.65rem">
          <span style="font-size:1rem;flex-shrink:0;margin-top:.05rem">🎸</span>
          <span style="font-size:.86rem;color:#ddd;font-weight:600;line-height:1.4">${t('unlock_popup_b1')}</span>
        </div>
        <div style="display:flex;align-items:flex-start;gap:.65rem;margin-bottom:.65rem">
          <img src="assets/alvo.png" style="width:1rem;height:1rem;flex-shrink:0;margin-top:.05rem;object-fit:contain">
          <span style="font-size:.86rem;color:#ddd;font-weight:600;line-height:1.4">${t('unlock_popup_b2')}</span>
        </div>
        <div style="display:flex;align-items:flex-start;gap:.65rem">
          <span style="font-size:1rem;flex-shrink:0;margin-top:.05rem">♾️</span>
          <span style="font-size:.86rem;color:#ddd;font-weight:600;line-height:1.4">${t('unlock_popup_b3')}</span>
        </div>
      </div>
      <div style="text-align:center;margin-bottom:.6rem">
        <span style="display:inline-block;background:#16a34a22;border:1.5px solid #4ade8066;border-radius:20px;padding:.22rem .9rem;font-size:.72rem;font-weight:800;color:#4ade80;letter-spacing:.05em;text-transform:uppercase">${state.lang==='en'?'✓ One-time payment · No subscription':state.lang==='es'?'✓ Pago único · Sin suscripción':'✓ Pagamento único · Sem mensalidade'}</span>
      </div>
      <div style="margin-bottom:1.1rem;text-align:center">
        <div style="font-size:.78rem;color:#888;font-weight:600;margin-bottom:.25rem">${state.lang==='en'?'🇧🇷 From <s style="color:#666">R$99,90</s> for':state.lang==='es'?'🇧🇷 Desde <s style="color:#666">R$99,90</s> por':'De <s style="color:#666">R$99,90</s> por'}</div>
        <div style="font-size:2.2rem;font-weight:900;color:#4ade80;letter-spacing:-.01em;line-height:1;text-shadow:0 0 14px #22c55e55">R$49,90</div>
      </div>
      <button onclick="showToast(t('coming_soon'),t('coming_soon_body'))"
        style="width:100%;padding:.95rem;background:linear-gradient(180deg,#16a34a,#15803d);border:3px solid #111;border-radius:14px;font-family:var(--font-body);font-size:1rem;font-weight:900;color:#fff;cursor:pointer;box-shadow:4px 4px 0 #111;letter-spacing:.02em;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;gap:.5rem">
        ${t('unlock_btn')}
      </button>
    </div>`:''}
  `;
}

// ── RENDER: Treino Focado Question ────────────────────────────
function renderTreinoFocado(){
  if(!state.chord) return `<div style="color:#666;text-align:center;padding:2rem">${t('loading')}</div>`;
  const acc=state.focusedSessionTotal>0?Math.round(state.focusedSessionCorrect/state.focusedSessionTotal*100):0;
  const color=getFocusedColor(state.focusedStreak);
  const streakColor=state.focusedStreak>=3?`color:${color};text-shadow:0 0 14px ${color}99`:'';
  const streakSize=state.focusedStreak>=10?'font-size:2.2rem':state.focusedStreak>=5?'font-size:2rem':'font-size:1.7rem';
  const answered=state.phase==='treino_focado_answered';
  const activeLabels=state.fretboardExercise
    ?[t('chord_building')]
    :Object.entries(state.focusedSwitches).filter(([,v])=>v).map(([k])=>getFocusedSwitchLabel(k));

  let choicesHtml;
  if(state.isFretboard){
    choicesHtml=`
      <div class="fb-action-row">
        ${answered
          ? `<button class="fb-confirm-btn" style="background:linear-gradient(180deg,#1a2a1a,#0e1a0e);border-color:#4ade80;color:#4ade80" onclick="playClickSfx('soft');nextFocusedFretboardQ()">${t('next_fretboard')} <img src="assets/seta-direita.png" style="width:18px;height:18px;vertical-align:middle;flex-shrink:0"></button>`
          : `<button id="fb-confirm-btn" class="fb-confirm-btn" onclick="doFocusedFretboardConfirm()" ${Object.keys(state.fbSel).length===0?'disabled':''}>✓ ${t('confirm')}</button>
             <button class="fb-ghost-btn" onclick="playClickSfx('soft');playFbSelChord()" ${Object.keys(state.fbSel).length===0?'disabled':''}>  ${t('hear_build')}</button>`
        }
      </div>
      ${answered?`<div style="text-align:center;font-size:1.5rem;font-weight:900;color:#F5A623;margin-top:.35rem;letter-spacing:-.01em">${(state.lang!=='pt'&&state.chord.cifraEn)?state.chord.cifraEn:state.chord.cifra}</div>`:''}`;
  } else if(state.isQuality){
    const pair=state.qualityPair||{opts:['maior','menor'],labels:['Maior','Menor']};
    choicesHtml=`<div style="display:flex;gap:1rem;justify-content:center;">` +
      pair.opts.map((q,i)=>{
        let cls='choice';
        if(answered){
          cls+=' locked';
          if(q===state.qualityAnswer) cls+=' correct';
          else if(q===state.qualitySelected) cls+=' wrong';
          else cls+=' dim';
        }
        return `<button class="${cls}" style="flex:1;max-width:200px;height:4.5rem" onclick="handleFocusedQualityAnswer('${q}',this)">
          <span style="font-size:1.4rem;font-weight:900;letter-spacing:-.02em;line-height:1.2;display:block">${_translateQualityLabel(q,pair.labels[i])}</span>
        </button>`;
      }).join('') + `</div>`;
  } else {
    choicesHtml=`<div class="choices">` + state.choices.map(ch=>{
      let cls='choice';
      if(answered){
        cls+=' locked';
        if(ch.id===state.chord.id) cls+=' correct';
        else if(ch.id===state.selected) cls+=' wrong';
        else cls+=' dim';
      }
      return `<button class="${cls}" style="height:4rem" onclick="handleFocusedAnswer(${ch.id},this)">
        <span style="font-size:1.5rem;font-weight:900;letter-spacing:-.02em;line-height:1;display:block">${(state.lang!=='pt'&&ch.cifraEn)?ch.cifraEn:ch.cifra}</span>
      </button>`;
    }).join('') + `</div>`;
  }

  const lIdx=getLvlIdx(state.xp),lvl=LEVELS[lIdx];
  const lvlStart=getLvlStartXP(lIdx);
  const dispXP=state.xpDisplay;
  const dispLvlIdx=getLvlIdx(dispXP);
  const dispLvlStart=getLvlStartXP(dispLvlIdx);
  const dispLvl=LEVELS[dispLvlIdx];
  const prog=Math.min((dispXP-dispLvlStart)/dispLvl.xpToNext,1)*100;

  return `
    <div style="width:100%;max-width:520px;display:flex;align-items:center;margin-bottom:.75rem;gap:.75rem">
      <button class="back-btn" onclick="playClickSfx('back');if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}state.phase='treino_focado_menu';render()">${t('back_btn')}</button>
    </div>
    <div class="lvl-bar">
      <div class="lvl-row">
        <span class="lvl-name">${t('level')} ${lvl.n}</span>
        <span class="lvl-xp" id="xp-label">${dispXP-dispLvlStart} / ${dispLvl.xpToNext} XP</span>
      </div>
      <div class="xp-track"><div class="xp-fill" id="xp-fill" style="width:${prog}%"></div></div>
    </div>
    <div class="tf-active-tags">${activeLabels.map(l=>`<span class="tf-tag">${l}</span>`).join('')}</div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-val orange ${answered&&state.result?.ok?'anim':''}">${state.focusedSessionScore}</div>
        <div class="stat-lbl">${t('points')}</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="${streakColor};${streakSize}">${state.focusedStreak}</div>
        <div class="stat-lbl" style="${state.focusedStreak>=1?'color:'+color+';font-weight:800':''}">${t('combo')}</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${acc}%</div>
        <div class="stat-lbl">${t('correct_answers')}</div>
      </div>
    </div>
    <div class="play-area" style="${state.isFretboard?'padding-bottom:.4rem;':''}" ${answered&&!state.isFretboard?'onclick="if(state.phase===\'treino_focado_answered\'){if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}genFocusedQ();state.phase=\'treino_focado_question\';render();playChord(state.chord);}"':''}>
      <button class="play-btn ${state.playing?'playing':''}" onclick="playClickSfx('soft');playChord(state.chord)">
        ${state.playing?t('listening'):t('listen_chord')}
      </button>
      <div class="label-sm mt">${state.isFretboard?t('build_chord_fretboard'):state.isQuality?t('what_quality'):t('what_chord')}</div>
      ${choicesHtml}
    </div>
    ${!answered?buildQualityHintHtml():''}
    ${state.isFretboard?`<div class="fb-wrap" id="fb-wrap">${buildFbSVG()}</div>`:''}
  `;
}


// ── RENDER: Tela de Compra ────────────────────────────────────
