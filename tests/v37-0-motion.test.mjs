import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=name=>readFileSync(new URL(`../${name}`,import.meta.url),'utf8');

test('v37.4 loads the optimized motion and performance layers in order',()=>{
 const html=file('index.html');
 assert.ok(fs.readFileSync(new URL('../presentation-v40.css',import.meta.url),'utf8').indexOf('SOURCE: polish-v36-9.css')<fs.readFileSync(new URL('../presentation-v40.css',import.meta.url),'utf8').indexOf('SOURCE: atlus-motion-v37.css'));
 assert.ok(fs.readFileSync(new URL('../presentation-v40.css',import.meta.url),'utf8').indexOf('SOURCE: atlus-motion-v37.css')<fs.readFileSync(new URL('../presentation-v40.css',import.meta.url),'utf8').indexOf('SOURCE: performance-v37-1.css'));
 assert.match(html,/uiMotion-v37\.js\?v=40/);
 assert.match(html,/V40/);
});

test('short hover transitions retained, repeating sheen and panel pulse removed',()=>{
 const css=file('atlus-motion-v37.css');
 assert.match(css,/ssViewEnter/);
 assert.match(css,/transform:translateY\(-1px\)/);
 assert.doesNotMatch(css,/ssShineSweep|ssPulseFrame|will-change:transform,opacity/);
 assert.match(css,/body\.is-night \.celestial-crown-disc::after/);
});

test('the motion director does not track pointer position every frame',()=>{
 const js=file('uiMotion-v37.js');
 assert.match(js,/soulseekers:viewchange/);
 assert.match(js,/body\.dataset\.performance=lowPower\?'lite':'full'/);
 assert.doesNotMatch(js,/pointermove|--ss-parallax-x|requestAnimationFrame\(apply\)/);
});

test('weather retains the full set of modes while lowering redraw cost',()=>{
 const js=file('sceneWeather.js');
 assert.match(js,/WEATHER_SEQUENCE = \['clear', 'rain', 'snow', 'leaves'\]/);
 assert.match(js,/Math\.min\(devicePixelRatio \|\| 1, 1\)/);
 assert.match(js,/minFrame = body\.dataset\.performance === 'lite' \? 62 : 32/);
 assert.doesNotMatch(js,/exclusionTimer/);
});
