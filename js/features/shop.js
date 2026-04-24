function renderComprar(){
  return `
    <div style="width:100%;max-width:520px;display:flex;align-items:center;margin-bottom:1.5rem;gap:.75rem">
      <button class="back-btn" onclick="playClickSfx('back');state.phase='treino_focado_menu';render()">${t('back_btn')}</button>
      <span style="font-size:1.05rem;font-weight:900;color:#f0f0f0">${t('comprar_title')}</span>
    </div>
    <div style="width:100%;max-width:520px;background:linear-gradient(160deg,#061208,#0d1f10);border:2px solid #22c55e55;border-radius:16px;padding:1.4rem 1.2rem;margin-top:.5rem;text-align:center;box-shadow:0 0 16px #22c55e14">
      <div style="font-size:1.15rem;font-weight:900;color:#fff;margin-bottom:.5rem;letter-spacing:.01em">${t('unlock_all_trainings')}</div>
      <div style="font-size:.84rem;color:#e8f5e9;line-height:1.6;margin-bottom:1rem">${t('unlock_all_desc')}</div>
      <div style="text-align:center;margin-bottom:.55rem">
        <span style="display:inline-block;background:#16a34a22;border:1.5px solid #4ade8066;border-radius:20px;padding:.22rem .9rem;font-size:.72rem;font-weight:800;color:#4ade80;letter-spacing:.05em;text-transform:uppercase">${state.lang==='en'?'✓ One-time payment · No subscription':state.lang==='es'?'✓ Pago único · Sin suscripción':'✓ Pagamento único · Sem mensalidade'}</span>
      </div>
      <div style="font-size:1.9rem;font-weight:900;color:#fff;letter-spacing:-.01em;margin-bottom:1.1rem;text-shadow:0 0 10px #22c55e44">${state.lang!=='pt'?'🇧🇷 ':''}R$ 49,90</div>
      <button onclick="showToast(t('coming_soon'),t('coming_soon_body'))"
        style="width:100%;padding:.95rem;background:linear-gradient(135deg,#15803d,#166534);border:3px solid #111;border-radius:12px;font-family:var(--font-body);font-size:1rem;font-weight:900;color:#fff;cursor:pointer;box-shadow:3px 3px 0 #111;letter-spacing:.02em;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8)">
        ${t('unlock_btn')}
      </button>
      <div style="font-size:.68rem;color:#b0c8b4;margin-top:.65rem">${t('payment_info')}</div>
    </div>
  `;
}


