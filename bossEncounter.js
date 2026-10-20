/* SOUL SEEKERS ACT III v36.2 · independent boss-health broadcast.
   One optional boss at a time. Data/image lives in combatState/boss (not
   combatState/party), so ordinary turn/HP saves don't retransmit boss art. */
import { db, authReady, hasDMRole, onRoleChange, isLocalPreview, isTvClient } from './firebase.js';
import { doc, onSnapshot, setDoc, serverTimestamp } from './firebaseTransport.js';
import { normalizeBoss, bossDisplay, clampBoss, BOSS_IMAGE_MAX_CHARS } from './bossState.js';

const $ = id => document.getElementById(id);
const ref = doc(db, 'combatState', 'boss');
const LOCAL_KEY = 'soulSeekersBossEncounterV362';
const PENDING_KEY = 'soulSeekersBossPendingV362';
const CHANNEL = 'soulseekers-boss-v362';
// Phone mode is texting-only: do not attach a boss/image Firestore listener.
const phoneOnly = !isTvClient && matchMedia('(max-width: 720px), (max-height: 540px) and (pointer: coarse)').matches;
const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const broadcast = isLocalPreview && !phoneOnly && 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL) : null;
function read(key) { try { const s = localStorage.getItem(key); return s ? normalizeBoss(JSON.parse(s)) : null; } catch { return null; } }
function store(key, value) { try { if (value) localStorage.setItem(key, JSON.stringify(normalizeBoss(value))); else localStorage.removeItem(key); return true; } catch { return false; } }
let pending = read(PENDING_KEY);
let boss = pending || read(LOCAL_KEY) || normalizeBoss();
let unlisten = null, primed = false, writer = null, version = pending ? 1 : 0;
let statusMessage = '';
const isDirector = () => hasDMRole();
const fields = {
  visible: $('dmBossVisible'), name: $('dmBossName'), current: $('dmBossCurrentHp'), max: $('dmBossMaxHp'),
  image: $('dmBossImageFile'), art: $('dmBossPortrait'), empty: $('dmBossArtEmpty'), bar: $('bossBroadcast'),
  barImage: $('bossBroadcastPortrait'), barImageWrap: $('bossBroadcastPortraitWrap'),
  barName: $('bossBroadcastName'), barHp: $('bossBroadcastHp'), barStatus: $('bossBroadcastStatus'),
  barPercent: $('bossBroadcastPercent'), barTrack: $('bossBroadcastTrack'), barFill: $('bossBroadcastFill'),
  sync: $('dmBossSync')
};

