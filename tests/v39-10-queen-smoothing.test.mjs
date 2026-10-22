import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('queen has eased rise, impact, and fall on the same five-second timeline',()=>{
 const css=read('v39-9-queen-composition.css');
 assert.match(css, /@keyframes queenSacrificeV399[\s\S]*?81\.7%[\s\S]*?91%[\s\S]*?100%/);
 assert.match(css, /@keyframes queenCardArrivalV399[\s\S]*?animation-timing-function/);
 assert.match(css, /@keyframes queenSlashV399[\s\S]*?81\.7%/);
 assert.match(css, /@keyframes queenImpactV399[\s\S]*?81\.7%/);
});
test('heartbeat starts at activation, fades into theme, and is not duplicated',()=>{
 const js=read('legendaryActions.js');
 const queen=js.slice(js.indexOf('function startQueenAudio'),js.indexOf('function startAsyaTheme'));
 assert.match(queen, /getAudio\(meta\.queenSfx\[0\]\)/);
 assert.match(queen, /HEARTBEAT_VOLUME = \.84/);
 assert.match(queen, /HEARTBEAT_FADE_START_MS = 4100/);
 assert.match(queen, /QUEEN_THEME_START_MS - HEARTBEAT_FADE_START_MS/);
 assert.match(queen, /requestAnimationFrame\(updateHeartbeat\)/);
 assert.match(queen, /\{ at:4250, url:meta\.queenSfx\[3\]/);
 assert.match(queen, /\{ at:4680, url:meta\.queenSfx\[1\]/);
 assert.equal((queen.match(/getAudio\(meta\.queenSfx\[0\]\)/g) || []).length, 1);
 assert.match(queen, /theme\.loop = true/);
});
test('deployment reports V39.10 and cache-busts queen CSS and JS',()=>{
 const html=read('index.html');
 assert.match(html, /SS \/ V40/);
 assert.match(html, /presentation-v40\.css\?v=40/);
 assert.match(html, /legendaryActions\.js\?v=40/);
});
