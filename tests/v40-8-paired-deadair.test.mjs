import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
const read = n => readFileSync(new URL('../' + n, import.meta.url), 'utf8');

test('V40.8 installs paired glitch CSS after old mode overrides and cache-busts Legendary JS', () => {
 const html = read('index.html');
 const refs = [...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"<>]+)"\s*>/g)].map(x=>x[1]);
 assert.equal(refs.length, 6);
 assert.ok(refs[5].startsWith('asya-deadair-v40-8.css'));
 assert.match(html, /SS \/ V40\.8/);
 assert.match(html, /legendaryActions\.js\?v=40\.8/);
 for (const ref of refs) assert.ok(existsSync(new URL('../' + ref.split('?')[0], import.meta.url)));
 const installer = readFileSync(new URL('../../INSTALL_FULL_WEBSITE.bat', import.meta.url),'utf8');
 assert.match(installer,/findstr \/C:"SS \/ V40\.8"/);
});

test('Asya short renders on DM, TV and phone without a cut-in, using 2 synced glitch layers', () => {
 const js = read('legendaryActions.js'), css = read('asya-deadair-v40-8.css');
 assert.match(js,/if \(meta\?\.actionKey === 'asya-channel-o-short'\) return true/);
 assert.match(js,/function activateAsyaGlitchPair\(/);
 assert.match(js,/ensureAsyaGlitchLayer\(/);
 assert.match(js,/document\.body\.dataset\.asyaStructure/);
 assert.match(js,/document\.body\.dataset\.asyaSignal/);
 assert.match(css,/#asyaGlitchFx/);
 assert.match(css,/body\.tv-device\.legendary-signal-burst \.site-shell/);
 assert.match(css,/animation-name:var\(--ss-asya-structure/);
 assert.match(css,/#legendaryCinematic\.legendary-asya-short-active\s*\{display:none!important\}/);
 assert.match(js,/visualDurationMs: 500/);
});

test('Paired choices explore the full 8x8 space and match across clients for the same activation',()=>{
 const source=read('legendaryActions.js');
 const start=source.indexOf('const ASYA_STRUCTURAL_GLITCHES =');
 const end=source.indexOf('function clearAsyaGlitchPair()',start);
 const hash=source.slice(source.indexOf('function hashSeed('),source.indexOf('function pickDeterministic('));
 const ctx={};
 vm.runInNewContext(hash+source.slice(start,end)+'\nresult = getAsyaGlitchPair;',ctx);
 const seen=new Set();
 for(let i=0;i<2000;i++) {
  const event={id:'event-'+i,actionKey:'asya-channel-o-short',issuedAtMs:1792700000000+i*2200,serial:i};
  const a=ctx.result(event),b=ctx.result({...event});
  assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
  seen.add(a.structural+'+'+a.signal);
 }
 assert.equal(seen.size,64,'64 combinations reachable with independent hash mixing');
});

test('All eight structural and display variants have keyframes, plus 500ms reset and reduced motion',()=>{
 const css=read('asya-deadair-v40-8.css');
 for(const name of ['Flip','Mirror','Tear','Zoom','Roll','Tilt','Stutter','Skew','Pixel','Chroma','Solar','Poster','Macro','Scan','Ghost','Drop']) {
  assert.match(css,new RegExp('\\@keyframes ssAsya'+name+'V408'));
 }
 assert.match(css,/animation-duration:500ms,500ms!important/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/100%\{transform:none\}/);
});
