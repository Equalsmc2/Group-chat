/** Soul Seekers music + shared saved YouTube track library.
 *  One Firebase app, no automatic video dock, visualizer stays where it is.
 *  Browser localStorage is a backup, never silently described as a cloud save.
 */
import { db } from './firebase.js';
import {
  collection, doc, onSnapshot, setDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const COLLECTION = 'musicLibrary';
const LOCAL_KEY = 'soul-seekers-saved-tracks-v13';
const INITIAL_TRACK = { id: 'tk2eUGISZpk', title: 'Default YouTube track', artist: 'YouTube', url: 'https://www.youtube.com/watch?v=tk2eUGISZpk' };
const VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/;
const dom = {
  play: document.getElementById('playPauseBtn'),
  next: document.getElementById('nextTrackBtn'),
  repeat: document.getElementById('repeatTrackBtn'),
  input: document.getElementById('ytUrlInput'),
  load: document.getElementById('loadUrlBtn'),
  title: document.getElementById('musicTitle'),
  artist: document.getElementById('musicArtist'),
  cover: document.getElementById('musicCover'),
  status: document.getElementById('musicStatus'),
  libraryStatus: document.getElementById('musicLibraryStatus'),
  playlist: document.getElementById('savedTrackSelect'),
  sync: document.getElementById('syncTracksBtn'),
  rename: document.getElementById('renameTrackBtn'),
  link: document.getElementById('musicYouTubeLink'),
  visualizer: document.getElementById('visualizerCanvas')
};

let selectedTrack = INITIAL_TRACK;
let player = null;
let playerReady = false;
let requestedPlay = false;
const REPEAT_KEY = 'soul-seekers-repeat-v15';
let repeatTrack = (() => {
  try { return localStorage.getItem(REPEAT_KEY) !== 'off'; } catch { return true; }
})();
function renderRepeat() {
  if (!dom.repeat) return;
  dom.repeat.textContent = repeatTrack ? '↻ LOOP ON' : '↻ LOOP OFF';
  dom.repeat.setAttribute('aria-pressed', String(repeatTrack));
  dom.repeat.setAttribute('aria-label', repeatTrack ? 'Turn track repeat off' : 'Turn track repeat on');
  dom.repeat.title = repeatTrack ? 'Current song repeats at the end' : 'Play next saved track at the end';
}
let isPlaying = false;
let apiFailed = false;
let apiTimeout = null;
let rafId = 0;
let visualizerLastTime = 0;
let visualizerGradient = null;
let visualizerAccent = '';
let playbackSeconds = 0;
let playbackSyncAt = 0;
let playbackSyncTick = 0;
let ctx = null;

function publishMusic(playing, energy = 0, seconds = playbackSeconds) {
  window.dispatchEvent(new CustomEvent('soulseekers:music', {
    detail: { playing, energy, seconds }
  }));
}
let cloudReadOk = false;
let cloudWriteOk = false;
let cloudWriteError = '';
const tracks = new Map();
const titleRequests = new Map();
const cloudPending = new Set();
const cloudFailed = new Set();
const cloudOperations = new Map();
const BAR_COUNT = 24;
const bars = Array.from({ length: BAR_COUNT }, () => ({ height: 3, target: 3 }));

function canonicalUrl(id) { return `https://www.youtube.com/watch?v=${id}`; }
function shortTitle(id) { return `YouTube track · ${id}`; }
function validTrack(data) {
  return data && VIDEO_ID.test(String(data.id || '')) &&
    typeof data.title === 'string' && data.title.length > 0 && data.title.length <= 200 &&
    typeof data.artist === 'string' && data.artist.length <= 120;
}
function cleanTrack(raw) {
  const id = String(raw.id);
  const title = String(raw.title || shortTitle(id)).trim().slice(0, 200) || shortTitle(id);
  const artist = String(raw.artist || 'YouTube').trim().slice(0, 120) || 'YouTube';
  return { id, title, artist, url: canonicalUrl(id) };
}
function provisional(track) {
  return !track?.title || track.title === 'Default YouTube track' || track.title === 'Custom YouTube Audio' || track.title === shortTitle(track.id);
}
function rememberLocally() {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify([...tracks.values()])); }
  catch (error) { console.warn('Could not cache music library in this browser', error); }
}
function loadLocal() {
  try {
    for (const entry of JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')) {
      if (validTrack(entry)) tracks.set(entry.id, cleanTrack(entry));
    }
  } catch (error) { console.warn('Music library cache is unavailable', error); }
  // The site's existing built-in track remains available without an internet connection.
  if (!tracks.has(INITIAL_TRACK.id)) tracks.set(INITIAL_TRACK.id, INITIAL_TRACK);
  selectedTrack = tracks.get(INITIAL_TRACK.id);
}
function musicStatus(text, error = false) {
  if (!dom.status) return;
  dom.status.textContent = text;
  dom.status.classList.toggle('music-status-error', error);
}
function libraryStatus(text, error = false) {
  if (!dom.libraryStatus) return;
  dom.libraryStatus.textContent = text;
  dom.libraryStatus.classList.toggle('music-status-error', error);
}
function refreshLibraryStatus() {
  const total = tracks.size;
  if (cloudFailed.size) {
    libraryStatus(`${total} saved here · ${cloudFailed.size} not in Firebase${cloudWriteError ? ` (${cloudWriteError})` : ''} · press SYNC`, true);
  } else if (cloudPending.size) {
    libraryStatus(`${total} saved here · saving to Firebase…`);
  } else if (cloudReadOk && cloudWriteOk) {
    libraryStatus(`${total} tracks · Firebase synced`);
  } else if (cloudReadOk) {
    libraryStatus(`${total} tracks · Firebase connected · add a link to sync`);
  } else if (cloudWriteError) {
    libraryStatus(`${total} saved here · Firebase ${cloudWriteError}`, true);
  } else {
    libraryStatus(`${total} saved here · connecting to Firebase…`);
  }
}
function sortedTracks() {
  return [...tracks.values()].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
}
function renderDropdown() {
  if (!dom.playlist) return;
  const oldSelection = selectedTrack?.id;
  const fragment = document.createDocumentFragment();
  for (const track of sortedTracks()) {
    const option = document.createElement('option');
    option.value = track.id;
    option.textContent = track.title;
    option.title = `${track.title} — ${track.artist}`;
    fragment.appendChild(option);
  }
  dom.playlist.replaceChildren(fragment);
  if (oldSelection && tracks.has(oldSelection)) dom.playlist.value = oldSelection;
  refreshLibraryStatus();
}
function showTrack(track) {
  selectedTrack = track;
  if (dom.title) { dom.title.textContent = track.title; dom.title.title = track.title; }
  if (dom.artist) dom.artist.textContent = track.artist;
  if (dom.link) dom.link.href = canonicalUrl(track.id);
  if (dom.cover) {
    dom.cover.onerror = () => { dom.cover.onerror = null; dom.cover.src = 'assets/soul-seal.svg'; };
    dom.cover.src = `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`;
  }
  if (dom.playlist && dom.playlist.value !== track.id) dom.playlist.value = track.id;
}
function putTrack(raw, { promote = false } = {}) {
  if (!raw || !VIDEO_ID.test(raw.id || '')) return null;
  const incoming = cleanTrack(raw);
  const previous = tracks.get(incoming.id);
  // Keep a discovered/renamed title instead of replacing it with a generic placeholder.
  const replacement = previous && !provisional(previous) && provisional(incoming)
    ? previous : incoming;
  tracks.set(incoming.id, replacement);
  if (selectedTrack.id === incoming.id) showTrack(replacement);
  if (promote) showTrack(replacement);
  rememberLocally();
  renderDropdown();
  return replacement;
}

