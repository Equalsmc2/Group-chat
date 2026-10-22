/* V40.2 — TV-only broadcast dressing. Purely presentational: never writes session state.
   Avoids animated element churn: a single light DOM layer and transitions only on scene changes. */
const body=document.body;
const isTv=()=>body.classList.contains('tv-device') || new URLSearchParams(location.search).get('tv')==='1';
const motionOK=()=>!body.classList.contains('motion-off')&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
const stage=document.getElementById('stageView');
const combat=document.getElementById('combatView');
function ornament(parent,cls,content=''){
  if (!parent || parent.querySelector('.'+cls)) return;
  const el=document.createElement('div');el.className=cls;el.setAttribute('aria-hidden','true');
  if(content)el.textContent=content;
  parent.append(el);
}
ornament(stage,'ss40-stage-sash');
ornament(stage,'ss40-frame-ticks');
ornament(stage,'ss40-edge-code','SS // THE WOUNDED ETERNITY // 03');
ornament(stage,'ss40-dossier','TRANSMISSION / IN PROGRESS');
ornament(combat,'ss40-combat-watermark','III');
if(combat&&!combat.querySelector('.ss40-broadcast-bar')){
 const bar=document.createElement('div');bar.className='ss40-broadcast-bar';bar.setAttribute('aria-hidden','true');
 bar.innerHTML='<span class="ss40-live-light"></span><span>SOUL SEEKERS // ENCOUNTER LIVE</span>';
 combat.append(bar);
}
let overlay=document.querySelector('.ss40-take');
if(!overlay){overlay=document.createElement('div');overlay.className='ss40-take';overlay.setAttribute('aria-hidden','true');overlay.innerHTML='<div class="ss40-blade"></div><div class="ss40-take-word"></div>';body.append(overlay)}
let animationTimer=0,oldView=body.dataset.view||'terminal',stageSerial=null,roundTurn=null,initialized=false;
function take(label){
 if(!isTv()||!motionOK()||body.classList.contains('legendary-lunar-eclipse')||body.classList.contains('legendary-queens-gambit')||body.classList.contains('legendary-channel-unaired')) return;
 if(document.hidden) return;
 clearTimeout(animationTimer);
 overlay.querySelector('.ss40-take-word').textContent=String(label||'SOUL SEEKERS').slice(0,48);
 overlay.classList.remove('is-running');void overlay.offsetWidth;
 overlay.classList.add('is-running');
 animationTimer=setTimeout(()=>overlay.classList.remove('is-running'),1000);
}
function updateView(){
 const next=body.dataset.view||'terminal';
 if(next===oldView)return;
 oldView=next;
 if(next==='stage')take('THE STAGE');
 if(next==='combat')take('ENCOUNTER');
}
new MutationObserver(updateView).observe(body,{attributes:true,attributeFilter:['data-view','class']});
window.addEventListener('soulseekers:viewchange',updateView);
window.addEventListener('soulseekers:stagestate',event=>{
 const d=event.detail||{};
 const key=`${d.serial||0}|${d.kind||''}|${d.title||''}`;
 if(stageSerial!==null&&key!==stageSerial&&oldView==='stage')take(d.kind==='dialogue'?'INCOMING VOICE':d.kind==='boss'?'HOSTILE SIGNATURE':d.kind==='idle'?'STAND BY':'TRANSMISSION');
 stageSerial=key;
});
window.addEventListener('soulseekers:combatstate',event=>{
 const d=event.detail||{};const e=d.encounter||{};
 const key=`${e.round||0}|${e.activeId||''}`;
 if(roundTurn!==null&&key!==roundTurn&&oldView==='combat'){
   // Ordinary turn advance gets expressive card emphasis, without full-screen takeover.
   const active=combat?.querySelector('.combat-card.is-active-turn');
   if(active&&motionOK()&&isTv()){
     for(const anim of active.getAnimations())if(anim.id==='ss40-turn-emphasis')anim.cancel();
     const a=active.animate([{filter:'brightness(1.45)',offset:0},{filter:'brightness(1.04)',offset:.5},{filter:'brightness(1)',offset:1}],{duration:650,easing:'ease-out'});a.id='ss40-turn-emphasis';
   }
 }
 roundTurn=key;
});
window.addEventListener('pagehide',()=>clearTimeout(animationTimer),{once:true});
