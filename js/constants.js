
const MOCK_RANKING = [
  {name:"GuitarHero92",xp:4820,lvl:6},
  {name:"MusicMind",   xp:3210,lvl:5},
  {name:"ChordMaster", xp:2780,lvl:5},
  {name:"NoteNinja",   xp:1950,lvl:4},
  {name:"StringSage",  xp:1420,lvl:4},
];

// ── Itens educacionais (mundo real) ──────────────────────────
const LOJA_ITEMS = [
  {id:1,img:'assets/tablatura.png',           icon:'🎵',nome:'Tablatura de Greensleeves',    desc:'Partitura completa + tab',         preco:160,  file:'https://drive.google.com/uc?export=download&id=1bMpZ5ob_uLHSLbFZtLcqDsofbTH2Ughq'},
  {id:2,img:'assets/tablatura.png',           icon:'🎵',nome:'Tablatura de Romance de Amor', desc:'Partitura completa + tab',         preco:160,  file:'https://drive.google.com/uc?export=download&id=1oLf88_0Lsr0bVrxGpfS_bePw-PlDABnm'},
  {id:3,img:'assets/tablatura.png',           icon:'🎵',nome:'Tablatura de Abismo de Rosas', desc:'Partitura completa + tab',         preco:160,  file:'https://drive.google.com/uc?export=download&id=1r63XQkGkRBYqBORO8GINUg4N0ak4msmD'},
  {id:5,img:'assets/cupom.png',               icon:'🏷️',nome:'CUPOM 20% off — Plano Vitalício',desc:'Desconto exclusivo KaiserPlay', preco:1600, cupom:'PERGAMINHOS'},
  {id:0,img:'assets/ebook.png', icon:'📖',nome:'EBOOK - A Arte Auditiva do Violão: Como Tirar Músicas de Ouvido', desc:'Como tirar músicas de ouvido', preco:22000,file:'https://drive.google.com/uc?export=download&id=1Od4y6XcnYXqPMSeZbM9fNVCpfJtiRdmQ'},
];

// ── Violões (itens do jogo) ───────────────────────────────────
const VIOLOES = [
  {id:'violao_basico',   img:'assets/violao_basico.png',   nome:'Violão Básico',      desc:'Violão padrão',           pct:0,    preco:0,     cor:'#888'},
  {id:'violao_bom',      img:'assets/violao_bom.png',      nome:'Violão Bom',         desc:'+10% de Pontos por acerto',   pct:0.10, preco:400,   cor:'#4ade80'},
  {id:'violao_luthier',  img:'assets/violao_luthier.png',  nome:'Violão de Luthier',  desc:'+25% de Pontos por acerto',   pct:0.25, preco:1200,  cor:'#60dcff'},
  {id:'violao_ouro',     img:'assets/violao_ouro.png',     nome:'Violão de Ouro',     desc:'+50% de Pontos por acerto',   pct:0.50, preco:3000,  cor:'#F5A623'},
  {id:'violao_diamante', img:'assets/violao_diamante.png', nome:'Violão de Diamante', desc:'+100% de Pontos por acerto',  pct:1.00, preco:13000, cor:'#b060ff', doubleDiamonds:true},
];

// ── Cordas (itens do jogo) ────────────────────────────────────


const SAMPLE_NOTES = [40, 41, 43, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 59, 60, 62, 64, 65, 66, 67, 68, 69, 71, 73, 76];

// ── Fretboard constants ───────────────────────────────────────
const FB_OPEN=[40,45,50,55,59,64];
const FB_SNAMES=['E','A','D','G','B','e'];
const FB_NNAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FB_SVG_W=242,FB_NUT_Y=99,FB_HEAD_Y=51,FB_CW_NUT=39;
const FB_CW_BOT=FB_CW_NUT*1.10;
const FB_PLAY_H=Math.round(2*FB_CW_NUT/(2*(1-Math.pow(2,-1/12))));
const FB_CENTER=Math.round(FB_SVG_W/2);
const FB_NUT_X=[],FB_BOT_X=[];
for(let _s=0;_s<6;_s++){
  FB_NUT_X.push(Math.round(FB_CENTER-5*FB_CW_NUT/2+_s*FB_CW_NUT));
  FB_BOT_X.push(Math.round(FB_CENTER-5*FB_CW_BOT/2+_s*FB_CW_BOT));
}
function fbStrX(s,t){return FB_NUT_X[s]+(FB_BOT_X[s]-FB_NUT_X[s])*t;}
const FB_FRET_Y=[0];
for(let _fi=1;_fi<=12;_fi++) FB_FRET_Y.push(Math.round(2*FB_PLAY_H*(1-Math.pow(2,-_fi/12))));
const FB_SVG_H=FB_NUT_Y+FB_PLAY_H+24;
const FB_COL_EDGES=[0];
for(let _ci=0;_ci<5;_ci++) FB_COL_EDGES.push(Math.round((FB_NUT_X[_ci]+FB_NUT_X[_ci+1])/2));
FB_COL_EDGES.push(FB_SVG_W);

