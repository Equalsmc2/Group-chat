import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { LUNAR_TIMELINE, lunarAudioPhase } from '../legendaryTimeline.js';
const file=name=>readFileSync(new URL(`../${name}`,import.meta.url),'utf8');

test('V37.6 entrance layer loads after prior legendary visuals without changing audio',()=>{
 const html=file('index.html');
 assert.ok(html.indexOf('legendaryPolish-v37-4.css?v=37.5') < html.indexOf('legendaryEntrance-v37-6.css?v=37.6'));
 assert.match(html,/legendaryActions\.js\?v=(39\.3|39\.7|39\.9)/);
 assert.equal(LUNAR_TIMELINE.bellHoldMs,6000);
 assert.equal(LUNAR_TIMELINE.bellFadeMs,1500);
 assert.ok(LUNAR_TIMELINE.songStartMs>=LUNAR_TIMELINE.bellHoldMs+LUNAR_TIMELINE.bellFadeMs);
 assert.equal(lunarAudioPhase(5999).phase,'bell');
 assert.equal(lunarAudioPhase(7000).phase,'bell-fading');
});

test('bells are top-centered, cropped by the cinematic viewport and descend for 6s',()=>{
 const css=file('legendaryEntrance-v37-6.css');
 assert.match(css, /\.legendary-gif-wrap \{[\s\S]*?left: 50%;[\s\S]*?top: clamp\(-70px,-6vh,-44px\)/);
 assert.match(css, /animation: legendaryBellsDescend 6s/);
 assert.match(css, /@keyframes legendaryBellsDescend[\s\S]*?translate: 0 -260px[\s\S]*?translate: 0 0/);
 assert.match(file('legendaryActions.css'),/#legendaryCinematic\{[\s\S]*?overflow:hidden/);
});

test('film pieces, reel rotation, moon and portrait stagger across the six-second opening',()=>{
 const css=file('legendaryEntrance-v37-6.css');
 for(const animation of ['legendaryReelInLeft','legendaryReelInRight','legendaryFilmIn','legendaryMoonApproachV376','legendarySixSecondCutin','legendarySixSecondTitle','legendaryCaptionArrive']){
   assert.match(css,new RegExp(`@keyframes ${animation}`));
 }
 assert.match(css,/legendaryReelSpin 4\.8s linear infinite, legendaryReelInLeft 6s/);
 assert.match(css,/legendaryFilmFeed 6\.8s linear infinite, legendaryFilmIn 6s/);
 assert.match(css,/\.legendary-is-entering \.legendary-cutin\.is-playing \{[\s\S]*?animation: legendarySixSecondCutin 6s/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});

test('screen and sound use the same issuedAtMs, with bounded clock catch-up for TV clients',()=>{
 const js=file('legendaryActions.js');
 assert.match(js,/const introElapsedMs = Math\.max\(0, Math\.min\(6000, Date\.now\(\) - issuedAtMs\)\)/);
 assert.match(js,/cinematic\.style\.setProperty\('--legendary-intro-offset'/);
 assert.match(js,/startLegendaryAudio\(meta, legendaryState\)/);
});
