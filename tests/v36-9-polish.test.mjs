import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=name=>readFileSync(new URL(`../${name}`,import.meta.url),'utf8');

test('v37.4 scenic polish stylesheet still loads after director styling and updates shell versioning',()=>{
 const html=file('index.html');
 assert.ok(fs.readFileSync(new URL('../presentation-v40.css',import.meta.url),'utf8').indexOf('SOURCE: director-v36-8.css')<fs.readFileSync(new URL('../presentation-v40.css',import.meta.url),'utf8').indexOf('SOURCE: polish-v36-9.css'));
 assert.match(html,/V40/);
 assert.match(html,/desktopApps\.js\?v=40/);
 assert.match(html,/experience\.js\?v=40/);
});

test('scenic polish adds integrated background matte and glass-surface treatment',()=>{
 const css=file('polish-v36-9.css');
 for(const selector of ['#mainDashboard::before','#combatView::before','#stageView::before','#dmControlView::before']) assert.ok(css.includes(selector));
 assert.match(css,/background-image: var\(--ss-terminal-background\)/);
 assert.match(css,/background-image: var\(--ss-combat-background\)/);
 assert.match(css,/backdrop-filter: blur\(14px\) saturate\(1\.08\)/);
 assert.match(css,/body\[data-weather=\"rain\"\] \.weather-canvas/);
 assert.match(css,/\.chat-messages \{/);
});
