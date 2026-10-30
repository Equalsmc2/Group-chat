import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=name=>readFileSync(new URL(`../${name}`,import.meta.url),'utf8');

test('full-screen backdrop blurs are disabled, not merely made more transparent',()=>{
 const css=file('performance-v37-1.css');
 assert.match(css,/backdrop-filter:none!important/);
 assert.match(css,/\.chat-container/);
 assert.match(css,/\.combat-card/);
 assert.match(css,/\.dm-panel/);
 assert.match(css,/\.stage-body/);
 assert.match(css,/rgba\(10,13,20,\.84\)/);
});

test('nonessential ambiance is static but the celestial body stays animated',()=>{
 const perf=file('performance-v37-1.css');
 const motion=file('atlus-motion-v37.css');
 assert.match(perf,/\.scene-motes span,\.scene-fog/);
 assert.match(motion,/celestialOrbFloat/);
 assert.match(motion,/\.celestial-crown-beams \.celestial-beam/);
 assert.match(motion,/animation:none!important;transform:none!important/);
});
