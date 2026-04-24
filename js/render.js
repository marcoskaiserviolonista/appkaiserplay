let _saveTimer=null;
let _saveMaxTimer=null;
const _NAV_PHASES=new Set(['start','login','signup','forgot_password','set_display_name','perfil','levelup','desempenho','loja','inventario','niveis','treino_focado_menu','comprar','metronomo','afinador']);
let _lastPhase=null;
let _obTimer=null;
function render(){
  clearTimeout(_obTimer);_obTimer=setTimeout(updateObOverlay,60);
  if(_metro.running&&state.phase!=='metronomo')_metroStop();
  if(typeof _tuner!=='undefined'&&_tuner.running&&state.phase!=='afinador')_tunerStop();
  const _cur=state.phase;
  if(_cur!==_lastPhase){
    const _prev=_lastPhase;_lastPhase=_cur;
    if(_NAV_PHASES.has(_cur)||(_cur==='question'&&_prev!=='answered')||(_cur==='treino_focado_question'&&_prev!=='treino_focado_answered')){
      window.scrollTo(0,0);
    }
  }
  // Remove any leftover guest popup overlays
  const oldOverlay=document.getElementById('guest-popup-overlay');
  if(oldOverlay)oldOverlay.remove();

  if(state.user&&state.phase!=='login'){
    if(_saveTimer)clearTimeout(_saveTimer);
    _saveTimer=setTimeout(saveProgress,4000);
    if(!_saveMaxTimer){_saveMaxTimer=setTimeout(()=>{_saveMaxTimer=null;if(_saveTimer){clearTimeout(_saveTimer);_saveTimer=null;}saveProgress();},15000);}
  }
  const header=document.querySelector('.header');
  if(header)header.style.display=(state.phase==='login'||state.phase==='signup'||state.phase==='set_display_name'||state.phase==='forgot_password')?'none':'';
  const tRanking=document.getElementById('tab-ranking');
  const tPerfil=document.getElementById('tab-perfil');
  const tLogin=document.getElementById('tab-login');
  if(tLogin){tLogin.style.display=state.isGuest?'':'none';tLogin.textContent=t('sign_in');}
  if(state.tab==='ranking'){
    tRanking.className='tab active';
  } else {
    tRanking.className='tab';
  }
  if(state.phase==='perfil'){
    tPerfil.style.opacity='1';tPerfil.style.filter='brightness(1.2)';
  } else {
    tPerfil.style.opacity='';tPerfil.style.filter='';
  }
  const c=document.getElementById('content');
  // toggle bottom padding when combo bar is visible
  const appEl=document.getElementById('app');
  if(appEl){appEl.classList.toggle('has-combo',state.streak>=1&&state.tab==='game'&&['question','answered'].includes(state.phase));}
  if(state.phase==='login'){c.innerHTML=renderLogin();return;}
  if(state.phase==='signup'){c.innerHTML=renderSignup();return;}
  if(state.phase==='forgot_password'){c.innerHTML=renderForgotPassword();return;}
  if(state.phase==='set_display_name'){c.innerHTML=renderSetDisplayName();return;}
  // Block access unless user is logged in or guest
  if(!state.user&&!state.isGuest){state.phase='login';c.innerHTML=renderLogin();return;}
  if(state.phase==='perfil'){c.innerHTML=renderPerfil();return;}
  if(state.tab==='ranking'){c.innerHTML=renderRanking();return;}
  if(state.phase==='start'){c.innerHTML=renderStart();return;}
  if(state.phase==='levelup'){c.innerHTML=renderLevelUp();return;}
  if(state.phase==='desempenho'){c.innerHTML=renderDesempenho();return;}
  if(state.phase==='loja'){
    c.innerHTML=renderLoja();
    if(!_obFlag('kp_loja_tutorial_seen')){
      _obSetFlag('kp_loja_tutorial_seen');
      const ov=document.createElement('div');
      ov.id='loja-tutorial-overlay';
      ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.82);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.5rem';
      ov.innerHTML=`
        <div style="background:#1a1200;border:3px solid #F5A623;border-radius:24px;padding:1.75rem 1.5rem 1.4rem;max-width:320px;width:100%;box-shadow:6px 6px 0 #000;text-align:center">
          <img src="assets/afinador.png" style="width:64px;height:64px;object-fit:contain;margin-bottom:.75rem">
          <div style="font-size:1.1rem;font-weight:900;color:#F5A623;font-family:var(--font-title);text-transform:uppercase;letter-spacing:.04em;margin-bottom:.3rem">${t('loja_tutorial_title')}</div>
          <div style="background:#111;border:2px solid #F5A62333;border-radius:14px;padding:.9rem 1rem;margin-bottom:1.25rem;text-align:left">
            <div style="display:flex;align-items:flex-start;gap:.65rem;margin-bottom:.65rem">
              <img src="assets/moeda.png" style="width:1.1rem;height:1.1rem;flex-shrink:0;margin-top:.1rem;object-fit:contain">
              <span style="font-size:.86rem;color:#ddd;font-weight:600;line-height:1.4">${t('loja_tutorial_b1')}</span>
            </div>
            <div style="display:flex;align-items:flex-start;gap:.65rem;margin-bottom:.65rem">
              <img src="assets/afinador.png" style="width:1.1rem;height:1.1rem;flex-shrink:0;margin-top:.1rem;object-fit:contain">
              <span style="font-size:.86rem;color:#ddd;font-weight:600;line-height:1.4">${t('loja_tutorial_b2')}</span>
            </div>
            <div style="display:flex;align-items:flex-start;gap:.65rem">
              <img src="assets/ebook.png" style="width:1.1rem;height:1.1rem;flex-shrink:0;margin-top:.1rem;object-fit:contain">
              <span style="font-size:.86rem;color:#ddd;font-weight:600;line-height:1.4">${t('loja_tutorial_b3')}</span>
            </div>
          </div>
          <button class="cta-btn" onclick="document.getElementById('loja-tutorial-overlay').remove();playClickSfx('click')">
            ${t('loja_tutorial_cta')}
          </button>
        </div>
      `;
      document.body.appendChild(ov);
    }
    return;
  }
  if(state.phase==='inventario'){c.innerHTML=renderInventario();return;}
  if(state.phase==='niveis'){c.innerHTML=renderNiveis();nivelCarouselInit();return;}
  if(state.phase==='treino_focado_menu'){
    c.innerHTML=renderTreinoFocadoMenu();
    if(!state.fullAccess&&!state.unlockPopupDismissed){
      const overlay=document.createElement('div');
      overlay.id='unlock-popup-overlay';
      overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.82);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.5rem';
      overlay.innerHTML=`
        <div style="background:#0e1a0e;border:3px solid #22c55e;border-radius:24px;padding:1.75rem 1.5rem 1.4rem;max-width:320px;width:100%;box-shadow:6px 6px 0 #000;text-align:center">
          <img src="assets/afinador.png" style="width:56px;height:56px;object-fit:contain;margin-bottom:.75rem">
          <div style="margin-bottom:1.2rem;line-height:1.25">
            <div style="font-size:1.05rem;font-weight:900;color:#4ade80;font-family:var(--font-title);text-transform:uppercase;letter-spacing:.04em">${t('unlock_popup_headline')}</div>
            <div style="font-size:.9rem;font-weight:700;color:#aaa;font-family:var(--font-body);margin-top:.25rem">${t('unlock_popup_sub')}</div>
          </div>
          <div style="background:#111;border:2px solid #22c55e22;border-radius:14px;padding:.9rem 1rem;margin-bottom:1.25rem;text-align:left">
            <div style="display:flex;align-items:flex-start;gap:.65rem;margin-bottom:.65rem">
              <img src="assets/afinador.png" style="width:1.1rem;height:1.1rem;flex-shrink:0;margin-top:.05rem;object-fit:contain">
              <span style="font-size:.86rem;color:#ddd;font-weight:600;line-height:1.4">${t('unlock_popup_b1')}</span>
            </div>
            <div style="display:flex;align-items:flex-start;gap:.65rem;margin-bottom:.65rem">
              <img src="assets/alvo.png" style="width:1rem;height:1rem;flex-shrink:0;margin-top:.05rem;object-fit:contain">
              <span style="font-size:.86rem;color:#ddd;font-weight:600;line-height:1.4">${t('unlock_popup_b2')}</span>
            </div>
            <div style="display:flex;align-items:flex-start;gap:.65rem">
              <span style="color:#4ade80;font-size:1rem;flex-shrink:0;margin-top:.05rem">♾️</span>
              <span style="font-size:.86rem;color:#ddd;font-weight:600;line-height:1.4">${t('unlock_popup_b3')}</span>
            </div>
          </div>
          <button onclick="state.unlockPopupDismissed=true;document.getElementById('unlock-popup-overlay').remove();playClickSfx('click');state.phase='comprar';render()"
            style="width:100%;padding:.9rem;background:linear-gradient(180deg,#16a34a,#15803d);border:3px solid #111;border-radius:14px;box-shadow:4px 4px 0 #111;color:#fff;font-size:1rem;font-weight:900;font-family:var(--font-body);cursor:pointer;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8);margin-bottom:.6rem;letter-spacing:.01em;display:flex;align-items:center;justify-content:center;gap:.5rem">
            🔓 ${t('unlock_popup_cta')}
          </button>
          <button onclick="state.unlockPopupDismissed=true;document.getElementById('unlock-popup-overlay').remove()"
            style="width:100%;padding:.5rem;background:transparent;border:none;color:#555;font-size:.82rem;font-weight:600;font-family:var(--font-body);cursor:pointer">
            ${t('unlock_popup_dismiss')}
          </button>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    return;
  }
  if(state.phase==='comprar'){c.innerHTML=renderComprar();return;}
  if(state.phase==='metronomo'){c.innerHTML=renderMetronomo();return;}
  if(state.phase==='afinador'){c.innerHTML=renderAfinador();return;}
  if(state.phase==='sala_de_aula'){c.innerHTML=renderSalaDeAula();return;}
  if(state.phase==='treino_focado_question'||state.phase==='treino_focado_answered'){c.innerHTML=renderTreinoFocado();return;}
  c.innerHTML=renderGame();
  // Show guest popup if triggered
  if(state.showGuestPopup){
    const overlay=document.createElement('div');
    overlay.id='guest-popup-overlay';
    overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.5rem';
    overlay.innerHTML=`
      <div style="background:#1a1a1a;border:3px solid #F5A623;border-radius:24px;padding:1.75rem 1.5rem 1.4rem;max-width:320px;width:100%;box-shadow:6px 6px 0 #000;text-align:center">
        <img src="assets/LOGO-APP-3.png" style="width:180px;object-fit:contain;margin-bottom:.75rem" onerror="this.style.display='none'">
        <div style="font-size:1.2rem;font-weight:900;color:#fff;font-family:var(--font-title);margin-bottom:1.1rem;line-height:1.25">${t('guest_popup_title')}</div>
        <div style="background:#111;border-radius:14px;padding:.9rem 1rem;margin-bottom:1.2rem;text-align:left">
          <div style="display:flex;align-items:center;gap:.65rem;margin-bottom:.6rem">
            <span style="color:#4ade80;font-size:1.1rem;flex-shrink:0">✓</span>
            <span style="font-size:.88rem;color:#ddd;font-weight:600">${t('guest_popup_b1')}</span>
          </div>
          <div style="display:flex;align-items:center;gap:.65rem">
            <span style="color:#4ade80;font-size:1.1rem;flex-shrink:0">✓</span>
            <span style="font-size:.88rem;color:#ddd;font-weight:600">${t('guest_popup_b2')}</span>
          </div>
        </div>
        <button onclick="state.showGuestPopup=false;state.phase='signup';render()"
          style="width:100%;padding:.85rem;background:linear-gradient(180deg,#ffbe4f,#F5A623);border:3px solid #111;border-radius:14px;box-shadow:4px 4px 0 #111;color:#fff;font-size:1rem;font-weight:900;font-family:var(--font-body);cursor:pointer;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8);margin-bottom:.6rem">
          ${t('guest_popup_create')}
        </button>
        <button onclick="state.showGuestPopup=false;state.guestPopupCount++;state.guestNextPrompt=state.guestExerciseCount+(state.guestPopupCount===1?10:30);render()"
          style="width:100%;padding:.5rem;background:transparent;border:none;color:#555;font-size:.82rem;font-weight:600;font-family:var(--font-body);cursor:pointer">
          ${t('guest_popup_later')}
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
  }
}

