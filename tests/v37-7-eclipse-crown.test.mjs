import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LUNAR_TIMELINE, lunarAudioPhase } from '../legendaryTimeline.js';
const file = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test('moonlight layer loads last, retaining the original 6-second intro and sound', () => {
 const html = file('index.html');
 assert.ok(html.indexOf('legendaryEntrance-v37-6.css?v=37.6') < html.indexOf('legendaryEclipse-v37-7.css?v=37.7'));
 assert.match(html, /legendaryActions\.js\?v=38\.6/);
 assert.equal(LUNAR_TIMELINE.bellHoldMs, 6000);
 assert.equal(LUNAR_TIMELINE.bellFadeMs, 1500);
 assert.equal(LUNAR_TIMELINE.songStartMs, 7680);
 assert.equal(lunarAudioPhase(5999).phase, 'bell');
 assert.equal(lunarAudioPhase(7499).phase, 'bell-fading');
 assert.equal(lunarAudioPhase(7680).phase, 'song');
});

test('moon is centered behind foreground bells, with descending beams and clipped bell top', () => {
 const css = file('legendaryEclipse-v37-7.css');
 const js = file('legendaryActions.js');
 assert.match(js, /<div class="legendary-moon" aria-hidden="true"><\/div>\s*<div class="legendary-moonbeams"/);
 assert.match(js, /<div class="legendary-gif-wrap"/);
 for (const fragment of ['legendary-ray-left', 'legendary-ray-center', 'legendary-ray-right']) {
   assert.ok(js.includes(fragment), fragment);
 }
 assert.match(css, /#legendaryCinematic \.legendary-moon \{[\s\S]*?z-index: 1;[\s\S]*?left: 50%;/);
 assert.match(css, /#legendaryCinematic \.legendary-moonbeams \{[\s\S]*?z-index: 2;/);
 assert.match(css, /#legendaryCinematic \.legendary-gif-wrap \{[\s\S]*?z-index: 3;/);
 assert.match(css, /--lunar-bell-width: clamp\(315px, 31vw, 480px\)/);
 assert.match(css, /--lunar-bell-top: clamp\(-192px, -14vw, -112px\)/);
 assert.match(file('legendaryActions.css'), /#legendaryCinematic\{[\s\S]*?overflow:hidden/);
});

test('moon, moonbeams and bells finish their entrance together and honor reduced motion', () => {
 const css = file('legendaryEclipse-v37-7.css');
 for (const name of ['legendaryBellsDescendV377', 'legendaryMoonAscendV377', 'legendaryBeamsDescendV377']) {
   assert.match(css, new RegExp('animation: ' + name + ' 6s'));
   assert.match(css, new RegExp('@keyframes ' + name));
 }
 assert.match(css, /animation-delay: var\(--legendary-intro-offset\)/);
 assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
});
