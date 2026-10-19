import { db, auth, authReady, hasDMRole, onRoleChange, isLocalPreview } from './firebase.js';
import {
  doc, collection, onSnapshot, setDoc, getDoc, serverTimestamp, query, orderBy, limit, addDoc
} from './firebaseTransport.js';
import { normalizeSessionState, makeEventId, shouldPresentOverlay, rememberEvent, safeScene, safeTransition } from './sessionCore.js';

const BUILD='v37.3';
const STATE_REF = doc(db, 'sessionState', 'main');
const DEVICE_COLLECTION = collection(db, 'sessionDevices');
const LEGACY_TV_KEY = 'soulSeekersDeviceModeV29';
const AUDIO_ARM_KEY = 'soulSeekersTvAudioArmedV29';
const queryArgs = new URLSearchParams(location.search);
const requestedTv = queryArgs.get('tv') === '1';
const previewMode = queryArgs.get('preview') === '1';
const LOCAL_STATE_KEY = 'soulSeekersLocalSessionV34';
const LOCAL_CHANNEL_NAME = 'soulseekers-session-v34';
const localChannel = isLocalPreview && 'BroadcastChannel' in window ? new BroadcastChannel(LOCAL_CHANNEL_NAME) : null;

// v32: TV mode is URL-explicit only. Never resurrect a stale localStorage TV flag.
let tvMode = requestedTv;
try { localStorage.removeItem(LEGACY_TV_KEY); } catch {}
let audioArmed = sessionStorage.getItem(AUDIO_ARM_KEY) === '1';
let state = normalizeSessionState({});
let stateUnsubscribe = null;
let deviceTimer = null;
let overlayTimer = null;
let lastBroadcastSerial = -1;
let lastBroadcastScene = null;
let lastBlackout = null;
let lastAudioSerial = -1;
let connected = false;
let heartbeatOk = false;
let seenOverlayIds = new Set();
try {
  const stored = JSON.parse(sessionStorage.getItem('soulSeekersSeenPresentationEvents') || '[]');
  if (Array.isArray(stored)) seenOverlayIds = new Set(stored.slice(-64));
} catch {}
const clientId = (() => {
  try {
    let id = sessionStorage.getItem('soulSeekersClientIdV29');
    if (!id) {
      id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem('soulSeekersClientIdV29', id);
    }
    return id;
  } catch { return `client-${Date.now()}`; }
})();

const overlay = document.getElementById('broadcastOverlay');
const overlayPanel = document.getElementById('broadcastOverlayPanel');
const overlayKicker = document.getElementById('broadcastOverlayKicker');
const overlayTitle = document.getElementById('broadcastOverlayTitle');
const overlayBody = document.getElementById('broadcastOverlayBody');
const overlayPortrait = document.getElementById('broadcastOverlayPortrait');
const overlayImage = document.getElementById('broadcastOverlayImage');
const permissionGate = document.getElementById('tvPermissionGate');
const permissionButton = document.getElementById('tvPermissionButton');
const globalTvModeButton = document.getElementById('globalTvMode');
const globalTvExitButton = document.getElementById('globalTvExit');
const sessionHealth = document.getElementById('sessionHealthText');
const railText = document.querySelector('.rail-connection-text');
const railOnline = document.querySelector('.rail-online');

const CHARACTERS = {
  Magnus: 'assets/characters/magnus.webp', Max: 'assets/characters/max.webp', Jeanette: 'assets/characters/jeanette.webp',
  Asya: 'assets/characters/asya.webp', Alexandria: 'assets/characters/alexandria.webp', Fitz: 'assets/characters/fitz.webp'
};

function playLocalSfx(cue, options = {}) {
  const play = () => window.SoulSeekerSFX?.playCinematic?.(cue, options);
  if (window.SoulSeekerSFX) return play();
  window.addEventListener('soulseekers:sfxready', play, { once:true });
}
function overlaySfx(kind) {
  return ({
    dialogue:'ui-confirm', announcement:'ui-confirm', chapter:'scene-shift', location:'scene-shift',
    boss:'boss-reveal', revelation:'void-wash', critical:'critical-burst', victory:'victory', defeat:'void-wash'
  })[kind] || 'ui-confirm';
}

