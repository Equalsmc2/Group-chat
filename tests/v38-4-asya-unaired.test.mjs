import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, statSync} from 'node:fs';

const file = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test('V38.4 adds Asya full and instant legendary actions plus the new stylesheet', () => {
  const js = file('legendaryActions.js');
  const html = file('index.html');
  const css = file('legendaryAsya-v38-4.css');
  assert.match(js, /'asya-channel-o-unaired'/);
  assert.match(js, /'asya-channel-o-short'/);
  assert.match(js, /themeAudio: 'assets\/legendary\/asya\/blood-drain-theme\.mp3'/);
  assert.match(js, /momentaryDurationMs: 850/);
  assert.match(js, /legendaryShortTrigger/);
  assert.match(js, /dmLegendaryAsyaShort/);
  assert.match(css, /body\.legendary-channel-unaired/);
  assert.match(css, /body\.legendary-signal-burst/);
  assert.match(js, /legendary-asya-scene/);
  assert.match(html, /legendaryAsya-v38-4\.css\?v=38\.4/);
  assert.match(html, /legendaryActions\.js\?v=38\.6/);
});

test('V38.4 packages Asya audio and visual assets', () => {
  for (const name of [
    'asya-cutin.jpg',
    'everybody-static.gif',
    'signal-chirp.mp3',
    'static-burst.mp3',
    'blood-drain-theme.mp3',
    'tower-red.png',
    'tower-ring.png',
    'tower-panel.png'
  ]) {
    const size = statSync(new URL(`../assets/legendary/asya/${name}`, import.meta.url)).size;
    assert.ok(size > 1000, `${name} packaged`);
  }
});
