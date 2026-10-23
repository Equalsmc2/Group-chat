import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = name => readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('V40.6 bumps build markers and loads the new Asya override layer',()=>{
  const html=read('index.html');
  assert.match(html,/SS \/ V40\.7/);
  assert.match(html,/asya-deadair-v40-7\.css\?v=40\.7/);
  assert.match(html,/legendaryActions\.js\?v=40\.7/);
});

test('Asya uses deterministic random sound pools and deterministic short glitch variants',()=>{
  const js=read('legendaryActions.js');
  const css=read('asya-deadair-v40-7.css');
  assert.match(js,/const ASYA_FULL_SOUND_VARIANTS = \[/);
  assert.match(js,/const ASYA_SHORT_SOUND_VARIANTS = \[/);
  assert.match(js,/const ASYA_GLITCH_VARIANTS = \[/);
  assert.match(js,/function pickDeterministic\(/);
  assert.match(js,/applyAsyaBurstVariant\(legendaryState\)/);
  assert.match(css,/@keyframes asyaDislocationV407/);
  assert.match(css,/--asya-burst-clip-1/);
});
