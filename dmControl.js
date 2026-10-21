import { db, hasDMRole, onRoleChange, isLocalPreview } from './firebase.js';
import { doc, onSnapshot, setDoc, serverTimestamp } from './firebaseTransport.js';

const $ = id => document.getElementById(id);
const privateCueRef = doc(db, 'dmState', 'presentation');
const LOCAL_QUEUE_KEY='soulSeekersLocalCueQueueV34';
const authGate = $('dmAuthGate');
const dashboard = $('dmControlDashboard');
const authMessage = $('dmAuthMessage');
const roleBadge = $('dmRoleBadge');
const preview = $('dmPreviewScreen');
const previewScene = $('dmPreviewScene');
const previewTitle = $('dmPreviewTitle');
const previewBody = $('dmPreviewBody');
const broadcastTarget = $('dmBroadcastTarget');
const transitionSelect = $('dmTransitionSelect');
const deviceList = $('dmDeviceList');
const deviceSummary = $('dmDeviceSummary');
const combatCurrent = $('dmCombatCurrent');
const combatRoster = $('dmCombatRoster');
const trackSelect = $('dmTrackSelect');
const volumeInput = $('dmAudioVolume');
const fadeInput = $('dmAudioFade');
const previewAudio = $('dmPreviewAudio');
const sfxEnabled = $('dmSfxEnabled');
const sfxVolume = $('dmSfxVolume');
const sfxVolumeValue = $('dmSfxVolumeValue');
const sfxPreview = $('dmSfxPreview');
const queueList = $('dmCueQueue');
const directorUndoBtn = $('dmDirectorUndo');
let privateCueUnsub = null;
let devicesUnsub = null;
let queuedCues = [];
let combatState = null;
let sessionState = null;
let stageState = null;
const directorHistory = [];

function setAuthMessage(text, error = false) {
  if (!authMessage) return;
  authMessage.textContent = text;
  if(error)window.dispatchEvent(new CustomEvent('soulseekers:toast',{detail:{message:text}}));
  authMessage.classList.toggle('is-error', error);
}
function setDMView(dm, { roleChecked = false, authError = null, localPreview = false } = {}) {
  if (authGate) authGate.hidden = dm;
  if (dashboard) dashboard.hidden = false;
  if (roleBadge) roleBadge.textContent = dm ? (localPreview ? 'DIRECTOR / LOCAL PREVIEW' : 'DIRECTOR / TRUSTED') : (roleChecked ? 'DIRECTOR / SETUP NEEDED' : 'DIRECTOR / CONNECTING');
  document.body.classList.toggle('dm-authorized', dm);
  dashboard?.querySelectorAll('button,input,select,textarea').forEach(el => {el.disabled = !dm;});
  if (dm) {
    setAuthMessage(localPreview ? 'Local director preview ready. Cloud-required actions will sync when Firebase is available.' : 'Trusted-table director mode ready. No password required.');
    startPrivateCueSync();
    startDeviceMonitor();
    window.SoulSeekerCombat?.sanitizePublicState?.().catch(() => {});
  } else {
    stopPrivateCueSync();
    stopDeviceMonitor();
    if (roleChecked) {
      const code = authError?.code || '';
      const text = code.includes('permission-denied')
        ? 'Director auto-enrollment was blocked. Publish the v34 firestore.rules file.'
        : (code.includes('auth/')
          ? 'Anonymous Firebase Authentication is required. Enable Anonymous sign-in in Firebase Console.'
          : 'Preparing trusted director mode…');
      setAuthMessage(text, Boolean(authError));
    } else setAuthMessage('Preparing trusted director mode…');
  }
}
onRoleChange(state => setDMView(state.dm, state));

