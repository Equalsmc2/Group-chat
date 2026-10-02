// Shared campaign state. Transactions reject offline writes instead of replaying
// stale DM commands later. Realtime snapshots are required for connected viewers.
import { db } from './firebase.js';
import { doc, onSnapshot, runTransaction, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

export const defaults = Object.freeze({ timeOfDay: 'night', weather: 'clear',
  music: { id: 'tk2eUGISZpk', title: 'Default YouTube track', artist: 'YouTube', playing: false, repeat: true, position: 0, changedAt: null } });
let state = { ...defaults, music: { ...defaults.music } };
let status = 'Connecting to the shared session…';
let connected = false;
let busy = false;
let unsubscribe;
const listeners = new Set();
export function validMusic(m) {
  return m && /^[\w-]{11}$/.test(m.id) && typeof m.title === 'string' && m.title.length > 0 && m.title.length <= 200 &&
    typeof m.artist === 'string' && m.artist.length <= 120 && typeof m.playing === 'boolean' && typeof m.repeat === 'boolean' &&
    Number.isFinite(m.position) && m.position >= 0 && m.position <= 604800;
}
export function normalize(data = {}) {
  return { timeOfDay: ['day', 'night'].includes(data.timeOfDay) ? data.timeOfDay : defaults.timeOfDay,
    weather: ['clear', 'rain', 'snow'].includes(data.weather) ? data.weather : defaults.weather,
    music: validMusic(data.music) ? { ...data.music } : { ...defaults.music } };
}
export function getSession() { return state; }
export function sessionPosition(m = state.music) {
  const changed = m.changedAt?.toMillis?.();
  return Math.min(604800, m.position + (m.playing && changed ? Math.max(0, (Date.now() - changed) / 1000) : 0));
}
function emit() { for (const listener of listeners) listener(state, { status, connected, busy }); }
export function subscribeSession(listener) { listeners.add(listener); listener(state, { status, connected, busy }); return () => listeners.delete(listener); }
export function connectSession() {
  unsubscribe?.();
  status = 'Connecting to the shared session…'; connected = false; emit();
  unsubscribe = onSnapshot(doc(db, 'campaignState', 'main'), { includeMetadataChanges: true }, snapshot => {
    // Do not announce optimistic local snapshots as successful shared changes.
    if (snapshot.metadata.hasPendingWrites) return;
    state = normalize(snapshot.exists() ? snapshot.data() : {});
    connected = !snapshot.metadata.fromCache;
    status = connected ? 'Live · shared with everyone' : 'Reconnecting · controls unavailable';
    emit();
  }, error => {
    connected = false;
    status = error.code === 'permission-denied' ? 'Sync blocked · enable campaignState rules (see setup guide)' : 'Session unavailable · check your connection and retry';
    emit();
  });
}
export async function changeSession(patch) {
  if (!connected || busy || !navigator.onLine) { status = 'Change not sent · wait for a live connection'; emit(); return false; }
  busy = true; status = 'Sharing your change…'; emit();
  try {
    await runTransaction(db, async transaction => {
      const ref = doc(db, 'campaignState', 'main');
      const snapshot = await transaction.get(ref);
      const current = normalize(snapshot.exists() ? snapshot.data() : {});
      const next = { ...current, ...patch };
      if (patch.music) next.music = { ...current.music, ...patch.music, changedAt: serverTimestamp() };
      if (!['day', 'night'].includes(next.timeOfDay) || !['clear', 'rain', 'snow'].includes(next.weather) || !validMusic(next.music)) throw new Error('Invalid session settings');
      transaction.set(ref, { ...next, updatedAt: serverTimestamp() });
    });
    status = 'Live · shared with everyone'; return true;
  } catch (error) {
    status = error.code === 'permission-denied' ? 'Change not saved · Firebase rules deny access (see setup guide)' : 'Change not saved · reconnect and try again';
    return false;
  } finally { busy = false; emit(); }
}
window.addEventListener('offline', () => { connected = false; status = 'Offline · changes cannot be shared'; emit(); });
window.addEventListener('online', connectSession);
connectSession();
