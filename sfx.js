/* Soul Seekers v34 — cinematic SFX engine.
   Design goals:
   - One small, centralized audio router instead of scattered <audio> tags.
   - UI sounds stay local and quiet.
   - Cinematic sounds play on the armed TV; DM preview is opt-in.
   - Combat/scene sounds are derived from authoritative state, so two clients agree.
   - Reconnects and first snapshots do not replay stale effects.
*/
import { isTvClient } from './firebase.js';

const BUILD='v36';
const PREVIEW_KEY='soulSeekersSfxPreviewV34';
const UI_KEY='soulSeekersUiSfxV34';
const UI_VOL_KEY='soulSeekersUiSfxVolumeV34';

const CUES = Object.freeze({
  'ui-select':       {src:'assets/sfx/ui-select.mp3', gain:.22, gap:70, duck:0},
  'ui-click':        {src:'assets/sfx/ui-click.mp3', gain:.14, gap:85, duck:0},
  'ui-confirm':      {src:'assets/sfx/ui-confirm.mp3', gain:.18, gap:100, duck:0},
  'scene-shift':     {src:'assets/sfx/scene-shift.mp3', gain:.42, gap:550, duck:.30, duckMs:850},
  'turn-reveal':     {src:'assets/sfx/turn-reveal.mp3', gain:.60, gap:650, duck:.46, duckMs:1500},
  'boss-reveal':     {src:'assets/sfx/boss-reveal.mp3', gain:.62, gap:900, duck:.52, duckMs:1900},
  'damage-light':    {src:'assets/sfx/damage-light.mp3', gain:.34, gap:90, duck:.12, duckMs:360},
  'damage-heavy-1':  {src:'assets/sfx/damage-heavy-1.mp3', gain:.44, gap:140, duck:.20, duckMs:520},
  'damage-heavy-2':  {src:'assets/sfx/damage-heavy-2.mp3', gain:.44, gap:140, duck:.20, duckMs:520},
  'damage-heavy-3':  {src:'assets/sfx/damage-heavy-3.mp3', gain:.44, gap:140, duck:.20, duckMs:520},
  'critical':        {src:'assets/sfx/critical.mp3', gain:.52, gap:420, duck:.38, duckMs:1000},
  'critical-burst':  {src:'assets/sfx/critical-burst.mp3', gain:.54, gap:1200, duck:.58, duckMs:2400},
  'heal':            {src:'assets/sfx/heal.mp3', gain:.36, gap:220, duck:.10, duckMs:420},
  'spell-charge':    {src:'assets/sfx/spell-charge.mp3', gain:.40, gap:300, duck:.14, duckMs:620},
  'spell-impact':    {src:'assets/sfx/spell-impact.mp3', gain:.48, gap:400, duck:.28, duckMs:900},
  'elemental-impact':{src:'assets/sfx/elemental-impact.mp3', gain:.46, gap:420, duck:.28, duckMs:900},
  'lightning':       {src:'assets/sfx/lightning.mp3', gain:.48, gap:420, duck:.30, duckMs:820},
  'gunshot':         {src:'assets/sfx/gunshot.mp3', gain:.42, gap:300, duck:.24, duckMs:700},
  'gun-cock':        {src:'assets/sfx/gun-cock.mp3', gain:.32, gap:220, duck:.08, duckMs:350},
  'reload':          {src:'assets/sfx/reload.mp3', gain:.30, gap:650, duck:.05, duckMs:500},
  'revolver-spin':   {src:'assets/sfx/revolver-spin.mp3', gain:.28, gap:700, duck:.05, duckMs:500},
  'bow':             {src:'assets/sfx/bow.mp3', gain:.38, gap:350, duck:.12, duckMs:560},
  'summon':          {src:'assets/sfx/summon.mp3', gain:.42, gap:850, duck:.32, duckMs:1500},
  'summon-alt':      {src:'assets/sfx/summon-alt.mp3', gain:.40, gap:700, duck:.24, duckMs:1100},
  'victory':         {src:'assets/sfx/victory.mp3', gain:.55, gap:1200, duck:.35, duckMs:1700},
  'void-wash':       {src:'assets/sfx/void-wash.mp3', gain:.32, gap:700, duck:.18, duckMs:1000}
});

