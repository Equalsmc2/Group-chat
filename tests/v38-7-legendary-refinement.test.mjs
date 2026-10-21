import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file = name => readFileSync(new URL(`../${name}`,import.meta.url),'utf8');

test('V38.7 changes only Asya public labels while preserving synced internal keys', () => {
 const src=file('legendaryActions.js');
 assert.match(src,/actionKey: 'asya-channel-o-unaired'/);
 assert.match(src,/title: 'CHANNEL 0: DEAD AIR'/);
 assert.match(src,/body: '“From which stars have we fallen/);
 assert.match(src,/<h2>CHANNEL <em>0<\/em>: DEAD AIR<\/h2>/);
 assert.match(src,/ASYA \/\/ CHANNEL 0: DEAD AIR/);
 assert.match(src,/asyaAction \? meta\.title/);
 assert.match(src,/asyaAction \? meta\.body/);
 assert.doesNotMatch(src,/<h2>CHANNEL <em>Ø<\/em>: UNAIRED<\/h2>/);
});

test('V39.1 uses one persistent fullscreen thorn image without legacy tiles', () => {
 const css=file('legendaryRefinement-v38-7.css');
 assert.equal((css.match(/queens-gambit-vines-fullscreen\.png/g)||[]).length,1);
 assert.doesNotMatch(css,/brambles\.png/);
 assert.match(css,/\.legendary-queen-vines\s*\{\s*display:none!important/);
 assert.match(css,/background-size:cover/);
 assert.match(css,/background-repeat:no-repeat/);
 assert.match(css,/72%,100% \{opacity:\.86;transform:scale\(1\)/);
 assert.match(css,/animation:queenCanopyGrow[^;]+both/);
 assert.match(css,/animation-delay:var\(--queen-intro-offset,0ms\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/content:none;\s*display:none;/);
});

test('V38.7 Queen uses white and red CSS, no global screen filter', () => {
 const html=file('index.html');
 const css=file('legendaryRefinement-v38-7.css');
 assert.ok(html.indexOf('legendarySync-v38-6.css')<html.indexOf('legendaryRefinement-v38-7.css'));
 assert.match(css,/body\.legendary-queens-gambit \.site-shell,\nbody\.legendary-queens-gambit \.app-layout/);
 assert.match(css,/body\.legendary-queens-gambit \.ambient-sky,[\s\S]*?filter:none!important/);
 assert.match(css,/@layer soulseekers35/);
 assert.match(css,/--gold: #c91831/);
 assert.match(css,/--ink: #fff/);
 assert.match(css,/--surface: #fff/);
 assert.match(html,/legendaryActions\.js\?v=(39\.3|39\.7)/);
});

test('V38.7 keeps full activation as stateful manual toggle and short Asya separate', () => {
 const src=file('legendaryActions.js');
 assert.match(src,/momentaryDurationMs: 850/);
 assert.match(src,/title: 'CHANNEL 0: DEAD AIR \/\/ SHORT'/);
 assert.match(src,/meta\.actionKey === 'asya-channel-o-short'/);
 assert.match(src,/themeAudio: 'assets\/legendary\/asya\/blood-drain-theme\.mp3'/);
 assert.match(src,/theme\.loop = true/);
});