function readLocalSession() {
  if (!isLocalPreview) return null;
  try { const raw = localStorage.getItem(LOCAL_STATE_KEY); return raw ? normalizeSessionState(JSON.parse(raw)) : null; }
  catch { return null; }
}
function publishLocalSession(next) {
  if (!isLocalPreview) return;
  const clean = normalizeSessionState(next);
  try { localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(clean)); } catch {}
  try { localChannel?.postMessage({ type:'state', state:clean, from:clientId, at:Date.now() }); } catch {}
}
function applyLocalSession(next) {
  if (!isLocalPreview || !next) return;
  applyState(normalizeSessionState(next));
  setConnection(false, 'LOCAL PREVIEW · BROWSER SYNC');
}
if (localChannel) localChannel.addEventListener('message', event => {
  if (event.data?.type === 'state' && event.data?.from !== clientId) applyLocalSession(event.data.state);
});
window.addEventListener('storage', event => {
  if (isLocalPreview && event.key === LOCAL_STATE_KEY && event.newValue) {
    try { applyLocalSession(JSON.parse(event.newValue)); } catch {}
  }
});

function setConnection(ok, message = '') {
  connected = ok;
  railOnline?.classList.toggle('connected', ok);
  if (railText) railText.textContent = ok ? 'LIVE / FIREBASE' : (message || 'LINK / OFFLINE');
  if (sessionHealth) sessionHealth.textContent = ok ? (heartbeatOk ? 'LIVE · SYNC + DEVICE HEARTBEAT' : 'LIVE · SYNC') : (message || 'OFFLINE');
  window.dispatchEvent(new CustomEvent('soulseekers:sessionhealth', { detail: { connected: ok, heartbeatOk, message } }));
}

function persistSeenEvents() {
  try { sessionStorage.setItem('soulSeekersSeenPresentationEvents', JSON.stringify([...seenOverlayIds].slice(-64))); } catch {}
}
function safeImageUrl(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^(https?:\/\/|assets\/)/i.test(text)) return text.slice(0, 1200);
  return '';
}
function hideOverlay(immediate = false) {
  clearTimeout(overlayTimer);
  if (!overlay) return;
  overlay.classList.remove('is-live');
  if (immediate) { overlay.hidden = true; return; }
  overlay.classList.add('is-leaving');
  overlayTimer = setTimeout(() => { overlay.hidden = true; overlay.classList.remove('is-leaving'); }, 520);
}
function presentOverlay(item) {
  if (!overlay || !item?.id) return;
  clearTimeout(overlayTimer);
  overlay.dataset.kind = item.kind;
  overlayKicker.textContent = ({chapter:'CHAPTER',dialogue:'TRANSMISSION',boss:'THREAT DETECTED',location:'LOCATION',critical:'CRITICAL EVENT',victory:'VICTORY',defeat:'DEFEAT'}[item.kind] || 'SOUL SEEKERS');
  overlayTitle.textContent = item.title || 'SOUL SEEKERS';
  overlayBody.textContent = item.body || '';
  const portrait = CHARACTERS[item.characterId];
  if (portrait) { overlayPortrait.src = portrait; overlayPortrait.hidden = false; overlayPortrait.alt = `${item.characterId} portrait`; }
  else { overlayPortrait.hidden = true; overlayPortrait.removeAttribute('src'); }
  const imageUrl = safeImageUrl(item.imageUrl);
  if (imageUrl) { overlayImage.style.backgroundImage = `url("${imageUrl.replaceAll('"','%22')}")`; overlayImage.hidden = false; }
  else { overlayImage.hidden = true; overlayImage.style.backgroundImage = ''; }
  overlay.hidden = false;
  overlay.classList.remove('is-leaving','is-live');
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('is-live')));
  playLocalSfx(overlaySfx(item.kind), { volume: item.kind === 'dialogue' ? .72 : 1 });
  overlayTimer = setTimeout(() => hideOverlay(false), Math.max(0, item.issuedAtMs + item.durationMs - Date.now()));
}

