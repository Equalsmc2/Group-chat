import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, statSync} from 'node:fs';
import vm from 'node:vm';

const file = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
const source = file('legendaryActions.js');

function extract(start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, `Could not find ${start}`);
  return source.slice(a, b);
}

test('V38.4 packages A Dramatic Irony, Blood Drain, and keeps all LA theme sources', () => {
  const score = new URL('../assets/legendary/alexandria/alexandria-theme-a-dramatic-irony.mp3', import.meta.url);
  assert.ok(statSync(score).size > 3_000_000);
  assert.match(source, /themeAudio: 'assets\/legendary\/alexandria\/alexandria-theme-a-dramatic-irony\.mp3'/);
  assert.match(source, /themeAudio: 'assets\/legendary\/jeanette\/lunar-theme-instrumental\.mp3'/);
  assert.match(source, /themeAudio: 'assets\/legendary\/asya\/blood-drain-theme\.mp3'/);
  assert.match(file('index.html'), /legendaryActions\.js\?v=38\.7/);
});

test('Queen and Jeanette themes explicitly enable native looping on playback', () => {
  const queen = extract('function startQueenTheme(', '\n// Queen\'s Gambit:');
  const lunar = extract('function startSong(', '\nfunction beginBellFade(');
  assert.match(queen, /getAudio\(meta\.themeAudio, true\)/);
  assert.match(queen, /theme\.loop = true/);
  assert.match(lunar, /getAudio\(meta\.themeAudio, true\)/);
  assert.match(lunar, /song\.loop = true/);
  assert.match(source, /cached\.loop = loop/);
});

test('Queen joins an active loop at the correct position and can cancel safely', () => {
  const queen = extract('function startQueenTheme(', '\n// Queen\'s Gambit:');
  const theme = {
    loop:false, duration:112.776, currentTime:0, readyState:1, volume:0,
    addEventListener:() => { throw new Error('Ready audio should not defer a seek'); }
  };
  const calls=[];
  const state = { audioRun: 7, currentAudioKey: '' };
  const now = 1_000_000;
  const issued = now - (5650 + 2 * 112_776 + 12_345);
  const context = {
    state,
    THEME_VOLUME:0.76,
    QUEEN_THEME_START_MS:5650,
    getEffectiveLegendary:() => ({active:true}),
    canPlayLegendaryAudio:() => true,
    getAudio:(url,loop) => { calls.push(['lookup', url, loop]); return theme; },
    safelyPlay:async (audio,run) => { calls.push(['play',audio,run]); return true; },
    Date: {now:() => now},
    Number, Math,
  };
  vm.runInNewContext(`${queen}; startQueenTheme({themeAudio:'new-score.mp3'},7,${issued})`, context);
  assert.equal(theme.loop,true);
  assert.equal(theme.volume,0.76);
  assert.ok(Math.abs(theme.currentTime-12.345) < 0.001);
  assert.equal(state.currentAudioKey,'queens-gambit-theme');
  assert.equal(calls.filter(x=>x[0]==='play').length,1);
  calls.length=0;
  state.audioRun=8;
  vm.runInNewContext(`${queen}; startQueenTheme({themeAudio:'new-score.mp3'},7,${issued})`, context);
  assert.equal(calls.length,0, 'Outdated activation must not begin playback');
});

test('Theme stop path cancels pending timers and pauses all pooled theme audio', () => {
  assert.match(source, /function stopAllLegendaryAudio\(\{restoreMusic = true\} = \{\}\)/);
  assert.match(source, /for \(const timer of state\.audioTimeouts\) clearTimeout\(timer\)/);
  assert.match(source, /for \(const audio of audioPool\.values\(\)\)/);
  assert.match(source, /audio\.pause\(\); audio\.currentTime = 0/);
  assert.match(source, /resumeAmbientMusic\(\)/);
});