function fbNoteClass(s,f){return(FB_OPEN[s]+f)%12;}
function fbValidate(){
  const keys=Object.keys(state.fbSel);
  if(keys.length!==state.chord.midi.length)return false;
  const got=keys.map(k=>{const p=k.split('-').map(Number);return fbNoteClass(p[0],p[1]);}).sort((a,b)=>a-b);
  const exp=state.chord.midi.map(m=>m%12).sort((a,b)=>a-b);
  for(let i=0;i<exp.length;i++){if(got[i]!==exp[i])return false;}
  return true;
}
function buildFbSVG(){
  let o='';
  const ST=[2.2,1.8,1.4,1.1,0.9,0.7];
  const hL=FB_NUT_X[0]-20,hR=FB_NUT_X[5]+20;
  o+=`<svg width="${FB_SVG_W}" height="${FB_SVG_H}" viewBox="0 0 ${FB_SVG_W} ${FB_SVG_H}" xmlns="http://www.w3.org/2000/svg" style="display:block">`;
  o+=`<rect width="${FB_SVG_W}" height="${FB_SVG_H}" fill="#111"/>`;
  o+=`<line x1="${FB_NUT_X[0]}" y1="${FB_NUT_Y}" x2="${hL}" y2="${FB_HEAD_Y}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[5]}" y1="${FB_NUT_Y}" x2="${hR}" y2="${FB_HEAD_Y}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  o+=`<line x1="${hL}" y1="${FB_HEAD_Y}" x2="${hR}" y2="${FB_HEAD_Y}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  for(let sn=0;sn<6;sn++) o+=`<text x="${FB_NUT_X[sn]}" y="${FB_HEAD_Y-9}" text-anchor="middle" dominant-baseline="alphabetic" fill="#ccc" font-size="17" font-weight="700" font-family="Poppins,sans-serif">${FB_SNAMES[sn]}</text>`;
  for(let sh=0;sh<6;sh++) o+=`<line x1="${FB_NUT_X[sh]}" y1="${FB_HEAD_Y}" x2="${FB_NUT_X[sh]}" y2="${FB_NUT_Y}" stroke="#fff" stroke-width="${ST[sh]}" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[0]}" y1="${FB_NUT_Y}" x2="${FB_NUT_X[5]}" y2="${FB_NUT_Y}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[0]}" y1="${FB_NUT_Y}" x2="${FB_BOT_X[0]}" y2="${FB_NUT_Y+FB_PLAY_H}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  o+=`<line x1="${FB_NUT_X[5]}" y1="${FB_NUT_Y}" x2="${FB_BOT_X[5]}" y2="${FB_NUT_Y+FB_PLAY_H}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  for(let ss=1;ss<=4;ss++) o+=`<line x1="${FB_NUT_X[ss]}" y1="${FB_NUT_Y}" x2="${FB_BOT_X[ss]}" y2="${FB_NUT_Y+FB_PLAY_H}" stroke="#fff" stroke-width="${ST[ss]}" stroke-linecap="round"/>`;
  for(let fw=1;fw<=12;fw++){
    const wy=FB_NUT_Y+FB_FRET_Y[fw],tn=FB_FRET_Y[fw]/FB_PLAY_H;
    const wxL=Math.round(fbStrX(0,tn)),wxR=Math.round(fbStrX(5,tn));
    o+=`<line x1="${wxL}" y1="${wy}" x2="${wxR}" y2="${wy}" stroke="#fff" stroke-width="${fw===12?2.5:1.5}" stroke-linecap="round"/>`;
  }
  // Pontos de marcação nas casas 5 e 7
  [5,7].forEach(fn=>{
    const fmid=(FB_FRET_Y[fn-1]+FB_FRET_Y[fn])/2,fmy=Math.round(FB_NUT_Y+fmid);
    const t=fmid/FB_PLAY_H;
    const cx=Math.round((fbStrX(2,t)+fbStrX(3,t))/2);
    o+=`<circle cx="${cx}" cy="${fmy}" r="5" fill="#333" stroke="#555" stroke-width="1"/>`;
  });
  // Números das casas (text-anchor end para não cortar 10/11/12)
  for(let fl=1;fl<=12;fl++){
    const fmid=(FB_FRET_Y[fl-1]+FB_FRET_Y[fl])/2,fmy=Math.round(FB_NUT_Y+fmid);
    const flx=Math.round(fbStrX(0,fmid/FB_PLAY_H))-4;
    o+=`<text x="${flx}" y="${fmy+4}" text-anchor="end" fill="#444" font-size="11" font-family="Poppins,sans-serif">${fl}</text>`;
  }
  // Bolinhas selecionadas
  const isAnswered=state.phase==='answered'||state.phase==='treino_focado_answered';
  const isWrong=isAnswered&&state.result?.ok===false;
  // posições corretas do voicing como Set de chaves "corda-casa"
  const correctPos=isAnswered?new Set(getChordPositions(state.chord).map(({s,f})=>`${s}-${f}`)):null;
  Object.keys(state.fbSel).forEach(k=>{
    const pts=k.split('-').map(Number),sc=pts[0],fc=pts[1];
    const nc=fbNoteClass(sc,fc);
    // verde se acertou a posição exata; se acerto geral (result.ok), tudo verde
    const inChord=isAnswered&&(!isWrong||correctPos.has(k));
    let cx2,cy2,fspace;
    if(fc===0){cx2=FB_NUT_X[sc];cy2=Math.round((FB_HEAD_Y+FB_NUT_Y)/2);fspace=FB_NUT_Y-FB_HEAD_Y;}
    else{const fmv=(FB_FRET_Y[fc-1]+FB_FRET_Y[fc])/2;cx2=Math.round(fbStrX(sc,fmv/FB_PLAY_H));cy2=Math.round(FB_NUT_Y+fmv);fspace=FB_FRET_Y[fc]-FB_FRET_Y[fc-1];}
    const r=Math.min(16,Math.floor(fspace*0.45)),fs=r>=14?'12':r>=11?'11':'10';
    let fill,tf,stroke;
    if(isAnswered){
      if(inChord){fill='#4caf50';stroke='#1a3d1a';}
      else{fill='#f44336';stroke='#3d1a1a';}
      tf='#fff';
    }else{fill='#60dcff';tf='#111';stroke='#0a2030';}
    o+=`<circle cx="${cx2}" cy="${cy2}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    o+=`<text x="${cx2}" y="${cy2+4}" text-anchor="middle" fill="${tf}" font-size="${fs}" font-weight="800" font-family="Poppins,sans-serif">${FB_NNAMES[nc]}</text>`;
  });
  // Posições corretas que o usuário não colocou → laranja
  if(isWrong){
    getChordPositions(state.chord).forEach(({s,f})=>{
      const nc=fbNoteClass(s,f);
      if(state.fbSel[`${s}-${f}`])return; // usuário já colocou aqui (mostrado como verde)
      let cx3,cy3,fspace;
      if(f===0){cx3=FB_NUT_X[s];cy3=Math.round((FB_HEAD_Y+FB_NUT_Y)/2);fspace=FB_NUT_Y-FB_HEAD_Y;}
      else{const fmv=(FB_FRET_Y[f-1]+FB_FRET_Y[f])/2;cx3=Math.round(fbStrX(s,fmv/FB_PLAY_H));cy3=Math.round(FB_NUT_Y+fmv);fspace=FB_FRET_Y[f]-FB_FRET_Y[f-1];}
      const r=Math.min(16,Math.floor(fspace*0.45))+2,fs=r>=14?'12':r>=11?'11':'10';
      o+=`<circle cx="${cx3}" cy="${cy3}" r="${r}" fill="#F5A623" stroke="#7a4a00" stroke-width="2"/>`;
      o+=`<text x="${cx3}" y="${cy3+4}" text-anchor="middle" fill="#111" font-size="${fs}" font-weight="800" font-family="Poppins,sans-serif">${FB_NNAMES[nc]}</text>`;
    });
  }
  // Células clicáveis
  for(let cs0=0;cs0<6;cs0++) o+=`<rect x="${FB_COL_EDGES[cs0]}" y="${FB_HEAD_Y}" width="${FB_COL_EDGES[cs0+1]-FB_COL_EDGES[cs0]}" height="${FB_NUT_Y-FB_HEAD_Y}" fill="transparent" class="fb-fc" data-fbk="${cs0}-0"/>`;
  for(let cs=0;cs<6;cs++){
    for(let cf=1;cf<=12;cf++){
      const ry=FB_NUT_Y+FB_FRET_Y[cf-1],rh=FB_FRET_Y[cf]-FB_FRET_Y[cf-1];
      o+=`<rect x="${FB_COL_EDGES[cs]}" y="${ry}" width="${FB_COL_EDGES[cs+1]-FB_COL_EDGES[cs]}" height="${rh}" fill="transparent" class="fb-fc" data-fbk="${cs}-${cf}"/>`;
    }
  }
  o+='</svg>';
  return o;
}