function rememberDirectorState(label) {
  if (!window.SoulSeekerSession) return;
  directorHistory.push({ label, state: window.SoulSeekerSession.getState() });
  if (directorHistory.length > 12) directorHistory.shift();
  if (directorUndoBtn) directorUndoBtn.disabled = !directorHistory.length;
}
async function directorAction(label, action) {
  if (!hasDMRole()) return;
  rememberDirectorState(label);
  try { await action(); }
  catch (error) { console.error(label, error); setAuthMessage(`${label} failed: ${error?.code || error?.message || 'error'}`, true); }
}
directorUndoBtn?.addEventListener('click', async () => {
  const last = directorHistory.pop();
  if (!last) return;
  try { await window.SoulSeekerSession?.restoreState(last.state); }
  catch (error) { console.error('Director undo failed', error); }
  directorUndoBtn.disabled = !directorHistory.length;
});

$('dmTakeLive')?.addEventListener('click', () => directorAction('Broadcast scene', () => window.SoulSeekerSession.broadcastScene(broadcastTarget.value, transitionSelect.value)));
document.querySelectorAll('[data-dm-broadcast]').forEach(button => button.addEventListener('click', () => {
  const scene = button.dataset.dmBroadcast;
  if (broadcastTarget) broadcastTarget.value = scene;
  void directorAction(`Broadcast ${scene}`, () => window.SoulSeekerSession.broadcastScene(scene, transitionSelect?.value || 'ink'));
}));
$('dmClearOverlay')?.addEventListener('click', () => directorAction('Clear overlay', () => window.SoulSeekerSession.clearOverlay()));
$('dmBlackout')?.addEventListener('click', () => directorAction('Blackout TV', () => window.SoulSeekerSession.setBlackout(true)));
$('dmRestorePicture')?.addEventListener('click', () => directorAction('Restore TV', () => window.SoulSeekerSession.setBlackout(false)));
$('dmResync')?.addEventListener('click', async () => {
  const button = $('dmResync'); if (button) button.disabled = true;
  try { await window.SoulSeekerSession?.forceResync(); }
  finally { if (button) button.disabled = false; }
});
$('dmOpenTv')?.addEventListener('click', () => {
  const url = new URL(location.href); url.searchParams.set('tv','1'); url.searchParams.delete('preview');
  window.open(url.toString(), '_blank', 'noopener');
});

function renderPreview() {
  if (!preview) return;
  const scene = sessionState?.broadcast?.scene || 'terminal';
  preview.dataset.scene = scene;
  if (previewScene) previewScene.textContent = `${scene.toUpperCase()} / TV OUTPUT`;
  if (sessionState?.broadcast?.blackout) {
    preview.classList.add('is-blackout'); previewTitle.textContent = 'BLACKOUT'; previewBody.textContent = 'Player display intentionally dark.'; return;
  }
  preview.classList.remove('is-blackout');
  if (sessionState?.overlay?.active && Date.now() < sessionState.overlay.issuedAtMs + sessionState.overlay.durationMs) {
    previewTitle.textContent = sessionState.overlay.title || 'LIVE OVERLAY';
    previewBody.textContent = sessionState.overlay.body || 'Cinematic presentation active.';
  } else if (scene === 'stage') {
    previewTitle.textContent = stageState?.title || 'THE STAGE';
    previewBody.textContent = stageState?.body || 'Presentation stage standing by.';
  } else if (scene === 'combat') {
    const active = combatState?.encounter?.activeId || 'No active turn';
    previewTitle.textContent = active.toUpperCase();
    previewBody.textContent = combatState?.encounter?.started ? `Round ${combatState.encounter.round} · Combat live` : 'Combat board ready';
  } else {
    previewTitle.textContent = 'GROUP TERMINAL';
    previewBody.textContent = 'Messaging + music + session atmosphere';
  }
}
window.addEventListener('soulseekers:sessionstate', event => { sessionState = event.detail; renderPreview(); syncAudioFields(); });
window.addEventListener('soulseekers:stagestate', event => { stageState = event.detail; renderPreview(); });
window.addEventListener('soulseekers:combatstate', event => { combatState = event.detail; renderCombatDirector(); renderPreview(); });

