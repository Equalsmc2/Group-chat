import './sessionDirector.js?v=38.6';
import { LUNAR_TIMELINE, lunarAudioPhase } from './legendaryTimeline.js';
import { db, auth, authReady, hasDMRole, onRoleChange, isLocalPreview } from './firebase.js';

const phoneView = matchMedia('(max-width: 720px), (max-height: 540px) and (pointer: coarse)');
const explicitTvPresentation = new URLSearchParams(location.search).get('tv') === '1';
if (explicitTvPresentation) document.body.classList.add('legendary-tv-mode');

const LEGENDARY_LIBRARY = {
  'jeanette-lunar-eclipse': {
    actionKey: 'jeanette-lunar-eclipse',
    characterId: 'Jeanette',
    title: 'LUNAR ECLIPSE',
    kicker: 'LEGENDARY ACTION',
    body: 'The moon devours the room. Magic is silenced for everyone except Jeanette.',
    visualKey: 'lunar-eclipse',
    portrait: 'assets/legendary/jeanette/jeanette-cutin.png',
    gif: 'assets/legendary/jeanette/wedding-bells.gif',
    stingerAudio: 'assets/legendary/jeanette/lunar-bell-intro-v37-5.mp3',
    themeAudio: 'assets/legendary/jeanette/lunar-theme-instrumental.mp3',
    loopAudio: 'assets/legendary/jeanette/cinema-projector.mp3',
    altLoopAudio: 'assets/legendary/jeanette/factory-machine.mp3',
    cutinMark: '☾'
  },
  'alexandria-queens-gambit': {
    actionKey: 'alexandria-queens-gambit',
    characterId: 'Alexandria',
    title: "QUEEN'S GAMBIT",
    kicker: 'LEGENDARY ACTION',
    body: 'A queen is sacrificed. The body remains. The real move has yet to be seen.',
    visualKey: 'queens-gambit',
    portrait: 'assets/legendary/alexandria/alexandria-cutin-v38-2.png',
    emblem: 'assets/legendary/alexandria/alexandria-emblem.png',
    themeAudio: 'assets/legendary/alexandria/alexandria-theme-a-dramatic-irony.mp3',
    cutinMark: '♛',
    queenSfx: [
      'assets/legendary/alexandria/heartbeat.mp3',
      'assets/legendary/alexandria/body-drop.mp3',
      'assets/legendary/alexandria/chess-knock.mp3',
      'assets/legendary/alexandria/reveal-strike.mp3'
    ]
  },
  'asya-channel-o-unaired': {
    actionKey: 'asya-channel-o-unaired',
    characterId: 'Asya',
    title: 'CHANNEL 0: DEAD AIR',
    kicker: 'LEGENDARY ACTION',
    body: '“From which stars have we fallen\nto meet each other here?”\n– F. Nietzche',
    visualKey: 'channel-o-unaired',
    portrait: 'assets/legendary/asya/asya-cutin.jpg',
    stingerAudio: 'assets/legendary/asya/signal-chirp.mp3',
    themeAudio: 'assets/legendary/asya/blood-drain-theme.mp3',
    cutinMark: 'Ø'
  },
  'asya-channel-o-short': {
    actionKey: 'asya-channel-o-short',
    characterId: 'Asya',
    title: 'CHANNEL 0: DEAD AIR // SHORT',
    kicker: 'INSTANT / SHORT',
    body: 'A brief static burst interrupts the feed.',
    visualKey: 'channel-o-short',
    portrait: 'assets/legendary/asya/asya-cutin.jpg',
    stingerAudio: 'assets/legendary/asya/static-burst.mp3',
    cutinMark: 'Ø',
    momentaryDurationMs: 850
  }
};
const CHARACTER_TO_ACTION = { Jeanette: 'jeanette-lunar-eclipse', Alexandria: 'alexandria-queens-gambit', Asya: 'asya-channel-o-unaired' };

const state = {
  session: null,
  lastLegendaryId: '',
  pendingActionKey: '',
  requestError: '',
  confirmedSerial: -1,
  renderedActionKey: '',
  currentAudioKey: '',
  localTvInitialized: false,
  activeCue: '',
  audioRun: 0,
  audioTimeouts: new Set(),
  audioFrame: 0,
  audioStartedAt: 0,
  musicPausedForLegendary: false,
  sessionWasLegendary: false,
  momentaryClearTimer: 0
};

let phoneButton = null;
let phoneShortButton = null;
let phoneStatus = null;
let dmButton = null;
let dmAlexandriaButton = null;
let dmAsyaButton = null;
let dmAsyaShortButton = null;
let cinematic = null;
let cutin = null;
let portrait = null;
let titleEl = null;
let bodyEl = null;
let kickerEl = null;
let gifEl = null;
let floatingCaption = null;
let cutinMark = null;

const audioPool = new Map();
const BELL_VOLUME = 0.92;
const THEME_VOLUME = 0.76;
const QUEEN_THEME_START_MS = 5650; // After Queen's Gambit opening sound cues.
const ASYA_THEME_START_MS = 420;
function $(id){ return document.getElementById(id); }

