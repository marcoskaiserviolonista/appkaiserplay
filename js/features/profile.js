// ── Perfil ────────────────────────────────────────────────────
function goToPerfil(){
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  state.tab='game';
  state.phase='perfil';
  render();
}
function renderPerfil(){
  const user=state.user;
  const displayName=esc(user?.displayName||'');
  const email=esc(user?.email||'');
  function field(label,id,type,placeholder,val){
    return `
      <div style="margin-bottom:1rem">
        <div style="font-size:.65rem;font-weight:800;color:#888;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem">${label}</div>
        <input id="${id}" type="${type}" placeholder="${placeholder}" value="${val}"
          style="width:100%;padding:.7rem 1rem;background:#111;border:2px solid #333;border-radius:12px;color:#fff;font-size:.92rem;font-family:var(--font-body);outline:none;box-sizing:border-box">
      </div>`;
  }
  const optStr=t('optional_fill_hint');
  const delStr=t('delete_account_permanently');
  const updEmailStr=t('update_email');
  const updPassStr=t('update_password');
  const accStr=t('account_section');
  const nameRankStr=t('name_in_ranking');
  const minCharsStr=t('min_chars');
  return `
    <div class="back-row">
      <button class="back-btn" onclick="playClickSfx('back');state.phase='start';render()">${t('back_btn')}</button>
      <span class="page-title">${t('settings_title')}</span>
    </div>
    <div style="width:100%;max-width:520px;display:flex;flex-direction:column;gap:1rem;padding-bottom:2rem">

      <div style="background:#1a1a1a;border:3px solid #2a2a2a;border-radius:18px;padding:1.2rem;box-shadow:4px 4px 0 #111">
        <div style="font-size:.9rem;font-weight:900;color:#F5A623;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.75rem">${t('choose_language')}</div>
        <div style="display:flex;gap:.5rem">
          <button onclick="state.lang='pt';localStorage.setItem('kaiserplay_lang','pt');render()"
            style="flex:1;padding:.65rem;border-radius:12px;font-size:.88rem;font-weight:800;font-family:var(--font-body);cursor:pointer;border:2px solid ${state.lang==='pt'?'#F5A623':'#333'};background:${state.lang==='pt'?'#F5A623':'#111'};color:${state.lang==='pt'?'#111':'#aaa'};text-shadow:none;display:flex;align-items:center;justify-content:center;gap:.45rem">
            <img src="assets/brasil.png" style="width:18px;height:18px;object-fit:contain;flex-shrink:0"> Português
          </button>
          <button onclick="state.lang='en';localStorage.setItem('kaiserplay_lang','en');render()"
            style="flex:1;padding:.65rem;border-radius:12px;font-size:.88rem;font-weight:800;font-family:var(--font-body);cursor:pointer;border:2px solid ${state.lang==='en'?'#F5A623':'#333'};background:${state.lang==='en'?'#F5A623':'#111'};color:${state.lang==='en'?'#111':'#aaa'};text-shadow:none;display:flex;align-items:center;justify-content:center;gap:.45rem">
            <img src="assets/eua.png" style="width:18px;height:18px;object-fit:contain;flex-shrink:0"> English
          </button>
          <button onclick="state.lang='es';localStorage.setItem('kaiserplay_lang','es');render()"
            style="flex:1;padding:.65rem;border-radius:12px;font-size:.88rem;font-weight:800;font-family:var(--font-body);cursor:pointer;border:2px solid ${state.lang==='es'?'#F5A623':'#333'};background:${state.lang==='es'?'#F5A623':'#111'};color:${state.lang==='es'?'#111':'#aaa'};text-shadow:none;display:flex;align-items:center;justify-content:center;gap:.45rem">
            <img src="assets/spain.png" style="width:18px;height:18px;object-fit:contain;flex-shrink:0"> Español
          </button>
        </div>
      </div>

      <div style="background:#1a1a1a;border:3px solid #2a2a2a;border-radius:18px;padding:1.2rem;box-shadow:4px 4px 0 #111">
        <div style="font-size:.9rem;font-weight:900;color:#a78bfa;text-transform:uppercase;letter-spacing:.1em;margin-bottom:1rem">${t('change_display_name')}</div>
        ${field(nameRankStr,'perfil-nome','text',displayName||nameRankStr,displayName)}
        <button onclick="perfilSalvarNome()"
          style="width:100%;padding:.7rem;background:linear-gradient(180deg,#a78bfa,#7c3aed);border:3px solid #111;border-radius:12px;box-shadow:3px 3px 0 #111;color:#fff;font-size:.88rem;font-weight:900;font-family:var(--font-body);cursor:pointer">
          ${t('save')}
        </button>
        <div id="perfil-nome-msg" style="min-height:1.1rem;font-size:.75rem;font-weight:600;margin-top:.5rem;text-align:center"></div>
      </div>

      <div style="background:#1a1a1a;border:3px solid #2a2a2a;border-radius:18px;padding:1.2rem;box-shadow:4px 4px 0 #111">
        <div style="font-size:.9rem;font-weight:900;color:#60a5fa;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem">${t('change_email_question')}</div>
        <div style="font-size:.84rem;color:#888;margin-bottom:.9rem">${t('do_it_below')}</div>
        ${field(t('new_email'),'perfil-email','email',t('new_email'),'')}
        ${field(t('current_password'),'perfil-email-senha','password',t('current_password'),'')}
        <button onclick="perfilTrocarEmail()"
          style="width:100%;padding:.7rem;background:linear-gradient(180deg,#60a5fa,#2563eb);border:3px solid #111;border-radius:12px;box-shadow:3px 3px 0 #111;color:#fff;font-size:.88rem;font-weight:900;font-family:var(--font-body);cursor:pointer">
          ${updEmailStr}
        </button>
        <div id="perfil-email-msg" style="min-height:1.1rem;font-size:.75rem;font-weight:600;margin-top:.5rem;text-align:center"></div>
      </div>

      <div style="background:#1a1a1a;border:3px solid #2a2a2a;border-radius:18px;padding:1.2rem;box-shadow:4px 4px 0 #111">
        <div style="font-size:.9rem;font-weight:900;color:#4ade80;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem">${t('change_password_question')}</div>
        <div style="font-size:.84rem;color:#888;margin-bottom:.9rem">${t('do_it_below')}</div>
        ${field(t('current_password'),'perfil-senha-atual','password',t('current_password'),'')}
        ${field(t('new_password'),'perfil-senha-nova','password',minCharsStr,'')}
        <button onclick="perfilTrocarSenha()"
          style="width:100%;padding:.7rem;background:linear-gradient(180deg,#4ade80,#16a34a);border:3px solid #111;border-radius:12px;box-shadow:3px 3px 0 #111;color:#fff;font-size:.88rem;font-weight:900;font-family:var(--font-body);cursor:pointer">
          ${updPassStr}
        </button>
        <div id="perfil-senha-msg" style="min-height:1.1rem;font-size:.75rem;font-weight:600;margin-top:.5rem;text-align:center"></div>
      </div>

      <div style="background:#1a1a1a;border:3px solid #2a2a2a;border-radius:18px;padding:1.2rem;box-shadow:4px 4px 0 #111">
        <div style="font-size:.9rem;font-weight:900;color:#888;text-transform:uppercase;letter-spacing:.1em;margin-bottom:1rem">${accStr}</div>
        <button onclick="logoutUser()"
          style="width:100%;padding:.7rem;background:#111;border:2px solid #444;border-radius:12px;color:#aaa;font-size:.88rem;font-weight:700;font-family:var(--font-body);cursor:pointer;margin-bottom:.75rem">
          ${t('sign_out')}
        </button>
        <button onclick="perfilDeletarConta()"
          style="width:100%;padding:.7rem;background:#1a0a0a;border:2px solid #7f1d1d;border-radius:12px;color:#f87171;font-size:.88rem;font-weight:700;font-family:var(--font-body);cursor:pointer">
          ${delStr}
        </button>
        <div id="perfil-conta-msg" style="min-height:1.1rem;font-size:.75rem;font-weight:600;margin-top:.5rem;text-align:center"></div>
      </div>

      <div style="font-size:.68rem;font-weight:900;color:#666;text-transform:uppercase;letter-spacing:.12em;padding-left:.2rem;margin-top:.25rem">${t('section_about')}</div>
      <div style="background:#1a1a1a;border:3px solid #2a2a2a;border-radius:18px;overflow:hidden;box-shadow:4px 4px 0 #111">
        <div onclick="window.open('#LOJA_URL','_blank')" style="display:flex;align-items:center;gap:.85rem;padding:1rem 1.1rem;cursor:pointer;border-bottom:1px solid #222">
          <span style="font-size:1.1rem">⭐</span>
          <span style="flex:1;font-size:.92rem;font-weight:700;color:#e5e5e5">${t('rate_app')}</span>
          <span style="color:#555;font-size:1rem">›</span>
        </div>
        <div onclick="window.open('mailto:kaiserplayviolao@outlook.com','_blank')" style="display:flex;align-items:center;gap:.85rem;padding:1rem 1.1rem;cursor:pointer">
          <span style="font-size:1.1rem">✉️</span>
          <span style="flex:1;font-size:.92rem;font-weight:700;color:#e5e5e5">${t('contact_support')}</span>
          <span style="color:#555;font-size:1rem">›</span>
        </div>
      </div>

      <div style="font-size:.68rem;font-weight:900;color:#666;text-transform:uppercase;letter-spacing:.12em;padding-left:.2rem;margin-top:.25rem">${t('section_legal')}</div>
      <div style="background:#1a1a1a;border:3px solid #2a2a2a;border-radius:18px;overflow:hidden;box-shadow:4px 4px 0 #111">
        <div onclick="window.open('https://kaiserplay.com.br/termos','_blank')" style="display:flex;align-items:center;gap:.85rem;padding:1rem 1.1rem;cursor:pointer;border-bottom:1px solid #222">
          <span style="font-size:1.1rem">📄</span>
          <span style="flex:1;font-size:.92rem;font-weight:700;color:#e5e5e5">${t('terms_conditions')}</span>
          <span style="color:#555;font-size:1rem">›</span>
        </div>
        <div onclick="window.open('https://kaiserplay.com.br/politica-de-privacidade','_blank')" style="display:flex;align-items:center;gap:.85rem;padding:1rem 1.1rem;cursor:pointer">
          <span style="font-size:1.1rem">🔒</span>
          <span style="flex:1;font-size:.92rem;font-weight:700;color:#e5e5e5">${t('privacy_policy')}</span>
          <span style="color:#555;font-size:1rem">›</span>
        </div>
      </div>

    </div>
    <div style="text-align:center;padding:.5rem 0 .25rem">
      <span style="font-size:.62rem;color:#444;font-style:italic">Ícones por <a href="https://flaticon.com" target="_blank" style="color:#444;text-decoration:none">Flaticon</a> (flaticon.com)</span>
    </div>
  `;
}
function saveDisplayName(){
  const name=document.getElementById('display-name-input').value.trim();
  const errEl=document.getElementById('display-name-error');
  if(!name){errEl.textContent=t('enter_display_name');return;}
  auth.currentUser.updateProfile({displayName:name})
    .then(()=>{state.user=auth.currentUser;state.phase='start';render();})
    .catch(()=>{errEl.textContent=t('auth_generic_error');});
}
function perfilSalvarNome(){
  const nome=document.getElementById('perfil-nome').value.trim();
  const msg=document.getElementById('perfil-nome-msg');
  if(!nome){msg.style.color='#f87171';msg.textContent=t('enter_display_name');return;}
  auth.currentUser.updateProfile({displayName:nome})
    .then(()=>{
      state.user=auth.currentUser;
      saveProgress();
      msg.style.color='#4ade80';
      msg.textContent=t('display_name_updated');
    })
    .catch(e=>{msg.style.color='#f87171';msg.textContent=_authError(e.code);});
}
function perfilTrocarEmail(){
  const novoEmail=document.getElementById('perfil-email').value.trim();
  const senha=document.getElementById('perfil-email-senha').value;
  const msg=document.getElementById('perfil-email-msg');
  if(!novoEmail||!senha){msg.style.color='#f87171';msg.textContent=t('fill_all_fields');return;}
  const cred=firebase.auth.EmailAuthProvider.credential(auth.currentUser.email,senha);
  auth.currentUser.reauthenticateWithCredential(cred)
    .then(()=>auth.currentUser.updateEmail(novoEmail))
    .then(()=>{msg.style.color='#4ade80';msg.textContent=t('email_updated');})
    .catch(e=>{msg.style.color='#f87171';msg.textContent=_authError(e.code);});
}
function perfilTrocarSenha(){
  const senhaAtual=document.getElementById('perfil-senha-atual').value;
  const senhaNova=document.getElementById('perfil-senha-nova').value;
  const msg=document.getElementById('perfil-senha-msg');
  if(!senhaAtual||!senhaNova){msg.style.color='#f87171';msg.textContent=t('fill_all_fields');return;}
  const cred=firebase.auth.EmailAuthProvider.credential(auth.currentUser.email,senhaAtual);
  auth.currentUser.reauthenticateWithCredential(cred)
    .then(()=>auth.currentUser.updatePassword(senhaNova))
    .then(()=>{msg.style.color='#4ade80';msg.textContent=t('password_updated');})
    .catch(e=>{msg.style.color='#f87171';msg.textContent=_authError(e.code);});
}
function perfilDeletarConta(){
  const msg=document.getElementById('perfil-conta-msg');
  // Modal com campo de senha mascarado
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:#000a;z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem';
  overlay.innerHTML=`
    <div style="background:#1a1a1a;border:2px solid #f87171;border-radius:16px;padding:1.5rem;max-width:320px;width:100%;text-align:center">
      <div style="font-size:1rem;font-weight:700;color:#f87171;margin-bottom:.5rem">${t('delete_account_confirm')}</div>
      <div style="font-size:.82rem;color:#aaa;margin-bottom:1rem">${t('delete_password_prompt')}</div>
      <input id="_del-senha" type="password" placeholder="Sua senha" style="width:100%;box-sizing:border-box;padding:.6rem .8rem;border-radius:8px;border:1.5px solid #444;background:#111;color:#fff;font-size:.95rem;margin-bottom:1rem">
      <div style="display:flex;gap:.75rem;justify-content:center">
        <button onclick="this.closest('div[style*=fixed]').remove()" style="flex:1;padding:.55rem;border-radius:8px;border:2px solid #555;background:transparent;color:#aaa;font-weight:700;cursor:pointer">${t('btn_cancel')}</button>
        <button id="_del-confirmar" style="flex:1;padding:.55rem;border-radius:8px;border:2px solid #f87171;background:#f871711a;color:#f87171;font-weight:700;cursor:pointer">${t('btn_delete')}</button>
      </div>
      <div id="_del-msg" style="font-size:.8rem;margin-top:.75rem;min-height:1.2em"></div>
    </div>`;
  document.body.appendChild(overlay);
  const senhaInput=overlay.querySelector('#_del-senha');
  const delMsg=overlay.querySelector('#_del-msg');
  senhaInput.focus();
  overlay.querySelector('#_del-confirmar').onclick=()=>{
    const senha=senhaInput.value;
    if(!senha){delMsg.style.color='#f87171';delMsg.textContent=t('password_required');return;}
    const cred=firebase.auth.EmailAuthProvider.credential(auth.currentUser.email,senha);
    auth.currentUser.reauthenticateWithCredential(cred)
      .then(()=>db.collection('players').doc(auth.currentUser.uid).delete())
      .then(()=>auth.currentUser.delete())
      .then(()=>overlay.remove())
      .catch(e=>{delMsg.style.color='#f87171';delMsg.textContent=_authError(e.code);});
  };
}