function writeCloud(track) {
  if (!track || !VIDEO_ID.test(track.id)) return Promise.resolve(false);
  const previous = cloudOperations.get(track.id) || Promise.resolve();
  cloudPending.add(track.id);
  cloudFailed.delete(track.id);
  refreshLibraryStatus();
  // Serialize writes per video: an old placeholder must never overwrite
  // the correct title discovered a moment later.
  const task = previous.catch(() => {}).then(async () => {
    try {
      await setDoc(doc(db, COLLECTION, track.id), {
        id: track.id, title: track.title, artist: track.artist,
        url: canonicalUrl(track.id), updatedAt: serverTimestamp()
      }, { merge: true });
      cloudWriteOk = true;
      cloudWriteError = '';
      cloudFailed.delete(track.id);
      return true;
    } catch (error) {
      cloudFailed.add(track.id);
      cloudWriteError = error.code === 'permission-denied'
        ? 'Firestore rules deny writes' : (error.code || 'connection issue');
      console.warn('Music saved locally, but Firebase write failed', error);
      return false;
    }
  });
  cloudOperations.set(track.id, task);
  task.finally(() => {
    if (cloudOperations.get(track.id) === task) {
      cloudOperations.delete(track.id);
      cloudPending.delete(track.id);
      refreshLibraryStatus();
    }
  }).catch(() => {});
  return task;
}