function isMomentaryLegendary(metaOrLegendary) {
  const meta = metaOrLegendary?.actionKey ? getLegendaryMeta(metaOrLegendary) : metaOrLegendary;
  return Boolean(meta?.momentaryDurationMs);
}
function shouldSuspendAmbientForLegendary(metaOrLegendary) {
  return !isMomentaryLegendary(metaOrLegendary);
}
function clearMomentaryLegendaryTimer() {
  if (!state.momentaryClearTimer) return;
  clearTimeout(state.momentaryClearTimer);
  state.momentaryClearTimer = 0;
}
function maybeScheduleMomentaryLegendaryClear(legendaryState) {
  clearMomentaryLegendaryTimer();
  const meta = getLegendaryMeta(legendaryState);
  if (!legendaryState?.active || !meta?.momentaryDurationMs) return;
  const issuedAtMs = Number(legendaryState.issuedAtMs) || Date.now();
  const remaining = Math.max(120, meta.momentaryDurationMs - (Date.now() - issuedAtMs));
  state.momentaryClearTimer = setTimeout(() => {
    state.momentaryClearTimer = 0;
    const live = window.SoulSeekerSession?.getState?.()?.legendary;
    if (!live?.active || live.actionKey !== meta.actionKey) return;
    window.SoulSeekerSession?.clearLegendary?.(legendaryState.id).catch?.((error) => console.warn('Short Legendary clear rejected',error?.code||error));
  }, remaining);
}


function scheduleAudio(run, callback, delayMs) {
  const timer = setTimeout(() => {
    state.audioTimeouts.delete(timer);
    if (run === state.audioRun) callback();
  }, Math.max(0, delayMs));
  state.audioTimeouts.add(timer);
}

function getAudio(url, loop = false) {
  const key = `${url}::${loop ? 'loop' : 'once'}`;
  if (audioPool.has(key)) {
    const cached = audioPool.get(key);
    cached.loop = loop; // Reused songs must still loop after earlier activations.
    return cached;
  }
  const audio = new Audio(url);
  audio.preload = 'auto';
  audio.loop = loop;
  audioPool.set(key, audio);
  return audio;
}

function canPlayLegendaryAudio() {
  const isTv = document.body.classList.contains('tv-device') || window.SoulSeekerSession?.isTv?.();
  return !isTv || Boolean(window.SoulSeekerSession?.isAudioArmed?.());
}

function silenceAmbientMusic() {
  const music = window.SoulSeekerMusic;
  if (!music) return;
  music.suspendForLegendary?.();
  state.musicPausedForLegendary = true;
}
function resumeAmbientMusic() {
  if (!state.musicPausedForLegendary) return;
  state.musicPausedForLegendary = false;
  window.SoulSeekerMusic?.resumeFromLegendary?.();
}

function stopAllLegendaryAudio({restoreMusic = true} = {}) {
  state.audioRun += 1; // Invalidates callbacks and song-on-load listeners from earlier activations.
  for (const timer of state.audioTimeouts) clearTimeout(timer);
  state.audioTimeouts.clear();
  if (state.audioFrame) cancelAnimationFrame(state.audioFrame);
  state.audioFrame = 0;
  for (const audio of audioPool.values()) {
    try { audio.pause(); audio.currentTime = 0; audio.volume = 0; } catch {}
  }
  state.currentAudioKey = '';
  if (restoreMusic) resumeAmbientMusic();
}

async function safelyPlay(audio, run) {
  if (run !== state.audioRun || !canPlayLegendaryAudio()) return false;
  try {
    await audio.play();
    if (run !== state.audioRun) { audio.pause(); return false; }
    return true;
  } catch (error) {
    // Remote TV playback requires the one-time TV audio unlock.
    console.info('Legendary audio waiting for browser audio permission', error?.name || error);
    return false;
  }
}

function startSong(meta, run, issuedAtMs) {
  if (run !== state.audioRun || !getEffectiveLegendary()?.active) return;
  const bell = getAudio(meta.stingerAudio);
  // Absolute ordering guarantee: mute AND stop the bells before starting the theme.
  bell.volume = 0;
  bell.pause();
  const song = getAudio(meta.themeAudio, true);
  song.loop = true; // Jeanette's instrumental repeats for the entire Lunar Eclipse.
  song.volume = THEME_VOLUME;
  const offsetSec = Math.max(0, Date.now() - issuedAtMs - LUNAR_TIMELINE.songStartMs) / 1000;
  const seek = () => {
    if (run !== state.audioRun) return;
    try { song.currentTime = song.duration > 0 && Number.isFinite(song.duration) ? offsetSec % song.duration : offsetSec; } catch {}
  };
  if (song.readyState >= 1) seek();
  else song.addEventListener('loadedmetadata', seek, {once:true});
  state.currentAudioKey = 'theme';
  void safelyPlay(song, run);
}

function beginBellFade(bell, run, issuedAtMs) {
  if (run !== state.audioRun) return;
  const step = () => {
    if (run !== state.audioRun) return;
    const elapsed = Date.now() - issuedAtMs;
    const phase = lunarAudioPhase(elapsed);
    bell.volume = Math.min(BELL_VOLUME, BELL_VOLUME * phase.bellGain);
    if (phase.bellGain <= 0) {
      bell.pause();
      bell.volume = 0;
      state.audioFrame = 0;
      return;
    }
    state.audioFrame = requestAnimationFrame(step);
  };
  step();
}