function renderLoja(){
  const podeConverter=state.notas>=100;
  const ganharei=Math.floor(state.notas/100);
  const violaoEq=VIOLOES.find(v=>v.id===state.violaoEquipado)||VIOLOES[0];

  return `
    <div class="back-row">
      <button class="back-btn" onclick="playClickSfx('back');state.phase='start';render()">${t('back_btn')}</button>
      <span class="page-title">${t('shop_title')}</span>
    </div>

    <div style="display:flex;gap:.5rem;width:100%;max-width:520px;margin-bottom:.75rem">
      <div style="flex:1;background:#1a1a1a;border:2px solid #2a2a2a;border-radius:12px;padding:.5rem .6rem;text-align:center">
        <div style="font-size:.6rem;color:#555;text-transform:uppercase;letter-spacing:.08em">${t('points')}</div>
        <div style="font-size:.88rem;font-weight:900;color:#f0f0f0">⭐ ${state.notas}</div>
      </div>
      <div style="flex:1;background:#1a1a1a;border:2px solid #2a2a2a;border-radius:12px;padding:.5rem .6rem;text-align:center">
        <div style="font-size:.6rem;color:#555;text-transform:uppercase;letter-spacing:.08em">${t('coins')}</div>
        <div style="font-size:.88rem;font-weight:900;color:#F5A623"><img src='assets/moeda.png' style='width:15px;height:15px;vertical-align:middle;object-fit:contain'> ${state.moedas}</div>
      </div>
      <div style="flex:1;background:#1a1a1a;border:2px solid #2a2a2a;border-radius:12px;padding:.5rem .6rem;text-align:center">
        <div style="font-size:.6rem;color:#555;text-transform:uppercase;letter-spacing:.08em">${t('diamonds')}</div>
        <div style="font-size:.88rem;font-weight:900;color:#60dcff">💎 ${state.diamantes}</div>
      </div>
    </div>

    <button class="exchange-btn" onclick="exchangePoints(this)" ${!podeConverter?'disabled':''} style="margin-bottom:.4rem">
      <div class="exchange-title">${t('exchange_points')}</div>
      <div class="exchange-sub">${podeConverter?`${t('points_to_coins_rate')} <img src='assets/moeda.png' style='width:13px;height:13px;vertical-align:middle;object-fit:contain'>`:t('need_100_points')}</div>
    </button>
    <button class="exchange-btn" onclick="exchangeDiamonds(this)" ${state.diamantes<1?'disabled':''} style="background:linear-gradient(180deg,#0d2a3d,#0a1a2e);border-color:#60dcff;margin-bottom:.9rem;${state.diamantes<1?'opacity:.4;cursor:not-allowed':''}">
      <div class="exchange-title" style="color:#60dcff">💎 ${t('exchange_diamonds')}</div>
      <div class="exchange-sub" style="color:#a0d8ef">${state.diamantes>=1?`<span style="display:inline-flex;align-items:center;gap:.3rem">💎 ${state.diamantes} → <img src='assets/moeda.png' style='width:13px;height:13px;vertical-align:middle;object-fit:contain'> ${state.diamantes*10}</span>`:t('not_enough_diamonds')}</div>
    </button>

    ${LOJA_ITEMS.filter(item=>!state.inventario.includes(item.id)).length>0?`
    <div class="section-title">${t('educational_materials')}</div>
    <div class="loja-tip">${state.lang==='en'?'After purchase, the material will be available in your inventory for download.':state.lang==='es'?'Tras la compra, el material estará disponible en tu inventario para descargar.':'Após a compra, o material ficará disponível no seu inventário para download.'}</div>
    ${LOJA_ITEMS.filter(item=>!state.inventario.includes(item.id)).map(item=>{
      if(item.cupom){
        const canBuy=state.moedas>=item.preco;
        return `<div style="width:100%;max-width:520px;box-sizing:border-box;background:linear-gradient(160deg,#1a1400,#1a1000);border:2.5px solid #F5A62388;border-radius:18px;padding:1.3rem 1.1rem 1.1rem;display:flex;flex-direction:column;align-items:center;gap:.7rem;margin-bottom:.6rem;box-shadow:0 0 24px #F5A62322">
          <img src="assets/logo-kaiserplay-transp.png" style="width:60%;max-width:180px;object-fit:contain" onerror="this.style.display='none'">
          <img src="${item.img}" style="width:36%;max-width:110px;object-fit:contain;border-radius:10px;filter:drop-shadow(0 4px 14px #F5A62366)" onerror="this.outerHTML='<span style=\'font-size:3rem\'>🏷️</span>'">
          <div style="text-align:center">
            <div style="font-size:1rem;font-weight:900;color:#F5A623;letter-spacing:.01em">${itemName(item)}</div>
            <div style="font-size:.8rem;color:#aaa;margin-top:.2rem">${itemDesc(item)}</div>
          </div>
          <button class="item-buy" onclick="comprarItem(${item.id})" ${canBuy?'':'disabled'} style="width:100%;box-sizing:border-box;padding:.7rem;font-size:.9rem;${canBuy?'':'background:#1a1a1a;color:#444;border-color:#2a2a2a;box-shadow:none;cursor:not-allowed'}">
            <img src='assets/moeda.png' style='width:14px;height:14px;vertical-align:middle;object-fit:contain'> ${item.preco.toLocaleString()}
          </button>
        </div>`;
      }
      return `<div class="loja-item">
        <div class="item-icon"><img src="${item.img}" style="width:100%;height:100%;object-fit:contain;border-radius:8px" onerror="this.outerHTML='<span>${item.icon}</span>'"></div>
        <div class="item-info">
          <div class="item-name">${itemName(item)}</div>
          <div class="item-desc">${itemDesc(item)}</div>
        </div>
        <button class="item-buy" onclick="comprarItem(${item.id})" ${state.moedas<item.preco?'disabled':''} style="${state.moedas<item.preco?'background:#1a1a1a;color:#444;border-color:#2a2a2a;box-shadow:none;cursor:not-allowed':''}">
          <img src='assets/moeda.png' style='width:13px;height:13px;vertical-align:middle;object-fit:contain'> ${item.preco}
        </button>
      </div>`;
    }).join('')}`:''
    }

    <div class="section-title" style="margin-top:1rem">${t('guitars')}</div>
    <div class="loja-tip">${state.lang==='en'?'Items that will help you progress faster in the game.':state.lang==='es'?'Artículos que te ayudarán a mejorar más rápido en el juego.':'Itens que vão te ajudar a evoluir mais rápido no jogo.'}</div>

    <div class="shop-cards-grid">
      ${VIOLOES.filter(v=>!state.violoesComprados.includes(v.id)).map(v=>{
          const locked=state.moedas<v.preco;
          const badgeBg=v.cor==='#888'?'#2a2a2a':v.cor;
          const badgeColor=v.cor==='#888'?'#aaa':'#111';
          return `
          <div class="shop-card ${locked?'shop-card--locked':''}" style="--card-color:${v.cor}" onclick="openShopModal('violao','${v.id}')">
            <div class="shop-card-badge" style="background:${badgeBg};color:${badgeColor}">${v.pct>0?`+${Math.round(v.pct*100)}%`:'Padrão'}</div>
            ${v.doubleDiamonds?`<div class="shop-card-badge2">💎×2</div>`:''}
            <div class="shop-card-img-wrap">
              <img src="${v.img}" class="shop-card-img" onerror="this.style.opacity='.3'">
            </div>
            <div class="shop-card-info">
              <div class="shop-card-name" style="color:${v.cor}">${guitarName(v)}</div>
              ${v.pct>0?`<div class="shop-card-xp-mini" style="background:${v.cor}18;border-color:${v.cor}44;color:${v.cor}">⭐ +${Math.round(v.pct*100)}% ${t('points')}</div>`:''}
              <div class="shop-card-price-mini"><img src='assets/moeda.png' style='width:11px;height:11px;vertical-align:middle;object-fit:contain'> ${v.preco.toLocaleString()}</div>
            </div>
          </div>`;
        }).join('')}
    </div>
    ${VIOLOES.filter(v=>!state.violoesComprados.includes(v.id)).length===0
      ?`<div style="color:#444;font-size:.82rem;padding:.5rem 0 1rem">${state.lang==='en'?'You own all guitars! 🎸':state.lang==='es'?'¡Posees todas las guitarras! 🎸':'Você possui todos os violões! 🎸'}</div>`
      :''}
  `;
}

