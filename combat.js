import { db } from './firebase.js';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const CHARACTERS = [
  { id:'Magnus', name:'Magnus', image:'assets/characters/magnus.webp', color:'#dbb86c', quote:'Renaître' },
  { id:'Max', name:'Max', image:'assets/characters/max.webp', color:'#b45b5b', quote:'Just business' },
  { id:'Jeanette', name:'Jeanette', image:'assets/characters/jeanette.webp', color:'#c78caa', quote:'Say cheese' },
  { id:'Asya', name:'Asya', image:'assets/characters/asya.webp', color:'#76b5c0', quote:'print("HelloWorld")' },
  { id:'Alexandria', name:'Alexandria', image:'assets/characters/alexandria.webp', color:'#ae94cb', quote:'Checkmate' },
  { id:'Fitz', name:'Fitz', image:'assets/characters/fitz.webp', color:'#92b7a0', quote:'I might just have got the compound for this' }
];
const STATUS_OPTIONS=['Blinded','Charmed','Deafened','Frightened','Grappled','Incapacitated','Invisible','Paralyzed','Petrified','Poisoned','Prone','Restrained','Stunned','Unconscious','Exhaustion','Dying','Stable'];
const STORAGE_KEY='soulSeekersCombatStateV2';
const stateRef=doc(db,'combatState','party');
const $=id=>document.getElementById(id);
const mainDashboard=$('mainDashboard'), combatView=$('combatView'), terminalTab=$('terminalTab'), combatTab=$('combatTab'), sectionModeTitle=$('sectionModeTitle'), combatMusicDock=$('combatMusicDock');
const mainUserSelect=$('currentUserSelect'), combatUserSelect=$('combatUserSelect'), combatGrid=$('combatGrid'), syncStatus=$('combatSyncStatus'), dmNote=$('combatDmNote');
const roundLabel=$('combatRound'), currentTurnLabel=$('combatCurrentTurn'), historyText=$('combatHistoryText'), initiativeOrderEl=$('combatInitiativeOrder');
const editor=$('combatEditor'), editorTitle=$('combatEditorTitle'), editorPortrait=$('combatEditorPortrait'), editorName=$('combatEditorName');
const currentHpInput=$('combatCurrentHp'), maxHpInput=$('combatMaxHp'), tempHpInput=$('combatTempHp'), initiativeInput=$('combatInitiative'), acInput=$('combatAc'), speedInput=$('combatSpeed'), passiveInput=$('combatPassive');
const deathSuccessInput=$('combatDeathSuccess'), deathFailureInput=$('combatDeathFailure'), reactionInput=$('combatReactionAvailable'), concentrationInput=$('combatConcentration'), dmOnlyNoteInput=$('combatDmOnlyNote');
const statusEditor=$('combatStatusEditor'), customStatusesInput=$('combatCustomStatuses'), slotEditor=$('combatSlotEditor'), resourceEditor=$('combatResourceEditor'), saveBtn=$('combatSaveBtn');
const turnSplash=$('turnSplash'), turnSplashCard=$('turnSplashCard'), turnSplashPortrait=$('turnSplashPortrait'), turnSplashName=$('turnSplashName'), turnSplashQuote=$('turnSplashQuote'), turnSplashRound=$('turnSplashRound');
const orderEditor=$('combatOrderEditor'), orderList=$('combatOrderList'), orderSave=$('combatOrderSave'), orderSort=$('combatOrderSort'), orderReset=$('combatOrderReset'), orderBtn=$('combatOrderBtn');
let activeEditorId=null, combatState=loadLocalState(), previousHp=new Map(), splashTimer=null, draftTurnOrder=[];
let combatRealtimeUnsubscribe=null, combatRealtimePrimed=false, remoteChangedIds=new Set();
let lastAnnouncedTurnSerial=null;
const VIEW_KEY='soulSeekersDesktopViewV24';
const TV_KEY='soulSeekersCombatTv';
const sharedMusicCard=document.querySelector('.music-card');
const musicHome=sharedMusicCard?.parentElement||null;
const musicHomeAnchor=sharedMusicCard?document.createComment('music-card-home'):null;
if(sharedMusicCard&&musicHome&&musicHomeAnchor)musicHome.insertBefore(musicHomeAnchor,sharedMusicCard.nextSibling);
function placeSharedMusic(combat){
  if(!sharedMusicCard||!combatMusicDock||!musicHome||!musicHomeAnchor)return;
  if(combat){
    combatMusicDock.hidden=false;
    if(sharedMusicCard.parentElement!==combatMusicDock)combatMusicDock.appendChild(sharedMusicCard);
  }else{
    if(sharedMusicCard.parentElement!==musicHome)musicHome.insertBefore(sharedMusicCard,musicHomeAnchor);
    combatMusicDock.hidden=true;
  }
}

