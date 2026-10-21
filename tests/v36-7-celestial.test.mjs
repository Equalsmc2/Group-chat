import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=name=>readFileSync(new URL(`../${name}`,import.meta.url),'utf8');

test('head includes complete, independent links for both polish layers and the new celestial sheet',()=>{
 const html=file('index.html');
 const links=[...html.matchAll(/<link[^>]*>/g)].map(x=>x[0]);
 for(const file of ['polish-v36-5.css','polish-v36-6.css','celestial-v36-7.css']){
  assert.equal(links.filter(tag=>tag.includes(`href="${file}?`)).length,1,`${file} should be its own complete link`);
 }
 assert.ok(!html.includes('css?v=36.5"\n    <link'));
 assert.match(html,/celestial-crown-beams/);
 assert.equal((html.match(/class="celestial-beam celestial-beam-/g)||[]).length,4);
});
test('v37.6 increments loader version while preserving V36.7 celestial stylesheet',()=>{
 assert.match(file('index.html'),/desktopApps\.js\?v=(37\.7|39\.7)/);
 assert.match(file('desktopApps.js'),/sceneWeather\.js\?v=37\.1/);
});
test('silver night rules coexist with V35 important declarations in the V35 layer',()=>{
 const css=file('celestial-v36-7.css');
 assert.match(css,/@layer soulseekers35/);
 assert.match(css,/body\.is-night[\s\S]*?--gold:#cbd5e3/);
 assert.match(css,/body\.is-night \.desktop-tab\.is-active/);
 assert.match(css,/body\.is-night \.phantom-pill/);
 assert.match(css,/body\.is-night \.chat-container/);
 assert.match(css,/\.celestial-crown-beams \.celestial-beam/);
 assert.match(css,/@keyframes celestialRayBreathe/);
});
test('weather and day controls are retained with readable labels and TV effect',()=>{
 const html=file('index.html'),weather=file('sceneWeather.js'),css=file('celestial-v36-7.css');
 for(const id of ['dayNightToggle','dayNightText','weatherToggle','weatherText'])assert.match(html,new RegExp(`id="${id}"`));
 assert.match(weather,/dayText\.textContent = isDay \? 'DAY' : 'NIGHT'/);
 assert.match(weather,/WEATHER_SEQUENCE = \['clear', 'rain', 'snow', 'leaves'\]/);
 assert.match(css,/body\.tv-device \.celestial-crown \{display:block!important/);
});