// ── Render: Inventário ────────────────────────────────────────
function renderInventario(){
  const violaoEq = VIOLOES.find(v=>v.id===state.violaoEquipado)||VIOLOES[0];

  function slot(tipo, item, cor, extra){
    return `
      <div style="background:#1a1a1a;border:2px solid ${cor}55;border-radius:14px;padding:.9rem 1rem;display:flex;align-items:center;gap:.9rem;width:100%;max-width:520px;box-sizing:border-box">
        <div style="width:56px;height:56px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#111;border-radius:10px;border:1.5px solid ${cor}44">
          <img src="${item.img}" style="width:48px;height:48px;object-fit:contain" onerror="this.outerHTML='<span style=\'font-size:1.8rem\'>🎸</span>'">
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:.68rem;color:#555;text-transform:uppercase;letter-spacing:.08em">${tipo}</div>
          <div style="font-size:.92rem;font-weight:900;color:${cor}">${itemName(item)}</div>
          <div style="font-size:.72rem;color:#888;margin-top:.15rem">${extra}</div>
        </div>
        <button onclick="playClickSfx('nav');if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}state.phase='loja';render()" style="background:#252525;border:1.5px solid #3a3a3a;border-radius:9px;color:#aaa;font-size:.72rem;font-weight:700;padding:.4rem .7rem;cursor:pointer;white-space:nowrap">${t('swap_in_shop')}</button>
      </div>`;
  }

  const violaoExtra = violaoEq.pct>0 ? `+${Math.round(violaoEq.pct*100)}% ${state.lang==='en'?'XP per correct answer':state.lang==='es'?'XP por acierto':'de XP por acerto'}` : (state.lang==='en'?'No bonus':state.lang==='es'?'Sin bonificación':'Sem bônus');

  const eduItems = state.inventario.filter(id=>LOJA_ITEMS.find(x=>x.id===id));

  return `
    <div class="back-row">
      <button class="back-btn" onclick="playClickSfx('back');state.phase='start';render()">${t('back_btn')}</button>
      <span class="page-title">${t('inventory')}</span>
    </div>

    <div class="section-title">${t('equipment_section')}</div>

    <div class="inv-guitar-slot" style="border-color:${violaoEq.cor}55">
      <div style="font-size:.62rem;color:#555;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.3rem">${t('equipped_guitar_label')}</div>
      <div class="inv-guitar-img-wrap">
        <img src="${violaoEq.img}" class="inv-guitar-img" onerror="this.style.opacity='.2'">
      </div>
      <div style="padding:.6rem .2rem .2rem;text-align:center">
        <div style="font-size:1.1rem;font-weight:900;color:${violaoEq.cor}">${violaoEq.nome}</div>
        <div style="font-size:.78rem;color:#888;margin:.2rem 0 .6rem">${violaoExtra}</div>
      </div>
      <button onclick="playClickSfx('nav');if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}state.phase='loja';render()" style="width:100%;padding:.55rem 0;background:#1e1e1e;border:2px solid #333;border-radius:11px;color:#aaa;font-size:.78rem;font-weight:700;cursor:pointer">${t('swap_in_shop')}</button>
    </div>


    <div class="section-title" style="margin-top:.4rem">${t('available_guitars')}</div>
    ${state.violoesComprados.filter(id=>id!==state.violaoEquipado).length === 0
      ? `<div style="color:#444;font-size:.8rem;padding:.5rem 0">${t('no_other_guitars')}</div>`
      : state.violoesComprados.filter(id=>id!==state.violaoEquipado).map(id=>{
          const v=VIOLOES.find(x=>x.id===id);
          return `<div class="loja-item" style="border-color:${v.cor}44">
            <div class="item-icon"><img src="${v.img}" style="width:100%;height:100%;object-fit:contain" onerror="this.outerHTML='<span style=\'font-size:1.8rem\'>🎸</span>'"></div>
            <div class="item-info"><div class="item-name" style="color:${v.cor}">${guitarName(v)}</div><div class="item-desc">${guitarDesc(v)}</div></div>
            <button class="item-buy" onclick="equiparViolao('${v.id}')" style="background:linear-gradient(180deg,#60dcff,#3aaccc);color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8)">${t('equip')}</button>
          </div>`;
        }).join('')}


    <div class="section-title" style="margin-top:.4rem">${t('educational_materials')}</div>
    ${eduItems.length===0
      ? `<div style="color:#444;font-size:.8rem;padding:.5rem 0">${t('no_items_yet')}</div>`
      : eduItems.map(id=>{
          const item=LOJA_ITEMS.find(x=>x.id===id);
          const isCupom=!!item.cupom;
          if(isCupom) return `<div class="loja-item" style="flex-direction:column;align-items:center;text-align:center;padding:1.25rem 1.1rem;gap:.75rem">
            <img src="assets/logo-kaiserplay-transp.png" style="width:65%;max-width:190px;object-fit:contain" onerror="this.outerHTML='<span style=\'font-size:2rem\'>🎓</span>'">
            <div><div class="item-name">${itemName(item)}</div><div class="item-desc">${itemDesc(item)}</div></div>
            <button class="item-buy" style="background:#1a2a1a;border-color:#22c55e;color:#4ade80;width:100%;box-sizing:border-box" onclick="downloadMaterial(${item.id})">${t('coupon_btn')}</button>
          </div>`;
          return `<div class="loja-item">
            <div class="item-icon"><img src="${item.img}" style="width:100%;height:100%;object-fit:contain;border-radius:8px" onerror="this.outerHTML='<span>${item.icon}</span>'"></div>
            <div class="item-info"><div class="item-name">${itemName(item)}</div><div class="item-desc">${itemDesc(item)}</div></div>
            <button class="item-buy" style="background:#1a2a1a;border-color:#22c55e;color:#4ade80" onclick="downloadMaterial(${item.id})">${t('download_btn')}</button>
          </div>`;
        }).join('')}
  `;
}


