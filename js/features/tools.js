function renderMetronomo(){
  return `
    <div class="back-row">
      <button class="back-btn" onclick="playClickSfx('back');_metroStop();state.phase='start';render()">${t('back_btn')}</button>
      <div style="flex:1;min-width:0;overflow:hidden">
        <span style="font-size:1rem;font-weight:900;color:#F5A623;letter-spacing:.01em;white-space:nowrap">${t('metronome')}</span>
      </div>
    </div>
    <div class="metro-wrap">
      <div id="_metro-dot" class="metro-beat"></div>
      <div>
        <div class="metro-bpm-display" id="_metro-bpm-val">${_metro.bpm}</div>
        <div class="metro-bpm-label">BPM</div>
      </div>
      <div style="width:100%;display:flex;align-items:center;gap:.75rem">
        <button class="metro-adj-btn" onclick="_metroAdj(-5)">−5</button>
        <input id="_metro-bpm-slider" type="range" min="40" max="200" value="${_metro.bpm}" class="metro-slider"
          oninput="_metroSetBpm(+this.value)">
        <button class="metro-adj-btn" onclick="_metroAdj(+5)">+5</button>
      </div>
      <div style="width:100%;display:flex;justify-content:center;gap:.75rem">
        <button class="metro-adj-btn" style="width:72px" onclick="_metroAdj(-1)">−1</button>
        <button class="metro-adj-btn" style="width:72px" onclick="_metroAdj(+1)">+1</button>
      </div>
      <button id="_metro-play-btn" class="metro-play-btn"
        style="background:linear-gradient(180deg,#ffbe4f,#F5A623);border:3px solid #111;box-shadow:5px 5px 0 #111;color:#111;text-shadow:none"
        onclick="_metroToggle()">${t('metro_start')}</button>
    </div>`;
}

// ── Afinador Engine ───────────────────────────────────────────
const _TUNER_NOTES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const _tuner={
  ctx:null,source:null,analyser:null,stream:null,
  running:false,animFrame:null,
  buffer:null,bufSize:8192,
  freq:null,noteName:null,octave:null,
  smoothCents:0,needleVel:0,targetCents:0,
  lastDetect:0,detectInterval:30,
  lastSignalTime:0,holdMs:600,
  selectedString:-1,
  tuning:['E2','A2','D3','G3','B3','E4'],
  guitarMode:false,
  noSignal:true,
  lastEnergy:0,
  a4:440,
  // Per-string tracking
  stringTuned:[false,false,false,false,false,false],
  stringInTuneStart:[0,0,0,0,0,0],
  inTuneMs:1200,
  allTunedShown:false,
  lastInTuneSfxStr:-1,
  // Median filter buffer — estabiliza leitura, elimina saltos
  centsBuf:[],centsBufSize:5,
  stableCents:0,
  // Perfect-tune text animation state
  perfectShownAt:0,
  // Confirmation bar (enche/esvazia progressivamente)
  inTuneBarPct:0,inTuneBarFull:false,lastBarUpdateTime:0,lastBarMidi:-1,
};