async function fetchMetadata(id) {
  if (titleRequests.has(id)) return titleRequests.get(id);
  const promise = (async () => {
    // noembed returns YouTube's video title/channel without a YouTube API key.
    // If the service is unavailable, try native YouTube oEmbed (CORS may block it).
    const url = canonicalUrl(id);
    for (const endpoint of [
      `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`
    ]) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) continue;
        const data = await response.json();
        if (typeof data.title === 'string' && data.title.trim()) {
          return { title: data.title.trim().slice(0, 200), artist: String(data.author_name || 'YouTube').slice(0, 120) };
        }
      } catch (error) { console.info('Video metadata lookup unavailable', error); }
      finally { clearTimeout(timeout); }
    }
    return null;
  })();
  titleRequests.set(id, promise);
  promise.finally(() => titleRequests.delete(id)).catch(() => {});
  return promise;
}

async function resolveAndSave(id, { saveCloud = false } = {}) {
  const metadata = await fetchMetadata(id);
  const current = tracks.get(id);
  if (!current) return;
  if (metadata && provisional(current)) {
    const full = putTrack({ ...current, ...metadata });
    if (saveCloud) await writeCloud(full);
  } else if (saveCloud) {
    await writeCloud(current);
  }
  if (!metadata && selectedTrack?.id === id && provisional(current)) {
    musicStatus('Could not fetch the song name · RENAME lets you enter it manually', true);
  }
}

function listenCloud() {
  onSnapshot(collection(db, COLLECTION), snapshot => {
    cloudReadOk = true;
    const remoteIds = new Set(snapshot.docs.map(entry => entry.id));
    for (const entry of snapshot.docs) {
      const data = entry.data();
      if (!validTrack(data) || entry.id !== data.id) continue;
      putTrack(data);
    }
    // Migrate links saved in this browser into the shared Firebase collection.
    for (const localTrack of tracks.values()) {
      if (!remoteIds.has(localTrack.id) && !cloudPending.has(localTrack.id) && !cloudFailed.has(localTrack.id)) {
        void writeCloud(localTrack);
      }
    }
    refreshLibraryStatus();
  }, error => {
    cloudReadOk = false;
    cloudWriteError = error.code === 'permission-denied' ? 'Firestore rules deny reads' : (error.code || 'offline');
    libraryStatus(`${tracks.size} tracks saved in this browser · ${cloudWriteError}`, true);
    console.warn('Music library Firestore read failed', error);
  });
}

function extractYouTubeId(raw) {
  const value = raw.trim();
  if (VIDEO_ID.test(value)) return value;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    if (host === 'youtu.be' || host === 'www.youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return VIDEO_ID.test(id || '') ? id : null;
    }
    if (!['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com',
      'youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)) return null;
    const id = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)?.[1];
    return VIDEO_ID.test(id || '') ? id : null;
  } catch { return null; }
}