// Queen's Gambit theme uses the same loop and timestamp catch-up rules as Lunar Eclipse.
function startQueenTheme(meta, run, issuedAtMs) {
  if (run !== state.audioRun || !getEffectiveLegendary()?.active || !meta.themeAudio || !canPlayLegendaryAudio()) return;
  const theme = getAudio(meta.themeAudio, true);
  theme.loop = true; // Continues at the end of A Dramatic Irony until the LA is ended.
  theme.volume = THEME_VOLUME;
  const offsetSec = Math.max(0, Date.now() - issuedAtMs - QUEEN_THEME_START_MS) / 1000;
  const seek = () => {
    if (run !== state.audioRun) return;
    try { theme.currentTime = theme.duration > 0 && Number.isFinite(theme.duration) ? offsetSec % theme.duration : offsetSec; } catch {}
  };
  if (theme.readyState >= 1) seek();
  else theme.addEventListener('loadedmetadata', seek, {once:true});
  state.currentAudioKey = 'queens-gambit-theme';
  void safelyPlay(theme, run);
}

// Queen's Gambit: apparent fall / chess move / reveal, followed by a looping score.
function startQueenAudio(meta, legendaryState) {
  stopAllLegendaryAudio({restoreMusic:false});
  const run = state.audioRun;
  const issuedAtMs = Math.min(Date.now(), Number(legendaryState.issuedAtMs) || Date.now());
  state.audioStartedAt = issuedAtMs;
  if (!canPlayLegendaryAudio()) return;
  const elapsed = Math.max(0, Date.now() - issuedAtMs);
  const cues = [
    { at:0,     url:meta.queenSfx[0], volume:.58 },
    { at:1500,  url:meta.queenSfx[1], volume:.78 },
    { at:3000,  url:meta.queenSfx[2], volume:.86 },
    { at:4250,  url:meta.queenSfx[3], volume:.66 }
  ];
  for (const cue of cues) {
    if (elapsed > cue.at + 550) continue; // A late TV doesn't replay missed sounds.
    scheduleAudio(run, () => {
      if (!getEffectiveLegendary()?.active || run !== state.audioRun) return;
      const audio = getAudio(cue.url);
      audio.volume = cue.volume;
      try { audio.currentTime = 0; } catch {}
      void safelyPlay(audio, run);
      state.currentAudioKey = 'queens-gambit-sfx';
    }, cue.at - elapsed);
  }
  // Stream the new score during the opening SFX, then enter it at checkmate.
  // Native HTMLAudioElement loop repeats the entire theme until the action is cleared.
  if (meta.themeAudio) {
    const theme = getAudio(meta.themeAudio, true);
    theme.loop = true;
    theme.preload = 'auto';
    theme.load?.();
    scheduleAudio(run, () => startQueenTheme(meta, run, issuedAtMs), QUEEN_THEME_START_MS - elapsed);
  }
  // The pulse recedes beneath the checkmate rather than cutting mid-beat.
  const heartbeat = getAudio(meta.queenSfx[0]);
  scheduleAudio(run, () => {
    let frames = 0;
    const fade = () => {
      if (run !== state.audioRun) return;
      frames += 1;
      heartbeat.volume = Math.max(0, .58 * (1 - frames / 30));
      if (frames >= 30) {
        heartbeat.pause();
        state.audioFrame = 0;
      } else state.audioFrame = requestAnimationFrame(fade);
    };
    fade();
  }, 4400 - elapsed);
}


function startAsyaTheme(meta, run, issuedAtMs) {
  if (run !== state.audioRun || !getEffectiveLegendary()?.active || !meta.themeAudio || !canPlayLegendaryAudio()) return;
  const theme = getAudio(meta.themeAudio, true);
  theme.loop = true;
  theme.volume = THEME_VOLUME;
  const offsetSec = Math.max(0, Date.now() - issuedAtMs - ASYA_THEME_START_MS) / 1000;
  const seek = () => {
    if (run !== state.audioRun) return;
    try { theme.currentTime = theme.duration > 0 && Number.isFinite(theme.duration) ? offsetSec % theme.duration : offsetSec; } catch {}
  };
  if (theme.readyState >= 1) seek();
  else theme.addEventListener('loadedmetadata', seek, {once:true});
  state.currentAudioKey = 'asya-theme';
  void safelyPlay(theme, run);
}
function startAsyaAudio(meta, legendaryState) {
  stopAllLegendaryAudio({restoreMusic:false});
  const run = state.audioRun;
  const issuedAtMs = Math.min(Date.now(), Number(legendaryState.issuedAtMs) || Date.now());
  state.audioStartedAt = issuedAtMs;
  if (!canPlayLegendaryAudio()) return;
  const elapsed = Math.max(0, Date.now() - issuedAtMs);
  const chirp = getAudio(meta.stingerAudio);
  chirp.volume = .72;
  if (elapsed < ASYA_THEME_START_MS + 450) {
    try { chirp.currentTime = Math.min(elapsed / 1000, Math.max(0, (chirp.duration || 1) - .02)); } catch {}
    state.currentAudioKey = 'asya-chirp';
    void safelyPlay(chirp, run);
  }
  const theme = getAudio(meta.themeAudio, true);
  theme.loop = true;
  theme.preload = 'auto';
  theme.load?.();
  if (elapsed >= ASYA_THEME_START_MS) {
    startAsyaTheme(meta, run, issuedAtMs);
    return;
  }
  scheduleAudio(run, () => startAsyaTheme(meta, run, issuedAtMs), ASYA_THEME_START_MS - elapsed);
}
function startAsyaShortAudio(meta, legendaryState) {
  stopAllLegendaryAudio({restoreMusic:false});
  const run = state.audioRun;
  const issuedAtMs = Math.min(Date.now(), Number(legendaryState.issuedAtMs) || Date.now());
  state.audioStartedAt = issuedAtMs;
  if (!canPlayLegendaryAudio()) return;
  const elapsed = Math.max(0, Date.now() - issuedAtMs);
  if (elapsed > (meta.momentaryDurationMs || 850) + 120) return;
  const burst = getAudio(meta.stingerAudio);
  burst.volume = .8;
  try { burst.currentTime = Math.min(elapsed / 1000, Math.max(0, (burst.duration || 1.4) - .02)); } catch {}
  state.currentAudioKey = 'asya-short-burst';
  void safelyPlay(burst, run);
}

