/* Quick Combat · DM-only hot edits over the existing Combat Monitor state. */
const $ = (id) => document.getElementById(id);
const panel = $('dmQuickCombatPanel');
const roster = $('dmQuickRoster');
const conditions = $('dmQuickConditions');
const feedback = $('dmQuickFeedback');
let selectedId = 'Magnus';
let latest = null;
let lastRosterFingerprint = '';

function api(){return window.SoulSeekerCombat;}
function allowed(){return api()?.isDM?.() === true;}
function numberValue(input){
  if(!input || !input.value.trim())return null;
  const n = Number(input.value);
  return Number.isSafeInteger(n) && n >= 0 && n <= 99999 ? n : null;
}
function say(message, problem=false){
  if (!feedback) return;
  feedback.textContent = message;
  feedback.dataset.problem = String(problem);
}
async function update(operation, value, status){
  if(!allowed()){say('Director permissions are required.',true);return;}
  if(!api()?.quickUpdate){say('Combat system is still loading.',true);return;}
  const ok = await api().quickUpdate({characterId:selectedId,operation,value,status});
  say(ok ? `${selectedId.toUpperCase()} · ${operation.toUpperCase()} APPLIED` : 'Change was not accepted. Check the value.',!ok);
}
function characters(){return api()?.characters || [];}
function drawRoster(force=false){
  if (!roster || !latest) return;
  const chars = characters();
  const signature = chars.map(c=>`${c.id}:${latest.players?.[c.id]?.currentHp}:${latest.players?.[c.id]?.maxHp}:${latest.players?.[c.id]?.tempHp}`).join('|');
  if (signature === lastRosterFingerprint && !force) {
    roster.querySelectorAll('[data-qc-character]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.qcCharacter===selectedId)));
    return;
  }
  lastRosterFingerprint=signature;
  const frag=document.createDocumentFragment();
  for(const c of chars){
    const p=latest.players?.[c.id] || {};
    const b=document.createElement('button');b.type='button';b.className='dm-quick-character';b.dataset.qcCharacter=c.id;
    b.setAttribute('aria-pressed',String(c.id===selectedId));
    b.disabled=!allowed();
    const img=document.createElement('img');img.src=c.image;img.alt='';img.loading='lazy';
    const label=document.createElement('span');
    const name=document.createElement('strong');name.textContent=c.name;
    const hp=document.createElement('small');hp.textContent=`${p.currentHp ?? 0} / ${p.maxHp || '—'} HP`;
    label.append(name,hp);b.append(img,label);frag.append(b);
  }
  roster.replaceChildren(frag);
}
function drawConditions(){
  if(!conditions||!latest)return;
  const p=latest.players?.[selectedId] || {};
  const active = new Set(p.statuses || []);
  const frag=document.createDocumentFragment();
  for(const condition of api()?.statusOptions || []){
    const button=document.createElement('button');button.type='button';button.className='dm-quick-condition';
    button.textContent=condition;
    button.dataset.qcStatus=condition;
    button.setAttribute('aria-pressed',String(active.has(condition)));
    button.disabled=!allowed();
    frag.append(button);
  }
  conditions.replaceChildren(frag);
}
function setInput(id,value){
  const el=$(id);if(el && document.activeElement!==el)el.value=String(value ?? '');
}
function redraw({selection=false}={}){
  if(!panel || !latest || !api())return;
  const chars=characters();
  if(!chars.some(c=>c.id===selectedId))selectedId=chars[0]?.id;
  if(!selectedId)return;
  drawRoster(selection);
  const c=chars.find(c=>c.id===selectedId);
  const p=latest.players?.[selectedId] || {};
  $('dmQuickName').textContent=c.name.toUpperCase();
  $('dmQuickPortrait').src=c.image;
  $('dmQuickHpReadout').textContent=`${p.currentHp||0} / ${p.maxHp||'—'} HP${p.tempHp?` · +${p.tempHp} TEMP`:''}`;
  setInput('dmQuickSetHp',p.currentHp||0);
  setInput('dmQuickSetMax',p.maxHp||0);
  setInput('dmQuickSetTemp',p.tempHp||0);
  setInput('dmQuickConcentration',p.concentration||'');
  $('dmQuickSuccesses').textContent=`${p.deathSuccess||0} / 3`;
  $('dmQuickFailures').textContent=`${p.deathFailure||0} / 3`;
  drawConditions();
}
function refreshCombat(state){
  if(!state) return;
  latest=state;
  redraw();
}
window.addEventListener('soulseekers:combatstate', e=>refreshCombat(e.detail));
window.addEventListener('soulseekers:combatready',()=>refreshCombat(api()?.getState?.()));
if(api())refreshCombat(api().getState());

roster?.addEventListener('click',event=>{
  const b=event.target.closest('[data-qc-character]');
  if(!b||!allowed())return;
  selectedId=b.dataset.qcCharacter;
  redraw({selection:true});say(`EDITING ${selectedId.toUpperCase()}`);
});
conditions?.addEventListener('click',event=>{
  const b=event.target.closest('[data-qc-status]');
  if(b)void update('status',undefined,b.dataset.qcStatus);
});
panel?.addEventListener('click',event=>{
  const b=event.target.closest('button');
  if(!b || b.disabled) return;
  if(b.hasAttribute('data-qc-damage'))return void update('damage',Number(b.dataset.qcDamage));
  if(b.hasAttribute('data-qc-heal'))return void update('heal',Number(b.dataset.qcHeal));
  if(b.hasAttribute('data-qc-save')){
    const key=b.dataset.qcSave==='success'?'deathSuccess':'deathFailure';
    const operation=b.dataset.qcSave;
    const previous=latest?.players?.[selectedId]?.[key]||0;
    return void update(operation,Math.max(0,Math.min(3,previous+Number(b.dataset.qcStep))));
  }
});
$('dmQuickDamageCustom')?.addEventListener('click',()=>{
  const n=numberValue($('dmQuickAmount'));
  if(n===null||n<=0)return say('Enter a positive damage amount.',true);
  void update('damage',n);
});
$('dmQuickHealCustom')?.addEventListener('click',()=>{
  const n=numberValue($('dmQuickAmount'));
  if(n===null||n<=0)return say('Enter a positive healing amount.',true);
  void update('heal',n);
});
$('dmQuickSaveHp')?.addEventListener('click',async()=>{
  const hp=numberValue($('dmQuickSetHp'));
  const max=numberValue($('dmQuickSetMax'));
  if(hp===null||max===null)return say('Enter valid HP and maximum HP.',true);
  await update('setHpPair',{hp,max});
});
$('dmQuickSaveTemp')?.addEventListener('click',()=>{
  const n=numberValue($('dmQuickSetTemp'));
  if(n===null)return say('Temporary HP must be a non-negative whole number.',true);
  void update('setTemp',n);
});
$('dmQuickSaveConcentration')?.addEventListener('click',()=>void update('concentration',$('dmQuickConcentration').value));
$('dmQuickFullEdit')?.addEventListener('click',()=>api()?.openEditor?.(selectedId));
$('dmQuickUndo')?.addEventListener('click',()=>{
  if(!allowed())return say('Director permissions are required.',true);
  void api()?.undo?.();say('Undo requested.');
});