function setPlaying(playing) {
  isPlaying = playing;
  if (dom.play) dom.play.textContent = playing ? '❚❚ PAUSE' : '▶ PLAY';
  document.querySelector('.cover-art-container')?.classList.toggle('active-play', playing);
  if (playing) startVisualizerLoop(); else stopVisualizerLoop();
  publishMusic(playing, playing ? .12 : 0);
}
function startPlayback() {
  requestedPlay = true;
  if (!playerReady) {
    musicStatus(apiFailed ? 'YouTube unavailable · use OPEN ON YOUTUBE' : 'Connecting to YouTube…', apiFailed);
    return;
  }
  musicStatus('Starting playback…');
  try { player.playVideo(); }
  catch (error) { musicStatus('Could not start YouTube · use OPEN ON YOUTUBE', true); console.warn(error); }
}
function selectTrack(track, { autoplay = true } = {}) {
  showTrack(track);
  if (!playerReady) {
    requestedPlay = autoplay;
    musicStatus(apiFailed ? 'YouTube unavailable · use OPEN ON YOUTUBE' : 'Connecting to YouTube…', apiFailed);
    return;
  }
  setPlaying(false);
  requestedPlay = autoplay;
  try {
    if (autoplay) {
      musicStatus('Loading track…');
      player.loadVideoById(track.id);
    } else {
      player.cueVideoById(track.id);
      musicStatus('Ready · press PLAY to listen');
    }
  } catch (error) { musicStatus('Could not load track · use OPEN ON YOUTUBE', true); console.warn(error); }
}
function onPlayerReady(event) {
  player = event.target;
  playerReady = true;
  clearTimeout(apiTimeout);
  if (requestedPlay) {
    musicStatus('Loading track…');
    player.loadVideoById(selectedTrack.id);
  } else {
    player.cueVideoById(selectedTrack.id);
    musicStatus('Ready · press PLAY to listen');
  }
}
function readPlayerTitle() {
  if (!playerReady || !player || !selectedTrack) return;
  try {
    const info = player.getVideoData?.();
    if (!info || info.video_id !== selectedTrack.id || !info.title || !provisional(selectedTrack)) return;
    const saved = putTrack({ id: info.video_id, title: info.title, artist: info.author || 'YouTube' });
    void writeCloud(saved);
  } catch (error) { console.info('YouTube title was unavailable', error); }
}
function onPlayerStateChange(event) {
  switch (event.data) {
    case window.YT.PlayerState.PLAYING:
      requestedPlay = false;
      setPlaying(true);
      musicStatus('Now playing · animated music visualizer');
      readPlayerTitle();
      break;
    case window.YT.PlayerState.BUFFERING:
      setPlaying(false);
      musicStatus('Buffering…');
      break;
    case window.YT.PlayerState.PAUSED:
      requestedPlay = false;
      setPlaying(false);
      musicStatus('Paused · press PLAY to resume');
      break;
    case window.YT.PlayerState.CUED:
      setPlaying(false);
      readPlayerTitle();
      if (!requestedPlay) musicStatus('Ready · press PLAY to listen');
      break;
    case window.YT.PlayerState.ENDED:
      setPlaying(false);
      if (repeatTrack) {
        requestedPlay = true;
        musicStatus('Repeating current track…');
        try {
          // loadVideoById is more dependable than seekTo after ENDED on embeds.
          player.loadVideoById(selectedTrack.id);
        } catch (error) {
          requestedPlay = false;
          musicStatus('Could not repeat this video · press PLAY', true);
          console.warn('Repeat failed', error);
        }
      } else {
        nextTrack();
      }
      break;
  }
}
function onPlayerError(event) {
  requestedPlay = false;
  setPlaying(false);
  const messages = {
    2: 'Invalid YouTube video ID.',
    5: 'YouTube cannot play this video in this browser.',
    100: 'Video deleted/private. Choose another saved track.',
    101: 'Owner blocked embedding · OPEN ON YOUTUBE.',
    150: 'Owner blocked embedding · OPEN ON YOUTUBE.',
    153: 'YouTube requires a referrer · use START_SITE.bat.'
  };
  musicStatus(messages[event.data] || `YouTube error ${event.data} · use OPEN ON YOUTUBE`, true);
}
function onAutoplayBlocked() {
  requestedPlay = false;
  setPlaying(false);
  musicStatus('Browser blocked background YouTube playback · use OPEN ON YOUTUBE', true);
}
function createPlayer() {
  if (player || !window.YT?.Player || apiFailed) return;
  try {
    player = new window.YT.Player('ytPlayerFrame', {
      width: '240', height: '200', videoId: selectedTrack.id,
      playerVars: { playsinline: 1, controls: 0, rel: 0, origin: location.origin },
      events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange,
        onError: onPlayerError, onAutoplayBlocked }
    });
  } catch (error) {
    apiFailed = true;
    musicStatus('Could not connect to YouTube · OPEN ON YOUTUBE', true);
    console.error('YouTube player init failed', error);
  }
}
function loadYouTubeAPI() {
  musicStatus('Connecting to YouTube…');
  if (window.YT?.Player) { createPlayer(); return; }
  const oldCallback = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    clearTimeout(apiTimeout);
    if (typeof oldCallback === 'function') oldCallback();
    createPlayer();
  };
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  script.async = true;
  script.onerror = () => {
    apiFailed = true;
    clearTimeout(apiTimeout);
    musicStatus('YouTube blocked/unavailable · use OPEN ON YOUTUBE', true);
  };
  document.head.appendChild(script);
  apiTimeout = setTimeout(() => {
    if (!playerReady && !apiFailed) musicStatus('YouTube is taking a while · check connection/ad blocker', true);
  }, 12000);
}

