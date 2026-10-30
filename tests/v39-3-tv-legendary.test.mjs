import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const get = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
test('V39.3 TV refreshes all LA assets and does not depend on a transient CSS role', () => {
  const html = get('index.html');
  const js = get('legendaryActions.js');
  const css = get('legendaryRefinement-v38-7.css');
  assert.match(html, /presentation-v40\.css\?v=40/);
  assert.match(html, /legendaryActions\.js\?v=40/);
  assert.match(js, /const explicitTvPresentation = new URLSearchParams\(location\.search\)\.get\('tv'\) === '1'/);
  assert.match(js, /document\.body\.classList\.add\('legendary-tv-mode'\)/);
  assert.match(js, /onRoleChange\(\(\) => \{ applyVisualLegendary\(getEffectiveLegendary\(\)\); \}\)/);
  assert.match(css, /body:is\(\.tv-device,\.legendary-tv-mode\) #legendaryCinematic\.legendary-queen-active \.legendary-queen-crown/);
  assert.match(css, /body:is\(\.tv-device,\.legendary-tv-mode\) #legendaryCinematic\.legendary-queen-active \.legendary-queen-titles/);
  assert.match(css, /queenCheckmateFlashV392/);
  assert.match(css, /queenCanopyGrowV392/);
});