function startLegendaryAudio(meta, legendaryState) {
  if (meta.actionKey === 'alexandria-queens-gambit') return startQueenAudio(meta, legendaryState);
  if (meta.actionKey === 'asya-channel-o-unaired') return startAsyaAudio(meta, legendaryState);
  if (meta.actionKey === 'asya-channel-o-short') return startAsyaShortAudio(meta, legendaryState);
  stopAllLegendaryAudio({restoreMusic:false});
  const run = state.audioRun;
  const issuedAtMs = Math.min(Date.now(), Number(legendaryState.issuedAtMs) || Date.now());
  state.audioStartedAt = issuedAtMs;
  if (!canPlayLegendaryAudio()) return;
  // Start fetching the larger theme during the bells so the handoff feels immediate.
  const theme = getAudio(meta.themeAudio, true);
  theme.preload = 'auto';
  theme.load?.();
  const elapsed = Date.now() - issuedAtMs;
  const phase = lunarAudioPhase(elapsed);
  if (phase.phase === 'song') {
    startSong(meta, run, issuedAtMs);
    return;
  }
  if (phase.bellGain > 0) {
    const bell = getAudio(meta.stingerAudio);
    try { bell.currentTime = elapsed / 1000; } catch {}
    bell.volume = BELL_VOLUME * phase.bellGain;
    state.currentAudioKey = 'bell';
    void safelyPlay(bell, run);
    if (phase.phase === 'bell') {
      scheduleAudio(run, () => beginBellFade(bell, run, issuedAtMs), LUNAR_TIMELINE.bellHoldMs - elapsed);
    } else beginBellFade(bell, run, issuedAtMs);
  }
  scheduleAudio(run, () => startSong(meta, run, issuedAtMs), LUNAR_TIMELINE.songStartMs - elapsed);
}