// ── Render: Níveis ───────────────────────────────────────────
// ── Modal de Confirmação de Compra ────────────────────────────
let confirmModal=null;
let _pendingConfirm=null;
function _executarCompra(){
  if(_pendingConfirm){_pendingConfirm();_pendingConfirm=null;}
  if(confirmModal){confirmModal.remove();confirmModal=null;}
}
function _cancelarCompra(){
  _pendingConfirm=null;
  if(confirmModal){confirmModal.remove();confirmModal=null;}
}
function confirmarCompra({nome, preco, img, icon, onConfirm}){
  if(confirmModal){confirmModal.remove();confirmModal=null;}
  _pendingConfirm=onConfirm;
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.75);display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(3px);';
  overlay.onclick=e=>{if(e.target===overlay)_cancelarCompra();};

  overlay.innerHTML=`
    <div style="width:100%;max-width:520px;background:#1a1a1a;border:3px solid #2a2a2a;border-radius:22px 22px 0 0;padding:1.5rem 1.4rem 2.2rem;box-shadow:0 -8px 40px rgba(0,0,0,.6);animation:slideUp .22s ease">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.2rem">
        <div style="width:52px;height:52px;flex-shrink:0;background:#111;border:2px solid #2a2a2a;border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden">
          ${img
            ? `<img src="${img}" style="width:44px;height:44px;object-fit:contain" onerror="this.outerHTML='<span style=\\'font-size:1.6rem\\'>${icon||'🛒'}</span>'">`
            : `<span style="font-size:1.6rem">${icon||'🛒'}</span>`}
        </div>
        <div style="flex:1">
          <div style="font-size:.68rem;color:#666;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.2rem">${t('confirm_purchase')}</div>
          <div style="font-size:1rem;font-weight:900;color:#f0f0f0;line-height:1.3">${nome}</div>
        </div>
      </div>
      <div style="background:#111;border:2px solid #2a2a2a;border-radius:12px;padding:.75rem 1rem;margin-bottom:1.3rem;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:.82rem;color:#888;font-weight:600">${t('purchase_value')}</span>
        <div style="display:flex;align-items:center;gap:.4rem">
          <img src="assets/moeda.png" style="width:18px;height:18px;object-fit:contain">
          <span style="font-size:1.1rem;font-weight:900;color:#F5A623">${preco.toLocaleString()}</span>
        </div>
      </div>
      <div style="font-size:.9rem;color:#bbb;text-align:center;margin-bottom:1.3rem;font-weight:500">
        ${t('are_you_sure')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
        <button onclick="playClickSfx('back');_cancelarCompra()"
          style="padding:.85rem;border-radius:14px;border:3px solid #1a1a1a;background:linear-gradient(180deg,#f87171,#dc2626);color:#fff;font-family:var(--font-body);font-size:.95rem;font-weight:800;cursor:pointer;box-shadow:0 4px 0 #1a1a1a;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8);-webkit-tap-highlight-color:transparent">
          ${t('no_btn')}
        </button>
        <button onclick="_executarCompra()"
          style="padding:.85rem;border-radius:14px;border:3px solid #1a1a1a;background:linear-gradient(180deg,#f5aa2a,#d4720a);color:#fff;font-family:var(--font-body);font-size:.95rem;font-weight:900;cursor:pointer;box-shadow:0 4px 0 #1a1a1a;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8);-webkit-tap-highlight-color:transparent">
          ${t('yes_buy')}
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  confirmModal=overlay;
  playClickSfx('soft');
}



let boughtModal=null;
function showBoughtModal({img, icon, nome, isEquipable}){
  if(boughtModal){boughtModal.remove();boughtModal=null;}
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;z-index:9600;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:1.5rem;backdrop-filter:blur(4px);';
  overlay.innerHTML=`
    <div style="background:#1a1a1a;border:3px solid #22c55e;border-radius:22px;padding:2rem 1.5rem 1.5rem;width:100%;max-width:380px;box-shadow:0 0 40px rgba(34,197,94,.15),6px 6px 0 #111;text-align:center">
      <div style="width:96px;height:96px;margin:0 auto 1.1rem;background:#111;border:3px solid #2a2a2a;border-radius:18px;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.5)">
        ${img
          ? `<img src="${img}" style="width:80px;height:80px;object-fit:contain" onerror="this.outerHTML='<span style=\\'font-size:2.8rem\\'>${icon||'🎁'}</span>'">`
          : `<span style="font-size:2.8rem">${icon||'🎁'}</span>`}
      </div>
      <div style="font-size:.7rem;font-weight:800;color:#22c55e;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem">✓ ${t('bought_modal_title')}</div>
      <div style="font-size:1rem;font-weight:900;color:#f0f0f0;line-height:1.35;margin-bottom:${isEquipable?'.5rem':'1.4rem'}">${nome}</div>
      ${isEquipable?`<div style="font-size:.78rem;color:#888;margin-bottom:1.4rem;font-weight:600">⚡ ${t('bought_modal_equipped')}</div>`:''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.65rem">
        <button onclick="closeBoughtModal();state.phase='inventario';render()"
          style="padding:.8rem;border-radius:13px;border:2px solid #2a2a2a;background:#252525;color:#ccc;font-family:var(--font-body);font-size:.88rem;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent">
          ${t('bought_modal_later')}
        </button>
        <button onclick="closeBoughtModal();state.phase='loja';render()"
          style="padding:.8rem;border-radius:13px;border:3px solid #1a1a1a;background:linear-gradient(180deg,#f5aa2a,#d4720a);color:#fff;font-family:var(--font-body);font-size:.88rem;font-weight:900;cursor:pointer;box-shadow:0 4px 0 #1a1a1a;text-shadow:0 1px 0 rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.8);-webkit-tap-highlight-color:transparent">
          ${t('bought_modal_go_shop')}
        </button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  boughtModal=overlay;
  playBuySfx();
}
function closeBoughtModal(){
  if(boughtModal){boughtModal.remove();boughtModal=null;}
}

