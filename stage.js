import { displayedAsyaText } from './storyCopy.js';
import { db, authReady, hasDMRole, isLocalPreview } from './firebase.js';
import { doc, onSnapshot, setDoc, serverTimestamp } from './firebaseTransport.js';

const STAGE_REF = doc(db, 'stageState', 'main');
const LOCAL_STAGE_KEY='soulSeekersLocalStageV34';
const stageChannel=isLocalPreview&&'BroadcastChannel' in window?new BroadcastChannel('soulseekers-stage-v34'):null;
const CHARACTERS = {
  Magnus:'assets/characters/magnus.webp', Max:'assets/characters/max.webp', Jeanette:'assets/characters/jeanette.webp',
  Asya:'assets/characters/asya.webp', Alexandria:'assets/characters/alexandria.webp', Fitz:'assets/characters/fitz.webp'
};
const $ = id => document.getElementById(id);
const root = $('stageView');
const title = $('stageTitle');
const subtitle = $('stageSubtitle');
const body = $('stageBody');
const image = $('stageSceneImage');
const portrait = $('stageCharacterPortrait');
const characterName = $('stageCharacterName');
const badge = $('stageKindBadge');
const previewTitle = $('stagePreviewTitle');
const previewBody = $('stagePreviewBody');
const previewBadge = $('stagePreviewBadge');
$('stagePreviewOpen')?.addEventListener('click',()=>window.SoulSeekerShell?.navigate?.('stage'));
let stageState = normalize({});
let unsubscribe = null;
function readLocalStage(){if(!isLocalPreview)return null;try{const raw=localStorage.getItem(LOCAL_STAGE_KEY);return raw?normalize(JSON.parse(raw)):null;}catch{return null;}}
function publishLocalStage(next){if(!isLocalPreview)return;const clean=normalize(next);try{localStorage.setItem(LOCAL_STAGE_KEY,JSON.stringify(clean));}catch{}try{stageChannel?.postMessage(clean);}catch{}}
if(stageChannel)stageChannel.addEventListener('message',event=>render(event.data||{}));
window.addEventListener('storage',event=>{if(isLocalPreview&&event.key===LOCAL_STAGE_KEY&&event.newValue){try{render(JSON.parse(event.newValue));}catch{}}});

function safeUrl(value) {
  const text = String(value || '').trim();
  return /^(https?:\/\/|assets\/)/i.test(text) ? text.slice(0,1200) : '';
}
function normalize(raw = {}) {
  return {
    kind: ['idle','chapter','location','dialogue','boss','revelation','announcement','introduction','illustration','critical','victory','defeat'].includes(raw.kind) ? raw.kind : 'idle',
    title: String(raw.title || 'THE WOUNDED ETERNITY').slice(0,160),
    subtitle: String(raw.subtitle || 'BOSTON // ACT III').slice(0,220),
    body: String(raw.body || 'The stage is standing by.').slice(0,1200),
    imageUrl: safeUrl(raw.imageUrl),
    characterId: CHARACTERS[raw.characterId] ? raw.characterId : '',
    atmosphere: ['quiet','ominous','urgent','sacred','victory'].includes(raw.atmosphere) ? raw.atmosphere : 'quiet',
    serial: Math.max(0, Number(raw.serial) || 0),
    issuedAtMs: Math.max(0, Number(raw.issuedAtMs) || 0)
  };
}
function render(next = stageState) {
  const normalized = normalize(next);
  if (root?.dataset.kind && JSON.stringify(normalized) === JSON.stringify(stageState)) return;
  stageState = normalized;
  if (!root) return;
  root.dataset.kind = stageState.kind;
  root.dataset.hasPortrait = String(Boolean(stageState.characterId));
  root.dataset.atmosphere = stageState.atmosphere;
  if (title) title.textContent = stageState.title;
  if (subtitle) subtitle.textContent = stageState.subtitle;
  if (body) body.textContent = displayedAsyaText(stageState.body, stageState.characterId);
  if (badge) badge.textContent = stageState.kind.toUpperCase();
  if (stageState.imageUrl) {
    image.src = stageState.imageUrl; image.hidden = false;
  } else {
    image.hidden = true; image.removeAttribute('src');
  }
  if (stageState.characterId) {
    portrait.src = CHARACTERS[stageState.characterId]; portrait.alt = `${stageState.characterId} portrait`; portrait.hidden = false;
    characterName.textContent = stageState.characterId; characterName.hidden = false;
  } else {
    portrait.hidden = true; portrait.removeAttribute('src'); characterName.hidden = true;
  }
  if (previewTitle) previewTitle.textContent = stageState.title;
  if (previewBody) previewBody.textContent = displayedAsyaText(stageState.body, stageState.characterId);
  if (previewBadge) previewBadge.textContent = stageState.kind.toUpperCase();
  root.classList.remove('stage-refresh');
  if (document.body.dataset.view === 'stage') requestAnimationFrame(() => root.classList.add('stage-refresh'));
  window.dispatchEvent(new CustomEvent('soulseekers:stagestate', { detail: stageState }));
}
async function start() {
  if(isLocalPreview){const local=readLocalStage();if(local)render(local);else publishLocalStage(stageState);}
  await authReady.catch(() => null);
  if (unsubscribe) return;
  unsubscribe = onSnapshot(STAGE_REF, snap => {const next=snap.exists()?snap.data():{};render(next);if(isLocalPreview)publishLocalStage(next);}, error => {
    if(!isLocalPreview)console.warn('Stage sync unavailable', error?.code || error);
    if(isLocalPreview){const local=readLocalStage();if(local)render(local);}else render(stageState);
  });
}
async function setStage(partial = {}) {
  if (!hasDMRole()) throw Object.assign(new Error('Trusted DM role is not ready.'), { code: 'soulseekers/dm-required' });
  const next = normalize({ ...stageState, ...partial, serial: stageState.serial + 1, issuedAtMs: Date.now() });
  render(next); if(isLocalPreview)publishLocalStage(next);
  try{await setDoc(STAGE_REF, { ...next, updatedAt: serverTimestamp(), build: 'v36' }, { merge: true });}
  catch(error){if(!isLocalPreview)throw error;}
  return next;
}
function resetStage() {
  return setStage({ kind:'idle', title:'THE WOUNDED ETERNITY', subtitle:'BOSTON // ACT III', body:'The stage is standing by.', imageUrl:'', characterId:'', atmosphere:'quiet' });
}
window.addEventListener('pagehide', () => {unsubscribe?.();try{stageChannel?.close();}catch{}}, { once: true });
void start();
window.SoulSeekerStage = { getState: () => ({ ...stageState }), setStage, resetStage };
