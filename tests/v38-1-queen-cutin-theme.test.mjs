import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test("V38.2 Queen's Gambit keeps the shared cut-in and pushes the UI into a red/white state", () => {
  const js = file('legendaryActions.js');
  const css = file('legendaryActions.css');
  const queenCss = file('legendaryQueens-v37-8.css');
  const html = file('index.html');
  assert.match(js, /cutinMark: '♛'/);
  assert.match(js, /legendaryCutinMark/);
  assert.match(js, /cinematic\.dataset\.legendaryAction = meta\.actionKey/);
  assert.match(css, /#legendaryCinematic\.legendary-queen-active\{/);
  assert.match(css, /--legendary-cutin-copy-bg:/);
  assert.match(css, /legendary-cutin\{z-index:28\}/);
  assert.doesNotMatch(queenCss, /> :not\(\.legendary-queen-scene\)\{display:none!important\}/);
  assert.match(queenCss, /legendary-queen-active \.legendary-moonbeams/);
  assert.match(queenCss, /body\.legendary-queens-gambit input/);
  assert.match(html, /legendaryActions\.js\?v=(39\.3|39\.7)/);
});