function blankCharacter(){return {currentHp:0,maxHp:0,tempHp:0,deathSuccess:0,deathFailure:0,statuses:[],customStatuses:[],concentration:'',spellSlots:{},resources:[],initiative:0,ac:0,speed:0,passive:0,actionAvailable:true,bonusAvailable:true,movementAvailable:true,reactionAvailable:true,dmNote:'',updatedAt:null};}
function defaultState(){const players={};for(const c of CHARACTERS)players[c.id]=blankCharacter();return {players,encounter:{round:1,activeId:null,started:false,turnSerial:0,order:CHARACTERS.map(c=>c.id),history:[]}};}
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function normSlot(slot={}){const max=Math.max(0,Math.round(Number(slot.max)||0));return {max,remaining:clamp(Math.round(Number(slot.remaining)||0),0,max)};}
function normalizePlayer(raw={}){const spellSlots={};for(let l=1;l<=9;l++){const s=raw.spellSlots?.[l]??raw.spellSlots?.[String(l)];if(s){const n=normSlot(s);if(n.max>0)spellSlots[l]=n;}}
  const resources=Array.isArray(raw.resources)?raw.resources.slice(0,4).map(r=>({name:String(r?.name||'').slice(0,28),current:Math.max(0,Math.round(Number(r?.current)||0)),max:Math.max(0,Math.round(Number(r?.max)||0)),reset:['short','long','none'].includes(r?.reset)?r.reset:'long'})).filter(r=>r.name||r.max>0):[];
  const maxHp=Math.max(0,Math.round(Number(raw.maxHp)||0));
  return {currentHp:clamp(Math.round(Number(raw.currentHp)||0),0,maxHp||99999),maxHp,tempHp:Math.max(0,Math.round(Number(raw.tempHp)||0)),deathSuccess:clamp(Math.round(Number(raw.deathSuccess)||0),0,3),deathFailure:clamp(Math.round(Number(raw.deathFailure)||0),0,3),statuses:Array.isArray(raw.statuses)?raw.statuses.filter(x=>typeof x==='string').slice(0,24):[],customStatuses:Array.isArray(raw.customStatuses)?raw.customStatuses.filter(x=>typeof x==='string').slice(0,12):[],concentration:String(raw.concentration||'').slice(0,60),spellSlots,resources,initiative:Math.round(Number(raw.initiative)||0),ac:Math.max(0,Math.round(Number(raw.ac)||0)),speed:Math.max(0,Math.round(Number(raw.speed)||0)),passive:Math.max(0,Math.round(Number(raw.passive)||0)),actionAvailable:raw.actionAvailable!==false,bonusAvailable:raw.bonusAvailable!==false,movementAvailable:raw.movementAvailable!==false,reactionAvailable:raw.reactionAvailable!==false,dmNote:String(raw.dmNote||'').slice(0,500),updatedAt:raw.updatedAt??null};}
function normalizeState(raw={}){const s=defaultState();for(const c of CHARACTERS)s.players[c.id]=normalizePlayer(raw.players?.[c.id]);const e=raw.encounter||{};const validIds=new Set(CHARACTERS.map(c=>c.id));let order=Array.isArray(e.order)?e.order.filter((id,i,a)=>validIds.has(id)&&a.indexOf(id)===i):[];if(!order.length){order=[...CHARACTERS].sort((a,b)=>(s.players[b.id]?.initiative||0)-(s.players[a.id]?.initiative||0)||CHARACTERS.indexOf(a)-CHARACTERS.indexOf(b)).map(c=>c.id);}for(const c of CHARACTERS)if(!order.includes(c.id))order.push(c.id);s.encounter={round:Math.max(1,Math.round(Number(e.round)||1)),activeId:CHARACTERS.some(c=>c.id===e.activeId)?e.activeId:null,started:Boolean(e.started),turnSerial:Math.max(0,Math.round(Number(e.turnSerial)||0)),order,history:Array.isArray(e.history)?e.history.slice(-12):[]};return s;}
function loadLocalState(){try{const raw=localStorage.getItem(STORAGE_KEY)||localStorage.getItem('soulSeekersCombatStateV1')||'null';return normalizeState(JSON.parse(raw)||{});}catch{return defaultState();}}
function storeLocalState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(combatState));}catch{}}
function identity(){return mainUserSelect?.value||'Observer';}
function observer(){return identity()==='Observer';}
function stateSnapshot(){return JSON.parse(JSON.stringify({players:combatState.players,encounter:{round:combatState.encounter.round,activeId:combatState.encounter.activeId,started:combatState.encounter.started,turnSerial:combatState.encounter.turnSerial,order:[...(combatState.encounter.order||[])]}}));}
function setSync(text,mode=''){if(!syncStatus)return;syncStatus.classList.toggle('is-live',mode==='live');syncStatus.classList.toggle('is-local',mode==='local');const node=syncStatus.lastChild;if(node)node.textContent=text;}
function setHistoryLabel(){const h=combatState.encounter.history||[];historyText.textContent=h.length?`LAST: ${h[h.length-1].label}`:'NO CHANGES YET';$('combatUndo').disabled=!observer()||!h.length;}
function initiativeOrder(){const ids=Array.isArray(combatState.encounter.order)?combatState.encounter.order:CHARACTERS.map(c=>c.id);return ids.map(id=>CHARACTERS.find(c=>c.id===id)).filter(Boolean);}
function timestampLabel(value){try{const d=typeof value?.toDate==='function'?value.toDate():value?new Date(value):null;return d&&!Number.isNaN(d.getTime())?`UPDATED ${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`:'NOT SET';}catch{return 'UPDATED';}}
function addText(parent,cls,text){const e=document.createElement('div');e.className=cls;e.textContent=text;parent.appendChild(e);return e;}
function markMutation(label){const hist=combatState.encounter.history||(combatState.encounter.history=[]);hist.push({label,at:new Date().toISOString(),snapshot:stateSnapshot()});if(hist.length>12)hist.splice(0,hist.length-12);}
async function pushCloud(){storeLocalState();renderCombat();setSync('SAVING…','local');try{await setDoc(stateRef,{players:combatState.players,encounter:combatState.encounter,updatedAt:serverTimestamp()},{merge:true});setSync('LIVE · FIREBASE','live');}catch(err){console.error('Combat save failed',err);setSync('LOCAL ONLY · CHECK FIRESTORE RULES','local');}}
async function mutate(label,fn){if(!observer())return;markMutation(label);fn();await pushCloud();}


