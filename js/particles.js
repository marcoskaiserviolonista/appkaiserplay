// ── 3. PARTÍCULAS E HELPERS VISUAIS ──────────────────────────
// ── Particles ─────────────────────────────────────────────────
let particles=[];
const canvas=document.getElementById('pcanvas');
const ctx2d=canvas.getContext('2d');

function makeParticles(x,y,count,isBonus){
  return Array.from({length:count},()=>({
    x,y,
    vx:(Math.random()-.5)*(isBonus?20:14),
    vy:-(Math.random()*(isBonus?18:12)+4),
    size:Math.random()*(isBonus?12:8)+4,
    color:isBonus?["#F5A623","#FFD700","#fff","#ff9800"][Math.floor(Math.random()*4)]:["#F5A623","#22c55e","#fff"][Math.floor(Math.random()*3)],
    life:1,decay:Math.random()*.04+.02,
    shape:Math.random()>.5?'circle':'star',
  }));
}

function makeCoinParticles(x,y){
  return Array.from({length:12},(_,i)=>({
    x:x+(Math.random()-.5)*60,y,
    vx:(Math.random()-.5)*10,
    vy:-(Math.random()*14+6),
    size:14+Math.random()*8,
    color:'#F5A623',life:1,decay:.025,shape:'coin',
  }));
}

let _particleRAF=null;
function drawParticles(){
  ctx2d.clearRect(0,0,520,700);
  particles.forEach(p=>{
    ctx2d.save();ctx2d.globalAlpha=p.life;ctx2d.fillStyle=p.color;ctx2d.translate(p.x,p.y);
    if(p.shape==='coin'){
      ctx2d.beginPath();ctx2d.ellipse(0,0,p.size/2,p.size/2.5,0,0,Math.PI*2);ctx2d.fill();
      ctx2d.fillStyle='rgba(255,255,255,.3)';ctx2d.font=`bold ${p.size*.7}px sans-serif`;
      ctx2d.textAlign='center';ctx2d.textBaseline='middle';ctx2d.fillText('🪙',0,0);
    }else if(p.shape==='star'){
      ctx2d.beginPath();
      for(let i=0;i<5;i++){const a=(i*4*Math.PI)/5-Math.PI/2;i===0?ctx2d.moveTo(Math.cos(a)*p.size,Math.sin(a)*p.size):ctx2d.lineTo(Math.cos(a)*p.size,Math.sin(a)*p.size);}
      ctx2d.closePath();ctx2d.fill();
    }else{ctx2d.beginPath();ctx2d.arc(0,0,p.size/2,0,Math.PI*2);ctx2d.fill();}
    ctx2d.restore();
  });
  particles=particles.map(p=>({...p,x:p.x+p.vx,y:p.y+p.vy,vy:p.vy+.5,life:p.life-p.decay})).filter(p=>p.life>0);
  if(particles.length>120)particles.splice(0,particles.length-120);
  if(particles.length>0){_particleRAF=requestAnimationFrame(drawParticles);}else{_particleRAF=null;ctx2d.clearRect(0,0,520,700);}
}
function startParticleLoop(){if(_particleRAF)return;_particleRAF=requestAnimationFrame(drawParticles);}

function esc(str){return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

let _toastTimer=null;
function showToast(msg,sub){
  const el=document.getElementById('toast');
  document.getElementById('toast-msg').textContent=msg;
  document.getElementById('toast-sub').textContent=sub||'';
  el.classList.add('show');
  if(_toastTimer)clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>{el.classList.remove('show');_toastTimer=null;},2800);
}

function spawnSalaFeedback(ok){
  const floats=document.getElementById('floats');
  if(!floats)return;
  const el=document.createElement('div');
  // Calcula y na altura da 4ª casa do violão
  let topVal='42%';
  const fbWrap=document.querySelector('.fb-wrap');
  if(fbWrap){
    const svgEl=fbWrap.querySelector('svg');
    const rect=(svgEl||fbWrap).getBoundingClientRect();
    const fret4Y=rect.top+(FB_NUT_Y+FB_FRET_Y[4])*(rect.height/FB_SVG_H)+140;
    topVal=Math.round(fret4Y)+'px';
  }
  el.style.cssText=`position:fixed;top:${topVal};left:0;right:0;text-align:center;font-size:2.2rem;font-weight:900;font-family:var(--font-body);color:${ok?'#4ade80':'#f87171'};text-shadow:0 0 24px ${ok?'#22c55eaa':'#ef4444aa'};animation:floatUp 1.2s ease forwards;white-space:nowrap;pointer-events:none;letter-spacing:-.01em`;
  el.textContent=ok?t('correct'):t('wrong');
  floats.appendChild(el);
  setTimeout(()=>el.remove(),1300);
}

function spawnFloat(x,y,text,big){
  const el=document.createElement('div');
  el.className='xp-float';
  el.style.left=x+'px';el.style.top=(y-20)+'px';
  el.style.transform='translateX(-50%)';
  el.style.fontSize=big?'1.6rem':'1.1rem';
  el.style.color=big?'#FFD700':'#F5A623';
  el.textContent=text;
  document.getElementById('floats').appendChild(el);
  setTimeout(()=>el.remove(),1100);
}

function spawnCoinFloats(cx,cy,amount){
  for(let i=0;i<Math.min(amount,8);i++){
    setTimeout(()=>{
      const el=document.createElement('div');
      el.className='coin-float';
      el.style.left=(cx-20+(Math.random()-.5)*80)+'px';
      el.style.top=(cy-20+(Math.random()-.5)*40)+'px';
      el.innerHTML="<i class='gc' style='width:1.6em;height:1.6em;font-size:1.4rem'></i>";
      document.getElementById('floats').appendChild(el);
      setTimeout(()=>el.remove(),1000);
    },i*60);
  }
}