let _cupomModal=null;
function showCupomModal(){
  if(_cupomModal)return;
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:1.5rem;';
  overlay.onclick=e=>{if(e.target===overlay)closeCupomModal();};
  overlay.innerHTML=`
    <div style="background:#1a1a1a;border:3px solid #F5A623;border-radius:22px;padding:1.75rem 1.4rem 1.4rem;width:100%;max-width:380px;box-shadow:0 0 40px rgba(245,166,35,.2),6px 6px 0 #111;text-align:center;position:relative">
      <button onclick="closeCupomModal()" style="position:absolute;top:.75rem;right:.75rem;background:#252525;border:1.5px solid #3a3a3a;border-radius:50%;width:34px;height:34px;color:#aaa;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">✕</button>

      <div style="display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#ffbe4f,#e8931a);border:3px solid #1a1a1a;border-radius:14px;padding:.35rem 1.1rem;box-shadow:0 4px 0 #1a1a1a,0 0 20px rgba(245,166,35,.3);margin-bottom:1rem">
        <span style="font-family:'Exo 2',sans-serif;font-size:1.9rem;color:#111;line-height:1;font-weight:900;letter-spacing:-.02em">20% OFF</span>
      </div>

      <div style="font-size:.95rem;font-weight:900;color:#f0f0f0;margin-bottom:.2rem">${t('discount_modal_title')}</div>
      <div style="font-size:.78rem;color:#888;font-weight:600;margin-bottom:1.25rem">${t('discount_modal_benefit')}</div>

      <a href="https://chk.eduzz.com/uumbh35c" target="_blank" rel="noopener" onclick="playClickSfx('nav');closeCupomModal()"
        style="display:block;width:100%;padding:.9rem;border-radius:14px;border:3px solid #1a1a1a;background:linear-gradient(180deg,#4ade80,#16a34a);color:#fff;font-family:var(--font-body);font-size:.95rem;font-weight:900;cursor:pointer;box-shadow:0 5px 0 #1a1a1a;text-shadow:0 1px 0 rgba(0,0,0,.8);text-decoration:none;box-sizing:border-box;margin-bottom:1rem">
        🛒 ${t('discount_modal_buy')}
      </a>

      <div style="border-top:1.5px solid #2a2a2a;margin-bottom:1rem"></div>

      <a href="https://kaiserplay.com.br/" target="_blank" rel="noopener" onclick="playClickSfx('nav');closeCupomModal()"
        style="display:flex;flex-direction:column;align-items:center;gap:.5rem;text-decoration:none;padding:.25rem 0">
        <div style="font-size:.75rem;color:#666;font-weight:600">${t('discount_modal_learn')}</div>
        <img src="assets/logo-kaiserplay-transp.png" style="width:62%;object-fit:contain;display:block">
      </a>
    </div>`;
  document.body.appendChild(overlay);
  _cupomModal=overlay;
  playClickSfx('soft');
}
function closeCupomModal(){
  if(_cupomModal){_cupomModal.remove();_cupomModal=null;}
}