function isCombatActive(){return document.body.classList.contains('combat-screen-active')&&!combatView?.hidden;}
function emitViewLifecycle(view){
  window.dispatchEvent(new CustomEvent('soulseekers:viewchange',{detail:{view,combat:view==='combat',terminal:view==='terminal'}}));
}
function playerFingerprint(p){
  const x=normalizePlayer(p);
  return JSON.stringify({currentHp:x.currentHp,maxHp:x.maxHp,tempHp:x.tempHp,deathSuccess:x.deathSuccess,deathFailure:x.deathFailure,statuses:x.statuses,customStatuses:x.customStatuses,concentration:x.concentration,spellSlots:x.spellSlots,resources:x.resources,initiative:x.initiative,ac:x.ac,speed:x.speed,passive:x.passive,actionAvailable:x.actionAvailable,bonusAvailable:x.bonusAvailable,movementAvailable:x.movementAvailable,reactionAvailable:x.reactionAvailable});
}
function hideTurnSplash(immediate=false){
  if(!turnSplash)return;
  clearTimeout(splashTimer);
  turnSplash.classList.remove('is-showing');
  turnSplash.classList.add('is-leaving');
  const finish=()=>{turnSplash.hidden=true;turnSplash.classList.remove('is-leaving');};
  if(immediate)finish(); else splashTimer=setTimeout(finish,560);
}
function announceTurnIfNew({allowInitial=false}={}){
  const serial=Math.max(0,Number(combatState.encounter.turnSerial)||0);
  if(lastAnnouncedTurnSerial===null){lastAnnouncedTurnSerial=serial;if(!allowInitial)return;}
  if(serial<=lastAnnouncedTurnSerial)return;
  lastAnnouncedTurnSerial=serial;
  try{sessionStorage.setItem('soulSeekersTurnSerial',String(serial));}catch{}
  if(isCombatActive()&&combatState.encounter.activeId)showTurnSplash(combatState.encounter.activeId);
}
function primeHpSnapshot(){
  previousHp.clear();
  for(const c of CHARACTERS){const p=normalizePlayer(combatState.players?.[c.id]);previousHp.set(c.id,p.maxHp?Math.min(p.currentHp,p.maxHp):p.currentHp);}
}
function stopCombatRealtime(){
  if(combatRealtimeUnsubscribe){combatRealtimeUnsubscribe();combatRealtimeUnsubscribe=null;}
  combatRealtimePrimed=false;
  setSync('COMBAT SYNC PAUSED','local');
}
function startCombatRealtime(){
  if(combatRealtimeUnsubscribe||!isCombatActive())return;
  setSync('CONNECTING…','local');
  combatRealtimePrimed=false;
  combatRealtimeUnsubscribe=onSnapshot(stateRef,snap=>{
    const oldState=combatState;
    if(snap.exists()){
      const next=normalizeState(snap.data());
      remoteChangedIds=new Set();
      if(combatRealtimePrimed){
        for(const c of CHARACTERS){if(playerFingerprint(oldState.players?.[c.id])!==playerFingerprint(next.players?.[c.id]))remoteChangedIds.add(c.id);}
      }
      combatState=next;storeLocalState();setSync('LIVE · FIREBASE','live');
    }else setSync('LIVE · READY FOR OBSERVER','live');
    if(!combatRealtimePrimed){
      combatRealtimePrimed=true;
      primeHpSnapshot();
      lastAnnouncedTurnSerial=Math.max(0,Number(combatState.encounter.turnSerial)||0);
    }else announceTurnIfNew();
    if(isCombatActive())renderCombat();
    remoteChangedIds.clear();
  },err=>{console.error('Combat state listener failed',err);setSync('LOCAL ONLY · CHECK FIRESTORE RULES','local');if(isCombatActive())renderCombat();});
}

