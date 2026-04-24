// ── 2. SISTEMA DE ÁUDIO ───────────────────────────────────────
// ── AudioContext único compartilhado ──────────────────────────
let _audioCtx=null;
function getAudioCtx(){
  if(!_audioCtx||_audioCtx.state==='closed'){
    _audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  }
  if(_audioCtx.state==='suspended') _audioCtx.resume();
  return _audioCtx;
}

const howls = {};
SAMPLE_NOTES.forEach(n => {
  howls[n] = new Howl({src:[`sounds/note-${n}.ogg`],preload:true,volume:0.5});
});

// Boost de volume para notas com gravação mais baixa
// +20%: notas identificadas como mais baixas na gravação (MIDI 43–47, 53–56)
// +10%: demais notas do range médio-grave (MIDI 48–52, 57–63)
const _BOOST_MIDI_20 = new Set([43,44,45,46,47,53,54,55,56]);
const _BOOST_MIDI_10 = new Set([48,49,50,51,52,57,58,59,60,61,62,63]);
function _noteBoost(midi){ return _BOOST_MIDI_20.has(midi)?1.2:_BOOST_MIDI_10.has(midi)?1.1:1; }

// Cadeia de EQ para violão em celular:
// HP(120Hz) → lowShelf(250Hz,-3dB) → peak(2.5kHz,+2dB) → limiter(-6dBFS) → makeup(×1.8)
let _compressorInit=false;
function initCompressor(){
  if(_compressorInit||!Howler.ctx)return;
  _compressorInit=true;
  const ctx=Howler.ctx;
  const hp=ctx.createBiquadFilter();
  hp.type='highpass';hp.frequency.value=120;hp.Q.value=0.7;
  const ls=ctx.createBiquadFilter();
  ls.type='lowshelf';ls.frequency.value=250;ls.gain.value=-3;
  const pk=ctx.createBiquadFilter();
  pk.type='peaking';pk.frequency.value=2500;pk.Q.value=1.0;pk.gain.value=2;
  const lim=ctx.createDynamicsCompressor();
  lim.threshold.value=-6;lim.knee.value=0;lim.ratio.value=20;
  lim.attack.value=0.001;lim.release.value=0.05;
  const makeup=ctx.createGain();
  makeup.gain.value=1.8;
  Howler.masterGain.disconnect();
  Howler.masterGain.connect(hp);
  hp.connect(ls);
  ls.connect(pk);
  pk.connect(lim);
  lim.connect(makeup);
  makeup.connect(ctx.destination);
}
function midiToFreq(m){return 440*Math.pow(2,(m-69)/12);}
function nearestSample(m){return SAMPLE_NOTES.reduce((a,b)=>Math.abs(b-m)<Math.abs(a-m)?b:a);}

