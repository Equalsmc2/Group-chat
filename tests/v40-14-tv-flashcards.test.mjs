import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (name) => readFileSync(new URL('../'+name, import.meta.url), 'utf8');

test('V40.14: TV overlay remains behind portrait cut-in and turn splash', () => {
  const css = read('asya-deadair-v40-9.css');
  const coreCss = read('presentation-v40.css');
  const overlayIndex = css.indexOf('#asyaDeadAirActiveFx{');
  assert.ok(overlayIndex > 0);
  const layer = css.slice(overlayIndex, css.indexOf('body.legendary-channel-unaired #asyaDeadAirActiveFx', overlayIndex));
  assert.match(layer, /z-index:1100!important/);
  assert.match(css, /body\.legendary-channel-unaired #legendaryCinematic\.legendary-asya-active\s*\{\s*z-index:1250!important/);
  assert.match(coreCss, /\.turn-splash\{position:fixed;inset:0;z-index:1400/);
  assert.match(css, /body\.legendary-channel-unaired #asyaDeadAirActiveFx\{[\s\S]*?animation:ssAsyaActiveEntrance413/);
});

test('V40.14: turn flashcard is reparented outside transformed shell, keeping existing DOM', () => {
  const js = read('combat.js');
  const html = read('index.html');
  const loader = read('desktopApps.js');
  assert.match(js, /if \(turnSplash && turnSplash\.parentElement !== document\.body\) \{\s*document\.body\.appendChild\(turnSplash\)/);
  assert.match(js, /turnSplash\.hidden=false/);
  assert.match(html, /id="turnSplash"/);
  assert.match(html, /asya-deadair-v40-9\.css\?v=40\.10&fx=40\.14/);
  assert.match(loader, /combat\.js\?v=40\.1&fx=40\.14/);
});

test('V40.14: secret short glitch remains free from portrait and title cards', () => {
  const css = read('asya-deadair-v40-9.css');
  const js = read('legendaryActions.js');
  assert.match(css, /#legendaryCinematic\[data-legendary-action="asya-channel-o-short"\],[\s\S]*?display:none!important/);
  assert.match(js, /if \(anonymousBurst\) \{[\s\S]*?portrait\.removeAttribute\('src'\)/);
  assert.match(js, /activateAsyaGlitchPair\(legendaryState\)/);
});