function updateObserverMode(){const isObs=observer();document.body.classList.toggle('combat-dm',isObs);if(combatUserSelect&&combatUserSelect.value!==identity())combatUserSelect.value=identity();if(dmNote)dmNote.textContent=isObs?'Observer controls enabled.':'Read-only · switch to Observer to edit.';if(!isObs&&!editor.hidden)closeEditor();if(!isObs&&orderEditor&&!orderEditor.hidden)closeOrderEditor();renderCombat();}
function switchView(view,{persist=true}={}){
  const combat=view==='combat';
  document.body.classList.toggle('combat-screen-active',combat);
  mainDashboard.hidden=combat;
  combatView.hidden=!combat;
  placeSharedMusic(combat);
  mainDashboard.setAttribute('aria-hidden',String(combat));
  combatView.setAttribute('aria-hidden',String(!combat));
  terminalTab.classList.toggle('is-active',!combat);
  combatTab.classList.toggle('is-active',combat);
  terminalTab.setAttribute('aria-selected',String(!combat));
  combatTab.setAttribute('aria-selected',String(combat));
  if(sectionModeTitle)sectionModeTitle.textContent=combat?'COMBAT MONITOR':'GROUP TERMINAL';
  if(persist){try{localStorage.setItem(VIEW_KEY,view);}catch{}}
  if(combat){
    renderCombat();
    startCombatRealtime();
  }else{
    hideTurnSplash(true);
    stopCombatRealtime();
    if(!editor.hidden)closeEditor();
    if(orderEditor&&!orderEditor.hidden)closeOrderEditor();
    if(document.body.classList.contains('combat-tv'))toggleTv(false,{switching:true});
  }
  emitViewLifecycle(view);
}
terminalTab?.addEventListener('click',()=>switchView('terminal'));
combatTab?.addEventListener('click',()=>switchView('combat'));
mainUserSelect?.addEventListener('change',updateObserverMode);
combatUserSelect?.addEventListener('change',()=>{mainUserSelect.value=combatUserSelect.value;mainUserSelect.dispatchEvent(new Event('change',{bubbles:true}));});

