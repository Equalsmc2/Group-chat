import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test("V38.2 Queen's Gambit uses Alexandria portrait and locks the UI to a white/red theme", () => {
  const js = file('legendaryActions.js');
  const css = file('legendaryQueens-v37-8.css');
  const html = file('index.html');
  assert.match(js, /portrait: 'assets\/legendary\/alexandria\/alexandria-cutin-v38-2\.png'/);
  assert.match(css, /--surface:#fffdfb/);
  assert.match(css, /background-color:rgba\(255,255,255,\.90\)!important/);
  assert.match(css, /body\.legendary-queens-gambit \.site-shell img:not\(\.legendary-cutin-portrait\)/);
  assert.match(css, /body\.legendary-queens-gambit button,/);
  assert.match(html, /legendaryActions\.js\?v=39\.3/);
  assert.match(html, /legendaryQueens-v37-8\.css\?v=39\.4/);
});
