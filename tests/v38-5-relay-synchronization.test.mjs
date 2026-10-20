import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const f = n => readFileSync(new URL(`../${n}`, import.meta.url), 'utf8');
test('DM scene writes update only changed branches, not the Legendary branch', () => {
 const director=f('sessionDirector.js');
 assert.match(director, /await setDoc\(STATE_REF, \{ \.\.\.patch, updatedAt:/);
 assert.doesNotMatch(director, /await setDoc\(STATE_REF, \{ \.\.\.merged, updatedAt:/);
});
test('phones write Legendary state atomically without an open DM tab',()=>{
 const director=f('sessionDirector.js');
 const actions=f('legendaryActions.js');
 assert.match(director,/return runTransaction\(db, async tx =>/);
 assert.match(director,/tx\.update\(STATE_REF, \{ legendary:item \}\)/);
 assert.match(director,/async function requestLegendary\(cue = \{\}\) \{/);
 assert.match(director,/return toggleLegendary\(cue\)/);
 assert.doesNotMatch(actions,/onSnapshot\(q, async snapshot =>/);
 assert.match(f('firebaseTransport.js'),/runTransaction/);
});
test('full actions persist, only Asya short auto-clears with an id guard',()=>{
 const actions=f('legendaryActions.js');
 assert.match(actions,/momentaryDurationMs: 850/);
 assert.match(actions,/if \(!legendaryState\?\.active \|\| !meta\?\.momentaryDurationMs\) return/);
 assert.match(actions,/clearLegendary\?\.\(legendaryState\.id\)/);
 assert.doesNotMatch(actions,/optimisticHoldMs/);
});
