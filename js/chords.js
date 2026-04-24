// ── 1. CONSTANTES E BANCO DE ACORDES ──────────────────
// ── Acordes principais (progressão por nível) ──
const CHORDS = [
  // MAIORES (0–6)
  {id:0,  name:"C", cifra:"C",  midi:[48,52,55,60,64], quality:'maior'},
  {id:1,  name:"D", cifra:"D",  midi:[50,57,62,66], quality:'maior'},
  {id:2,  name:"E", cifra:"E",  midi:[40,47,52,56,59,64], quality:'maior'},
  {id:3,  name:"F", cifra:"F",  midi:[41,48,53,57,60,65], quality:'maior'},
  {id:4,  name:"G", cifra:"G",  midi:[43,47,50,55,59,67], quality:'maior'},
  {id:5,  name:"A", cifra:"A",  midi:[45,52,57,61,64], quality:'maior'},
  {id:6,  name:"B", cifra:"B",  midi:[47,54,59,63,66], quality:'maior'},
  // MENORES (7–13)
  {id:7,  name:"Cm", cifra:"Cm", midi:[48,55,60,63,67], quality:'menor'},
  {id:8,  name:"Dm", cifra:"Dm", midi:[50,57,62,65], quality:'menor'},
  {id:9,  name:"Em", cifra:"Em", midi:[40,47,52,55,59,64], quality:'menor'},
  {id:10, name:"Fm", cifra:"Fm", midi:[41,48,53,56,60,65], quality:'menor'},
  {id:11, name:"Gm", cifra:"Gm", midi:[43,50,55,58,62,67], quality:'menor'},
  {id:12, name:"Am", cifra:"Am", midi:[45,52,57,60,64], quality:'menor'},
  {id:13, name:"Bm", cifra:"Bm", midi:[47,54,59,62,66], quality:'menor'},
  // DOMINANTES 7ª (14–20)
  {id:14, name:"C7", cifra:"C7", midi:[48,52,58,60,64]},
  {id:15, name:"D7", cifra:"D7", midi:[50,57,60,66]},
  {id:16, name:"E7", cifra:"E7", midi:[40,47,52,56,62,64]},
  {id:17, name:"F7", cifra:"F7", midi:[41,48,51,57,60,65]},
  {id:18, name:"G7", cifra:"G7", midi:[43,47,50,55,59,65]},
  {id:19, name:"A7", cifra:"A7", midi:[45,52,55,61]},
  {id:20, name:"B7", cifra:"B7", midi:[47,51,57,59,66]},
  // 7ª MAIOR (21–26)
  {id:21, name:"C7M", cifra:"C7M", cifraEn:"Cmaj7", midi:[48,52,55,59,64]},
  {id:22, name:"D7M", cifra:"D7M", cifraEn:"Dmaj7", midi:[50,57,61,66]},
  {id:23, name:"E7M", cifra:"E7M", cifraEn:"Emaj7", midi:[40,47,51,56,59,64]},
  {id:24, name:"F7M", cifra:"F7M", cifraEn:"Fmaj7", midi:[41,57,60,64]},
  {id:25, name:"G7M", cifra:"G7M", cifraEn:"Gmaj7", midi:[43,54,59,62]},
  {id:26, name:"B7M", cifra:"B7M", cifraEn:"Bmaj7", midi:[47,54,58,63,66]},
  // MENOR 7ª (27–32)
  {id:27, name:"Cm7", cifra:"Cm7",midi:[48,55,58,63,67]},
  {id:28, name:"Dm7", cifra:"Dm7",midi:[50,57,60,65]},
  {id:29, name:"Em7", cifra:"Em7",midi:[40,47,52,55,62,64]},
  {id:30, name:"Gm7", cifra:"Gm7",midi:[43,53,58,62]},
  {id:31, name:"Am7", cifra:"Am7",midi:[45,52,55,60]},
  {id:32, name:"C#m7", cifra:"C#m7",midi:[49,56,59,64,68]},
  {id:43, name:"Bm7",   cifra:"Bm7",  midi:[47,54,57,62,66]},
  {id:52, name:"Fm7",   cifra:"Fm7",  midi:[41,48,51,56,60,65]},
  {id:44, name:"A7M",   cifra:"A7M",  cifraEn:"Amaj7", midi:[45,52,56,61,64]},
  {id:45, name:"C6",    cifra:"C6",   midi:[48,55,57,64]},
  // COM 6ª / SUS / INVERSÕES (33–38)
  {id:33, name:"D6", cifra:"D6",   midi:[50,57,59,66]},
  {id:34, name:"G6", cifra:"G6",   midi:[43,52,59,62]},
  {id:35, name:"Gm6", cifra:"Gm6",  midi:[43,52,58,62]},
  {id:37, name:"Csus4", cifra:"Csus4",midi:[48,53,55,60]},
  // NOVOS: 6ª
  {id:39, name:"E6",      cifra:"E6",      midi:[40,47,52,56,61,64]},
  // Voicings alternativos
  {id:56,  name:"Am",  cifra:"Am",  midi:[45,60,64,69],          quality:'menor'},
  {id:57,  name:"D",   cifra:"D",   midi:[50,66,69,74],          quality:'maior'},
  {id:58,  name:"Dm",  cifra:"Dm",  midi:[50,65,69,74],          quality:'menor'},
  {id:59,  name:"Cm",  cifra:"Cm",  midi:[48,55,60,63,67,72],    quality:'menor'},
  {id:60,  name:"F",   cifra:"F",   midi:[53,57,60,65,69],       quality:'maior'},
  {id:156, name:"F",   cifra:"F",   midi:[53,60,65,69,72],       quality:'maior'},
  {id:157, name:"G7M", cifra:"G7M", cifraEn:"Gmaj7", midi:[55,62,66,71,74]},
  {id:159, name:"C7",  cifra:"C7",  midi:[48,55,58,64,67,72]},
  // Novos acordes e voicings (2026-03)
  {id:161, name:"Em7", cifra:"Em7", midi:[52,59,62,67]},
  {id:162, name:"E6",  cifra:"E6",  midi:[52,59,61,68]},
  {id:163, name:"Ebm", cifra:"Ebm", midi:[51,58,63,66], quality:'menor'},
  {id:164, name:"A7",  cifra:"A7",  midi:[45,57,61,67]},
];