function downloadMaterial(itemId){
  const item=LOJA_ITEMS.find(x=>x.id===itemId);
  if(!item) return;
  if(item.cupom){showCupomModal();return;}
  if(!item.file){showToast(t('coming_soon'),t('coming_soon_body'));return;}
  window.open(item.file,'_blank');
}

function comprarItem(id){
  const item=LOJA_ITEMS.find(x=>x.id===id);
  if(!item)return;
  if(state.moedas<item.preco){showToast(t('not_enough_coins'),t('not_enough_coins_detail')+'🪙 '+item.preco+' '+t('coins').toLowerCase());return;}
  if(state.inventario.includes(id)){showToast(t('item_already_owned'),t('check_inventory'));return;}
  confirmarCompra({
    nome: itemName(item),
    preco: item.preco,
    img: item.img,
    icon: item.icon,
    onConfirm: function(){
      if(state.moedas<item.preco){showToast(t('not_enough_coins'),t('not_enough_coins_detail')+'🪙 '+item.preco+' '+t('coins').toLowerCase());return;}
      if(state.inventario.includes(id)){showToast(t('item_already_owned'),t('check_inventory'));return;}
      state.moedas-=item.preco;
      state.inventario.push(id);
      render();
      showBoughtModal({img:item.img, icon:item.icon, nome:itemName(item), isEquipable:false});
    }
  });
}

