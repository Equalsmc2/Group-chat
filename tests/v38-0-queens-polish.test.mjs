import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test("V38.2 Queen's Gambit polish expands thorns, side-drapes the cloth, and theme-shifts the UI", () => {
  const css = file('legendaryQueens-v37-8.css');
  const html = file('index.html');
  assert.match(css, /legendary-queen-shroud::before/);
  assert.match(css, /legendary-queen-shroud::after/);
  assert.match(css, /queenShroudDropLeft/);
  assert.match(css, /queenShroudDropRight/);
  assert.match(css, /width:clamp\(760px,84vw,1420px\)/);
  assert.match(css, /body\.legendary-queens-gambit\{/);
  assert.match(css, /--accent:#c91831/);
  assert.match(html, /legendaryQueens-v37-8\.css\?v=39\.4/);
  assert.match(html, /legendaryActions\.js\?v=39\.3/);
});