function applyBroadcast(next) {
  const broadcast = next.broadcast;
  // Blackout is player-facing. A trusted DM console must never black itself out.
  const playerFacing = tvMode || !hasDMRole();
  document.body.classList.toggle('broadcast-blackout', broadcast.blackout && playerFacing);
  const primed = lastBroadcastSerial >= 0;
  const target = safeScene(broadcast.scene);
  if (tvMode && !previewMode && primed && lastBlackout !== null && broadcast.blackout !== lastBlackout && audioArmed) {
    playLocalSfx('void-wash', { volume:.8 });
  }
  lastBlackout = broadcast.blackout;
  if (!tvMode || previewMode) { lastBroadcastSerial = broadcast.serial; lastBroadcastScene = target; return; }
  if (broadcast.serial !== lastBroadcastSerial) {
    lastBroadcastSerial = broadcast.serial;
    const current = window.SoulSeekerShell?.currentView?.() || document.body.dataset.view || 'terminal';
    if (target !== current) {
      document.body.dataset.sceneTransition = safeTransition(broadcast.transition);
      document.body.classList.add('scene-transitioning');
      if (primed && audioArmed) playLocalSfx('scene-shift', { volume:.9 });
      window.SoulSeekerShell?.navigate?.(target, { persist: false, source: 'broadcast' });
      setTimeout(() => document.body.classList.remove('scene-transitioning'), 720);
    }
    lastBroadcastScene = target;
  }
}
function applyOverlay(next) {
  const item = next.overlay;
  // Presentation overlays are player-facing. A trusted DM laptop remains an
  // uninterrupted control surface unless it is explicitly operating as a TV.
  if (hasDMRole() && !tvMode && !previewMode) { hideOverlay(true); return; }
  if (!item.active) { hideOverlay(false); return; }
  if (shouldPresentOverlay(item, seenOverlayIds)) {
    rememberEvent(seenOverlayIds, item.id);
    persistSeenEvents();
    presentOverlay(item);
  }
}
async function applyAudio(next) {
  if (!tvMode || previewMode || !audioArmed) return;
  if (next.audio.serial === lastAudioSerial) return;
  lastAudioSerial = next.audio.serial;
  const apply = () => window.SoulSeekerMusic?.applySessionAudio?.(next.audio);
  if (window.SoulSeekerMusic) apply();
  else window.addEventListener('soulseekers:musicready', apply, { once: true });
}
function applyState(next) {
  state = normalizeSessionState(next);
  applyBroadcast(state);
  applyOverlay(state);
  void applyAudio(state);
  window.dispatchEvent(new CustomEvent('soulseekers:sessionstate', { detail: state }));
}

async function startRealtime() {
  if (isLocalPreview) {
    setConnection(false, 'LOCAL PREVIEW · BROWSER SYNC');
    const local = readLocalSession();
    if (local) applyLocalSession(local);
    else publishLocalSession(state);
  }
  await authReady.catch(() => null);
  if (stateUnsubscribe) return;
  try {
    stateUnsubscribe = onSnapshot(STATE_REF, snap => {
      setConnection(true);
      const next = snap.exists() ? snap.data() : {};
      applyState(next);
      if (isLocalPreview) publishLocalSession(next);
    }, error => {
      if (!isLocalPreview) console.error('Session state listener failed', error);
      if (isLocalPreview) {
        const local = readLocalSession(); if (local) applyLocalSession(local);
        else setConnection(false, 'LOCAL PREVIEW · BROWSER SYNC');
      } else setConnection(false, error?.code === 'permission-denied' ? 'FIRESTORE RULES / AUTH' : 'FIREBASE OFFLINE');
    });
  } catch (error) {
    if (isLocalPreview) setConnection(false, 'LOCAL PREVIEW · BROWSER SYNC');
    else throw error;
  }
}