function statusAbbrev(name){const m={Blinded:'BLD',Charmed:'CHM',Deafened:'DEF',Frightened:'FRI',Grappled:'GRP',Incapacitated:'INC',Invisible:'INV',Paralyzed:'PAR',Petrified:'PET',Poisoned:'PSN',Prone:'PRN',Restrained:'RST',Stunned:'STN',Unconscious:'UNC',Exhaustion:'EXH',Dying:'DYG',Stable:'STB'};return m[name]||name.slice(0,3).toUpperCase();}
function renderCombat(){if(!combatGrid)return;combatGrid.replaceChildren();const frag=document.createDocumentFragment();const activeId=combatState.encounter.activeId;const order=initiativeOrder();roundLabel.textContent=`ROUND ${combatState.encounter.round}`;const activeChar=CHARACTERS.find(c=>c.id===activeId);currentTurnLabel.textContent=activeChar?`${activeChar.name.toUpperCase()} · ACTIVE TURN`:'NO ACTIVE TURN';
  if(initiativeOrderEl){initiativeOrderEl.replaceChildren();order.forEach((c,i)=>{const p=combatState.players[c.id];const s=document.createElement('span');s.className=`combat-order-chip${c.id===activeId?' active':''}`;s.style.setProperty('--char-color',c.color);const img=document.createElement('img');img.src=c.image;img.alt='';img.decoding='async';const rank=document.createElement('b');rank.textContent=String(i+1).padStart(2,'0');const name=document.createElement('strong');name.textContent=c.name;const init=document.createElement('em');init.textContent=`INIT ${p?.initiative??0}`;s.append(img,rank,name,init);initiativeOrderEl.appendChild(s);});}
  for(const character of CHARACTERS){const data=normalizePlayer(combatState.players?.[character.id]);const max=data.maxHp,current=max?Math.min(data.currentHp,max):data.currentHp,ratio=max?clamp(current/max,0,1):0;const card=document.createElement('article');card.className='combat-card';card.dataset.character=character.id;card.style.setProperty('--char-color',character.color);if(character.id===activeId)card.classList.add('is-active-turn');if(remoteChangedIds.has(character.id))card.classList.add('is-live-update');if(data.concentration)card.classList.add('is-concentrating');if(max&&current<=0)card.classList.add('is-zero-hp');else if(max&&ratio<=.25)card.classList.add('is-critical-hp');else if(max&&ratio<=.5)card.classList.add('is-bloodied');
    const portraitWrap=document.createElement('div');portraitWrap.className='combat-portrait-wrap';const img=document.createElement('img');img.className='combat-portrait';img.src=character.image;img.alt=`${character.name} portrait`;img.decoding='async';portraitWrap.appendChild(img);addText(portraitWrap,'combat-portrait-name',character.name);const init=addText(portraitWrap,'combat-init-badge',`INIT ${data.initiative}`);if(character.id===activeId)addText(portraitWrap,'combat-turn-badge','ACTIVE');
    const old=previousHp.get(character.id);if(old!==undefined&&old!==current){const d=current-old;const popup=addText(portraitWrap,`combat-hp-delta ${d>0?'heal':'damage'}`,`${d>0?'+':''}${d}`);setTimeout(()=>popup.remove(),1500);}previousHp.set(character.id,current);
    const body=document.createElement('div');body.className='combat-card-data';const top=document.createElement('div');top.className='combat-card-top';const rankIndex=Math.max(0,order.findIndex(x=>x.id===character.id));addText(top,'combat-card-label',`TURN ${String(rankIndex+1).padStart(2,'0')}`);const edit=document.createElement('button');edit.type='button';edit.className='combat-edit-btn';edit.textContent='EDIT';edit.addEventListener('click',()=>openEditor(character.id));top.appendChild(edit);body.appendChild(top);
    const statline=document.createElement('div');statline.className='combat-statline';[['AC',data.ac||'—'],['SPD',data.speed?`${data.speed}'`:'—'],['PP',data.passive||'—']].forEach(([k,v])=>{const x=document.createElement('span');x.innerHTML=`<b>${k}</b> ${v}`;statline.appendChild(x);});body.appendChild(statline);
    const hpRow=document.createElement('div');hpRow.className='combat-hp-row';const hp=document.createElement('div');hp.className='combat-hp-number';hp.innerHTML=max?`${current}<small> / ${max} HP</small>`:`—<small> / — HP</small>`;hpRow.appendChild(hp);const cap=[];if(data.tempHp)cap.push(`+${data.tempHp} TEMP`);cap.push(max?`${Math.round(ratio*100)}%`:'HP NOT SET');addText(hpRow,'combat-hp-caption',cap.join(' · '));body.appendChild(hpRow);const track=document.createElement('div');track.className='combat-hp-track';const fill=document.createElement('div');fill.className='combat-hp-fill';fill.style.width=`${ratio*100}%`;track.appendChild(fill);body.appendChild(track);
    if(observer()){const q=document.createElement('div');q.className='combat-quick-hp';for(const [txt,delta] of [['−5',-5],['−1',-1],['+1',1],['+5',5]]){const b=document.createElement('button');b.type='button';b.textContent=txt;b.addEventListener('click',()=>mutate(`${character.name} HP ${delta>0?'+':''}${delta}`,()=>{const p=combatState.players[character.id];p.currentHp=clamp(p.currentHp+delta,0,p.maxHp||99999);p.updatedAt=new Date().toISOString();}));q.appendChild(b);}body.appendChild(q);}
    if(current<=0||data.deathSuccess||data.deathFailure){const ds=document.createElement('div');ds.className='combat-death-saves';ds.innerHTML=`<span>DEATH SAVES</span><b class="success">✓ ${data.deathSuccess}/3</b><b class="failure">✕ ${data.deathFailure}/3</b>`;body.appendChild(ds);}
    if(data.concentration){const c=addText(body,'combat-concentration',`CONCENTRATION · ${data.concentration}`);c.title='Concentration';}
    const statuses=[...data.statuses,...data.customStatuses];const statusSec=document.createElement('div');statusSec.className='combat-section-mini';addText(statusSec,'combat-mini-title','STATUS');const statusList=document.createElement('div');statusList.className='combat-status-list';if(statuses.length){statuses.slice(0,6).forEach(s=>{const chip=addText(statusList,'combat-status-chip',data.statuses.includes(s)?statusAbbrev(s):s);chip.title=s;});if(statuses.length>6)addText(statusList,'combat-status-chip',`+${statuses.length-6}`);}else addText(statusList,'combat-none','NONE');statusSec.appendChild(statusList);body.appendChild(statusSec);
    if(data.resources.length){const rs=document.createElement('div');rs.className='combat-resource-list';for(const r of data.resources.slice(0,3)){const x=document.createElement('span');x.innerHTML=`<b>${r.name}</b> ${r.current}/${r.max}`;rs.appendChild(x);}body.appendChild(rs);}
    const slotSec=document.createElement('div');slotSec.className='combat-section-mini';addText(slotSec,'combat-mini-title','SPELL SLOTS');const slotList=document.createElement('div');slotList.className='combat-slot-list';const slots=Object.entries(data.spellSlots).map(([l,s])=>[Number(l),s]).filter(([,s])=>s.max>0).sort((a,b)=>a[0]-b[0]);if(slots.length){for(const [level,s] of slots){const wrap=document.createElement('span');wrap.className='combat-slot-chip';wrap.innerHTML=`<b>L${level}</b><span>${s.remaining}/${s.max}</span>`;if(observer()){const minus=document.createElement('button');minus.type='button';minus.textContent='−';minus.title=`Spend level ${level} slot`;minus.disabled=s.remaining<=0;minus.addEventListener('click',()=>mutate(`${character.name} spent L${level} slot`,()=>{combatState.players[character.id].spellSlots[level].remaining=Math.max(0,combatState.players[character.id].spellSlots[level].remaining-1);}));const plus=document.createElement('button');plus.type='button';plus.textContent='+';plus.title=`Restore level ${level} slot`;plus.disabled=s.remaining>=s.max;plus.addEventListener('click',()=>mutate(`${character.name} restored L${level} slot`,()=>{combatState.players[character.id].spellSlots[level].remaining=Math.min(s.max,combatState.players[character.id].spellSlots[level].remaining+1);}));wrap.append(minus,plus);}slotList.appendChild(wrap);}}else addText(slotList,'combat-none','NO SLOTS SET');slotSec.appendChild(slotList);body.appendChild(slotSec);
    const turnTools=document.createElement('div');turnTools.className='combat-turn-tools';
    const economy=[['ACTION','actionAvailable'],['BONUS','bonusAvailable'],['MOVE','movementAvailable'],['REACTION','reactionAvailable']];
    for(const [label,key] of economy){const ready=data[key]!==false;const s=document.createElement('span');s.className=ready?'ready':'spent';s.textContent=`${label} ${ready?'READY':'SPENT'}`;if(observer()){s.addEventListener('click',()=>mutate(`${character.name} ${label.toLowerCase()} ${ready?'spent':'restored'}`,()=>{combatState.players[character.id][key]=!ready;}));}turnTools.appendChild(s);}body.appendChild(turnTools);
    addText(body,'combat-updated',timestampLabel(data.updatedAt));card.append(portraitWrap,body);frag.appendChild(card);
  }combatGrid.appendChild(frag);setHistoryLabel();}

