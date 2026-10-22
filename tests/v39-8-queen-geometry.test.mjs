import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const get = f => readFileSync(new URL(`../${f}`, import.meta.url),'utf8');

test('V39.8 positions compact Queen cut-in above the chess piece, with slash higher than pedestal', () => {
  const css = get('v39-8-presentation-fixes.css');
  assert.match(css, /legendary-queen-active \.legendary-cutin\{[\s\S]*?top:clamp\(10px,3\.5vh,46px\)!important;[\s\S]*?height:clamp\(162px,25vh,264px\)!important;/);
  assert.match(css, /legendary-queen-active \.legendary-queen-crown\{[\s\S]*?top:35%!important/);
  assert.match(css, /legendary-queen-active \.legendary-queen-strike\{[\s\S]*?top:54%!important/);
  assert.match(css, /body:is\(\.tv-device,\.legendary-tv-mode\)[^\n]+ \.legendary-queen-strike\{[\s\S]*?top:51%!important/);
  assert.match(css, /@keyframes queenSlashV398/);
  assert.match(css, /@keyframes queenSacrificeV398/);
});

test('V39.8 deployment identity and installer verification agree', () => {
  const html=get('index.html');
  assert.match(html, /SS \/ V40/);
  assert.match(html,/presentation-v40\.css\?v=40/);
  assert.doesNotMatch(html,/SS \/ V39\.7/);
  assert.match(get('package.json'),/40\.1\.0/);
});
