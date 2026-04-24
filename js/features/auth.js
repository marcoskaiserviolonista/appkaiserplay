// ── Render: Login ─────────────────────────────────────────────
function renderLogin(){
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70vh;gap:1.25rem;padding:1.5rem">
      <img src="assets/LOGO-APP-3.png" style="height:80px;object-fit:contain;max-width:320px" onerror="this.style.display='none'">
      <div style="width:100%;max-width:360px;background:#1a1a1a;border:3px solid #2a2a2a;border-radius:20px;padding:1.5rem;box-shadow:5px 5px 0 #111">
        <div style="font-size:.68rem;font-weight:800;color:#888;text-transform:uppercase;letter-spacing:.12em;margin-bottom:1.2rem;text-align:center">${t('sign_in')}</div>
        <input id="login-email" type="email" placeholder="${t('email')}" autocomplete="email"
          style="width:100%;padding:.75rem 1rem;background:#111;border:2px solid #333;border-radius:12px;color:#fff;font-size:.92rem;font-family:var(--font-body);margin-bottom:.75rem;outline:none;box-sizing:border-box">
        <input id="login-password" type="password" placeholder="${t('password')}" autocomplete="current-password"
          style="width:100%;padding:.75rem 1rem;background:#111;border:2px solid #333;border-radius:12px;color:#fff;font-size:.92rem;font-family:var(--font-body);margin-bottom:.4rem;outline:none;box-sizing:border-box">
        <div style="text-align:right;margin-bottom:.75rem">
          <span onclick="state.phase='forgot_password';render()" style="font-size:.78rem;color:#888;font-weight:600;text-decoration:underline;cursor:pointer">${t('forgot_password')}</span>
        </div>
        <div id="login-error" style="min-height:1.2rem;font-size:.78rem;color:#f87171;font-weight:600;margin-bottom:.75rem;text-align:center"></div>
        <button onclick="loginUser()"
          style="width:100%;padding:.85rem;background:linear-gradient(180deg,#ffbe4f,#F5A623);border:3px solid #111;border-radius:14px;box-shadow:4px 4px 0 #111;color:#fff;font-size:1rem;font-weight:900;font-family:var(--font-body);cursor:pointer;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8);margin-bottom:1rem">
          ${t('sign_in')}
        </button>
        <div style="text-align:center;font-size:.82rem;color:#666;font-weight:600;margin-bottom:.6rem">${t('no_account')}</div>
        <button onclick="state.phase='signup';render()"
          style="width:100%;padding:.75rem;background:linear-gradient(180deg,#1a2a3a,#0e1a2a);border:3px solid #60dcff88;border-radius:14px;box-shadow:4px 4px 0 #0a1520;color:#60dcff;font-size:.9rem;font-weight:800;font-family:var(--font-body);cursor:pointer;text-shadow:0 0 10px #60dcff44">
          ${t('create_account')}
        </button>
        <button onclick="state.isGuest=true;state.guestExerciseCount=0;state.guestNextPrompt=1;state.phase='start';render()"
          style="width:100%;padding:.5rem;background:transparent;border:none;color:#555;font-size:.78rem;font-weight:600;font-family:var(--font-body);cursor:pointer;margin-top:.25rem;text-decoration:underline">
          ${t('play_as_guest')}
        </button>
      </div>
      <div style="text-align:center;font-size:.68rem;color:#444;line-height:1.7;padding:0 .5rem;max-width:320px">
        ${t('terms_agree')} <a href="https://kaiserplay.com.br/termos" target="_blank" style="color:#F5A623;text-decoration:underline">${t('terms_link')}</a> ${t('terms_and')} <a href="https://kaiserplay.com.br/politica-de-privacidade" target="_blank" style="color:#F5A623;text-decoration:underline">${t('privacy_link')}</a>.
      </div>
    </div>
  `;
}

function renderSignup(){
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70vh;gap:1.25rem;padding:1.5rem">
      <img src="assets/LOGO-APP-3.png" style="height:80px;object-fit:contain;max-width:320px" onerror="this.style.display='none'">
      <div style="width:100%;max-width:360px;background:#1a1a1a;border:3px solid #2a2a2a;border-radius:20px;padding:1.5rem;box-shadow:5px 5px 0 #111">
        <div style="font-size:.68rem;font-weight:800;color:#888;text-transform:uppercase;letter-spacing:.12em;margin-bottom:1.2rem;text-align:center">${t('signup_title')}</div>
        <input id="signup-email" type="email" placeholder="${t('email')}" autocomplete="email"
          style="width:100%;padding:.75rem 1rem;background:#111;border:2px solid #333;border-radius:12px;color:#fff;font-size:.92rem;font-family:var(--font-body);margin-bottom:.75rem;outline:none;box-sizing:border-box">
        <input id="signup-password" type="password" placeholder="${t('password_min')}" autocomplete="new-password"
          style="width:100%;padding:.75rem 1rem;background:#111;border:2px solid #333;border-radius:12px;color:#fff;font-size:.92rem;font-family:var(--font-body);margin-bottom:.75rem;outline:none;box-sizing:border-box">
        <input id="signup-password-confirm" type="password" placeholder="${t('confirm_password')}" autocomplete="new-password"
          style="width:100%;padding:.75rem 1rem;background:#111;border:2px solid #333;border-radius:12px;color:#fff;font-size:.92rem;font-family:var(--font-body);margin-bottom:.75rem;outline:none;box-sizing:border-box">
        <input id="signup-name" type="text" placeholder="${t('display_name')}" maxlength="30" autocomplete="nickname"
          style="width:100%;padding:.75rem 1rem;background:#111;border:2px solid #333;border-radius:12px;color:#fff;font-size:.92rem;font-family:var(--font-body);margin-bottom:.5rem;outline:none;box-sizing:border-box">
        <div style="font-size:.7rem;color:#555;margin-bottom:.75rem;padding-left:.25rem">${t('display_name_hint')}</div>
        <div id="signup-error" style="min-height:1.2rem;font-size:.78rem;color:#f87171;font-weight:600;margin-bottom:.75rem;text-align:center"></div>
        <button onclick="signupUser()"
          style="width:100%;padding:.85rem;background:linear-gradient(180deg,#ffbe4f,#F5A623);border:3px solid #111;border-radius:14px;box-shadow:4px 4px 0 #111;color:#fff;font-size:1rem;font-weight:900;font-family:var(--font-body);cursor:pointer;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8);margin-bottom:1rem">
          ${t('signup_button')}
        </button>
        <button onclick="state.phase='login';render()"
          style="width:100%;padding:.75rem;background:linear-gradient(180deg,#1a2a3a,#0e1a2a);border:3px solid #60dcff88;border-radius:14px;box-shadow:4px 4px 0 #0a1520;color:#60dcff;font-size:.85rem;font-weight:800;font-family:var(--font-body);cursor:pointer;text-shadow:0 0 10px #60dcff44">
          ${t('already_have_account')}
        </button>
      </div>
      <div style="text-align:center;font-size:.68rem;color:#444;line-height:1.7;padding:0 .5rem;max-width:320px">
        ${t('terms_agree')} <a href="https://kaiserplay.com.br/termos" target="_blank" style="color:#F5A623;text-decoration:underline">${t('terms_link')}</a> ${t('terms_and')} <a href="https://kaiserplay.com.br/politica-de-privacidade" target="_blank" style="color:#F5A623;text-decoration:underline">${t('privacy_link')}</a>.
      </div>
    </div>
  `;
}