function renderCombatDirector() {
  if (!combatRoster || !combatState) return;
  const characters = window.SoulSeekerCombat?.characters || [];
  const active = combatState.encounter?.activeId;
  if($('combatStartTurn'))$('combatStartTurn').textContent=combatState.encounter?.started?'ANNOUNCE TURN':'START COMBAT';
  if (combatCurrent) combatCurrent.textContent = active ? `ROUND ${combatState.encounter.round} · ${active.toUpperCase()}` : 'NO ACTIVE TURN';
  const fragment = document.createDocumentFragment();
  for (const c of characters) {
    const p = combatState.players?.[c.id] || {};
    const row = document.createElement('button'); row.type='button'; row.className='dm-combat-row'; row.dataset.active=String(active===c.id); row.style.setProperty('--char-color',c.color);
    const img=document.createElement('img');img.src=c.image;img.alt='';
    const info=document.createElement('span');info.innerHTML=`<strong>${c.name}</strong><small>HP ${p.currentHp||0}/${p.maxHp||0} · INIT ${p.initiative||0}</small>`;
    const edit=document.createElement('b');edit.textContent='EDIT';
    row.append(img,info,edit); row.addEventListener('click',()=>window.SoulSeekerCombat?.openEditor?.(c.id)); fragment.appendChild(row);
  }
  combatRoster.replaceChildren(fragment);
}
$('dmCombatPrev')?.addEventListener('click',()=>window.SoulSeekerCombat?.advanceTurn?.(-1));
$('dmCombatStart')?.addEventListener('click',()=>window.SoulSeekerCombat?.startCombat?.());
$('dmCombatNext')?.addEventListener('click',()=>window.SoulSeekerCombat?.advanceTurn?.(1));
$('dmCombatOrder')?.addEventListener('click',()=>window.SoulSeekerCombat?.openOrderEditor?.());
$('dmCombatOpen')?.addEventListener('click',()=>window.SoulSeekerShell?.navigate?.('combat'));
$('dmCombatUndo')?.addEventListener('click',()=>window.SoulSeekerCombat?.undo?.());

function populateTracks(tracks = window.SoulSeekerMusic?.getTracks?.() || []) {
  if (!trackSelect) return;
  const selected = window.SoulSeekerMusic?.getSelected?.()?.id || sessionState?.audio?.trackId || '';
  trackSelect.replaceChildren(...tracks.map(track => { const o=document.createElement('option');o.value=track.id;o.textContent=track.title;return o; }));
  if (selected && [...trackSelect.options].some(o=>o.value===selected)) trackSelect.value=selected;
}
window.addEventListener('soulseekers:musiclibrary', event => populateTracks(event.detail?.tracks || []));
window.addEventListener('soulseekers:musicready', () => populateTracks());
function syncAudioFields(){
  if(volumeInput&&sessionState)volumeInput.value=sessionState.audio.volume;
  if(sessionState?.sfx){
    if(sfxEnabled)sfxEnabled.checked=sessionState.sfx.enabled!==false;
    if(sfxVolume)sfxVolume.value=String(sessionState.sfx.volume ?? 72);
    if(sfxVolumeValue)sfxVolumeValue.value=String(sessionState.sfx.volume ?? 72);
  }
  if(sfxPreview)sfxPreview.checked=Boolean(window.SoulSeekerSFX?.getPreviewEnabled?.());
}
async function sendAudio(partial) {
  const trackId = trackSelect?.value || window.SoulSeekerMusic?.getSelected?.()?.id || '';
  const volume = Number(volumeInput?.value || 70);
  const fadeMs = Number(fadeInput?.value || 0);
  const payload={trackId,volume,fadeMs,...partial};
  await directorAction('Audio cue',()=>window.SoulSeekerSession.setAudio(payload));
  if(previewAudio?.checked){
    window.SoulSeekerMusic?.selectTrackId?.(trackId, Boolean(payload.playing));
    window.SoulSeekerMusic?.setVolume?.(volume,fadeMs);
    if(payload.playing)window.SoulSeekerMusic?.play?.(); else window.SoulSeekerMusic?.pause?.();
  }
}
$('dmAudioPlay')?.addEventListener('click',()=>sendAudio({playing:true}));
$('dmAudioPause')?.addEventListener('click',()=>sendAudio({playing:false}));
$('dmAudioNext')?.addEventListener('click',()=>{
  const tracks=window.SoulSeekerMusic?.getTracks?.()||[];
  if(!tracks.length)return;
  const current=trackSelect?.value||sessionState?.audio?.trackId||'';
  const index=tracks.findIndex(track=>track.id===current);
  const next=tracks[(index+1+tracks.length)%tracks.length];
  if(trackSelect)trackSelect.value=next.id;
  void sendAudio({playing:true});
});
volumeInput?.addEventListener('change',()=>sendAudio({playing:sessionState?.audio?.playing||false}));

