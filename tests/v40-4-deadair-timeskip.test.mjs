import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('V40.4 is actually deployed with a separately versioned Asya stylesheet and JS',()=>{
  const html=read('index.html'),installer=readFileSync(new URL('../../INSTALL_FULL_WEBSITE.bat',import.meta.url),'utf8');
  assert.match(html,/SS \/ V40\.6/);
  assert.match(html,/presentation-v40\.css\?v=40\.6/);
  assert.match(html,/asya-timeskip-v40-4\.css\?v=40\.6/);
  assert.match(html,/legendaryActions\.js\?v=40\.6/);
  assert.match(installer,/findstr \/C:"SS \/ V40\.6"/);
});

test('Dead Air uses the explicitly supplied King Crimson time skip excerpts, no radio audio',()=>{
  const js=read('legendaryActions.js');
  assert.match(js,/stingerAudio: 'assets\/legendary\/asya\/time-skip-v40-5\.mp3'/);
  assert.match(js,/stingerAudio: 'assets\/legendary\/asya\/time-skip-short-v40-5\.mp3'/);
  assert.doesNotMatch(js,/stingerAudio: 'assets\/legendary\/asya\/(?:signal-chirp|static-burst)\.mp3'/);
  assert.match(js,/const ASYA_THEME_START_MS = 3000;/);
  assert.ok(existsSync(new URL('../assets/legendary/asya/time-skip-v40-5.mp3',import.meta.url)));
  assert.ok(existsSync(new URL('../assets/legendary/asya/time-skip-short-v40-5.mp3',import.meta.url)));
});

test('Short Dead Air is a half-second glitch without showing any cinematic name',()=>{
  const js=read('legendaryActions.js'),css=read('asya-timeskip-v40-4.css');
  assert.match(js,/momentaryDurationMs: 1800[\s\S]*visualDurationMs: 500/);
  assert.match(css,/#legendaryCinematic\.legendary-asya-short-active\s*\{display:none!important\}/);
  assert.match(css,/@keyframes asyaWebsiteSkip500/);
  assert.match(css,/animation:asyaWebsiteSkip500 500ms/);
  assert.match(css,/body\.legendary-signal-burst::after/);
});

test('Full Dead Air removes static/signal visual layers and leaves other legendary state untouched',()=>{
  const css=read('asya-timeskip-v40-4.css'),js=read('legendaryActions.js');
  assert.match(css,/#legendaryCinematic\.legendary-asya-active \.legendary-asya-static/);
  assert.match(css,/#legendaryCinematic\.legendary-asya-active \.legendary-asya-scanlines/);
  assert.match(css,/#legendaryCinematic\.legendary-asya-active \.legendary-noise/);
  assert.match(css,/display:none!important;/);
  assert.match(js,/document\.body\.classList\.toggle\('legendary-channel-unaired'/);
  assert.match(js,/const ASYA_THEME_START_MS = 3000/);
  assert.match(js,/queenSfx/);
});