function renderForgotPassword(){
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70vh;gap:1.25rem;padding:1.5rem">
      <img src="assets/LOGO-APP-3.png" style="height:80px;object-fit:contain;max-width:320px" onerror="this.style.display='none'">
      <div style="width:100%;max-width:360px;background:#1a1a1a;border:3px solid #2a2a2a;border-radius:20px;padding:1.5rem;box-shadow:5px 5px 0 #111">
        <div style="font-size:1.35rem;font-weight:900;color:#fff;font-family:var(--font-title);margin-bottom:.75rem;text-align:center">${t('recover_password_title')}</div>
        <div style="font-size:.85rem;color:#aaa;line-height:1.55;margin-bottom:1.2rem;text-align:center">${t('recover_password_desc')}</div>
        <input id="forgot-email" type="email" placeholder="${t('email')}" autocomplete="email"
          style="width:100%;padding:.75rem 1rem;background:#111;border:2px solid #333;border-radius:12px;color:#fff;font-size:.92rem;font-family:var(--font-body);margin-bottom:.75rem;outline:none;box-sizing:border-box">
        <div id="forgot-error" style="min-height:1.2rem;font-size:.78rem;color:#f87171;font-weight:600;margin-bottom:.75rem;text-align:center"></div>
        <button onclick="forgotPassword()"
          style="width:100%;padding:.85rem;background:linear-gradient(180deg,#ffbe4f,#F5A623);border:3px solid #111;border-radius:14px;box-shadow:4px 4px 0 #111;color:#fff;font-size:1rem;font-weight:900;font-family:var(--font-body);cursor:pointer;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8);margin-bottom:1rem">
          ${t('send_instructions')}
        </button>
        <button onclick="state.phase='login';render()"
          style="width:100%;padding:.65rem;background:transparent;border:none;color:#666;font-size:.85rem;font-weight:600;font-family:var(--font-body);cursor:pointer">
          ${t('back_to_signin')}
        </button>
      </div>
    </div>
  `;
}

function renderSetDisplayName(){
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70vh;gap:1.25rem;padding:1.5rem">
      <img src="assets/LOGO-APP-3.png" style="height:80px;object-fit:contain;max-width:320px" onerror="this.style.display='none'">
      <div style="width:100%;max-width:360px;background:#1a1a1a;border:3px solid #2a2a2a;border-radius:20px;padding:1.5rem;box-shadow:5px 5px 0 #111">
        <div style="font-size:.68rem;font-weight:800;color:#888;text-transform:uppercase;letter-spacing:.12em;margin-bottom:.4rem;text-align:center">${t('account_created')}</div>
        <div style="font-size:.88rem;color:#ddd;font-weight:500;margin-bottom:1.2rem;text-align:center;line-height:1.5">${t('choose_display_name')}</div>
        <input id="display-name-input" type="text" placeholder="${t('display_name')}" maxlength="30" autocomplete="nickname"
          style="width:100%;padding:.75rem 1rem;background:#111;border:2px solid #333;border-radius:12px;color:#fff;font-size:.92rem;font-family:var(--font-body);margin-bottom:.5rem;outline:none;box-sizing:border-box">
        <div id="display-name-error" style="min-height:1.2rem;font-size:.78rem;color:#f87171;font-weight:600;margin-bottom:.75rem;text-align:center"></div>
        <button onclick="saveDisplayName()"
          style="width:100%;padding:.85rem;background:linear-gradient(180deg,#ffbe4f,#F5A623);border:3px solid #111;border-radius:14px;box-shadow:4px 4px 0 #111;color:#fff;font-size:1rem;font-weight:900;font-family:var(--font-body);cursor:pointer;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8)">
          ${t('save_and_enter')}
        </button>
      </div>
    </div>
  `;
}