let _playTimer=null;
let _fadeTimer=null;
let _playingIds=[];
let _salaStartTimer=null;
const FADE_DURATION=1500;
function playChord(chord){
  initCompressor();
  if(_playTimer){clearTimeout(_playTimer);_playTimer=null;}
  if(_fadeTimer){clearTimeout(_fadeTimer);_fadeTimer=null;}

  chord.midi.forEach(midi=>{try{howls[nearestSample(midi)].stop();}catch(e){}});
  _playingIds=[];
  state.playing=true;
  const _pbtn=document.querySelector('.play-btn');
  if(_pbtn){_pbtn.textContent=t('listening');_pbtn.classList.add('playing');}
  const noteDelay=110;
  // Volume por nota: 0.95/N — corte de graves na cadeia EQ dá headroom suficiente
  const noteVol=1.2/chord.midi.length;
  chord.midi.forEach((midi,i)=>{
    const sn=nearestSample(midi);
    const ratio=midiToFreq(midi)/midiToFreq(sn);
    setTimeout(()=>{
      const id=howls[sn].play();
      const _vol=noteVol*_noteBoost(midi);
      howls[sn].volume(_vol,id);
      if(Math.abs(ratio-1)>0.001) howls[sn].rate(ratio,id);
      _playingIds.push({howl:howls[sn],id,vol:_vol});
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

function playSfx(type){
  try{
    const ctx=getAudioCtx();
    const t=ctx.currentTime;

    if(type==='correct'){
      [[523,.00,.055],[659,.09,.04]].forEach(([f,d,v])=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type='sine';o.frequency.value=f;
        g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(v,t+d+.012);
        g.gain.exponentialRampToValueAtTime(.001,t+d+.28);
        o.connect(g);g.connect(ctx.destination);o.start(t+d);o.stop(t+d+.32);
      });

    }else if(type==='correct2'){
      [[523,.00,'square',.014],[659,.08,'square',.014],[784,.16,'sine',.02],[1047,.22,'sine',.014]].forEach(([f,d,tp,v])=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type=tp;o.frequency.value=f;
        g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(v,t+d+.01);
        g.gain.exponentialRampToValueAtTime(.001,t+d+.32);
        o.connect(g);g.connect(ctx.destination);o.start(t+d);o.stop(t+d+.38);
      });

    }else if(type==='combo3'){
      const nc=ctx.createOscillator(),gc=ctx.createGain();
      nc.type='square';nc.frequency.setValueAtTime(1800,t);nc.frequency.exponentialRampToValueAtTime(200,t+.025);
      gc.gain.setValueAtTime(.02,t);gc.gain.exponentialRampToValueAtTime(.001,t+.03);
      nc.connect(gc);gc.connect(ctx.destination);nc.start(t);nc.stop(t+.03);
      [[523,.02],[659,.09],[784,.16],[1047,.23]].forEach(([f,d])=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type='triangle';o.frequency.value=f;
        g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(.035,t+d+.012);
        g.gain.exponentialRampToValueAtTime(.001,t+d+.38);
        o.connect(g);g.connect(ctx.destination);o.start(t+d);o.stop(t+d+.44);
      });

    }else if(type==='combo6'){
      [[523,.00],[659,.055],[880,.11],[1175,.165],[1568,.22]].forEach(([f,d])=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type='triangle';o.frequency.value=f;
        g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(.04,t+d+.01);
        g.gain.exponentialRampToValueAtTime(.001,t+d+.42);
        o.connect(g);g.connect(ctx.destination);o.start(t+d);o.stop(t+d+.5);
      });
      const os=ctx.createOscillator(),gs=ctx.createGain();
      os.type='sine';os.frequency.setValueAtTime(2093,t+.25);os.frequency.exponentialRampToValueAtTime(2637,t+.42);
      gs.gain.setValueAtTime(0,t+.25);gs.gain.linearRampToValueAtTime(.014,t+.3);gs.gain.exponentialRampToValueAtTime(.001,t+.48);
      os.connect(gs);gs.connect(ctx.destination);os.start(t+.25);os.stop(t+.5);

    }else if(type==='combo9'){
      [[392,.00],[523,.07],[659,.14],[784,.21],[1047,.28],[1319,.35],[1568,.42]].forEach(([f,d])=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type='triangle';o.frequency.value=f;
        g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(.05,t+d+.01);
        g.gain.exponentialRampToValueAtTime(.001,t+d+.50);
        o.connect(g);g.connect(ctx.destination);o.start(t+d);o.stop(t+d+.6);
      });

    }else if(type==='wrong'){
      const o1=ctx.createOscillator(),g1=ctx.createGain();
      o1.type='sawtooth';o1.frequency.setValueAtTime(280,t);o1.frequency.exponentialRampToValueAtTime(60,t+.35);
      g1.gain.setValueAtTime(.06,t);g1.gain.exponentialRampToValueAtTime(.001,t+.4);
      o1.connect(g1);g1.connect(ctx.destination);o1.start(t);o1.stop(t+.45);
      const buf=ctx.createBuffer(1,ctx.sampleRate*.2,ctx.sampleRate);
      const data=buf.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.1;
      const noise=ctx.createBufferSource(),gn=ctx.createGain();
      noise.buffer=buf;gn.gain.setValueAtTime(.03,t);gn.gain.exponentialRampToValueAtTime(.001,t+.2);
      noise.connect(gn);gn.connect(ctx.destination);noise.start(t);
      const o2=ctx.createOscillator(),g2=ctx.createGain();
      o2.type='sine';o2.frequency.value=80;
      g2.gain.setValueAtTime(.05,t);g2.gain.exponentialRampToValueAtTime(.001,t+.3);
      o2.connect(g2);g2.connect(ctx.destination);o2.start(t);o2.stop(t+.35);

    }else if(type==='levelup'){
      [[392,.00,.05],[494,.00,.04],[587,.00,.04],[784,.00,.05],[988,.00,.03]].forEach(([f,d,v])=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type='sine';o.frequency.value=f;
        g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(v,t+d+.02);
        g.gain.linearRampToValueAtTime(v*.5,t+d+.25);
        g.gain.exponentialRampToValueAtTime(.001,t+d+.85);
        o.connect(g);g.connect(ctx.destination);o.start(t+d);o.stop(t+d+.9);
      });
      [[1568,.05,.03],[1976,.18,.03],[2637,.32,.02],[3136,.44,.02]].forEach(([f,d,v])=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type='sine';o.frequency.setValueAtTime(f*.7,t+d);o.frequency.exponentialRampToValueAtTime(f,t+d+.08);
        g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(v,t+d+.04);
        g.gain.exponentialRampToValueAtTime(.001,t+d+.5);
        o.connect(g);g.connect(ctx.destination);o.start(t+d);o.stop(t+d+.55);
      });

    }else if(type==='diamond'){
      const scale=[523,587,659,698,784,880,988,1047];
      scale.forEach((f,i)=>{
        const d=i*.075;
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type='square';o.frequency.value=f;
        g.gain.setValueAtTime(.02+i*.0014,t+d);
        g.gain.exponentialRampToValueAtTime(.001,t+d+.18);
        o.connect(g);g.connect(ctx.destination);o.start(t+d);o.stop(t+d+.2);
      });
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.value=1047;
      g.gain.setValueAtTime(.04,t+.6);g.gain.exponentialRampToValueAtTime(.001,t+1.1);
      o.connect(g);g.connect(ctx.destination);o.start(t+.6);o.stop(t+1.2);

    }else if(type==='whoosh'){
      const buf=ctx.createBuffer(1,ctx.sampleRate*.15,ctx.sampleRate);
      const data=buf.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,2)*.4;
      const noise=ctx.createBufferSource(),g=ctx.createGain();
      noise.buffer=buf;g.gain.value=.16;
      noise.connect(g);g.connect(ctx.destination);noise.start(t);

    }else if(type==='xpbar'){
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.setValueAtTime(880,t);o.frequency.exponentialRampToValueAtTime(1760,t+.15);
      g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);
      o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.2);

    }else if(type==='bubble'){
      const pops=5;
      for(let i=0;i<pops;i++){
        const delay=i*0.055,freq=400+Math.random()*600;
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type='sine';o.frequency.setValueAtTime(freq,t+delay);o.frequency.exponentialRampToValueAtTime(freq*1.8,t+delay+.04);
        g.gain.setValueAtTime(0,t+delay);g.gain.linearRampToValueAtTime(.07,t+delay+.01);g.gain.exponentialRampToValueAtTime(.001,t+delay+.06);
        o.connect(g);g.connect(ctx.destination);o.start(t+delay);o.stop(t+delay+.07);
      }
    }
  }catch(e){}
}