function ensureUi() {
  const footer = document.querySelector('.chat-input-area');
  if (footer && !footer.querySelector('.legendary-phone-bar')) {
    const bar = document.createElement('div');
    bar.className = 'legendary-phone-bar';
    bar.innerHTML = `
      <div class="legendary-phone-actions">
        <button type="button" id="legendaryTrigger" class="legendary-trigger" disabled>
          <strong>LEGENDARY ACTION</strong>
          <span>SELECT A CHARACTER WITH A READY LEGENDARY ACTION</span>
        </button>
        <button type="button" id="legendaryShortTrigger" class="legendary-trigger legendary-trigger-secondary" hidden>
          <strong>INSTANT / SHORT</strong>
          <span>BRIEF STATIC-INVERT BURST</span>
        </button>
      </div>
      <small id="legendaryPhoneStatus" class="legendary-status">NO LEGENDARY ACTION EQUIPPED</small>`;
    footer.appendChild(bar);
  }

  if (!document.getElementById('legendaryCinematic')) {
    const layer = document.createElement('div');
    layer.id = 'legendaryCinematic';
    layer.hidden = true;
    layer.innerHTML = `
      <div class="legendary-layer legendary-noise" aria-hidden="true"></div>
      <div class="legendary-layer legendary-vignette" aria-hidden="true"></div>
      <div class="legendary-shutter legendary-shutter-top" aria-hidden="true"></div>
      <div class="legendary-shutter legendary-shutter-bottom" aria-hidden="true"></div>
      <div class="legendary-lunar-halo" aria-hidden="true"></div>
      <div class="legendary-orbit legendary-orbit-outer" aria-hidden="true"></div>
      <div class="legendary-orbit legendary-orbit-inner" aria-hidden="true"></div>
      <div class="legendary-film-ribbon" aria-hidden="true"></div>
      <div class="legendary-reel legendary-reel-left" aria-hidden="true"><div class="legendary-reel-hub"></div></div>
      <div class="legendary-reel legendary-reel-right" aria-hidden="true"><div class="legendary-reel-hub"></div></div>
      <div class="legendary-photo-ghost legendary-photo-ghost-a" aria-hidden="true"></div>
      <div class="legendary-photo-ghost legendary-photo-ghost-b" aria-hidden="true"></div>
      <div class="legendary-eclipse-streak legendary-eclipse-streak-a" aria-hidden="true"></div>
      <div class="legendary-eclipse-streak legendary-eclipse-streak-b" aria-hidden="true"></div>
      <div class="legendary-film-left" aria-hidden="true"></div>
      <div class="legendary-film-right" aria-hidden="true"></div>
      <div class="legendary-moon" aria-hidden="true"></div>
      <div class="legendary-moonbeams" aria-hidden="true">
        <span class="legendary-ray legendary-ray-left"></span>
        <span class="legendary-ray legendary-ray-center"></span>
        <span class="legendary-ray legendary-ray-right"></span>
      </div>
      <div class="legendary-gif-wrap" aria-hidden="true"><img id="legendaryGifAsset" alt=""></div>
      <section class="legendary-cutin" id="legendaryCutin" aria-hidden="true">
        <div class="legendary-cutin-panel">
          <img id="legendaryPortrait" class="legendary-cutin-portrait" alt="">
          <div class="legendary-cutin-veils" aria-hidden="true"></div>
        </div>
        <div class="legendary-cutin-copy">
          <span id="legendaryKicker" class="legendary-cutin-kicker">LEGENDARY ACTION</span>
          <h2 id="legendaryTitle" class="legendary-cutin-title">LUNAR ECLIPSE</h2>
          <p id="legendaryBody" class="legendary-cutin-body"></p>
          <div id="legendaryCutinMark" class="legendary-cutin-mark" aria-hidden="true">☾</div>
        </div>
      </section>
      <div class="legendary-world-ticker" aria-hidden="true"><div class="legendary-world-ticker-track">SILENCE // ALL MAGIC ECLIPSED // JEANETTE REMAINS // SILENCE // ALL MAGIC ECLIPSED // JEANETTE REMAINS //</div></div>
      <div id="legendaryFloatingCaption" class="legendary-floating-caption">WORLD CONDITION // MAGIC ECLIPSED</div>
      <div id="legendaryPersistentStatus" class="legendary-persistent-status" aria-live="polite"></div>
      <div class="legendary-queen-scene" aria-hidden="true">
        <div class="legendary-queen-board"></div>
        <div class="legendary-queen-columns"></div>
        <div class="legendary-queen-crown"></div>
        <div class="legendary-queen-shroud"></div>
        <div class="legendary-queen-vines legendary-queen-vines-left"></div>
        <div class="legendary-queen-vines legendary-queen-vines-right"></div>
        <div class="legendary-queen-thorn-canopy"></div>
        <div class="legendary-queen-strike"></div>
        <div class="legendary-queen-titles">
          <span class="legendary-queen-kicker">A SACRIFICE IS NOT A SURRENDER</span>
          <h2>QUEEN'S <em>GAMBIT</em></h2>
          <p>One body falls. Another piece moves.</p>
        </div>
        <div class="legendary-queen-afterglow">
          <img src="assets/legendary/alexandria/white-queen.png" alt="">
          <span>QUEEN'S GAMBIT <small>DECOY ACTIVE · ALEXANDRIA</small></span>
        </div>
      </div>
      <div class="legendary-asya-scene" aria-hidden="true">
        <div class="legendary-asya-backwash"></div>
        <div class="legendary-asya-static"></div>
        <div class="legendary-asya-erased-frame"></div>
        <div class="legendary-asya-scanlines"></div>
        <div class="legendary-asya-grid"></div>
        <div class="legendary-asya-rings"></div>
        <div class="legendary-asya-bars"></div>
        <div class="legendary-asya-tower legendary-asya-tower-left"></div>
        <div class="legendary-asya-tower legendary-asya-tower-center"></div>
        <div class="legendary-asya-tower legendary-asya-tower-right"></div>
        <div class="legendary-asya-title">
          <span class="legendary-asya-kicker">CAUSAL SIGNAL INTERRUPTED</span>
          <h2>CHANNEL <em>0</em>: DEAD AIR</h2>
          <p>The upcoming 60 seconds of time are erased.</p>
        </div>
        <div class="legendary-asya-status">CHANNEL 0 // NO TRANSMISSION // MISSING FRAMES</div>
      </div>`;
    document.body.appendChild(layer);
  }

  const cueBuilder = document.querySelector('.dm-cue-builder');
  if (cueBuilder && !document.getElementById('dmLegendaryJeanette')) {
    const box = document.createElement('div');
    box.className = 'legendary-dm-block';
    box.innerHTML = `
      <div><strong>LEGENDARY ACTION TEST / LIVE TRIGGER</strong></div>
      <div class="legendary-dm-actions">
        <button type="button" id="dmLegendaryJeanette" class="legendary-dm-btn">JEANETTE // LUNAR ECLIPSE</button>
        <button type="button" id="dmLegendaryAlexandria" class="legendary-dm-btn">ALEXANDRIA // QUEEN'S GAMBIT</button>
        <button type="button" id="dmLegendaryAsya" class="legendary-dm-btn">ASYA // CHANNEL 0: DEAD AIR</button>
        <button type="button" id="dmLegendaryAsyaShort" class="legendary-dm-btn">ASYA // DEAD AIR / SHORT</button>
      </div>
      <p class="legendary-dm-note">Phone users can request a Legendary Action from their own handset. This desktop button mirrors the same cue for DM-side testing.</p>`;
    cueBuilder.appendChild(box);
  }

  phoneButton = $('legendaryTrigger');
  phoneShortButton = $('legendaryShortTrigger');
  phoneStatus = $('legendaryPhoneStatus');
  dmButton = $('dmLegendaryJeanette');
  dmAlexandriaButton = $('dmLegendaryAlexandria');
  dmAsyaButton = $('dmLegendaryAsya');
  dmAsyaShortButton = $('dmLegendaryAsyaShort');
  cinematic = $('legendaryCinematic');
  cutin = $('legendaryCutin');
  portrait = $('legendaryPortrait');
  titleEl = $('legendaryTitle');
  bodyEl = $('legendaryBody');
  kickerEl = $('legendaryKicker');
  gifEl = $('legendaryGifAsset');
  floatingCaption = $('legendaryFloatingCaption');
  cutinMark = $('legendaryCutinMark');
}

