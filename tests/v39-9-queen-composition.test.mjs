import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('V39.10 loads the split composition CSS after legacy styles and busts Legendary JS cache',()=>{
 const html=read('index.html');
 assert.match(html, /SS \/ V40/);
 assert.match(html, /src="legendaryActions\.js\?v=40\.7"/);
 const old=fs.readFileSync(new URL('../presentation-v40.css',import.meta.url),'utf8').indexOf('SOURCE: v39-8-presentation-fixes.css');
 const current=fs.readFileSync(new URL('../presentation-v40.css',import.meta.url),'utf8').indexOf('SOURCE: v39-9-queen-composition.css');
 assert.ok(old>0 && current>old);
});
test('V39.9 has a separate queen lane and impact layer',()=>{
 const css=read('v39-9-queen-composition.css');
 const js=read('legendaryActions.js');
 assert.match(css,/\.legendary-cutin\{[\s\S]*?right:3\.5vw!important/);
 assert.match(css,/\.legendary-queen-crown,[\s\S]*?left:28%!important/);
 assert.match(css,/white-queen-trimmed-v399\.png/);
 assert.match(css,/@keyframes queenSlashV399/);
 assert.match(css,/@keyframes queenImpactV399/);
 assert.match(css,/81\.7%/);
 assert.match(css,/84%/);
 assert.match(js, /legendary-queen-impact/);
 assert.ok(fs.existsSync(new URL('../assets/legendary/alexandria/white-queen-trimmed-v399.png',import.meta.url)));
});
test('V39.9 retains the same clocked audio queue and LA identifiers',()=>{
 const js=read('legendaryActions.js');
 assert.match(js,/\{ at:4250,\s*url:meta\.queenSfx\[3\]/);
 assert.match(js, /'alexandria-queens-gambit'/);
 assert.match(js, /'asya-channel-o-unaired'/);
 assert.match(js,/state\.session\?\.legendary/);
});