function playClickSfx(type){
  try{
    const ctx=getAudioCtx();
    const t=ctx.currentTime;
    if(type==='soft'){
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.setValueAtTime(1200,t);o.frequency.exponentialRampToValueAtTime(900,t+.04);
      g.gain.setValueAtTime(.07,t);g.gain.exponentialRampToValueAtTime(.001,t+.06);
      o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.07);
    } else if(type==='nav'){
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.setValueAtTime(600,t);o.frequency.exponentialRampToValueAtTime(400,t+.06);
      g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.09);
      o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.1);
      const o2=ctx.createOscillator(),g2=ctx.createGain();
      o2.type='sine';o2.frequency.value=1200;
      g2.gain.setValueAtTime(.04,t);g2.gain.exponentialRampToValueAtTime(.001,t+.07);
      o2.connect(g2);g2.connect(ctx.destination);o2.start(t);o2.stop(t+.08);
    } else if(type==='back'){
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.setValueAtTime(800,t);o.frequency.exponentialRampToValueAtTime(500,t+.08);
      g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.1);
      o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.11);
    } else if(type==='switch_on'){
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.setValueAtTime(700,t);o.frequency.exponentialRampToValueAtTime(1100,t+.06);
      g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.08);
      o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.09);
    } else if(type==='switch_off'){
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.setValueAtTime(900,t);o.frequency.exponentialRampToValueAtTime(500,t+.06);
      g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+.08);
      o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.09);
    } else if(type==='locked'){
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='square';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(140,t+.07);
      g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.1);
      o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.11);
    }
  }catch(e){}
}
function playBuySfx(){
  try{
    const ctx=getAudioCtx();
    const t=ctx.currentTime;
    [[523,0,'sine',.12],[659,.06,'sine',.1],[784,.12,'triangle',.09],[1047,.18,'triangle',.12],[1319,.26,'sine',.08]].forEach(([f,d,tp,v])=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type=tp;o.frequency.value=f;
      g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(v,t+d+.015);
      g.gain.exponentialRampToValueAtTime(.001,t+d+.35);
      o.connect(g);g.connect(ctx.destination);o.start(t+d);o.stop(t+d+.4);
    });
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine';o.frequency.setValueAtTime(2093,t+.3);o.frequency.exponentialRampToValueAtTime(2637,t+.45);
    g.gain.setValueAtTime(.06,t+.3);g.gain.exponentialRampToValueAtTime(.001,t+.5);
    o.connect(g);g.connect(ctx.destination);o.start(t+.3);o.stop(t+.55);
  }catch(e){}
}

function playDiamondExchangeSfx(){
  try{
    const ctx=getAudioCtx();
    const t=ctx.currentTime;
    [[2637,0,'sine',.15],[2093,.07,'sine',.13],[1568,.14,'sine',.11],[1319,.21,'sine',.1],[1047,.28,'sine',.14],[784,.35,'triangle',.12]].forEach(([f,d,tp,v])=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type=tp;o.frequency.value=f;
      g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(v,t+d+.01);
      g.gain.exponentialRampToValueAtTime(.001,t+d+.4);
      o.connect(g);g.connect(ctx.destination);o.start(t+d);o.stop(t+d+.45);
    });
  }catch(e){}
}

function playCoinSfx(){
  const ctx=getAudioCtx();
  const t=ctx.currentTime;
  [[1047,.0],[1319,.08],[1568,.16],[2093,.25],[1568,.34],[2093,.43]].forEach(([freq,delay],i)=>{
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine';o.frequency.value=freq;
    g.gain.setValueAtTime(0,t+delay);
    g.gain.linearRampToValueAtTime(.18,t+delay+.01);
    g.gain.exponentialRampToValueAtTime(.001,t+delay+.18);
    o.connect(g);g.connect(ctx.destination);o.start(t+delay);o.stop(t+delay+.2);
  });
}

