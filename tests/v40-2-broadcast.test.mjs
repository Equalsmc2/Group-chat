import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
test('V40.2 TV creative layer is activated without altering LA ownership',()=>{
  const html=read('index.html'),css=read('broadcast-v40-2.css'),js=read('broadcast-v40-2.js');
  assert.match(html,/SS \/ V40\.9/);
  assert.match(html,/broadcast-v40-2\.css\?v=40\.2/);
  assert.match(html,/broadcast-v40-2\.js\?v=40\.2/);
  assert.match(css,/body\.tv-device \.stage-view/);
  assert.match(css,/body\.tv-device \.combat-view/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(js,/soulseekers:stagestate/);
  assert.match(js,/soulseekers:combatstate/);
  assert.doesNotMatch(js,/setStage\(|requestLegendary\(|setDoc\(/);
});
