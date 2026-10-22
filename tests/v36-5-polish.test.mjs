import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=name=>readFileSync(new URL(`../${name}`,import.meta.url),'utf8');
test('polish stylesheet is last, within same CSS cascade layer as V35 hidden controls',()=>{
 const html=file('index.html'); const css=file('polish-v36-5.css');
 assert.ok(fs.readFileSync(new URL('../presentation-v40.css',import.meta.url),'utf8').indexOf('SOURCE: atmosphere-v36-4.css')<fs.readFileSync(new URL('../presentation-v40.css',import.meta.url),'utf8').indexOf('SOURCE: polish-v36-5.css'));
 assert.match(css,/@layer soulseekers35/);
 assert.match(css,/\.scene-control-glyph/);
 assert.match(css,/\.celestial-beacon/);
});
test('atmosphere compatibility hooks remain intact, but v36.6 allows effects over UI',()=>{
 const script=file('sceneWeather.js');
 assert.match(script,/function maskImportantContent\(\)/);
 assert.match(script,/\.stage-copy/);
 assert.match(script,/\.combat-grid/);
 assert.match(script,/function updateWeatherExclusions\(\)/);
 assert.match(script,/function particleCountForWeather\(\)/);
 assert.match(script,/maskImportantContent\(\) \{ \/\* intentionally no-op/);
});
test('old visible cross glyphs are gone from operator, main index and seal',()=>{
 for(const path of ['index.html','experience.js','assets/soul-seal.svg']){
  const text=file(path); assert.doesNotMatch(text,/[☦✠]/);
 }
 assert.match(file('assets/soul-seal.svg'),/stroke="url\(#gold\)"/);
});
test('phone UI remains texting-only and navigation still keeps four desktop views',()=>{
 const phone=file('phoneChat.css'); const html=file('index.html');
 assert.match(phone,/\.desktop-tabs, \.combat-view, \.combat-modal \{ display:none !important/);
 for(const name of ['terminalTab','combatTab','stageTab','dmTab'])assert.match(html,new RegExp(`id="${name}"`));
});