function getCurrentUser() {
  return $('currentUserSelect')?.value || 'Observer';
}
function getActionForCharacter(characterId) {
  const key = CHARACTER_TO_ACTION[characterId];
  return key ? LEGENDARY_LIBRARY[key] : null;
}
function getLegendaryMeta(legendaryState) {
  if (!legendaryState) return null;
  const key = legendaryState.actionKey || CHARACTER_TO_ACTION[legendaryState.characterId] || '';
  return LEGENDARY_LIBRARY[key] || null;
}
function getEffectiveLegendary() {
  // Never invent a temporary "live" effect. Only render confirmed session state.
  return state.session?.legendary || null;
}
function isLegendaryLiveFor(action) {
  const live = state.session?.legendary;
  if (!action) return false;
  return Boolean(live?.active && live.actionKey === action.actionKey);
}
function canRenderLegendaryToThisClient() {
  // A TV has an explicit URL role. Other modules can temporarily toggle the
  // tv-device class during view transitions; don't let that hide the LA.
  if (explicitTvPresentation ||
      window.SoulSeekerSession?.isTv?.() ||
      document.body.classList.contains('tv-device')) return true;
  if (phoneView.matches) return true;
  return !hasDMRole();
}

function replayCutin() {
  if (!cutin) return;
  cutin.classList.remove('is-playing');
  void cutin.offsetWidth;
  cutin.classList.add('is-playing');
}
function applyVisualLegendary(legendaryState) {
  ensureUi();
  const meta = getLegendaryMeta(legendaryState);
  const shouldShow = Boolean(legendaryState?.active && meta && canRenderLegendaryToThisClient());
  const currentlyLive = cinematic && !cinematic.hidden;
  if (!shouldShow) {
    document.body.classList.remove('legendary-lunar-eclipse', 'legendary-queens-gambit', 'legendary-channel-unaired', 'legendary-signal-burst');
    cinematic?.classList.remove('legendary-queen-active', 'legendary-asya-active', 'legendary-asya-short-active');
    if (cinematic) delete cinematic.dataset.legendaryAction;
    if (cinematic) cinematic.hidden = true;
    if (currentlyLive || state.activeCue) stopAllLegendaryAudio({restoreMusic:false});
    state.renderedActionKey = '';
    state.activeCue = '';
    updateButtons();
    return;
  }

  document.body.classList.toggle('legendary-lunar-eclipse', meta.actionKey === 'jeanette-lunar-eclipse');
  document.body.classList.toggle('legendary-queens-gambit', meta.actionKey === 'alexandria-queens-gambit');
  document.body.classList.toggle('legendary-channel-unaired', meta.actionKey === 'asya-channel-o-unaired');
  document.body.classList.toggle('legendary-signal-burst', meta.actionKey === 'asya-channel-o-short');
  cinematic.classList.toggle('legendary-queen-active', meta.actionKey === 'alexandria-queens-gambit');
  cinematic.classList.toggle('legendary-asya-active', meta.actionKey === 'asya-channel-o-unaired');
  cinematic.classList.toggle('legendary-asya-short-active', meta.actionKey === 'asya-channel-o-short');
  cinematic.dataset.legendaryAction = meta.actionKey;
  if (cutinMark) cutinMark.textContent = meta.cutinMark || '✦';
  cinematic.hidden = false;
  if (!portrait.src.endsWith(meta.portrait)) portrait.src = meta.portrait;
  portrait.alt = `${meta.characterId} portrait`;
  // Display renamed Asya copy even if an old live session still carries legacy labels.
  const asyaAction = meta.actionKey === 'asya-channel-o-unaired';
  titleEl.textContent = asyaAction ? meta.title : (legendaryState.title || meta.title);
  bodyEl.textContent = asyaAction ? meta.body : (legendaryState.body || meta.body);
  kickerEl.textContent = meta.kicker;
  if (meta.gif && !gifEl.src.endsWith(meta.gif)) gifEl.src = meta.gif;
  const persistent = $('legendaryPersistentStatus');
  if (persistent) persistent.textContent = meta.momentaryDurationMs ? '' : `${meta.characterId.toUpperCase()} // ${meta.title} // ACTIVE UNTIL ENDED`;
  floatingCaption.textContent = meta.actionKey === 'alexandria-queens-gambit'
    ? `QUEEN'S GAMBIT // DECOY ACTIVE // ALEXANDRIA`
    : meta.actionKey === 'asya-channel-o-unaired'
      ? `CHANNEL 0 // DEAD AIR // MISSING TIME`
      : meta.actionKey === 'asya-channel-o-short'
        ? `CHANNEL 0 // DEAD AIR // STATIC BURST`
        : `${meta.title} // ALL MAGIC ECLIPSED // JEANETTE EXEMPT`;

  const issuedAtMs = Number(legendaryState.issuedAtMs) || Date.now();
  // Keep visual entrances on the same six-second wall-clock timeline as the bells.
  // Late TVs jump to the correct point instead of replaying the full entrance.
  const introElapsedMs = Math.max(0, Math.min(6000, Date.now() - issuedAtMs));
  cinematic.style.setProperty('--legendary-intro-offset', `${-introElapsedMs}ms`);
  cinematic.style.setProperty('--queen-intro-offset', `${-Math.max(0, Math.min(5200, Date.now() - issuedAtMs))}ms`);
  cinematic.style.setProperty('--asya-intro-offset', `${-Math.max(0, Math.min(6000, Date.now() - issuedAtMs))}ms`);
  const anotherActivation = Boolean(currentlyLive && state.activeCue === meta.actionKey
    && state.audioStartedAt && issuedAtMs > state.audioStartedAt + 5000);
  // An optimistic phone request becoming official is still the SAME activation.
  if (!currentlyLive || state.activeCue !== meta.actionKey || anotherActivation) {
    state.activeCue = meta.actionKey;
    state.lastLegendaryId = legendaryState.id || '';
    state.renderedActionKey = meta.actionKey;
    replayCutin();
    cinematic.classList.remove('legendary-is-entering');
    void cinematic.offsetWidth;
    cinematic.classList.add('legendary-is-entering');
    startLegendaryAudio(meta, legendaryState);
  }
  updateButtons();
}