function nextTrack() {
  const list = sortedTracks();
  if (!list.length) return;
  const index = list.findIndex(track => track.id === selectedTrack.id);
  const next = list[(index + 1 + list.length) % list.length];
  selectTrack(next);
}
function loadCustom() {
  const id = extractYouTubeId(dom.input?.value || '');
  if (!id) { musicStatus('Paste a valid YouTube video link or 11-character ID.', true); return; }
  const track = putTrack(tracks.get(id) || { id, title: shortTitle(id), artist: 'YouTube' }, { promote: true });
  if (dom.input) dom.input.value = '';
  selectTrack(track);
  // Start metadata lookup immediately, but serialize writes so a late provisional
  // title cannot overwrite the proper song name in Firestore.
  const firstSave = writeCloud(track);
  void resolveAndSave(id).then(async () => {
    await firstSave;
    const latest = tracks.get(id);
    if (latest && (latest.title !== track.title || latest.artist !== track.artist)) await writeCloud(latest);
  });
}
function setupControls() {
  dom.play?.addEventListener('click', () => {
    if (isPlaying) {
      requestedPlay = false;
      try { player?.pauseVideo(); } catch (error) { console.warn(error); }
    } else startPlayback();
  });
  dom.next?.addEventListener('click', nextTrack);
  dom.repeat?.addEventListener('click', () => {
    repeatTrack = !repeatTrack;
    try { localStorage.setItem(REPEAT_KEY, repeatTrack ? 'on' : 'off'); } catch { /* storage optional */ }
    renderRepeat();
  });
  dom.load?.addEventListener('click', loadCustom);
  dom.input?.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); loadCustom(); }
  });
  dom.playlist?.addEventListener('change', () => {
    const track = tracks.get(dom.playlist.value);
    if (track) selectTrack(track);
  });
  dom.rename?.addEventListener('click', () => {
    const value = window.prompt('Song name for this saved YouTube link:', selectedTrack.title);
    if (value === null || !value.trim()) return;
    const changed = putTrack({ ...selectedTrack, title: value.trim().slice(0, 200) });
    void writeCloud(changed);
  });
  dom.sync?.addEventListener('click', async () => {
    if (dom.sync) dom.sync.disabled = true;
    libraryStatus('Syncing saved tracks to Firebase…');
    for (const track of tracks.values()) await writeCloud(track);
    if (dom.sync) dom.sync.disabled = false;
    refreshLibraryStatus();
  });
}

