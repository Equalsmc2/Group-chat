import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=name=>readFileSync(new URL(`../${name}`,import.meta.url),'utf8');

test('v37.4 scenic polish stylesheet still loads after director styling and updates shell versioning',()=>{
 const html=file('index.html');
 assert.ok(html.indexOf('director-v36-8.css')<html.indexOf('polish-v36-9.css'));
 assert.match(html,/V(37\.8|38\.0|38\.1|38\.2|38\.3|38\.4|38\.5|38\.6|38\.7|39\.0|39\.1|39\.3)/);
 assert.match(html,/desktopApps\.js\?v=37\.7/);
 assert.match(html,/experience\.js\?v=\d+\.\d+/);
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