async function requestAction(action) {
  if (!action || !window.SoulSeekerSession || state.pendingActionKey) return;
  state.pendingActionKey = action.actionKey;
  state.requestError = '';
  updateButtons();
  try {
    await window.SoulSeekerSession.requestLegendary({
      actionKey: action.actionKey,
      characterId: action.characterId,
      title: action.title,
      body: action.body,
      visualKey: action.visualKey
    });
  } catch (error) {
    console.error('Legendary sync rejected by Firebase', error);
    const rulesHint = error?.code === 'permission-denied' ? 'Update the Firestore rules from this package in Firebase Console.' : 'Check Firebase connection and try again.';
    state.requestError = `NOT SYNCED — ${rulesHint}`;
    window.dispatchEvent(new CustomEvent('soulseekers:legendaryerror', {detail:{ code:error?.code||'unknown', message:rulesHint }}));
    return;
  } finally {
    state.pendingActionKey = '';
    updateButtons();
  }
}

function updateButtons() {
  ensureUi();
  const currentUser = getCurrentUser();
  const currentAction = getActionForCharacter(currentUser);
  const live = isLegendaryLiveFor(currentAction);
  const shortAction = currentUser === 'Asya' ? LEGENDARY_LIBRARY['asya-channel-o-short'] : null;
  const shortLive = isLegendaryLiveFor(shortAction);
  if (phoneButton) {
    phoneButton.disabled = !currentAction || Boolean(state.pendingActionKey);
    phoneButton.classList.toggle('is-armed', Boolean(currentAction && !live));
    phoneButton.classList.toggle('is-live', Boolean(currentAction && live));
    phoneButton.innerHTML = currentAction
      ? `<strong>${live ? 'END LEGENDARY' : `${currentAction.characterId} // ${currentAction.title}`}</strong><span>${live ? (currentAction.actionKey === 'alexandria-queens-gambit' ? 'PRESS AGAIN TO END THE DECOY' : currentAction.actionKey === 'asya-channel-o-unaired' ? 'PRESS AGAIN TO END DEAD AIR' : 'PRESS AGAIN TO DROP THE ECLIPSE') : 'DISPLAY THE LEGENDARY CINEMATIC'}</span>`
      : `<strong>LEGENDARY ACTION</strong><span>SELECT A CHARACTER WITH A READY LEGENDARY ACTION</span>`;
  }
  if (phoneShortButton) {
    phoneShortButton.hidden = !shortAction;
    phoneShortButton.disabled = !shortAction || Boolean(state.pendingActionKey);
    phoneShortButton.classList.toggle('is-armed', Boolean(shortAction && !shortLive));
    phoneShortButton.classList.toggle('is-live', Boolean(shortAction && shortLive));
    if (shortAction) phoneShortButton.innerHTML = `<strong>${shortLive ? 'BURST ACTIVE' : 'ASYA // DEAD AIR / SHORT'}</strong><span>${shortLive ? 'AUTO-CLEARING DEAD AIR' : 'BRIEF STATIC + INVERT FLASH'}</span>`;
  }
  if (phoneStatus) {
    phoneStatus.textContent = state.requestError || (state.pendingActionKey ? 'SYNCING WITH FIREBASE…' : currentAction
      ? (live ? `${currentAction.title} IS ACTIVE` : shortAction ? `${currentAction.title} READY · INSTANT BURST READY` : `${currentAction.title} READY`)
      : 'NO LEGENDARY ACTION EQUIPPED');
  }
  if (dmButton) dmButton.classList.toggle('is-live', Boolean(state.session?.legendary?.active && state.session.legendary.actionKey === 'jeanette-lunar-eclipse'));
  if (dmAlexandriaButton) dmAlexandriaButton.classList.toggle('is-live', Boolean(state.session?.legendary?.active && state.session.legendary.actionKey === 'alexandria-queens-gambit'));
  if (dmAsyaButton) dmAsyaButton.classList.toggle('is-live', Boolean(state.session?.legendary?.active && state.session.legendary.actionKey === 'asya-channel-o-unaired'));
  if (dmAsyaShortButton) dmAsyaShortButton.classList.toggle('is-live', Boolean(state.session?.legendary?.active && state.session.legendary.actionKey === 'asya-channel-o-short'));
}