function updateSfxVolumeLabel(){ if(sfxVolumeValue&&sfxVolume)sfxVolumeValue.value=String(sfxVolume.value); }
sfxVolume?.addEventListener('input',updateSfxVolumeLabel);
sfxVolume?.addEventListener('change',()=>{
  updateSfxVolumeLabel();
  void directorAction('SFX volume',()=>window.SoulSeekerSession.setSfxSettings({volume:Number(sfxVolume.value||72)}));
});
sfxEnabled?.addEventListener('change',()=>{
  void directorAction('SFX enable',()=>window.SoulSeekerSession.setSfxSettings({enabled:sfxEnabled.checked}));
});
sfxPreview?.addEventListener('change',()=>window.SoulSeekerSFX?.setPreviewEnabled?.(sfxPreview.checked));
window.addEventListener('soulseekers:sfxready',()=>syncAudioFields());
document.querySelectorAll('[data-dm-sfx]').forEach(button=>button.addEventListener('click',()=>{
  const cue=button.dataset.dmSfx;
  if(!cue)return;
  void directorAction(`SFX ${cue}`,()=>window.SoulSeekerSession.triggerSfx(cue));
}));

function readCueForm(){return {
  kind:$('dmCueKind')?.value||'announcement', title:$('dmCueTitle')?.value.trim()||'', body:$('dmCueBody')?.value.trim()||'',
  characterId:$('dmCueCharacter')?.value||'', imageUrl:$('dmCueImage')?.value.trim()||'', durationMs:Number($('dmCueDuration')?.value||4200),
  atmosphere:$('dmCueAtmosphere')?.value||'quiet', subtitle:$('dmCueSubtitle')?.value.trim()||''
};}
function writeCueForm(cue){
  const pairs={dmCueKind:'kind',dmCueTitle:'title',dmCueBody:'body',dmCueCharacter:'characterId',dmCueImage:'imageUrl',dmCueDuration:'durationMs',dmCueAtmosphere:'atmosphere',dmCueSubtitle:'subtitle'};
  for(const [id,key] of Object.entries(pairs)){const el=$(id);if(el&&cue[key]!=null)el.value=cue[key];}
}
$('dmCueOverlay')?.addEventListener('click',()=>{const cue=readCueForm();void directorAction('Presentation overlay',()=>window.SoulSeekerSession.present(cue));});
$('dmCueStage')?.addEventListener('click',async()=>{const cue=readCueForm();await directorAction('Set stage',async()=>{await window.SoulSeekerStage.setStage(cue);await window.SoulSeekerSession.broadcastScene('stage',transitionSelect?.value||'ink');});});
$('dmCueClearStage')?.addEventListener('click',()=>window.SoulSeekerStage?.resetStage?.());
$('dmCueSave')?.addEventListener('click',async()=>{const cue={...readCueForm(),id:crypto.randomUUID?.()||String(Date.now())};queuedCues=[cue,...queuedCues].slice(0,12);await saveQueue();renderQueue();});
async function saveQueue(){
  if(!hasDMRole())return;
  if(isLocalPreview){try{localStorage.setItem(LOCAL_QUEUE_KEY,JSON.stringify(queuedCues));}catch{}}
  try{await setDoc(privateCueRef,{queue:queuedCues,updatedAt:serverTimestamp()},{merge:true});}
  catch(error){if(!isLocalPreview)throw error;}
}
function renderQueue(){
  if(!queueList)return; const frag=document.createDocumentFragment();
  for(const cue of queuedCues){
    const row=document.createElement('div');row.className='dm-cue-item';
    const load=document.createElement('button');load.type='button';
    const title=document.createElement('strong');title.textContent=String(cue.title||'Untitled cue');
    const kind=document.createElement('small');kind.textContent=String(cue.kind||'announcement');
    load.append(title,kind);load.addEventListener('click',()=>writeCueForm(cue));
    const fire=document.createElement('button');fire.type='button';fire.textContent='FIRE';fire.addEventListener('click',()=>directorAction('Queued overlay',()=>window.SoulSeekerSession.present(cue)));
    row.append(load,fire);frag.appendChild(row);
  }
  queueList.replaceChildren(frag);
}
function startPrivateCueSync(){
  if(privateCueUnsub||!hasDMRole())return;
  if(isLocalPreview){try{const q=JSON.parse(localStorage.getItem(LOCAL_QUEUE_KEY)||'[]');queuedCues=Array.isArray(q)?q.slice(0,12):[];renderQueue();}catch{}}
  privateCueUnsub=onSnapshot(privateCueRef,snap=>{queuedCues=Array.isArray(snap.data()?.queue)?snap.data().queue.slice(0,12):queuedCues;renderQueue();},err=>{if(!isLocalPreview)console.warn('Private cue queue unavailable',err);});
}
function stopPrivateCueSync(){privateCueUnsub?.();privateCueUnsub=null;queuedCues=[];renderQueue();}