// ── Acordes Diamante (sempre avançados) ──
const CHORDS_DIAMOND = [
  {id:100, name:"C7M(9)", cifra:"C7M(9)", cifraEn:"Cmaj7(9)", midi:[48,52,59,62]},
  {id:101, name:"C7(9)", cifra:"C7(9)",    midi:[48,52,58,62]},
  {id:102, name:"C6(9)", cifra:"C6(9)",    midi:[48,52,57,62]},
  {id:103, name:"A(9)", cifra:"A9",     midi:[45,52,59,61]},
  {id:104, name:"E(9)", cifra:"E9",     midi:[40,47,54,56,59,64]},
  {id:105, name:"Em(9)", cifra:"Em9",    midi:[40,47,54,55,59,64]},
  {id:106, name:"Em7(9)", cifra:"Em7(9)",   midi:[40,47,52,55,62,66]},
  {id:107, name:"Am(9)", cifra:"Am9",    midi:[45,52,59,60]},
  {id:108, name:"B7(9)", cifra:"B7(9)",    midi:[47,51,57,61]},
  {id:109, name:"B7(#9)", cifra:"B7(#9)",   midi:[47,51,57,62]},
  {id:110, name:"B7(b9)", cifra:"B7(b9)",   midi:[47,51,57,60]},
  {id:111, name:"A7(b9)", cifra:"A7(b9)",   midi:[45,55,58,61]},
  {id:113, name:"E7(9)", cifra:"E7(9)",    midi:[40,56,62,66]},
  {id:114, name:"D6", cifra:"D6",       midi:[50,57,59,66]},
  {id:115, name:"D7/F#", cifra:"D7/F#",   midi:[42,50,57,60]},
  {id:116, name:"F#7(#11)", cifra:"F#7(#11)", midi:[42,52,58,60]},
  {id:117, name:"G7(13)", cifra:"G7(13)",   midi:[43,53,59,64]},
  {id:118, name:"G7(#5)", cifra:"G7(#5)",   midi:[43,53,59,63]},
  {id:119, name:"B7(13)", cifra:"B7(13)",   midi:[47,57,63,68]},
  {id:120, name:"B7(#5)", cifra:"B7(#5)",   midi:[47,57,63,67]},
  {id:121, name:"Cdim", cifra:"Cdim",     midi:[48,54,57,63], quality:"diminuto"},
  {id:122, name:"Edim", cifra:"Edim",     midi:[55,58,61,64], quality:"diminuto"},
  {id:123, name:"Fdim", cifra:"Fdim",     midi:[41,50,56,59], quality:"diminuto"},
  {id:124, name:"G#dim", cifra:"G#dim",    midi:[44,53,59,62], quality:"diminuto"},
  {id:125, name:"Bm7(b5)",  cifra:"Bm7(b5)",  cifraEn:"Bm7b5",   midi:[47,53,57,62]},
  {id:126, name:"Em7(b5)",  cifra:"Em7(b5)",  cifraEn:"Em7b5",   midi:[52,58,62,67]},
  {id:127, name:"F#m7(b5)", cifra:"F#m7(b5)", cifraEn:"F#m7b5",  midi:[42,52,57,60]},
  {id:128, name:"Am7(b5)",  cifra:"Am7(b5)",  cifraEn:"Am7b5",   midi:[45,55,60,63]},
  // Extensões estáveis — nonas
  {id:130, name:"C9",      cifra:"C9",      midi:[48,52,55,62,64]},
  {id:131, name:"D9",      cifra:"D9",      midi:[50,57,64,66]},
  {id:132, name:"D7M(9)",  cifra:"D7M(9)",  cifraEn:"Dmaj7(9)", midi:[50,54,61,64]},
  {id:133, name:"D7(9)",   cifra:"D7(9)",   midi:[50,54,60,64]},
  {id:134, name:"Am7(9)",  cifra:"Am7(9)",  midi:[45,55,59,60,64]},
  {id:135, name:"A7M(9)",  cifra:"A7M(9)",  cifraEn:"Amaj7(9)", midi:[45,56,59,61,64]},
  {id:136, name:"G7(9)",   cifra:"G7(9)",   midi:[43,53,57,59]},
  {id:137, name:"G7M(9)",  cifra:"G7M(9)",  cifraEn:"Gmaj7(9)", midi:[43,54,57,59]},
  {id:138, name:"G7(b9)",  cifra:"G7(b9)",  midi:[43,53,56,59]},
  {id:139, name:"A7(9)",   cifra:"A7(9)",   midi:[45,55,59,61]},
  // Inversões
  {id:140, name:"A/G",     cifra:"A/G",     midi:[43,52,57,61]},
  {id:141, name:"A7/C#",   cifra:"A7/C#",   midi:[49,55,57,64]},
  {id:146, name:"Gm6/Bb",  cifra:"Gm6/Bb",  midi:[46,52,55,62]},
  {id:147, name:"Gm/Bb",   cifra:"Gm/Bb",   midi:[46,50,55,62]},
  {id:148, name:"G/B",     cifra:"G/B",     midi:[47,50,55,62]},
  // Aumentados
  {id:142, name:"A(#5)",   cifra:"A(#5)",   cifraEn:"Aaug",  midi:[45,53,57,61], quality:"aumentado"},
  {id:151, name:"Ab(#5)",  cifra:"Ab(#5)",  cifraEn:"Abaug", midi:[44,52,56,60], quality:"aumentado"},
  // Aumentados/Alterados
  {id:129, name:"E7(#5)", cifra:"E7(#5)", midi:[40,50,56,60]},
  // Dominantes c/ extensão
  {id:143, name:"E7(#9)",  cifra:"E7(#9)",  midi:[40,56,62,67]},
  // Diminutos
  {id:144, name:"Bdim",    cifra:"Bdim",    midi:[47,50,53], quality:"diminuto"},
  {id:150, name:"F#dim",   cifra:"F#dim",   midi:[42,48,51,57], quality:"diminuto"},
  // Meio-diminutos
  {id:145, name:"Gm7(b5)", cifra:"Gm7(b5)", cifraEn:"Gm7b5", midi:[55,61,65,70]},
  // Dissonantes (Xm7M)
  {id:46,  name:"Am7M",    cifra:"Am7M",    cifraEn:"AmMaj7", midi:[45,52,56,60,64]},
  {id:47,  name:"Bm7M",    cifra:"Bm7M",    cifraEn:"BmMaj7", midi:[47,54,58,62,66]},
  {id:48,  name:"Gm7M",    cifra:"Gm7M",    cifraEn:"GmMaj7", midi:[43,54,58,62]},
  {id:49,  name:"Dm7M",    cifra:"Dm7M",    cifraEn:"DmMaj7", midi:[50,57,61,65]},
  // Inversões já existentes
  {id:36, name:"D6/F#",   cifra:"D6/F#",   midi:[42,50,57,59]},
  {id:38, name:"E7/G#",   cifra:"E7/G#",   midi:[44,52,59,62]},
  // Aumentados e alterados
  {id:40, name:"C7M(#5)", cifra:"C7M(#5)", midi:[48,52,56,59], quality:"aumentado"},
  {id:41, name:"C(#5)",   cifra:"C(#5)",   cifraEn:"Caug", midi:[48,56,60,64], quality:'aumentado'},
  {id:42, name:"D(#5)",   cifra:"D(#5)",   cifraEn:"Daug", midi:[50,58,62,66], quality:'aumentado'},
  // Voicings alternativos
  {id:152, name:"F#dim",  cifra:"F#dim",   midi:[54,60,63,69], quality:"diminuto"},
  {id:153, name:"C7/E",   cifra:"C7/E",    midi:[52,58,60,62]},
  {id:154, name:"E7/G#",  cifra:"E7/G#",   midi:[56,62,64,71]},
  {id:155, name:"E7M",    cifra:"E7M",    cifraEn:"Emaj7",    midi:[52,56,59,63,68]},
  {id:158, name:"F7M(9)", cifra:"F7M(9)", cifraEn:"Fmaj7(9)", midi:[53,57,64,67]},
  {id:160, name:"Eb7(9)", cifra:"Eb7(9)", midi:[51,55,61,65]},
  // Inversões novas (2026-03)
  {id:166, name:"E/G#",   cifra:"E/G#",   midi:[44,52,59,64]},
  {id:167, name:"Em/G",   cifra:"Em/G",   midi:[43,52,59,64]},
  {id:168, name:"Dm/F",   cifra:"Dm/F",   midi:[41,50,57,62]},
  {id:169, name:"C7M/E",  cifra:"C7M/E",  cifraEn:"Cmaj7/E", midi:[43,52,59,60]},
  {id:170, name:"Am/G",   cifra:"Am/G",   midi:[43,52,57,60]},
  {id:171, name:"Am/E",   cifra:"Am/E",   midi:[40,48,52,57,60]},
  {id:172, name:"B/A",    cifra:"B/A",    midi:[45,54,59,63]},
  // Dominante novo
  {id:165, name:"Eb7",    cifra:"Eb7",    midi:[51,58,61,67]},
  // Extensões novas
  {id:173, name:"Cm7(9)", cifra:"Cm7(9)", midi:[48,51,58,62]},
  {id:174, name:"Dm7(9)", cifra:"Dm7(9)", midi:[50,53,60,64]},
  {id:175, name:"Em7(9)", cifra:"Em7(9)", midi:[52,55,62,66]},
  {id:176, name:"Am6",    cifra:"Am6",    midi:[45,54,60,64]},
  {id:177, name:"Bm6",    cifra:"Bm6",    midi:[47,56,62,66]},
  {id:178, name:"A7sus4", cifra:"A7sus4", midi:[45,52,55,62]},
  {id:179, name:"B7sus4", cifra:"B7sus4", midi:[47,54,57,64]},
  {id:180, name:"Em7(9)", cifra:"Em7(9)", midi:[40,47,54,55,62,64]},
  // Xm7M novos (2026-03)
  {id:181, name:"Em7M",  cifra:"Em7M",  cifraEn:"EmMaj7",  midi:[40,51,55,59]},
  {id:182, name:"Fm7M",  cifra:"Fm7M",  cifraEn:"FmMaj7",  midi:[41,52,56,60]},
  {id:183, name:"Abm7M",   cifra:"Abm7M",   cifraEn:"AbmMaj7",   midi:[44,55,59,63]},
  // Xm7M, Xm7M(9), X6(9) novos (2026-03)
  {id:184, name:"Cm7M",    cifra:"Cm7M",    cifraEn:"CmMaj7",    midi:[48,55,59,63,67]},
  {id:185, name:"Cm7M(9)", cifra:"Cm7M(9)", cifraEn:"CmMaj7(9)", midi:[48,51,59,62]},
  {id:186, name:"Dm7M(9)", cifra:"Dm7M(9)", cifraEn:"DmMaj7(9)", midi:[50,53,61,64]},
  {id:187, name:"Am7(9)",  cifra:"Am7(9)",  midi:[57,60,67,71]},
  {id:188, name:"Cm7(9)",  cifra:"Cm7(9)",  midi:[60,63,70,74]},
  {id:189, name:"Am7M(9)", cifra:"Am7M(9)", cifraEn:"AmMaj7(9)", midi:[57,60,68,71]},
  {id:190, name:"Am6(9)",  cifra:"Am6(9)",  midi:[57,60,66,71]},
  {id:191, name:"Em6(9)",  cifra:"Em6(9)",  midi:[52,55,61,66]},
];