// ── Metrônomo: Engine ─────────────────────────────────────────
// scheduleAhead: 5s — garante beats no buffer mesmo com setTimeout throttled pela tela bloqueada
// lookahead: 500ms — raro o suficiente para não gastar CPU, mas suficiente para reabastecer
const _metro={ctx:null,compressor:null,noiseBuf:null,silentNode:null,audioTag:null,bpm:80,running:false,nextTime:0,timerID:null,scheduleAhead:5.0,lookahead:500,pendingSrc:[],gen:0};

// Elemento <audio> HTML que segura a sessão de áudio do iOS em background.
// Web Audio API pura é suspensa ao bloquear a tela; <audio> não é.
function _metroEnsureAudioTag(){
  if(_metro.audioTag)return;
  // <audio> sem src: receberá srcObject do MediaStreamDestination do AudioContext.
  // Assim o iOS não pode suspender o AudioContext sem silenciar o próprio player da tela de bloqueio.
  const tag=document.createElement('audio');
  tag.loop=true;
  _metro.audioTag=tag;
}

function _metroBuildNoise(ctx){
  const len=Math.ceil(ctx.sampleRate*0.05);
  const buf=ctx.createBuffer(1,len,ctx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  return buf;
}

function _metroClick(time){
  const ctx=_metro.ctx;
  const noise=ctx.createBufferSource();
  noise.buffer=_metro.noiseBuf;
  const bp=ctx.createBiquadFilter();
  bp.type='bandpass';bp.frequency.value=1400;bp.Q.value=1.2;
  const gain=ctx.createGain();
  noise.connect(bp);bp.connect(gain);gain.connect(_metro.compressor);
  gain.gain.setValueAtTime(5.0,time);
  gain.gain.exponentialRampToValueAtTime(0.001,time+0.018);
  noise.start(time);noise.stop(time+0.02);
  _metro.pendingSrc.push(noise);
  noise.onended=()=>{const i=_metro.pendingSrc.indexOf(noise);if(i>=0)_metro.pendingSrc.splice(i,1);};
  // visual flash — gen evita que callbacks do BPM antigo poluam a animação
  const delay=Math.max(0,(time-ctx.currentTime)*1000);
  const gen=_metro.gen;
  if(delay<2000)setTimeout(()=>{
    if(_metro.gen!==gen)return; // callback obsoleto, ignora
    const dot=document.getElementById('_metro-dot');
    if(dot){dot.classList.add('active');setTimeout(()=>dot.classList.remove('active'),80);}
  },delay);
}

function _metroSchedule(){
  if(!_metro.running)return;
  while(_metro.nextTime<_metro.ctx.currentTime+_metro.scheduleAhead){
    _metroClick(_metro.nextTime);
    _metro.nextTime+=60/_metro.bpm;
  }
  _metro.timerID=setTimeout(_metroSchedule,_metro.lookahead);
}

function _metroStartSilentLoop(ctx){
  // Ruído ínfimo em loop: mantém AudioContext ativo com tela bloqueada (iOS e Android)
  const len=ctx.sampleRate;
  const buf=ctx.createBuffer(1,len,ctx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*0.0001;
  const src=ctx.createBufferSource();
  src.buffer=buf;src.loop=true;
  src.connect(ctx.destination);
  src.start();
  _metro.silentNode=src;
}

function _metroSetupMediaSession(){
  if(!('mediaSession' in navigator))return;
  navigator.mediaSession.metadata=new MediaMetadata({title:'Metrônomo',artist:'KaiserPlay'});
  navigator.mediaSession.setActionHandler('play',()=>{if(!_metro.running)_metroStart();});
  navigator.mediaSession.setActionHandler('pause',()=>{if(_metro.running)_metroStop();});
}

function _metroStart(){
  if(_metro.running)return;
  _metroEnsureAudioTag();
  if(!_metro.ctx){
    _metro.ctx=new(window.AudioContext||window.webkitAudioContext)();
    const comp=_metro.ctx.createDynamicsCompressor();
    comp.threshold.value=-20;comp.knee.value=1;comp.ratio.value=20;
    comp.attack.value=0.001;comp.release.value=0.05;
    _metro.compressor=comp;
    _metro.noiseBuf=_metroBuildNoise(_metro.ctx);
    // Roteia saída do AudioContext para o <audio> via MediaStreamDestination.
    // O iOS não suspende um AudioContext que alimenta um <audio> ativo no player da tela de bloqueio.
    if(_metro.ctx.createMediaStreamDestination){
      const msDest=_metro.ctx.createMediaStreamDestination();
      comp.connect(msDest);
      _metro.audioTag.srcObject=msDest.stream;
    } else {
      // Fallback para browsers sem MediaStreamDestination
      comp.connect(_metro.ctx.destination);
      _metroStartSilentLoop(_metro.ctx);
    }
  }
  if(_metro.ctx.state==='suspended')_metro.ctx.resume();
  // <audio> + Media Session API: registra no iOS como mídia ativa,
  // aparece no player da tela de bloqueio e mantém áudio em background
  _metro.audioTag.play().catch(()=>{});
  _metroSetupMediaSession();
  if('mediaSession' in navigator)navigator.mediaSession.playbackState='playing';
  // Elimina qualquer timerID órfão para evitar dupla batida
  if(_metro.timerID){clearTimeout(_metro.timerID);_metro.timerID=null;}
  _metro.gen++; // invalida callbacks visuais anteriores
  _metro.running=true;
  _metro.nextTime=_metro.ctx.currentTime+0.05;
  _metroSchedule();
  _metroUpdateUI();
}

function _metroStop(){
  _metro.running=false;
  if(_metro.timerID){clearTimeout(_metro.timerID);_metro.timerID=null;}
  // Cancela todos os beats pré-agendados imediatamente
  const now=_metro.ctx?_metro.ctx.currentTime:0;
  _metro.pendingSrc.forEach(s=>{try{s.stop(now);}catch(e){}});
  _metro.pendingSrc=[];
  if(_metro.ctx&&_metro.ctx.state==='running')_metro.ctx.suspend();
  if(_metro.audioTag)_metro.audioTag.pause();
  if('mediaSession' in navigator)navigator.mediaSession.playbackState='paused';
  _metroUpdateUI();
}

// Retoma metrônomo ao desbloquear a tela (resume contexto + reinicia loop de agendamento)
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&_metro.running&&_metro.ctx){
    const doResync=()=>{
      // Mata qualquer timerID antigo throttled pelo OS e reinicia o scheduler
      if(_metro.timerID){clearTimeout(_metro.timerID);_metro.timerID=null;}
      _metro.nextTime=_metro.ctx.currentTime+0.05;
      _metroSchedule();
    };
    if(_metro.ctx.state==='suspended')_metro.ctx.resume().then(doResync);
    else doResync();
  }
});