function timeLabel(value){try{const d=value?.toDate?.()||new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});}catch{return '—';}}
function startDeviceMonitor(){
  if(devicesUnsub||!hasDMRole()||!window.SoulSeekerSession)return;
  devicesUnsub=window.SoulSeekerSession.listenDevices((devices,error)=>{
    if(error){if(deviceSummary)deviceSummary.textContent=`DEVICE MONITOR: ${error.code||'UNAVAILABLE'}`;return;}
    const now=Date.now(); const fresh=devices.filter(d=>{const t=d.lastSeen?.toDate?.()?.getTime?.()||new Date(d.lastSeen).getTime()||0;return t&&now-t<90000;});
    if(deviceSummary)deviceSummary.textContent=`${fresh.length} ACTIVE DEVICE${fresh.length===1?'':'S'}`;
    if(!deviceList)return;
    const frag=document.createDocumentFragment();
    for(const d of fresh){
      const row=document.createElement('div');row.className='dm-device-row';
      const mode=document.createElement('strong');mode.textContent=String(d.mode||'client').toUpperCase();
      const browser=document.createElement('span');browser.textContent=`${String(d.browser||'Browser')} · ${String(d.viewport||'')}`;
      const scene=document.createElement('span');scene.textContent=String(d.scene||'terminal').toUpperCase();
      const seen=document.createElement('small');seen.textContent=timeLabel(d.lastSeen);
      row.append(mode,browser,scene,seen);frag.appendChild(row);
    }
    deviceList.replaceChildren(frag);
  });
}
function stopDeviceMonitor(){devicesUnsub?.();devicesUnsub=null;if(deviceList)deviceList.replaceChildren();}

// Common keyboard shortcuts for pressure situations. Ignore when typing.
document.addEventListener('keydown',event=>{
  if(!hasDMRole()||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  if(event.code==='Space'&&document.body.dataset.view==='dm'){event.preventDefault();window.SoulSeekerCombat?.advanceTurn?.(1);}
  if(event.key==='1'&&event.altKey){event.preventDefault();window.SoulSeekerSession?.broadcastScene?.('terminal',transitionSelect?.value||'ink');}
  if(event.key==='2'&&event.altKey){event.preventDefault();window.SoulSeekerSession?.broadcastScene?.('combat',transitionSelect?.value||'ink');}
  if(event.key==='3'&&event.altKey){event.preventDefault();window.SoulSeekerSession?.broadcastScene?.('stage',transitionSelect?.value||'ink');}
  if(event.key.toLowerCase()==='b'&&event.altKey){event.preventDefault();window.SoulSeekerSession?.setBlackout?.(!sessionState?.broadcast?.blackout);}
});

sessionState=window.SoulSeekerSession?.getState();
stageState=window.SoulSeekerStage?.getState();
combatState=window.SoulSeekerCombat?.getState();
renderCombatDirector();
populateTracks();
renderPreview();