function renderOrderEditor(){
  if(!orderList)return;
  orderList.replaceChildren();
  draftTurnOrder.forEach((id,index)=>{
    const c=CHARACTERS.find(x=>x.id===id);if(!c)return;
    const p=normalizePlayer(combatState.players?.[id]);
    const row=document.createElement('div');row.className='combat-order-row';row.style.setProperty('--char-color',c.color);row.draggable=true;row.dataset.id=id;
    const grip=document.createElement('span');grip.className='combat-order-grip';grip.textContent='⋮⋮';
    const rank=document.createElement('span');rank.className='combat-order-rank';rank.textContent=String(index+1).padStart(2,'0');
    const img=document.createElement('img');img.src=c.image;img.alt='';img.decoding='async';
    const info=document.createElement('div');info.className='combat-order-info';const name=document.createElement('strong');name.textContent=c.name;const sub=document.createElement('small');sub.textContent=`INITIATIVE ${p.initiative}`;info.append(name,sub);
    const moves=document.createElement('div');moves.className='combat-order-moves';
    const up=document.createElement('button');up.type='button';up.textContent='↑';up.title='Move earlier';up.disabled=index===0;up.addEventListener('click',()=>{[draftTurnOrder[index-1],draftTurnOrder[index]]=[draftTurnOrder[index],draftTurnOrder[index-1]];renderOrderEditor();});
    const down=document.createElement('button');down.type='button';down.textContent='↓';down.title='Move later';down.disabled=index===draftTurnOrder.length-1;down.addEventListener('click',()=>{[draftTurnOrder[index+1],draftTurnOrder[index]]=[draftTurnOrder[index],draftTurnOrder[index+1]];renderOrderEditor();});
    moves.append(up,down);row.append(grip,rank,img,info,moves);
    row.addEventListener('dragstart',e=>{row.classList.add('is-dragging');e.dataTransfer?.setData('text/plain',id);if(e.dataTransfer)e.dataTransfer.effectAllowed='move';});
    row.addEventListener('dragend',()=>row.classList.remove('is-dragging'));
    row.addEventListener('dragover',e=>{e.preventDefault();row.classList.add('is-drop-target');});
    row.addEventListener('dragleave',()=>row.classList.remove('is-drop-target'));
    row.addEventListener('drop',e=>{e.preventDefault();row.classList.remove('is-drop-target');const dragged=e.dataTransfer?.getData('text/plain');if(!dragged||dragged===id)return;const from=draftTurnOrder.indexOf(dragged),to=draftTurnOrder.indexOf(id);if(from<0||to<0)return;draftTurnOrder.splice(from,1);draftTurnOrder.splice(to,0,dragged);renderOrderEditor();});
    orderList.appendChild(row);
  });
}
function openOrderEditor(){if(!observer()||!orderEditor)return;draftTurnOrder=initiativeOrder().map(c=>c.id);renderOrderEditor();orderEditor.hidden=false;document.body.classList.add('combat-editor-open');}
function closeOrderEditor(){if(!orderEditor)return;orderEditor.hidden=true;draftTurnOrder=[];document.body.classList.remove('combat-editor-open');}
orderBtn?.addEventListener('click',openOrderEditor);
orderEditor?.querySelectorAll('[data-order-close]').forEach(e=>e.addEventListener('click',closeOrderEditor));
orderSort?.addEventListener('click',()=>{draftTurnOrder=[...CHARACTERS].sort((a,b)=>(combatState.players[b.id]?.initiative||0)-(combatState.players[a.id]?.initiative||0)||CHARACTERS.indexOf(a)-CHARACTERS.indexOf(b)).map(c=>c.id);renderOrderEditor();});
orderReset?.addEventListener('click',()=>{draftTurnOrder=CHARACTERS.map(c=>c.id);renderOrderEditor();});
orderSave?.addEventListener('click',async()=>{if(!observer()||draftTurnOrder.length!==CHARACTERS.length)return;const next=[...draftTurnOrder];closeOrderEditor();await mutate('Updated turn order',()=>{combatState.encounter.order=next;});});