async function requireDM() {
  if (isLocalPreview && !tvMode) return;
  await authReady.catch(() => null);
  if (!hasDMRole()) {
    const error = new Error('Trusted DM role is not ready. Publish the v30 rules if this persists.');
    error.code = 'soulseekers/dm-required';
    throw error;
  }
}
async function saveState(patch) {
  await requireDM();
  const previous = state;
  const merged = normalizeSessionState({
    ...state,
    ...patch,
    broadcast: { ...state.broadcast, ...(patch.broadcast || {}) },
    overlay: { ...state.overlay, ...(patch.overlay || {}) },
    audio: { ...state.audio, ...(patch.audio || {}) },
    sfx: { ...state.sfx, ...(patch.sfx || {}) },
    legendary: { ...state.legendary, ...(patch.legendary || {}) }
  });
  state = merged;
  applyState(merged);
  if (isLocalPreview) publishLocalSession(merged);
  try {
    await setDoc(STATE_REF, { ...merged, updatedAt: serverTimestamp(), updatedBy: auth.currentUser?.uid || null, build: BUILD }, { merge: true });
    return merged;
  } catch (error) {
    if (isLocalPreview) {
      setConnection(false, 'LOCAL PREVIEW · BROWSER SYNC');
      return merged;
    }
    state = previous;
    applyState(previous);
    throw error;
  }
}

async function broadcastScene(scene, transition = 'ink') {
  return saveState({ broadcast: { scene: safeScene(scene), transition: safeTransition(transition), serial: state.broadcast.serial + 1 } });
}
async function setBlackout(on) {
  return saveState({ broadcast: { blackout: Boolean(on), serial: state.broadcast.serial + 1 } });
}
async function present(cue = {}) {
  const issuedAtMs = Date.now();
  const item = {
    id: makeEventId('presentation'), active: true, kind: cue.kind || 'announcement', title: cue.title || '', body: cue.body || '',
    characterId: cue.characterId || '', imageUrl: safeImageUrl(cue.imageUrl), durationMs: cue.durationMs || 4200, issuedAtMs
  };
  return saveState({ overlay: item });
}
async function clearOverlay() {
  return saveState({ overlay: { ...state.overlay, active: false, id: makeEventId('clear'), issuedAtMs: Date.now() } });
}

async function activateLegendary(cue = {}) {
  const issuedAtMs = Date.now();
  const item = {
    id: makeEventId('legendary'), active: true, serial: state.legendary.serial + 1,
    actionKey: String(cue.actionKey || '').slice(0, 80),
    characterId: String(cue.characterId || '').slice(0, 40),
    title: String(cue.title || cue.actionKey || 'LEGENDARY ACTION').slice(0, 160),
    body: String(cue.body || '').slice(0, 600),
    visualKey: String(cue.visualKey || cue.actionKey || '').slice(0, 80),
    issuedAtMs
  };
  return saveState({ legendary: item });
}
async function clearLegendary() {
  return saveState({ legendary: { ...state.legendary, active: false, serial: state.legendary.serial + 1, id: makeEventId('legendary-clear'), issuedAtMs: Date.now() } });
}
async function toggleLegendary(cue = {}) {
  const sameAction = state.legendary.active && state.legendary.actionKey && state.legendary.actionKey === String(cue.actionKey || '').slice(0, 80);
  if (sameAction) return clearLegendary();
  return activateLegendary(cue);
}
async function requestLegendary(cue = {}) {
  if (isLocalPreview || hasDMRole()) return toggleLegendary(cue);
  await authReady.catch(() => null);
  const payload = {
    requestId: makeEventId('legendary-request'),
    actionKey: String(cue.actionKey || '').slice(0, 80),
    characterId: String(cue.characterId || '').slice(0, 40),
    title: String(cue.title || '').slice(0, 160),
    body: String(cue.body || '').slice(0, 600),
    visualKey: String(cue.visualKey || cue.actionKey || '').slice(0, 80),
    createdAt: serverTimestamp(),
    createdAtMs: Date.now(),
    clientId,
    mode: 'toggle'
  };
  return addDoc(collection(db, 'legendaryRequests'), payload);
}
async function setAudio(partial = {}) {
  return saveState({ audio: { ...state.audio, ...partial, serial: state.audio.serial + 1 } });
}
async function setSfxSettings(partial = {}) {
  return saveState({ sfx: { ...state.sfx, ...partial, serial: state.sfx.serial } });
}
async function triggerSfx(cue, options = {}) {
  const name = String(cue || '').slice(0,64);
  if (!name) return state;
  return saveState({ sfx: {
    ...state.sfx, cue:name, id:makeEventId('sfx'), serial:state.sfx.serial + 1,
    issuedAtMs:Date.now(), eventVolume:Math.max(0,Math.min(1.25,Number(options.volume) || 1))
  } });
}
async function restoreState(snapshot = {}) {
  await requireDM();
  const previous=state;
  const next=normalizeSessionState(snapshot);
  next.broadcast.serial=state.broadcast.serial+1;
  next.audio.serial=state.audio.serial+1;
  next.sfx={...next.sfx,serial:state.sfx.serial,id:state.sfx.id,cue:state.sfx.cue,issuedAtMs:state.sfx.issuedAtMs};
  next.overlay={...next.overlay,active:false,id:makeEventId("undo-clear"),issuedAtMs:Date.now()};
  next.legendary={...next.legendary,serial:state.legendary.serial+1,id:next.legendary.id||makeEventId('legendary-restore')};
  state=next; applyState(next); if (isLocalPreview) publishLocalSession(next);
  try {
    await setDoc(STATE_REF,{...next,updatedAt:serverTimestamp(),updatedBy:auth.currentUser?.uid||null,build:BUILD},{merge:true});
    return next;
  } catch(error) {
    if (isLocalPreview) { setConnection(false,'LOCAL PREVIEW · BROWSER SYNC'); return next; }
    state=previous; applyState(previous); throw error;
  }
}
async function forceResync() {
  try {
    const snap = await getDoc(STATE_REF);
    setConnection(true);
    applyState(snap.exists() ? snap.data() : {});
    await heartbeat();
    return true;
  } catch (error) {
    if (isLocalPreview) {
      const local=readLocalSession(); if(local) applyLocalSession(local);
      else setConnection(false,'LOCAL PREVIEW · BROWSER SYNC');
      return true;
    }
    setConnection(false, error?.code === 'permission-denied' ? 'FIRESTORE RULES / AUTH' : 'RESYNC FAILED');
    throw error;
  }
}

