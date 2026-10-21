import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file = name => readFileSync(new URL(`../${name}`,import.meta.url),'utf8');

test('V38.7 changes only Asya public labels while preserving synced internal keys', () => {
 const src=file('legendaryActions.js');
 assert.match(src,/actionKey: 'asya-channel-o-unaired'/);
 assert.match(src,/title: 'CHANNEL 0: DEAD AIR'/);
 assert.match(src,/body: 'The upcoming 60 seconds of time are erased\.'/);
 assert.match(src,/<h2>CHANNEL <em>0<\/em>: DEAD AIR<\/h2>/);
 assert.match(src,/ASYA \/\/ CHANNEL 0: DEAD AIR/);
 assert.match(src,/asyaAction \? meta\.title/);
 assert.match(src,/asyaAction \? meta\.body/);
 assert.doesNotMatch(src,/<h2>CHANNEL <em>Ø<\/em>: UNAIRED<\/h2>/);
});

test('V38.7 thorns engulf the frame and stay after entrance, without an always-running loop', () => {
 const js=file('legendaryActions.js');
 const css=file('legendaryRefinement-v38-7.css');
 assert.match(js,/legendary-queen-thorn-canopy/);
 assert.match(js,/legendary-queen-vines legendary-queen-vines-left/);
 assert.match(js,/legendary-queen-vines legendary-queen-vines-right/);
 assert.match(css,/\.legendary-queen-vines\s*\{/);
 assert.match(css,/height: 120dvh/);
 assert.match(css,/@keyframes queenThornsClimb\s*\{/);
 assert.match(css,/100%\s*\{opacity:\.86;transform:translateY\(0\)/);
 assert.match(css,/@keyframes queenCanopyGrow/);
 assert.match(css,/100%\s*\{opacity:\.66;transform:translateY\(0\)/);
 assert.match(css,/animation-fill-mode: both/);
});

test('V38.7 Queen uses white and red CSS, no global screen filter', () => {
 const html=file('index.html');
 const css=file('legendaryRefinement-v38-7.css');
 assert.ok(html.indexOf('legendarySync-v38-6.css?v=38.6')<html.indexOf('legendaryRefinement-v38-7.css?v=38.7'));
 assert.match(css,/body\.legendary-queens-gambit \.site-shell,\nbody\.legendary-queens-gambit \.app-layout/);
 assert.match(css,/body\.legendary-queens-gambit \.ambient-sky,[\s\S]*?filter:none!important/);
 assert.match(css,/@layer soulseekers35/);
 assert.match(css,/--gold: #c91831/);
 assert.match(css,/--ink: #fff/);
 assert.match(css,/--surface: #fff/);
 assert.match(html,/legendaryActions\.js\?v=38\.7/);
});

test('V38.7 keeps full activation as stateful manual toggle and short Asya separate', () => {
 const src=file('legendaryActions.js');
 assert.match(src,/momentaryDurationMs: 850/);
 assert.match(src,/title: 'CHANNEL 0: DEAD AIR \/\/ SHORT'/);
 assert.match(src,/meta\.actionKey === 'asya-channel-o-short'/);
 assert.match(src,/themeAudio: 'assets\/legendary\/asya\/blood-drain-theme\.mp3'/);
 assert.match(src,/theme\.loop = true/);
});
