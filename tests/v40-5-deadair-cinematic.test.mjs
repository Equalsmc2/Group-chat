import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const read = name => readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('V40.5 loads a distinct final cinematic layer and installer build marker',()=>{
 const html=read('index.html'); const bat=readFileSync(new URL('../../INSTALL_FULL_WEBSITE.bat',import.meta.url),'utf8');
 assert.match(html,/SS \/ V40\.5/);
 assert.match(html,/asya-deadair-v40-5\.css\?v=40\.5/);
 assert.match(html,/legendaryActions\.js\?v=40\.5/);
 assert.match(bat,/SS \/ V40\.5/);
});

test('Dead Air opening fades away instead of obscuring the whole broadcast indefinitely',()=>{
 const css=read('asya-deadair-v40-5.css');
 assert.match(css,/legendary-asya-active \.legendary-asya-scene\{[\s\S]*?asyaV405Exit 4\.8s/);
 assert.match(css,/@keyframes asyaV405Exit[\s\S]*?100%\{opacity:0;visibility:hidden\}/);
 assert.match(css,/legendary-asya-active \.legendary-asya-static/);
 assert.match(css,/body\.legendary-channel-unaired \.site-shell\{filter:invert\(1\)/);
});

test('Asya time-skip SFX has fresh names, an audible test action and a browser permission fallback',()=>{
 const js=read('legendaryActions.js');
 assert.match(js,/time-skip-v40-5\.mp3/);
 assert.match(js,/time-skip-short-v40-5\.mp3/);
 assert.match(js,/function armAndTestAsyaTimeSkip\(\)/);
 assert.match(js,/const playback = clip\.play\(\);[\s\S]*?armTv/);
 assert.match(js,/asyaAudioProblem = true;/);
 assert.ok(existsSync(new URL('../assets/legendary/asya/time-skip-v40-5.mp3',import.meta.url)));
 assert.ok(existsSync(new URL('../assets/legendary/asya/time-skip-short-v40-5.mp3',import.meta.url)));
});

test('Short visual and short audio each start on receipt; remote TTL allows network delivery',()=>{
 const js=read('legendaryActions.js'); const css=read('asya-deadair-v40-5.css');
 assert.match(js,/momentaryDurationMs: 1800/);
 assert.match(js,/visualDurationMs: 500/);
 assert.match(js,/burst\.currentTime = 0/);
 assert.match(css,/#legendaryCinematic\.legendary-asya-short-active\{display:none!important\}/);
 assert.match(css,/animation-duration:500ms!important/);
});