function currentScene() { return window.SoulSeekerShell?.currentView?.() || document.body.dataset.view || 'terminal'; }
function browserLabel() {
  const ua = navigator.userAgent;
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Chrome\//.test(ua)) return 'Chromium';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Browser';
}
const localDeviceListeners = new Set();
function readLocalDevices(){
 const result=[];
 for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key?.startsWith('soulSeekersDeviceV35:'))continue;try{const d=JSON.parse(localStorage.getItem(key));if(Date.now()-d.lastSeenMs<90000)result.push({...d,lastSeen:new Date(d.lastSeenMs)});}catch{}}
 return result;
}
function emitLocalDevices(){for(const callback of localDeviceListeners)callback(readLocalDevices());}
window.addEventListener('storage',e=>{if(e.key?.startsWith('soulSeekersDeviceV35:'))emitLocalDevices();});
async function heartbeat() {
 if(isLocalPreview){
  try{localStorage.setItem('soulSeekersDeviceV35:'+clientId,JSON.stringify({id:clientId,mode:tvMode?'tv':'dm',scene:currentScene(),build:BUILD,browser:browserLabel(),viewport:`${innerWidth}x${innerHeight}`,lastSeenMs:Date.now()}));}catch{}
  heartbeatOk=true;emitLocalDevices();setConnection(false,'LOCAL PREVIEW · BROWSER SYNC');return;
 }

  if (!auth.currentUser) { if(isLocalPreview) { heartbeatOk=true; setConnection(false,'LOCAL PREVIEW · BROWSER SYNC'); } return; }
  try {
    const authScopedDeviceRef = doc(db, 'sessionDevices', `${auth.currentUser.uid}__${clientId}`);
    await setDoc(authScopedDeviceRef, {
      uid: auth.currentUser.uid,
      mode: tvMode ? 'tv' : (hasDMRole() ? 'dm' : 'player'),
      scene: currentScene(), build: BUILD, browser: browserLabel(),
      viewport: `${innerWidth}x${innerHeight}`, lastSeen: serverTimestamp()
    }, { merge: true });
    heartbeatOk = true;
    setConnection(connected);
  } catch (error) {
    heartbeatOk = false;
    setConnection(connected, connected ? 'LIVE · HEARTBEAT BLOCKED' : 'OFFLINE');
  }
}
function startHeartbeat() {
  clearInterval(deviceTimer);
  void heartbeat();
  deviceTimer = setInterval(() => void heartbeat(), 25000);
}