function syncStatus(message) { statusMessage = message; if (fields.sync) fields.sync.textContent = message; }
function render() {
  const b = bossDisplay(boss);
  if (fields.bar) {
    fields.bar.hidden = !b.visible;
    if (b.visible) {
      fields.bar.dataset.defeated = String(b.defeated);
      if (fields.barName) fields.barName.textContent = b.name || 'UNKNOWN THREAT';
      if (fields.barHp) fields.barHp.textContent = `${b.currentHp.toLocaleString()} / ${b.maxHp.toLocaleString()} HP`;
      if (fields.barStatus) fields.barStatus.textContent = b.defeated ? 'TARGET NEUTRALIZED' : b.ratio <= .25 ? 'CRITICAL // FINAL STAND' : 'BOSS ENCOUNTER';
      if (fields.barPercent) fields.barPercent.textContent = `${b.percent}% REMAINING`;
      if (fields.barFill) fields.barFill.style.width = `${b.percent}%`;
      if (fields.barTrack) { fields.barTrack.setAttribute('aria-valuemax', String(b.maxHp)); fields.barTrack.setAttribute('aria-valuenow', String(b.currentHp)); fields.barTrack.setAttribute('aria-valuetext', `${b.currentHp} of ${b.maxHp} HP`); }
      if (fields.barImageWrap) fields.barImageWrap.hidden = !b.imageData;
      if (b.imageData && fields.barImage && fields.barImage.src !== b.imageData) fields.barImage.src = b.imageData;
      if (!b.imageData && fields.barImage) fields.barImage.removeAttribute('src');
    }
  }
  if (fields.visible) fields.visible.checked = b.visible;
  for (const [element, value] of [[fields.name, b.name], [fields.current, b.currentHp], [fields.max, b.maxHp]]) {
    if (element && document.activeElement !== element) element.value = String(value);
  }
  if (fields.art) { fields.art.hidden = !b.imageData; if (b.imageData && fields.art.src !== b.imageData) fields.art.src = b.imageData; else if (!b.imageData) fields.art.removeAttribute('src'); }
  if (fields.empty) fields.empty.hidden = Boolean(b.imageData);
  if (fields.sync && statusMessage) fields.sync.textContent = statusMessage;
  window.dispatchEvent(new CustomEvent('soulseekers:bossstate', {detail:{name:b.name, currentHp:b.currentHp, maxHp:b.maxHp, visible:b.visible, hasImage:Boolean(b.imageData)}}));
}
function accept(next) {
  const normalized = normalizeBoss(next);
  if (normalized.revision <= boss.revision) return;
  boss = normalized;
  store(LOCAL_KEY, boss);
  render();
}
function writeLocal() {
  const saved = store(LOCAL_KEY, boss);
  if (isLocalPreview) {
    try { broadcast?.postMessage({sender:id, boss}); } catch {}
    syncStatus(saved ? 'LOCAL PREVIEW · BOSS SYNCED IN THIS BROWSER' : 'LOCAL STORAGE FULL · BOSS IMAGE MAY NOT PERSIST');
  }
}
if (broadcast) broadcast.addEventListener('message', event => { if (event.data?.sender !== id && event.data?.boss) accept(event.data.boss); });
window.addEventListener('storage', event => { if (isLocalPreview && event.key === LOCAL_KEY && event.newValue) { try { accept(JSON.parse(event.newValue)); } catch {} } });

async function flush() {
  if (writer || !pending || !isDirector() || !navigator.onLine) return writer || false;
  writer = (async () => {
    let succeeded = false;
    while (pending && isDirector() && navigator.onLine) {
      const snapshot = normalizeBoss(pending), attempt = version;
      if (!isLocalPreview) syncStatus('SAVING BOSS · FIREBASE…');
      try {
        if (isLocalPreview) { store(PENDING_KEY, null); pending = null; succeeded = true; break; }
        await setDoc(ref, {...snapshot, updatedAt:serverTimestamp()}, {merge:true});
        succeeded = true;
        if (version === attempt) { pending = null; store(PENDING_KEY, null); syncStatus('LIVE · BOSS SAVED TO FIREBASE'); break; }
      } catch (err) {
        console.error('Boss encounter sync failed', err);
        syncStatus('BOSS CHANGES QUEUED · CHECK CONNECTION / FIRESTORE RULES');
        break;
      }
    }
    return succeeded;
  })().finally(() => { writer = null; });
  return writer;
}
async function save(patch) {
  if (!isDirector()) return false;
  boss = normalizeBoss({...boss, ...patch, revision:Math.max(Date.now() * 1000, boss.revision + 1)});
  writeLocal(); render();
  pending = {...boss}; version += 1;
  if (!store(PENDING_KEY, pending)) syncStatus('BOSS IMAGE TOO LARGE FOR LOCAL STORAGE · USE SMALLER IMAGE');
  if (navigator.onLine) await flush(); else syncStatus('OFFLINE · BOSS CHANGES QUEUED');
  return true;
}
function draft() { return {name:fields.name?.value || '', currentHp:fields.current?.value, maxHp:fields.max?.value}; }
$('dmBossSave')?.addEventListener('click', () => void save(draft()));
fields.visible?.addEventListener('change', () => void save({...draft(), visible:fields.visible.checked}));
$('dmBossHide')?.addEventListener('click', () => void save({...draft(), visible:false}));
$('dmBossReset')?.addEventListener('click', () => void save({...draft(), currentHp:fields.max?.value}));
for (const button of document.querySelectorAll('[data-boss-delta]')) {
  button.addEventListener('click', () => {
    const maxHp = clampBoss(fields.max?.value, 1, 999999);
    void save({...draft(), currentHp:clampBoss(Number(fields.current?.value) + Number(button.dataset.bossDelta), 0, maxHp)});
  });
}
$('dmBossRemoveImage')?.addEventListener('click', () => { if(fields.image)fields.image.value=''; void save({...draft(), imageData:''}); });