function resizeVisualizer() {
  if (!dom.visualizer) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  const width = Math.max(1, Math.round(dom.visualizer.offsetWidth * ratio));
  const height = Math.max(1, Math.round(dom.visualizer.offsetHeight * ratio));
  if (dom.visualizer.width !== width || dom.visualizer.height !== height) {
    dom.visualizer.width = width;
    dom.visualizer.height = height;
    visualizerGradient = null;
    if (!isPlaying) paintIdleVisualizer();
  }
}
function paintIdleVisualizer() {
  if (!ctx || !dom.visualizer) return;
  const w = dom.visualizer.width, h = dom.visualizer.height;
  ctx.clearRect(0, 0, w, h);
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--current-user-color').trim() || '#c4aa79';
  ctx.fillStyle = accent;
  ctx.globalAlpha = .30;
  const step = w / BAR_COUNT;
  for (let i = 0; i < BAR_COUNT; i++) {
    const tiny = (2 + Math.abs(Math.sin(i * 1.8)) * 4) * Math.min(1.5, h / 25);
    ctx.fillRect(i * step, h - tiny, Math.max(1, step - 3), tiny);
  }
  ctx.globalAlpha = 1;
}
function startVisualizerLoop() {
  if (!ctx || !dom.visualizer || rafId || document.hidden) return;
  visualizerLastTime = 0;
  playbackSyncTick = 0;
  const render = timestamp => {
    if (!isPlaying || document.hidden) { rafId = 0; return; }
    rafId = requestAnimationFrame(render);
    if (timestamp - visualizerLastTime < 45) return;
    visualizerLastTime = timestamp;
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--current-user-color').trim() || '#c4aa79';
    if (accent !== visualizerAccent || !visualizerGradient) {
      visualizerAccent = accent;
      visualizerGradient = ctx.createLinearGradient(0, dom.visualizer.height, 0, 0);
      visualizerGradient.addColorStop(0, accent);
      visualizerGradient.addColorStop(1, '#ffffff');
    }
    ctx.clearRect(0, 0, dom.visualizer.width, dom.visualizer.height);
    ctx.fillStyle = visualizerGradient;
    const step = dom.visualizer.width / BAR_COUNT;
    const width = Math.max(1, step - 3);
    // YouTube's API exposes transport time (not decoded audio samples).
    // Refresh position occasionally so the decorative pulses follow playback
    // while keeping the expensive work inside the small canvas.
    if (++playbackSyncTick % 6 === 1) {
      try {
        const seconds = player?.getCurrentTime?.();
        if (Number.isFinite(seconds)) {
          playbackSeconds = seconds;
          playbackSyncAt = timestamp;
        }
      } catch { /* position unavailable while video is cueing */ }
    }
    const position = playbackSeconds + (playbackSyncAt ? Math.max(0, timestamp - playbackSyncAt) / 1000 : 0);
    const now = position * 5;
    let totalHeight = 0;
    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = bars[i];
      if (Math.random() > .6) bar.target = (Math.random() * .68 + .18) * dom.visualizer.height * (Math.sin(now + i * .3) * .4 + .6);
      bar.height += (bar.target - bar.height) * .25;
      ctx.fillRect(i * step, dom.visualizer.height - bar.height, width, bar.height);
      totalHeight += bar.height;
    }
    // Shared beat-like energy drives ONLY four dedicated symbol layers.
    // It is time/playback driven; it cannot analyze YouTube bass/vocals.
    const energy = Math.min(1, totalHeight / (BAR_COUNT * dom.visualizer.height) * 1.85);
    publishMusic(true, energy, position);
  };
  rafId = requestAnimationFrame(render);
}
function stopVisualizerLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  paintIdleVisualizer();
}

export function initMusicPlayer() {
  loadLocal();
  showTrack(selectedTrack);
  renderDropdown();
  setupControls();
  renderRepeat();
  if (dom.visualizer) {
    ctx = dom.visualizer.getContext('2d');
    resizeVisualizer();
    window.addEventListener('resize', resizeVisualizer, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopVisualizerLoop();
      else if (isPlaying) startVisualizerLoop();
    });
  }
  listenCloud();
  // Recover title for the built-in track / previously saved links if metadata is missing.
  for (const track of tracks.values()) {
    if (provisional(track)) void resolveAndSave(track.id, { saveCloud: true });
  }
  loadYouTubeAPI();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMusicPlayer, { once: true });
else initMusicPlayer();