function buildStatusEditor(selected){statusEditor.replaceChildren();for(const status of STATUS_OPTIONS){const l=document.createElement('label');l.className='combat-status-option';const i=document.createElement('input');i.type='checkbox';i.value=status;i.checked=selected.includes(status);l.append(i,document.createTextNode(status));statusEditor.appendChild(l);}}
function buildSlotEditor(slots){slotEditor.replaceChildren();for(let level=1;level<=9;level++){const s=slots?.[level]??slots?.[String(level)]??{remaining:0,max:0};const row=document.createElement('div');row.className='combat-slot-field';row.innerHTML=`<strong>L${level}</strong>`;const a=document.createElement('label');a.textContent='LEFT';const ai=document.createElement('input');ai.type='number';ai.min='0';ai.value=s.remaining||0;ai.dataset.slotRemaining=level;a.appendChild(ai);const b=document.createElement('label');b.textContent='MAX';const bi=document.createElement('input');bi.type='number';bi.min='0';bi.value=s.max||0;bi.dataset.slotMax=level;b.appendChild(bi);row.append(a,b);slotEditor.appendChild(row);}}
function buildResourceEditor(resources){resourceEditor.replaceChildren();for(let n=0;n<4;n++){const r=resources[n]||{name:'',current:0,max:0,reset:'long'};const row=document.createElement('div');row.className='combat-resource-row';const name=document.createElement('input');name.placeholder='Resource name';name.value=r.name;name.dataset.resourceName=n;const cur=document.createElement('input');cur.type='number';cur.min='0';cur.value=r.current;cur.dataset.resourceCurrent=n;const max=document.createElement('input');max.type='number';max.min='0';max.value=r.max;max.dataset.resourceMax=n;const reset=document.createElement('select');reset.dataset.resourceReset=n;reset.innerHTML='<option value="none">No reset</option><option value="short">Short rest</option><option value="long">Long rest</option>';reset.value=r.reset;row.append(name,cur,max,reset);resourceEditor.appendChild(row);}}
function openEditor(id){if(!observer())return;const c=CHARACTERS.find(x=>x.id===id);if(!c)return;activeEditorId=id;const d=normalizePlayer(combatState.players[id]);editor.querySelector('.combat-editor-panel')?.style.setProperty('--char-color',c.color);editorTitle.textContent=`EDIT ${c.name}`;editorName.textContent=c.name;editorPortrait.src=c.image;editorPortrait.alt=`${c.name} portrait`;currentHpInput.value=d.currentHp;maxHpInput.value=d.maxHp;tempHpInput.value=d.tempHp;initiativeInput.value=d.initiative;acInput.value=d.ac;speedInput.value=d.speed;passiveInput.value=d.passive;deathSuccessInput.value=d.deathSuccess;deathFailureInput.value=d.deathFailure;reactionInput.checked=d.reactionAvailable;concentrationInput.value=d.concentration;dmOnlyNoteInput.value=d.dmNote;buildStatusEditor(d.statuses);customStatusesInput.value=d.customStatuses.join(', ');buildSlotEditor(d.spellSlots);buildResourceEditor(d.resources);editor.hidden=false;document.body.classList.add('combat-editor-open');currentHpInput.focus({preventScroll:true});}
function closeEditor(){editor.hidden=true;activeEditorId=null;document.body.classList.remove('combat-editor-open');}
editor?.querySelectorAll('[data-combat-close]').forEach(e=>e.addEventListener('click',closeEditor));document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(editor&&!editor.hidden)closeEditor();if(orderEditor&&!orderEditor.hidden)closeOrderEditor();});
editor?.querySelectorAll('[data-hp-delta]').forEach(b=>b.addEventListener('click',()=>{const delta=Number(b.dataset.hpDelta)||0,max=Math.max(0,Number(maxHpInput.value)||0);currentHpInput.value=clamp((Number(currentHpInput.value)||0)+delta,0,max||99999);}));
function collectEditor(){const maxHp=Math.max(0,Math.round(Number(maxHpInput.value)||0)),currentHp=clamp(Math.round(Number(currentHpInput.value)||0),0,maxHp||99999);const statuses=[...statusEditor.querySelectorAll('input:checked')].map(i=>i.value).slice(0,24);const customStatuses=customStatusesInput.value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,12);const spellSlots={};for(let l=1;l<=9;l++){const max=Math.max(0,Math.round(Number(slotEditor.querySelector(`[data-slot-max="${l}"]`)?.value)||0));const remaining=clamp(Math.round(Number(slotEditor.querySelector(`[data-slot-remaining="${l}"]`)?.value)||0),0,max);if(max>0)spellSlots[l]={remaining,max};}const resources=[];for(let n=0;n<4;n++){const name=resourceEditor.querySelector(`[data-resource-name="${n}"]`)?.value.trim()||'',max=Math.max(0,Math.round(Number(resourceEditor.querySelector(`[data-resource-max="${n}"]`)?.value)||0)),current=clamp(Math.round(Number(resourceEditor.querySelector(`[data-resource-current="${n}"]`)?.value)||0),0,max||99999),reset=resourceEditor.querySelector(`[data-resource-reset="${n}"]`)?.value||'long';if(name||max>0)resources.push({name:name||`Resource ${n+1}`,current,max,reset});}return {currentHp,maxHp,tempHp:Math.max(0,Math.round(Number(tempHpInput.value)||0)),deathSuccess:clamp(Math.round(Number(deathSuccessInput.value)||0),0,3),deathFailure:clamp(Math.round(Number(deathFailureInput.value)||0),0,3),statuses,customStatuses,concentration:concentrationInput.value.trim().slice(0,60),spellSlots,resources,initiative:Math.round(Number(initiativeInput.value)||0),ac:Math.max(0,Math.round(Number(acInput.value)||0)),speed:Math.max(0,Math.round(Number(speedInput.value)||0)),passive:Math.max(0,Math.round(Number(passiveInput.value)||0)),actionAvailable:combatState.players[activeEditorId]?.actionAvailable!==false,bonusAvailable:combatState.players[activeEditorId]?.bonusAvailable!==false,movementAvailable:combatState.players[activeEditorId]?.movementAvailable!==false,reactionAvailable:reactionInput.checked,dmNote:dmOnlyNoteInput.value.trim().slice(0,500),updatedAt:new Date().toISOString()};}
saveBtn?.addEventListener('click',async()=>{if(!activeEditorId||!observer())return;const id=activeEditorId,c=CHARACTERS.find(x=>x.id===id);markMutation(`Edited ${c?.name||id}`);combatState.players[id]=collectEditor();closeEditor();await pushCloud();});

