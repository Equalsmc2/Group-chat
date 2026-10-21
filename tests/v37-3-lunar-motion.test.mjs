import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { LUNAR_TIMELINE, lunarAudioPhase } from '../legendaryTimeline.js';
const file = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test('bell ends before the placeholder theme is permitted to begin', () => {
  const endOfBell = LUNAR_TIMELINE.bellHoldMs + LUNAR_TIMELINE.bellFadeMs;
  assert.ok(endOfBell < LUNAR_TIMELINE.songStartMs, 'short silent gap required');
  assert.equal(lunarAudioPhase(0).phase, 'bell');
  assert.equal(lunarAudioPhase(LUNAR_TIMELINE.bellHoldMs).phase, 'bell-fading');
  assert.ok(lunarAudioPhase(LUNAR_TIMELINE.bellHoldMs + 600).bellGain < 1);
  assert.equal(lunarAudioPhase(endOfBell).phase, 'silence');
  assert.equal(lunarAudioPhase(LUNAR_TIMELINE.songStartMs - 1).phase, 'silence');
  assert.equal(lunarAudioPhase(LUNAR_TIMELINE.songStartMs).phase, 'song');
  assert.equal(lunarAudioPhase(LUNAR_TIMELINE.songStartMs + 1250).songOffsetMs, 1250);
});

test('legendary audio player cancels pending phases and stops bell before starting song', () => {
  const source = file('legendaryActions.js');
  assert.match(source, /function stopAllLegendaryAudio/);
  assert.match(source, /state\.audioRun \+= 1/);
  assert.match(source, /for \(const timer of state\.audioTimeouts\) clearTimeout\(timer\)/);
  const songStart = source.indexOf('function startSong(');
  const next = source.indexOf('function beginBellFade(', songStart);
  const startSection = source.slice(songStart, next);
  assert.ok(startSection.indexOf('bell.volume = 0') < startSection.indexOf('safelyPlay(song, run)'), 'bell must be silenced before theme');
  assert.ok(startSection.indexOf('bell.pause()') < startSection.indexOf('safelyPlay(song, run)'), 'bell must be stopped before theme');
  assert.match(source, /song\.loop = loop|audio\.loop = loop/);
});

test('spinning tape reels and kinetic cinema elements are present but respect reduced motion', () => {
  const script=file('legendaryActions.js'), css=file('legendaryActions.css');
  for (const element of ['legendary-reel-left','legendary-reel-right','legendary-film-ribbon','legendary-shutter-top','legendary-world-ticker']) {
    assert.ok(script.includes(element), element);
  }
  for (const animation of ['legendaryReelSpin','legendaryFilmFeed','legendaryShutterUpper','legendaryTitleSnap','legendaryMarquee']) assert.ok(css.includes(`@keyframes ${animation}`));
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /animation:none!important/);
});

test('v37.7 loads only one authoritative session director and includes the new instrumental audio', () => {
  const html=file('index.html'), desktop=file('desktopApps.js'), legendary=file('legendaryActions.js');
  assert.match(html, /legendaryActions\.js\?v=(37\.8|38\.2|38\.3|38\.4|38\.5|38\.6|38\.7)/);
  assert.match(html, /legendaryActions\.css\?v=\d+\.\d+/);
  assert.match(desktop,/sessionDirector\.js\?v=38\.6/);
  assert.match(legendary,/sessionDirector\.js\?v=38\.6/);
  assert.match(legendary,/lunar-theme-instrumental\.mp3/);
  assert.match(legendary,/lunar-bell-intro-v37-5\.mp3/);
  const path = new URL('../assets/legendary/jeanette/lunar-theme-instrumental.mp3', import.meta.url);
  assert.ok(existsSync(path));
  assert.ok(statSync(path).size > 5000000);
});
