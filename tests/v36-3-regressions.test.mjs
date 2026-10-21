import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
test('atmosphere controls initialize outside the deferred Terminal feature pipeline', () => {
  const loader = file('desktopApps.js');
  const early = loader.indexOf('void startAtmosphereControls();');
  const slower = loader.indexOf("combat.js?v=39.7");
  assert.ok(early >= 0 && slower > early);
  assert.ok(!loader.includes("sceneWeather.js?v=35"));
});
test('the weather scene has an independent ready marker and no mandatory canvas context', () => {
  const weather = file('sceneWeather.js');
  assert.match(weather, /body\.dataset\.atmosphereReady = 'true'/);
  assert.match(weather, /ctx\?\.setTransform/);
  assert.match(weather, /dayButton\.addEventListener\('click'/);
  assert.match(weather, /weatherButton\.addEventListener\('click'/);
});
test('combat CSS preserves all six cards while fitting a TV frame', () => {
  const css = file('legibility-v36-3.css');
  assert.ok(css.trim().startsWith('@layer soulseekers35'));
  assert.match(css, /grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
  assert.match(css, /min-height:0!important/);
  assert.match(css, /\.turn-splash-copy h2 \{color:#f4f0e7!important/);
  assert.match(css, /\.boss-broadcast \{height:clamp/);
});