function showTurnSplash(id){
  const c=CHARACTERS.find(x=>x.id===id);if(!c||!isCombatActive())return;
  turnSplashCard.style.setProperty('--char-color',c.color);
  turnSplashPortrait.src=c.image;turnSplashPortrait.alt=`${c.name} portrait`;
  turnSplashName.textContent=`${c.name.toUpperCase()} · YOUR TURN`;
  turnSplashQuote.textContent=c.quote;
  turnSplashRound.textContent=`ROUND ${combatState.encounter.round}`;
  clearTimeout(splashTimer);
  turnSplash.hidden=false;
  turnSplash.classList.remove('is-showing','is-leaving');
  requestAnimationFrame(()=>requestAnimationFrame(()=>turnSplash.classList.add('is-showing')));
  splashTimer=setTimeout(()=>hideTurnSplash(false),3000);
}
turnSplash?.addEventListener('click',()=>hideTurnSplash(false));


async function advanceTurn(direction=1){if(!observer())return;const order=initiativeOrder();if(!order.length)return;markMutation(direction>0?'Next turn':'Previous turn');let idx=order.findIndex(c=>c.id===combatState.encounter.activeId);if(!combatState.encounter.started||idx<0){combatState.encounter.started=true;combatState.encounter.round=1;idx=direction>0?0:order.length-1;}else{idx+=direction;if(idx>=order.length){idx=0;combatState.encounter.round++;}if(idx<0){idx=order.length-1;combatState.encounter.round=Math.max(1,combatState.encounter.round-1);}}combatState.encounter.activeId=order[idx].id;combatState.encounter.turnSerial++;combatState.players[order[idx].id].actionAvailable=true;combatState.players[order[idx].id].bonusAvailable=true;combatState.players[order[idx].id].movementAvailable=true;combatState.players[order[idx].id].reactionAvailable=true;announceTurnIfNew();await pushCloud();}
$('combatStartTurn')?.addEventListener('click',async()=>{if(!observer())return;if(!combatState.encounter.started){await advanceTurn(1);}else if(combatState.encounter.activeId){markMutation('Re-announced active turn');combatState.encounter.turnSerial++;announceTurnIfNew();await pushCloud();}});$('combatNextTurn')?.addEventListener('click',()=>advanceTurn(1));$('combatPrevTurn')?.addEventListener('click',()=>advanceTurn(-1));
$('combatEndCombat')?.addEventListener('click',()=>mutate('Ended combat',()=>{combatState.encounter.started=false;combatState.encounter.activeId=null;combatState.encounter.round=1;combatState.encounter.turnSerial++;}));
$('combatUndo')?.addEventListener('click',async()=>{if(!observer())return;const hist=combatState.encounter.history||[];const last=hist.pop();if(!last)return;const remaining=[...hist];const restored=normalizeState(last.snapshot);combatState.players=restored.players;combatState.encounter={...restored.encounter,history:remaining};await pushCloud();});
$('combatShortRest')?.addEventListener('click',()=>mutate('Short rest',()=>{for(const c of CHARACTERS){const p=combatState.players[c.id];p.resources=p.resources.map(r=>r.reset==='short'?{...r,current:r.max}:r);}}));
$('combatLongRest')?.addEventListener('click',()=>mutate('Long rest',()=>{for(const c of CHARACTERS){const p=combatState.players[c.id];if(p.maxHp)p.currentHp=p.maxHp;p.tempHp=0;p.deathSuccess=0;p.deathFailure=0;p.spellSlots=Object.fromEntries(Object.entries(p.spellSlots).map(([l,s])=>[l,{...s,remaining:s.max}]));p.resources=p.resources.map(r=>r.reset==='short'||r.reset==='long'?{...r,current:r.max}:r);p.updatedAt=new Date().toISOString();}}));
function toggleTv(on,{switching=false}={}){
  if(on){
    if(!isCombatActive())switchView('combat');
    document.body.classList.add('combat-screen-active');
    mainDashboard.hidden=true;
    combatView.hidden=false;
    startCombatRealtime();
  }
  document.body.classList.toggle('combat-tv',on);
  try{localStorage.setItem(TV_KEY,on?'1':'0');}catch{}
  if(on&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});
  if(!on&&!switching&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  emitViewLifecycle(on?'combat':(isCombatActive()?'combat':'terminal'));
}
$('combatTvMode')?.addEventListener('click',()=>toggleTv(true));$('combatTvExit')?.addEventListener('click',()=>toggleTv(false));document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('combat-tv')){document.body.classList.remove('combat-tv');try{localStorage.setItem(TV_KEY,'0');}catch{}emitViewLifecycle(isCombatActive()?'combat':'terminal');}});

updateObserverMode();
renderCombat();
let initialView='terminal';
try{initialView=localStorage.getItem(VIEW_KEY)==='combat'?'combat':'terminal';}catch{}
switchView(initialView,{persist:false});
try{
  if(initialView==='combat'&&localStorage.getItem(TV_KEY)==='1'){
    document.body.classList.add('combat-tv');
    emitViewLifecycle('combat');
  }
}catch{}