function _titleKeyForLvl(n){
  if(n<=10)return'lvl_aprendiz';
  if(n<=20)return'lvl_bardo';
  if(n<=30)return'lvl_alquimista';
  if(n<=40)return'lvl_estudante';
  if(n<=50)return'lvl_barbaro';
  if(n<=60)return'lvl_guardiao';
  if(n<=70)return'lvl_mago';
  if(n<=80)return'lvl_arcanista';
  if(n<=90)return'lvl_virtuose';
  if(n<=99)return'lvl_lenda';
  return'lvl_mestre';
}
// PT title used for image filename lookup (always Portuguese)
function _titleForLvl(n){
  if(n<=10)return"Escudeiro";
  if(n<=20)return"Estudante";
  if(n<=30)return"Bardo";
  if(n<=40)return"Virtuose";
  if(n<=50)return"Alquimista Harmônico";
  if(n<=60)return"Bárbaro Dissonante";
  if(n<=70)return"Guardião da Harmonia";
  if(n<=80)return"Mago do Som";
  if(n<=90)return"Arcanista das Cordas";
  if(n<=99)return"Lenda da Música";
  return"Mestre Supremo";
}
function _poolForLvl(n){
  // Todos os valores são IDs (não índices de array):
  // Tríades maiores: 0-6         (C D E F G A B)
  // Tríades menores: 7-13, 163   (Cm Dm Em Fm Gm Am Bm Ebm)
  // Dom7:           14-20        (C7 D7 E7 F7 G7 A7 B7)
  // 7M:             21-26, 44    (C7M D7M E7M F7M G7M B7M A7M)
  // m7:             27-32,43,52  (Cm7 Dm7 Em7 Gm7 Am7 C#m7 Bm7 Fm7)
  // Sextas/Sus:     33,34,35,37,39,45,162 (D6 G6 Gm6 Csus4 E6 C6 E6alt)
  // Voicings maiores: 57(D) 60(F) 156(F)
  // Voicings menores: 56(Am) 58(Dm) 59(Cm)
  // Voicings dom7:   159(C7) 164(A7)
  // Voicings 7M:     157(G7M)
  // Voicings m7:     161(Em7)

  const MAIORES  = [0,1,2,3,4,5,6];
  const MENORES  = [7,8,9,10,11,12,13,163];    // + Ebm
  const DOM7     = [14,15,16,17,18,19,20];
  const SET7M    = [21,22,23,24,25,26,44];     // + A7M
  const MENOR7   = [27,28,29,30,31,32,43,52];  // + Bm7, Fm7
  const EXTRAS   = [33,34,35,37,39,45,162];    // D6 G6 Gm6 Csus4 E6 C6 + E6 voicing
  const VOICE_M  = [57,60,156];                // voicings maiores
  const VOICE_m  = [56,58,59];                 // voicings menores
  const VOICE_D7 = [159,164];                  // voicings dom7
  const VOICE_7M = [157];                      // voicing 7M
  const VOICE_m7 = [161];                      // voicing m7

  if(n===1) return [5,0,3,4];                          // A C F G
  if(n===2) return [5,0,3,4,2];                        // + E
  if(n===3) return [5,0,3,4,2,1];                      // + D
  if(n===4) return MAIORES;                            // todos maiores
  if(n===5) return [...MAIORES,8,12];                  // + Dm Am
  if(n<=7)  return MENORES;                            // só menores
  if(n<=10) return [...MAIORES,...MENORES];             // maiores + menores (sem voicings)
  if(n===11)return DOM7;                               // só dominantes
  if(n<=16) return [...MAIORES,...MENORES,...DOM7];
  if(n===17)return SET7M;                              // só tétrades maiores
  if(n<=19) return [...MAIORES,...MENORES,...DOM7,...SET7M];
  if(n<=21) return [...MAIORES,...MENORES,...DOM7,...SET7M,...VOICE_M,...VOICE_m,...VOICE_D7,...VOICE_7M]; // voicings entram no nível 20
  if(n===22)return [...MENORES,...MENOR7,...VOICE_m,...VOICE_m7]; // menores tríade + m7 + voicings
  if(n<=26) return [...MAIORES,...MENORES,...DOM7,...SET7M,...MENOR7,...EXTRAS,...VOICE_M,...VOICE_m,...VOICE_D7,...VOICE_7M,...VOICE_m7];
  return 'ALL';                                         // todos CHORDS + CHORDS_DIAMOND
}
function _poolForCordas(n){
  const MAIORES =[0,1,2,3,4,5,6];
  const MENORES =[7,8,9,10,11,12,13,163];
  const DOM7    =[14,15,16,17,18,19,20];
  const SET7M   =[21,22,23,24,25,26,44];
  const MENOR7  =[27,28,29,30,31,32,43,52];
  const EXTRAS  =[33,34,35,37,39,45,162];
  const VOICE_M =[57,60,156];
  const VOICE_m =[56,58,59];
  const VOICE_D7=[159,164];
  const VOICE_7M=[157];
  const VOICE_m7=[161];
  if(n<=10) return [...MAIORES,...MENORES,...DOM7];
  if(n<=19) return [...MAIORES,...MENORES,...DOM7,...SET7M,...MENOR7,...EXTRAS];
  if(n<=29) return [...MAIORES,...MENORES,...DOM7,...SET7M,...MENOR7,...EXTRAS,...VOICE_M,...VOICE_m,...VOICE_D7,...VOICE_7M,...VOICE_m7];
  return 'ALL';
}
// XP por nível n = 6 acertos × 10 XP × n = 60n
const LEVELS = Array.from({length:100},(_,i)=>{
  const n=i+1;
  return{n,title:_titleForLvl(n),titleKey:_titleKeyForLvl(n),xpToNext:n===100?999999:n===99?400*99*3:n>=50?Math.round(400*n*(1+(n-50)*0.08)):400*n,pool:_poolForLvl(n)};
});

// Returns the translated title for a level object
function lvlTitle(lvl){ return t(lvl.titleKey)||lvl.title; }

// Translated guitar and item names
function guitarName(v){ const k='guitar_'+v.id.replace('violao_','')+'_name'; const r=t(k); return (r&&r!==k)?r:v.nome; }
function guitarDesc(v){ if(v.pct>0)return`+${Math.round(v.pct*100)}% ${t('points')} ${state.lang==='en'?'per correct answer':state.lang==='es'?'por acierto':'por acerto'}`; return state.lang==='en'?'Standard guitar':state.lang==='es'?'Guitarra estándar':'Violão padrão'; }
const _ITEM_KEYS={0:'arte_auditiva',1:'tab_greensleeves',2:'tab_romance',3:'tab_abismo',5:'cupom'};
function itemName(item){ const slug=_ITEM_KEYS[item.id]; if(!slug)return item.nome; const k='item_'+slug+'_name'; const r=t(k); return (r&&r!==k)?r:item.nome; }
function itemDesc(item){ const slug=_ITEM_KEYS[item.id]; if(!slug)return item.desc; const k='item_'+slug+'_desc'; const r=t(k); return (r&&r!==k)?r:item.desc; }