// ── Sistema de avaliação ──────────────────────────────────────
function checkRatingPrompt(lvlN){
  if(state.ratingDone||state.ratingSkippedAt>=30)return;
  const show=(lvlN>=10&&state.ratingSkippedAt===0)||(lvlN>=20&&state.ratingSkippedAt===10)||(lvlN>=30&&state.ratingSkippedAt===20);
  if(show)setTimeout(showRatingPrompt,2500);
}
function showRatingPrompt(){
  if(state.ratingDone||document.getElementById('_rating-overlay'))return;
  const overlay=document.createElement('div');
  overlay.id='_rating-overlay';
  overlay.style.cssText='position:fixed;inset:0;background:#000a;z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem';
  overlay.innerHTML=`
    <div style="background:#1a1a1a;border:3px solid #F5A623;border-radius:18px;padding:1.5rem;max-width:300px;width:100%;text-align:center;box-shadow:6px 6px 0 #111">
      <div style="font-size:.95rem;font-weight:900;color:#F5A623;margin-bottom:.5rem">${t('rate_popup_title')}</div>
      <div style="font-size:.82rem;color:#999;margin-bottom:1.2rem;line-height:1.5">${t('rate_popup_body')}</div>
      <button id="_rate-now" style="width:100%;padding:.75rem;background:linear-gradient(180deg,#ffbe4f,#F5A623);border:3px solid #111;border-radius:12px;box-shadow:3px 3px 0 #111;color:#111;text-shadow:none;font-size:.9rem;font-weight:900;font-family:var(--font-body);cursor:pointer;margin-bottom:.6rem">${t('rate_now')}</button>
      <button id="_rate-later" style="width:100%;padding:.4rem;background:transparent;border:none;color:#555;font-size:.78rem;font-weight:600;font-family:var(--font-body);cursor:pointer;text-decoration:underline">${t('rate_later')}</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#_rate-now').onclick=()=>{
    state.ratingDone=true;
    saveProgress();
    overlay.remove();
    window.open('#LOJA_URL','_blank'); // substituir pela URL da loja quando publicado
  };
  overlay.querySelector('#_rate-later').onclick=()=>{
    state.ratingSkippedAt=state.ratingSkippedAt===0?10:state.ratingSkippedAt===10?20:30;
    saveProgress();
    overlay.remove();
  };
}

// ── Streak diário ─────────────────────────────────────────────

