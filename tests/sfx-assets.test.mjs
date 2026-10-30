import assert from 'node:assert/strict';
import fs from 'node:fs';
const cues=[
'ui-select','ui-click','ui-confirm','scene-shift','turn-reveal','boss-reveal','damage-light',
'damage-heavy-1','damage-heavy-2','damage-heavy-3','critical','critical-burst','heal','spell-charge',
'spell-impact','elemental-impact','lightning','gunshot','gun-cock','reload','revolver-spin','bow','summon',
'summon-alt','victory','void-wash'];
for(const cue of cues){
  const path=new URL(`../assets/sfx/${cue}.mp3`,import.meta.url);
  assert.ok(fs.existsSync(path),`missing SFX asset: ${cue}`);
  assert.ok(fs.statSync(path).size>1000,`empty/tiny SFX asset: ${cue}`);
}
console.log(`sfx asset test passed (${cues.length} cues)`);
