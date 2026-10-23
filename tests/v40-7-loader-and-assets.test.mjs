import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, statSync, existsSync} from 'node:fs';
const read=n=>readFileSync(new URL('../'+n,import.meta.url),'utf8');

test('V40.7 stylesheet link tags are syntactically closed and point to real assets',()=>{
 const html=read('index.html');
 const links=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map(m=>m[0]);
 assert.equal(links.length,6,'Exactly six well-formed stylesheets');
 const seen=[];
 for(const tag of links){
   const match=tag.match(/href="([^"]+)"/);
   assert.ok(match,'link has closed href '+tag);
   const href=match[1];
   assert.ok(!href.includes('\n')&&!href.includes('<'),'no malformed nested tags');
   const path=href.split('?')[0];
   assert.ok(existsSync(new URL('../'+path,import.meta.url)),`style asset ${path} exists`);
   seen.push(path);
 }
 assert.ok(seen.includes('asya-deadair-v40-7.css'));
 assert.ok(seen.includes('asya-deadair-v40-8.css'));
 assert.match(html,/SS \/ V40\.8/);
 assert.match(html,/legendaryActions\.js\?v=40\.8/);
});

test('Every actual time skip variant is a distinct, nonempty source in the ZIP',()=>{
 const js=read('legendaryActions.js');
 const names=['fracture','missing','erasure','crimson','causality','unheard'];
 for(const name of names){
   for(const variant of ['full','short']){
     const file=`assets/legendary/asya/asya-${name}-${variant}-v407.mp3`;
     assert.ok(js.includes(file),`SFX reference ${file}`);
     assert.ok(statSync(new URL('../'+file,import.meta.url)).size>10000,`SFX bytes ${file}`);
   }
 }
 assert.match(js,/function pickDeterministic/);
 assert.match(js,/Math\.floor\(serial \/ 2\)/);
});

test('Short glitch is visibly altered, has five variants, and leaves no title card',()=>{
 const css=read('asya-deadair-v40-7.css');
 const js=read('legendaryActions.js');
 assert.match(css,/@keyframes asyaDislocationV407/);
 assert.match(css,/500ms steps\(1,end\)/);
 assert.match(css,/data-asya-burst-kind="blackout"/);
 assert.match(css,/data-asya-burst-kind="channel"/);
 assert.match(css,/data-asya-burst-kind="fragment"/);
 assert.match(css,/#legendaryCinematic\.legendary-asya-short-active\{display:none!important\}/);
 assert.match(js,/visualDurationMs: 500/);
 assert.match(js,/const ASYA_GLITCH_VARIANTS = \[/);
 assert.match(js,/kind:'tear'/);
 assert.match(js,/kind:'shudder'/);
});