// ── Modal da loja ─────────────────────────────────────────────
let shopModal=null;
function openShopModal(type,id){
  closeShopModal();
  let item,btnHtml,imgSrc,cor,nameTxt,benefits=[];
  if(type==='violao'){
    item=VIOLOES.find(v=>v.id===id);if(!item)return;
    cor=item.cor; imgSrc=item.img; nameTxt=guitarName(item);
    if(item.pct>0) benefits.push({icon:'⭐',text:`+${Math.round(item.pct*100)}% de Pontos a cada resposta correta`,color:cor});
    else benefits.push({icon:'🎸',text:state.lang==='en'?'Standard guitar · no Points bonus':state.lang==='es'?'Guitarra estándar · sin bonificación de Puntos':'Violão padrão · sem bônus de Pontos',color:'#555'});
    if(item.doubleDiamonds) benefits.push({icon:'💎',text:state.lang==='en'?'Doubles diamonds received':state.lang==='es'?'Dobla los diamantes recibidos':'Dobra os diamantes recebidos',color:'#c084fc'});
    const owned=state.violoesComprados.includes(id);
    const equipped=state.violaoEquipado===id;
    const canBuy=!owned&&state.moedas>=item.preco;
    if(equipped) btnHtml=`<button class="modal-btn modal-btn--equipped">✓ ${t('equipped')}</button>`;
    else if(owned) btnHtml=`<button class="modal-btn modal-btn--equip" onclick="equiparViolao('${id}');closeShopModal()">${t('equip')}</button>`;
    else if(canBuy) btnHtml=`<button class="modal-btn modal-btn--buy" onclick="closeShopModal();comprarViolao('${id}')"><img src='assets/moeda.png' style='width:14px;height:14px;vertical-align:middle;object-fit:contain'> ${item.preco.toLocaleString()}</button>`;
    else btnHtml=`<button class="modal-btn modal-btn--locked" disabled><img src='assets/moeda.png' style='width:14px;height:14px;vertical-align:middle;object-fit:contain'> ${item.preco.toLocaleString()} · ${t('insufficient_balance')}</button>`;
   }
  const overlay=document.createElement('div');
  overlay.id='shop-modal-overlay';
  overlay.style.cssText='position:fixed;inset:0;z-index:8000;background:#0a0a0a;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;animation:fadeIn .18s ease;overflow-y:auto;';
  overlay.onclick=e=>{if(e.target===overlay)closeShopModal();};
  const benefitsHtml=benefits.map(b=>`
    <div style="display:flex;align-items:center;gap:.65rem;background:${b.color}18;border:1.5px solid ${b.color}44;border-radius:12px;padding:.65rem 1rem;">
      <span style="font-size:1.3rem">${b.icon}</span>
      <span style="font-size:.95rem;font-weight:800;color:${b.color}">${b.text}</span>
    </div>`).join('');
  overlay.innerHTML=`
    <div style="width:100%;max-width:520px;min-height:100vh;display:flex;flex-direction:column;position:relative;">
      <button onclick="closeShopModal()" style="position:fixed;top:1rem;right:1rem;z-index:9001;background:rgba(20,20,20,.92);border:1.5px solid #3a3a3a;border-radius:50%;width:40px;height:40px;color:#ccc;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)">✕</button>
      <div style="width:100%;background:radial-gradient(ellipse at 50% 55%,#252525 0%,#0c0c0c 100%);display:flex;align-items:center;justify-content:center;padding:3rem 0 1.5rem;flex-shrink:0;border-bottom:2px solid ${cor}22;">
        <img src="${imgSrc}" style="height:55vh;width:auto;max-width:96%;object-fit:contain;filter:drop-shadow(0 20px 50px rgba(0,0,0,1)) drop-shadow(0 0 30px ${cor}44)" onerror="this.style.opacity='.2'">
      </div>
      <div style="flex:1;background:#111;padding:1.4rem 1.3rem 3rem;border-top:2.5px solid ${cor}44;">
        <div style="font-size:1.45rem;font-weight:900;color:${cor};margin-bottom:.9rem;letter-spacing:-.02em">${nameTxt}</div>
        <div style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.2rem">${benefitsHtml}</div>
        ${item.preco>0?`<div style="font-size:.82rem;color:#888;margin-bottom:.8rem;display:flex;align-items:center;gap:.4rem"><img src='assets/moeda.png' style='width:15px;height:15px;object-fit:contain;vertical-align:middle'> ${t('price_label')} <strong style="color:#F5A623">${item.preco.toLocaleString()} ${t('coins').toLowerCase()}</strong></div>`:''}
        ${btnHtml}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  shopModal=overlay;
}
function closeShopModal(){
  if(shopModal){shopModal.remove();shopModal=null;}
}