async function handlePhoneButton() {
  const action = getActionForCharacter(getCurrentUser());
  if (!action) return;
  await requestAction(action);
}
async function handlePhoneShortButton() {
  if (getCurrentUser() !== 'Asya') return;
  const action = LEGENDARY_LIBRARY['asya-channel-o-short'];
  if (!action) return;
  await requestAction(action);
}
function bindUi() {
  ensureUi();
  phoneButton?.addEventListener('click', handlePhoneButton);
  phoneShortButton?.addEventListener('click', handlePhoneShortButton);
  dmButton?.addEventListener('click', async () => {
    const action = LEGENDARY_LIBRARY['jeanette-lunar-eclipse'];
    if (!action) return;
    try {
      await window.SoulSeekerSession?.toggleLegendary?.({
        actionKey: action.actionKey,
        characterId: action.characterId,
        title: action.title,
        body: action.body,
        visualKey: action.visualKey
      });
    } catch (error) { console.error('DM legendary trigger failed', error); }
  });
  dmAlexandriaButton?.addEventListener('click', async () => {
    const action = LEGENDARY_LIBRARY['alexandria-queens-gambit'];
    try {
      await window.SoulSeekerSession?.toggleLegendary?.({
        actionKey: action.actionKey, characterId: action.characterId,
        title: action.title, body: action.body, visualKey: action.visualKey
      });
    } catch (error) { console.error('Alexandria legendary trigger failed', error); }
  });
  dmAsyaButton?.addEventListener('click', async () => {
    const action = LEGENDARY_LIBRARY['asya-channel-o-unaired'];
    try {
      await window.SoulSeekerSession?.toggleLegendary?.({
        actionKey: action.actionKey, characterId: action.characterId,
        title: action.title, body: action.body, visualKey: action.visualKey
      });
    } catch (error) { console.error('Asya legendary trigger failed', error); }
  });
  dmAsyaShortButton?.addEventListener('click', async () => {
    const action = LEGENDARY_LIBRARY['asya-channel-o-short'];
    try {
      await window.SoulSeekerSession?.toggleLegendary?.({
        actionKey: action.actionKey, characterId: action.characterId,
        title: action.title, body: action.body, visualKey: action.visualKey
      });
    } catch (error) { console.error('Asya short legendary trigger failed', error); }
  });
  $('currentUserSelect')?.addEventListener('change', updateButtons);
  phoneView.addEventListener?.('change', updateButtons);
}

// Legacy request relay removed. The shared state is updated atomically by
// authenticated players; a trusted desktop no longer has to remain open.
function handleSessionState(next) {
  const incoming = next?.detail || next || window.SoulSeekerSession?.getState?.() || null;
  const serial = Number(incoming?.legendary?.serial) || 0;
  // A stale local scene/audio snapshot must not clear a newer LA activation.
  if (state.session && serial < state.confirmedSerial) return;
  state.confirmedSerial = serial;
  state.session = incoming;
  const effectiveLegendary = getEffectiveLegendary();
  const active = Boolean(effectiveLegendary?.active);
  if (active && shouldSuspendAmbientForLegendary(effectiveLegendary)) silenceAmbientMusic();
  else resumeAmbientMusic();
  maybeScheduleMomentaryLegendaryClear(effectiveLegendary);
  state.sessionWasLegendary = active;
  applyVisualLegendary(effectiveLegendary);
  if (!active) clearMomentaryLegendaryTimer();
  updateButtons();
}

bindUi();
window.addEventListener('soulseekers:sessionstate', handleSessionState);
window.addEventListener('pagehide', () => { clearMomentaryLegendaryTimer(); stopAllLegendaryAudio({restoreMusic:false}); }, { once: true });
window.addEventListener('soulseekers:viewchange', updateButtons);
window.addEventListener('soulseekers:musicready', () => { const active = getEffectiveLegendary(); if ((state.sessionWasLegendary || active?.active) && shouldSuspendAmbientForLegendary(active)) silenceAmbientMusic(); });
onRoleChange(() => { applyVisualLegendary(getEffectiveLegendary()); });
handleSessionState(window.SoulSeekerSession?.getState?.());

