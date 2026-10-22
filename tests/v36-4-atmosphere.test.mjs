import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const file = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test('v36.4 loader points at the new atmosphere module revision', () => {
  const loader = file('desktopApps.js');
  assert.match(loader, /sceneWeather\.js\?v=40/);
});

test('v36.4 atmosphere adds leaves and removes terminal-only weather gating', () => {
  const weather = file('sceneWeather.js');
  assert.match(weather, /WEATHER_SEQUENCE = \['clear', 'rain', 'snow', 'leaves'\]/);
  assert.match(weather, /leaves: \['❦', 'LEAVES'\]/);
  assert.match(weather, /function atmosphereEnabled\(\)/);
  assert.ok(!weather.includes('let terminalActive'));
});

test('v36.4 override stylesheet re-enables weather on all desktop tabs and neutralizes old iconography', () => {
  const css = file('atmosphere-v36-4.css');
  assert.match(css, /body\.combat-screen-active #weatherCanvas/);
  assert.match(css, /body\.stage-screen-active #weatherCanvas/);
  assert.match(css, /body\.dm-screen-active #weatherCanvas/);
  assert.match(css, /content: \"◈\" !important;/);
  assert.match(css, /body\[data-weather=\"leaves\"\]/);
});