/* Canvas resampling is deliberate: no Storage bucket, no image URL exposure,
   and no multi-megabyte file in a Firestore document (1 MiB doc cap). */
export async function compressBossImage(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP image.');
  if (file.size > 12 * 1024 * 1024) throw new Error('Image is over 12 MB. Choose a smaller file.');
  const objectUrl = URL.createObjectURL(file);
  let source;
  try {
    source = await new Promise((resolve, reject) => {
      const pic = new Image(); pic.onload = () => resolve(pic); pic.onerror = () => reject(new Error('This image could not be opened.')); pic.src = objectUrl;
    });
    if (!source.naturalWidth || !source.naturalHeight) throw new Error('Invalid image dimensions.');
    const canvas = document.createElement('canvas');
    let longest = 560;
    for (let tries = 0; tries < 5; tries++) {
      const scale = Math.min(1, longest / Math.max(source.naturalWidth, source.naturalHeight));
      canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable for image resizing.');
      context.fillStyle = '#0b0a0d'; context.fillRect(0,0,canvas.width,canvas.height);
      context.drawImage(source,0,0,canvas.width,canvas.height);
      const result = canvas.toDataURL('image/jpeg', Math.max(.48, .78 - tries * .075));
      if (result.length <= BOSS_IMAGE_MAX_CHARS) return result;
      longest = Math.round(longest * .77);
    }
    throw new Error('Image cannot fit the sync limit; try a simpler or smaller image.');
  } finally { URL.revokeObjectURL(objectUrl); }
}
fields.image?.addEventListener('change', async () => {
  const file = fields.image.files?.[0]; if (!file) return;
  fields.image.disabled = true; syncStatus('PROCESSING BOSS IMAGE…');
  try { const data = await compressBossImage(file); await save({...draft(), imageData:data}); }
  catch (err) { syncStatus(`IMAGE NOT SAVED · ${err.message}`); }
  finally { fields.image.disabled = false; fields.image.value = ''; }
});

onRoleChange(({dm}) => {
  // TV/phone never gains edit controls, even if HTML is inspected.
  for (const el of [fields.visible,fields.name,fields.current,fields.max,fields.image,$('dmBossSave'),$('dmBossReset'),$('dmBossHide'),$('dmBossRemoveImage'), ...document.querySelectorAll('[data-boss-delta]')]) if(el) el.disabled = !dm;
  if (dm && pending && navigator.onLine) void flush();
});
window.addEventListener('online', () => { if (pending) void flush(); });
async function boot() {
  if (phoneOnly) return;
  render();
  if (isLocalPreview) { syncStatus('LOCAL PREVIEW · BOSS READY'); return; }
  await authReady.catch(() => null);
  syncStatus('CONNECTING BOSS DISPLAY…');
  unlisten = onSnapshot(ref, snapshot => {
    if (snapshot.exists()) {
      const next = normalizeBoss(snapshot.data());
      if (!pending || !isDirector()) {
        // A received Firestore snapshot is authoritative. Other directors may
        // have clock skew: do not discard a remote edit based on its revision.
        boss = next; store(LOCAL_KEY, boss); render();
      } else if (navigator.onLine) void flush();
    } else if (!pending) { boss = normalizeBoss(); store(LOCAL_KEY, boss); render(); }
    primed = true;
    if (!pending) syncStatus('LIVE · BOSS DISPLAY CONNECTED');
  }, err => { console.warn('Boss encounter listener failed',err); syncStatus('BOSS DISPLAY OFFLINE · FIREBASE READ ERROR'); });
}
window.addEventListener('pagehide', () => { if (unlisten) unlisten(); try { broadcast?.close(); } catch {} }, {once:true});
window.SoulSeekerBoss = {getState:() => normalizeBoss(boss), save, compressBossImage};
void boot();