function _metroToggle(){
  playClickSfx('click');
  if(_metro.running)_metroStop();else _metroStart();
}

function _metroSetBpm(v){
  _metro.bpm=Math.max(40,Math.min(200,v));
  const val=document.getElementById('_metro-bpm-val');
  const slider=document.getElementById('_metro-bpm-slider');
  if(val)val.textContent=_metro.bpm;
  if(slider)slider.value=_metro.bpm;
  if(_metro.running&&_metro.ctx){
    // Cancela todas as batidas pré-agendadas e reinicia com novo BPM imediatamente
    const now=_metro.ctx.currentTime;
    _metro.pendingSrc.forEach(s=>{try{s.stop(now);}catch(e){}});
    _metro.pendingSrc=[];
    _metro.gen++; // invalida callbacks visuais do BPM antigo
    if(_metro.timerID){clearTimeout(_metro.timerID);_metro.timerID=null;}
    _metro.nextTime=now+(60/_metro.bpm);
    _metroSchedule();
  }
}

function _metroAdj(delta){_metroSetBpm(_metro.bpm+delta);}

function _metroUpdateUI(){
  const btn=document.getElementById('_metro-play-btn');
  if(!btn)return;
  if(_metro.running){
    btn.textContent=t('metro_stop');
    btn.style.background='linear-gradient(180deg,#333,#222)';
    btn.style.color='#ccc';
  }else{
    btn.textContent=t('metro_start');
    btn.style.background='linear-gradient(180deg,#ffbe4f,#F5A623)';
    btn.style.color='#111';
  }
}

