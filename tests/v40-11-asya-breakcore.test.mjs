import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get = name => readFileSync(new URL('../'+name, import.meta.url), 'utf8');

test('dramatic neon Asya layer is retained in the final active stylesheet',()=>{
  const html=get('index.html');
  assert.match(html,/asya-deadair-v40-9\.css\?v=40\.10/);
  assert.match(html,/legendaryActions\.js\?v=40\.10/);
  assert.match(get('asya-deadair-v40-9.css'),/DEAD AIR \/ BREAKCORE TRANSMISSION/);
});
test('Full Dead Air uses synchronized 4.8 second collage then resolves',()=>{
  const js=get('legendaryActions.js'),css=get('asya-deadair-v40-9.css');
  assert.match(js,/asya-breakcore-portrait/);
  assert.match(js,/--asya-world-offset/);
  assert.match(css,/ssAsyaPortrait411 4800ms/);
  assert.match(css,/--asya-intro-offset/);
  assert.match(css,/legendary-channel-unaired \.site-shell/);
  assert.match(css,/100%\{opacity:0/);
  assert.match(css,/#32edff/);
  assert.match(css,/#ff36b5/);
});
test('Short Dead Air is anonymous and retains exact 500ms cleanup',()=>{
  const js=get('legendaryActions.js'),css=get('asya-deadair-v40-9.css');
  assert.match(js,/asya-breakcore-rift/);
  assert.doesNotMatch(js,/asya-breakcore-memory/);
  assert.match(js,/const anonymousBurst = meta.actionKey === 'asya-channel-o-short'/);
  assert.match(js,/if \(anonymousBurst\) \{[\s\S]*?portrait\.removeAttribute\('src'\)/);
  assert.match(js,/if \(anonymousBurst\) \{[\s\S]*?titleEl\.textContent = ''/);
  assert.match(js,/clearAsyaGlitchPair\(\{ keepActivation: true \}\)/);
  assert.match(js,/\}, 500\)/);
  const shortCss=css.slice(css.indexOf('/* SHORT DEAD AIR: ANONYMOUS'));
  assert.match(shortCss,/ssAsyaRift412 500ms/);
  assert.doesNotMatch(shortCss,/background\s*:\s*url\(/);
  assert.doesNotMatch(shortCss,/asya-cutin|legendary-action/i);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css,/audio\.play\(|new Audio/);
});