const UI_CUES = new Set(['ui-select','ui-click','ui-confirm']);
const pools = new Map();
const lastPlay = new Map();
let unlocked=false;
let uiEnabled=localStorage.getItem(UI_KEY)!=='0';
let uiVolume=Math.max(0,Math.min(1,Number(localStorage.getItem(UI_VOL_KEY) ?? .72)));
let previewEnabled=localStorage.getItem(PREVIEW_KEY)==='1';
let sessionSettings={enabled:true,volume:72,serial:0,cue:'',id:'',issuedAtMs:0};
let sessionPrimed=false;
const seenSfx=new Set(JSON.parse(sessionStorage.getItem('soulSeekersSeenSfxV35')||'[]'));
let lastStageSerial=null;
let lastSessionSerial=-1;
let lastCombat=null;
let pendingTurn=null;
let heavyVariant=0;
let lastTurnSoundSerial=(()=>{try{return Math.max(0,Number(sessionStorage.getItem('soulSeekersSfxTurnSerialV34'))||0);}catch{return 0;}})();

function now(){return performance.now?.() ?? Date.now();}
function clone(v){return typeof structuredClone==='function'?structuredClone(v):JSON.parse(JSON.stringify(v));}
function cueInfo(name){return CUES[name]||null;}
function cinematicTarget(){
  if(isTvClient || window.SoulSeekerSession?.isTv?.()) return Boolean(window.SoulSeekerSession?.isAudioArmed?.() || unlocked);
  return previewEnabled;
}
function getVoice(info){
  let pool=pools.get(info.src);
  if(!pool){pool=[];pools.set(info.src,pool);}
  let voice=pool.find(v=>v.audio.paused||v.audio.ended);
  if(!voice && pool.length<4){
    const audio=new Audio(info.src);audio.preload='auto';audio.playsInline=true;
    voice={audio,usedAt:0};pool.push(voice);
  }
  if(!voice){voice=[...pool].sort((a,b)=>a.usedAt-b.usedAt)[0];try{voice.audio.pause();voice.audio.currentTime=0;}catch{}}
  voice.usedAt=Date.now();return voice.audio;
}
function rateLimited(name,force=false){
  if(force)return false;
  const info=cueInfo(name);if(!info)return true;
  const t=now(),last=lastPlay.get(name)||-Infinity;
  if(t-last<info.gap)return true;
  lastPlay.set(name,t);return false;
}
function duckMusic(info){
  if(!info?.duck)return;
  try{window.SoulSeekerMusic?.duck?.(info.duck,info.duckMs||700);}catch{}
}
async function play(name,{volume=1,rate=1,force=false,ui=false,duck=true}={}){
  const info=cueInfo(name);if(!info)return false;
  if(ui){if(!uiEnabled)return false;}else if(!cinematicTarget())return false;
  if(rateLimited(name,force))return false;
  const master=ui?uiVolume:(sessionSettings.enabled?Math.max(0,Math.min(1,(sessionSettings.volume||0)/100)):0);
  if(master<=0)return false;
  const audio=getVoice(info);
  try{
    audio.pause();audio.currentTime=0;audio.playbackRate=Math.max(.72,Math.min(1.28,Number(rate)||1));
    audio.volume=Math.max(0,Math.min(1,info.gain*master*Math.max(0,Math.min(1.25,Number(volume)||1))));
    if(duck&&!ui)duckMusic(info);
    const result=audio.play();if(result?.catch)await result.catch(()=>false);
    return true;
  }catch{return false;}
}
function playUi(name='ui-click',opts={}){return play(UI_CUES.has(name)?name:'ui-click',{...opts,ui:true,duck:false});}
function playCinematic(name,opts={}){return play(name,{...opts,ui:false});}
function setPreviewEnabled(on){previewEnabled=Boolean(on);try{localStorage.setItem(PREVIEW_KEY,previewEnabled?'1':'0');}catch{}return previewEnabled;}
function setUiEnabled(on){uiEnabled=Boolean(on);try{localStorage.setItem(UI_KEY,uiEnabled?'1':'0');}catch{}return uiEnabled;}
function setUiVolume(value){uiVolume=Math.max(0,Math.min(1,Number(value)||0));try{localStorage.setItem(UI_VOL_KEY,String(uiVolume));}catch{}return uiVolume;}
async function unlock(){
  unlocked=true;
  // Warm one tiny cached voice during the user gesture. It is effectively inaudible.
  const info=cueInfo('ui-select');if(!info)return true;
  try{const audio=getVoice(info);audio.volume=.001;audio.currentTime=0;await audio.play();audio.pause();audio.currentTime=0;return true;}catch{return false;}
}