function _tunerNote2Midi(name){
  const m=name.match(/^([A-G][b#]?)(\d)$/);
  if(!m)return 48;
  const map={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
  return (parseInt(m[2])+1)*12+(map[m[1]]||0);
}
function _tunerMidi2Label(midi){
  return {note:_TUNER_NOTES[((midi%12)+12)%12],octave:Math.floor(midi/12)-1};
}
function _tunerFreq2Midi(freq){return 69+12*Math.log2(freq/_tuner.a4);}

// YIN pitch detection
function _tunerYIN(buf,sr){
  const N=buf.length,half=N>>1;
  // Noise gate
  let energy=0;
  for(let i=0;i<N;i++)energy+=buf[i]*buf[i];
  _tuner.lastEnergy=energy/N;
  if(_tuner.lastEnergy<0.0000005)return null;
  // Frequency range: 27Hz (sub-bass) to 1400Hz — cobre qualquer instrumento incluindo 7ª corda
  const tauMin=Math.max(2,Math.floor(sr/1400));
  const tauMax=Math.min(half-1,Math.floor(sr/27));
  // Step 1: Difference function d(tau)
  const d=new Float32Array(tauMax+1);
  for(let tau=1;tau<=tauMax;tau++){
    let s=0;
    for(let j=0;j<half;j++){const x=buf[j]-buf[j+tau];s+=x*x;}
    d[tau]=s;
  }
  // Step 2: Cumulative mean normalized difference d'(tau)
  const dn=new Float32Array(tauMax+1);
  dn[0]=1;
  let rs=0;
  for(let tau=1;tau<=tauMax;tau++){
    rs+=d[tau];
    dn[tau]=rs>0?(d[tau]*tau/rs):1;
  }
  // Step 3: First local minimum below threshold (0.15 is practical for guitar)
  const thr=0.20;
  let found=-1;
  for(let tau=tauMin;tau<tauMax-1;tau++){
    if(dn[tau]<thr&&dn[tau]<=dn[tau-1]&&dn[tau]<=dn[tau+1]){found=tau;break;}
  }
  if(found<0)return null;
  // Step 4: Parabolic interpolation (sub-sample precision)
  let bt=found;
  if(found>tauMin&&found<tauMax-1){
    const a=dn[found-1],b=dn[found],c=dn[found+1];
    const den=2*(2*b-a-c);
    if(Math.abs(den)>1e-10)bt=found+(c-a)/den;
  }
  const confidence=1-dn[found];
  if(confidence<0.3)return null;
  return {freq:sr/bt,confidence};
}

function _tunerProcess(result){
  const now=performance.now();
  if(!result){
    // String still vibrating but YIN can't lock — hold the last reading
    if(_tuner.lastEnergy>0.0000008){_tuner.lastSignalTime=now;return;}
    // Truly silent — countdown to go silent
    if(now-_tuner.lastSignalTime>_tuner.holdMs){
      _tuner.noSignal=true;_tuner.targetCents=0;_tuner.stableCents=0;
      _tuner.centsBuf=[];
      _tuner.stringInTuneStart=_tuner.stringInTuneStart.map(()=>0);
    }
    return;
  }
  _tuner.lastSignalTime=now;
  _tuner.noSignal=false;
  const rawMidi=_tunerFreq2Midi(result.freq);

  if(_tuner.guitarMode){
    // Auto-detect closest string (dentro de 2 semitons)
    let closest=-1,minDist=2.0;
    _tuner.tuning.forEach((n,i)=>{
      const d=Math.abs(rawMidi-_tunerNote2Midi(n));
      if(d<minDist){minDist=d;closest=i;}
    });
    if(closest>=0&&_tuner.selectedString!==closest){
      _tuner.selectedString=closest;
      _tuner.centsBuf=[];_tuner.targetCents=0;_tuner.stableCents=0;
      _tunerRefreshControls();
    }
  } else {
    _tuner.selectedString=-1;
  }

  const targetMidi=(_tuner.guitarMode&&_tuner.selectedString>=0)?_tunerNote2Midi(_tuner.tuning[_tuner.selectedString]):Math.round(rawMidi);
  _tuner.currentTargetMidi=targetMidi;
  const rawCents=Math.max(-50,Math.min(50,(rawMidi-targetMidi)*100));
  // Median filter: acumula últimas N leituras, usa mediana para eliminar outliers/spikes
  _tuner.centsBuf.push(rawCents);
  if(_tuner.centsBuf.length>_tuner.centsBufSize)_tuner.centsBuf.shift();
  const sorted=[..._tuner.centsBuf].sort((a,b)=>a-b);
  const median=sorted[Math.floor(sorted.length/2)];
  // Blend sempre suavizado — sem saltos diretos
  // Mudanças maiores entram mais rápido mas nunca de forma abrupta
  const dlt=Math.abs(median-_tuner.targetCents);
  const blend=dlt>20?0.55:dlt>8?0.35:0.18;
  _tuner.targetCents=_tuner.targetCents*(1-blend)+median*blend;
  _tuner.stableCents=_tuner.targetCents;
  const {note,octave}=_tunerMidi2Label(targetMidi);
  _tuner.noteName=note;_tuner.octave=octave;
}

function _tunerPlayInTuneSfx(){
  try{
    const ctx=getAudioCtx();
    if(ctx.state==='suspended')ctx.resume();
    const t=ctx.currentTime;
    // Dois tons ascendentes — sine limpo, mais audível
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.type='sine';
    o.frequency.setValueAtTime(1760,t);
    o.frequency.setValueAtTime(2093,t+0.09);
    g.gain.setValueAtTime(0.05,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.25);
    o.start(t);o.stop(t+0.25);
  }catch(e){}
}
function _tunerCheckAllTuned(){
  if(_tuner.allTunedShown)return;
  if(_tuner.stringTuned.every(v=>v)){
    _tuner.allTunedShown=true;
    const el=document.getElementById('_tn-complete');
    if(el){el.style.display='flex';el.style.animation='tunerComplete .5s ease';}
    // Fanfare
    try{
      const ctx=getAudioCtx();const t=ctx.currentTime;
      [[523,.05],[659,.15],[784,.25],[1047,.35]].forEach(([f,d])=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);
        o.type='sine';o.frequency.value=f;
        g.gain.setValueAtTime(0.22,t+d);g.gain.exponentialRampToValueAtTime(0.001,t+d+0.4);
        o.start(t+d);o.stop(t+d+0.4);
      });
    }catch(e){}
  }
}

function _tunerUpdateDOM(){
  const c=_tuner.smoothCents;
  const perfect=!_tuner.noSignal&&Math.abs(c)<2;
  const inTune=!_tuner.noSignal&&Math.abs(c)<5;
  const close=!_tuner.noSignal&&Math.abs(c)<15;
  const col=_tuner.noSignal?'#3a3a3a':perfect?'#60dcff':inTune?'#7cdd7c':close?'#F5A623':'#e05050';
  // ── Círculo: borda + glow ──
  const circ=document.getElementById('_tn-circle');
  if(circ){
    circ.style.borderColor=col;
    circ.style.boxShadow=_tuner.noSignal?'none':`0 0 18px ${col}44,0 0 36px ${col}1a,inset 0 0 20px ${col}0a`;
  }
  // ── Pulse rings: lentos no silêncio, reativos ao som ──
  const r1=document.getElementById('_tn-ring1'),r2=document.getElementById('_tn-ring2');
  if(r1&&r2){
    if(_tuner.noSignal){
      r1.style.color='#1a1a1a';r2.style.color='#1a1a1a';
      r1.style.animationDuration='5s';r2.style.animationDuration='5s';
      r2.style.animationDelay='2.2s';
    } else {
      r1.style.color=col;r2.style.color=col;
      const dur=inTune?'1.8s':close?'1.2s':'0.8s';
      r1.style.animationDuration=dur;r2.style.animationDuration=dur;
      r2.style.animationDelay=inTune?'0.7s':close?'0.5s':'0.35s';
    }
  }
  // ── Régua: agulha ──
  const rn=document.getElementById('_tn-ruler-needle');
  if(rn){
    rn.style.left=((c+50)).toFixed(1)+'%';
    rn.style.background=_tuner.noSignal?'#2a2a2a':col;
    rn.style.boxShadow=_tuner.noSignal?'none':`0 0 8px ${col},0 0 16px ${col}66`;
  }
  // ── Barra de confirmação (enche e esvazia progressivamente) ──
  const barInTune=!_tuner.noSignal&&Math.abs(c)<5;
  const barEl=document.getElementById('_tn-tune-bar');
  if(barEl){
    const nowBar=performance.now();
    const dt=_tuner.lastBarUpdateTime?Math.min(0.08,(nowBar-_tuner.lastBarUpdateTime)/1000):0;
    _tuner.lastBarUpdateTime=nowBar;
    // Reset se a nota detectada mudou
    const curMidi=_tuner.currentTargetMidi||_tuner.lastBarMidi;
    if(!_tuner.noSignal&&curMidi!==_tuner.lastBarMidi){
      _tuner.inTuneBarPct=0;_tuner.inTuneBarFull=false;
      _tuner.lastBarMidi=curMidi;
    }
    if(barInTune){
      _tuner.inTuneBarPct=Math.min(100,_tuner.inTuneBarPct+dt*100);
    } else {
      _tuner.inTuneBarPct=Math.max(0,_tuner.inTuneBarPct-dt*200);
      if(_tuner.inTuneBarPct<95)_tuner.inTuneBarFull=false;
    }
    const pct=_tuner.inTuneBarPct;
    if(pct>=100&&!_tuner.inTuneBarFull){
      _tuner.inTuneBarFull=true;
      _tunerPlayInTuneSfx();
      const perfTxt2=document.getElementById('_tn-perfect-txt');
      if(perfTxt2&&nowBar-_tuner.perfectShownAt>1500){
        _tuner.perfectShownAt=nowBar;
        perfTxt2.style.animation='none';
        void perfTxt2.offsetWidth;
        perfTxt2.style.animation='tunerPerfect 2s ease forwards';
      }
    }
    barEl.style.transition='background .3s';
    barEl.style.width=pct+'%';
    barEl.style.background=pct>=100
      ?'linear-gradient(90deg,#60dcff,#ffffff88,#60dcff)'
      :'linear-gradient(90deg,#1a5a7a,#60dcff)';
  }
  // ── Senoide idle (visível só sem sinal) ──
  const waveEl=document.getElementById('_tn-idle-wave');
  if(waveEl){waveEl.style.display=_tuner.noSignal?'block':'none';}
  // ── Nome da nota ──
  const notEl=document.getElementById('_tn-note');
  if(notEl){
    notEl.style.display=_tuner.noSignal?'none':'inline';
    notEl.textContent=_tuner.noSignal?'':(_tuner.noteName||'─');
    notEl.style.color=col;
  }
  // ── Oitava ──
  const octEl=document.getElementById('_tn-oct');
  if(octEl){
    octEl.textContent=_tuner.noSignal?'':(_tuner.octave!=null?'OCT '+_tuner.octave:'');
    octEl.style.color=_tuner.noSignal?'#2a2a2a':col+'aa';
  }
  // ── Cents / status ──
  const cEl=document.getElementById('_tn-cents');
  if(cEl){
    if(_tuner.noSignal){cEl.textContent=t('tuner_play');cEl.style.color='#60dcff';cEl.style.animation='tnPlayGlow 2s ease-in-out infinite';}
    else if(inTune){cEl.textContent=t('tuner_in_tune');cEl.style.color='#7cdd7c';cEl.style.animation='';}
    else{const cv=Math.round(Math.abs(c));cEl.textContent=(c<0?'♭ ':'♯ ')+cv+'¢';cEl.style.color=close?'#F5A623':'#e08080';cEl.style.animation='';}
  }
  // ── Barra de nível de entrada ──
  const lvl=document.getElementById('_tn-level-bar');
  if(lvl&&_tuner.running){
    const pct=Math.min(100,Math.sqrt((_tuner.lastEnergy||0))*800);
    lvl.style.width=pct+'%';
    lvl.style.background=pct>60?'#7cdd7c':pct>20?'#F5A623':'#555';
  }
}

function _tunerAnimLoop(){
  if(!_tuner.running)return;
  const now=performance.now();
  if(now-_tuner.lastDetect>_tuner.detectInterval){
    _tuner.lastDetect=now;
    if(_tuner.analyser&&_tuner.buffer){
      _tuner.analyser.getFloatTimeDomainData(_tuner.buffer);
      _tunerProcess(_tunerYIN(_tuner.buffer,_tuner.ctx.sampleRate));
    }
  }
  // Filtro exponencial adaptativo de primeira ordem — zero oscilação, matematicamente impossível
  // Longe do alvo: blend alto (resposta rápida) | Perto: blend baixo (estabilidade)
  const target=_tuner.noSignal?0:_tuner.targetCents;
  const gap=Math.abs(target-_tuner.smoothCents);
  const blend=_tuner.noSignal?0.06:gap>20?0.30:gap>5?0.18:0.09;
  _tuner.smoothCents=Math.max(-52,Math.min(52,_tuner.smoothCents*(1-blend)+target*blend));
  _tuner.needleVel=0;

  // Per-string in-tune tracking — só no modo violão
  if(_tuner.guitarMode){
    const _si=_tuner.selectedString;
    if(_si>=0&&!_tuner.noSignal){
      if(Math.abs(_tuner.smoothCents)<5){
        if(!_tuner.stringInTuneStart[_si])_tuner.stringInTuneStart[_si]=now;
        if(!_tuner.stringTuned[_si]&&now-_tuner.stringInTuneStart[_si]>_tuner.inTuneMs){
          _tuner.stringTuned[_si]=true;
          if(_tuner.lastInTuneSfxStr!==_si){_tuner.lastInTuneSfxStr=_si;_tunerPlayInTuneSfx();}
          _tunerRefreshControls();_tunerCheckAllTuned();
          // Flash verde no botão da corda afinada (pisca e volta ao normal)
          const _fe=document.getElementById('_tn-str-'+_si);
          if(_fe){_fe.style.animation='none';void _fe.offsetWidth;_fe.style.animation='tnStrFlash 1.5s ease forwards';}
        }
      } else {
        _tuner.stringInTuneStart[_si]=0;
        // Destravar automaticamente se a mesma corda for tocada bem desafinada (>25¢)
        if(_tuner.stringTuned[_si]&&Math.abs(_tuner.smoothCents)>25){
          _tuner.stringTuned[_si]=false;_tuner.allTunedShown=false;_tunerRefreshControls();
        }
      }
    } else if(_si>=0){_tuner.stringInTuneStart[_si]=0;}
  }
  _tunerUpdateDOM();
  // ── Senoide idle ──────────────────────────────────────────────
  if(_tuner.noSignal){
    const wc=document.getElementById('_tn-idle-wave');
    if(wc){
      const wx=wc.getContext('2d'),W=wc.width,H=wc.height,t2=performance.now()/1000;
      wx.clearRect(0,0,W,H);
      wx.beginPath();
      wx.strokeStyle='#60dcff';wx.lineWidth=1.6;wx.lineCap='round';
      for(let x=0;x<=W;x++){
        const y=H/2+7*Math.sin((x/W)*Math.PI*3+t2*1.26);
        x===0?wx.moveTo(x,y):wx.lineTo(x,y);
      }
      wx.stroke();
    }
  }
  _tuner.animFrame=requestAnimationFrame(_tunerAnimLoop);
}

async function _tunerStart(){
  if(_tuner.running)return;
  try{
    // Try with processing disabled for best pitch detection; fallback to plain audio
    let stream;
    try{
      stream=await navigator.mediaDevices.getUserMedia({
        audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false
      });
    }catch(e){
      stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    }
    _tuner.stream=stream;
    _tuner.ctx=new(window.AudioContext||window.webkitAudioContext)();
    // Some browsers start AudioContext suspended even on user gesture
    if(_tuner.ctx.state==='suspended')await _tuner.ctx.resume();
    _tuner.source=_tuner.ctx.createMediaStreamSource(stream);
    _tuner.analyser=_tuner.ctx.createAnalyser();
    _tuner.analyser.fftSize=_tuner.bufSize;
    _tuner.analyser.smoothingTimeConstant=0;
    _tuner.source.connect(_tuner.analyser);
    // Connect through muted gain to destination — required on some browsers for the graph to process
    const _mute=_tuner.ctx.createGain();_mute.gain.value=0;
    _tuner.analyser.connect(_mute);_mute.connect(_tuner.ctx.destination);
    _tuner.buffer=new Float32Array(_tuner.bufSize);
    _tuner.running=true;
    _tuner.lastDetect=0;_tuner.lastSignalTime=0;
    _tuner.smoothCents=0;_tuner.needleVel=0;
    _tuner.noSignal=true;
    _tunerAnimLoop();
  }catch(e){
    // Mic permission denied — show message in cents display
    const cEl=document.getElementById('_tn-cents');
    if(cEl){cEl.textContent=t('tuner_mic_error');cEl.style.color='#ff8888';}
  }
}
function _tunerStop(){
  _tuner.running=false;
  if(_tuner.animFrame){cancelAnimationFrame(_tuner.animFrame);_tuner.animFrame=null;}
  if(_tuner.stream){_tuner.stream.getTracks().forEach(tr=>tr.stop());_tuner.stream=null;}
  if(_tuner.ctx){_tuner.ctx.close().catch(()=>{});_tuner.ctx=null;}
  _tuner.source=null;_tuner.analyser=null;_tuner.noSignal=true;
  _tuner.selectedString=-1;
  _tuner.stringTuned=[false,false,false,false,false,false];
  _tuner.stringInTuneStart=[0,0,0,0,0,0];
  _tuner.allTunedShown=false;_tuner.lastInTuneSfxStr=-1;
  _tuner.inTuneBarPct=0;_tuner.inTuneBarFull=false;_tuner.lastBarUpdateTime=0;
  _tuner.guitarMode=false;
}
function _tunerSelectString(idx){
  playClickSfx('soft');
  if(_tuner.stringTuned[idx]){
    _tuner.stringTuned[idx]=false;
    _tuner.allTunedShown=false;
    _tuner.centsBuf=[];_tuner.targetCents=0;_tuner.stableCents=0;
  }
  _tuner.selectedString=(_tuner.selectedString===idx)?-1:idx;
  _tunerRefreshControls();
}
function _tunerSetAltTuning(val){
  playClickSfx('soft');
  _tuner.altTuning=val;
  _tunerRefreshControls();
}
function _tunerCustomNote(strIdx,delta){
  const midi=_tunerNote2Midi(_tuner.tuning[strIdx]);
  const nm=Math.max(28,Math.min(76,midi+delta));
  const {note,octave}=_tunerMidi2Label(nm);
  _tuner.tuning[strIdx]=note+octave;
  _tunerRefreshControls();
}
function _tunerBuildStrBtns(){
  return _tuner.tuning.map((noteStr,i)=>{
    const {note,octave}=_tunerMidi2Label(_tunerNote2Midi(noteStr));
    // High E (E4 or above) shows as lowercase 'e' — guitar convention
    const dispNote=(note==='E'&&octave>=4)?'e':note;
    const isAct=_tuner.selectedString===i;
    const bg=isAct?'linear-gradient(180deg,#ffbe4f,#F5A623)':'linear-gradient(180deg,#2a2a2a,#1a1a1a)';
    const border=isAct?'#F5A623':'#333';
    const color=isAct?'#111':'#ccc';
    const noteShadow=isAct?'':'text-shadow:0 1px 3px rgba(0,0,0,.8)';
    return `<div id="_tn-str-${i}" class="tuner-str-btn" style="background:${bg};color:${color};border-color:${border};box-shadow:2px 2px 0 #111">
      <span class="str-note-name" style="${noteShadow}">${dispNote}</span>
    </div>`;
  }).join('');
}
function _tunerRefreshControls(){
  const sr=document.getElementById('_tn-str-row');
  if(sr){
    sr.style.display=_tuner.guitarMode?'flex':'none';
    if(_tuner.guitarMode)sr.innerHTML=_tunerBuildStrBtns();
  }
  const ct=document.getElementById('_tn-complete');
  if(ct)ct.style.display=(_tuner.guitarMode&&_tuner.stringTuned.every(v=>v))?'flex':'none';
  const tp=document.getElementById('_tn-mode-toggle');
  if(tp){
    const btns=tp.querySelectorAll('button');
    if(btns.length>=2){
      function _ats(btn,active){
        btn.style.background=active?'#383838':'#0d0d0d';
        btn.style.color=active?'#fff':'#444';
        btn.style.textShadow=active?'0 1px 3px #000':'none';
        btn.style.boxShadow=active?'0 2px 0 #000':'inset 0 2px 3px rgba(0,0,0,.7)';
        btn.style.transform=active?'translateY(-1px)':'none';
      }
      _ats(btns[0],!_tuner.guitarMode);
      _ats(btns[1],_tuner.guitarMode);
    }
  }
}
function _tunerSetGuitarMode(val){
  playClickSfx('soft');
  _tuner.guitarMode=val;
  if(!val)_tuner.selectedString=-1;
  _tuner.centsBuf=[];_tuner.targetCents=0;_tuner.stableCents=0;
  _tuner.stringTuned=[false,false,false,false,false,false];
  _tuner.stringInTuneStart=[0,0,0,0,0,0];
  _tuner.allTunedShown=false;_tuner.lastInTuneSfxStr=-1;
  _tuner.inTuneBarPct=0;_tuner.inTuneBarFull=false;
  _tunerRefreshControls();
}

function renderAfinador(){
  if(!_tuner.running)setTimeout(_tunerStart,80);
  return `
    <div class="back-row">
      <button class="back-btn" onclick="playClickSfx('back');_tunerStop();state.phase='start';render()">${t('back_btn')}</button>
    </div>
    <div style="width:100%;max-width:520px;text-align:center;padding:.4rem 1rem 0">
      <div style="font-size:1.65rem;font-weight:700;font-family:var(--font-title);background:linear-gradient(135deg,#ffffff 20%,#60dcff 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-.01em;line-height:1.15">${t('tuner_title')}</div>
      <div style="font-size:.78rem;font-weight:600;color:#4a7a8a;font-family:var(--font-body);margin-top:.2rem;font-style:italic">${t('tuner_subtitle')}</div>
      <div style="width:3rem;height:2px;background:linear-gradient(90deg,transparent,#60dcff,transparent);margin:.3rem auto 0"></div>
    </div>
    <div class="tuner-wrap">

      <!-- Círculo com pulse rings -->
      <div class="tn-circle-outer">
        <div class="tn-pulse-ring tn-pulse-ring-1" id="_tn-ring1" style="color:#3a3a3a"></div>
        <div class="tn-pulse-ring tn-pulse-ring-2" id="_tn-ring2" style="color:#3a3a3a"></div>
        <div class="tn-circle" id="_tn-circle">
          <canvas id="_tn-idle-wave" width="120" height="30" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:.55;transition:opacity .5s"></canvas>
          <span id="_tn-note" class="tuner-note-name" style="color:#333;display:none"></span>
          <span id="_tn-oct" class="tn-circle-oct"></span>
        </div>
      </div>

      <!-- Cents / status -->
      <div id="_tn-cents" class="tuner-cents-display" style="color:#444">${t('tuner_play')}</div>


      <!-- Barra de confirmação + texto "Afinação Perfeita" -->
      <div style="width:100%;max-width:320px;display:flex;flex-direction:column;gap:.35rem;margin:.15rem 0">
        <div style="width:100%;height:5px;background:#0d0d0d;border-radius:99px;overflow:hidden;border:1px solid #141414">
          <div id="_tn-tune-bar" style="height:100%;width:0%;border-radius:99px"></div>
        </div>
        <div id="_tn-perfect-txt" style="font-size:1.05rem;font-weight:900;color:#60dcff;font-family:var(--font-title);letter-spacing:.06em;text-shadow:0 0 14px #60dcff,0 0 28px #60dcff88;opacity:0;pointer-events:none;min-height:1.4rem;text-align:center">${t('tuner_perfect')}</div>
      </div>

      <!-- Régua de precisão -->
      <div class="tn-ruler-wrap">
        <div class="tn-ruler-labels">
          <span class="tn-ruler-flat">♭</span>
          <span class="tn-ruler-sharp">♯</span>
        </div>
        <div class="tn-ruler-zone-outer">
          <div class="tn-ruler-bg">
            <div class="tn-rz tn-rz-rl"></div>
            <div class="tn-rz tn-rz-al"></div>
            <div class="tn-rz tn-rz-gl"></div>
            <div class="tn-rz tn-rz-gc"></div>
            <div class="tn-rz tn-rz-perfect"></div>
            <div class="tn-rz tn-rz-gr"></div>
            <div class="tn-rz tn-rz-ar"></div>
            <div class="tn-rz tn-rz-rr"></div>
          </div>
          <div class="tn-ruler-needle" id="_tn-ruler-needle"></div>
          <div class="tn-ruler-center-mark"></div>
        </div>
        <div class="tn-ruler-ticks">
          <div style="text-align:center"><div class="tn-rtick-maj"></div><div class="tn-rtick-lbl">−50</div></div>
          <div class="tn-rtick-min"></div>
          <div class="tn-rtick-min"></div>
          <div style="text-align:center"><div class="tn-rtick-maj"></div><div class="tn-rtick-lbl">−25</div></div>
          <div class="tn-rtick-min"></div>
          <div class="tn-rtick-min"></div>
          <div style="text-align:center"><div class="tn-rtick-maj" style="background:#2a4a2a"></div><div class="tn-rtick-lbl" style="color:#2a4a2a">0</div></div>
          <div class="tn-rtick-min"></div>
          <div class="tn-rtick-min"></div>
          <div style="text-align:center"><div class="tn-rtick-maj"></div><div class="tn-rtick-lbl">+25</div></div>
          <div class="tn-rtick-min"></div>
          <div class="tn-rtick-min"></div>
          <div style="text-align:center"><div class="tn-rtick-maj"></div><div class="tn-rtick-lbl">+50</div></div>
        </div>
      </div>

      <!-- Toggle: Afinação livre / Afinação do violão -->
      <div id="_tn-mode-toggle" style="display:flex;gap:3px;margin-top:.45rem;margin-bottom:.1rem;width:100%;max-width:320px;background:#111;border:2px solid #1e1e1e;border-radius:12px;padding:3px">
        <button onclick="_tunerSetGuitarMode(false)" style="flex:1;padding:.3rem .4rem;border-radius:9px;border:none;font-size:.72rem;font-weight:800;font-family:var(--font-body);cursor:pointer;touch-action:manipulation;transition:box-shadow .1s,transform .1s;${!_tuner.guitarMode?'background:#383838;color:#fff;text-shadow:0 1px 3px #000;box-shadow:0 2px 0 #000;transform:translateY(-1px)':'background:#0d0d0d;color:#444;box-shadow:inset 0 2px 3px rgba(0,0,0,.7);transform:none'}">${t('tuner_free')}</button>
        <button onclick="_tunerSetGuitarMode(true)" style="flex:1;padding:.3rem .4rem;border-radius:9px;border:none;font-size:.72rem;font-weight:800;font-family:var(--font-body);cursor:pointer;touch-action:manipulation;transition:box-shadow .1s,transform .1s;${_tuner.guitarMode?'background:#383838;color:#fff;text-shadow:0 1px 3px #000;box-shadow:0 2px 0 #000;transform:translateY(-1px)':'background:#0d0d0d;color:#444;box-shadow:inset 0 2px 3px rgba(0,0,0,.7);transform:none'}">${t('tuner_guitar')}</button>
      </div>

      <!-- Cordas (visível apenas no modo violão) -->
      <div id="_tn-str-row" class="tuner-str-row" style="display:none"></div>

      <!-- Barra de nível de entrada -->
      <div style="width:100%;max-width:320px;height:3px;background:#0d0d0d;border-radius:99px;overflow:hidden;margin-top:.1rem">
        <div id="_tn-level-bar" style="height:100%;width:0%;border-radius:3px;transition:width .06s"></div>
      </div>

      <!-- Banner: violão afinado! (visível apenas no modo violão) -->
      <div id="_tn-complete" style="display:none;flex-direction:column;align-items:center;gap:.5rem;width:100%;max-width:320px;background:linear-gradient(180deg,#1a3a1a,#112211);border:2px solid #7cdd7c44;border-radius:16px;padding:1rem;margin-top:.5rem">
        <img src="assets/tuner-headstock.png" alt="" aria-hidden="true" style="width:52px;height:52px;object-fit:contain">
        <div style="font-size:1.1rem;font-weight:900;color:#7cdd7c;font-family:var(--font-title)">${t('tuner_all_tuned')}</div>
        <div style="font-size:.8rem;color:#5ab85a;font-weight:700">${t('tuner_all_tuned_sub')}</div>
      </div>
    </div>`;
}