// ── Render: Game ──────────────────────────────────────────────
// ── Auth ──────────────────────────────────────────────────────
function loginUser(){
  const email=document.getElementById('login-email').value.trim();
  const password=document.getElementById('login-password').value;
  const errEl=document.getElementById('login-error');
  errEl.textContent='';
  if(!email||!password){errEl.textContent=t('fill_all_fields');return;}
  auth.signInWithEmailAndPassword(email,password)
    .catch(e=>{errEl.textContent=_authError(e.code);});
}
function forgotPassword(){
  const email=document.getElementById('forgot-email').value.trim();
  const errEl=document.getElementById('forgot-error');
  errEl.style.color='';
  if(!email){errEl.textContent=t('enter_email_first');return;}
  auth.sendPasswordResetEmail(email)
    .then(()=>{errEl.style.color='#4ade80';errEl.textContent=t('reset_email_sent');})
    .catch(e=>{errEl.textContent=_authError(e.code);});
}
async function signupUser(){
  const email=document.getElementById('signup-email').value.trim();
  const password=document.getElementById('signup-password').value;
  const passwordConfirm=document.getElementById('signup-password-confirm').value;
  const name=document.getElementById('signup-name').value.trim();
  const errEl=document.getElementById('signup-error');
  errEl.textContent='';
  if(!email||!password||!passwordConfirm||!name){errEl.textContent=t('fill_all_fields');return;}
  if(password.length<6){errEl.textContent=t('password_too_short');return;}
  if(password!==passwordConfirm){errEl.textContent=t('passwords_dont_match');return;}
  try{
    const cred=await auth.createUserWithEmailAndPassword(email,password);
    await cred.user.updateProfile({displayName:name});
    state.isGuest=false;state.user=auth.currentUser;state.phase='start';render();
  }catch(e){errEl.textContent=_authError(e.code);}
}
function logoutUser(){
  if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  auth.signOut();
}
function _authError(code){
  const map={
    'auth/invalid-email':t('auth_invalid_email'),
    'auth/user-disabled':t('auth_user_disabled'),
    'auth/user-not-found':t('auth_user_not_found'),
    'auth/wrong-password':t('auth_wrong_password'),
    'auth/email-already-in-use':t('auth_email_in_use'),
    'auth/weak-password':t('auth_weak_password'),
    'auth/too-many-requests':t('auth_too_many_requests'),
    'auth/network-request-failed':t('auth_network_error'),
    'auth/invalid-credential':t('auth_wrong_password'),
  };
  return map[code]||t('auth_generic_error');
}