function isCombatView(){return document.body.dataset.view==='combat'||document.body.classList.contains('combat-screen-active');}
function sumSlots(p={}){return Object.values(p.spellSlots||{}).reduce((n,s)=>n+Math.max(0,Number(s?.remaining)||0),0);}
function statuses(p={}){return [...(p.statuses||[]),...(p.customStatuses||[])];}
function chooseCombatCue(previous,next){
  if(!previous||!next)return null;
  let best=null;
  const rank={critical:100,'damage-heavy':80,'damage-light':60,heal:50,status:40,spell:30};
  for(const [id,p] of Object.entries(next.players||{})){
    const old=previous.players?.[id];if(!old)continue;
    const oldHp=Number(old.currentHp)||0,newHp=Number(p.currentHp)||0,max=Math.max(0,Number(p.maxHp)||0);
    if(newHp<oldHp){
      const damage=oldHp-newHp,ratio=max?damage/max:0;
      const type=(oldHp>0&&newHp<=0)||(max&&newHp/max<=.25&&oldHp/max>.25)?'critical':ratio>=.18?'damage-heavy':'damage-light';
      const item={type,id,damage,ratio};if(!best||rank[type]>rank[best.type])best=item;
    }else if(newHp>oldHp){const item={type:'heal',id,amount:newHp-oldHp};if(!best||rank.heal>rank[best.type])best=item;}
    const oldFail=Number(old.deathFailure)||0,newFail=Number(p.deathFailure)||0;
    if(newFail>oldFail){const item={type:'critical',id};if(!best||rank.critical>rank[best.type])best=item;}
    const beforeStatuses=statuses(old).length,afterStatuses=statuses(p).length;
    if(afterStatuses>beforeStatuses){const item={type:'status',id};if(!best||rank.status>rank[best.type])best=item;}
    if(sumSlots(p)<sumSlots(old)||(!old.concentration&&p.concentration)){const item={type:'spell',id};if(!best||rank.spell>rank[best.type])best=item;}
  }
  return best;
}
function fireCombatCue(item){
  if(!item||!isCombatView())return;
  if(item.type==='critical')return void playCinematic('critical',{volume:1});
  if(item.type==='damage-heavy'){
    heavyVariant=(heavyVariant%3)+1;return void playCinematic(`damage-heavy-${heavyVariant}`,{volume:.95});
  }
  if(item.type==='damage-light')return void playCinematic('damage-light',{volume:.9});
  if(item.type==='heal')return void playCinematic('heal',{volume:.85});
  if(item.type==='status')return void playCinematic('critical',{volume:.55});
  if(item.type==='spell')return void playCinematic('spell-charge',{volume:.62});
}
function rememberTurnSound(serial){
  lastTurnSoundSerial=Math.max(lastTurnSoundSerial,Number(serial)||0);
  try{sessionStorage.setItem('soulSeekersSfxTurnSerialV34',String(lastTurnSoundSerial));}catch{}
}
function queueOrPlayTurn(next){
  const serial=Number(next.encounter?.turnSerial)||0;
  const issued=Number(next.encounter?.turnIssuedAtMs)||0;
  if(!next.encounter?.activeId||serial<=lastTurnSoundSerial||!issued||Date.now()-issued>=7000)return false;
  rememberTurnSound(serial);
  pendingTurn={serial,issued};
  if(isCombatView()){void playCinematic('turn-reveal',{volume:1});pendingTurn=null;}
  return true;
}
function onCombatState(raw){
  const next=clone(raw||{});
  if(!lastCombat){lastCombat=next;queueOrPlayTurn(next);return;}
  const old=lastCombat;lastCombat=next;
  const oldSerial=Number(old.encounter?.turnSerial)||0,newSerial=Number(next.encounter?.turnSerial)||0;
  if(newSerial>oldSerial && queueOrPlayTurn(next))return; // Turn reset changes should not also create combat-noise clutter.
  fireCombatCue(chooseCombatCue(old,next));
}