function desktopUrl() {
  const url = new URL(location.href);
  url.searchParams.delete('tv');
  url.searchParams.delete('display');
  url.searchParams.delete('preview');
  return url;
}
function tvUrl() {
  const url = desktopUrl();
  url.searchParams.set('tv', '1');
  return url;
}
function setTvMode(on) {
  const requested = Boolean(on);
  // v32: client role is URL-explicit. A desktop page NEVER mutates itself into
  // a TV client because Firebase was bootstrapped with a different app/auth
  // context. This also makes PHCode/Phoenix previews deterministic.
  if (requested && !requestedTv) {
    const target = tvUrl().toString();
    const opened = window.open(target, '_blank');
    if (opened) opened.opener = null;
    if (!opened) {
      try { navigator.clipboard?.writeText(target); } catch {}
      window.dispatchEvent(new CustomEvent('soulseekers:toast', { detail: { message: 'Pop-up blocked. TV test URL copied; allow pop-ups or append ?tv=1 manually.' } }));
    }
    return false;
  }
  if (!requested && requestedTv) {
    location.href = desktopUrl().toString();
    return false;
  }
  tvMode = requestedTv;
  document.body.classList.toggle('tv-device', tvMode);
  updatePermissionGate();
  void heartbeat();
  if (tvMode) applyBroadcast(state);
  return tvMode;
}
function updatePermissionGate() {
  if (!permissionGate) return;
  permissionGate.hidden = !tvMode || audioArmed;
}
async function armTv() {
  audioArmed = true;
  try { sessionStorage.setItem(AUDIO_ARM_KEY, '1'); } catch {}
  updatePermissionGate();
  try { await document.documentElement.requestFullscreen?.(); } catch {}
  try { await window.SoulSeekerMusic?.unlockAudio?.(); } catch {}
  try { await window.SoulSeekerSFX?.unlock?.(); } catch {}
  lastAudioSerial = -1;
  await applyAudio(state);
}
permissionButton?.addEventListener('click', () => void armTv());
globalTvModeButton?.addEventListener('click',()=>{setTvMode(true);updatePermissionGate();});
globalTvExitButton?.addEventListener('click',()=>{setTvMode(false);if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});});

function listenDevices(callback) {
  let unsub = null;
  if (isLocalPreview) {
    localDeviceListeners.add(callback); callback(readLocalDevices());
    return () => localDeviceListeners.delete(callback);
  }
  if (isLocalPreview) {
    callback([{ id:clientId, mode:tvMode?'tv':'dm', scene:currentScene(), build:BUILD, browser:browserLabel(), viewport:`${innerWidth}x${innerHeight}`, lastSeen:new Date() }]);
  }
  requireDM().then(() => {
    const q = query(DEVICE_COLLECTION, orderBy('lastSeen', 'desc'), limit(16));
    unsub = onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))), error => { if(!isLocalPreview) callback([], error); });
  }).catch(error => { if(!isLocalPreview) callback([], error); });
  return () => unsub?.();
}

window.addEventListener('soulseekers:viewchange', () => void heartbeat());
window.addEventListener('online', () => { setConnection(false, 'RECONNECTING…'); void forceResync().catch(() => {}); });
window.addEventListener('offline', () => setConnection(false, 'OFFLINE'));
window.addEventListener('pagehide', () => { stateUnsubscribe?.(); clearInterval(deviceTimer); try{localChannel?.close();}catch{} }, { once: true });
onRoleChange(() => {
  applyBroadcast(state);
  applyOverlay(state);
  void heartbeat();
});

document.body.classList.toggle('tv-device', tvMode);
updatePermissionGate();
void startRealtime().then(startHeartbeat);

window.SoulSeekerSession = {
  build: BUILD,
  isTv: () => tvMode,
  isAudioArmed: () => audioArmed,
  getState: () => typeof structuredClone==='function' ? structuredClone(state) : JSON.parse(JSON.stringify(state)),
  isConnected: () => connected,
  broadcastScene, setBlackout, present, clearOverlay, activateLegendary, clearLegendary, toggleLegendary, requestLegendary, setAudio, setSfxSettings, triggerSfx, restoreState, forceResync, setTvMode, armTv, listenDevices
};