function handleSessionState(state){
  const s=state?.sfx||{};
  const rawVolume=Number(s.volume);
  sessionSettings={...sessionSettings,...s,volume:Number.isFinite(rawVolume)?Math.max(0,Math.min(100,rawVolume)):72,enabled:s.enabled!==false};
  const serial=Math.max(0,Number(s.serial)||0);
  if(!sessionPrimed){sessionPrimed=true;lastSessionSerial=serial;return;}
  if(serial<=lastSessionSerial || seenSfx.has(s.id))return;
  lastSessionSerial=serial;
  const issued=Math.max(0,Number(s.issuedAtMs)||0);
  if(!issued||Date.now()-issued>7000)return;
  seenSfx.add(s.id);while(seenSfx.size>64)seenSfx.delete(seenSfx.values().next().value);
  try{sessionStorage.setItem('soulSeekersSeenSfxV35',JSON.stringify([...seenSfx]));}catch{}
  if(s.cue&&cueInfo(s.cue))void playCinematic(s.cue,{volume:Math.max(0,Math.min(1.25,Number(s.eventVolume)||1))});
}

window.addEventListener('soulseekers:stagestate',event=>{
 const next=event.detail;
 if(lastStageSerial===null){lastStageSerial=next.serial;return;}
 if(next.serial<=lastStageSerial)return;
 lastStageSerial=next.serial;
 if(!next.issuedAtMs||Date.now()-next.issuedAtMs>7000)return;
 // Scene changes already provide the transition sting. This cue is for changes
 // to an already-visible Stage, not restored persistent content.
 if(document.body.dataset.view==='stage')void playCinematic(({boss:'boss-reveal',victory:'victory',defeat:'void-wash',revelation:'void-wash',dialogue:'ui-confirm'})[next.kind]||'scene-shift');
});

// Local UI language: tactile but deliberately quiet. Never attach this to typing.
document.addEventListener('pointerdown',event=>{
  const target=event.target?.closest?.('button,[role="tab"],summary');
  if(!target||target.disabled||target.getAttribute('aria-disabled')==='true')return;
  let cue=target.dataset.sfx;
  if(!cue){
    if(target.matches('[role="tab"],.desktop-tab'))cue='ui-select';
    else if(target.classList.contains('primary')||target.classList.contains('dm-take-live')||target.classList.contains('combat-save-btn'))cue='ui-confirm';
    else cue='ui-click';
  }
  if(cue!=='none')void playUi(cue);
},{capture:true,passive:true});
document.addEventListener('change',event=>{
  if(event.target?.matches?.('select,input[type="checkbox"]'))void playUi('ui-select',{volume:.75});
},{capture:true});

window.addEventListener('soulseekers:combatstate',event=>onCombatState(event.detail));
window.addEventListener('soulseekers:sessionstate',event=>handleSessionState(event.detail));
window.addEventListener('soulseekers:viewchange',event=>{
  if(event.detail?.view==='combat'&&pendingTurn&&Date.now()-pendingTurn.issued<7000){void playCinematic('turn-reveal',{volume:1});pendingTurn=null;}
});

window.SoulSeekerSFX={
  build:BUILD,
  cues:Object.keys(CUES),
  playUi,playCinematic,unlock,
  setPreviewEnabled,getPreviewEnabled:()=>previewEnabled,
  setUiEnabled,getUiEnabled:()=>uiEnabled,setUiVolume,getUiVolume:()=>uiVolume,
  getSessionSettings:()=>({...sessionSettings}),
  preview:(name)=>play(name,{ui:false,force:true}),
  cueExists:name=>Boolean(cueInfo(name))
};
window.dispatchEvent(new CustomEvent('soulseekers:sfxready',{detail:{build:BUILD,cues:Object.keys(CUES)}}));
